@echo off
echo ==========================================
echo      STARK SCHOLARS PRODUCTION RESET
echo ==========================================
echo.
echo [1/2] Deploying Schema & Functions to Production...
call npx convex deploy
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed. Please authenticate using 'npx convex login'.
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Wiping All Production Data (Fresh Start)...
call npx convex run maintenance:wipeAllData
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Data wipe failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo      SUCCESS! PRODUCTION IS READY 🚀
echo ==========================================
pause
