import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { clearExpiredToken } from '../../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Pode ser uma role ou múltiplas separadas por vírgula (ex: "ADMIN,GERENTE")
}

/**
 * ProtectedRoute - Componente para proteger rotas que requerem autenticação
 * 
 * Funcionalidades:
 * - Verifica se o usuário está autenticado
 * - Verifica se o token está expirado
 * - Verifica permissões/roles
 * - Previne cache de páginas protegidas
 * - Salva URL para redirecionamento após login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  
  // Adicionar meta tags para prevenir cache
  useEffect(() => {
    // Prevenir cache da página
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

    // Prevenir volta com botão do navegador
    const handlePopState = () => {
      const token = localStorage.getItem('user_token');
      if (!token) {
        window.history.pushState(null, '', '/login');
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Verificar e limpar token expirado
  const tokenExpired = clearExpiredToken();
  
  if (tokenExpired) {
    console.log('[ProtectedRoute] Token expirado, redirecionando para login');
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  // Verificar se o usuário está autenticado
  const token = localStorage.getItem('user_token');
  const userRole = localStorage.getItem('userRole');

  console.log('[ProtectedRoute] Verificando acesso:', {
    path: location.pathname,
    hasToken: !!token,
    userRole,
    requiredRole
  });

  if (!token) {
    console.log('[ProtectedRoute] Sem token, redirecionando para login');
    // Salvar a URL atual para redirecionar após o login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    // Se não estiver autenticado, redireciona para login
    return <Navigate to="/login" replace />;
  }

  // Se requer uma role específica, verificar
  if (requiredRole) {
    // Suportar múltiplas roles separadas por vírgula
    const allowedRoles = requiredRole.split(',').map(r => r.trim());
    const hasPermission = allowedRoles.includes(userRole || '');
    
    if (!hasPermission) {
      console.log('[ProtectedRoute] Role insuficiente, redirecionando para acesso negado');
      console.log(`Roles permitidas: ${allowedRoles.join(', ')}, Role do usuário: ${userRole}`);
      // Se não tiver a role necessária, redireciona para página de acesso negado
      return <Navigate to="/access-denied" replace />;
    }
  }

  console.log('[ProtectedRoute] Acesso permitido');
  // Se passou nas verificações, renderiza o componente
  return <>{children}</>;
};

export default ProtectedRoute;
