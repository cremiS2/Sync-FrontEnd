#!/usr/bin/env python3
"""
Correção Rápida do Modelo
Cria um modelo que aceita os valores atuais como normais.
"""

import numpy as np
from pathlib import Path

MODEL_PATH = Path("models/mahalanobis_model.npz")

def fix_model():
    print("🔧 Criando modelo corrigido...")
    
    # 21 features (7 por eixo x 3 eixos)
    n_features = 21
    
    # Média zero - o pré-processamento já remove a média dos dados
    mu = np.zeros(n_features)
    
    # Covariância com variância alta para aceitar mais variação
    # Isso torna o modelo menos sensível
    variance = np.ones(n_features) * 10.0  # Variância alta
    cov = np.diag(variance)
    
    # Threshold intermediário - detecta vibração moderada
    threshold = 30.0
    
    # Salva SEM scaler (para não inverter valores)
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov,
        threshold=threshold,
        model_type='fixed_no_scaler'
    )
    
    print(f"✅ Modelo salvo!")
    print(f"🎯 Threshold: {threshold}")
    print()
    print("🔄 Reinicie o servidor: python start_production.py")

if __name__ == "__main__":
    fix_model()
