import math
import numpy as np
from scipy import stats as scipy_stats  # Renamed to avoid shadowing
from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Deque, Dict, Any, Union, Set
from datetime import datetime
from collections import deque
from pathlib import Path
import asyncio
import json
import logging


# ============================================================
# SANITIZAÇÃO DE VALORES PARA JSON
# ============================================================
def sanitize_float(value: Union[float, int, None], default: float = 0.0, max_value: float = 1e10) -> float:
    """
    Converte valores não-JSON-compliant para valores seguros.
    - NaN → default (0.0)
    - Infinity → max_value
    - -Infinity → -max_value
    """
    if value is None:
        return default
    if isinstance(value, (int, float)):
        if math.isnan(value):
            return default
        if math.isinf(value):
            return max_value if value > 0 else -max_value
        return float(value)
    return default


def sanitize_dict(data: Dict[str, Any], default: float = 0.0, max_value: float = 1e10) -> Dict[str, Any]:
    """
    Sanitiza recursivamente todos os valores float em um dicionário.
    """
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = sanitize_dict(value, default, max_value)
        elif isinstance(value, (list, tuple)):
            result[key] = [
                sanitize_float(v, default, max_value) if isinstance(v, (int, float)) else v
                for v in value
            ]
        elif isinstance(value, (int, float)) and not isinstance(value, bool):
            result[key] = sanitize_float(value, default, max_value)
        else:
            result[key] = value
    return result


def sanitize_sample(x: float, y: float, z: float, timestamp: int) -> Dict[str, Any]:
    """
    Sanitiza uma amostra individual de acelerômetro.
    """
    return {
        "timestamp": timestamp,
        "x": sanitize_float(x),
        "y": sanitize_float(y),
        "z": sanitize_float(z),
    }

