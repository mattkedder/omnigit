@echo off
cd /d "%~dp0"

set PORT=7492
echo Starting OmniGit Backend Server on port %PORT%...
:: Start npm run dev in the background on the custom port
start /B pnpm dev

echo Waiting for Next.js server to compile...
timeout /t 10 /nobreak >nul

echo Opening OmniGit in Chrome App Mode...
start chrome --app=http://localhost:%PORT%

echo.
echo Press any key to safely shut down the server and close this window...
pause >nul

:: Kill the node processes
taskkill /F /IM node.exe >nul 2>&1
