import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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
  if (!maintenance) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <FaCog className="text-blue-600" />;
      case 'corrective': return <FaWrench className="text-yellow-600" />;
      case 'emergency': return <FaFire className="text-red-600" />;
      default: return <FaCog />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(maintenance.type)}
            <div>
              <h2 className="text-xl font-semibold">{maintenance.title}</h2>
              <p className="text-sm opacity-90">{maintenance.machineName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-all duration-200 font-bold text-xl"
          >
            <FaTimes />
          </button>
        </div>
      </DialogTitle>
      <DialogContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-2 text-base">Descrição</h4>
              <p className="text-sm text-gray-800 font-medium">{maintenance.description}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-2 text-base">Técnico Responsável</h4>
              <p className="text-sm text-gray-800 font-medium">{maintenance.technician}</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3 text-base">Informações</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Data Agendada:</span>
                  <span className="text-gray-900 font-bold">{new Date(maintenance.scheduledDate).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Duração Estimada:</span>
                  <span className="text-gray-900 font-bold">{maintenance.estimatedDuration}h</span>
                </div>
                {maintenance.cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Custo:</span>
                    <span className="text-gray-900 font-bold">R$ {maintenance.cost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-6 border-t-2 border-gray-200">
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'var(--primary)'
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
