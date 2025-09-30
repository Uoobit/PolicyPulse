# PolicyPulse 完整部署指南

## 🎯 部署概述

本指南将帮助您完成PolicyPulse SaaS平台的完整部署，包括环境准备、代码部署、配置设置、服务启动和验证测试。

## 📋 部署清单

### 环境准备
- [ ] 服务器环境 (Linux Ubuntu 20.04+)
- [ ] Docker 24.0+ 和 Docker Compose 2.0+
- [ ] 域名和SSL证书 (生产环境)
- [ ] 最小4GB RAM, 20GB存储空间

### 代码和配置
- [ ] 获取项目代码
- [ ] 配置环境变量
- [ ] 设置文件权限
- [ ] 初始化数据库

### 服务部署
- [ ] 构建Docker镜像
- [ ] 启动核心服务
- [ ] 配置反向代理
- [ ] 设置SSL证书

### 验证测试
- [ ] 服务健康检查
- [ ] 功能测试
- [ ] 性能测试
- [ ] 安全测试

## 🔧 详细部署步骤

### 步骤1: 环境准备 (10分钟)

#### 1.1 系统更新
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git vim net-tools
```

#### 1.2 安装Docker
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 1.3 配置防火墙
```bash
# 配置UFW防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 步骤2: 代码部署 (5分钟)

#### 2.1 获取项目代码
```bash
# 克隆项目
git clone https://github.com/your-org/policypulse.git
cd policypulse

# 检查项目结构
ls -la
```

#### 2.2 设置文件权限
```bash
# 设置脚本权限
chmod +x scripts/*.sh

# 设置目录权限
sudo chown -R $USER:$USER .
```

### 步骤3: 环境配置 (10分钟)

#### 3.1 复制环境变量模板
```bash
# 复制环境变量文件
cp .env.example .env
```

#### 3.2 编辑配置文件
```bash
# 编辑环境变量
vim .env
```

**关键配置项：**
```env
# 必须配置的安全密钥
SECRET_KEY=your-32-character-secret-key-change-this-in-production

# OpenAI API密钥 (必须)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 邮件服务配置 (用于验证码)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com

# 微信支付配置 (可选)
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_KEY=your-api-key
```

#### 3.3 创建必要目录
```bash
# 创建日志和数据目录
mkdir -p backend/logs
mkdir -p nginx/logs
mkdir -p nginx/ssl
```

### 步骤4: 服务部署 (15分钟)

#### 4.1 构建Docker镜像
```bash
# 构建所有镜像
docker-compose build

# 或者分别构建
docker-compose build backend
docker-compose build frontend
```

#### 4.2 启动核心服务
```bash
# 先启动数据库服务
docker-compose up -d mongo redis

# 等待数据库就绪
sleep 30

# 启动应用服务
docker-compose up -d
```

#### 4.3 验证服务状态
```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 步骤5: SSL证书配置 (生产环境)

#### 5.1 使用Let's Encrypt
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
echo "0 12 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

#### 5.2 手动配置证书
```bash
# 复制证书文件到nginx目录
cp your-certificate.crt nginx/ssl/
cp your-private.key nginx/ssl/

# 重启nginx服务
docker-compose restart nginx
```

## 🔍 部署验证

### 健康检查
```bash
# API健康检查
curl http://localhost/health

# 前端访问测试
curl -I http://localhost

# 数据库连接测试
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
docker-compose exec redis redis-cli ping
```

### 功能测试
```bash
# 用户注册测试
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "测试用户",
    "password": "Test123456",
    "verification_code": "123456"
  }'

# 用户登录测试
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

## 🚀 生产环境优化

### 性能优化
```bash
# 优化数据库
docker-compose exec mongo mongosh --eval "
db.runCommand({compact: 'users'});
db.runCommand({compact: 'raw_pages'});
"

# 清理缓存
docker-compose exec redis redis-cli FLUSHALL

# 优化Nginx配置
# 编辑 nginx/nginx.conf 调整worker_processes和连接数
```

### 安全配置
```bash
# 设置文件权限
chmod 600 .env
chmod 600 nginx/ssl/*

# 配置防火墙
sudo ufw deny 3000  # 关闭前端端口
sudo ufw deny 8000  # 关闭API端口
sudo ufw deny 27017 # 关闭MongoDB端口
sudo ufw deny 6379  # 关闭Redis端口
```

## 📊 监控和维护

### 系统监控
```bash
# 查看系统资源
docker stats

# 查看容器日志
docker-compose logs -f --tail=100

# 查看磁盘使用
df -h
docker system df
```

### 数据备份
```bash
# 数据库备份
./scripts/backup.sh

# 手动备份MongoDB
docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env docker-compose.yml nginx/
```

## 🚨 故障排查

### 常见问题解决

#### 1. 容器启动失败
```bash
# 检查日志
docker-compose logs [service-name]

# 重新构建
docker-compose build --no-cache [service-name]

# 检查端口占用
netstat -tuln | grep [port]
```

#### 2. 数据库连接失败
```bash
# 检查网络
docker network ls
docker network inspect policypulse-network

# 检查容器状态
docker-compose ps

# 重启数据库
docker-compose restart mongo redis
```

#### 3. 性能问题
```bash
# 查看资源使用
docker stats

# 清理无用容器
docker container prune -f

# 清理无用镜像
docker image prune -f

# 清理无用卷
docker volume prune -f
```

### 日志分析
```bash
# 查看API错误日志
docker-compose logs api | grep ERROR

# 查看数据库日志
docker-compose logs mongo

# 查看Redis日志
docker-compose logs redis

# 查看Nginx访问日志
docker-compose logs nginx | grep " 200 "
```

## 🔄 更新和维护

### 代码更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 数据迁移
```bash
# 导出数据
docker-compose exec mongo mongodump --out /backup/migration

# 导入数据
docker-compose exec mongo mongorestore /backup/migration
```

### 版本回滚
```bash
# 备份当前版本
docker-compose exec mongo mongodump --out /backup/rollback/$(date +%Y%m%d_%H%M%S)

# 回滚到指定版本
git checkout [version-tag]
docker-compose up -d --force-recreate
```

## 📞 技术支持

### 自助排查
1. 查看 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
2. 检查服务日志
3. 验证环境变量配置
4. 测试网络连通性

### 获取帮助
- **技术文档**: https://docs.policypulse.com
- **社区论坛**: https://community.policypulse.com
- **技术支持**: support@policypulse.com
- **紧急热线**: +86-400-123-4567

## 🎉 部署完成

### 成功验证清单
- [ ] 所有服务正常运行
- [ ] 用户注册/登录功能正常
- [ ] 数据采集和清洗正常
- [ ] 推送服务工作正常
- [ ] 支付功能可用
- [ ] 管理后台可访问

### 访问地址
- **主应用**: https://your-domain.com
- **API文档**: https://your-domain.com/docs
- **管理后台**: https://your-domain.com/admin
- **健康检查**: https://your-domain.com/health

### 默认账户
- **管理员**: admin@policypulse.com / Admin123456
- **测试用户**: test@example.com / Test123456

---

**🎊 恭喜！PolicyPulse SaaS平台部署完成！**

**开始享受AI驱动的政策智能分析服务吧！**