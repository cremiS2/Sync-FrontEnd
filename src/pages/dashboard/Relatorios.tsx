import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FaChartLine, FaEye, FaFilter, FaIndustry, FaChartBar, FaChartPie, FaCog, FaPrint, FaShare, FaFileExport } from 'react-icons/fa';

type ProductionData = {
  mes: string;
  meta: number;
  realizado: number;
  eficiencia: number;
};

type EfficiencyData = {
  setor: string;
  eficiencia: number;
  producao: number;
  meta: number;
};

type QualityData = {
  categoria: string;
  quantidade: number;
  percentual: number;
};

type MaintenanceData = {
  maquina: string;
  horas: number;
  manutencoes: number;
  status: string;
};

type ReportData = ProductionData | EfficiencyData | QualityData | MaintenanceData;

const Relatorios: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  const [selectedReport, setSelectedReport] = useState('producao');
  const [dateRange, setDateRange] = useState('7d');
  const [department, setDepartment] = useState('todos');

  const productionData = [
    { mes: 'Jan', meta: 1000, realizado: 950, eficiencia: 95 },
    { mes: 'Fev', meta: 1000, realizado: 1020, eficiencia: 102 },
    { mes: 'Mar', meta: 1000, realizado: 980, eficiencia: 98 },
    { mes: 'Abr', meta: 1000, realizado: 1050, eficiencia: 105 },
    { mes: 'Mai', meta: 1000, realizado: 990, eficiencia: 99 },
    { mes: 'Jun', meta: 1000, realizado: 1030, eficiencia: 103 },
  ];

  const efficiencyByDepartment = [
    { setor: 'Corte', eficiencia: 94, producao: 320, meta: 300 },
    { setor: 'Montagem', eficiencia: 89, producao: 210, meta: 250 },
    { setor: 'Embalagem', eficiencia: 91, producao: 180, meta: 180 },
    { setor: 'Expedição', eficiencia: 96, producao: 140, meta: 140 },
  ];

  const qualityData = [
    { categoria: 'Aprovado', quantidade: 1850, percentual: 92.5 },
    { categoria: 'Reprovado', quantidade: 100, percentual: 5.0 },
    { categoria: 'Em Análise', quantidade: 50, percentual: 2.5 },
  ];

  const maintenanceData = [
    { maquina: 'Prensa 1', horas: 720, manutencoes: 3, status: 'Operacional' },
    { maquina: 'Prensa 2', horas: 680, manutencoes: 5, status: 'Manutenção' },
    { maquina: 'Cortadora', horas: 750, manutencoes: 2, status: 'Operacional' },
    { maquina: 'Empacotadora', horas: 690, manutencoes: 4, status: 'Operacional' },
  ];

  const getReportData = () => {
    switch (selectedReport) {
      case 'producao':
        return productionData;
      case 'eficiencia':
        return efficiencyByDepartment;
      case 'qualidade':
        return qualityData;
      case 'manutencao':
        return maintenanceData;
      default:
        return productionData;
    }
  };

  const getItemDisplayName = (item: ReportData): string => {
    if ('mes' in item) return item.mes;
    if ('setor' in item) return item.setor;
    if ('categoria' in item) return item.categoria;
    if ('maquina' in item) return item.maquina;
    return 'Item';
  };

  const getItemDescription = (item: ReportData): string => {
    if ('meta' in item) return `Meta: ${item.meta}`;
    if ('eficiencia' in item) return `Eficiência: ${item.eficiencia}%`;
    if ('quantidade' in item) return `${item.quantidade} unidades`;
    if ('horas' in item) return `${item.horas}h operação`;
    return '';
  };

  const getItemValue = (item: ReportData): number => {
    if ('realizado' in item) return item.realizado;
    if ('producao' in item) return item.producao;
    if ('percentual' in item) return item.percentual;
    if ('manutencoes' in item) return item.manutencoes;
    return 0;
  };

  const getItemSubValue = (item: ReportData): string => {
    if ('eficiencia' in item) return `${item.eficiencia}%`;
    if ('percentual' in item) return `${item.percentual}%`;
    if ('status' in item) return item.status;
    return 'Unidades';
  };

  const handleExport = (format: string) => {
    console.log(`Exportando relatório em ${format}`);
  };

  // Sincronizar com o tema do Header
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Verificar tema inicial
    checkTheme();

    // Observar mudanças no tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Também escutar mudanças no localStorage
    const handleStorageChange = () => {
      checkTheme();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'producao': return 'Relatório de Produção';
      case 'eficiencia': return 'Relatório de Eficiência';
      case 'qualidade': return 'Relatório de Qualidade';
      case 'manutencao': return 'Relatório de Manutenção';
      default: return 'Relatório';
    }
  };

  const getReportDescription = () => {
    switch (selectedReport) {
      case 'producao': return 'Análise detalhada da produção mensal e metas atingidas';
      case 'eficiencia': return 'Eficiência por departamento e indicadores de performance';
      case 'qualidade': return 'Controle de qualidade e taxa de aprovação';
      case 'manutencao': return 'Status das máquinas e histórico de manutenções';
      default: return 'Relatório detalhado';
    }
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className={`transition-all duration-300 pt-16 ml-0 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        <div className="p-4 md:p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
          {/* Monday.com Style Header */}
          <div className={`rounded-xl md:rounded-2xl shadow-sm border p-4 md:p-8 mb-4 md:mb-8 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Relatórios</h1>
                <p className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Análise detalhada de dados e performance</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Filtros e Controles</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormControl fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--muted)' }}>Tipo de Relatório</InputLabel>
                <Select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  label="Tipo de Relatório"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary)',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="producao">Produção</MenuItem>
                  <MenuItem value="eficiencia">Eficiência</MenuItem>
                  <MenuItem value="qualidade">Qualidade</MenuItem>
                  <MenuItem value="manutencao">Manutenção</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--muted)' }}>Período</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Período"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary)',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="7d">Últimos 7 dias</MenuItem>
                  <MenuItem value="30d">Últimos 30 dias</MenuItem>
                  <MenuItem value="90d">Últimos 90 dias</MenuItem>
                  <MenuItem value="1y">Último ano</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--muted)' }}>Departamento</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  label="Departamento"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary)',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="corte">Corte</MenuItem>
                  <MenuItem value="montagem">Montagem</MenuItem>
                  <MenuItem value="embalagem">Embalagem</MenuItem>
                  <MenuItem value="expedicao">Expedição</MenuItem>
                </Select>
              </FormControl>

              <div className="flex gap-2">
                <Button
                  variant="contained"
                  startIcon={<FaFilter />}
                  sx={{
                    backgroundColor: 'var(--primary)',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    py: 2,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'var(--primary-dark)',
                    },
                    boxShadow: '0 2px 8px rgba(243,130,32,0.2)',
                  }}
                  fullWidth
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#3b82f6' : '#3b82f6'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Produção Total</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>2.450</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+5.2% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaIndustry className={`text-2xl ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#10b981' : '#10b981'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Eficiência</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>94.2%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+2.1% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaChartLine className={`text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#eab308' : '#eab308'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Qualidade</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>98.5%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+0.8% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}>
                  <FaChartPie className={`text-2xl ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#8b5cf6' : '#8b5cf6'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Tempo Ativo</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>92.3%</p>
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <span>-1.2% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <FaCog className={`text-2xl ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className={`rounded-2xl shadow-sm border p-8 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                      }`}>
                        <FaChartBar className={`text-2xl ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`} />
                      </div>
                      <h2 className={`text-3xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{getReportTitle()}</h2>
                    </div>
                    <p className={`text-lg ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>{getReportDescription()}</p>
                  </div>
                  <div className="flex gap-3">
                      <Button
                        variant="outlined"
                        startIcon={<FaEye />}
                      className={`rounded-xl px-6 py-3 font-semibold ${
                        isDarkMode 
                          ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white" 
                          : "border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                      }`}
                      >
                        Visualizar
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FaPrint />}
                      className={`rounded-xl px-6 py-3 font-semibold ${
                        isDarkMode 
                          ? "border-green-500 text-green-400 hover:bg-green-500 hover:text-white" 
                          : "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                      }`}
                      >
                        Imprimir
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FaShare />}
                      className={`rounded-xl px-6 py-3 font-semibold ${
                        isDarkMode 
                          ? "border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white" 
                          : "border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                      }`}
                      >
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                <div className={`rounded-2xl p-8 shadow-sm ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl">
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                      }`}>
                        <FaChartBar className={`text-3xl ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`} />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>Gráfico de {getReportTitle()}</h3>
                      <p className={`text-lg mb-6 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Visualização interativa dos dados</p>
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Dados Reais</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Projeções</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className={`rounded-2xl shadow-sm border p-8 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                  }`}>
                    <FaFileExport className={`text-2xl ${
                      isDarkMode ? "text-orange-400" : "text-orange-600"
                    }`} />
                  </div>
                    Exportar Relatório
                  </h3>
                <div className="space-y-4">
                    <Button
                      variant="outlined"
                      startIcon={<FaFileExport />}
                      fullWidth
                      onClick={() => handleExport('pdf')}
                    className={`rounded-xl py-4 font-semibold ${
                      isDarkMode 
                        ? "border-red-500 text-red-400 hover:bg-red-500 hover:text-white" 
                        : "border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                    }`}
                    >
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FaFileExport />}
                      fullWidth
                      onClick={() => handleExport('excel')}
                    className={`rounded-xl py-4 font-semibold ${
                      isDarkMode 
                        ? "border-green-500 text-green-400 hover:bg-green-500 hover:text-white" 
                        : "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                    }`}
                    >
                      Exportar Excel
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FaFileExport />}
                      fullWidth
                      onClick={() => handleExport('csv')}
                    className={`rounded-xl py-4 font-semibold ${
                      isDarkMode 
                        ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white" 
                        : "border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                    }`}
                    >
                      Exportar CSV
                    </Button>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border p-8 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}>
                    <FaChartLine className={`text-2xl ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`} />
                  </div>
                    Dados Rápidos
                  </h3>
                <div className="space-y-6">
                    {getReportData().slice(0, 3).map((item: ReportData, index) => (
                    <div key={index} className={`flex items-center justify-between p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                      isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                        <div>
                        <p className={`text-lg font-semibold mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                            {getItemDisplayName(item)}
                          </p>
                        <p className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                            {getItemDescription(item)}
                          </p>
                        </div>
                        <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}>
                            {getItemValue(item)}
                          </p>
                        <p className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                            {getItemSubValue(item)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Relatorios;