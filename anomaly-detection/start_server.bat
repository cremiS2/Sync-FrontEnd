@echo off
REM ============================================================
REM Servidor de Detecção de Anomalias IoT
REM ============================================================
REM 
REM Este script inicia o servidor FastAPI que:
REM   1. Recebe dados do ESP32 via Wi-Fi (HTTP POST)
REM   2. Processa com Machine Learning
REM   3. Envia para o frontend via WebSocket
REM
REM Fluxo: ESP32 --[Wi-Fi]--> API --[WebSocket]--> Frontend
REM
REM ============================================================

echo.
echo ========================================
echo   Servidor IoT - Deteccao de Anomalias
echo ========================================
echo.

cd /d "%~dp0"

REM Verifica Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Instale Python 3.8+ e adicione ao PATH
    pause
    exit /b 1
)

REM Verifica dependências
echo [INFO] Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando dependencias...
    pip install -r requirements.txt
)

REM Mostra configuração
echo.
echo [CONFIG] Configuracoes do servidor:
type config.json
echo.

REM Inicia servidor
echo [INFO] Iniciando servidor...
echo [INFO] Pressione Ctrl+C para parar
echo.
echo ========================================
echo   Endpoints disponiveis:
echo   - POST /predict        (ESP32 envia dados)
echo   - GET  /realtime/state (estado atual)
echo   - GET  /realtime/samples (amostras)
echo   - WS   /ws             (WebSocket frontend)
echo   - GET  /health         (health check)
echo   - GET  /status         (status detalhado)
echo ========================================
echo.

python -m uvicorn api:app --host 0.0.0.0 --port 8000 --log-level info

pause
