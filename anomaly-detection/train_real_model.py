#!/usr/bin/env python3
"""
Treinamento Real do Modelo com Dados do Sensor
==============================================
Este script coleta dados REAIS do sensor em duas fases:
1. Dados NORMAIS (sensor parado)
2. Dados de ANOMALIA (sensor vibrando)

E treina o modelo de ML corretamente.
"""

import numpy as np
from scipy import stats as scipy_stats
from pathlib import Path
from datetime import datetime
import time
import requests

SERVER_URL = "http://172.20.10.2:8000"
MODEL_PATH = Path("models/mahalanobis_model.npz")

def extract_features(data):
    """Extrai features de um batch de dados (igual ao api.py) - 5 features por eixo"""
    data = np.array(data)
    
    # Remove DC offset (igual ao pré-processamento)
    data = data - np.mean(data, axis=0)
    
    features = []
    for axis_idx in range(data.shape[1]):
        axis_data = data[:, axis_idx]
        
        # 5 features por eixo (igual ao api.py)
        features.extend([
            np.std(axis_data),                           # Standard deviation
            scipy_stats.kurtosis(axis_data),             # Kurtosis
            np.max(np.abs(axis_data)),                   # Peak amplitude
            np.sqrt(np.mean(np.square(axis_data))),      # RMS
            np.max(axis_data) - np.min(axis_data),       # Peak-to-peak
        ])
    
    return np.array(features)

def collect_samples(duration_seconds, description):
    """Coleta amostras do servidor por um período"""
    print(f"\n📡 Coletando dados: {description}")
    print(f"⏱️  Duração: {duration_seconds} segundos")
    
    features_list = []
    start_time = time.time()
    last_sample_count = 0
    
    while time.time() - start_time < duration_seconds:
        try:
            response = requests.get(f"{SERVER_URL}/realtime/samples?limit=50", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                samples = data.get("samples", [])
                
                if len(samples) >= 25:
                    # Pega as últimas 25 amostras
                    batch = [[s["x"], s["y"], s["z"]] for s in samples[-25:]]
                    features = extract_features(batch)
                    
                    if not np.any(np.isnan(features)):
                        features_list.append(features)
                        
                        elapsed = time.time() - start_time
                        remaining = duration_seconds - elapsed
                        print(f"✓ {len(features_list)} batches | {remaining:.0f}s restantes | std={features[0]:.4f}", end="\r")
            
            time.sleep(0.3)
            
        except Exception as e:
            print(f"\n⚠️ Erro: {e}")
            time.sleep(1)
    
    print(f"\n✅ Coletados {len(features_list)} batches")
    return features_list

def train_model(normal_features, anomaly_features):
    """Treina o modelo com os dados coletados"""
    print("\n🧠 Treinando modelo...")
    
    X_normal = np.array(normal_features)
    X_anomaly = np.array(anomaly_features) if anomaly_features else None
    
    print(f"📊 Dados normais: {X_normal.shape}")
    if X_anomaly is not None:
        print(f"📊 Dados anomalia: {X_anomaly.shape}")
    
    # Calcula parâmetros do modelo baseado nos dados normais
    mu = np.mean(X_normal, axis=0)
    cov = np.cov(X_normal.T)
    
    # Regularização
    epsilon = 1e-3
    cov_reg = cov + epsilon * np.eye(cov.shape[0])
    
    # Calcula distâncias
    def mahalanobis_distance(x, mu, cov):
        x_mu = x - mu
        try:
            inv_cov = np.linalg.inv(cov)
            if x_mu.ndim == 1:
                return np.sqrt(np.dot(np.dot(x_mu, inv_cov), x_mu))
            else:
                return np.sqrt(np.sum(np.dot(x_mu, inv_cov) * x_mu, axis=1))
        except:
            return np.sqrt(np.sum(x_mu**2, axis=-1))
    
    normal_distances = mahalanobis_distance(X_normal, mu, cov_reg)
    
    print(f"\n📏 Distâncias NORMAIS:")
    print(f"   Min: {normal_distances.min():.3f}")
    print(f"   Max: {normal_distances.max():.3f}")
    print(f"   Média: {normal_distances.mean():.3f}")
    print(f"   95%: {np.percentile(normal_distances, 95):.3f}")
    
    if X_anomaly is not None and len(X_anomaly) > 0:
        anomaly_distances = mahalanobis_distance(X_anomaly, mu, cov_reg)
        print(f"\n📏 Distâncias ANOMALIA:")
        print(f"   Min: {anomaly_distances.min():.3f}")
        print(f"   Max: {anomaly_distances.max():.3f}")
        print(f"   Média: {anomaly_distances.mean():.3f}")
        print(f"   5%: {np.percentile(anomaly_distances, 5):.3f}")
        
        # Threshold mais sensível - logo acima do normal
        normal_95 = np.percentile(normal_distances, 95)
        normal_99 = np.percentile(normal_distances, 99)
        anomaly_5 = np.percentile(anomaly_distances, 5)
        anomaly_25 = np.percentile(anomaly_distances, 25)
        
        # Usa o percentil 95 do normal + pequena margem
        # Isso detecta anomalias mais facilmente
        threshold = normal_95 * 1.5
        
        # Se o threshold ficar acima do mínimo das anomalias, ajusta
        if threshold > anomaly_5:
            threshold = (normal_99 + anomaly_5) / 2
        
        print(f"\n🎯 Threshold calculado: {threshold:.3f}")
        print(f"   Normal 95%: {normal_95:.3f}")
        print(f"   Normal 99%: {normal_99:.3f}")
        print(f"   Anomalia 5%: {anomaly_5:.3f}")
        
        # Verifica separação
        separation = anomaly_5 / normal_99 if normal_99 > 0 else 0
        print(f"   Separação (anomalia/normal): {separation:.2f}x")
        
        if separation < 1.5:
            print("   ⚠️ Separação baixa - vibre mais forte na próxima vez!")
    else:
        # Sem dados de anomalia, usa percentil 95 dos normais + margem
        threshold = np.percentile(normal_distances, 95) * 1.5
        print(f"\n🎯 Threshold (sem dados anomalia): {threshold:.3f}")
    
    # Salva modelo
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov_reg,
        threshold=threshold,
        model_type='trained_real_data',
        training_date=datetime.now().isoformat(),
        normal_samples=len(normal_features),
        anomaly_samples=len(anomaly_features) if anomaly_features else 0
    )
    
    print(f"\n💾 Modelo salvo em: {MODEL_PATH}")
    
    # Teste
    fp_rate = np.mean(normal_distances > threshold)
    print(f"\n📈 Taxa de falso positivo esperada: {fp_rate:.1%}")
    
    if X_anomaly is not None and len(X_anomaly) > 0:
        tp_rate = np.mean(anomaly_distances > threshold)
        print(f"📈 Taxa de detecção esperada: {tp_rate:.1%}")
    
    return threshold

