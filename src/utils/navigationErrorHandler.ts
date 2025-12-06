/**
 * Utilitário para tratamento de erros de navegação
 * Redireciona automaticamente para a página 404 em caso de erro
 */

export const handleNavigationError = (error: Error, navigate: (path: string) => void) => {
  console.error('Erro de navegação detectado:', error);
  
  // Redirecionar para página 404
  navigate('/404');
};

/**
 * Wrapper seguro para navegação que captura erros
 */
export const safeNavigate = (
  path: string, 
  navigate: (path: string) => void,
  fallbackPath: string = '/404'
) => {
  try {
    navigate(path);
  } catch (error) {
    console.error('Erro ao navegar para:', path, error);
    navigate(fallbackPath);
  }
};

/**
 * Hook personalizado para navegação segura (use dentro de componentes funcionais)
 */
export const useSafeNavigate = () => {
  const navigate = (path: string) => {
    try {
      window.location.href = path;
    } catch (error) {
      console.error('Erro ao navegar:', error);
      window.location.href = '/404';
    }
  };
  
  return navigate;
};
