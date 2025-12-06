"""
Treinamento de Modelo Robusto - Menos Sensível
Ajusta o modelo ML para ser menos reativo a ruído e vibrações normais.
"""

from pathlib import Path
import numpy as np
from scipy import stats as scipy_stats
import matplotlib.pyplot as plt
from sklearn.preprocessing import RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.covariance import EmpiricalCovariance
import warnings
warnings.filterwarnings('ignore')

# Configuração
DATASET_PATH = Path("datasets/ac")
NORMAL_OPS = ["silent_0_baseline"]
ANOMALY_OPS = [
    "medium_0", "high_0", "silent_1", "medium_1", "high_1"
]
MODEL_PATH = Path("models/mahalanobis_model.npz")

def load_and_extract_features(file_path, add_noise=False):
    """Extrai features mais robustas com menos sensibilidade a ruído"""
    try:
        data = np.genfromtxt(file_path, delimiter=",")
        if data.size == 0:
            return None
            
        # Remove DC offset
        data = data - np.mean(data, axis=0)
        
        # Adiciona ruído apenas se solicitado (para dados de treino)
        if add_noise:
            # Ruído mais forte para tornar o modelo mais robusto
            noise_level = 0.1 * np.std(data, axis=0)
            noise = np.random.normal(0, noise_level, data.shape)
            data = data + noise
        
        # Aplica filtro passa-baixa simples para reduzir ruído de alta frequência
        if len(data) > 5:
            # Média móvel simples
            kernel = np.ones(3) / 3
            for i in range(data.shape[1]):
                data[:, i] = np.convolve(data[:, i], kernel, mode='same')
        
        # Extrai features mais robustas
        features = []
        for axis_idx in range(data.shape[1]):
            axis_data = data[:, axis_idx]
            
            # Features estatísticas robustas
            features.extend([
                np.std(axis_data),                           # Desvio padrão
                scipy_stats.kurtosis(axis_data),             # Curtose
                np.percentile(np.abs(axis_data), 95),        # 95º percentil (mais robusto que max)
                np.sqrt(np.mean(np.square(axis_data))),      # RMS
                np.percentile(axis_data, 95) - np.percentile(axis_data, 5),  # Range robusto
                np.mean(np.abs(axis_data)),                  # Média absoluta
                scipy_stats.skew(axis_data),                 # Assimetria
            ])
        
        return np.array(features)
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return None

def get_data_files(operations):
    """Coleta arquivos de dados"""
    files = []
    for op in operations:
        op_path = DATASET_PATH / op
        if op_path.exists():
            files.extend(list(op_path.glob("*.csv")))
    return files

def create_robust_dataset(files, max_samples=200, add_noise=False):
    """Cria dataset com features mais robustas"""
    if len(files) > max_samples:
        files = np.random.choice(files, max_samples, replace=False)
    
    features_list = []
    for file in files:
        features = load_and_extract_features(file, add_noise=add_noise)
        if features is not None and not np.any(np.isnan(features)):
            features_list.append(features)
    
    if not features_list:
        raise ValueError("Nenhuma feature válida foi extraída")
    
    return np.array(features_list)

def robust_mahalanobis_distance(x, mu, cov):
    """Calcula distância de Mahalanobis com regularização robusta"""
    x_mu = x - mu
    
    # Regularização mais forte para estabilidade
    epsilon = 1e-3  # Aumentado de 1e-6
    cov_reg = cov + epsilon * np.eye(cov.shape[0])
    
    try:
        # Usa decomposição SVD para maior estabilidade numérica
        U, s, Vt = np.linalg.svd(cov_reg)
        # Limita valores singulares mínimos
        s = np.maximum(s, epsilon)
        cov_inv = (Vt.T * (1.0 / s)) @ Vt
        
        if x_mu.ndim == 1:
            mahal = np.sqrt(np.dot(np.dot(x_mu, cov_inv), x_mu))
        else:
            mahal = np.sqrt(np.sum(np.dot(x_mu, cov_inv) * x_mu, axis=1))
        
        return np.clip(mahal, 0, 100)  # Limita valores extremos
    except np.linalg.LinAlgError:
        # Fallback para distância euclidiana normalizada
        return np.sqrt(np.sum(x_mu**2, axis=-1)) / np.sqrt(len(mu))

def find_conservative_threshold(normal_distances, anomaly_distances):
    """Encontra threshold conservador que minimiza falsos positivos"""
    
    # Usa percentis mais altos para ser menos sensível
    normal_95 = np.percentile(normal_distances, 95)
    normal_99 = np.percentile(normal_distances, 99)
    normal_999 = np.percentile(normal_distances, 99.9)
    
    anomaly_05 = np.percentile(anomaly_distances, 5)
    anomaly_25 = np.percentile(anomaly_distances, 25)
    
    print(f"Normal distances - 95%: {normal_95:.3f}, 99%: {normal_99:.3f}, 99.9%: {normal_999:.3f}")
    print(f"Anomaly distances - 5%: {anomaly_05:.3f}, 25%: {anomaly_25:.3f}")
    
    # Escolhe threshold conservador
    # Prioriza baixo falso positivo sobre alta detecção
    candidate_thresholds = [
        normal_99,                                    # 1% falso positivo
        normal_999,                                   # 0.1% falso positivo
        (normal_99 + anomaly_25) / 2,                # Meio termo
        normal_95 * 1.5,                             # 50% acima do 95º percentil
    ]
    
    best_threshold = None
    best_score = -np.inf
    
    for threshold in candidate_thresholds:
        # Calcula métricas
        fp_rate = np.mean(normal_distances > threshold)
        tp_rate = np.mean(anomaly_distances > threshold)
        
        # Score que penaliza muito falsos positivos
        # Queremos FP < 1% e TP > 50%
        if fp_rate < 0.02:  # Menos de 2% falso positivo
            score = tp_rate - (10 * fp_rate)  # Penalidade alta para FP
        else:
            score = -10  # Penalidade severa se FP > 2%
        
        print(f"Threshold {threshold:.3f}: FP={fp_rate:.1%}, TP={tp_rate:.1%}, Score={score:.3f}")
        
        if score > best_score:
            best_score = score
            best_threshold = threshold
    
    # Se nenhum threshold foi bom, usa o mais conservador
    if best_threshold is None:
        best_threshold = normal_999
        print(f"Usando threshold ultra-conservador: {best_threshold:.3f}")
    
    return best_threshold

