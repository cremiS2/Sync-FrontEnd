import React from 'react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
        {/* Logo animado */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin"></div>
          <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-transparent border-b-[var(--primary-dark)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        
        {/* Mensagem */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
