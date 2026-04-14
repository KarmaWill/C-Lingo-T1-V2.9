#!/bin/bash

# NSK Horizon OS - 打开所有分辨率版本
# 此脚本会同时打开所有分辨率版本的浏览器标签页

echo "🚀 正在打开所有分辨率版本..."
echo ""

# 检测操作系统并打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📱 打开 1024x768 (localhost:3000)..."
    open "http://localhost:3000" 2>/dev/null || echo "⚠️  端口 3000 可能未启动"
    
    echo "📱 打开 2000x1200 (localhost:3001)..."
    open "http://localhost:3001" 2>/dev/null || echo "⚠️  端口 3001 可能未启动"
    
    echo "📱 打开 1920x1080 (localhost:3002)..."
    open "http://localhost:3002" 2>/dev/null || echo "⚠️  端口 3002 可能未启动"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "📱 打开 1024x768 (localhost:3000)..."
    xdg-open "http://localhost:3000" 2>/dev/null || echo "⚠️  端口 3000 可能未启动"
    
    echo "📱 打开 960x540 (localhost:3001)..."
    xdg-open "http://localhost:3001" 2>/dev/null || echo "⚠️  端口 3001 可能未启动"
    
    echo "📱 打开 1920x1080 (localhost:3002)..."
    xdg-open "http://localhost:3002" 2>/dev/null || echo "⚠️  端口 3002 可能未启动"
    
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "📱 打开 1024x768 (localhost:3000)..."
    start "http://localhost:3000" 2>/dev/null || echo "⚠️  端口 3000 可能未启动"
    
    echo "📱 打开 960x540 (localhost:3001)..."
    start "http://localhost:3001" 2>/dev/null || echo "⚠️  端口 3001 可能未启动"
    
    echo "📱 打开 1920x1080 (localhost:3002)..."
    start "http://localhost:3002" 2>/dev/null || echo "⚠️  端口 3002 可能未启动"
fi

echo ""
echo "✅ 已完成！"
echo ""
echo "📋 所有分辨率版本地址："
echo "   • 1024x768:  http://localhost:3000"
echo "   • 2000x1200: http://localhost:3001"
echo "   • 960x540:   http://localhost:3001 (需要先运行: npm run dev:960)"
echo "   • 1920x1125: http://localhost:3001 (需要先运行: npm run dev:1920)"
echo "   • 1920x1080: http://localhost:3002"
echo ""
echo "💡 提示：如果某些标签页没有打开，请先启动对应的开发服务器："
echo "   npm run dev          # 启动 1024x768"
echo "   npm run dev:2000     # 启动 2000x1200 (端口 3001)"
echo "   npm run dev:960      # 启动 960x540 (端口 3001)"
echo "   npm run dev:1920     # 启动 1920x1125 (端口 3001)"
echo "   npm run dev:1920-1080 # 启动 1920x1080 (端口 3002)"
echo "   或使用: npm run dev:all  # 同时启动前三个版本"
