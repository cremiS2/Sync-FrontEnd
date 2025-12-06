# 🚀 Setup para Produção - Sistema IoT

## Arquitetura Final

```
┌─────────────┐      Wi-Fi/HTTP       ┌─────────────┐      WebSocket      ┌─────────────┐
│   ESP32     │ ──────────────────►   │   FastAPI   │ ──────────────────► │  Frontend   │
│  + MPU6050  │   POST /predict       │   (api.py)  │        /ws          │  (browser)  │
└─────────────┘                       └─────────────┘                     └─────────────┘
```

**Antes (dependia do serial):**
```
ESP32 → USB/Serial → PlatformIO Monitor → server.py → Frontend
```

**Agora (100% via rede):**
```
ESP32 → Wi-Fi → FastAPI → WebSocket → Frontend
```

---

## 📋 Checklist de Deploy

### 1. Configurar `config.json`

```json
{
  "server": {
    "host": "SEU_IP_AQUI",
    "port": 8000
  },
  "wifi": {
    "ssid": "NOME_DO_WIFI",
    "password": "SENHA_DO_WIFI"
  }
}
```

### 2. Configurar ESP32

Edite `esp32/anomaly_get_data/anomaly_get_data.ino`:

```cpp
const char* WIFI_SSID     = "NOME_DO_WIFI";
const char* WIFI_PASSWORD = "SENHA_DO_WIFI";
const char* SERVER_HOST   = "IP_DO_SERVIDOR";
const int   SERVER_PORT   = 8000;
```

### 3. Upload do Firmware

1. Conecte o ESP32 via USB
2. Abra o Arduino IDE ou PlatformIO
3. Faça upload do código
4. **Desconecte o USB** - o ESP32 agora funciona sozinho!

### 4. Iniciar o Servidor

```bash
cd anomaly-detection
python start_server.py
```

Ou no Windows: duplo-clique em `start_server.bat`

---

## 🔍 Como Verificar se Está Funcionando

### No Servidor (terminal):
```
[INFO] Received data shape: (200, 3) from sensor esp32_mpu6050_01
[INFO] Prediction Details:
[INFO] Is Anomaly: False
[INFO] Confidence: 0.950
```

### No ESP32 (Serial Monitor - opcional):
```
[WiFi] CONECTADO!
[WiFi] IP Local: 172.20.10.x
[Coleta] Coletando 200 amostras a 200 Hz...
[HTTP] Enviando para http://172.20.10.2:8000/predict...
[HTTP] ✓ Enviado! Total: 200 amostras
[Resultado] Anomalia: NÃO ✓
```

### No Browser:
Acesse `http://172.20.10.2:8000/` e veja o dashboard em tempo real.

### Testar endpoints:
```bash
# Health check
curl http://172.20.10.2:8000/health

# Status
curl http://172.20.10.2:8000/status

# Estado atual
curl http://172.20.10.2:8000/realtime/state

# Últimas amostras
curl http://172.20.10.2:8000/realtime/samples?limit=10
```

---

## 🖥️ Deploy em Produção

### Opção 1: Systemd (Linux)

Crie `/etc/systemd/system/anomaly-detector.service`:

```ini
[Unit]
Description=Anomaly Detection Server
After=network.target

[Service]
Type=simple
User=seu_usuario
WorkingDirectory=/caminho/para/anomaly-detection
ExecStart=/usr/bin/python3 start_server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable anomaly-detector
sudo systemctl start anomaly-detector
```

### Opção 2: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "start_server.py"]
```

### Opção 3: Windows Task Scheduler

1. Abra "Agendador de Tarefas"
2. Criar Tarefa → Trigger: "Ao iniciar"
3. Ação: `python.exe` com argumento `C:\caminho\start_server.py`

---

## ⚠️ Troubleshooting

### ESP32 não conecta no Wi-Fi
- Verifique SSID e senha (case-sensitive)
- ESP32 só suporta 2.4GHz
- Tente reiniciar o hotspot

### ESP32 conecta mas não envia dados
- Verifique se o IP do servidor está correto
- Teste: `curl http://IP:8000/health` deve retornar "1"
- Verifique firewall do Windows/Linux

### Frontend não atualiza
- Abra DevTools (F12) → Console para ver erros
- Verifique se WebSocket conectou
- Teste: `http://IP:8000/realtime/state`

### Erro "NaN not JSON compliant"
- Já corrigido! Todos os valores são sanitizados antes de retornar.

---

## 📁 Estrutura de Arquivos

```
anomaly-detection/
├── api.py              # API FastAPI (recebe dados, processa ML, WebSocket)
├── config.json         # Configurações (IP, porta, Wi-Fi)
├── start_server.py     # Script de inicialização
├── start_server.bat    # Script Windows
├── requirements.txt    # Dependências Python
├── models/
│   └── mahalanobis_model.npz  # Modelo ML treinado
├── web/
│   ├── index.html      # Dashboard
│   ├── app.js          # Frontend JavaScript
│   └── styles.css      # Estilos
└── esp32/
    └── anomaly_get_data/
        └── anomaly_get_data.ino  # Firmware ESP32
```