# Carregar configuração
CONFIG_PATH = Path(__file__).parent / "config.json"
with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class AnomalyDetector:
    def __init__(self, model_path: str):
        model = np.load(model_path, allow_pickle=True)
        self.mu = model["mu"]
        self.cov = model["cov"]
        
        # Garante que threshold é um float
        threshold_val = model["threshold"]
        if isinstance(threshold_val, np.ndarray):
            self.threshold = float(threshold_val.item())
        else:
            self.threshold = float(threshold_val)
        
        # DESABILITA o scaler - estava causando valores negativos
        self.has_scaler = False
        
        self.last_predictions = [False, False, False]
        self.recent_distances = []
        
        model_type = str(model.get("model_type", "standard"))
        logger.info(
            "Model loaded - Type: %s, Threshold: %.3f", model_type, self.threshold
        )

    def preprocess(self, data, remove_dc=True):
        """
        Pré-processa dados para ser agnóstico à orientação.
        Remove a gravidade calculando a variação em relação à média.
        """
        # Remove média de cada eixo (remove gravidade/offset)
        data = data - np.mean(data, axis=0)
        return data
    


    def extract_features(self, sample):
        """Extract statistical features from sample - 5 features per axis"""
        features = []
        for axis_idx in range(sample.shape[1]):
            axis_data = sample[:, axis_idx]

            # 5 features por eixo (std, kurtosis, peak, rms, peak_to_peak)
            features.extend([
                np.std(axis_data),                           # Standard deviation (sempre positivo)
                scipy_stats.kurtosis(axis_data),             # Kurtosis
                np.max(np.abs(axis_data)),                   # Peak amplitude
                np.sqrt(np.mean(np.square(axis_data))),      # RMS (sempre positivo)
                np.max(axis_data) - np.min(axis_data),       # Peak-to-peak (sempre positivo)
            ])

        return np.array(features)

    def mahalanobis_distance(self, x):
        x_mu = x - self.mu
        epsilon = 1e-6
        cov_reg = self.cov + epsilon * np.eye(self.cov.shape[0])

        try:
            scale = np.median(np.diag(cov_reg))
            cov_scaled = cov_reg / scale
            inv_covmat = np.linalg.inv(cov_scaled) / scale

            if x_mu.ndim == 1:
                mahal = np.sqrt(np.dot(np.dot(x_mu, inv_covmat), x_mu))
            else:
                mahal = np.sqrt(np.sum(np.dot(x_mu, inv_covmat) * x_mu, axis=1))
            return mahal
        except np.linalg.LinAlgError:
            return np.inf

    def calculate_confidence(self, distance):
        """Calculate confidence with much more conservative approach"""
        # Keep track of recent distances
        self.recent_distances.append(distance)
        self.recent_distances = self.recent_distances[-10:]  # Smaller history
        
        # Much more conservative confidence calculation
        # Only high confidence when distance is significantly above threshold
        
        if distance < self.threshold * 0.5:
            # Very clearly normal - low confidence for anomaly
            confidence = 0.05
        elif distance < self.threshold * 0.8:
            # Probably normal - very low confidence
            confidence = 0.15
        elif distance < self.threshold:
            # Close to threshold but still normal - low confidence
            confidence = 0.25
        elif distance < self.threshold * 1.2:
            # Just above threshold - moderate confidence
            confidence = 0.45
        elif distance < self.threshold * 1.5:
            # Clearly above threshold - higher confidence
            confidence = 0.65
        elif distance < self.threshold * 2.0:
            # Well above threshold - high confidence
            confidence = 0.80
        else:
            # Very high distance - very high confidence
            confidence = 0.90
        
        # Apply stability factor to reduce noise
        if len(self.recent_distances) >= 3:
            recent_mean = np.mean(self.recent_distances[-3:])
            recent_std = np.std(self.recent_distances[-3:])
            
            # If readings are unstable, reduce confidence
            if recent_std > recent_mean * 0.3:  # High variation
                confidence *= 0.7
            
            # If current reading is very different from recent average, reduce confidence
            if abs(distance - recent_mean) > recent_mean * 0.5:
                confidence *= 0.8
        
        # Ensure confidence is within bounds
        return float(np.clip(confidence, 0.0, 1.0))

    def predict(self, data):
        processed_data = self.preprocess(data)
        features = self.extract_features(processed_data)
        distance = float(self.mahalanobis_distance(features))

        # Detecção de anomalia: distance > threshold
        # CORRIGIDO: comparação direta, sem multiplicador
        is_anomaly_candidate = distance > self.threshold

        # Update prediction history
        self.last_predictions.pop(0)
        self.last_predictions.append(is_anomaly_candidate)

        # Require 2 out of 3 consecutive predictions for anomaly
        stable_anomaly = sum(self.last_predictions) >= 2

        # Calculate confidence
        confidence = self.calculate_confidence(distance)

        # Calculate feature statistics for debugging
        feature_names = [
            "std",
            "kurtosis",
            "peak_amplitude",
            "rms",
            "peak_to_peak",
        ]
        feature_stats = {}

        # Organize features by axis
        n_features_per_axis = len(feature_names)
        n_axes = len(features) // n_features_per_axis

        for axis_idx in range(n_axes):
            start_idx = axis_idx * n_features_per_axis
            axis_features = features[start_idx : start_idx + n_features_per_axis]
            feature_stats[f"axis_{axis_idx}"] = {
                name: float(value) for name, value in zip(feature_names, axis_features)
            }

        # Sanitiza valores antes de criar o resultado
        safe_confidence = sanitize_float(confidence)
        safe_distance = sanitize_float(distance)
        safe_threshold = sanitize_float(self.threshold)
        
        # Sanitiza feature_stats
        safe_feature_stats = {}
        for axis_name, stats in feature_stats.items():
            safe_feature_stats[axis_name] = {
                name: sanitize_float(val) for name, val in stats.items()
            }

        result = {
            "is_anomaly": bool(stable_anomaly),
            "confidence": safe_confidence,
            "distance": safe_distance,
            "threshold": safe_threshold,
            "feature_values": safe_feature_stats,
            "timestamp": datetime.now().isoformat(),
        }

        # Log prediction details
        logger.info("=" * 50)
        logger.info("Prediction Details:")
        logger.info("Timestamp: %s", result["timestamp"])
        logger.info("Is Anomaly: %s", result["is_anomaly"])
        logger.info("Confidence: %.3f", result["confidence"])
        logger.info(
            "Distance: %.3f (threshold: %.3f)", result["distance"], result["threshold"]
        )
        logger.info("Feature Values:")
        for axis_name, stats in safe_feature_stats.items():
            logger.info("  %s:", axis_name)
            for feat, val in stats.items():
                logger.info("    %s: %.3f", feat, val)
        logger.info("=" * 50)

        return result


