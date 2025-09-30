# PolicyPulse Docker 上线 10 步检查清单

## 🎯 目标
在30分钟内完成 PolicyPulse SaaS 平台的完整部署，确保所有服务正常运行。

## ✅ 部署前检查清单

### 第1步：系统环境检查 (2分钟)
- [ ] 操作系统：Linux Ubuntu 20.04+ / CentOS 7+
- [ ] Docker 版本：24.0+
- [ ] Docker Compose 版本：2.0+
- [ ] 内存：最少 4GB RAM (推荐 8GB+)
- [ ] 存储：最少 20GB 可用空间
- [ ] 网络：稳定的互联网连接

```bash
# 检查 Docker
docker --version
docker-compose --version

# 检查系统资源
free -h
df -h
```

### 第2步：域名和SSL准备 (3分钟)
- [ ] 已注册域名 (如: policypulse.com)
- [ ] DNS A记录指向服务器IP
- [ ] SSL证书文件准备 (可选)
- [ ] 服务器防火墙配置完成

```bash
# 检查域名解析
dig your-domain.com

# 检查端口开放
netstat -tuln
```

### 第3步：代码获取和权限设置 (2分钟)
- [ ] 从 GitHub 获取最新代码
- [ ] 设置正确的文件权限
- [ ] 创建必要的目录结构

```bash
# 克隆代码
git clone https://github.com/your-org/policypulse.git
cd policypulse

# 设置权限
chmod +x scripts/*.sh
sudo chown -R $USER:$USER .
```

## 🔧 环境配置检查清单

### 第4步：环境变量配置 (5分钟)
- [ ] 复制环境变量模板
- [ ] 配置数据库连接信息
- [ ] 配置AI服务API密钥
- [ ] 配置邮件服务参数
- [ ] 配置支付相关参数

```bash
# 复制环境文件
cp .env.example .env

# 编辑配置文件
vim .env
```

**关键配置项检查：**
```env
# 必须配置
SECRET_KEY=your-32-char-secret-key-here
OPENAI_API_KEY=sk-your-openai-key
MONGODB_URL=mongodb://admin:password@mongo:27017/policypulse?authSource=admin
REDIS_URL=redis://redis:6379

# 邮件服务 (用于验证码)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com

# 微信支付 (可选)
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_KEY=your-api-key
```

### 第5步：Docker环境准备 (3分钟)
- [ ] 拉取基础镜像
- [ ] 构建自定义镜像
- [ ] 检查镜像构建结果

```bash
# 拉取基础镜像
docker pull mongo:7.0
docker pull redis:7.2-alpine
docker pull nginx:1.25-alpine

# 构建应用镜像
docker-compose build

# 检查镜像
docker images | grep policypulse
```

## 🚀 服务部署检查清单

### 第6步：启动核心服务 (5分钟)
- [ ] 启动数据库服务
- [ ] 启动Redis服务
- [ ] 等待数据库初始化
- [ ] 检查服务健康状态

```bash
# 启动数据库服务
docker-compose up -d mongo redis

# 等待服务就绪
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
docker-compose exec redis redis-cli ping
```

### 第7步：启动应用服务 (5分钟)
- [ ] 启动后端API服务
- [ ] 启动Celery任务处理
- [ ] 启动前端服务
- [ ] 启动Nginx反向代理

```bash
# 启动所有服务
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

## 🔍 功能验证检查清单

### 第8步：核心功能测试 (3分钟)
- [ ] 访问首页
- [ ] 测试用户注册
- [ ] 测试用户登录
- [ ] 检查API文档

```bash
# 测试应用访问
curl -f http://localhost
curl -f http://localhost/health
curl -f http://localhost/docs

# 测试数据库连接
docker-compose exec api python -c "from app.database.mongodb import mongodb; import asyncio; asyncio.run(mongodb.connect())"
```

### 第9步：数据采集验证 (2分钟)
- [ ] 检查采集任务状态
- [ ] 验证数据清洗功能
- [ ] 测试推送服务

```bash
# 检查Celery任务
docker-compose exec worker celery -A workers.celery_app status

# 测试数据采集
docker-compose exec worker python -c "from workers.tasks.crawl_tasks import test_crawl; test_crawl.delay()"
```

## 📊 监控和优化检查清单

### 第10步：监控和性能优化 (5分钟)
- [ ] 配置监控告警
- [ ] 设置日志轮转
- [ ] 优化数据库索引
- [ ] 配置备份策略
- [ ] 性能压力测试

```bash
# 检查资源使用
docker stats

# 检查日志
docker-compose logs --tail=100 api
docker-compose logs --tail=100 worker

# 数据库性能检查
docker-compose exec mongo mongosh --eval "db.stats()"
```

## 🎉 部署成功验证

### ✅ 最终检查清单
- [ ] 所有容器正常运行
- [ ] 用户注册/登录功能正常
- [ ] 数据采集和清洗正常
- [ ] 推送服务工作正常
- [ ] 支付功能可用
- [ ] 管理后台可访问

### 📱 访问测试
```bash
# 应用访问
curl -I http://your-domain.com

# API测试
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"测试用户","password":"Test123456","verification_code":"123456"}'

# 健康检查
curl http://your-domain.com/health
```

## 🚨 常见问题解决

### 问题1：容器启动失败
```bash
# 检查日志
docker-compose logs [service-name]

# 重新构建
docker-compose build --no-cache [service-name]

# 重新启动
docker-compose restart [service-name]
```

### 问题2：数据库连接失败
```bash
# 检查网络
docker network ls
docker network inspect policypulse-network

# 检查端口
netstat -tuln | grep 27017

# 重启数据库
docker-compose restart mongo
```

### 问题3：性能问题
```bash
# 查看资源使用
docker stats

# 优化数据库
docker-compose exec mongo mongosh --eval "db.runCommand({compact: 'users'})"

# 清理缓存
docker-compose exec redis redis-cli FLUSHALL
```

## 📋 部署后任务

### 1. 安全配置
- [ ] 修改默认密码
- [ ] 配置防火墙规则
- [ ] 设置SSL证书
- [ ] 配置监控告警

### 2. 数据初始化
- [ ] 导入政府树形数据
- [ ] 配置采集站点
- [ ] 设置推送模板
- [ ] 创建管理员账户

### 3. 监控配置
- [ ] 配置Prometheus监控
- [ ] 设置Grafana面板
- [ ] 配置日志收集
- [ ] 设置告警规则

### 4. 备份策略
- [ ] 数据库自动备份
- [ ] 配置文件备份
- [ ] 日志归档策略
- [ ] 灾难恢复测试

## 🎯 性能基准

### 目标性能指标
- **系统可用性**: 99.9%
- **API响应时间**: <200ms
- **页面加载时间**: <1.5s
- **数据采集延迟**: <5分钟
- **推送成功率**: >98%

### 扩展性指标
- **并发用户**: 1000+
- **数据处理能力**: 10万条/天
- **存储容量**: 1TB+
- **带宽需求**: 100Mbps+

## 📞 技术支持

### 紧急联系
- **技术支持**: support@policypulse.com
- **紧急热线**: +86-400-123-4567
- **文档中心**: https://docs.policypulse.com
- **社区论坛**: https://community.policypulse.com

### 日志查看
```bash
# 应用日志
docker-compose logs -f api

# 任务日志
docker-compose logs -f worker

# 系统日志
journalctl -f -u docker
```

---

**部署完成时间**: ⏱️ 30分钟
**验证完成时间**: ⏱️ 15分钟
**总计时间**: ⏱️ 45分钟

🎉 **恭喜！PolicyPulse 平台部署完成！**