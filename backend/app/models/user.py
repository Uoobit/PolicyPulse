"""
用户数据模型
路径: /mnt/okcomputer/output/backend/app/models/user.py
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """用户角色枚举"""
    USER = "user"
    ADMIN = "admin"

class UserStatus(str, Enum):
    """用户状态枚举"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIAL = "trial"
    SUSPENDED = "suspended"

class SubscriptionType(str, Enum):
    """订阅类型枚举"""
    POLICY = "policy"
    BID = "bid"
    ALL = "all"

class SubscriptionStatus(str, Enum):
    """订阅状态枚举"""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"

class UserPreferences(BaseModel):
    """用户偏好设置"""
    keywords: List[str] = Field(default_factory=list)
    regions: List[str] = Field(default_factory=list)
    industries: List[str] = Field(default_factory=list)
    signal_types: List[str] = Field(default_factory=list)
    conservative: bool = Field(default=True)
    
    class Config:
        json_encoders = {
            str: lambda v: v.strip()
        }

class UserNotifications(BaseModel):
    """用户通知配置"""
    wechat: Optional[str] = None
    feishu: Optional[str] = None
    dingding: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.startswith('+') and not v.isdigit():
            raise ValueError('Phone number must start with + or be digits')
        return v

class SubscriptionInfo(BaseModel):
    """订阅信息"""
    type: SubscriptionType = Field(default=SubscriptionType.POLICY)
    status: SubscriptionStatus = Field(default=SubscriptionStatus.PENDING)
    expire_at: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserBase(BaseModel):
    """用户基础模型"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = Field(default=UserRole.USER)
    status: UserStatus = Field(default=UserStatus.TRIAL)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserCreate(UserBase):
    """用户创建模型"""
    password: str = Field(..., min_length=8, max_length=128)

class UserUpdate(BaseModel):
    """用户更新模型"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    preferences: Optional[UserPreferences] = None
    notifications: Optional[UserNotifications] = None

class UserInDB(UserBase):
    """数据库中的用户模型"""
    id: str = Field(alias="_id")
    password: str
    subscription: SubscriptionInfo = Field(default_factory=SubscriptionInfo)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    notifications: UserNotifications = Field(default_factory=UserNotifications)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    """用户响应模型"""
    id: str
    subscription: SubscriptionInfo
    preferences: UserPreferences
    notifications: UserNotifications
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseModel):
    """用户登录模型"""
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    """用户注册模型"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    verification_code: str = Field(..., min_length=6, max_length=6)

class PasswordReset(BaseModel):
    """密码重置模型"""
    email: EmailStr
    verification_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

class VerificationCode(BaseModel):
    """验证码模型"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(..., regex="^(register|reset_password)$")

# 导出模型
__all__ = [
    "UserRole",
    "UserStatus", 
    "SubscriptionType",
    "SubscriptionStatus",
    "UserPreferences",
    "UserNotifications",
    "SubscriptionInfo",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserResponse",
    "UserLogin",
    "UserRegister",
    "PasswordReset",
    "VerificationCode"
]