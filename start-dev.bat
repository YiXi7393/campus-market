@echo off
chcp 65001 >nul
title Campus Market Dev Server

pushd "%~dp0"

echo ============================================
echo          Campus Market 开发环境启动
echo ============================================
echo 当前目录: %cd%
echo 前端地址: http://localhost:5173/
echo 后端地址: http://139.159.150.134:8086/
echo ============================================
echo.

if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
)

echo 启动开发服务器...
echo.

npm run dev

popd