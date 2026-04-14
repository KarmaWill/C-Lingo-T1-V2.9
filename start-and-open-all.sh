#!/bin/bash

# NSK Horizon OS - 启动所有服务器并打开浏览器
# 此脚本会同时启动所有分辨率版本的开发服务器，然后打开浏览器标签页

echo "🚀 NSK Horizon OS - 启动所有分辨率版本"
echo "=========================================="
echo ""

# 检查是否安装了 concurrently
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: 未找到 npx，请先安装 Node.js"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📦 正在启动所有开发服务器..."
echo ""

# 使用 concurrently 启动所有服务器（不包括1920-1080，因为它使用不同端口）
# 注意：1920x1125 和 960x540 都使用 3001 端口，所以不能同时运行
# 我们将启动：1024x768, 960x540, 和 1920x1080

# 启动服务器（在后台）
echo "启动 1024x768 (端口 3000)..."
npm run dev > /dev/null 2>&1 &
PID_3000=$!

echo "启动 960x540 (端口 3001)..."
npm run dev:960 > /dev/null 2>&1 &
PID_3001=$!

echo "启动 1920x1080 (端口 3002)..."
npm run dev:1920-1080 > /dev/null 2>&1 &
PID_3002=$!

echo ""
echo "⏳ 等待服务器启动（5秒）..."
sleep 5

# 检查服务器是否启动成功
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 打开浏览器标签页
echo ""
echo "🌐 正在打开浏览器标签页..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if check_port 3000; then
        echo "✅ 打开 1024x768 (localhost:3000)"
        open "http://localhost:3000"
    else
        echo "⚠️  端口 3000 未启动"
    fi
    
    if check_port 3001; then
        echo "✅ 打开 960x540 (localhost:3001)"
        open "http://localhost:3001"
    else
        echo "⚠️  端口 3001 未启动"
    fi
    
    if check_port 3002; then
        echo "✅ 打开 1920x1080 (localhost:3002)"
        open "http://localhost:3002"
    else
        echo "⚠️  端口 3002 未启动"
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if check_port 3000; then
        echo "✅ 打开 1024x768 (localhost:3000)"
        xdg-open "http://localhost:3000"
    else
        echo "⚠️  端口 3000 未启动"
    fi
    
    if check_port 3001; then
        echo "✅ 打开 960x540 (localhost:3001)"
        xdg-open "http://localhost:3001"
    else
        echo "⚠️  端口 3001 未启动"
    fi
    
    if check_port 3002; then
        echo "✅ 打开 1920x1080 (localhost:3002)"
        xdg-open "http://localhost:3002"
    else
        echo "⚠️  端口 3002 未启动"
    fi
    
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    if check_port 3000; then
        echo "✅ 打开 1024x768 (localhost:3000)"
        start "http://localhost:3000"
    else
        echo "⚠️  端口 3000 未启动"
    fi
    
    if check_port 3001; then
        echo "✅ 打开 960x540 (localhost:3001)"
        start "http://localhost:3001"
    else
        echo "⚠️  端口 3001 未启动"
    fi
    
    if check_port 3002; then
        echo "✅ 打开 1920x1080 (localhost:3002)"
        start "http://localhost:3002"
    else
        echo "⚠️  端口 3002 未启动"
    fi
fi

echo ""
echo "=========================================="
echo "✅ 完成！"
echo ""
echo "📋 所有分辨率版本地址："
echo "   • 1024x768:  http://localhost:3000"
echo "   • 960x540:   http://localhost:3001"
echo "   • 1920x1080: http://localhost:3002"
echo ""
echo "💡 提示："
echo "   • 服务器已在后台运行"
echo "   • 要停止服务器，请使用: pkill -f 'vite'"
echo "   • 要查看日志，请分别运行: npm run dev, npm run dev:960, npm run dev:1920-1080"
echo ""
echo "⚠️  注意：1920x1125 版本使用端口 3001，与 960x540 冲突"
echo "   如需测试 1920x1125，请先停止 960x540，然后运行: npm run dev:1920"
