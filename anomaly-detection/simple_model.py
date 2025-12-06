#!/usr/bin/env python3
"""
Modelo Simples e Robusto - Agnóstico à Orientação
=================================================
Este modelo detecta anomalias baseado apenas na VARIAÇÃO da vibração,
não nos valores absolutos. Funciona independente da orientação do sensor.
"""

import numpy as np
from pathlib import Path

MODEL_PATH = Path("models/mahalanobis_model.npz")

def create_simple_model():
    """
    Cria um modelo simples que:
    - Ignora valores absolutos (gravidade)
    - Foca apenas na variação/vibração
    - Funciona em qualquer orientação
    """
    
    print("🔧 Criando modelo simples agnóstico à orientação...")
    
    # Parâmetros para dados "normais" (sensor parado)
    # Quando parado, a variação é muito pequena
    n_features = 21  # 7 features x 3 eixos
    
    # Média esperada para sensor parado (variação ~0)
    mu = np.zeros(n_features)
    
    # Covariância com variância pequena (sensor parado tem pouca variação)
    # Valores típicos de um sensor parado:
    # - std: ~0.02-0.05
    # - kurtosis: ~0 (distribuição normal)
    # - peak: ~0.1
    # - rms: ~0.02-0.05
    # - range: ~0.1
    # - mean_abs: ~0.02
    # - skew: ~0
    
    variance_per_feature = np.array([
        0.1,   # std
        2.0,   # kurtosis (pode variar mais)
        0.2,   # peak_95
        0.1,   # rms
        0.3,   # range
        0.1,   # mean_abs
        1.0,   # skew
    ] * 3)  # Para 3 eixos
    
    cov = np.diag(variance_per_feature)
    
    # Threshold muito alto para ser conservador
    # Distância de Mahalanobis típica para dados normais: 3-5
    # Threshold: 50 (muito acima do normal)
    threshold = 50.0
    
    # Salva modelo
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov,
        threshold=threshold,
        scaler_mean=np.zeros(n_features),
        scaler_scale=np.ones(n_features),
        model_type='simple_orientation_agnostic'
    )
    
    print(f"✅ Modelo salvo em: {MODEL_PATH}")
    print(f"🎯 Threshold: {threshold}")
    print(f"📊 Features: {n_features}")
    print()
    print("Este modelo detecta anomalias baseado na VARIAÇÃO,")
    print("não nos valores absolutos. Funciona em qualquer orientação!")
    
    return threshold

if __name__ == "__main__":
    create_simple_model()
