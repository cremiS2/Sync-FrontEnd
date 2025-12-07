# Guia Rápido - Sistema de Detecção de Anomalias

## ✅ O que foi configurado

O sistema agora funciona **100% via Wi-Fi**, sem depender de porta serial ou monitor.

### Arquitetura Final
```
ESP32 + MPU6050
      │
      │ HTTP POST /predict (Wi-Fi)
      ▼
Servidor Python (api.py)
      │
      │ WebSocket /ws
      ▼
Frontend Web (browser)
```

## 🚀 Como usar

### 1. Configurar IPs

Descubra o IP do seu computador na rede:
```powershell
ipconfig
```

Edite `anomaly-detection/config.json`:
```json
{
  "server": {
    "host": "SEU_IP_AQUI",
    "port": 8000
  }
}
```

Edite `aPio_Sistem/src/main.cpp`:
```cpp
const char* WIFI_SSID = "NOME_DA_REDE";
const char* WIFI_PASSWORD = "SENHA";
const char* SERVER_HOST = "SEU_IP_AQUI";
```

### 2. Upload do Firmware

```bash
cd anomaly-detection/aPio_Sistem
pio run --target upload
```

### 3. Iniciar Servidor

```bash
cd anomaly-detection
python start_production.py
```

### 4. Acessar Monitor

Abra no navegador: `http://SEU_IP:8000/`

## 🔥 Liberar Firewall (Windows)

Execute como Administrador:
```powershell
New-NetFirewallRule -DisplayName "ESP32 Anomaly Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## 🧪 Testar sem ESP32

```powershell
# Dados normais
Invoke-RestMethod -Uri "http://localhost:8000/test/simulate" -Method POST

# Simular anomalia
Invoke-RestMethod -Uri "http://localhost:8000/test/anomaly" -Method POST

# Verificar status do sensor
Invoke-RestMethod -Uri "http://localhost:8000/sensor/status" -Method GET

# Testar reconexão automática
python test_reconnection.py
```

## 📡 LEDs do ESP32

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Normal |
| 🟡 Amarelo | Alerta |
| 🔴 Vermelho piscando | Anomalia! |

## 🔄 Reconexão Automática

O sistema agora tem **reconexão automática**:

- **ESP32**: Reconecta Wi-Fi automaticamente se desconectar
- **Servidor**: Detecta quando sensor para de enviar dados (timeout 10s)
- **Frontend**: Mostra status de conexão em tempo real
- **Notificações**: WebSocket notifica desconexão/reconexão

## ❓ Problemas comuns

**ESP32 não conecta ao Wi-Fi:**
- Verifique SSID e senha no código
- Reinicie o ESP32 - ele reconectará automaticamente

**Sensor desconectado:**
- O sistema detecta automaticamente após 10s sem dados
- ESP32 reconecta sozinho quando possível
- Frontend mostra status de conexão

**Frontend não recebe dados:**
- Verifique: `http://IP:8000/sensor/status`
- Console do navegador (F12) mostra logs de conexão
- WebSocket reconecta automaticamente
