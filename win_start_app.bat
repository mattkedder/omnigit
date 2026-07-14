@echo off
cd /d "%~dp0"

set PORT=7492

echo Starting OmniGit on port %PORT%...
echo.

:: Launch pnpm dev in a separate visible window
start "OmniGit Server" cmd /K "set PORT=%PORT% && pnpm dev"

echo Waiting for server to compile (this takes about 30 seconds on first run)...
timeout /t 45 /nobreak >nul

echo Opening OmniGit...

:: Try common Chrome install paths on Windows
set CHROME=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set CHROME="%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set CHROME="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set CHROME="%LocalAppData%\Google\Chrome\Application\chrome.exe"

if defined CHROME (
    start "" %CHROME% --app=http://localhost:%PORT%
) else (
    start "" http://localhost:%PORT%
)

echo.
echo OmniGit is running. Press any key here to shut down the server...
pause >nul

taskkill /F /IM node.exe >nul 2>&1
echo Server stopped. Goodbye!
