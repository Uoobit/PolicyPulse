"""
Redis数据库连接
路径: /mnt/okcomputer/output/backend/app/database/redis.py
"""

import redis.asyncio as redis
from typing import Optional, Union, Any
import json
import logging
from datetime import timedelta

from ..config import settings

logger = logging.getLogger(__name__)

class RedisDB:
    """Redis异步连接管理器"""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        
    async def connect(self):
        """连接Redis"""
        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                db=settings.REDIS_DB,
                decode_responses=True,
                max_connections=50,
                socket_keepalive=True,
                socket_keepalive_options={},
            )
            
            # 测试连接
            await self.client.ping()
            logger.info("Connected to Redis")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def close(self):
        """关闭Redis连接"""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")
    
    async def ping(self) -> bool:
        """检查连接状态"""
        try:
            await self.client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis ping failed: {e}")
            return False
    
    # 字符串操作
    async def get(self, key: str) -> Optional[str]:
        """获取字符串值"""
        try:
            return await self.client.get(key)
        except Exception as e:
            logger.error(f"Redis get failed: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Union[str, int, float], 
        ex: Optional[int] = None
    ) -> bool:
        """设置字符串值"""
        try:
            return await self.client.set(key, value, ex=ex)
        except Exception as e:
            logger.error(f"Redis set failed: {e}")
            return False
    
    async def delete(self, key: str) -> int:
        """删除键"""
        try:
            return await self.client.delete(key)
        except Exception as e:
            logger.error(f"Redis delete failed: {e}")
            return 0
    
    async def exists(self, key: str) -> int:
        """检查键是否存在"""
        try:
            return await self.client.exists(key)
        except Exception as e:
            logger.error(f"Redis exists failed: {e}")
            return 0
    
    # Hash操作
    async def hget(self, name: str, key: str) -> Optional[str]:
        """获取哈希字段值"""
        try:
            return await self.client.hget(name, key)
        except Exception as e:
            logger.error(f"Redis hget failed: {e}")
            return None
    
    async def hset(self, name: str, key: str, value: str) -> int:
        """设置哈希字段值"""
        try:
            return await self.client.hset(name, key, value)
        except Exception as e:
            logger.error(f"Redis hset failed: {e}")
            return 0
    
    async def hdel(self, name: str, key: str) -> int:
        """删除哈希字段"""
        try:
            return await self.client.hdel(name, key)
        except Exception as e:
            logger.error(f"Redis hdel failed: {e}")
            return 0
    
    # Set操作
    async def sadd(self, name: str, *values) -> int:
        """添加集合成员"""
        try:
            return await self.client.sadd(name, *values)
        except Exception as e:
            logger.error(f"Redis sadd failed: {e}")
            return 0
    
    async def srem(self, name: str, *values) -> int:
        """移除集合成员"""
        try:
            return await self.client.srem(name, *values)
        except Exception as e:
            logger.error(f"Redis srem failed: {e}")
            return 0
    
    async def sismember(self, name: str, value: str) -> int:
        """检查集合成员"""
        try:
            return await self.client.sismember(name, value)
        except Exception as e:
            logger.error(f"Redis sismember failed: {e}")
            return 0
    
    # 过期时间操作
    async def expire(self, key: str, seconds: int) -> int:
        """设置过期时间"""
        try:
            return await self.client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Redis expire failed: {e}")
            return 0
    
    async def ttl(self, key: str) -> int:
        """获取剩余过期时间"""
        try:
            return await self.client.ttl(key)
        except Exception as e:
            logger.error(f"Redis ttl failed: {e}")
            return -2
    
    # JSON数据操作
    async def set_json(self, key: str, data: dict, ex: Optional[int] = None) -> bool:
        """存储JSON数据"""
        try:
            value = json.dumps(data, ensure_ascii=False)
            return await self.set(key, value, ex=ex)
        except Exception as e:
            logger.error(f"Redis set_json failed: {e}")
            return False
    
    async def get_json(self, key: str) -> Optional[dict]:
        """获取JSON数据"""
        try:
            value = await self.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Redis get_json failed: {e}")
            return None
    
    # 验证码相关
    async def set_verification_code(self, email: str, code: str, expire: int = 300) -> bool:
        """存储验证码"""
        key = f"verification_code:{email}"
        return await self.set(key, code, ex=expire)
    
    async def get_verification_code(self, email: str) -> Optional[str]:
        """获取验证码"""
        key = f"verification_code:{email}"
        return await self.get(key)
    
    async def delete_verification_code(self, email: str) -> int:
        """删除验证码"""
        key = f"verification_code:{email}"
        return await self.delete(key)
    
    # JWT黑名单
    async def add_to_blacklist(self, token: str, expire: int) -> bool:
        """添加JWT到黑名单"""
        key = f"blacklist:{token}"
        return await self.set(key, "1", ex=expire)
    
    async def is_blacklisted(self, token: str) -> bool:
        """检查JWT是否在黑名单"""
        key = f"blacklist:{token}"
        return await self.exists(key) > 0
    
    # 去重相关
    async def add_to_set(self, key: str, value: str) -> int:
        """添加到集合（去重）"""
        return await self.sadd(key, value)
    
    async def is_member(self, key: str, value: str) -> bool:
        """检查是否是集合成员"""
        return await self.sismember(key, value) > 0
    
    # 缓存相关
    async def cache_get(self, key: str) -> Optional[str]:
        """获取缓存"""
        return await self.get(f"cache:{key}")
    
    async def cache_set(self, key: str, value: str, expire: int = 3600) -> bool:
        """设置缓存"""
        return await self.set(f"cache:{key}", value, ex=expire)
    
    async def cache_delete(self, key: str) -> int:
        """删除缓存"""
        return await self.delete(f"cache:{key}")
    
    # 获取Redis客户端
    def get_client(self) -> redis.Redis:
        """获取Redis客户端"""
        if not self.client:
            raise RuntimeError("Redis not connected")
        return self.client

# 创建全局实例
redisdb = RedisDB()

# 导出实例
__all__ = ["redisdb", "RedisDB"]