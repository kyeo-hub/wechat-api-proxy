#!/bin/bash

# 部署脚本 - 使用GHCR镜像

echo "开始部署微信API代理服务..."

# 检查是否存在.env文件，如果不存在则从.env.example复制
if [ ! -f .env ]; then
    echo "警告: .env文件不存在，正在从.env.example创建..."
    cp .env.example .env
    echo "请编辑 .env 文件并设置正确的环境变量，特别是 REDIS_PASSWORD"
    echo "然后重新运行此脚本"
    exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p logs
mkdir -p caddy/site

# 拉取最新镜像
echo "拉取最新镜像..."
docker pull ghcr.io/kyeo-hub/wechat-api-proxy:main

# 停止并删除现有容器
echo "停止现有容器..."
docker-compose -f docker-compose.ghcr.yml down

# 启动服务
echo "启动服务..."
docker-compose -f docker-compose.ghcr.yml up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
docker-compose -f docker-compose.ghcr.yml ps

# 检查健康状态
echo "检查应用健康状态..."
curl -f http://localhost:3000/health || echo "健康检查失败，请检查日志"

echo "部署完成！"
echo "应用已在 http://localhost:3000 上运行"
echo "查看日志: docker-compose -f docker-compose.ghcr.yml logs -f"
echo "停止服务: docker-compose -f docker-compose.ghcr.yml down"