class AccelerometerData(BaseModel):
    data: List[List[float]]
    sensor_id: str = "default"


app = FastAPI()

# Add CORS middleware to allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = AnomalyDetector("models/mahalanobis_model.npz")

# Real-time state buffers
MAX_SAMPLES: int = 1000
recent_samples: Deque[Dict[str, Any]] = deque(maxlen=MAX_SAMPLES)  # per-sample xyz with timestamp
latest_status: Dict[str, Any] = {
    "is_anomaly": False,
    "confidence": 0.0,
    "distance": 0.0,
    "threshold": 0.0,  # Inicializado com 0.0 em vez de NaN
    "timestamp": None,
}

# Sistema de monitoramento de conexão do sensor
sensor_connection_status = {
    "connected": False,
    "last_data_time": None,
    "disconnect_time": None,
    "total_disconnections": 0,
    "connection_start_time": None,
}

SENSOR_TIMEOUT_SECONDS = 10  # Considera desconectado após 10s sem dados

# Simple broadcaster using asyncio.Queue for SSE
subscribers: List[asyncio.Queue] = []

# WebSocket connections para frontend em tempo real
websocket_clients: Set[WebSocket] = set()


# ============================================================
# GERENCIADOR DE WEBSOCKET
# ============================================================
class ConnectionManager:
    """Gerencia conexões WebSocket para broadcast em tempo real"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket conectado. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket desconectado. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Envia mensagem para todos os clientes conectados"""
        if not self.active_connections:
            return
        
        # Sanitiza antes de enviar
        safe_message = sanitize_dict(message)
        json_message = json.dumps(safe_message)
        
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(json_message)
            except Exception:
                disconnected.add(connection)
        
        # Remove conexões mortas
        for conn in disconnected:
            self.active_connections.discard(conn)


ws_manager = ConnectionManager()

def update_sensor_connection_status():
    """Atualiza status de conexão do sensor baseado no tempo da última mensagem"""
    global sensor_connection_status
    
    now = datetime.now()
    
    if sensor_connection_status["last_data_time"] is None:
        # Nunca recebeu dados
        sensor_connection_status["connected"] = False
        return
    
    time_since_last_data = (now - sensor_connection_status["last_data_time"]).total_seconds()
    
    if time_since_last_data > SENSOR_TIMEOUT_SECONDS:
        # Sensor desconectado
        if sensor_connection_status["connected"]:
            # Acabou de desconectar
            sensor_connection_status["connected"] = False
            sensor_connection_status["disconnect_time"] = now
            sensor_connection_status["total_disconnections"] += 1
            
            logger.warning(f"🔌 SENSOR DESCONECTADO! Última mensagem há {time_since_last_data:.1f}s")
            
            # Notifica via WebSocket
            asyncio.create_task(ws_manager.broadcast({
                "type": "sensor_disconnected",
                "message": f"Sensor desconectado há {time_since_last_data:.1f}s",
                "disconnect_time": now.isoformat(),
                "total_disconnections": sensor_connection_status["total_disconnections"]
            }))
    else:
        # Sensor conectado
        if not sensor_connection_status["connected"]:
            # Acabou de reconectar
            sensor_connection_status["connected"] = True
            sensor_connection_status["connection_start_time"] = now
            
            downtime = 0
            if sensor_connection_status["disconnect_time"]:
                downtime = (now - sensor_connection_status["disconnect_time"]).total_seconds()
            
            logger.info(f"🔌 SENSOR RECONECTADO! Downtime: {downtime:.1f}s")
            
            # Notifica via WebSocket
            asyncio.create_task(ws_manager.broadcast({
                "type": "sensor_reconnected",
                "message": f"Sensor reconectado após {downtime:.1f}s offline",
                "reconnect_time": now.isoformat(),
                "downtime_seconds": downtime
            }))

