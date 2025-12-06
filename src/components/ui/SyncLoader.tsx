import React from 'react';

const SyncLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="text-center">
        <h2 
          className="text-3xl md:text-4xl mb-4"
          style={{ 
            color: '#ffffff',
            fontFamily: "'Orbitron', 'Rajdhani', 'Roboto Mono', monospace",
            fontWeight: 700,
            letterSpacing: '0.2em'
          }}
        >
          SYNC
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-bounce sync-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-bounce sync-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-bounce sync-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SyncLoader;
