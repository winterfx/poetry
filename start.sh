#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查环境变量文件
check_env() {
    if [ ! -f "./src/service/.env" ]; then
        print_message $RED "错误: .env 文件不存在于 ./src/service/ 目录"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        print_message $RED "错误: 请安装 Python 3"
        exit 1
    fi

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_message $RED "错误: 请安装 Node.js"
        exit 1
    fi

    # 检查虚拟环境
    if [ ! -d ".venv" ]; then
        print_message $YELLOW "创建 Python 虚拟环境..."
        python3 -m venv .venv
    fi
}

# 安装依赖
install_dependencies() {
    print_message $YELLOW "安装 Python 依赖..."
    source .venv/bin/activate
    pip install -r requirements.txt || {
        print_message $RED "Python 依赖安装失败"
        exit 1
    }

    print_message $YELLOW "安装 Node.js 依赖..."
    npm install || {
        print_message $RED "Node.js 依赖安装失败"
        exit 1
    }
}

# 启动后端服务
start_backend() {
    print_message $YELLOW "启动后端服务..."
    npm run flask-dev &
    BACKEND_PID=$!
}

# 启动前端服务
start_frontend() {
    print_message $YELLOW "启动前端服务..."
    npm run dev &
    FRONTEND_PID=$!
}

# 清理进程
cleanup() {
    print_message $YELLOW "正在关闭服务..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# 主函数
main() {
    # 检查环境和依赖
    check_env
    check_dependencies
    install_dependencies

    # 设置清理钩子
    trap cleanup SIGINT SIGTERM

    # 启动服务
    start_backend
    start_frontend

    # 等待更长时间确保服务启动
    sleep 5

    # 检查服务是否成功启动
    if ! curl -s http://127.0.0.1:5328 > /dev/null; then
        if ! ps -p $BACKEND_PID > /dev/null; then
            print_message $RED "后端服务启动失败"
            cleanup
            exit 1
        fi
    fi

    if ! curl -s http://localhost:8080 > /dev/null; then
        if ! ps -p $FRONTEND_PID > /dev/null; then
            print_message $RED "前端服务启动失败"
            cleanup
            exit 1
        fi
    fi

    print_message $GREEN "所有服务启动成功！"
    print_message $GREEN "前端服务运行在: http://localhost:8080"
    print_message $GREEN "后端服务运行在: http://localhost:5328"
    
    # 保持脚本运行
    wait
}

# 运行主函数
main
