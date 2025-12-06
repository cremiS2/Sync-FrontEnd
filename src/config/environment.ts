// Configurações de ambiente
export const ENV_CONFIG = {
  // URLs da API para diferentes ambientes
  API_URLS: {
    development: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',  // ✅ Azure (padrão para desenvolvimento também)
    production: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',  // ✅ Azure para produção
    staging: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net'
  },
  
  // URL do servidor de monitoramento ESP32 (sensor de vibração)
  // Configure aqui o IP fixo do servidor de monitoramento
  ESP32_MONITOR_URL: import.meta.env.VITE_ESP32_MONITOR_URL || 'http://localhost:8000',
  
  // Detectar ambiente atual
  getCurrentEnvironment() {
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.PROD) return 'production';
    return 'development';
  },
  
  // Obter URL da API baseada no ambiente
  getApiUrl() {
    const env = this.getCurrentEnvironment();
    return import.meta.env.VITE_API_URL || this.API_URLS[env];
  },
  
  // Configurações de debug
  isDebugEnabled() {
    return import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === 'true';
  },
  
  // Obter URL do monitor ESP32
  getEsp32MonitorUrl() {
    return this.ESP32_MONITOR_URL;
  }
};

export default ENV_CONFIG;
