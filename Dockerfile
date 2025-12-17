# 使用符合 npm@11.3.0 要求的 Node.js 版本的多阶段构建
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 全局安装指定版本的 npm
RUN npm install -g npm@11.3.0

# 安装生产依赖（跳过prepare脚本，避免安装devDependencies）
RUN npm install --omit=dev --ignore-scripts

# 第二阶段构建 - 只复制必要文件
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 node_modules
COPY --from=builder /app/node_modules ./node_modules

# 复制项目文件 (添加 .dockerignore 文件来排除不必要的文件)
COPY . .

# 创建必要的目录
RUN mkdir -p logs /tmp/wechat-proxy-uploads

# 使用非root用户运行
RUN chown -R node:node /app
USER node

# 暴露端口
EXPOSE 3000

# 健康检查 - 增加超时时间和开始周期，适应CI环境
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "server.js"]