def get_sensor_status() -> Dict[str, Any]:
    """Retorna status detalhado da conexão do sensor"""
    update_sensor_connection_status()
    
    status = sensor_connection_status.copy()
    
    if status["last_data_time"]:
        status["seconds_since_last_data"] = (datetime.now() - status["last_data_time"]).total_seconds()
        status["last_data_time"] = status["last_data_time"].isoformat()
    
    if status["disconnect_time"]:
        status["disconnect_time"] = status["disconnect_time"].isoformat()
    
    if status["connection_start_time"]:
        status["connection_start_time"] = status["connection_start_time"].isoformat()
        status["uptime_seconds"] = (datetime.now() - datetime.fromisoformat(status["connection_start_time"].replace('Z', '+00:00'))).total_seconds()
    
    return status

def make_status_payload(pred: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cria payload de status baseado no ML.
    """
    confidence = pred.get("confidence", 0.0)
    distance = pred.get("distance", 0.0)
    threshold = pred.get("threshold", 1.0)
    is_anomaly = pred.get("is_anomaly", False)
    
    # Lógica baseada no ML
    if is_anomaly:
        # Vermelho quando ML detecta anomalia (2 de 3 predições)
        status_color = "red"
    elif distance > threshold:
        # Amarelo quando distância passa do threshold mas não confirmou ainda
        status_color = "yellow"
    elif distance > threshold * 0.7:
        # Amarelo claro quando está próximo do threshold
        status_color = "yellow"
    else:
        # Verde quando está claramente normal
        status_color = "green"
    
    # Sanitiza todos os valores float para evitar NaN/Infinity
    return {
        "is_anomaly": bool(is_anomaly),
        "confidence": sanitize_float(confidence),
        "distance": sanitize_float(distance),
        "threshold": sanitize_float(threshold),
        "timestamp": pred.get("timestamp"),
        "status_color": status_color,
    }


@app.post("/predict")
async def predict_anomaly(data: AccelerometerData):
    try:
        # Registra recebimento de dados do sensor
        global sensor_connection_status
        now = datetime.now()
        
        # Primeira vez recebendo dados
        if sensor_connection_status["last_data_time"] is None:
            sensor_connection_status["connection_start_time"] = now
            logger.info("🔌 SENSOR CONECTADO pela primeira vez!")
        
        sensor_connection_status["last_data_time"] = now
        
        # Atualiza status de conexão
        update_sensor_connection_status()
        
        array_data = np.array(data.data)
        
        # DEBUG: Log dos dados brutos recebidos (menos verboso)
        logger.info("📡 Dados recebidos: %s (%d amostras)", data.sensor_id, len(data.data))
        if len(data.data) > 0:
            logger.debug("Primeira amostra: [%.3f, %.3f, %.3f]", 
                        data.data[0][0], data.data[0][1], data.data[0][2])
        
        # Sanitiza dados de entrada - substitui NaN/Inf por 0
        array_data = np.nan_to_num(array_data, nan=0.0, posinf=1e10, neginf=-1e10)
        
        logger.info(
            "Received data shape: %s from sensor %s", array_data.shape, data.sensor_id
        )

        # Append raw samples to recent buffer with timestamps (sanitizados)
        now_ms = int(datetime.now().timestamp() * 1000)
        # Spread timestamps across the batch assuming uniform spacing when unknown
        if array_data.ndim == 2 and array_data.shape[0] > 0:
            n = array_data.shape[0]
            for i in range(n):
                x, y, z = map(float, array_data[i, :3])
                # Assign slightly increasing timestamps to preserve order
                ts = now_ms - (n - 1 - i)
                # Usa sanitize_sample para garantir valores válidos
                recent_samples.append(sanitize_sample(x, y, z, ts))

        result = detector.predict(array_data)
        
        # Sanitiza o resultado do modelo ML antes de retornar
        result = sanitize_dict(result)

        # Update latest status and notify subscribers
        global latest_status
        latest_status = make_status_payload(result)
        
        # Broadcast to SSE subscribers
        for q in list(subscribers):
            try:
                q.put_nowait(latest_status)
            except Exception:
                # Skip if subscriber is clogged
                pass
        
        # Broadcast to WebSocket clients (frontend em tempo real)
        await ws_manager.broadcast({
            "type": "prediction",
            "status": latest_status,
            "samples_count": len(recent_samples),
            "result": result
        })

        return result
    except Exception as e:
        logger.error("Error during prediction: %s", str(e))
        return {"error": str(e), "timestamp": datetime.now().isoformat()}


@app.get("/realtime/state")
async def get_state():
    """
    Retorna o estado atual do sistema com valores sanitizados.
    Garante que nunca retorne NaN ou Infinity.
    """
    # Sanitiza o status antes de retornar para garantir JSON válido
    return sanitize_dict(latest_status)


@app.get("/realtime/samples")
async def get_samples(limit: int = 300):
    """
    Retorna as amostras mais recentes com valores sanitizados.
    Garante que nunca retorne NaN ou Infinity.
    """
    # Return up to 'limit' most recent samples
    data = list(recent_samples)[-limit:]
    # Sanitiza cada amostra para garantir JSON válido
    sanitized_data = [sanitize_dict(sample) for sample in data]
    return {"samples": sanitized_data}


@app.get("/realtime/stream")
async def sse_stream():
    """
    Stream SSE com valores sanitizados.
    Fallback para quando WebSocket não está disponível.
    """
    async def event_generator():
        q: asyncio.Queue = asyncio.Queue()
        subscribers.append(q)
        
        try:
            # Envia estado inicial
            initial = sanitize_dict(latest_status)
            yield f"data: {json.dumps(initial)}\n\n"
            
            # Loop de eventos
            while True:
                try:
                    item = await asyncio.wait_for(q.get(), timeout=30.0)
                    sanitized_item = sanitize_dict(item)
                    yield f"data: {json.dumps(sanitized_item)}\n\n"
                except asyncio.TimeoutError:
                    # Envia heartbeat para manter conexão viva
                    yield f": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if q in subscribers:
                subscribers.remove(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# ============================================================
# WEBSOCKET ENDPOINT PARA FRONTEND EM TEMPO REAL
# ============================================================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket para comunicação em tempo real com o frontend.
    O frontend conecta aqui e recebe atualizações automaticamente
    quando o ESP32 envia dados.
    """
    await ws_manager.connect(websocket)
    
    try:
        # Envia estado inicial
        initial_state = sanitize_dict({
            "type": "connected",
            "status": latest_status,
            "samples_count": len(recent_samples),
            "message": "Conectado ao servidor de anomalias"
        })
        await websocket.send_text(json.dumps(initial_state))
        
        # Mantém conexão aberta e processa mensagens do cliente
        while True:
            try:
                # Aguarda mensagem do cliente (ping/pong ou comandos)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0  # Timeout de 30s para keepalive
                )
                
                # Processa comandos do cliente
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                    elif message.get("type") == "get_state":
                        await websocket.send_text(json.dumps(sanitize_dict({
                            "type": "state",
                            "status": latest_status,
                            "samples_count": len(recent_samples)
                        })))
                    elif message.get("type") == "get_samples":
                        limit = message.get("limit", 100)
                        samples = list(recent_samples)[-limit:]
                        await websocket.send_text(json.dumps(sanitize_dict({
                            "type": "samples",
                            "samples": samples
                        })))
                except json.JSONDecodeError:
                    pass
                    
            except asyncio.TimeoutError:
                # Envia ping para manter conexão viva
                try:
                    await websocket.send_text(json.dumps({"type": "ping"}))
                except Exception:
                    break
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        ws_manager.disconnect(websocket)


