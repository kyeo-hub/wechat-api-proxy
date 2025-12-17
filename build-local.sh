#!/bin/bash

echo "===== 本地构建微信API Docker镜像 ====="
echo

# 设置变量
IMAGE_NAME="wechat-api"
TAG="latest"
REGISTRY="ghcr.io/kyeo-hub/wechat-api-proxy"

# 检查Docker是否运行
echo "1. 检查Docker环境:"
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行或无法访问"
    exit 1
fi
echo "Docker环境正常"
echo

# 构建镜像
echo "2. 构建Docker镜像:"
docker build -t ${IMAGE_NAME}:${TAG} .
if [ $? -eq 0 ]; then
    echo "镜像构建成功: ${IMAGE_NAME}:${TAG}"
else
    echo "错误: 镜像构建失败"
    exit 1
fi
echo

# 显示镜像信息
echo "3. 镜像信息:"
docker images | grep ${IMAGE_NAME}
echo

# 询问是否推送到GitHub Registry
read -p "是否推送到GitHub Registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "4. 推送镜像到GitHub Registry:"
    
    # 标记镜像
    docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}:${TAG}
    
    # 推送镜像
    echo "请先确保已登录GitHub Registry:"
    echo "docker login ghcr.io -u YOUR_USERNAME"
    read -p "按Enter继续推送..."
    
    docker push ${REGISTRY}:${TAG}
    
    if [ $? -eq 0 ]; then
        echo "镜像推送成功: ${REGISTRY}:${TAG}"
    else
        echo "错误: 镜像推送失败"
    fi
fi

echo
echo "===== 构建完成 ====="