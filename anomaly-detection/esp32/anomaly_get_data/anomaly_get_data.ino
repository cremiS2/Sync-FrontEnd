/*
 * ============================================================
 * ESP32 + MPU6050 - ENVIO VIA WI-FI (HTTP)
 * ============================================================
 * 
 * Este firmware envia dados do acelerômetro diretamente para
 * a API FastAPI via HTTP POST, SEM depender da porta serial.
 * 
 * Fluxo:
 *   ESP32 --[Wi-Fi/HTTP]--> FastAPI (api.py) --> Frontend
 * 
 * Após fazer upload, o ESP32 funciona de forma autônoma.
 * Não precisa do PlatformIO nem do monitor serial aberto.
 * 
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

// ============================================================
// CONFIGURAÇÕES - ALTERE CONFORME SUA REDE
// ============================================================
const char* WIFI_SSID     = "iPhone de Kauã";
const char* WIFI_PASSWORD = "kaua1234";
const char* SERVER_HOST   = "172.20.10.2";
const int   SERVER_PORT   = 8000;
const char* SENSOR_ID     = "esp32_mpu6050_01";

// ============================================================
// CONFIGURAÇÕES DO SENSOR E COLETA
// ============================================================
const int LED_BUILTIN_PIN = 2;        // LED interno do ESP32
const int SAMPLE_RATE_HZ  = 200;      // Taxa de amostragem
const int SAMPLES_PER_BATCH = 200;    // Amostras por envio (1 segundo)
const int SEND_INTERVAL_MS = 1000;    // Intervalo entre envios
const int WIFI_TIMEOUT_MS = 15000;    // Timeout conexão Wi-Fi
const int HTTP_TIMEOUT_MS = 10000;    // Timeout requisição HTTP

// Pinos I2C do MPU6050
const int I2C_SDA_PIN = 21;
const int I2C_SCL_PIN = 22;

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
Adafruit_MPU6050 mpu;
String serverUrl;
unsigned long lastSendTime = 0;
unsigned long totalSamplesSent = 0;
bool mpuInitialized = false;

// ============================================================
// LED FEEDBACK
// ============================================================
void ledOn()  { digitalWrite(LED_BUILTIN_PIN, HIGH); }
void ledOff() { digitalWrite(LED_BUILTIN_PIN, LOW); }

void blinkLED(int times, int onMs, int offMs) {
  for (int i = 0; i < times; i++) {
    ledOn();
    delay(onMs);
    ledOff();
    delay(offMs);
  }
}

// Padrões de LED:
// - 1 piscada longa: enviando dados
// - 2 piscadas rápidas: dados enviados com sucesso
// - 3 piscadas: erro de conexão
// - 5 piscadas muito rápidas: conectado ao Wi-Fi
// - LED piscando lento: tentando conectar

// ============================================================
// CONEXÃO WI-FI COM RECONEXÃO AUTOMÁTICA
// ============================================================
bool connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }
  
  Serial.println("\n[WiFi] Conectando...");
  Serial.printf("[WiFi] SSID: %s\n", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  unsigned long startAttempt = millis();
  
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startAttempt > WIFI_TIMEOUT_MS) {
      Serial.println("\n[WiFi] TIMEOUT - Falha na conexão!");
      blinkLED(3, 200, 200);
      return false;
    }
    blinkLED(1, 100, 400);  // Piscada lenta = tentando conectar
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("[WiFi] CONECTADO!");
  Serial.printf("[WiFi] IP Local: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("[WiFi] Gateway: %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("[WiFi] RSSI: %d dBm\n", WiFi.RSSI());
  
  blinkLED(5, 50, 50);  // 5 piscadas rápidas = conectado
  return true;
}

// ============================================================
// INICIALIZAÇÃO DO MPU6050
// ============================================================
bool initMPU6050() {
  Serial.println("\n[MPU6050] Inicializando...");
  
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  delay(100);
  
  if (!mpu.begin()) {
    Serial.println("[MPU6050] ERRO - Sensor não encontrado!");
    Serial.println("[MPU6050] Verifique as conexões:");
    Serial.printf("  - SDA: GPIO %d\n", I2C_SDA_PIN);
    Serial.printf("  - SCL: GPIO %d\n", I2C_SCL_PIN);
    return false;
  }
  
  // Configuração do acelerômetro
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  Serial.println("[MPU6050] Sensor inicializado!");
  Serial.println("[MPU6050] Configuração:");
  Serial.println("  - Range: ±4G");
  Serial.println("  - Filtro: 21Hz");
  
  mpuInitialized = true;
  blinkLED(2, 100, 100);
  return true;
}

// ============================================================
// COLETA DE DADOS DO SENSOR
// ============================================================
bool collectSensorData(float* dataBuffer, int numSamples) {
  if (!mpuInitialized) {
    Serial.println("[Coleta] ERRO - MPU6050 não inicializado!");
    return false;
  }
  
  unsigned long sampleInterval = 1000000 / SAMPLE_RATE_HZ;  // microsegundos
  unsigned long nextSampleTime = micros();
  
  for (int i = 0; i < numSamples; i++) {
    // Aguarda o momento certo para coletar
    while (micros() < nextSampleTime) {
      delayMicroseconds(10);
    }
    nextSampleTime += sampleInterval;
    
    // Lê dados do sensor
    sensors_event_t accel, gyro, temp;
    mpu.getEvent(&accel, &gyro, &temp);
    
    // Armazena no buffer [x, y, z]
    int idx = i * 3;
    dataBuffer[idx]     = accel.acceleration.x;
    dataBuffer[idx + 1] = accel.acceleration.y;
    dataBuffer[idx + 2] = accel.acceleration.z;
    
    // Trata valores inválidos
    for (int j = 0; j < 3; j++) {
      if (isnan(dataBuffer[idx + j]) || isinf(dataBuffer[idx + j])) {
        dataBuffer[idx + j] = 0.0f;
      }
    }
  }
  
  return true;
}

// ============================================================
// ENVIO DE DADOS VIA HTTP POST
// ============================================================
bool sendDataToServer(float* dataBuffer, int numSamples) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Sem conexão Wi-Fi!");
    return false;
  }
  
  // Monta o JSON no formato esperado pela API
  // {"data": [[x,y,z], [x,y,z], ...], "sensor_id": "..."}
  
  // Calcula tamanho necessário para o JSON
  const size_t jsonCapacity = JSON_OBJECT_SIZE(2) + 
                               JSON_ARRAY_SIZE(numSamples) + 
                               numSamples * JSON_ARRAY_SIZE(3) + 
                               512;
  
  DynamicJsonDocument doc(jsonCapacity);
  doc["sensor_id"] = SENSOR_ID;
  
  JsonArray dataArray = doc.createNestedArray("data");
  
  for (int i = 0; i < numSamples; i++) {
    JsonArray sample = dataArray.createNestedArray();
    int idx = i * 3;
    sample.add(dataBuffer[idx]);      // x
    sample.add(dataBuffer[idx + 1]);  // y
    sample.add(dataBuffer[idx + 2]);  // z
  }
  
  // Serializa para string
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Envia via HTTP POST
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS);
  
  ledOn();  // LED aceso durante envio
  
  int httpCode = http.POST(jsonPayload);
  
  ledOff();
  
  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      
      // Parse da resposta
      DynamicJsonDocument respDoc(1024);
      DeserializationError error = deserializeJson(respDoc, response);
      
      if (!error) {
        bool isAnomaly = respDoc["is_anomaly"] | false;
        float confidence = respDoc["confidence"] | 0.0f;
        float distance = respDoc["distance"] | 0.0f;
        
        Serial.println("\n[Resultado] ==================");
        Serial.printf("[Resultado] Anomalia: %s\n", isAnomaly ? "SIM ⚠️" : "NÃO ✓");
        Serial.printf("[Resultado] Confiança: %.1f%%\n", confidence * 100);
        Serial.printf("[Resultado] Distância: %.2f\n", distance);
        Serial.println("[Resultado] ==================");
        
        // Feedback visual
        if (isAnomaly) {
          blinkLED(5, 100, 100);  // Anomalia detectada
        } else {
          blinkLED(2, 50, 50);    // Normal
        }
      }
      
      http.end();
      return true;
    } else {
      Serial.printf("[HTTP] Erro: código %d\n", httpCode);
    }
  } else {
    Serial.printf("[HTTP] Falha: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
  blinkLED(3, 200, 200);  // Erro
  return false;
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  // Inicializa Serial (apenas para debug, não é necessário para funcionar)
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n");
  Serial.println("╔════════════════════════════════════════════════╗");
  Serial.println("║  ESP32 + MPU6050 - Detector de Anomalias       ║");
  Serial.println("║  Modo: Wi-Fi HTTP (Produção)                   ║");
  Serial.println("╚════════════════════════════════════════════════╝");
  
  // Configura LED
  pinMode(LED_BUILTIN_PIN, OUTPUT);
  ledOff();
  
  // Monta URL do servidor
  serverUrl = String("http://") + SERVER_HOST + ":" + SERVER_PORT + "/predict";
  
  Serial.println("\n[Config] Configurações:");
  Serial.printf("  - Servidor: %s\n", serverUrl.c_str());
  Serial.printf("  - Sensor ID: %s\n", SENSOR_ID);
  Serial.printf("  - Taxa: %d Hz\n", SAMPLE_RATE_HZ);
  Serial.printf("  - Amostras/batch: %d\n", SAMPLES_PER_BATCH);
  Serial.printf("  - Intervalo: %d ms\n", SEND_INTERVAL_MS);
  
  // Inicializa MPU6050
  while (!initMPU6050()) {
    Serial.println("[Setup] Tentando novamente em 3s...");
    blinkLED(3, 200, 200);
    delay(3000);
  }
  
  // Conecta ao Wi-Fi
  while (!connectWiFi()) {
    Serial.println("[Setup] Tentando reconectar em 5s...");
    delay(5000);
  }
  
  Serial.println("\n[Setup] ✓ Sistema pronto!");
  Serial.println("[Setup] Iniciando coleta e envio de dados...\n");
  
  lastSendTime = millis();
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================
void loop() {
  unsigned long currentTime = millis();
  
  // Verifica conexão Wi-Fi e reconecta se necessário
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Loop] Wi-Fi desconectado, reconectando...");
    connectWiFi();
    return;
  }
  
  // Envia dados no intervalo configurado
  if (currentTime - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = currentTime;
    
    // Aloca buffer para os dados
    static float dataBuffer[SAMPLES_PER_BATCH * 3];
    
    Serial.printf("\n[Coleta] Coletando %d amostras a %d Hz...\n", 
                  SAMPLES_PER_BATCH, SAMPLE_RATE_HZ);
    
    // Coleta dados
    if (collectSensorData(dataBuffer, SAMPLES_PER_BATCH)) {
      // Mostra algumas amostras para debug
      Serial.printf("[Coleta] Amostra 0: X=%.2f Y=%.2f Z=%.2f\n",
                    dataBuffer[0], dataBuffer[1], dataBuffer[2]);
      Serial.printf("[Coleta] Amostra %d: X=%.2f Y=%.2f Z=%.2f\n",
                    SAMPLES_PER_BATCH - 1,
                    dataBuffer[(SAMPLES_PER_BATCH - 1) * 3],
                    dataBuffer[(SAMPLES_PER_BATCH - 1) * 3 + 1],
                    dataBuffer[(SAMPLES_PER_BATCH - 1) * 3 + 2]);
      
      // Envia para o servidor
      Serial.printf("[HTTP] Enviando para %s...\n", serverUrl.c_str());
      
      if (sendDataToServer(dataBuffer, SAMPLES_PER_BATCH)) {
        totalSamplesSent += SAMPLES_PER_BATCH;
        Serial.printf("[HTTP] ✓ Enviado! Total: %lu amostras\n", totalSamplesSent);
      } else {
        Serial.println("[HTTP] ✗ Falha no envio");
      }
    } else {
      Serial.println("[Coleta] ✗ Falha na coleta");
    }
  }
  
  // Pequeno delay para não sobrecarregar
  delay(10);
}
