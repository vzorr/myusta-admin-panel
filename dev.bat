@echo off
cls
echo.
echo ===============================================
echo 🚀 MYUSTA ADMIN PANEL DEVELOPMENT SERVER
echo ===============================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found! 
    echo 📝 Copying from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ .env file created from .env.example
    ) else (
        echo ❌ .env.example not found! Please create .env file manually.
        pause
        exit /b 1
    )
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    echo.
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
)

REM Clear any existing cache
echo 🧹 Clearing development cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
if exist ".eslintcache" del ".eslintcache" 2>nul
echo ✅ Cache cleared!
echo.

REM Check if Tailwind config is in the right place
if exist "src\tailwind.config.js" (
    echo 📝 Moving Tailwind config to project root...
    move "src\tailwind.config.js" "tailwind.config.js" >nul 2>&1
)

if exist "src\postcss.config.js" (
    echo 📝 Moving PostCSS config to project root...
    move "src\postcss.config.js" "postcss.config.js" >nul 2>&1
)

echo ===============================================
echo 🔥 STARTING DEVELOPMENT SERVER
echo ===============================================
echo.
echo 🌐 The app will open at: http://localhost:3000
echo 🛠️  Hot reload is enabled
echo 🎨 Tailwind CSS is configured
echo 📱 Mobile-friendly responsive design
echo.
echo Press Ctrl+C to stop the server
echo.

REM Set environment variables for optimal development
set NODE_ENV=development
set FAST_REFRESH=true
set CHOKIDAR_USEPOLLING=true
set CHOKIDAR_INTERVAL=1000
set WDS_SOCKET_PORT=0
set GENERATE_SOURCEMAP=true
set REACT_APP_DEBUG=true
set BROWSER=none
set ESLINT_NO_DEV_ERRORS=true

REM Start the development server
npm run dev:windows

REM If the server stops, show a message
echo.
echo ===============================================
echo 🛑 DEVELOPMENT SERVER STOPPED
echo ===============================================
echo.
echo To restart, run: npm start or dev.bat
echo.
pause