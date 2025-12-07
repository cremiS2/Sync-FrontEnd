import React, { useState, useEffect } from 'react';

const MaintenanceHeader: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
        Gestão de Manutenção
      </h1>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
        Controle de manutenções preventivas, corretivas e emergenciais
      </p>
    </div>
  );
};

export default MaintenanceHeader;
