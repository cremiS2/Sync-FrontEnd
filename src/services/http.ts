import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '../utils/constants';
import { ENV_CONFIG } from '../config/environment';

const baseURL = ENV_CONFIG.getApiUrl();
const DEBUG_HTTP = ENV_CONFIG.isDebugEnabled();

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  console.log('=== HTTP INTERCEPTOR REQUEST ===');
  console.log('URL:', `${config.baseURL || baseURL}${config.url || ''}`);
  console.log('Método:', config.method?.toUpperCase());
  console.log('Token encontrado:', !!token);
  console.log('Token (primeiros 30 chars):', token ? token.substring(0, 30) + '...' : 'null');
  
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
    
    // Garantir que o header Authorization seja adicionado corretamente
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // Método mais direto para adicionar o header
    config.headers['Authorization'] = `Bearer ${token}`;
    
    console.log('Authorization header adicionado:', config.headers['Authorization']?.substring(0, 20) + '...');
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


