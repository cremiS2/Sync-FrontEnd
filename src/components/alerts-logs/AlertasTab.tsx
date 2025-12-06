import React, { useState } from 'react';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaTimes, 
  FaCheckCircle, 
  FaEye, 
  FaCheck,
  FaPlus,
  FaFilter,
  FaSearch,
  FaCog,
  FaColumns,
  FaListUl,
  FaThLarge,
  FaEllipsisH
} from 'react-icons/fa';
import StatsCard from '../common/StatsCard';
import ItemCard from '../common/ItemCard';
import BoardTable from '../../components/common/BoardTable';
import type { BoardColumn, BoardAction } from '../../components/common/BoardTable';
import { 
  Button, 
  TextField, 
  InputAdornment, 
  Chip, 
  Menu, 
  MenuItem, 
  IconButton,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import type { Alert } from '../../shared/alertsLogsData';
import type { AlertStats, FilterConfig } from './types';

interface AlertasTabProps {
  alertsStats: AlertStats;
  filteredAlerts: Alert[];
  alertSearchTerm: string;
  onAlertSearchChange: (value: string) => void;
  alertFilterConfigs: FilterConfig[];
  onAlertDetails: (alert: Alert) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
}

const AlertasTab: React.FC<AlertasTabProps> = ({
  alertsStats,
  filteredAlerts,
  alertSearchTerm,
  onAlertSearchChange,
  onAlertDetails,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'cards'>('board');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <FaTimes className="text-red-500 text-lg" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500 text-lg" />;
      case 'info': return <FaBell className="text-blue-500 text-lg" />;
      case 'success': return <FaCheckCircle className="text-green-500 text-lg" />;
      default: return <FaBell className="text-gray-500 text-lg" />;
    }
  };

  const getAlertCardFields = (alert: Alert) => [
    { label: 'Origem', value: alert.source },
    { label: 'Tipo', value: alert.type },
    { label: 'Prioridade', value: alert.priority },
    { label: 'Status', value: alert.status },
    { label: 'Data', value: new Date(alert.createdAt).toLocaleString() }
  ];

  const handleViewModeChange = (mode: 'board' | 'cards') => {
    setViewMode(mode);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectionChange = (_selected: Alert[]) => {
    // Selection handling can be implemented if needed
  };

  const boardColumns: BoardColumn[] = [
    {
      id: 'title',
      label: 'Título',
      width: '30%',
      renderCell: (alert: Alert) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{alert.title}</span>
            <span className="text-xs text-gray-500 truncate max-w-xs">{alert.message}</span>
          </div>
        </div>
      )
    },
    {
      id: 'source',
      label: 'Origem',
      width: '15%',
      renderCell: (alert: Alert) => (
        <span className="text-gray-700">{alert.source}</span>
      )
    },
    {
      id: 'priority',
      label: 'Prioridade',
      width: '15%',
      renderCell: (alert: Alert) => {
        const priorityColors = {
          low: { bg: '#D1FAE5', text: '#059669' },
          medium: { bg: '#FEF3C7', text: '#D97706' },
          high: { bg: '#FEE2E2', text: '#DC2626' },
          critical: { bg: '#7F1D1D', text: '#FFFFFF' }
        };
        
        const color = priorityColors[alert.priority];
        
        return (
          <Chip 
            label={alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
            size="small"
            sx={{
              backgroundColor: color.bg,
              color: color.text,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        );
      }
    },
    {
      id: 'status',
      label: 'Status',
      width: '15%',
      renderCell: (alert: Alert) => {
        const statusColors = {
          active: { bg: '#FEE2E2', text: '#DC2626' },
          acknowledged: { bg: '#FEF3C7', text: '#D97706' },
          resolved: { bg: '#D1FAE5', text: '#059669' }
        };
        
        const color = statusColors[alert.status];
        
        return (
          <Chip 
            label={alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
            size="small"
            sx={{
              backgroundColor: color.bg,
              color: color.text,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        );
      }
    },
    {
      id: 'createdAt',
      label: 'Data',
      width: '15%',
      renderCell: (alert: Alert) => (
        <span className="text-gray-700">{new Date(alert.createdAt).toLocaleString()}</span>
      )
    },
    {
      id: 'assignedTo',
      label: 'Responsável',
      width: '10%',
      renderCell: (alert: Alert) => (
        alert.assignedTo ? (
          <div className="flex items-center gap-2">
            <Avatar 
              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
              alt={alert.assignedTo}
            >
              {alert.assignedTo.charAt(0)}
            </Avatar>
            <span className="text-gray-700 text-sm">{alert.assignedTo}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Não atribuído</span>
        )
      )
    }
  ];

  const boardActions: BoardAction[] = [
    {
      icon: <FaEye className="text-blue-600" />,
      label: 'Visualizar',
      onClick: onAlertDetails,
      color: '#2563EB'
    },
    {
      icon: <FaCheck className="text-yellow-600" />,
      label: 'Reconhecer',
      onClick: (alert) => onAcknowledgeAlert(alert.id),
      color: '#D97706',
      showCondition: (alert) => alert.status === 'active'
    },
    {
      icon: <FaCheckCircle className="text-green-600" />,
      label: 'Resolver',
      onClick: (alert) => onResolveAlert(alert.id),
      color: '#059669',
      showCondition: (alert) => alert.status === 'active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-500">Gerencie e monitore alertas do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="contained" 
            startIcon={<FaPlus />}
            sx={{
              backgroundColor: '#0073EA',
              '&:hover': {
                backgroundColor: '#0060C0'
              }
            }}
          >
            Novo Alerta
          </Button>
          
          <IconButton onClick={handleMenuClick}>
            <FaEllipsisH />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <FaFilter className="mr-2" /> Filtros Avançados
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <FaColumns className="mr-2" /> Personalizar Colunas
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <FaCog className="mr-2" /> Configurações
            </MenuItem>
          </Menu>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total de Alertas" 
          value={alertsStats.total} 
          icon={<FaBell className="text-blue-600" />} 
          color="#0073EA" 
        />
        <StatsCard 
          title="Alertas Ativos" 
          value={alertsStats.active} 
          icon={<FaExclamationTriangle className="text-orange-600" />} 
          color="#FF9900" 
        />
        <StatsCard 
          title="Alertas Críticos" 
          value={alertsStats.critical} 
          icon={<FaTimes className="text-red-600" />} 
          color="#E44258" 
        />
        <StatsCard 
          title="Alertas Resolvidos" 
          value={alertsStats.resolved} 
          icon={<FaCheckCircle className="text-green-600" />} 
          color="#00C875" 
        />
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <TextField
          placeholder="Buscar alertas..."
          value={alertSearchTerm}
          onChange={(e) => onAlertSearchChange(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-md">
            <Tooltip title="Visualização em Board">
              <IconButton 
                onClick={() => handleViewModeChange('board')}
                color={viewMode === 'board' ? 'primary' : 'default'}
              >
                <FaThLarge />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualização em Cards">
              <IconButton 
                onClick={() => handleViewModeChange('cards')}
                color={viewMode === 'cards' ? 'primary' : 'default'}
              >
                <FaListUl />
              </IconButton>
            </Tooltip>
          </div>
          
          <Button 
            variant="outlined" 
            startIcon={<FaFilter />}
            size="small"
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FaBell className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum alerta encontrado com os filtros aplicados</p>
        </div>
      ) : viewMode === 'board' ? (
        <BoardTable
          columns={boardColumns}
          data={filteredAlerts}
          actions={boardActions}
          onRowClick={onAlertDetails}
          selectable={true}
          onSelectionChange={handleSelectionChange}
          colorColumn="type"
          className="bg-white"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <ItemCard
              key={alert.id}
              title={alert.title}
              subtitle={alert.message}
              headerIcon={getAlertIcon(alert.type)}
              fields={getAlertCardFields(alert)}
              actions={[
                {
                  label: 'Visualizar',
                  onClick: () => onAlertDetails(alert),
                  variant: 'outlined' as const,
                  icon: <FaEye />
                },
                ...(alert.status === 'active' ? [
                  {
                    label: 'Reconhecer',
                    onClick: () => onAcknowledgeAlert(alert.id),
                    variant: 'contained' as const,
                    icon: <FaCheck />
                  },
                  {
                    label: 'Resolver',
                    onClick: () => onResolveAlert(alert.id),
                    variant: 'contained' as const,
                    icon: <FaCheckCircle />
                  }
                ] : [])
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasTab;
