#!/usr/bin/env python3
"""
Script para testar reconexão automática do sistema.
Simula desconexão e reconexão do sensor.
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime

SERVER_URL = "http://172.20.10.2:8000"

async def simulate_sensor_data():
    """Simula dados do sensor por alguns segundos"""
    async with aiohttp.ClientSession() as session:
        for i in range(10):
            # Dados simulados
            data = {
                "data": [
                    [0.1 + i*0.01, 0.2 + i*0.01, 9.8 + i*0.01] 
                    for _ in range(25)
                ],
                "sensor_id": "test_reconnection"
            }
            
            try:
                async with session.post(f"{SERVER_URL}/predict", json=data) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        print(f"✓ Dados enviados {i+1}/10 - Anomalia: {result.get('is_anomaly', False)}")
                    else:
                        print(f"✗ Erro {resp.status}")
            except Exception as e:
                print(f"✗ Erro de conexão: {e}")
            
            await asyncio.sleep(0.5)

async def check_sensor_status():
    """Verifica status do sensor"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{SERVER_URL}/sensor/status") as resp:
                if resp.status == 200:
                    status = await resp.json()
                    print(f"📊 Status do sensor:")
                    print(f"   Conectado: {status.get('connected', False)}")
                    print(f"   Última mensagem: {status.get('seconds_since_last_data', 'N/A')}s atrás")
                    print(f"   Total desconexões: {status.get('total_disconnections', 0)}")
                    return status
        except Exception as e:
            print(f"✗ Erro ao verificar status: {e}")
    return None

async def test_reconnection():
    """Testa o sistema de reconexão"""
    print("🧪 Teste de Reconexão Automática")
    print("=" * 40)
    
    # 1. Verifica status inicial
    print("\n1️⃣ Verificando status inicial...")
    await check_sensor_status()
    
    # 2. Envia dados por alguns segundos
    print("\n2️⃣ Enviando dados do sensor...")
    await simulate_sensor_data()
    
    # 3. Verifica se sensor está conectado
    print("\n3️⃣ Verificando conexão após envio...")
    status = await check_sensor_status()
    
    if status and status.get('connected'):
        print("✓ Sensor detectado como conectado!")
        
        # 4. Para de enviar dados (simula desconexão)
        print("\n4️⃣ Simulando desconexão (parando envio)...")
        print("Aguardando 15 segundos para timeout...")
        
        for i in range(15):
            print(f"⏳ {15-i}s restantes...")
            await asyncio.sleep(1)
        
        # 5. Verifica se foi detectada a desconexão
        print("\n5️⃣ Verificando detecção de desconexão...")
        status = await check_sensor_status()
        
        if status and not status.get('connected'):
            print("✓ Desconexão detectada corretamente!")
        else:
            print("⚠️ Desconexão não foi detectada")
        
        # 6. Reconecta enviando dados novamente
        print("\n6️⃣ Simulando reconexão...")
        await simulate_sensor_data()
        
        # 7. Verifica reconexão
        print("\n7️⃣ Verificando reconexão...")
        status = await check_sensor_status()
        
        if status and status.get('connected'):
            print("✓ Reconexão detectada corretamente!")
            print(f"📈 Total de desconexões: {status.get('total_disconnections', 0)}")
        else:
            print("⚠️ Reconexão não foi detectada")
    
    print("\n🏁 Teste concluído!")

if __name__ == "__main__":
    asyncio.run(test_reconnection())