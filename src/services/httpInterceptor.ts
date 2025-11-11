import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, logout, clearExpiredToken } from './auth';
import { ENV_CONFIG } from '../config/environment';

/**
 * Configuração do Axios com interceptors para:
 * 1. Adicionar token JWT automaticamente
 * 2. Tratar erros de autenticação
 * 3. Renovar token expirado
 * 4. Prevenir cache de requisições
 */

const httpClient: AxiosInstance = axios.create({
  baseURL: ENV_CONFIG.getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Prevenir cache
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Interceptor de requisição - Adiciona token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Verificar e limpar token expirado
    const tokenExpired = clearExpiredToken();
    
    if (tokenExpired) {
      console.warn('[HTTP Interceptor] Token expirado detectado');
      // Redirecionar para login
      window.location.href = '/login';
      return Promise.reject(new Error('Token expirado'));
    }

    // Adicionar token ao cabeçalho
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar timestamp para prevenir cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    console.log('[HTTP Interceptor] Requisição:', {
      method: config.method,
      url: config.url,
      hasToken: !!token
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('[HTTP Interceptor] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta - Trata erros
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[HTTP Interceptor] Resposta:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('[HTTP Interceptor] Erro na resposta:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });

    // Tratar erro 401 (Não autorizado)
    if (error.response?.status === 401) {
      console.warn('[HTTP Interceptor] Erro 401 - Não autorizado');
      
      // Limpar dados de autenticação
      logout();
      
      // Redirecionar para login
      window.location.href = '/login';
      
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    // Tratar erro 403 (Proibido)
    if (error.response?.status === 403) {
      console.warn('[HTTP Interceptor] Erro 403 - Acesso negado');
      
      // Verificar role do usuário
      const userRole = localStorage.getItem('userRole');
      const url = error.config?.url || '';
      
      // Mensagem específica para OPERADOR
      if (userRole === 'OPERADOR') {
        console.error(`[HTTP Interceptor] OPERADOR sem permissão para: ${url}`);
        console.error('[HTTP Interceptor] SOLUÇÃO: O backend precisa permitir OPERADOR fazer GET em recursos');
        
        return Promise.reject(new Error(
          'Seu usuário (OPERADOR) não tem permissão para acessar este recurso. ' +
          'Entre em contato com o administrador do sistema.'
        ));
      }
      
      return Promise.reject(new Error('Você não tem permissão para acessar este recurso.'));
    }

    // Tratar erro de rede
    if (!error.response) {
      console.error('[HTTP Interceptor] Erro de rede');
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
    }

    return Promise.reject(error);
  }
);

export default httpClient;
