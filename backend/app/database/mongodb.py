"""
MongoDB数据库连接
路径: /mnt/okcomputer/output/backend/app/database/mongodb.py
"""

import motor.motor_asyncio
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.database import Database
import logging

from ..config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB异步连接管理器"""
    
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.database: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None
        
    async def connect(self):
        """连接MongoDB"""
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URL,
                maxPoolSize=100,
                minPoolSize=10,
                maxIdleTimeMS=45000,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=2000,
            )
            
            self.database = self.client[settings.MONGODB_DATABASE]
            
            # 测试连接
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGODB_DATABASE}")
            
            # 创建索引
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def close(self):
        """关闭MongoDB连接"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    async def ping(self) -> bool:
        """检查连接状态"""
        try:
            await self.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"MongoDB ping failed: {e}")
            return False
    
    async def _create_indexes(self):
        """创建数据库索引"""
        try:
            # users集合索引
            await self.database.users.create_index("email", unique=True)
            await self.database.users.create_index("createdAt")
            
            # raw_pages集合索引
            await self.database.raw_pages.create_index("url", unique=True)
            await self.database.raw_pages.create_index("source")
            await self.database.raw_pages.create_index("publishDate")
            await self.database.raw_pages.create_index("status")
            
            # raw_bids集合索引
            await self.database.raw_bids.create_index("url", unique=True)
            await self.database.raw_bids.create_index("source")
            await self.database.raw_bids.create_index("publishDate")
            await self.database.raw_bids.create_index("status")
            
            # cleaned_docs集合索引
            await self.database.cleaned_docs.create_index("rawId")
            await self.database.cleaned_docs.create_index("category")
            await self.database.cleaned_docs.create_index("region")
            await self.database.cleaned_docs.create_index("industry")
            await self.database.cleaned_docs.create_index("effectiveDate")
            
            # cleaned_bids集合索引
            await self.database.cleaned_bids.create_index("rawId")
            await self.database.cleaned_bids.create_index("category")
            await self.database.cleaned_bids.create_index("region")
            await self.database.cleaned_bids.create_index("deadline")
            
            # insights集合索引
            await self.database.insights.create_index("docId")
            await self.database.insights.create_index("analyzedAt")
            await self.database.insights.create_index("riskLevel")
            
            # bid_insights集合索引
            await self.database.bid_insights.create_index("bidId")
            await self.database.bid_insights.create_index("analyzedAt")
            await self.database.bid_insights.create_index("opportunity")
            
            # subscriptions集合索引
            await self.database.subscriptions.create_index("userId")
            await self.database.subscriptions.create_index("status")
            await self.database.subscriptions.create_index("expireAt")
            
            # notifications集合索引
            await self.database.notifications.create_index("userId")
            await self.database.notifications.create_index("createdAt")
            await self.database.notifications.create_index("status")
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
    
    def get_database(self) -> motor.motor_asyncio.AsyncIOMotorDatabase:
        """获取数据库实例"""
        if not self.database:
            raise RuntimeError("Database not connected")
        return self.database
    
    def get_collection(self, name: str):
        """获取集合实例"""
        return self.get_database()[name]

# 创建全局实例
mongodb = MongoDB()

# 导出实例
__all__ = ["mongodb", "MongoDB"]