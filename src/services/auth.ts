import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

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
  if (DEBUG_API) console.log('[auth] signIn payload:', { email: payload.email, roles: payload.roles });
  try {
    await http.post(API_ENDPOINTS.SIGN_IN, payload);
    if (DEBUG_API) console.log('[auth] signIn OK');
  } catch (err: any) {
    console.error('[auth] signIn FAIL:', { status: err?.response?.status, data: err?.response?.data });
    throw err;
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


