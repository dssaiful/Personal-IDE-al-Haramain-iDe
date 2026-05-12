@echo off
echo ========================================================
echo     Local-AI-IDE "Antigravity" Build System
echo ========================================================
echo Automatically setting up and building the environment.
echo This might take a few minutes if dependencies are missing.
echo.

echo [1/4] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
  echo Error installing Node.js dependencies.
  pause
  exit /b %errorlevel%
)
echo.

echo [2/4] Installing Python dependencies for Local AI Backend...
pip install fastapi uvicorn httpx pydantic lancedb playwright
if %errorlevel% neq 0 (
  echo Error installing Python packages. Make sure Python is installed.
  pause
  exit /b %errorlevel%
)
echo.

echo [3/4] Building React UI for Desktop...
call npm run build
if %errorlevel% neq 0 (
  echo Error compiling the UI.
  pause
  exit /b %errorlevel%
)
echo.

echo [4/4] Packaging Windows executable (.exe) using electron-builder...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
  echo Error packaging the application.
  pause
  exit /b %errorlevel%
)
echo.

echo ========================================================
echo SUCCESS! Your AI IDE has been built successfully.
echo You can find the .exe file inside the "release" directory.
echo ========================================================
pause
