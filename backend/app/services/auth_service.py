"""
认证服务
路径: /mnt/okcomputer/output/backend/app/services/auth_service.py
"""

import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import random
import string
import logging

from ..models.user import UserInDB, UserCreate, UserLogin, PasswordReset
from ..database.mongodb import mongodb
from ..database.redis import redisdb
from ..config import settings
from ..utils.security import generate_verification_code, hash_password, verify_password

logger = logging.getLogger(__name__)

class AuthService:
    """认证服务类"""
    
    def __init__(self):
        self.collection = mongodb.get_collection("users")
        self.blacklist_set = "jwt_blacklist"
    
    async def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """用户注册"""
        try:
            # 检查用户是否已存在
            existing_user = await self.collection.find_one({"email": user_data["email"]})
            if existing_user:
                return {
                    "success": False,
                    "message": "用户已存在"
                }
            
            # 验证验证码
            code_valid = await self.verify_verification_code(
                user_data["email"], 
                user_data["verification_code"]
            )
            if not code_valid:
                return {
                    "success": False,
                    "message": "验证码无效或已过期"
                }
            
            # 创建用户
            hashed_password = hash_password(user_data["password"])
            user_doc = {
                "email": user_data["email"],
                "name": user_data["name"],
                "password": hashed_password,
                "role": "user",
                "status": "trial",
                "subscription": {
                    "type": "policy",
                    "status": "pending",
                    "trial_end": datetime.utcnow() + timedelta(days=7)
                },
                "preferences": {
                    "keywords": [],
                    "regions": [],
                    "industries": [],
                    "signal_types": [],
                    "conservative": True
                },
                "notifications": {
                    "wechat": None,
                    "feishu": None,
                    "dingding": None,
                    "email": user_data["email"],
                    "phone": None
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(user_doc)
            
            # 删除验证码
            await redisdb.delete_verification_code(user_data["email"])
            
            logger.info(f"User registered: {user_data['email']}")
            
            return {
                "success": True,
                "message": "注册成功",
                "user_id": str(result.inserted_id)
            }
            
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            return {
                "success": False,
                "message": "注册失败"
            }
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """用户登录"""
        try:
            # 查找用户
            user_doc = await self.collection.find_one({"email": email})
            if not user_doc:
                return {
                    "success": False,
                    "message": "用户不存在"
                }
            
            # 验证密码
            if not verify_password(password, user_doc["password"]):
                return {
                    "success": False,
                    "message": "密码错误"
                }
            
            # 检查用户状态
            if user_doc["status"] == "suspended":
                return {
                    "success": False,
                    "message": "账户已被暂停"
                }
            
            # 生成JWT令牌
            access_token, refresh_token = await self._create_tokens(user_doc)
            
            logger.info(f"User logged in: {email}")
            
            return {
                "success": True,
                "message": "登录成功",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": str(user_doc["_id"]),
                    "email": user_doc["email"],
                    "name": user_doc["name"],
                    "role": user_doc["role"],
                    "status": user_doc["status"],
                    "subscription": user_doc.get("subscription", {})
                }
            }
            
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return {
                "success": False,
                "message": "登录失败"
            }
    
    async def logout(self, token: str) -> Dict[str, Any]:
        """用户登出"""
        try:
            # 将JWT加入黑名单
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp = payload.get("exp")
            if exp:
                ttl = exp - datetime.utcnow().timestamp()
                if ttl > 0:
                    await redisdb.add_to_blacklist(token, int(ttl))
            
            logger.info("User logged out")
            return {
                "success": True,
                "message": "登出成功"
            }
            
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            return {
                "success": False,
                "message": "登出失败"
            }
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """刷新访问令牌"""
        try:
            # 验证刷新令牌
            payload = jwt.decode(
                refresh_token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            
            if payload.get("type") != "refresh":
                return {
                    "success": False,
                    "message": "无效的刷新令牌"
                }
            
            # 查找用户
            user_id = payload.get("user_id")
            user_doc = await self.collection.find_one({"_id": ObjectId(user_id)})
            
            if not user_doc:
                return {
                    "success": False,
                    "message": "用户不存在"
                }
            
            # 生成新的访问令牌
            access_token, _ = await self._create_tokens(user_doc)
            
            return {
                "success": True,
                "access_token": access_token,
                "message": "令牌刷新成功"
            }
            
        except jwt.ExpiredSignatureError:
            return {
                "success": False,
                "message": "刷新令牌已过期"
            }
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            return {
                "success": False,
                "message": "令牌刷新失败"
            }
    
    async def reset_password(self, reset_data: PasswordReset) -> Dict[str, Any]:
        """重置密码"""
        try:
            # 验证验证码
            code_valid = await self.verify_verification_code(
                reset_data.email, 
                reset_data.verification_code
            )
            if not code_valid:
                return {
                    "success": False,
                    "message": "验证码无效或已过期"
                }
            
            # 更新密码
            hashed_password = hash_password(reset_data.new_password)
            result = await self.collection.update_one(
                {"email": reset_data.email},
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count == 0:
                return {
                    "success": False,
                    "message": "用户不存在"
                }
            
            # 删除验证码
            await redisdb.delete_verification_code(reset_data.email)
            
            logger.info(f"Password reset: {reset_data.email}")
            
            return {
                "success": True,
                "message": "密码重置成功"
            }
            
        except Exception as e:
            logger.error(f"Password reset failed: {e}")
            return {
                "success": False,
                "message": "密码重置失败"
            }
    
    async def send_verification_code(self, email: str, purpose: str) -> Dict[str, Any]:
        """发送验证码"""
        try:
            # 生成6位验证码
            code = generate_verification_code()
            
            # 存储验证码到Redis，有效期5分钟
            await redisdb.set_verification_code(email, code, 300)
            
            # 发送邮件
            subject = "PolicyPulse 验证码"
            if purpose == "register":
                body = f"""
                您好！
                
                感谢您注册 PolicyPulse。您的验证码是：{code}
                
                该验证码将在5分钟后过期，请尽快使用。
                
                如果这不是您发起的请求，请忽略此邮件。
                
                PolicyPulse 团队
                """
            else:  # reset_password
                body = f"""
                您好！
                
                您正在重置 PolicyPulse 账户密码。您的验证码是：{code}
                
                该验证码将在5分钟后过期，请尽快使用。
                
                如果这不是您发起的请求，请忽略此邮件。
                
                PolicyPulse 团队
                """
            
            await self._send_email(email, subject, body)
            
            logger.info(f"Verification code sent to {email} for {purpose}")
            
            return {
                "success": True,
                "message": "验证码发送成功"
            }
            
        except Exception as e:
            logger.error(f"Failed to send verification code: {e}")
            return {
                "success": False,
                "message": "验证码发送失败"
            }
    
    async def verify_verification_code(self, email: str, code: str) -> bool:
        """验证验证码"""
        try:
            stored_code = await redisdb.get_verification_code(email)
            return stored_code == code
        except Exception as e:
            logger.error(f"Verification failed: {e}")
            return False
    
    async def _create_tokens(self, user_doc: Dict[str, Any]) -> Tuple[str, str]:
        """创建JWT令牌"""
        user_id = str(user_doc["_id"])
        
        # 访问令牌
        access_payload = {
            "user_id": user_id,
            "email": user_doc["email"],
            "role": user_doc["role"],
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        # 刷新令牌
        refresh_payload = {
            "user_id": user_id,
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        }
        refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        return access_token, refresh_token
    
    async def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """发送邮件"""
        try:
            if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
                logger.warning("Email configuration not complete, skipping email send")
                return True  # 在开发环境中返回成功
            
            msg = MIMEMultipart()
            msg['From'] = settings.FROM_EMAIL
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            text = msg.as_string()
            server.sendmail(settings.FROM_EMAIL, to_email, text)
            server.quit()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

# 创建服务实例
auth_service = AuthService()

# 导出服务
__all__ = ["auth_service", "AuthService"]