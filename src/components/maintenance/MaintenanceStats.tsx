import React, { useState, useEffect } from 'react';
import { FaTools, FaCheckCircle, FaExclamationTriangle, FaDollarSign } from 'react-icons/fa';

interface MaintenanceStatsProps {
  stats: {
    totalMaintenance: number;
    completed: number;
    overdue: number;
    averageCost: number;
  };
}

const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({ stats }) => {
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

  const statCards = [
    {
      title: 'Total de Manutenções',
      value: stats.totalMaintenance,
      subtitle: 'Este mês',
      icon: <FaTools />,
      color: '#2563eb',
      bgColor: isDarkMode ? '#1e40af' : '#bfdbfe',
      iconBg: isDarkMode ? '#3b82f6' : '#2563eb'
    },
    {
      title: 'Concluídas',
      value: stats.completed,
      subtitle: `${Math.round((stats.completed / stats.totalMaintenance) * 100)}% do total`,
      icon: <FaCheckCircle />,
      color: '#059669',
      bgColor: isDarkMode ? '#047857' : '#a7f3d0',
      iconBg: isDarkMode ? '#10b981' : '#059669'
    },
    {
      title: 'Atrasadas',
      value: stats.overdue,
      subtitle: 'Requer atenção',
      icon: <FaExclamationTriangle />,
      color: '#dc2626',
      bgColor: isDarkMode ? '#b91c1c' : '#fecaca',
      iconBg: isDarkMode ? '#ef4444' : '#dc2626'
    },
    {
      title: 'Custo Médio',
      value: `R$ ${stats.averageCost}`,
      subtitle: 'Por manutenção',
      icon: <FaDollarSign />,
      color: '#0891b2',
      bgColor: isDarkMode ? '#0e7490' : '#a5f3fc',
      iconBg: isDarkMode ? '#06b6d4' : '#0891b2'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          style={{ 
            backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: stat.color }}>
                {stat.title}
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
                {stat.value}
              </p>
              <p className="text-sm mt-2" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
                {stat.subtitle}
              </p>
            </div>
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: stat.iconBg }}
            >
              <span className="text-white text-2xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceStats;
