import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { SyncLoader } from '../../components/ui';

interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  source: string;
  timestamp: string;
  read: boolean;
}

const AlertasLogs: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      title: "Máquina A1 - Temperatura Alta",
      message: "A temperatura da máquina A1 ultrapassou o limite seguro de 85°C",
      type: "CRITICAL",
      source: "Máquina A1 - Linha 1",
      timestamp: "2024-10-13T14:30:00",
      read: false
    },
    {
      id: 2,
      title: "Manutenção Preventiva Agendada",
      message: "Manutenção preventiva da máquina B2 agendada para amanhã",
      type: "WARNING",
      source: "Sistema de Manutenção",
      timestamp: "2024-10-13T13:15:00",
      read: false
    },
    {
      id: 3,
      title: "Backup Concluído",
      message: "Backup automático do sistema concluído com sucesso",
      type: "SUCCESS",
      source: "Sistema",
      timestamp: "2024-10-13T03:00:00",
      read: true
    },
    {
      id: 4,
      title: "Novo Funcionário Cadastrado",
      message: "João Silva foi cadastrado no sistema",
      type: "INFO",
      source: "RH",
      timestamp: "2024-10-12T16:45:00",
      read: true
    },
    {
      id: 5,
      title: "Estoque Baixo - Parafusos M8",
      message: "O estoque de Parafusos M8 está abaixo do mínimo",
      type: "WARNING",
      source: "Estoque",
      timestamp: "2024-10-12T10:20:00",
      read: false
    },
    {
      id: 6,
      title: "Falha na Conexão - Sensor C3",
      message: "Sensor C3 não está respondendo",
      type: "CRITICAL",
      source: "Máquina C3 - Linha 2",
      timestamp: "2024-10-12T09:10:00",
      read: true
    },
    {
      id: 7,
      title: "Relatório Mensal Disponível",
      message: "O relatório de produção de setembro está disponível",
      type: "INFO",
      source: "Relatórios",
      timestamp: "2024-10-11T08:00:00",
      read: true
    },
    {
      id: 8,
      title: "Atualização do Sistema",
      message: "Nova versão do sistema será instalada na próxima manutenção",
      type: "INFO",
      source: "TI",
      timestamp: "2024-10-10T14:00:00",
      read: true
    }
  ]);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const handleStorageChange = () => checkTheme();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesRead = filterRead === "all" || 
                       (filterRead === "read" && alert.read) ||
                       (filterRead === "unread" && !alert.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL').length;
  const warningAlerts = alerts.filter(a => a.type === 'WARNING').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'error';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'SUCCESS': return 'success';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'Crítico';
      case 'WARNING': return 'Aviso';
      case 'INFO': return 'Informação';
      case 'SUCCESS': return 'Sucesso';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return <FaTimesCircle />;
      case 'WARNING': return <FaExclamationTriangle />;
      case 'INFO': return <FaInfoCircle />;
      case 'SUCCESS': return <FaCheckCircle />;
      default: return <FaBell />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <main className={`transition-all duration-300 pt-16 ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {loading ? (
          <div className="p-4 md:p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-4 md:p-6 min-h-screen animate-fadeInUp" style={{ background: 'var(--bg-gradient)' }}>
          <div className={`rounded-xl md:rounded-2xl shadow-sm border p-4 md:p-8 mb-4 md:mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FaBell className="text-xl md:text-2xl" />
              </div>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Alertas & Logs
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Monitoramento de alertas e eventos do sistema
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextField
                size="small"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Tipo</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Tipo"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="CRITICAL">Crítico</MenuItem>
                  <MenuItem value="WARNING">Aviso</MenuItem>
                  <MenuItem value="INFO">Informação</MenuItem>
                  <MenuItem value="SUCCESS">Sucesso</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Status</InputLabel>
                <Select value={filterRead} onChange={(e) => setFilterRead(e.target.value)} label="Status"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="unread">Não Lidos</MenuItem>
                  <MenuItem value="read">Lidos</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FaFilter />}
                sx={{ color: 'var(--primary)', borderColor: 'var(--primary)', textTransform: 'none',
                  '&:hover': { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } }}>
                Filtrar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {[
              { label: 'Total de Alertas', value: totalAlerts, icon: FaBell, color: '#3b82f6' },
              { label: 'Críticos', value: criticalAlerts, icon: FaTimesCircle, color: '#ef4444' },
              { label: 'Avisos', value: warningAlerts, icon: FaExclamationTriangle, color: '#eab308' },
              { label: 'Não Lidos', value: unreadAlerts, icon: FaInfoCircle, color: '#8b5cf6' }
            ].map((kpi, idx) => (
              <div key={idx} className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                style={{ borderColor: kpi.color }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{kpi.label}</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{kpi.value}</p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center`}
                    style={{ backgroundColor: isDarkMode ? `${kpi.color}30` : `${kpi.color}20` }}>
                    <kpi.icon className="text-2xl" style={{ color: kpi.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                } ${!alert.read ? 'border-l-4' : ''}`}
                style={!alert.read ? { borderLeftColor: alert.type === 'CRITICAL' ? '#ef4444' : alert.type === 'WARNING' ? '#eab308' : '#3b82f6' } : {}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                      style={{ 
                        backgroundColor: alert.type === 'CRITICAL' ? '#ef4444' : 
                                       alert.type === 'WARNING' ? '#eab308' : 
                                       alert.type === 'SUCCESS' ? '#10b981' : '#3b82f6'
                      }}
                    >
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {alert.title}
                        </h3>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <Chip 
                          label={getTypeText(alert.type)} 
                          color={getTypeColor(alert.type) as any} 
                          size="small" 
                          icon={getTypeIcon(alert.type)} 
                        />
                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          📍 {alert.source}
                        </span>
                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          🕐 {formatDate(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      textTransform: 'none',
                      minWidth: '100px',
                      '&:hover': {
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                      },
                    }}
                  >
                    {alert.read ? 'Marcar como não lido' : 'Marcar como lido'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className={`rounded-2xl shadow-sm border p-12 text-center ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <FaBell className={`text-6xl mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Nenhum alerta encontrado
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Não há alertas que correspondam aos filtros selecionados.
              </p>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
};

export default AlertasLogs;
