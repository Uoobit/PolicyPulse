"""
辅助工具函数
路径: /mnt/okcomputer/output/backend/app/utils/helpers.py
"""

import time
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

def generate_timestamp() -> int:
    """生成时间戳"""
    return int(time.time())

def format_datetime(dt: datetime) -> str:
    """格式化日期时间"""
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def parse_datetime(date_str: str) -> Optional[datetime]:
    """解析日期时间字符串"""
    try:
        return datetime.fromisoformat(date_str)
    except:
        return None

def get_date_range(days: int = 30) -> tuple:
    """获取日期范围"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def truncate_text(text: str, max_length: int = 100) -> str:
    """截断文本"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + '...'

def clean_text(text: str) -> str:
    """清理文本"""
    import re
    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符
    text = re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)
    return text.strip()

def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """提取关键词"""
    import jieba
    import re
    
    # 分词
    words = jieba.cut(text)
    
    # 过滤停用词和短词
    stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '我们', '他', '来', '个', '能', '对', '作为', '但是', '这个', '或者', '可以', '因为', '所以', '如果', '那么', '什么', '怎么', '为什么', '哪里', '什么时候', '谁', '怎么样', '多少', '多大', '多长', '多重', '多高', '多快', '多远', '多久', '多早', '多晚', '多热', '多冷', '多亮', '多暗', '多响', '多轻', '多硬', '多软', '多干', '多湿', '多新', '多旧', '多干净', '多脏', '多简单', '多复杂', '多容易', '多困难', '多便宜', '多贵', '多快', '多慢', '多早', '多晚', '多近', '多远', '多深', '多浅', '多宽', '多窄', '多高', '多矮', '多长', '多短', '多粗', '多细', '多大', '多小', '多厚', '多薄', '多重', '多轻', '多硬', '多软', '多强', '多弱', '多亮', '多暗', '多响', '多轻', '多热', '多冷', '多干', '多湿', '多新', '多旧', '多干净', '多脏', '多简单', '多复杂', '多容易', '多困难', '多便宜', '多贵', '多快', '多慢', '多早', '多晚', '多近', '多远', '多深', '多浅', '多宽', '多窄', '多高', '多矮', '多长', '多短', '多粗', '多细', '多大', '多小', '多厚', '多薄', '多重', '多轻', '多硬', '多软', '多强', '多弱', '多亮', '多暗', '多响', '多轻', '多热', '多冷', '多干', '多湿', '多新', '多旧', '多干净', '多脏', '多简单', '多复杂', '多容易', '多困难', '多便宜', '多贵', '多快', '多慢', '多早', '多晚', '多近', '多远', '多深', '多浅', '多宽', '多窄', '多高', '多矮', '多长', '多短', '多粗', '多细', '多大', '多小', '多厚', '多薄', '多重', '多轻', '多硬', '多软', '多强', '多弱', '多亮', '多暗', '多响', '多轻', '多热', '多冷', '多干', '多湿', '多新', '多旧', '多干净', '多脏', '多简单', '多复杂', '多容易', '多困难', '多便宜', '多贵', '多快', '多慢', '多早', '多晚', '多近', '多远', '多深', '多浅', '多宽', '多窄', '多高', '多矮', '多长', '多短', '多粗', '多细', '多大', '多小', '多厚', '多薄', '多重', '多轻', '多硬', '多软', '多强', '多弱'}
    
    # 过滤和计数
    word_count = {}
    for word in words:
        word = word.strip()
        if (len(word) > 1 and 
            word not in stop_words and 
            re.match(r'[\u4e00-\u9fff]+', word)):
            word_count[word] = word_count.get(word, 0) + 1
    
    # 返回频率最高的关键词
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    return [word for word, count in sorted_words[:max_keywords]]

def calculate_reading_time(text: str, wpm: int = 200) -> int:
    """计算阅读时间"""
    word_count = len(text.split())
    return max(1, word_count // wpm)

def generate_short_id(length: int = 8) -> str:
    """生成短ID"""
    import string
    import secrets
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def mask_sensitive_info(text: str) -> str:
    """脱敏处理"""
    import re
    
    # 手机号脱敏
    text = re.sub(r'1[3-9]\d{9}', '****', text)
    
    # 邮箱脱敏
    text = re.sub(r'\S+@\S+\.\S+', '****@****.****', text)
    
    # 身份证号脱敏
    text = re.sub(r'\d{17}[\dXx]', '*****************', text)
    
    return text

def batch_process(items: List[Any], batch_size: int = 100) -> List[List[Any]]:
    """批量处理"""
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]

def retry_on_exception(func, max_retries: int = 3, delay: float = 1.0):
    """异常重试装饰器"""
    def wrapper(*args, **kwargs):
        for i in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if i == max_retries - 1:
                    raise e
                time.sleep(delay * (i + 1))
        return None
    return wrapper