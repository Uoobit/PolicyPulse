"""
验证工具函数
路径: /mnt/okcomputer/output/backend/app/utils/validators.py
"""

import re
from typing import bool, Optional

def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """验证手机号格式"""
    # 中国手机号格式
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))

def validate_password(password: str) -> bool:
    """验证密码强度"""
    if len(password) < 8:
        return False
    
    # 至少包含字母和数字
    has_letter = bool(re.search(r'[a-zA-Z]', password))
    has_digit = bool(re.search(r'\d', password))
    
    return has_letter and has_digit

def validate_url(url: str) -> bool:
    """验证URL格式"""
    pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
    return bool(re.match(pattern, url))

def sanitize_html(html: str) -> str:
    """清理HTML内容"""
    import re
    # 移除script标签
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # 移除style标签
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # 移除事件处理器
    html = re.sub(r'\s*on\w+\s*=\s*"[^"]*"', '', html, flags=re.IGNORECASE)
    html = re.sub(r'\s*on\w+\s*=\s*\'[^\']*\'', '', html, flags=re.IGNORECASE)
    
    return html.strip()

def extract_domain(url: str) -> Optional[str]:
    """提取域名"""
    import urllib.parse
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.netloc
    except:
        return None