@app.get("/health")
async def health_check():
    """Health check - retorna 1 para compatibilidade com ESP32"""
    return Response(content="1", media_type="text/plain")


@app.get("/status")
async def get_status():
    """Status detalhado do sistema"""
    sensor_status = get_sensor_status()
    
    return sanitize_dict({
        "api_running": True,
        "sensor_connected": sensor_status["connected"],
        "sensor_status": sensor_status,
        "samples_count": len(recent_samples),
        "websocket_clients": len(ws_manager.active_connections),
        "latest_status": latest_status,
        "threshold": float(detector.threshold),
        "timestamp": datetime.now().isoformat()
    })

@app.get("/sensor/status")
async def get_sensor_status_endpoint():
    """Status específico da conexão do sensor"""
    return get_sensor_status()


@app.post("/test/simulate")
async def simulate_esp32_data():
    """
    Endpoint de TESTE: Simula dados do ESP32 para testar o frontend
    sem precisar do hardware conectado.
    
    Uso: POST http://localhost:8000/test/simulate
    """
    import random
    
    # Gera 200 amostras simuladas (1 segundo a 200Hz)
    num_samples = 200
    simulated_data = []
    
    for _ in range(num_samples):
        # Simula vibração normal com pequeno ruído
        x = random.gauss(0.1, 0.5)
        y = random.gauss(0.2, 0.5)
        z = random.gauss(9.8, 0.3)  # Gravidade + ruído
        simulated_data.append([x, y, z])
    
    # Cria objeto de dados como se fosse do ESP32
    data = AccelerometerData(data=simulated_data, sensor_id="test_simulator")
    
    # Processa como se fosse dados reais
    result = await predict_anomaly(data)
    
    return {
        "message": "Dados simulados enviados com sucesso!",
        "samples_generated": num_samples,
        "prediction": result
    }


