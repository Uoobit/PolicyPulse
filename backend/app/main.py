"""
PolicyPulse FastAPI 主应用
路径: /mnt/okcomputer/output/backend/app/main.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator

from .config import settings
from .database.mongodb import MongoDB
from .database.redis import RedisDB
from .api import auth, users, policies, bids, subscriptions, notifications, admin
from .middleware.auth import AuthMiddleware
from .middleware.cors import CustomCORSMiddleware

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局数据库连接实例
mongodb = MongoDB()
redisdb = RedisDB()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    # 启动时初始化
    logger.info("Starting PolicyPulse API...")
    
    # 连接数据库
    await mongodb.connect()
    await redisdb.connect()
    
    logger.info("Database connections established")
    
    yield
    
    # 关闭时清理
    logger.info("Shutting down PolicyPulse API...")
    
    # 关闭数据库连接
    await mongodb.close()
    await redisdb.close()
    
    logger.info("Database connections closed")

# 创建FastAPI应用
app = FastAPI(
    title="PolicyPulse API",
    description="政策和招标信息智能分析SaaS平台API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 添加中间件
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(CustomCORSMiddleware)
app.add_middleware(AuthMiddleware)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(policies.router, prefix="/api/policies", tags=["政策"])
app.include_router(bids.router, prefix="/api/bids", tags=["招标"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["订阅"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["通知"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理"])

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to PolicyPulse API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else None
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    try:
        # 检查MongoDB连接
        mongo_status = await mongodb.ping()
        
        # 检查Redis连接
        redis_status = await redisdb.ping()
        
        return {
            "status": "healthy" if mongo_status and redis_status else "unhealthy",
            "mongodb": "connected" if mongo_status else "disconnected",
            "redis": "connected" if redis_status else "disconnected",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS
    )