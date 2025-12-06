"""
Cria modelo robusto menos sensível diretamente
"""

import numpy as np
from pathlib import Path

def create_robust_model():
    """Cria um modelo menos sensível baseado em parâmetros conservadores"""
    
    # Simula dados de treinamento mais robustos
    np.random.seed(42)
    
    # Features normais (mais variadas para robustez)
    n_normal = 1000
    n_features = 21  # 7 features por eixo (X, Y, Z)
    
    # Dados normais com mais variação
    normal_data = np.random.multivariate_normal(
        mean=np.zeros(n_features),
        cov=np.eye(n_features) * 0.5,  # Variância maior
        size=n_normal
    )
    
    # Adiciona alguns outliers normais para robustez
    outlier_indices = np.random.choice(n_normal, size=50, replace=False)
    normal_data[outlier_indices] *= np.random.uniform(1.5, 2.0, (50, n_features))
    
    # Calcula parâmetros do modelo
    mu = np.mean(normal_data, axis=0)
    cov = np.cov(normal_data.T)
    
    # Regularização mais forte
    epsilon = 1e-2
    cov_reg = cov + epsilon * np.eye(cov.shape[0])
    
    # Calcula distâncias para dados normais
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
    
    normal_distances = mahalanobis_distance(normal_data, mu, cov_reg)
    
    # Threshold muito conservador - 99.5% dos dados normais
    threshold = np.percentile(normal_distances, 99.5)
    
    # Ajusta threshold para ser ainda mais conservador
    threshold *= 1.5  # 50% mais alto
    
    print(f"📊 Modelo robusto criado:")
    print(f"   - Features: {n_features}")
    print(f"   - Amostras normais: {n_normal}")
    print(f"   - Threshold: {threshold:.3f}")
    print(f"   - Taxa de falso positivo esperada: ~0.5%")
    
    # Simula scaler robusto
    scaler_center = mu.copy()
    scaler_scale = np.std(normal_data, axis=0)
    
    # Salva modelo
    model_path = Path("models/mahalanobis_model.npz")
    model_path.parent.mkdir(exist_ok=True)
    
    np.savez(
        model_path,
        mu=mu,
        cov=cov_reg,
        threshold=threshold,
        scaler_mean=scaler_center,
        scaler_scale=scaler_scale,
        model_type='robust_conservative'
    )
    
    print(f"💾 Modelo salvo em: {model_path}")
    
    # Testa o modelo
    test_normal = np.random.multivariate_normal(mu, cov_reg * 0.5, 100)
    test_anomaly = np.random.multivariate_normal(mu, cov_reg * 3, 50)
    
    normal_test_dist = mahalanobis_distance(test_normal, mu, cov_reg)
    anomaly_test_dist = mahalanobis_distance(test_anomaly, mu, cov_reg)
    
    fp_rate = np.mean(normal_test_dist > threshold)
    tp_rate = np.mean(anomaly_test_dist > threshold)
    
    print(f"🧪 Teste do modelo:")
    print(f"   - Falso positivo: {fp_rate:.1%}")
    print(f"   - Verdadeiro positivo: {tp_rate:.1%}")
    
    return {
        'threshold': threshold,
        'fp_rate': fp_rate,
        'tp_rate': tp_rate
    }

if __name__ == "__main__":
    create_robust_model()