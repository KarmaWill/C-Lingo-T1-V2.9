#!/bin/bash

# NSK Horizon OS 本地代理应用启动脚本

echo "🚀 启动 NSK Horizon OS 本地演示..."
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

# 启动开发服务器
echo "✨ 启动开发服务器..."
echo "📱 应用将在 http://localhost:3000 打开"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev

