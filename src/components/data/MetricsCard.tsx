import React from 'react';
import { Chip } from '@mui/material';
import { FaCheckCircle, FaExclamationTriangle, FaArrowDown, FaThermometerHalf } from 'react-icons/fa';

interface MetricsCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  unit?: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  footer?: {
    status: string;
    date: string;
  };
  onClick?: () => void;
  className?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  subtitle,
  value,
  unit,
  status,
  icon,
  metrics,
  footer,
  onClick,
  className = ""
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return {
          color: 'success',
          icon: <FaCheckCircle />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'warning':
        return {
          color: 'warning',
          icon: <FaExclamationTriangle />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'error':
        return {
          color: 'error',
          icon: <FaArrowDown />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          color: 'info',
          icon: <FaThermometerHalf />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div 
      className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>{title}</h3>
              {subtitle && (
                <p className="text-xs" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{subtitle}</p>
              )}
            </div>
          </div>
          <Chip 
            icon={statusConfig.icon}
            label={`${value}${unit || ''}`}
            color={statusConfig.color as any}
            size="small"
            className="font-semibold"
          />
        </div>

        {/* Métricas */}
        {metrics && metrics.length > 0 && (
          <div className="space-y-2 mb-3">
            {metrics.map((metric, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{metric.label}:</span>
                <span className="font-medium" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
                  {metric.value}{metric.unit || ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>
            <div className="flex items-center justify-between">
              <Chip 
                label={footer.status}
                size="small"
                className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}
              />
              <span className="text-xs" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{footer.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard; 
