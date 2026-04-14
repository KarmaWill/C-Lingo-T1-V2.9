#!/bin/bash

# 安装缺失的依赖脚本

echo "🔧 修复空白页面问题..."
echo ""

cd "/Users/maxjellyfish/Desktop/NSK 1.0/local-agent-app"

echo "📦 步骤1: 安装 @emotion/react 和 @emotion/styled..."
npm install @emotion/react @emotion/styled

echo ""
echo "🧹 步骤2: 清除Vite缓存..."
rm -rf node_modules/.vite

echo ""
echo "✅ 完成！现在运行: npm run dev"
echo ""

