import http from './http';
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
  try {
    const { data } = await http.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.token);
      
      // Decodificar o token para extrair a role
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const role = payload.scope?.[0] || payload.role || payload.roles?.[0] || payload.authorities?.[0] || 'USER';
        localStorage.setItem('userRole', role);
      } catch (err) {
        localStorage.setItem('userRole', 'USER');
      }
    }
    return data;
  } catch (err: any) {
    throw err;
  }
}

export async function signIn(payload: SignInRequest): Promise<void> {
  const API_URL = ENV_CONFIG.getApiUrl();
  const url = `${API_URL}${API_ENDPOINTS.SIGN_IN}`;
  
  try {
    const userData = {
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName || payload.email.split('@')[0],
      username: payload.username || payload.email.split('@')[0],
      roles: payload.roles || ['OPERADOR']
    };
    
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

    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: 'Erro no servidor.' };
      }
    } catch (e) {
      responseData = { message: 'Erro ao processar a resposta do servidor' };
    }
    
    if (!response.ok) {
      throw new Error(responseData.message || `Erro ao criar conta (${response.status} ${response.statusText})`);
    }

    return responseData;
  } catch (err: any) {
    const errorMessage = err?.message || 'Erro ao criar conta. Verifique os dados e tente novamente.';
    const error = new Error(errorMessage);
    error.name = 'SignInError';
    error.cause = err;
    throw error;
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
  localStorage.removeItem('userRole');
  localStorage.removeItem('redirectAfterLogin');
}

export function clearExpiredToken(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  if (token) {
    if (token.startsWith('dev-bypass-token')) {
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        return true;
      }
    } catch (error) {
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const { data } = await http.post<ForgotPasswordResponse>(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return data;
  } catch (err: any) {
    throw err;
  }
}

export async function resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
  try {
    const { data } = await http.post<ResetPasswordResponse>(API_ENDPOINTS.RESET_PASSWORD, { 
      email, 
      newPassword 
    });
    return data;
  } catch (err: any) {
    throw err;
  }
}