def train_robust_model():
    """Treina modelo robusto menos sensível"""
    print("🔧 Treinando modelo robusto menos sensível...")
    
    # Carrega arquivos
    normal_files = get_data_files(NORMAL_OPS)
    anomaly_files = get_data_files(ANOMALY_OPS)
    
    print(f"📁 Normal: {len(normal_files)} arquivos")
    print(f"📁 Anomaly: {len(anomaly_files)} arquivos")
    
    if len(normal_files) == 0:
        raise ValueError("Nenhum arquivo normal encontrado!")
    
    # Divide dados normais
    train_files, test_files = train_test_split(
        normal_files, test_size=0.3, random_state=42
    )
    
    # Cria datasets com mais amostras para robustez
    print("📊 Extraindo features...")
    X_train = create_robust_dataset(train_files, max_samples=300, add_noise=True)
    X_test = create_robust_dataset(test_files, max_samples=100, add_noise=False)
    
    if len(anomaly_files) > 0:
        X_anomaly = create_robust_dataset(anomaly_files, max_samples=100, add_noise=False)
    else:
        # Cria anomalias sintéticas se não houver dados
        print("⚠️ Criando anomalias sintéticas...")
        X_anomaly = X_test.copy()
        # Multiplica por fator para simular anomalias
        X_anomaly = X_anomaly * np.random.uniform(2, 5, X_anomaly.shape)
    
    print(f"📈 Train: {len(X_train)}, Test: {len(X_test)}, Anomaly: {len(X_anomaly)}")
    
    # Usa RobustScaler ao invés de StandardScaler (menos sensível a outliers)
    from sklearn.preprocessing import RobustScaler
    scaler = RobustScaler(quantile_range=(10.0, 90.0))  # Usa range mais robusto
    
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_anomaly_scaled = scaler.transform(X_anomaly)
    
    # Treina modelo com covariância robusta
    print("🧠 Treinando modelo...")
    
    # Usa estimador robusto de covariância
    robust_cov = EmpiricalCovariance(assume_centered=False)
    robust_cov.fit(X_train_scaled)
    
    mu = robust_cov.location_
    cov = robust_cov.covariance_
    
    # Calcula distâncias
    print("📏 Calculando distâncias...")
    normal_distances = robust_mahalanobis_distance(X_test_scaled, mu, cov)
    anomaly_distances = robust_mahalanobis_distance(X_anomaly_scaled, mu, cov)
    
    # Encontra threshold conservador
    print("🎯 Encontrando threshold...")
    threshold = find_conservative_threshold(normal_distances, anomaly_distances)
    
    # Avalia modelo
    fp_rate = np.mean(normal_distances > threshold)
    tp_rate = np.mean(anomaly_distances > threshold)
    
    print(f"\n✅ Modelo treinado!")
    print(f"🎯 Threshold: {threshold:.3f}")
    print(f"📊 Taxa de Falso Positivo: {fp_rate:.1%}")
    print(f"📊 Taxa de Verdadeiro Positivo: {tp_rate:.1%}")
    
    # Salva modelo
    MODEL_PATH.parent.mkdir(exist_ok=True)
    np.savez(
        MODEL_PATH,
        mu=mu,
        cov=cov,
        threshold=threshold,
        scaler_mean=scaler.center_,
        scaler_scale=scaler.scale_,
        model_type='robust'
    )
    
    print(f"💾 Modelo salvo em: {MODEL_PATH}")
    
    # Plota distribuições
    try:
        plt.figure(figsize=(12, 6))
        plt.hist(normal_distances, bins=50, alpha=0.7, label='Normal', color='green', density=True)
        plt.hist(anomaly_distances, bins=50, alpha=0.7, label='Anomaly', color='red', density=True)
        plt.axvline(threshold, color='black', linestyle='--', label=f'Threshold: {threshold:.3f}')
        plt.xlabel('Mahalanobis Distance')
        plt.ylabel('Density')
        plt.title('Distribuição de Distâncias - Modelo Robusto')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig('model_distribution.png', dpi=150, bbox_inches='tight')
        plt.show()
        print("📈 Gráfico salvo como 'model_distribution.png'")
    except Exception as e:
        print(f"⚠️ Erro ao plotar: {e}")
    
    return {
        'threshold': threshold,
        'fp_rate': fp_rate,
        'tp_rate': tp_rate,
        'normal_distances': normal_distances,
        'anomaly_distances': anomaly_distances
    }

if __name__ == "__main__":
    results = train_robust_model()