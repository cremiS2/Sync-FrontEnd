import React from 'react';

interface SectionLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ 
  message = 'Carregando dados...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Spinner animado */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin"></div>
      </div>
      
      {/* Mensagem */}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default SectionLoader;
