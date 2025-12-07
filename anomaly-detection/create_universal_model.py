#!/usr/bin/env python3
"""
Modelo Universal - Funciona em Qualquer Orientação
==================================================
Este modelo detecta anomalias baseado na VARIAÇÃO (vibração),
não nos valores absolutos. A gravidade é removida no pré-processamento.
"""

import numpy as np
from pathlib import Path

MODEL_PATH = Path("models/mahalanobis_model.npz")

def create_universal_model():
    """
    Cria modelo que funciona em qualquer orientação do sensor.
    
    Como funciona:
    1. O pré-processamento remove a média (gravidade)
    2. O modelo analisa apenas a VARIAÇÃO dos dados
    3. Sensor parado = variação baixa = normal
    4. Sensor vibrando = variação alta = possível anomalia
    """
    
    print("🔧 Criando modelo universal (qualquer orientação)...")
    print()
    
    # Número de features: 7 por eixo x 3 eixos = 21
    n_features = 21
    
    # Valores típicos de um sensor PARADO (após remover média):
    # - std: 0.02-0.1 (muito baixo)
    # - kurtosis: -1 a 1 (distribuição normal)
    # - peak_95: 0.05-0.2
    # - rms: 0.02-0.1
    # - range: 0.1-0.3
    # - mean_abs: 0.02-0.08
    # - skew: -0.5 a 0.5
    
    # Média esperada (sensor parado, após remover DC)
    mu = np.array([
        0.05, 0.0, 0.1, 0.05, 0.15, 0.04, 0.0,  # Eixo X
        0.05, 0.0, 0.1, 0.05, 0.15, 0.04, 0.0,  # Eixo Y
        0.05, 0.0, 0.1, 0.05, 0.15, 0.04, 0.0,  # Eixo Z
    ])
    
    # Variância esperada (quanto pode variar e ainda ser normal)
    variance = np.array([
        0.1, 2.0, 0.2, 0.1, 0.3, 0.1, 1.0,  # Eixo X
        0.1, 2.0, 0.2, 0.1, 0.3, 0.1, 1.0,  # Eixo Y
        0.1, 2.0, 0.2, 0.1, 0.3, 0.1, 1.0,  # Eixo Z
    ])
    
    cov = np.diag(variance)
    
    # Threshold MUITO conservador
    # Só detecta anomalia quando a vibração é MUITO alta
    threshold = 100.0
    
    # Salva modelo
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov,
        threshold=threshold,
        scaler_mean=mu,
        scaler_scale=np.sqrt(variance),
        model_type='universal_orientation_agnostic'
    )
    
    print(f"✅ Modelo salvo em: {MODEL_PATH}")
    print(f"🎯 Threshold: {threshold}")
    print()
    print("📋 Este modelo:")
    print("   - Funciona em QUALQUER orientação do sensor")
    print("   - Detecta anomalias baseado na VIBRAÇÃO, não na posição")
    print("   - É muito conservador (threshold alto)")
    print()
    print("🔄 Reinicie o servidor para usar o novo modelo:")
    print("   python start_production.py")
    
    return threshold

if __name__ == "__main__":
    create_universal_model()
