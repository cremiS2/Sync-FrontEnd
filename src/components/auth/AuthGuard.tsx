import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * AuthGuard - Componente que protege rotas e previne cache
 * 
 * Funcionalidades:
 * 1. Verifica autenticação antes de renderizar
 * 2. Previne cache de páginas protegidas
 * 3. Bloqueia navegação pelo histórico após logout
 * 4. Redireciona usuários não autenticados
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Configurar cabeçalhos para prevenir cache
    const preventCache = () => {
      // Adicionar meta tags para prevenir cache
      const metaTags = [
        { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { httpEquiv: 'Pragma', content: 'no-cache' },
        { httpEquiv: 'Expires', content: '0' }
      ];

      metaTags.forEach(({ httpEquiv, content }) => {
        let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('http-equiv', httpEquiv);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    };

    preventCache();

    // Verificar autenticação
    const isAuth = checkAuth();
    
    if (!isAuth) {
      // Salvar URL para redirecionar após login
      localStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/login', { replace: true });
      return;
    }

    // Verificar role se necessário
    if (requiredRole && user?.role !== requiredRole) {
      console.warn(`Acesso negado. Role necessária: ${requiredRole}, Role do usuário: ${user?.role}`);
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [isAuthenticated, user, requiredRole, navigate, location.pathname, checkAuth]);

  // Prevenir volta com botão do navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!isAuthenticated) {
        event.preventDefault();
        window.history.pushState(null, '', '/login');
        navigate('/login', { replace: true });
      }
    };

    // Adicionar estado ao histórico
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, navigate]);

  // Prevenir cache ao sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Limpar cache do navegador
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Não renderizar até verificar autenticação
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
