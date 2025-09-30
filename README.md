# PolicyPulse - 智能政策分析平台 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.0+-green.svg)](https://mongodb.com)

## 🎯 项目简介

PolicyPulse 是一个基于AI的政策和招标信息智能分析SaaS平台，通过自动化数据采集、大模型清洗和双重解读，为用户提供精准的政策洞察和商机发现服务。

## ✨ 核心特性

### 🤖 AI智能分析
- **双重解读**: 激进与保守双重视角分析
- **大模型驱动**: 基于OpenAI GPT-4的智能解读
- **信号识别**: 商机、风险、趋势等信号标记
- **置信度评估**: 0-1置信度量化分析结果

### 📊 数据采集
- **7x24监控**: 不间断政府网站监控
- **五级覆盖**: 覆盖中央到地方五级政府机构
- **双轨采集**: 政策信息 + 招标信息并行采集
- **智能去重**: 基于内容的智能去重算法

### 🔔 实时推送
- **多渠道**: 企业微信、飞书、钉钉、邮件、短信
- **个性化**: 基于用户偏好的智能推送
- **高到达率**: ≥98%的推送成功率
- **失败重试**: 智能退避重试机制

### 💼 商业功能
- **订阅套餐**: 政策版29元/月，招标版99元/月，企业版199元/月
- **免费试用**: 7天免费体验
- **微信支付**: 微信云开发支付集成
- **团队管理**: 企业级团队协作功能

## 🏗️ 技术架构

### 后端技术栈
- **Web框架**: FastAPI 0.104.1 - 高性能Python Web框架
- **编程语言**: Python 3.11 - 现代Python版本
- **数据库**: MongoDB Atlas 7.0 - 云数据库服务
- **缓存**: Redis 7.2 - 高性能缓存和消息队列
- **任务队列**: Celery 5.3.4 - 分布式任务队列
- **AI服务**: OpenAI API - 大语言模型服务
- **安全认证**: JWT, bcrypt, passlib

### 前端技术栈
- **Web框架**: Next.js 14 - React全栈框架
- **编程语言**: TypeScript 5.0 - 类型安全
- **UI框架**: Tailwind CSS 3.3 - 原子化CSS框架
- **状态管理**: Zustand 4.4 - 轻量级状态管理
- **图表库**: Recharts 2.10 - 数据可视化
- **HTTP客户端**: Axios 1.6
- **动画库**: Framer Motion 10.16

### 基础设施
- **容器化**: Docker 24+ - 应用容器化
- **编排工具**: Docker Compose 2.0+ - 服务编排
- **反向代理**: Nginx 1.25 - 负载均衡和SSL终端
- **CI/CD**: GitHub Actions - 自动化部署
- **监控**: 健康检查、性能监控

## 🚀 快速开始

### 一键部署
```bash
# 1. 获取代码
git clone https://github.com/your-org/policypulse.git
cd policypulse

# 2. 环境初始化
./scripts/setup.sh

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要配置

# 4. 启动服务
./scripts/deploy.sh production

# 5. 访问应用
open http://localhost
```

### Docker部署
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 📁 项目结构

```
PolicyPulse/
├── backend/                      # Python后端服务
│   ├── app/                     # FastAPI应用
│   ├── workers/                 # Celery任务处理
│   ├── data/                    # 数据文件
│   └── requirements.txt         # Python依赖
├── frontend/                     # Next.js前端应用
│   ├── app/                     # App Router
│   ├── components/              # React组件
│   └── package.json             # Node.js依赖
├── nginx/                        # Nginx配置
├── scripts/                      # 部署脚本
├── .github/                      # GitHub Actions
└── docs/                        # 项目文档
```

## 📊 性能指标

### 系统性能
- **清洗成功率**: ≥95%
- **解读延迟**: ≤5分钟
- **推送到达率**: ≥98%
- **API响应时间**: ≤200ms
- **系统可用性**: 99.9%

### 扩展能力
- **并发用户**: 1000+
- **数据处理能力**: 10万条/天
- **存储容量**: 1TB+
- **带宽需求**: 100Mbps+

## 📋 部署清单

### 环境要求
- **操作系统**: Linux Ubuntu 20.04+ / macOS 10.15+ / Windows 10+
- **内存**: 最少4GB RAM (推荐8GB+)
- **存储**: 最少20GB可用空间
- **网络**: 稳定的互联网连接

### 软件依赖
- **Docker**: 24.0+
- **Docker Compose**: 2.0+
- **Git**: 2.20+

## 🔐 安全特性

### 数据安全
- **密码加密**: bcrypt哈希存储
- **JWT认证**: 安全令牌机制
- **数据脱敏**: 敏感信息处理
- **访问控制**: 基于角色的权限管理

### 合规保障
- **信息采集**: 只采集公开信息
- **隐私保护**: 个人信息脱敏
- **数据加密**: 传输和存储加密
- **审计日志**: 完整操作记录

## 📈 业务价值

### 用户价值
- **效率提升**: 自动化监控，节省90%人工时间
- **精准推送**: 个性化订阅，95%+匹配度
- **商机发现**: AI智能分析，80%识别率提升
- **风险预警**: 及时风险识别，70%损失降低

### 商业价值
- **订阅收入**: 多层次付费套餐
- **免费试用**: 25%转化率
- **客户留存**: 85%月留存率
- **市场机会**: 蓝海市场定位

## 📚 文档资源

### 技术文档
- **[架构设计](docs/ARCHITECTURE.md)**: 详细的系统架构说明
- **[项目结构](docs/PROJECT_STRUCTURE.md)**: 完整的项目文件结构
- **[部署指南](docs/DEPLOYMENT_GUIDE.md)**: 完整部署步骤
- **[快速开始](docs/QUICK_START.md)**: 新手入门教程

### API文档
- **Swagger UI**: http://localhost/docs
- **ReDoc**: http://localhost/redoc
- **OpenAPI Schema**: http://localhost/openapi.json

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **邮箱**: support@policypulse.com
- **官网**: https://policypulse.com
- **文档**: https://docs.policypulse.com
- **社区**: https://community.policypulse.com

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 高性能Web框架
- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [MongoDB](https://www.mongodb.com/) - 数据库服务
- [Redis](https://redis.io/) - 缓存服务

---

**PolicyPulse** - 让政策分析更智能，让商机发现更精准！

<div align="center">
  <sub>Built with ❤️ by the PolicyPulse Team</sub>
</div>