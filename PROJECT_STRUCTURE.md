# PolicyPulse 项目文件结构

```
/mnt/okcomputer/output/
├── backend/                          # Python后端服务
│   ├── app/                         # FastAPI应用
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI主应用
│   │   ├── config.py               # 配置文件
│   │   ├── api/                    # API路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # 认证接口
│   │   │   ├── users.py           # 用户管理
│   │   │   ├── policies.py        # 政策相关接口
│   │   │   ├── bids.py            # 招标相关接口
│   │   │   ├── subscriptions.py   # 订阅接口
│   │   │   ├── notifications.py   # 通知接口
│   │   │   └── admin.py           # 管理接口
│   │   ├── models/                 # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── policy.py
│   │   │   ├── bid.py
│   │   │   ├── subscription.py
│   │   │   └── notification.py
│   │   ├── services/               # 业务服务
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── policy_service.py
│   │   │   ├── subscription_service.py
│   │   │   └── notification_service.py
│   │   ├── database/               # 数据库连接
│   │   │   ├── __init__.py
│   │   │   ├── mongodb.py
│   │   │   └── redis.py
│   │   ├── utils/                  # 工具函数
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   ├── validators.py
│   │   │   └── helpers.py
│   │   └── middleware/             # 中间件
│   │       ├── __init__.py
│       │   ├── auth.py
│       │   └── cors.py
│   ├── workers/                    # Celery任务处理
│   │   ├── __init__.py
│   │   ├── celery_app.py          # Celery应用配置
│   │   ├── tasks/                  # 异步任务
│   │   │   ├── __init__.py
│   │   │   ├── crawl_tasks.py     # 采集任务
│   │   │   ├── clean_tasks.py     # 清洗任务
│   │   │   ├── analyze_tasks.py   # 分析任务
│   │   │   └── notification_tasks.py # 通知任务
│   │   └── services/               # 任务服务
│   │       ├── __init__.py
│   │       ├── crawler.py         # 数据采集服务
│   │       ├── cleaner.py         # 数据清洗服务
│   │       ├── analyzer.py        # 智能分析服务
│   │       └── notifier.py        # 通知推送服务
│   ├── data/                       # 数据文件
│   │   ├── gov_tree.json          # 政府树形结构
│   │   ├── sites_custom/          # 自定义站点配置
│   │   │   ├── 10001.yml
│   │   │   └── 10002.yml
│   │   └── templates/             # 模板文件
│   ├── requirements.txt            # Python依赖
│   ├── Dockerfile                  # Docker配置
│   └── .env.example               # 环境变量示例
│
├── frontend/                       # Next.js前端应用
│   ├── app/                        # Next.js 13+ App Router
│   │   ├── layout.tsx             # 根布局
│   │   ├── page.tsx               # 首页
│   │   ├── globals.css            # 全局样式
│   │   ├── login/                 # 登录页面
│   │   │   └── page.tsx
│   │   ├── dashboard/             # 用户仪表盘
│   │   │   ├── page.tsx
│   │   │   ├── policies/          # 政策页面
│   │   │   │   └── page.tsx
│   │   │   ├── bids/              # 招标页面
│   │   │   │   └── page.tsx
│   │   │   └── settings/          # 设置页面
│   │   │       └── page.tsx
│   │   ├── admin/                 # 管理后台
│   │   │   ├── page.tsx
│   │   │   ├── users/             # 用户管理
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/         # 数据分析
│   │   │   │   └── page.tsx
│   │   │   └── system/            # 系统管理
│   │   │       └── page.tsx
│   │   └── api/                   # API路由
│   │       ├── auth/              # 认证API
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── refresh/route.ts
│   │       └── webhook/           # Webhook
│   │           └── [...]/route.ts
│   ├── components/                # React组件
│   │   ├── ui/                    # 基础UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── layout/                # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/                  # 认证组件
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/             # 仪表盘组件
│   │   │   ├── PolicyCard.tsx
│   │   │   ├── BidCard.tsx
│   │   │   ├── InsightPanel.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── admin/                 # 管理组件
│   │   │   ├── UserTable.tsx
│   │   │   ├── AnalyticsChart.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── SystemLogs.tsx
│   │   └── charts/                # 图表组件
│   │       ├── LineChart.tsx
│   │       ├── PieChart.tsx
│   │       ├── BarChart.tsx
│   │       └── DataVisualization.tsx
│   ├── hooks/                     # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── useNotification.ts
│   ├── services/                  # API服务
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── policy.service.ts
│   │   └── notification.service.ts
│   ├── store/                     # 状态管理
│   │   ├── auth.store.ts
│   │   ├── policy.store.ts
│   │   └── ui.store.ts
│   ├── types/                     # TypeScript类型
│   │   ├── auth.ts
│   │   ├── policy.ts
│   │   └── api.ts
│   ├── utils/                     # 工具函数
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── public/                    # 静态资源
│   │   ├── icons/
│   │   ├── images/
│   │   └── manifest.json
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── nginx/                          # Nginx配置
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── default.conf
│   │   └── api.conf
│   └── ssl/
│       ├── policypulse.crt
│       └── policypulse.key
│
├── docker-compose.yml              # Docker编排
├── docker-compose.dev.yml          # 开发环境
├── docker-compose.prod.yml         # 生产环境
├── .github/                        # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── scripts/                        # 部署脚本
│   ├── setup.sh
│   ├── deploy.sh
│   └── backup.sh
├── docs/                          # 项目文档
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── README.md                      # 项目说明
└── .gitignore                     # Git忽略文件
```

## 目录说明

### backend/
Python后端服务，基于FastAPI框架，包含：
- **app/**: FastAPI应用主体，包含API路由、数据模型、业务服务等
- **workers/**: Celery异步任务处理，包含数据采集、清洗、分析等任务
- **data/**: 数据文件，包含政府树形结构、自定义站点配置等

### frontend/
Next.js前端应用，包含：
- **app/**: Next.js 13+ App Router结构
- **components/**: React组件库，按功能分类
- **services/**: API服务层
- **store/**: 状态管理

### nginx/
Nginx配置文件，包含反向代理、负载均衡、SSL配置等

### docker-compose.yml
Docker编排文件，定义所有服务的配置和依赖关系

### scripts/
部署和运维脚本，包含环境初始化、部署、备份等功能

## 技术栈版本

### Backend
- Python 3.11+
- FastAPI 0.104+
- Celery 5.3+
- MongoDB 6.0+
- Redis 7.0+

### Frontend
- Next.js 14+
- TypeScript 5.0+
- Tailwind CSS 3.3+
- React 18+

### Infrastructure
- Docker 24+
- Docker Compose 2.0+
- Nginx 1.25+

## 开发环境要求

### 必需工具
- Docker 和 Docker Compose
- Node.js 18+ 和 npm/yarn
- Python 3.11+ 和 pip
- Git

### 可选工具
- MongoDB Compass (数据库管理)
- Redis Insight (Redis监控)
- Postman (API测试)

## 部署架构

### 开发环境
- 本地Docker容器化部署
- 热重载和实时调试
- 模拟数据和API

### 测试环境
- 云服务器部署
- 真实数据测试
- 性能压力测试

### 生产环境
- 多节点集群部署
- 负载均衡和高可用
- 监控和告警系统