@echo off
echo 🚀 Starting Myusta Admin Panel Development Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Set environment variables for Windows
set FAST_REFRESH=true
set CHOKIDAR_USEPOLLING=true
set CHOKIDAR_INTERVAL=1000
set WDS_SOCKET_PORT=0
set GENERATE_SOURCEMAP=true
set REACT_APP_DEBUG=true

echo 🔥 Starting development server with hot reload...
npm run dev:windows