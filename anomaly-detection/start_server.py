#!/usr/bin/env python3
"""
============================================================
Servidor de Detecção de Anomalias IoT
============================================================

Este script inicia o servidor FastAPI que:
  1. Recebe dados do ESP32 via Wi-Fi (HTTP POST em /predict)
  2. Processa com Machine Learning (Mahalanobis Distance)
  3. Envia para o frontend via WebSocket (/ws)

Fluxo de dados:
  ESP32 --[Wi-Fi/HTTP]--> FastAPI --[WebSocket]--> Frontend

Uso:
  python start_server.py

Para rodar em background (Linux):
  nohup python start_server.py > server.log 2>&1 &

Para Windows (PowerShell):
  Start-Process python -ArgumentList "start_server.py" -WindowStyle Hidden

============================================================
"""

import sys
import os
import json
import signal
import logging
from pathlib import Path

# Adiciona o diretório atual ao path
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir))
os.chdir(script_dir)

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("server.log")
    ]
)
logger = logging.getLogger(__name__)


def load_config():
    """Carrega configuração do arquivo config.json"""
    config_path = script_dir / "config.json"
    with open(config_path) as f:
        return json.load(f)


def signal_handler(signum, frame):
    """Handler para shutdown graceful"""
    logger.info("Recebido sinal de shutdown, encerrando...")
    sys.exit(0)


def print_banner(host, port):
    """Imprime banner de inicialização"""
    print("\n" + "=" * 60)
    print("  🚀 SERVIDOR DE DETECÇÃO DE ANOMALIAS IoT")
    print("=" * 60)
    print(f"\n  📡 Aguardando dados do ESP32 via Wi-Fi...")
    print(f"\n  🌐 Servidor: http://{host}:{port}")
    print(f"  📊 Dashboard: http://{host}:{port}/")
    print("\n  📌 Endpoints:")
    print(f"     POST /predict         → ESP32 envia dados aqui")
    print(f"     GET  /realtime/state  → Estado atual")
    print(f"     GET  /realtime/samples→ Últimas amostras")
    print(f"     WS   /ws              → WebSocket (frontend)")
    print(f"     GET  /health          → Health check")
    print(f"     GET  /status          → Status detalhado")
    print("\n" + "=" * 60)
    print("  Pressione Ctrl+C para parar")
    print("=" * 60 + "\n")


def main():
    # Registra handlers de sinal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Carrega configuração
    config = load_config()
    host = config["server"]["host"]
    port = config["server"]["port"]
    
    print_banner(host, port)
    
    # Importa e inicia uvicorn
    import uvicorn
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",  # Aceita conexões de qualquer IP
        port=port,
        log_level="info",
        reload=False,
        access_log=True
    )


if __name__ == "__main__":
    main()
