#!/bin/bash

# Steam Tier List Maker 项目初始化脚本

echo "🎮 Steam Tier List Maker - 项目初始化"
echo "======================================"

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js (https://nodejs.org/)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 创建项目目录结构
echo ""
echo "📁 创建项目目录结构..."
mkdir -p public
mkdir -p src/components
mkdir -p src/contexts
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/styles

echo "✅ 目录结构创建完成"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

echo ""
echo "📦 安装开发依赖..."
npm install -D tailwindcss autoprefixer postcss

# 初始化Tailwind CSS
echo ""
echo "🎨 初始化Tailwind CSS..."
npx tailwindcss init -p

echo ""
echo "======================================"
echo "✅ 项目初始化完成！"
echo ""
echo "可用的命令:"
echo "  npm start    - 启动开发服务器 (http://localhost:3000)"
echo "  npm run build - 构建生产版本"
echo "  npm test     - 运行测试"
echo ""
echo "部署到Netlify:"
echo "  1. 将代码推送到GitHub"
echo "  2. 在Netlify中导入GitHub仓库"
echo "  3. 构建命令: npm run build"
echo "  4. 发布目录: build"
echo ""
echo "🚀 运行 'npm start' 开始开发！"