#!/bin/bash

# Caddy初始化脚本
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
    
    if [ -z "$DOMAIN" ]; then
        print_error "DOMAIN环境变量未设置"
        exit 1
    fi
    
    print_message "环境变量检查通过"
}

# 创建必要的目录
create_directories() {
    print_message "创建必要的目录..."
    
    mkdir -p caddy/data
    mkdir -p caddy/config
    mkdir -p caddy/site
    mkdir -p logs/caddy
    
    print_message "目录创建完成"
}

# 生成Caddyfile
generate_caddyfile() {
    print_message "生成Caddyfile..."
    
    # 替换域名占位符
    sed "s/your-domain.com/$DOMAIN/g" caddy/Caddyfile.template > caddy/Caddyfile
    
    print_message "Caddyfile生成完成"
}

# 设置权限
set_permissions() {
    print_message "设置目录权限..."
    
    chmod -R 755 caddy/
    chown -R 1000:1000 caddy/
    
    print_message "权限设置完成"
}

# 主函数
main() {
    print_message "初始化Caddy配置..."
    
    # 解析命令行参数
    case "$1" in
        "init")
            check_env_vars
            create_directories
            generate_caddyfile
            set_permissions
            print_message "Caddy初始化完成!"
            ;;
        "cert")
            print_message "手动触发证书获取..."
            docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
            ;;
        *)
            echo "用法: $0 {init|cert}"
            echo "  init - 初始化Caddy配置"
            echo "  cert - 手动触发证书获取"
            exit 1
            ;;
    esac
}

# 如果脚本被直接调用，执行主函数
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi