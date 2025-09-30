"""
Celery应用配置
路径: /mnt/okcomputer/output/backend/workers/celery_app.py
"""

import os
import sys
from celery import Celery
from celery.schedules import crontab
from datetime import timedelta

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

# 加载环境变量
from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, '.env'))

# 创建Celery应用
celery_app = Celery(
    'policypulse',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    include=[
        'workers.tasks.crawl_tasks',
        'workers.tasks.clean_tasks', 
        'workers.tasks.analyze_tasks',
        'workers.tasks.notification_tasks'
    ]
)

# Celery配置
celery_app.conf.update(
    # 任务序列化
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    
    # 任务路由
    task_routes={
        'workers.tasks.crawl_tasks.*': {'queue': 'crawl'},
        'workers.tasks.clean_tasks.*': {'queue': 'clean'},
        'workers.tasks.analyze_tasks.*': {'queue': 'analyze'},
        'workers.tasks.notification_tasks.*': {'queue': 'notification'},
    },
    
    # 工作进程配置
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_pool='prefork',
    
    # 结果配置
    result_expires=3600,
    result_persistent=True,
    
    # 监控配置
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # 重试配置
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # 内存优化
    worker_proc_alive_timeout=60,
    worker_cancel_long_running_tasks_on_connection_loss=True,
)

# 定时任务配置
celery_app.conf.beat_schedule = {
    # 数据采集任务 - 每小时执行一次
    'crawl-gov-sites': {
        'task': 'workers.tasks.crawl_tasks.scheduled_crawl',
        'schedule': crontab(minute=0),  # 每小时0分执行
        'args': (),
        'options': {
            'queue': 'crawl',
            'expires': 300,
        }
    },
    
    # 数据清洗任务 - 每30分钟执行一次
    'clean-raw-data': {
        'task': 'workers.tasks.clean_tasks.scheduled_clean',
        'schedule': crontab(minute='*/30'),  # 每30分钟执行
        'args': (),
        'options': {
            'queue': 'clean',
            'expires': 300,
        }
    },
    
    # 智能分析任务 - 每15分钟执行一次
    'analyze-policies': {
        'task': 'workers.tasks.analyze_tasks.scheduled_analyze',
        'schedule': crontab(minute='*/15'),  # 每15分钟执行
        'args': (),
        'options': {
            'queue': 'analyze',
            'expires': 300,
        }
    },
    
    # 通知推送任务 - 每5分钟执行一次
    'send-notifications': {
        'task': 'workers.tasks.notification_tasks.scheduled_notification',
        'schedule': crontab(minute='*/5'),  # 每5分钟执行
        'args': (),
        'options': {
            'queue': 'notification',
            'expires': 300,
        }
    },
    
    # 系统维护任务 - 每天凌晨2点执行
    'system-maintenance': {
        'task': 'workers.tasks.maintenance_tasks.system_maintenance',
        'schedule': crontab(hour=2, minute=0),  # 每天2:00执行
        'args': (),
        'options': {
            'queue': 'default',
            'expires': 3600,
        }
    },
}

# 任务默认配置
celery_app.conf.task_default_queue = 'default'
celery_app.conf.task_default_exchange = 'default'
celery_app.conf.task_default_routing_key = 'default'

# 监控配置
celery_app.conf.worker_send_task_events = True
celery_app.conf.task_send_sent_event = True

# 错误处理配置
celery_app.conf.task_remote_tracebacks = True

# 导入任务模块以注册任务
import workers.tasks.crawl_tasks
import workers.tasks.clean_tasks
import workers.tasks.analyze_tasks
import workers.tasks.notification_tasks

if __name__ == '__main__':
    celery_app.start()