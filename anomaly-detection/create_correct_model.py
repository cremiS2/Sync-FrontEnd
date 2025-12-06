#!/usr/bin/env python3
"""
Cria modelo correto com 15 features (5 por eixo x 3 eixos)
"""

import numpy as np
from pathlib import Path

MODEL_PATH = Path("models/mahalanobis_model.npz")

def create_model():
    print("🔧 Criando modelo corrigido...")
    
    # 15 features: 5 por eixo (std, kurtosis, peak, rms, peak_to_peak) x 3 eixos
    n_features = 15
    
    # Média zero (após remover DC, os dados ficam centrados em zero)
    mu = np.zeros(n_features)
    
    # Covariância - variância esperada para cada feature quando sensor parado
    # Valores típicos após remover média:
    # - std: ~0.05 (baixa variação)
    # - kurtosis: ~0 (pode variar bastante)
    # - peak: ~0.1
    # - rms: ~0.05
    # - peak_to_peak: ~0.2
    variance_per_feature = np.array([
        0.1, 3.0, 0.2, 0.1, 0.3,  # Eixo X
        0.1, 3.0, 0.2, 0.1, 0.3,  # Eixo Y
        0.1, 3.0, 0.2, 0.1, 0.3,  # Eixo Z
    ])
    
    cov = np.diag(variance_per_feature)
    
    # Threshold - distância acima da qual é anomalia
    # Valor mais sensível
    threshold = 3.0
    
    # Salva modelo
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov,
        threshold=threshold,
        model_type='corrected_15_features'
    )
    
    print(f"✅ Modelo salvo em: {MODEL_PATH}")
    print(f"📊 Features: {n_features}")
    print(f"🎯 Threshold: {threshold}")
    print()
    print("🔄 Reinicie o servidor: python start_production.py")

if __name__ == "__main__":
    create_model()
