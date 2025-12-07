#!/usr/bin/env python3
"""
Script de inicialização do servidor de detecção de anomalias.
Modo: PRODUÇÃO (recebe dados via Wi-Fi do ESP32)

Uso:
    python start_production.py

O servidor escuta na porta 8000 e recebe dados do ESP32 via HTTP POST.
Não depende de porta serial nem do PlatformIO.
"""

import uvicorn
import json
from pathlib import Path

# Carrega configuração
CONFIG_PATH = Path(__file__).parent / "config.json"
with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

if __name__ == "__main__":
    host = CONFIG["server"]["host"]
    port = CONFIG["server"]["port"]
    
    print("\n" + "=" * 50)
    print("  SERVIDOR DE DETECÇÃO DE ANOMALIAS")
    print("  Modo: PRODUÇÃO (Wi-Fi)")
    print("=" * 50)
    print(f"\n🚀 Servidor: http://{host}:{port}")
    print(f"📊 Monitor: http://{host}:{port}/")
    print(f"🔌 Health: http://{host}:{port}/health")
    print(f"📡 API: http://{host}:{port}/predict")
    print("\n📋 Endpoints disponíveis:")
    print("   POST /predict        - Recebe dados do ESP32")
    print("   GET  /health         - Health check (retorna '1')")
    print("   GET  /realtime/samples - Últimas amostras")
    print("   GET  /realtime/state - Estado atual")
    print("   WS   /ws             - WebSocket para frontend")
    print("   POST /test/simulate  - Simula dados normais")
    print("   POST /test/anomaly   - Simula anomalia")
    print("\n⏳ Aguardando conexão do ESP32...")
    print("=" * 50 + "\n")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False
    )
