@echo off
echo 正在启动樱道API接口平台...
echo.

:: 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo [错误] 未检测到Node.js，请先安装Node.js
  echo 请访问 https://nodejs.org/ 下载并安装
  pause
  exit /b
)

:: 检查npm是否已安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
  echo [错误] 未检测到npm，请检查Node.js安装
  pause
  exit /b
)

:: 检查是否需要安装依赖
if not exist node_modules (
  echo 首次运行，正在安装依赖...
  npm install
  if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b
  )
)

:: 启动开发服务器
echo 正在启动开发服务器...
echo 请访问 http://localhost:3000 查看项目
npm run dev

pause 