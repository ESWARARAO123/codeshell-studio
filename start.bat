@echo off
echo Starting Pinnacle IDE...

echo.
echo 1. Starting Backend Server...
start "Backend" cmd /k "npm run dev"

echo.
echo 2. Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 3. Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo 4. Services started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause > nul