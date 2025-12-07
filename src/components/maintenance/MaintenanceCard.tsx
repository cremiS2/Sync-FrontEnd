import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { FaCalendarAlt, FaUser, FaClock, FaEye, FaEdit, FaCog, FaWrench, FaFire } from 'react-icons/fa';
import type { MaintenanceRecord } from '../../shared/maintenanceData';

interface MaintenanceCardProps {
  maintenance: MaintenanceRecord;
  onCardClick: (maintenance: MaintenanceRecord) => void;
  onEdit: (maintenance: MaintenanceRecord) => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  maintenance,
  onCardClick,
  onEdit
}) => {
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': 
        return { bg: '#059669', text: 'Concluída' };
      case 'in_progress': 
        return { bg: '#2563eb', text: 'Em Andamento' };
      case 'scheduled': 
        return { bg: '#0891b2', text: 'Agendada' };
      case 'overdue': 
        return { bg: '#dc2626', text: 'Atrasada' };
      case 'cancelled': 
        return { bg: '#475569', text: 'Cancelada' };
      default: 
        return { bg: '#475569', text: status };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': 
        return { bg: '#dc2626', text: 'CRÍTICA' };
      case 'high': 
        return { bg: '#f97316', text: 'ALTA' };
      case 'medium': 
        return { bg: '#3b82f6', text: 'MÉDIA' };
      case 'low': 
        return { bg: '#22c55e', text: 'BAIXA' };
      default: 
        return { bg: '#475569', text: priority.toUpperCase() };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <FaCog className="text-blue-500" />;
      case 'corrective': return <FaWrench className="text-yellow-500" />;
      case 'emergency': return <FaFire className="text-red-500" />;
      default: return <FaCog className="text-blue-500" />;
    }
  };

  return (
    <div 
      className="rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer p-4 overflow-hidden h-full flex flex-col"
      style={{ 
        backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
      }}
      onClick={() => onCardClick(maintenance)}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}
          >
            {getTypeIcon(maintenance.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold mb-1 truncate" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }} title={maintenance.title}>
              {maintenance.title}
            </h3>
            <p className="text-sm truncate" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }} title={maintenance.machineName}>
              {maintenance.machineName}
            </p>
          </div>
        </div>
        <span 
          className="px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: getStatusStyle(maintenance.status).bg }}
        >
          {getStatusStyle(maintenance.status).text}
        </span>
      </div>

      <div className="space-y-2 mb-4 flex-grow">
        <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
          <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{new Date(maintenance.scheduledDate).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
          <FaUser className="text-blue-500 flex-shrink-0" />
          <span className="truncate" title={maintenance.technician}>{maintenance.technician}</span>
        </div>
        <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
          <FaClock className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{maintenance.estimatedDuration}h estimadas</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span 
          className="px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: getPriorityStyle(maintenance.priority).bg }}
        >
          {getPriorityStyle(maintenance.priority).text}
        </span>
        {maintenance.cost && (
          <span className="text-sm font-semibold" style={{ color: isDarkMode ? '#22c55e' : '#16a34a' }}>
            R$ {maintenance.cost.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          variant="outlined"
          startIcon={<FaEye />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(maintenance);
          }}
          sx={{
            color: '#3b82f6',
            borderColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#3b82f6',
              color: 'white',
            },
          }}
          fullWidth
        >
          Visualizar
        </Button>
        <Button
          variant="outlined"
          startIcon={<FaEdit />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(maintenance);
          }}
          sx={{
            color: '#3b82f6',
            borderColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#3b82f6',
              color: 'white',
            },
          }}
          fullWidth
        >
          Editar
        </Button>
      </div>
    </div>
  );
};

export default MaintenanceCard;
