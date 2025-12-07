// ============================================================
// ESP32 + MPU6050 - DETECTOR DE ANOMALIAS COM ML
// Versão SIMPLES - Wi-Fi direto, sem AP, sem portal
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Preferences.h>

// ============================================================
// CONFIGURAÇÕES - ALTERE AQUI
// ============================================================
const char* DEFAULT_SSID = "AAPM";
const char* DEFAULT_PASSWORD = "alunosenai";
const char* SERVER_HOST = "172.20.10.2";
const int SERVER_PORT = 8000;

// ============================================================
// HARDWARE
// ============================================================
const int SAMPLE_RATE_HZ = 200;
const int NUM_SAMPLES = 25;
const int I2C_SDA = 21;
const int I2C_SCL = 22;
const int LED_GREEN = 15;
const int LED_YELLOW = 4;
const int LED_RED = 5;
const int SOM_PIN = 18;

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
Adafruit_MPU6050 mpu;
WebServer server(80);
Preferences preferences;
String serverUrl;
String wifiSSID;
String wifiPassword;

// ============================================================
// LEDS
// ============================================================
void setLED(const char* color) {
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_GREEN, LOW);
  
  if (strcmp(color, "green") == 0) digitalWrite(LED_GREEN, HIGH);
  else if (strcmp(color, "yellow") == 0) digitalWrite(LED_YELLOW, HIGH);
  else if (strcmp(color, "red") == 0) digitalWrite(LED_RED, HIGH);
}

void playSound() {
  tone(SOM_PIN, 2000, 1000);
}

// ============================================================
// WI-FI
// ============================================================
void loadWifiCredentials() {
  preferences.begin("wifi", true);
  wifiSSID = preferences.getString("ssid", DEFAULT_SSID);
  wifiPassword = preferences.getString("pass", DEFAULT_PASSWORD);
  preferences.end();
}

void saveWifiCredentials(const String& ssid, const String& pass) {
  preferences.begin("wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("pass", pass);
  preferences.end();
}

void connectWifi() {
  Serial.printf("[WiFi] Conectando: %s\n", wifiSSID.c_str());
  setLED("yellow");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Conectado! IP: %s\n", WiFi.localIP().toString().c_str());
    setLED("green");
  } else {
    Serial.println("\n[WiFi] Falha na conexão!");
    setLED("red");
  }
}

// ============================================================
// PÁGINA /wifi - FORMULÁRIO SIMPLES
// ============================================================
void handleWifiPage() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trocar Wi-Fi</title>
  <style>
    body { font-family: Arial; background: #1a1a2e; color: #fff; padding: 20px; }
    .box { max-width: 300px; margin: 50px auto; background: #16213e; padding: 30px; border-radius: 10px; }
    h2 { margin: 0 0 20px; text-align: center; }
    input { width: 100%; padding: 12px; margin: 8px 0; border: none; border-radius: 5px; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #0f3460; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }
    button:hover { background: #e94560; }
    .info { font-size: 12px; color: #888; margin-top: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Trocar Wi-Fi</h2>
    <form action="/wifi/save" method="POST">
      <input type="text" name="ssid" placeholder="Nome da rede" required>
      <input type="password" name="pass" placeholder="Senha">
      <button type="submit">Salvar e Reiniciar</button>
    </form>
    <p class="info">Atual: )rawliteral" + wifiSSID + R"rawliteral(</p>
  </div>
</body>
</html>
)rawliteral";
  server.send(200, "text/html", html);
}

void handleWifiSave() {
  String ssid = server.arg("ssid");
  String pass = server.arg("pass");
  
  if (ssid.length() == 0) {
    server.send(400, "text/plain", "SSID obrigatorio");
    return;
  }
  
  saveWifiCredentials(ssid, pass);
  server.send(200, "text/html", "<h2 style='color:#0f0;text-align:center;margin-top:100px'>Salvo! Reiniciando...</h2>");
  delay(2000);
  ESP.restart();
}

// ============================================================
// MPU6050
// ============================================================
bool initMPU() {
  Wire.begin(I2C_SDA, I2C_SCL);
  if (!mpu.begin()) return false;
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_260_HZ);
  return true;
}

// ============================================================
// COLETA E ENVIO
// ============================================================
void collectAndSend() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
    return;
  }
  
  DynamicJsonDocument doc(4096);
  JsonArray data = doc.createNestedArray("data");
  doc["sensor_id"] = "esp32_mpu6050_01";
  
  unsigned long interval = 1000 / SAMPLE_RATE_HZ;
  
  for (int i = 0; i < NUM_SAMPLES; i++) {
    sensors_event_t a, g, t;
    mpu.getEvent(&a, &g, &t);
    
    JsonArray sample = data.createNestedArray();
    sample.add(a.acceleration.x);
    sample.add(a.acceleration.y);
    sample.add(a.acceleration.z);
    
    delay(interval);
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);
  
  String payload;
  serializeJson(doc, payload);
  
  int code = http.POST(payload);
  
  if (code == 200) {
    String resp = http.getString();
    DynamicJsonDocument respDoc(1024);
    deserializeJson(respDoc, resp);
    
    bool anomaly = respDoc["is_anomaly"] | false;
    float distance = respDoc["distance"] | 0.0f;
    float threshold = respDoc["threshold"] | 1.0f;
    float ratio = threshold > 0 ? distance / threshold : 0;
    
    if (anomaly) {
      setLED("red");
      playSound();
    } else if (ratio > 0.7) {
      setLED("yellow");
    } else {
      setLED("green");
    }
  }
  
  http.end();
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(SOM_PIN, OUTPUT);
  
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== VibrationML - ESP32 ===");
  
  serverUrl = String("http://") + SERVER_HOST + ":" + SERVER_PORT + "/predict";
  
  // Carrega Wi-Fi (salvo ou padrão)
  loadWifiCredentials();
  
  // Conecta
  connectWifi();
  
  // Inicia servidor web (para página /wifi)
  server.on("/wifi", HTTP_GET, handleWifiPage);
  server.on("/wifi/save", HTTP_POST, handleWifiSave);
  server.begin();
  
  // Inicia sensor
  if (!initMPU()) {
    Serial.println("[MPU] Sensor não encontrado!");
  } else {
    Serial.println("[MPU] OK!");
  }
  
  Serial.println("=== Sistema Pronto ===\n");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  server.handleClient();
  collectAndSend();
  delay(50);
}