@app.post("/test/anomaly")
async def simulate_anomaly():
    """
    Endpoint de TESTE: Simula uma ANOMALIA para testar alertas no frontend.
    
    Uso: POST http://localhost:8000/test/anomaly
    """
    import random
    
    # Gera dados anômalos (vibração muito alta)
    num_samples = 200
    simulated_data = []
    
    for _ in range(num_samples):
        # Simula vibração anômala (valores muito altos)
        x = random.gauss(5.0, 2.0)  # Muito mais alto que normal
        y = random.gauss(5.0, 2.0)
        z = random.gauss(15.0, 3.0)  # Muito diferente da gravidade
        simulated_data.append([x, y, z])
    
    data = AccelerometerData(data=simulated_data, sensor_id="test_anomaly")
    result = await predict_anomaly(data)
    
    return {
        "message": "Dados ANÔMALOS simulados!",
        "samples_generated": num_samples,
        "prediction": result
    }


# Serve static frontend UI (deve ser o último mount)
# Verifica se o diretório web existe antes de montar
web_dir = Path(__file__).parent / "web"
if web_dir.exists():
    app.mount("/", StaticFiles(directory=str(web_dir), html=True), name="web")


@app.get("/config")
async def get_config():
    """Retorna a configuração do servidor para o frontend"""
    return {
        "host": CONFIG["server"]["host"],
        "port": CONFIG["server"]["port"],
        "url": f"http://{CONFIG['server']['host']}:{CONFIG['server']['port']}"
    }


# Task em background para monitorar conexão do sensor
@app.on_event("startup")
async def startup_event():
    """Inicia monitoramento de conexão do sensor"""
    asyncio.create_task(monitor_sensor_connection())

async def monitor_sensor_connection():
    """Monitora conexão do sensor em background"""
    while True:
        try:
            update_sensor_connection_status()
            await asyncio.sleep(5)  # Verifica a cada 5 segundos
        except Exception as e:
            logger.error(f"Erro no monitoramento do sensor: {e}")
            await asyncio.sleep(10)

if __name__ == "__main__":
    import uvicorn
    
    host = CONFIG["server"]["host"]
    port = CONFIG["server"]["port"]
    print(f"\n🚀 Servidor rodando em http://{host}:{port}")
    print(f"📊 Monitor de vibração: http://{host}:{port}/")
    print(f"🔌 Status do sensor: http://{host}:{port}/sensor/status")
    print(f"⚙️  Configuração: {CONFIG_PATH}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
