@echo off
REM 開啟工時回報系統
echo 正在開啟工時回報系統...
start "" "%~dp0index.html"
echo 已在瀏覽器中開啟工時回報網頁！
timeout /t 2 >nul
