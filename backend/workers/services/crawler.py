"""
数据采集服务
路径: /mnt/okcomputer/output/backend/workers/services/crawler.py
"""

import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
from bs4 import BeautifulSoup
import logging
from datetime import datetime
import json
import time
import random
from urllib.parse import urljoin, urlparse

from ...config import settings
from ...database.mongodb import mongodb

logger = logging.getLogger(__name__)

class GovTreeCrawler:
    """政府网站数据采集服务"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.visited_urls = set()
        self.delay = settings.CRAWL_DELAY
        self.timeout = settings.CRAWL_TIMEOUT
        self.max_retry = settings.MAX_RETRY_COUNT
        
    async def __aenter__(self):
        """异步上下文管理器入口"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': 'PolicyPulse-Bot/1.0 (Compatible; Email: support@policypulse.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    async def crawl_page(self, url: str, source_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """采集单个页面"""
        try:
            # 检查是否已经访问过
            if url in self.visited_urls:
                logger.info(f"URL already visited: {url}")
                return None
            
            self.visited_urls.add(url)
            
            # 随机延迟避免被封
            await asyncio.sleep(random.uniform(1, self.delay))
            
            logger.info(f"Crawling: {url}")
            
            async with self.session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"HTTP {response.status} for {url}")
                    return None
                
                content_type = response.headers.get('content-type', '')
                if 'text/html' not in content_type:
                    logger.info(f"Non-HTML content: {content_type}")
                    return None
                
                html = await response.text()
                
                # 解析页面内容
                soup = BeautifulSoup(html, 'html.parser')
                
                # 提取标题
                title = self._extract_title(soup, source_config)
                
                # 提取正文内容
                content = self._extract_content(soup, source_config)
                
                # 提取发布日期
                publish_date = self._extract_date(soup, source_config)
                
                # 提取元数据
                metadata = self._extract_metadata(soup, source_config)
                
                result = {
                    'url': url,
                    'title': title,
                    'content': content,
                    'source': source_config.get('name', 'unknown'),
                    'region': source_config.get('region', 'unknown'),
                    'industry': source_config.get('industry', 'unknown'),
                    'publish_date': publish_date,
                    'crawl_date': datetime.utcnow(),
                    'metadata': metadata,
                    'status': 'pending'
                }
                
                logger.info(f"Successfully crawled: {title}")
                return result
                
        except asyncio.TimeoutError:
            logger.error(f"Timeout crawling {url}")
        except aiohttp.ClientError as e:
            logger.error(f"Client error crawling {url}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error crawling {url}: {e}")
        
        return None
    
    def _extract_title(self, soup: BeautifulSoup, config: Dict[str, Any]) -> str:
        """提取页面标题"""
        selectors = config.get('selectors', {})
        
        # 尝试多个选择器
        title_selectors = selectors.get('title', ['h1', 'title', '.title', '#title'])
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        
        # 默认使用页面title
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        return "Untitled"
    
    def _extract_content(self, soup: BeautifulSoup, config: Dict[str, Any]) -> str:
        """提取正文内容"""
        selectors = config.get('selectors', {})
        
        # 移除脚本和样式
        for script in soup(["script", "style"]):
            script.decompose()
        
        # 尝试内容选择器
        content_selectors = selectors.get('content', [
            '.content', '.article', '.post', '#content', '#article', '.news-content'
        ])
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                content = ' '.join([elem.get_text(separator=' ', strip=True) for elem in elements])
                if len(content) > 100:  # 确保内容足够长
                    return content
        
        # 如果没有找到特定内容区域，使用body内容
        body = soup.find('body')
        if body:
            return body.get_text(separator=' ', strip=True)
        
        return ""
    
    def _extract_date(self, soup: BeautifulSoup, config: Dict[str, Any]) -> datetime:
        """提取发布日期"""
        selectors = config.get('selectors', {})
        
        date_selectors = selectors.get('date', [
            '.date', '.publish-date', '.pub-date', '.time', '#date'
        ])
        
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                date_text = element.get_text(strip=True)
                parsed_date = self._parse_date(date_text)
                if parsed_date:
                    return parsed_date
        
        # 尝试从meta标签提取
        date_meta = soup.find('meta', attrs={'name': 'date'}) or \
                   soup.find('meta', attrs={'property': 'article:published_time'})
        if date_meta:
            date_content = date_meta.get('content', '')
            parsed_date = self._parse_date(date_content)
            if parsed_date:
                return parsed_date
        
        # 默认使用当前时间
        return datetime.utcnow()
    
    def _parse_date(self, date_text: str) -> Optional[datetime]:
        """解析日期字符串"""
        if not date_text:
            return None
        
        # 常见的日期格式
        date_formats = [
            '%Y-%m-%d',
            '%Y-%m-%d %H:%M:%S',
            '%Y/%m/%d',
            '%Y/%m/%d %H:%M:%S',
            '%d-%m-%Y',
            '%d/%m/%Y',
            '%Y年%m月%d日',
            '%Y年%m月%d日 %H时%M分',
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_text.strip(), fmt)
            except ValueError:
                continue
        
        return None
    
    def _extract_metadata(self, soup: BeautifulSoup, config: Dict[str, Any]) -> Dict[str, Any]:
        """提取元数据"""
        metadata = {}
        
        # 提取meta标签信息
        meta_tags = soup.find_all('meta')
        for tag in meta_tags:
            name = tag.get('name') or tag.get('property')
            content = tag.get('content')
            if name and content:
                metadata[name] = content
        
        # 提取页面中的关键词
        keywords = soup.find_all(attrs={'class': re.compile('keyword', re.I)})
        if keywords:
            metadata['keywords'] = [kw.get_text(strip=True) for kw in keywords]
        
        # 提取链接
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            if href.startswith('http') or href.startswith('/'):
                links.append({'url': href, 'text': text})
        
        if links:
            metadata['links'] = links[:10]  # 限制数量
        
        return metadata
    
    async def crawl_site(self, site_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """采集整个站点"""
        results = []
        
        try:
            # 加载起始URL
            start_urls = site_config.get('start_urls', [])
            if not start_urls:
                logger.warning(f"No start URLs for site: {site_config.get('name', 'unknown')}")
                return results
            
            # 采集每个起始URL
            for url in start_urls:
                result = await self.crawl_page(url, site_config)
                if result:
                    results.append(result)
                
                # 限制单次采集数量
                if len(results) >= 10:  # 每个站点最多采集10个页面
                    break
            
            logger.info(f"Crawl site {site_config.get('name', 'unknown')} completed: {len(results)} pages")
            
        except Exception as e:
            logger.error(f"Error crawling site {site_config.get('name', 'unknown')}: {e}")
        
        return results
    
    async def save_results(self, results: List[Dict[str, Any]], collection_type: str = 'policy') -> int:
        """保存采集结果到数据库"""
        if not results:
            return 0
        
        try:
            collection = mongodb.get_collection('raw_pages' if collection_type == 'policy' else 'raw_bids')
            
            # 批量插入数据
            inserted_count = 0
            for result in results:
                try:
                    # 检查是否已存在
                    existing = await collection.find_one({'url': result['url']})
                    if existing:
                        logger.info(f"URL already exists: {result['url']}")
                        continue
                    
                    # 插入新数据
                    await collection.insert_one(result)
                    inserted_count += 1
                    
                except Exception as e:
                    logger.error(f"Error saving result: {e}")
                    continue
            
            logger.info(f"Saved {inserted_count} new pages to database")
            return inserted_count
            
        except Exception as e:
            logger.error(f"Error saving results to database: {e}")
            return 0

class CrawlerService:
    """数据采集服务管理类"""
    
    def __init__(self):
        self.sites_config = []
        self.load_sites_config()
    
    def load_sites_config(self):
        """加载站点配置"""
        try:
            # 加载政府树形结构配置
            import os
            gov_tree_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'gov_tree.json')
            
            if os.path.exists(gov_tree_path):
                with open(gov_tree_path, 'r', encoding='utf-8') as f:
                    gov_data = json.load(f)
                    self.sites_config.extend(self._parse_gov_tree(gov_data))
            
            # 加载自定义站点配置
            custom_sites_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sites_custom')
            if os.path.exists(custom_sites_path):
                for filename in os.listdir(custom_sites_path):
                    if filename.endswith('.yml') or filename.endswith('.yaml'):
                        filepath = os.path.join(custom_sites_path, filename)
                        with open(filepath, 'r', encoding='utf-8') as f:
                            import yaml
                            config = yaml.safe_load(f)
                            self.sites_config.append(config)
            
            logger.info(f"Loaded {len(self.sites_config)} site configurations")
            
        except Exception as e:
            logger.error(f"Error loading sites configuration: {e}")
    
    def _parse_gov_tree(self, tree_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """解析政府树形结构为站点配置"""
        sites = []
        
        def process_node(node, level=0):
            if level > 5:  # 限制层级深度
                return
            
            # 生成站点配置
            if 'website' in node:
                site_config = {
                    'id': node.get('id', f"gov_{len(sites)}"),
                    'name': node.get('name', 'Unknown'),
                    'region': node.get('name', 'Unknown'),
                    'level': level,
                    'start_urls': [node['website']],
                    'category': 'policy',
                    'selectors': {
                        'title': ['h1', '.title', 'title'],
                        'content': ['.content', '.article', 'main'],
                        'date': ['.date', '.publish-date', '.time']
                    }
                }
                sites.append(site_config)
            
            # 处理子节点
            if 'children' in node:
                for child in node['children']:
                    process_node(child, level + 1)
        
        if isinstance(tree_data, list):
            for node in tree_data:
                process_node(node)
        else:
            process_node(tree_data)
        
        return sites
    
    async def run_crawl_task(self, site_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """运行采集任务"""
        try:
            total_results = 0
            total_errors = 0
            
            # 筛选要采集的站点
            sites_to_crawl = []
            if site_ids:
                sites_to_crawl = [site for site in self.sites_config if site['id'] in site_ids]
            else:
                # 随机选择部分站点进行采集
                import random
                sites_to_crawl = random.sample(self.sites_config, min(5, len(self.sites_config)))
            
            logger.info(f"Starting crawl task for {len(sites_to_crawl)} sites")
            
            async with GovTreeCrawler() as crawler:
                for site_config in sites_to_crawl:
                    try:
                        # 采集站点
                        results = await crawler.crawl_site(site_config)
                        
                        # 保存结果
                        saved_count = await crawler.save_results(results, site_config.get('category', 'policy'))
                        
                        total_results += saved_count
                        
                        logger.info(f"Site {site_config['id']} crawl completed: {saved_count} pages saved")
                        
                    except Exception as e:
                        logger.error(f"Error crawling site {site_config.get('id', 'unknown')}: {e}")
                        total_errors += 1
                        continue
            
            return {
                'success': True,
                'total_sites': len(sites_to_crawl),
                'total_pages': total_results,
                'errors': total_errors,
                'message': f'Crawl task completed. {total_results} pages saved from {len(sites_to_crawl)} sites.'
            }
            
        except Exception as e:
            logger.error(f"Crawl task failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Crawl task failed'
            }

# 创建全局实例
crawler_service = CrawlerService()

# 导出服务
__all__ = ['crawler_service', 'CrawlerService', 'GovTreeCrawler']