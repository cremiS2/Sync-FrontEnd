# Sistema de Detecção de Anomalias - Modo Produção

## Arquitetura

```
ESP32 + MPU6050  ──[Wi-Fi/HTTP]──►  Servidor Python  ──[WebSocket]──►  Frontend React
     │                                    │
     │ POST /predict                      │ Processa ML
     │ (dados do acelerômetro)            │ Detecta anomalias
     │                                    │
     └────────────────────────────────────┴──────────────────────────────────────────
```

## Fluxo de Dados

1. **ESP32** coleta dados do MPU6050 (50 amostras a 200Hz)
2. **ESP32** envia via HTTP POST para `/predict`
3. **Servidor** processa com modelo ML (Mahalanobis)
4. **Servidor** retorna resultado para ESP32 (LEDs)
5. **Servidor** envia para Frontend via WebSocket
6. **Frontend** exibe gráficos em tempo real

## Configuração

### 1. Configurar IP do Servidor

Edite `config.json`:
```json
{
  "server": {
    "host": "SEU_IP_AQUI",
    "port": 8000
  }
}
```

### 2. Configurar ESP32

No arquivo `aPio_Sistem/src/main.cpp`, altere:
```cpp
const char* WIFI_SSID = "NOME_DA_SUA_REDE";
const char* WIFI_PASSWORD = "SENHA_DA_REDE";
const char* SERVER_HOST = "IP_DO_SERVIDOR";
const int SERVER_PORT = 8000;
```

### 3. Upload do Firmware

```bash
cd aPio_Sistem
pio run --target upload
```

### 4. Iniciar Servidor

```bash
cd anomaly-detection
python start_production.py
```

## Testando sem ESP32

Simular dados normais:
```bash
curl -X POST http://localhost:8000/test/simulate
```

Simular anomalia:
```bash
curl -X POST http://localhost:8000/test/anomaly
```

## Firewall

No Windows, libere a porta 8000:
```powershell
# Execute como Administrador
New-NetFirewallRule -DisplayName "ESP32 Anomaly Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## LEDs do ESP32

| LED | Cor | Significado |
|-----|-----|-------------|
| Verde | Aceso | Normal |
| Amarelo | Aceso | Alerta (confiança ≥ 70%) |
| Vermelho | Piscando | Anomalia detectada |

## Troubleshooting

### ESP32 não conecta ao Wi-Fi
- Verifique SSID e senha
- Verifique se o hotspot está ativo
- Reinicie o ESP32

### ESP32 não envia dados
- Verifique se o IP do servidor está correto
- Verifique se o firewall está liberado
- Teste: `curl http://IP:8000/health` (deve retornar `1`)

### Frontend não recebe dados
- Verifique se o servidor está rodando
- Verifique conexão WebSocket no console do navegador
- Teste: `curl http://IP:8000/realtime/state`
