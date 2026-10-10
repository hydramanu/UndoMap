@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8770/demo/index.html
python -m http.server 8770 --bind 127.0.0.1
pause
