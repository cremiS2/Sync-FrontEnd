import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, getToken } from '../services/auth';
import type { LoginRequest, LoginResponse } from '../services/auth';

interface User {
  email: string;
  role: string;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Decodificar token JWT
  const decodeToken = useCallback((token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub || payload.email,
        role: payload.scope?.[0] || payload.role || 'USER',
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  }, []);

  // Verificar se o token está expirado
  const isTokenExpired = useCallback((exp?: number): boolean => {
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  }, []);

  // Verificar autenticação
  const checkAuth = useCallback((): boolean => {
    const storedToken = getToken();
    
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return false;
    }

    const decodedUser = decodeToken(storedToken);
    
    if (!decodedUser || isTokenExpired(decodedUser.exp)) {
      logout();
      return false;
    }

    setUser(decodedUser);
    setToken(storedToken);
    return true;
  }, [decodeToken, isTokenExpired]);

  // Login
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await apiLogin(credentials);
      
      if (response.token) {
        const decodedUser = decodeToken(response.token);
        
        if (decodedUser) {
          setToken(response.token);
          setUser(decodedUser);
          
          // Redirecionar para a página salva ou dashboard
          const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [decodeToken, navigate]);

  // Logout
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setToken(null);
    
    // Limpar histórico e redirecionar
    navigate('/login', { replace: true });
    
    // Prevenir volta com botão do navegador
    window.history.pushState(null, '', '/login');
  }, [navigate]);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
    setIsLoading(false);
  }, [checkAuth]);

  // Verificar expiração do token periodicamente (a cada 7 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isTokenExpired(user.exp)) {
        logout();
      }
    }, 420000); // 7 minutos

    return () => clearInterval(interval);
  }, [user, isTokenExpired, logout]);

  // Prevenir navegação para trás após logout
  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        window.history.pushState(null, '', '/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
