@echo off
echo === Socrates AI Tutor - EXE Builder ===
echo.

cd /d "%~dp0"

REM 1. Build frontend
echo [1/4] Building frontend...
call npm install --silent
call npx vite build
if errorlevel 1 (echo Frontend build failed! && pause && exit /b 1)

REM 2. Create standalone server
echo [2/4] Creating standalone server...
if not exist "release" mkdir release
copy /Y server\standalone.js release\ >nul 2>&1

REM 3. Install pkg
echo [3/4] Installing packager (first time downloads ~50MB Node.js binary)...
cd release
call npm init -y >nul 2>&1
call npm install express cors @yao-pkg/pkg --silent
xcopy /E /Y ..\dist dist\ >nul

REM 4. Package exe
echo [4/4] Creating socrates-tutor.exe...
call npx pkg standalone.js --targets node18-win-x64 --output socrates-tutor.exe
echo.
echo === DONE! ===
echo EXE location: %CD%\socrates-tutor.exe
echo.
echo To run: set DEEPSEEK_API_KEY=sk-xxx ^&^& socrates-tutor.exe
echo Or double-click to input key interactively.
pause