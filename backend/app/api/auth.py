"""
认证API路由
路径: /mnt/okcomputer/output/backend/app/api/auth.py
"""

from fastapi import APIRouter, HTTPException, Depends, Body, Response, Request
from typing import Dict, Any
import logging

from ..models.user import UserRegister, UserLogin, PasswordReset, VerificationCode
from ..services.auth_service import auth_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=Dict[str, Any])
async def register(user_data: UserRegister = Body(...)):
    """用户注册"""
    try:
        result = await auth_service.register(user_data.dict())
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "user_id": result.get("user_id")
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="注册失败")

@router.post("/login", response_model=Dict[str, Any])
async def login(user_data: UserLogin = Body(...)):
    """用户登录"""
    try:
        result = await auth_service.login(user_data.email, user_data.password)
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "access_token": result["access_token"],
                "refresh_token": result["refresh_token"],
                "user": result["user"]
            }
        else:
            raise HTTPException(status_code=401, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="登录失败")

@router.post("/logout", response_model=Dict[str, Any])
async def logout(request: Request):
    """用户登出"""
    try:
        # 从请求头获取token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="未提供有效的认证令牌")
        
        token = auth_header.split(" ")[1]
        result = await auth_service.logout(token)
        
        if result["success"]:
            return {
                "success": True,
                "message": result["message"]
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="登出失败")

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """刷新访问令牌"""
    try:
        result = await auth_service.refresh_token(refresh_token)
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "access_token": result["access_token"]
            }
        else:
            raise HTTPException(status_code=401, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=500, detail="令牌刷新失败")

@router.post("/send-code", response_model=Dict[str, Any])
async def send_verification_code(
    email: str = Body(..., embed=True),
    purpose: str = Body(..., embed=True, regex="^(register|reset_password)$")
):
    """发送验证码"""
    try:
        result = await auth_service.send_verification_code(email, purpose)
        if result["success"]:
            return {
                "success": True,
                "message": result["message"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send verification code error: {e}")
        raise HTTPException(status_code=500, detail="验证码发送失败")

@router.post("/verify-code", response_model=Dict[str, Any])
async def verify_code(code_data: VerificationCode = Body(...)):
    """验证验证码"""
    try:
        is_valid = await auth_service.verify_verification_code(
            code_data.email, 
            code_data.code
        )
        if is_valid:
            return {
                "success": True,
                "message": "验证码正确"
            }
        else:
            raise HTTPException(status_code=400, detail="验证码无效或已过期")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify code error: {e}")
        raise HTTPException(status_code=500, detail="验证码验证失败")

@router.post("/reset-password", response_model=Dict[str, Any])
async def reset_password(reset_data: PasswordReset = Body(...)):
    """重置密码"""
    try:
        result = await auth_service.reset_password(reset_data)
        if result["success"]:
            return {
                "success": True,
                "message": result["message"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="密码重置失败")

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user(request: Request):
    """获取当前用户信息"""
    try:
        # 从请求中获取用户信息（由中间件设置）
        user = getattr(request.state, "user", None)
        if not user:
            raise HTTPException(status_code=401, detail="未认证")
        
        return {
            "success": True,
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(status_code=500, detail="获取用户信息失败")

# 导出路由
__all__ = ["router"]