"""
数据采集任务
路径: /mnt/okcomputer/output/backend/workers/tasks/crawl_tasks.py
"""

from celery import shared_task
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from ..services.crawler import crawler_service

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def crawl_site_task(self, site_id: str) -> Dict[str, Any]:
    """采集指定站点的任务"""
    try:
        logger.info(f"Starting crawl task for site: {site_id}")
        
        # 运行采集任务
        result = crawler_service.run_crawl_task([site_id])
        
        if result['success']:
            logger.info(f"Crawl task completed for site {site_id}: {result['message']}")
            return result
        else:
            logger.error(f"Crawl task failed for site {site_id}: {result.get('error', 'Unknown error')}")
            raise Exception(result.get('error', 'Crawl task failed'))
            
    except Exception as e:
        logger.error(f"Crawl task exception for site {site_id}: {e}")
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying crawl task for site {site_id} (attempt {self.request.retries + 1})")
            raise self.retry(exc=e, countdown=self.default_retry_delay)
        else:
            return {
                'success': False,
                'error': str(e),
                'message': f'Crawl task failed after {self.max_retries} retries',
                'site_id': site_id
            }

@shared_task(bind=True, max_retries=2, default_retry_delay=600)
def scheduled_crawl(self) -> Dict[str, Any]:
    """定时采集任务"""
    try:
        logger.info("Starting scheduled crawl task")
        
        # 运行批量采集
        result = crawler_service.run_crawl_task()
        
        logger.info(f"Scheduled crawl task completed: {result['message']}")
        return result
        
    except Exception as e:
        logger.error(f"Scheduled crawl task failed: {e}")
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying scheduled crawl task (attempt {self.request.retries + 1})")
            raise self.retry(exc=e, countdown=self.default_retry_delay)
        else:
            return {
                'success': False,
                'error': str(e),
                'message': 'Scheduled crawl task failed after max retries'
            }

@shared_task(bind=True, max_retries=3, default_retry_delay=180)
def test_crawl(self) -> Dict[str, Any]:
    """测试采集任务"""
    try:
        logger.info("Starting test crawl task")
        
        # 模拟采集几个测试页面
        test_results = []
        
        # 测试页面1
        test_page1 = {
            'url': 'https://example.gov.cn/policy/test1',
            'title': '测试政策文件1',
            'content': '这是测试政策文件的详细内容...',
            'source': 'example.gov.cn',
            'region': '北京市',
            'industry': '信息技术',
            'publish_date': datetime.utcnow(),
            'crawl_date': datetime.utcnow(),
            'metadata': {'test': True},
            'status': 'pending'
        }
        test_results.append(test_page1)
        
        # 测试页面2
        test_page2 = {
            'url': 'https://example.gov.cn/policy/test2',
            'title': '测试政策文件2',
            'content': '这是另一个测试政策文件的内容...',
            'source': 'example.gov.cn',
            'region': '上海市',
            'industry': '金融服务',
            'publish_date': datetime.utcnow(),
            'crawl_date': datetime.utcnow(),
            'metadata': {'test': True},
            'status': 'pending'
        }
        test_results.append(test_page2)
        
        # 保存测试结果
        from ...database.mongodb import mongodb
        collection = mongodb.get_collection('raw_pages')
        
        saved_count = 0
        for result in test_results:
            try:
                existing = collection.find_one({'url': result['url']})
                if not existing:
                    collection.insert_one(result)
                    saved_count += 1
            except Exception as e:
                logger.error(f"Error saving test result: {e}")
                continue
        
        logger.info(f"Test crawl task completed: {saved_count} test pages saved")
        
        return {
            'success': True,
            'message': f'Test crawl completed. {saved_count} test pages saved.',
            'saved_count': saved_count,
            'test_results': test_results
        }
        
    except Exception as e:
        logger.error(f"Test crawl task failed: {e}")
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying test crawl task (attempt {self.request.retries + 1})")
            raise self.retry(exc=e, countdown=self.default_retry_delay)
        else:
            return {
                'success': False,
                'error': str(e),
                'message': 'Test crawl task failed after max retries'
            }

@shared_task
def batch_crawl_sites(site_ids: List[str]) -> Dict[str, Any]:
    """批量采集多个站点"""
    try:
        logger.info(f"Starting batch crawl for sites: {site_ids}")
        
        # 创建任务组
        job = group([
            crawl_site_task.s(site_id) for site_id in site_ids
        ])
        
        # 异步执行
        result = job.apply_async()
        
        logger.info(f"Batch crawl job created: {result.id}")
        
        return {
            'success': True,
            'message': f'Batch crawl job created: {result.id}',
            'job_id': result.id,
            'site_count': len(site_ids)
        }
        
    except Exception as e:
        logger.error(f"Batch crawl failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'message': 'Batch crawl failed'
        }

@shared_task
def get_crawl_status(job_id: str) -> Dict[str, Any]:
    """获取采集任务状态"""
    try:
        from celery.result import AsyncResult
        
        result = AsyncResult(job_id)
        
        return {
            'success': True,
            'job_id': job_id,
            'status': result.status,
            'ready': result.ready(),
            'successful': result.successful(),
            'failed': result.failed(),
            'result': result.result if result.ready() else None
        }
        
    except Exception as e:
        logger.error(f"Get crawl status failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to get crawl status'
        }