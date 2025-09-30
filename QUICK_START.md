# PolicyPulse 快速启动指南

## 🚀 30分钟完成部署

本指南将帮助您在30分钟内完成PolicyPulse SaaS平台的完整部署。

## 📋 部署前准备

### 系统要求
- **操作系统**: Linux Ubuntu 20.04+ / macOS 10.15+ / Windows 10+
- **内存**: 最少4GB RAM (推荐8GB+)
- **存储**: 最少20GB可用空间
- **网络**: 稳定的互联网连接

### 软件依赖
- **Docker**: 24.0+
- **Docker Compose**: 2.0+
- **Git**: 2.20+

## 🔧 一键部署

### 步骤1: 获取代码 (2分钟)
```bash
# 克隆项目代码
git clone https://github.com/your-org/policypulse.git
cd policypulse

# 检查项目结构
ls -la
```

### 步骤2: 环境初始化 (3分钟)
```bash
# 运行初始化脚本
./scripts/setup.sh

# 脚本会自动完成以下操作：
# - 检查系统依赖
# - 创建必要目录
# - 生成配置文件模板
# - 设置文件权限
```

### 步骤3: 配置环境变量 (5分钟)
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件 (必须填写以下关键配置)
vim .env
```

**关键配置项：**
```env
# 安全密钥 (必须修改)
SECRET_KEY=your-32-character-secret-key-here

# OpenAI API密钥 (必须填写)
OPENAI_API_KEY=sk-your-openai-api-key

# 数据库配置 (默认即可，生产环境需修改)
MONGODB_URL=mongodb://admin:password@mongo:27017/policypulse?authSource=admin
REDIS_URL=redis://redis:6379

# 邮件服务配置 (用于验证码)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com
```

### 步骤4: 启动服务 (15分钟)
```bash
# 启动所有服务
./scripts/deploy.sh production

# 或者使用Docker Compose直接启动
docker-compose up -d
```

### 步骤5: 验证部署 (5分钟)
```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f api

# 测试API接口
curl http://localhost/health

# 访问应用
open http://localhost
```

## ✅ 部署验证清单

### 服务状态检查
```bash
# 应该看到以下运行中的容器
CONTAINER ID   IMAGE                    STATUS          PORTS
policypulse-nginx      running         0.0.0.0:80->80/tcp
policypulse-frontend   running         0.0.0.0:3000->3000/tcp
policypulse-api        running         0.0.0.0:8000->8000/tcp
policypulse-worker     running         
policypulse-mongo      running         27017/tcp
policypulse-redis      running         6379/tcp
```

### 功能测试
1. **首页访问**: http://localhost ✅
2. **用户注册**: 点击"免费试用" ✅
3. **API文档**: http://localhost/docs ✅
4. **健康检查**: http://localhost/health ✅

### 数据库连接测试
```bash
# 测试MongoDB连接
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# 测试Redis连接
docker-compose exec redis redis-cli ping
```

## 🎉 部署成功！

### 访问地址
- **主应用**: http://localhost
- **API文档**: http://localhost/docs
- **管理后台**: http://localhost/admin (需管理员权限)
- **健康检查**: http://localhost/health

### 默认账户
- **测试用户**: test@example.com / Test123456
- **管理员**: admin@policypulse.com / Admin123456

## 🔧 常用操作

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service-name]

# 查看资源使用
docker stats
```

### 数据管理
```bash
# 备份数据库
docker-compose exec mongo mongodump --out /backup

# 恢复数据库
docker-compose exec mongo mongorestore /backup

# 清理数据
docker-compose exec redis redis-cli FLUSHALL
```

### 更新部署
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

## 🚨 常见问题解决

### 问题1: 容器启动失败
```bash
# 检查日志
docker-compose logs [service-name]

# 重新构建
docker-compose build --no-cache [service-name]

# 检查端口占用
netstat -tuln | grep [port]
```

### 问题2: 数据库连接失败
```bash
# 检查网络
docker network ls
docker network inspect policypulse-network

# 重启数据库
docker-compose restart mongo redis
```

### 问题3: 性能问题
```bash
# 查看资源使用
docker stats

# 优化数据库
docker-compose exec mongo mongosh --eval "db.runCommand({compact: 'users'})"

# 清理缓存
docker-compose exec redis redis-cli FLUSHALL
```

## 📊 监控和维护

### 健康监控
```bash
# 系统监控
docker-compose ps

# 资源监控
docker stats

# 日志监控
docker-compose logs -f --tail=100
```

### 性能优化
```bash
# 查看API响应时间
docker-compose logs api | grep "200 OK"

# 查看数据库性能
docker-compose exec mongo mongosh --eval "db.stats()"

# 查看Redis性能
docker-compose exec redis redis-cli info stats
```

## 🔄 扩展部署

### 生产环境配置
```bash
# SSL证书配置
mkdir -p nginx/ssl
cp your-certificate.crt nginx/ssl/
cp your-private.key nginx/ssl/

# 环境变量优化
vim .env
# 修改以下配置：
# ENVIRONMENT=production
# DEBUG=false
# WORKERS=4
```

### 负载均衡配置
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

## 📞 技术支持

### 自助排查
1. 查看 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
2. 检查服务日志
3. 验证环境变量配置
4. 测试网络连通性

### 获取帮助
- **文档中心**: https://docs.policypulse.com
- **社区论坛**: https://community.policypulse.com
- **技术支持**: support@policypulse.com

### 紧急联系
- **紧急热线**: +86-400-123-4567
- **微信支持**: PolicyPulse_Support
- **QQ群**: 123456789

## 🎊 下一步操作

### 1. 系统配置
- [ ] 配置管理员账户
- [ ] 设置采集站点
- [ ] 配置推送渠道
- [ ] 设置付费套餐

### 2. 用户管理
- [ ] 创建测试用户
- [ ] 配置用户权限
- [ ] 设置订阅计划
- [ ] 配置推送偏好

### 3. 数据初始化
- [ ] 导入政府数据
- [ ] 配置采集规则
- [ ] 启动采集任务
- [ ] 验证数据质量

### 4. 运营准备
- [ ] 配置支付系统
- [ ] 设置营销页面
- [ ] 配置监控系统
- [ ] 制定运营策略

## 🏆 最佳实践

### 安全配置
- 定期更换SECRET_KEY
- 使用强密码策略
- 配置HTTPS访问
- 定期安全审计

### 性能优化
- 启用Gzip压缩
- 配置CDN加速
- 优化数据库索引
- 使用缓存策略

### 监控告警
- 设置资源阈值
- 配置日志告警
- 监控服务健康
- 定期性能测试

---

**恭喜！您已成功部署PolicyPulse智能政策分析平台！**

🎉 **开始享受AI驱动的政策智能分析服务吧！**