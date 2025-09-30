"""
安全工具函数
路径: /mnt/okcomputer/output/backend/app/utils/security.py
"""

import bcrypt
import secrets
import string
from typing import str

def generate_verification_code(length: int = 6) -> str:
    """生成验证码"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def generate_secure_token(length: int = 32) -> str:
    """生成安全令牌"""
    return secrets.token_urlsafe(length)

def hash_password(password: str) -> str:
    """密码哈希"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_api_key() -> str:
    """生成API密钥"""
    return 'pk_' + secrets.token_urlsafe(32)

def generate_secret_key() -> str:
    """生成应用密钥"""
    return secrets.token_urlsafe(64)