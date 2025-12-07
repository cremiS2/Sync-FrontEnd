import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Redirecionar para página 404 após um pequeno delay
    setTimeout(() => {
      this.props.navigate('/404');
    }, 100);
  }

  public render() {
    if (this.state.hasError) {
      // Renderizar temporariamente enquanto redireciona
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-red-600 font-semibold">Redirecionando para página de erro...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper funcional para usar o hook useNavigate
const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  return <ErrorBoundaryClass navigate={navigate}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
