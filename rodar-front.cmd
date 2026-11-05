@echo off
title Front - Barbearia Oliveira
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
)
echo Site em http://localhost:5173
call npm run dev
pause
