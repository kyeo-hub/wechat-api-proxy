# 使用 Node.js 22 Alpine 版本
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 全局安装指定版本的 npm
RUN npm install -g npm@11.3.0

# 安装生产依赖
RUN npm install --only=production

# 复制应用代码
COPY . .

# 创建必要的目录并设置权限
RUN mkdir -p logs /tmp/wechat-proxy-uploads && \
    chown -R node:node /app

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "server.js"]
