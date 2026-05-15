@echo off
echo === Socrates AI Tutor - EXE Builder ===
echo.

cd /d "%~dp0"

REM 1. Build frontend
echo [1/5] Building frontend...
call npx vite build
if errorlevel 1 (echo Frontend build failed! && pause && exit /b 1)

REM 2. Prepare build folder
echo [2/5] Preparing build folder...
if not exist "exe-build" mkdir exe-build
if not exist "exe-build\node_modules" mklink /J "exe-build\node_modules" "%~dp0node_modules" >nul 2>&1
xcopy /E /Y dist exe-build\dist\ >nul

REM 3. Create standalone server
echo [3/5] Creating standalone server...
copy /Y standalone.cjs exe-build\ >nul

REM 4. Verify pkg is installed
echo [4/5] Checking packager...
cd exe-build
call npm list @yao-pkg/pkg >nul 2>&1
if errorlevel 1 (
    echo Installing @yao-pkg/pkg...
    call npm install @yao-pkg/pkg --silent
)

REM 5. Package exe
echo [5/5] Creating socrates-tutor.exe...
call npx @yao-pkg/pkg standalone.cjs --targets node18-win-x64 --output ../socrates-tutor.exe
cd ..

echo.
echo === DONE! ===
echo EXE: %CD%\socrates-tutor.exe
echo.
echo Usage: set DEEPSEEK_API_KEY=sk-xxx ^&^& socrates-tutor.exe
pause