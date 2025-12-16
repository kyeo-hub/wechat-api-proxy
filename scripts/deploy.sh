#!/bin/bash

# 部署脚本
set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env_vars() {
    print_message "检查环境变量..."
    
    if [ -z "$TARGET_HOST" ]; then
        print_error "TARGET_HOST环境变量未设置"
        exit 1
    fi
    
    if [ -z "$TARGET_USER" ]; then
        print_error "TARGET_USER环境变量未设置"
        exit 1
    fi
    
    if [ -z "$IMAGE_TAG" ]; then
        print_error "IMAGE_TAG环境变量未设置"
        exit 1
    fi
    
    print_message "环境变量检查通过"
}

# 备份当前版本
backup_current() {
    print_message "备份当前版本..."
    
    ssh $TARGET_USER@$TARGET_HOST "cd /opt/wechat-api-proxy && \
        docker-compose down && \
        cp docker-compose.yml docker-compose.yml.backup || true"
    
    print_message "备份完成"
}

# 部署新版本
deploy_new() {
    print_message "部署新版本..."
    
    # 更新docker-compose.yml中的镜像标签
    sed -i "s|image: wechat-api-proxy:.*|image: wechat-api-proxy:$IMAGE_TAG|g" docker-compose.yml
    
    # 上传文件到服务器
    scp docker-compose.yml $TARGET_USER@$TARGET_HOST:/opt/wechat-api-proxy/
    
    # 拉取新镜像并启动服务
    ssh $TARGET_USER@$TARGET_HOST "cd /opt/wechat-api-proxy && \
        docker-compose pull && \
        docker-compose up -d"
    
    print_message "部署完成"
}

# 健康检查
health_check() {
    print_message "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查服务是否正常运行
    ssh $TARGET_USER@$TARGET_HOST "cd /opt/wechat-api-proxy && \
        docker-compose ps && \
        curl -f http://localhost:3000 || \
        (docker-compose logs && exit 1)"
    
    print_message "健康检查通过"
}

# 回滚函数
rollback() {
    print_warning "执行回滚..."
    
    ssh $TARGET_USER@$TARGET_HOST "cd /opt/wechat-api-proxy && \
        cp docker-compose.yml.backup docker-compose.yml && \
        docker-compose down && \
        docker-compose up -d"
    
    print_message "回滚完成"
}

# 清理旧镜像
cleanup() {
    print_message "清理旧镜像..."
    
    ssh $TARGET_USER@$TARGET_HOST "docker image prune -f"
    
    print_message "清理完成"
}

# 主函数
main() {
    print_message "开始部署微信API代理服务器..."
    
    # 解析命令行参数
    case "$1" in
        "deploy")
            check_env_vars
            backup_current
            deploy_new
            health_check
            cleanup
            print_message "部署成功!"
            ;;
        "rollback")
            check_env_vars
            rollback
            health_check
            print_message "回滚成功!"
            ;;
        "health")
            check_env_vars
            health_check
            ;;
        *)
            echo "用法: $0 {deploy|rollback|health}"
            echo "  deploy   - 部署新版本"
            echo "  rollback - 回滚到上一版本"
            echo "  health   - 执行健康检查"
            exit 1
            ;;
    esac
}

# 如果脚本被直接调用，执行主函数
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi