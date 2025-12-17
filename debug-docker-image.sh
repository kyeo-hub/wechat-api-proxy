#!/bin/bash

echo "===== 微信API Docker镜像调试脚本 ====="
echo

# 检查当前Docker环境
echo "1. 检查Docker环境:"
docker --version
docker-compose --version
echo

# 检查本地镜像
echo "2. 检查本地镜像:"
docker images | grep wechat
echo

# 拉取最新的GitHub镜像
echo "3. 拉取最新的GitHub镜像:"
docker pull ghcr.io/kyeo-hub/wechat-api-proxy:main
echo

# 检查镜像层
echo "4. 检查镜像层:"
docker history ghcr.io/kyeo-hub/wechat-api-proxy:main
echo

# 检查镜像配置
echo "5. 检查镜像配置:"
docker inspect ghcr.io/kyeo-hub/wechat-api-proxy:main | jq '.[0].Config'
echo

# 尝试运行容器并检查日志
echo "6. 运行容器并检查日志:"
docker stop wechat-api-debug 2>/dev/null || true
docker rm wechat-api-debug 2>/dev/null || true

docker run -d --name wechat-api-debug \
  -e NODE_ENV=production \
  -e LOG_LEVEL=debug \
  -p 3001:3000 \
  ghcr.io/kyeo-hub/wechat-api-proxy:main

echo "等待容器启动..."
sleep 10

echo "容器状态:"
docker ps -a | grep wechat-api-debug

echo
echo "容器日志:"
docker logs wechat-api-debug

# 手动执行健康检查
echo
echo "7. 手动执行健康检查:"
docker exec wechat-api-debug node healthcheck.js
echo $?

echo
echo "===== 调试完成 ====="
echo
echo "如果容器已退出，你可以使用以下命令查看完整日志:"
echo "docker logs wechat-api-debug"
echo
echo "如果需要进入容器调试，可以使用:"
echo "docker exec -it wechat-api-debug sh"