def main():
    print("=" * 60)
    print("  TREINAMENTO DO MODELO DE DETECÇÃO DE ANOMALIAS")
    print("=" * 60)
    print()
    print("Este script vai treinar o modelo com dados REAIS do sensor.")
    print()
    
    # Verifica servidor
    try:
        response = requests.get(f"{SERVER_URL}/health", timeout=5)
        if response.text.strip() != "1":
            print("❌ Servidor não está pronto!")
            return
    except:
        print("❌ Não foi possível conectar ao servidor!")
        print(f"   Verifique se está rodando em {SERVER_URL}")
        return
    
    print("✅ Servidor conectado!")
    
    # Verifica se há dados chegando
    try:
        response = requests.get(f"{SERVER_URL}/realtime/samples?limit=10", timeout=5)
        data = response.json()
        if len(data.get("samples", [])) == 0:
            print("❌ Nenhum dado do sensor!")
            print("   Verifique se o ESP32 está enviando dados.")
            return
    except:
        print("❌ Erro ao verificar dados do sensor!")
        return
    
    print("✅ Sensor enviando dados!")
    print()
    
    # FASE 1: Coleta dados normais
    print("=" * 60)
    print("FASE 1: COLETA DE DADOS NORMAIS")
    print("=" * 60)
    print()
    print("⚠️  MANTENHA O SENSOR COMPLETAMENTE PARADO!")
    print()
    input("Pressione ENTER quando o sensor estiver parado e estável...")
    
    normal_features = collect_samples(20, "Sensor PARADO (normal)")
    
    if len(normal_features) < 10:
        print("❌ Dados insuficientes! Precisa de pelo menos 10 batches.")
        return
    
    # FASE 2: Coleta dados de anomalia
    print()
    print("=" * 60)
    print("FASE 2: COLETA DE DADOS DE ANOMALIA")
    print("=" * 60)
    print()
    print("⚠️  AGORA VIBRE O SENSOR CONTINUAMENTE!")
    print("   (bata na mesa, chacoalhe, etc)")
    print()
    input("Pressione ENTER e comece a vibrar o sensor...")
    
    anomaly_features = collect_samples(15, "Sensor VIBRANDO (anomalia)")
    
    # FASE 3: Treina modelo
    print()
    print("=" * 60)
    print("FASE 3: TREINAMENTO DO MODELO")
    print("=" * 60)
    
    threshold = train_model(normal_features, anomaly_features)
    
    print()
    print("=" * 60)
    print("✅ TREINAMENTO CONCLUÍDO!")
    print("=" * 60)
    print()
    print("Próximos passos:")
    print("1. Reinicie o servidor: python start_production.py")
    print("2. Teste o sistema vibrando o sensor")
    print()

if __name__ == "__main__":
    main()
