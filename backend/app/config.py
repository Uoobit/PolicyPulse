"""
应用配置
路径: /mnt/okcomputer/output/backend/app/config.py
"""

import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field, validator

class Settings(BaseSettings):
    """应用配置类"""
    
    # 基础配置
    APP_NAME: str = "PolicyPulse"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # 服务器配置
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    WORKERS: int = Field(default=1, env="WORKERS")
    
    # 安全配置
    SECRET_KEY: str = Field(env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # MongoDB配置
    MONGODB_URL: str = Field(env="MONGODB_URL")
    MONGODB_DATABASE: str = Field(default="policypulse", env="MONGODB_DATABASE")
    
    # Redis配置
    REDIS_URL: str = Field(env="REDIS_URL")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    # OpenAI配置
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    
    # 邮件配置
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    FROM_EMAIL: Optional[str] = Field(default=None, env="FROM_EMAIL")
    
    # 短信配置
    SMS_ACCESS_KEY: Optional[str] = Field(default=None, env="SMS_ACCESS_KEY")
    SMS_SECRET_KEY: Optional[str] = Field(default=None, env="SMS_SECRET_KEY")
    SMS_REGION: str = Field(default="cn-north-1", env="SMS_REGION")
    SMS_SIGN_NAME: str = Field(default="PolicyPulse", env="SMS_SIGN_NAME")
    SMS_TEMPLATE_CODE: str = Field(default="SMS_123456789", env="SMS_TEMPLATE_CODE")
    
    # 支付配置
    WECHAT_APP_ID: Optional[str] = Field(default=None, env="WECHAT_APP_ID")
    WECHAT_MCH_ID: Optional[str] = Field(default=None, env="WECHAT_MCH_ID")
    WECHAT_KEY: Optional[str] = Field(default=None, env="WECHAT_KEY")
    
    # 采集配置
    CRAWL_DELAY: int = Field(default=3, env="CRAWL_DELAY")  # 秒
    CRAWL_TIMEOUT: int = Field(default=30, env="CRAWL_TIMEOUT")
    MAX_RETRY_COUNT: int = Field(default=3, env="MAX_RETRY_COUNT")
    
    # 通知配置
    NOTIFICATION_RETRY_COUNT: int = Field(default=3, env="NOTIFICATION_RETRY_COUNT")
    NOTIFICATION_RETRY_DELAY: int = Field(default=60, env="NOTIFICATION_RETRY_DELAY")  # 秒
    
    # CORS配置
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://policypulse.com"],
        env="ALLOWED_ORIGINS"
    )
    
    # 日志配置
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# 创建全局配置实例
settings = Settings()

# 导出配置
__all__ = ["settings"]