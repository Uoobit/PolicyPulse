# 多阶段构建 - Next.js前端应用
FROM node:18-alpine as base

# 设置工作目录
WORKDIR /app

# 安装依赖
RUN apk add --no-cache libc6-compat

# 复制包管理文件
COPY package.json package-lock.json* ./

# 开发环境
FROM base as development

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制应用代码
COPY . .

# 设置开发环境变量
ENV NODE_ENV=development

# 默认命令
CMD ["npm", "run", "dev"]

# 构建环境
FROM base as builder

# 安装所有依赖（包括开发依赖）
RUN npm ci
# 复制应用代码
COPY . .

# 设置生产环境变量
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine as production

# 设置工作目录
WORKDIR /app

# 安装依赖
RUN apk add --no-cache libc6-compat

# 复制包管理文件
COPY package.json package-lock.json* ./

# 安装生产依赖
#RUN npm ci --only=production && npm cache clean --force
RUN npm install

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置权限
RUN chown -R nextjs:nodejs /app
RUN chmod -R 755 /app

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# 默认命令
CMD ["npm", "start"]