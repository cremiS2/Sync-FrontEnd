import React from 'react';

const ContentLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="flex gap-2">
        <div 
          className="w-4 h-4 rounded-full animate-bounce"
          style={{ backgroundColor: '#2563eb', animationDelay: '0ms' }}
        ></div>
        <div 
          className="w-4 h-4 rounded-full animate-bounce"
          style={{ backgroundColor: '#2563eb', animationDelay: '150ms' }}
        ></div>
        <div 
          className="w-4 h-4 rounded-full animate-bounce"
          style={{ backgroundColor: '#2563eb', animationDelay: '300ms' }}
        ></div>
      </div>
    </div>
  );
};

export default ContentLoader;
