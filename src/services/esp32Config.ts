// Serviço para obter a URL do monitor ESP32 dinamicamente
// Lê do config.json do servidor de monitoramento

interface Esp32Config {
  host: string;
  port: number;
  url: string;
}

let cachedConfig: Esp32Config | null = null;

// URL base do servidor de monitoramento (pode ser configurada via env ou usa padrão)
const getBaseUrl = (): string => {
  return import.meta.env.VITE_ESP32_MONITOR_URL || 'http://localhost:8000';
};

export async function getEsp32MonitorUrl(): Promise<string> {
  // Se já tem cache, retorna
  if (cachedConfig) {
    return cachedConfig.url;
  }

  try {
    // Tenta buscar a config do servidor
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/config`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // timeout de 3s
    });
    
    if (response.ok) {
      cachedConfig = await response.json();
      return cachedConfig!.url;
    }
  } catch (error) {
    console.warn('Não foi possível obter config do ESP32, usando URL padrão:', error);
  }

  // Fallback para a URL base
  return getBaseUrl();
}

// Limpa o cache (útil se o config mudar)
export function clearEsp32ConfigCache(): void {
  cachedConfig = null;
}
