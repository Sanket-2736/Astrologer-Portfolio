@echo off
REM Video Consultation System Startup Script for Windows
REM This script starts both the signaling server and Next.js app

echo.
echo Starting Video Consultation System...
echo.

REM Check if signaling-server directory exists
if not exist "signaling-server" (
    echo Error: signaling-server directory not found
    exit /b 1
)

REM Check if node_modules exists in signaling-server
if not exist "signaling-server\node_modules" (
    echo Installing signaling server dependencies...
    cd signaling-server
    call npm install
    cd ..
)

REM Start signaling server in background
echo Starting signaling server on port 4000...
start /B cmd /c "cd signaling-server && node index.js"

REM Wait for signaling server to start
timeout /t 3 /nobreak > nul

REM Check if signaling server is running
curl -s http://localhost:4000/room-status?bookingId=test > nul 2>&1
if %errorlevel% equ 0 (
    echo Signaling server is running
) else (
    echo Failed to start signaling server
    taskkill /F /IM node.exe /FI "WINDOWTITLE eq signaling*" > nul 2>&1
    exit /b 1
)

echo.
echo Starting Next.js application...
echo.
echo Note: Press Ctrl+C to stop both servers
echo.

REM Start Next.js (this will run in foreground)
npm run dev

REM Cleanup happens automatically when window closes
