import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '../utils/constants';
import { ENV_CONFIG } from '../config/environment';

const baseURL = ENV_CONFIG.getApiUrl();
const DEBUG_HTTP = ENV_CONFIG.isDebugEnabled();

// DEBUG: Verificar qual URL está sendo usada
console.log('=== CONFIGURAÇÃO HTTP ===');
console.log('Base URL configurada:', baseURL);
console.log('Ambiente:', ENV_CONFIG.getCurrentEnvironment());
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('========================');

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Endpoints públicos que não precisam de autenticação
  const publicEndpoints = ['/login', '/sign-in', '/forgot-password', '/reset-password'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  console.log('=== HTTP INTERCEPTOR REQUEST ===');
  console.log('URL:', `${config.baseURL || baseURL}${config.url || ''}`);
  console.log('Método:', config.method?.toUpperCase());
  console.log('É endpoint público?', isPublicEndpoint);
  console.log('Token encontrado:', !!token);
  console.log('Token (primeiros 30 chars):', token ? token.substring(0, 30) + '...' : 'null');
  
  // Não adicionar token em endpoints públicos
  if (isPublicEndpoint) {
    console.log('Endpoint público detectado - não adicionando token');
    return config;
  }
  
  if (token) {
    // Verificar se o token expirou
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        console.log('ATENÇÃO: Token expirado! Removendo...');
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        // Redirecionar para login
        window.location.href = '/login';
        return config;
      }
    } catch (error) {
      console.log('Token inválido! Removendo...');
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      window.location.href = '/login';
      return config;
    }
    
    console.log('Token encontrado: true');
    console.log('Token (primeiros 30 chars):', token.substring(0, 30) + '...');
    
    // Decodificar e mostrar o payload do token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('=== PAYLOAD DO TOKEN NA REQUISIÇÃO ===');
      console.log('sub (subject):', payload.sub);
      console.log('scope:', payload.scope);
      console.log('exp (expiration):', payload.exp, '(', new Date(payload.exp * 1000).toLocaleString(), ')');
      console.log('iss (issuer):', payload.iss);
      console.log('Payload completo:', payload);
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
    }
    
    // Garantir que o header Authorization seja adicionado corretamente
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header adicionado: Bearer ' + token.substring(0, 20) + '...');
  } else {
    console.log('ATENÇÃO: Nenhum token encontrado no localStorage!');
  }
  if (DEBUG_HTTP) {
    // Basic request logging
    // Note: avoid logging sensitive payloads in production
    // eslint-disable-next-line no-console
    console.log('[HTTP] Request:', {
      method: (config.method || 'get').toUpperCase(),
      url: `${config.baseURL || baseURL}${config.url || ''}`,
      params: config.params,
      hasAuth: Boolean(token),
      headers: config.headers,
      data: config.data ? JSON.stringify(config.data) : undefined
    });
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEBUG_HTTP) {
      // eslint-disable-next-line no-console
      console.log('[HTTP] Response:', {
        status: response.status,
        url: response.config?.url,
        method: (response.config?.method || 'get').toUpperCase(),
      });
    }
    return response;
  },
  (error) => {
    if (DEBUG_HTTP) {
      // eslint-disable-next-line no-console
      console.log(`[HTTP] Error:`, {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        headers: error.config?.headers,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data,
          config: {
            url: error.response?.config?.url,
            method: error.response?.config?.method,
            data: error.response?.config?.data
          }
        }
      });
    }
    
    // Log detalhado para erro 401
    if (error?.response?.status === 401) {
      console.error('=== HTTP INTERCEPTOR - ERRO 401 ===');
      console.error('URL completa:', `${error?.config?.baseURL || baseURL}${error?.config?.url || ''}`);
      console.error('Método:', error?.config?.method?.toUpperCase());
      console.error('Headers da requisição:', error?.config?.headers);
      console.error('Headers da resposta:', error?.response?.headers);
      console.error('Dados da resposta:', error?.response?.data);
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    }
    
    // Log detalhado para erro 403
    if (error?.response?.status === 403) {
      console.error('=== HTTP INTERCEPTOR - ERRO 403 FORBIDDEN ===');
      console.error('URL completa:', `${error?.config?.baseURL || baseURL}${error?.config?.url || ''}`);
      console.error('Método:', error?.config?.method?.toUpperCase());
      console.error('Headers da requisição:', error?.config?.headers);
      console.error('Headers da resposta:', error?.response?.headers);
      console.error('Dados da resposta:', error?.response?.data);
      console.error('Possíveis causas:');
      console.error('1. CORS não configurado no backend Azure');
      console.error('2. Firewall/WAF do Azure bloqueando');
      console.error('3. Endpoint requer autenticação mas não deveria');
      console.error('4. IP bloqueado ou rate limit');
    }
    
    // Log para erro de rede
    if (!error?.response) {
      console.error('=== HTTP INTERCEPTOR - ERRO DE REDE ===');
      console.error('Possível problema de CORS, timeout ou servidor offline');
      console.error('Código do erro:', error?.code);
      console.error('Mensagem:', error?.message);
      console.error('URL tentada:', `${error?.config?.baseURL || baseURL}${error?.config?.url || ''}`);
    }
    
    return Promise.reject(error);
  }
);

export default http;


