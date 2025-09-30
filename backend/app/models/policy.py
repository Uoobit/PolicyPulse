"""
政策数据模型
路径: /mnt/okcomputer/output/backend/app/models/policy.py
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PolicyStatus(str, Enum):
    """政策状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"

class PolicyCategory(str, Enum):
    """政策分类枚举"""
    NATIONAL = "national"
    PROVINCIAL = "provincial"
    MUNICIPAL = "municipal"
    LOCAL = "local"
    INDUSTRY = "industry"

class PolicyLevel(str, Enum):
    """政策级别枚举"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class RiskLevel(str, Enum):
    """风险等级枚举"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NONE = "none"

class SignalType(str, Enum):
    """信号类型枚举"""
    OPPORTUNITY = "opportunity"
    RISK = "risk"
    NEUTRAL = "neutral"
    TREND = "trend"

class RawPage(BaseModel):
    """原始政策页面模型"""
    id: str = Field(alias="_id")
    url: str = Field(..., description="原始URL")
    title: str = Field(..., description="标题")
    content: str = Field(..., description="原文内容")
    source: str = Field(..., description="来源网站")
    region: str = Field(..., description="地域")
    industry: Optional[str] = Field(None, description="行业")
    publish_date: datetime = Field(..., description="发布日期")
    crawl_date: datetime = Field(default_factory=datetime.utcnow, description="采集日期")
    status: PolicyStatus = Field(default=PolicyStatus.PENDING, description="处理状态")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="额外元数据")
    retry_count: int = Field(default=0, description="重试次数")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class RawPageCreate(BaseModel):
    """创建原始政策页面模型"""
    url: str = Field(..., description="原始URL")
    title: str = Field(..., description="标题")
    content: str = Field(..., description="原文内容")
    source: str = Field(..., description="来源网站")
    region: str = Field(..., description="地域")
    industry: Optional[str] = Field(None, description="行业")
    publish_date: datetime = Field(..., description="发布日期")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="额外元数据")

class CleanedDoc(BaseModel):
    """清洗后的政策文档模型"""
    id: str = Field(alias="_id")
    raw_id: str = Field(..., description="关联的原始文档ID")
    title: str = Field(..., description="清洗后标题")
    summary: str = Field(..., description="摘要")
    content: str = Field(..., description="结构化内容")
    tags: List[str] = Field(default_factory=list, description="标签")
    category: PolicyCategory = Field(..., description="分类")
    level: PolicyLevel = Field(..., description="政策级别")
    effective_date: Optional[datetime] = Field(None, description="生效日期")
    region: str = Field(..., description="适用地域")
    industry: Optional[str] = Field(None, description="适用行业")
    cleaned_at: datetime = Field(default_factory=datetime.utcnow, description="清洗时间")
    status: str = Field(default="success", description="清洗状态")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class CleanedDocCreate(BaseModel):
    """创建清洗后政策文档模型"""
    raw_id: str = Field(..., description="关联的原始文档ID")
    title: str = Field(..., description="清洗后标题")
    summary: str = Field(..., description="摘要")
    content: str = Field(..., description="结构化内容")
    tags: List[str] = Field(default_factory=list, description="标签")
    category: PolicyCategory = Field(..., description="分类")
    level: PolicyLevel = Field(..., description="政策级别")
    effective_date: Optional[datetime] = Field(None, description="生效日期")
    region: str = Field(..., description="适用地域")
    industry: Optional[str] = Field(None, description="适用行业")

class Insight(BaseModel):
    """政策解读模型"""
    id: str = Field(alias="_id")
    doc_id: str = Field(..., description="关联的政策文档ID")
    aggressive: Dict[str, Any] = Field(..., description="激进解读")
    conservative: Dict[str, Any] = Field(..., description="保守解读")
    key_points: List[str] = Field(default_factory=list, description="关键要点")
    risk_level: RiskLevel = Field(..., description="风险等级")
    opportunity: str = Field(..., description="商机评估")
    analyzed_at: datetime = Field(default_factory=datetime.utcnow, description="分析时间")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class InsightCreate(BaseModel):
    """创建政策解读模型"""
    doc_id: str = Field(..., description="关联的政策文档ID")
    aggressive: Dict[str, Any] = Field(..., description="激进解读")
    conservative: Dict[str, Any] = Field(..., description="保守解读")
    key_points: List[str] = Field(default_factory=list, description="关键要点")
    risk_level: RiskLevel = Field(..., description="风险等级")
    opportunity: str = Field(..., description="商机评估")

class PolicyAnalysis(BaseModel):
    """政策分析结果模型"""
    summary: str = Field(..., description="100字摘要")
    signals: List[SignalType] = Field(..., description="信号标记")
    confidence: float = Field(..., ge=0, le=1, description="置信度")

class PolicyInsight(BaseModel):
    """政策洞察模型"""
    id: str = Field(alias="_id")
    doc_id: str = Field(..., description="文档ID")
    title: str = Field(..., description="标题")
    summary: str = Field(..., description="摘要")
    aggressive_analysis: PolicyAnalysis = Field(..., description="激进分析")
    conservative_analysis: PolicyAnalysis = Field(..., description="保守分析")
    key_points: List[str] = Field(..., description="关键要点")
    risk_level: RiskLevel = Field(..., description="风险等级")
    opportunity: str = Field(..., description="商机评估")
    publish_date: datetime = Field(..., description="发布日期")
    region: str = Field(..., description="地域")
    industry: Optional[str] = Field(None, description="行业")
    analyzed_at: datetime = Field(..., description="分析时间")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PolicyFilter(BaseModel):
    """政策筛选模型"""
    keywords: Optional[List[str]] = Field(None, description="关键词")
    regions: Optional[List[str]] = Field(None, description="地域")
    industries: Optional[List[str]] = Field(None, description="行业")
    categories: Optional[List[PolicyCategory]] = Field(None, description="分类")
    risk_levels: Optional[List[RiskLevel]] = Field(None, description="风险等级")
    signal_types: Optional[List[SignalType]] = Field(None, description="信号类型")
    conservative: Optional[bool] = Field(None, description="是否保守解读")
    date_from: Optional[datetime] = Field(None, description="开始日期")
    date_to: Optional[datetime] = Field(None, description="结束日期")
    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=20, ge=1, le=100, description="每页数量")

# 导出模型
__all__ = [
    "PolicyStatus",
    "PolicyCategory",
    "PolicyLevel",
    "RiskLevel",
    "SignalType",
    "RawPage",
    "RawPageCreate",
    "CleanedDoc",
    "CleanedDocCreate",
    "Insight",
    "InsightCreate",
    "PolicyAnalysis",
    "PolicyInsight",
    "PolicyFilter"
]