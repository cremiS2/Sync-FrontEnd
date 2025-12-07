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
  // Endpoints públicos que não precisam de autenticação
  const publicEndpoints = ['/login', '/sign-in', '/forgot-password', '/reset-password'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  
  // Não adicionar token em endpoints públicos
  if (isPublicEndpoint) {
    return config;
  }
  
  if (token) {
    // Verificar se o token expirou
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        window.location.href = '/login';
        return config;
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      window.location.href = '/login';
      return config;
    }
    
    // Garantir que o header Authorization seja adicionado corretamente
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (DEBUG_HTTP) {
    console.log('[HTTP] Request:', {
      method: (config.method || 'get').toUpperCase(),
      url: `${config.baseURL || baseURL}${config.url || ''}`,
    });
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEBUG_HTTP) {
      console.log('[HTTP] Response:', {
        status: response.status,
        url: response.config?.url,
      });
    }
    return response;
  },
  (error) => {
    // Extrair mensagem de erro do backend
    let errorMessage = 'Erro ao processar requisição';
    
    if (error.response?.data) {
      // Tentar extrair mensagem do backend (vários formatos possíveis)
      errorMessage = error.response.data.message 
        || error.response.data.error 
        || error.response.data.menssagem // typo comum no backend
        || error.response.data.msg
        || errorMessage;
    }
    
    // Adicionar mensagem amigável ao erro
    error.userMessage = errorMessage;
    
    if (DEBUG_HTTP) {
      console.log('[HTTP] Error:', {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
      });
    }
    
    // Tratar erro 401 (não autorizado)
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default http;


