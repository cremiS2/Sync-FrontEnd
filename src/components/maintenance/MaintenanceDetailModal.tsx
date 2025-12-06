import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { FaCog, FaWrench, FaFire, FaTimes } from 'react-icons/fa';
import type { MaintenanceRecord } from '../../shared/maintenanceData';

interface MaintenanceDetailModalProps {
  open: boolean;
  onClose: () => void;
  maintenance: MaintenanceRecord | null;
}

const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  open,
  onClose,
  maintenance
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

  if (!maintenance) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <FaCog className="text-white text-xl" />;
      case 'corrective': return <FaWrench className="text-white text-xl" />;
      case 'emergency': return <FaFire className="text-white text-xl" />;
      default: return <FaCog className="text-white text-xl" />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
          borderRadius: '16px'
        }
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {getTypeIcon(maintenance.type)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{maintenance.title}</h2>
              <p className="text-sm text-white/80">{maintenance.machineName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all duration-200"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <DialogContent className="p-6" style={{ backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>Descrição</h4>
              <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{maintenance.description}</p>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>Técnico Responsável</h4>
              <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{maintenance.technician}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
              }}
            >
              <h4 className="font-bold mb-3" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>Informações</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>Data Agendada:</span>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
                    {new Date(maintenance.scheduledDate).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>Duração Estimada:</span>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
                    {maintenance.estimatedDuration}h
                  </span>
                </div>
                {maintenance.cost && (
                  <div className="flex justify-between">
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>Custo:</span>
                    <span className="font-semibold" style={{ color: '#3b82f6' }}>
                      R$ {maintenance.cost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions 
        className="p-4"
        style={{ 
          backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
          borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
        }}
      >
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#2563eb'
            }
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceDetailModal;
