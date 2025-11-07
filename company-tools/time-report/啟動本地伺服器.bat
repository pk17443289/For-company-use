@echo off
REM 使用 Python 啟動本地伺服器
echo ====================================
echo   工時回報系統 - 本地伺服器模式
echo ====================================
echo.
echo 正在啟動本地伺服器...
echo 伺服器位址: http://localhost:8000
echo.
echo 按 Ctrl+C 可關閉伺服器
echo ====================================
echo.

cd /d "%~dp0"
start http://localhost:8000
python -m http.server 8000
