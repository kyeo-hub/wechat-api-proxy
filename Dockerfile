# 使用 Node.js 22 Alpine 版本进行构建
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 全局安装指定版本的 npm
RUN npm install -g npm@11.3.0

# 安装生产依赖，并清理缓存
RUN npm install --only=production --ignore-scripts && \
    npm cache clean --force

# 生产环境镜像
FROM node:22-alpine AS production

# 只安装运行时必需的包
RUN apk add --no-cache dumb-init

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 node_modules
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=node:node . .

# 创建必要的目录
RUN mkdir -p logs /tmp/wechat-proxy-uploads && \
    chown -R node:node /app

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# 使用 dumb-init 作为 PID 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
