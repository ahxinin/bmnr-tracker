# 多阶段构建 - 优化镜像大小
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 从base阶段复制依赖
COPY --from=base /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=nextjs:nodejs . .

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]