import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { ENV_CONFIG } from '../config/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  exp?: number;
}

export interface SignInRequest {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
  roles?: string[];
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (DEBUG_API) console.log('[auth] login payload:', { email: credentials.email });
  
  // Log detalhado do que está sendo enviado
  console.log('=== DADOS DO LOGIN ===');
  console.log('Email:', credentials.email);
  console.log('Password length:', credentials.password?.length);
  console.log('Endpoint:', API_ENDPOINTS.LOGIN);
  console.log('Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
  console.log('URL completa:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${API_ENDPOINTS.LOGIN}`);
  console.log('Payload completo:', JSON.stringify(credentials, null, 2));
  
  try {
    const { data } = await http.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.token);
      console.log('=== TOKEN SALVO ===');
      console.log('Token salvo no localStorage');
      console.log('Token (primeiros 30 chars):', data.token.substring(0, 30) + '...');
      
      // Verificar se foi salvo corretamente
      const savedToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      console.log('Verificação - Token recuperado:', savedToken ? savedToken.substring(0, 30) + '...' : 'null');
      console.log('Tokens são iguais:', data.token === savedToken);
    } else {
      console.error('ERRO: Resposta do login não contém token!');
      console.error('Dados da resposta:', data);
    }
    if (DEBUG_API) console.log('[auth] login OK');
    return data;
  } catch (err: any) {
    console.error('[auth] login FAIL:', { 
      status: err?.response?.status, 
      data: err?.response?.data,
      message: err?.response?.data?.message || err?.response?.data?.menssagem,
      url: err?.config?.url,
      method: err?.config?.method,
      headers: err?.config?.headers,
      baseURL: err?.config?.baseURL,
      fullError: err
    });
    
    // Log específico para erro 401
    if (err?.response?.status === 401) {
      console.error('=== ERRO 401 DETALHADO ===');
      console.error('Response headers:', err?.response?.headers);
      console.error('Request headers:', err?.config?.headers);
      console.error('Request data:', err?.config?.data);
    }
    
    // Log para erro de rede (CORS, etc)
    if (!err?.response) {
      console.error('=== ERRO DE REDE ===');
      console.error('Possível problema de CORS ou servidor offline');
      console.error('Error code:', err?.code);
      console.error('Error message:', err?.message);
    }
    
    throw err;
  }
}

export async function signIn(payload: SignInRequest): Promise<void> {
  console.log('[DEBUG] VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('[DEBUG] Todas as variáveis de ambiente:', import.meta.env);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const url = `${API_URL}${API_ENDPOINTS.SIGN_IN}`;
  
  console.log('[auth] signIn - Iniciando requisição para:', url);
  console.log('[auth] signIn payload:', { 
    email: payload.email, 
    password: '[PROTECTED]',
    fullName: payload.fullName,
    username: payload.username,
    roles: payload.roles 
  });
  
  try {
    // Preparar os dados no formato exato que o backend espera
    const userData = {
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName || payload.email.split('@')[0],
      username: payload.username || payload.email.split('@')[0],
      roles: payload.roles || ['OPERADOR'] // Roles válidas: ADMIN, GERENTE, OPERADOR
    };
    
    console.log('Enviando dados para a API:', JSON.stringify(userData, null, 2));
    
    // Usando fetch diretamente para ter mais controle sobre a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    console.log('[auth] signIn - Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Se não for JSON, pegar como texto (pode ser HTML de erro)
        const textResponse = await response.text();
        console.error('[auth] signIn - Resposta não é JSON:', textResponse.substring(0, 500));
        responseData = { message: 'Erro no servidor. Verifique os logs do Azure.' };
      }
    } catch (e) {
      console.error('[auth] signIn - Erro ao fazer parse da resposta:', e);
      responseData = { message: 'Erro ao processar a resposta do servidor' };
    }
    
    if (!response.ok) {
      console.error('[auth] signIn - Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      throw new Error(responseData.message || `Erro ao criar conta (${response.status} ${response.statusText})`);
    }

    console.log('[auth] signIn - Sucesso:', responseData);
    return responseData;
  } catch (err: any) {
    console.error('[auth] signIn ERROR:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    
    const errorMessage = err?.message || 'Erro ao criar conta. Verifique os dados e tente novamente.';
    const error = new Error(errorMessage);
    error.name = 'SignInError';
    error.cause = err;
    throw error;
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
  console.log('Token removido do localStorage');
}

export function clearExpiredToken(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  if (token) {
    try {
      // Decodificar o payload do JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        console.log('Token expirado detectado, removendo...');
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        return true;
      }
    } catch (error) {
      console.log('Token inválido detectado, removendo...');
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      return true;
    }
  }
  return false;
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}


