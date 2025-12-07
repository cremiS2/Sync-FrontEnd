#!/usr/bin/env python3
"""
Calibração do Modelo para Novo Sensor
=====================================
Este script coleta dados do sensor atual (parado) e recalibra o modelo
para considerar esses dados como "normais".

Uso:
1. Deixe o sensor PARADO e estável
2. Execute: python calibrate_sensor.py
3. Aguarde a coleta de dados (30 segundos)
4. O modelo será recalibrado automaticamente
"""

import numpy as np
from scipy import stats as scipy_stats
from pathlib import Path
from datetime import datetime
import time
import json
import requests

# Configuração
SERVER_URL = "http://172.20.10.2:8000"
MODEL_PATH = Path("models/mahalanobis_model.npz")
CALIBRATION_TIME_SECONDS = 30
SAMPLES_PER_REQUEST = 25

# Buffer para armazenar dados de calibração
calibration_data = []

def extract_features(data):
    """Extrai features de um batch de dados"""
    data = np.array(data)
    
    # Remove DC offset
    data = data - np.mean(data, axis=0)
    
    features = []
    for axis_idx in range(data.shape[1]):
        axis_data = data[:, axis_idx]
        
        features.extend([
            np.std(axis_data),
            scipy_stats.kurtosis(axis_data),
            np.percentile(np.abs(axis_data), 95),
            np.sqrt(np.mean(np.square(axis_data))),
            np.percentile(axis_data, 95) - np.percentile(axis_data, 5),
            np.mean(np.abs(axis_data)),
            scipy_stats.skew(axis_data),
        ])
    
    return np.array(features)

def collect_calibration_data():
    """Coleta dados do sensor para calibração"""
    global calibration_data
    
    print("📡 Coletando dados de calibração...")
    print(f"⏱️  Tempo de coleta: {CALIBRATION_TIME_SECONDS} segundos")
    print("⚠️  MANTENHA O SENSOR PARADO E ESTÁVEL!")
    print()
    
    start_time = time.time()
    samples_collected = 0
    
    while time.time() - start_time < CALIBRATION_TIME_SECONDS:
        try:
            # Busca amostras recentes do servidor
            response = requests.get(f"{SERVER_URL}/realtime/samples?limit=100", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                samples = data.get("samples", [])
                
                if samples:
                    # Converte para formato de features
                    batch = [[s["x"], s["y"], s["z"]] for s in samples[-SAMPLES_PER_REQUEST:]]
                    
                    if len(batch) >= SAMPLES_PER_REQUEST:
                        features = extract_features(batch)
                        calibration_data.append(features)
                        samples_collected += 1
                        
                        elapsed = time.time() - start_time
                        remaining = CALIBRATION_TIME_SECONDS - elapsed
                        print(f"✓ Batch {samples_collected} coletado | {remaining:.0f}s restantes", end="\r")
            
            time.sleep(0.5)
            
        except Exception as e:
            print(f"\n⚠️ Erro: {e}")
            time.sleep(1)
    
    print(f"\n\n✅ Coleta concluída! {len(calibration_data)} batches coletados.")
    return len(calibration_data) > 0

def calibrate_model():
    """Recalibra o modelo com os dados coletados"""
    global calibration_data
    
    if len(calibration_data) < 10:
        print("❌ Dados insuficientes para calibração (mínimo 10 batches)")
        return False
    
    print("\n🔧 Recalibrando modelo...")
    
    # Converte para array numpy
    X_calibration = np.array(calibration_data)
    
    print(f"📊 Shape dos dados: {X_calibration.shape}")
    print(f"📊 Média das features: {np.mean(X_calibration, axis=0)[:5]}...")
    print(f"📊 Std das features: {np.std(X_calibration, axis=0)[:5]}...")
    
    # Calcula parâmetros do modelo
    mu = np.mean(X_calibration, axis=0)
    cov = np.cov(X_calibration.T)
    
    # Regularização
    epsilon = 1e-2
    cov_reg = cov + epsilon * np.eye(cov.shape[0])
    
    # Calcula distâncias para os dados de calibração
    def mahalanobis_distance(x, mu, cov):
        x_mu = x - mu
        try:
            inv_cov = np.linalg.inv(cov)
            if x_mu.ndim == 1:
                return np.sqrt(np.dot(np.dot(x_mu, inv_cov), x_mu))
            else:
                return np.sqrt(np.sum(np.dot(x_mu, inv_cov) * x_mu, axis=1))
        except:
            return np.sqrt(np.sum(x_mu**2, axis=-1)) / np.sqrt(len(mu))
    
    distances = mahalanobis_distance(X_calibration, mu, cov_reg)
    
    print(f"📏 Distâncias - Min: {distances.min():.3f}, Max: {distances.max():.3f}, Média: {distances.mean():.3f}")
    
    # Threshold muito conservador - 99.9% dos dados normais
    threshold = np.percentile(distances, 99.9)
    
    # Adiciona margem de segurança (3x)
    threshold *= 3.0
    
    print(f"🎯 Novo threshold: {threshold:.3f}")
    
    # Salva modelo
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov_reg,
        threshold=threshold,
        scaler_mean=mu,
        scaler_scale=np.std(X_calibration, axis=0),
        model_type='calibrated_sensor',
        calibration_date=datetime.now().isoformat(),
        calibration_samples=len(calibration_data)
    )
    
    print(f"💾 Modelo salvo em: {MODEL_PATH}")
    
    # Testa o modelo
    test_distances = mahalanobis_distance(X_calibration, mu, cov_reg)
    fp_rate = np.mean(test_distances > threshold)
    
    print(f"\n📈 Teste do modelo calibrado:")
    print(f"   - Taxa de falso positivo: {fp_rate:.1%}")
    print(f"   - Distância média: {test_distances.mean():.3f}")
    print(f"   - Threshold: {threshold:.3f}")
    
    return True

def main():
    print("=" * 50)
    print("  CALIBRAÇÃO DO SENSOR MPU6050")
    print("=" * 50)
    print()
    print("Este script vai recalibrar o modelo de ML para")
    print("o seu sensor atual.")
    print()
    print("⚠️  IMPORTANTE:")
    print("   1. O servidor deve estar rodando")
    print("   2. O ESP32 deve estar enviando dados")
    print("   3. O sensor deve estar PARADO e ESTÁVEL")
    print()
    
    input("Pressione ENTER quando estiver pronto...")
    print()
    
    # Verifica se servidor está rodando
    try:
        response = requests.get(f"{SERVER_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Servidor não está respondendo!")
            return
    except:
        print("❌ Não foi possível conectar ao servidor!")
        print(f"   Verifique se está rodando em {SERVER_URL}")
        return
    
    print("✅ Servidor conectado!")
    print()
    
    # Coleta dados
    if collect_calibration_data():
        # Calibra modelo
        if calibrate_model():
            print("\n" + "=" * 50)
            print("✅ CALIBRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 50)
            print()
            print("Próximos passos:")
            print("1. Reinicie o servidor: python start_production.py")
            print("2. O modelo agora está calibrado para seu sensor")
            print()
        else:
            print("\n❌ Falha na calibração")
    else:
        print("\n❌ Falha na coleta de dados")

if __name__ == "__main__":
    main()
