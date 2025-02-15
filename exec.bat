@echo off
echo Starting
echo Killing process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F
start /min cmd /k "cd public\backend && node server.js"
start /min cmd /k "npm start"
echo Started backend
echo Started react
