// Configurações de ambiente
export const ENV_CONFIG = {
  // URLs da API para diferentes ambientes
  API_URLS: {
    development: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',
    production: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',
    staging: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net'
  },
  
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
  }
};

export default ENV_CONFIG;
