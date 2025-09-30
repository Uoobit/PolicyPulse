# PolicyPulse SaaS 系统架构文档

## 项目概述
PolicyPulse 是一个基于AI的政策和招标信息智能分析SaaS平台，通过自动化数据采集、大模型清洗和双重解读，为用户提供精准的政策洞察和商机发现服务。

## 系统架构

### 技术栈
- **后端**: Python 3.11 + FastAPI + Celery
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: MongoDB Atlas (主库) + Redis (缓存)
- **消息队列**: Redis + Celery
- **容器化**: Docker + Docker Compose
- **部署**: GitHub Actions + 云服务器

### 核心模块

#### 1. 数据采集模块 (Crawler Service)
- **功能**: 政府网站政策和招标信息自动采集
- **技术**: aiohttp + asyncio + 热重载机制
- **存储**: raw_pages (政策原文) + raw_bids (招标原文)
- **频率**: ≤1次/3秒，支持动态配置

#### 2. 数据清洗模块 (Cleaner Service)
- **功能**: 大模型自动清洗和结构化处理
- **技术**: OpenAI API + JSON Schema验证
- **存储**: cleaned_docs (清洗后政策) + cleaned_bids (清洗后招标)
- **重试**: 失败自动重跑2次

#### 3. 智能解读模块 (Analyzer Service)
- **功能**: 双重AI解读（激进&保守视角）
- **输出**: 100字摘要 + 信号标记 + 置信度
- **存储**: insights (政策解读) + bid_insights (招标解读)

#### 4. 用户认证模块 (Auth Service)
- **功能**: 邮箱注册登录 + JWT认证
- **安全**: bcrypt密码加密 + 6位验证码
- **存储**: Redis(验证码) + MongoDB(用户信息)
- **Token**: JWT(15min) + Refresh Token(7d)

#### 5. 订阅推送模块 (Notification Service)
- **功能**: 多维度筛选 + 多渠道推送
- **通道**: 企业微信/飞书/钉钉/邮件/短信
- **策略**: 失败退避3次，支持重试
- **筛选**: 关键词/地域/行业/信号类型

#### 6. 管理后台模块 (Admin Service)
- **功能**: 实时监控 + 数据统计 + 系统管理
- **指标**: 用户/付费率/ARR/推送成功率
- **可视化**: 30天趋势/漏斗分析/分布图表

#### 7. 支付订阅模块 (Payment Service)
- **功能**: 微信云开发支付 + 套餐管理
- **套餐**: 政策29元/月，招标单省99元/月，全国双轨199元/月
- **试用**: 7天免费试用
- **管理**: 订阅状态/到期提醒/自动续费

## 数据模型设计

### MongoDB Collections

#### users 用户表
```json
{
  _id: ObjectId,
  email: String,      // 邮箱
  password: String,   // bcrypt加密密码
  name: String,       // 用户名
  role: String,       // user/admin
  status: String,     // active/inactive/trial
  subscription: {
    type: String,     // policy/bid/all
    status: String,   // active/expired
    expireAt: Date,
    trialEnd: Date
  },
  preferences: {
    keywords: [String],
    regions: [String],
    industries: [String],
    signalTypes: [String],
    conservative: Boolean
  },
  notifications: {
    wechat: String,
    feishu: String,
    dingding: String,
    email: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### raw_pages 原始政策表
```json
{
  _id: ObjectId,
  url: String,        // 原始URL
  title: String,      // 标题
  content: String,    // 原文内容
  source: String,     // 来源网站
  region: String,     // 地域
  industry: String,   // 行业
  publishDate: Date,  // 发布日期
  crawlDate: Date,    // 采集日期
  status: String,     // pending/processed/failed
  metadata: Object,   // 额外元数据
  retryCount: Number  // 重试次数
}
```

#### cleaned_docs 清洗后政策表
```json
{
  _id: ObjectId,
  rawId: ObjectId,    // 关联raw_pages
  title: String,      // 清洗后标题
  summary: String,    // 摘要
  content: String,    // 结构化内容
  tags: [String],     // 标签
  category: String,   // 分类
  level: String,      // 政策级别
  effectiveDate: Date,// 生效日期
  region: String,     // 适用地域
  industry: String,   // 适用行业
  cleanedAt: Date,    // 清洗时间
  status: String      // success/failed
}
```

#### insights 政策解读表
```json
{
  _id: ObjectId,
  docId: ObjectId,    // 关联cleaned_docs
  aggressive: {
    summary: String,  // 激进解读100字
    signals: [String],// 信号标记
    confidence: Number // 置信度0-1
  },
  conservative: {
    summary: String,  // 保守解读100字
    signals: [String],// 信号标记
    confidence: Number // 置信度0-1
  },
  keyPoints: [String],// 关键要点
  riskLevel: String,  // 风险等级
  opportunity: String,// 商机评估
  analyzedAt: Date    // 分析时间
}
```

## 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   Mobile App    │    │   Admin Panel   │
│   (Next.js)     │    │   (PWA)         │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Nginx)       │
                    └─────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │   Auth Service  │  │  Policy Service │  │  Admin Service  │
    │   (Python)      │  │   (Python)      │  │   (Python)      │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Message Queue │
                    │   (Redis+Celery)│
                    └─────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Crawler Worker  │  │  Cleaner Worker │  │  Notification   │
    │   (Python)      │  │   (Python)      │  │   Worker        │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │   MongoDB Atlas │  │     Redis       │  │   File Storage  │
    │   (Primary DB)  │  │   (Cache+Queue) │  │   (GridFS)      │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 部署架构

### Docker Compose 服务
- **app**: Next.js前端应用
- **api**: FastAPI后端服务
- **worker**: Celery任务处理
- **redis**: Redis缓存和消息队列
- **nginx**: 反向代理和负载均衡
- **mongo**: MongoDB数据库

### 环境配置
- **开发环境**: 本地Docker开发
- **测试环境**: 云服务器测试
- **生产环境**: 多节点集群部署

## 性能指标 (KPI)

### 系统性能
- **清洗成功率**: ≥95%
- **解读延迟**: ≤5分钟
- **推送到达率**: ≥98%
- **API响应时间**: ≤200ms
- **系统可用性**: ≥99.9%

### 业务指标
- **付费转化率**: ≥10%
- **用户留存率**: ≥80% (30天)
- **月活跃用户**: 目标增长20%
- **客户满意度**: ≥4.5/5.0

## 安全与合规

### 数据安全
- 个人信息脱敏处理
- 数据传输TLS加密
- 数据库访问权限控制
- 定期安全审计

### 合规要求
- 只采集主动公开信息
- 不绕过登录和验证码
- 遵守数据保护法规
- 提供数据导出功能

## 监控与运维

### 系统监控
- 服务健康检查
- 性能指标监控
- 错误日志追踪
- 资源使用情况

### 业务监控
- 用户行为分析
- 功能使用统计
- 收入数据跟踪
- 客户反馈收集