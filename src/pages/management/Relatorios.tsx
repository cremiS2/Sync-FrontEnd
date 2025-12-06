import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Button } from '@mui/material';
import { FaChartLine, FaIndustry, FaChartBar, FaChartPie, FaCog, FaPrint } from 'react-icons/fa';
import { listMachines } from '../../services/machines';
import { listEmployees } from '../../services/employees';
import { generateGeneralReport } from '../../services/reports';
import { listStock } from '../../services/stock';
import type { Machine, Employee, Stock } from '../../types';
import { SyncLoader } from '../../components/ui';

const Relatorios: React.FC = () => {
  const [selectedReport] = useState('producao');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados para dados da API
  const [machines, setMachines] = useState<Machine[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados da API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [machinesRes, employeesRes, stockRes] = await Promise.all([
        listMachines({ pageNumber: 0, pageSize: 100 }),
        listEmployees({ pageNumber: 0, pageSize: 100 }),
        listStock({ pageNumber: 0, pageSize: 100 })
      ]);

      setMachines(machinesRes.data.content || []);
      setEmployees(employeesRes.data.content || []);
      setStockItems(stockRes.data.content || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
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

  // Calcular dados de produção baseados nas máquinas
  // const productionData = machines.slice(0, 6).map((machine, idx) => ({
  //   mes: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][idx] || `Máq ${idx + 1}`,
  //   meta: 1000,
  //   realizado: Math.round(machine.throughput * 8 * 30), // throughput * 8h * 30 dias
  //   eficiencia: Math.round(machine.oee * 100)
  // }));

  // Calcular eficiência por setor
  // const efficiencyByDepartment = sectors.map(sector => {
  //   const sectorMachines = machines.filter(m =>
  //     typeof m.sector === 'object' ? m.sector?.id === sector.id : m.sector === sector.id
  //   );
  //   const avgEfficiency = sectorMachines.length > 0
  //     ? Math.round(sectorMachines.reduce((sum, m) => sum + (m.oee * 100), 0) / sectorMachines.length)
  //     : 0;
  //   const totalProduction = sectorMachines.reduce((sum, m) => sum + (m.throughput * 8), 0);

  //   return {
  //     setor: sector.name,
  //     eficiencia: avgEfficiency,
  //     producao: Math.round(totalProduction),
  //     meta: Math.round(totalProduction * 1.1) // Meta 10% acima da produção atual
  //   };
  // });

  const totalStock = stockItems.length;
  const inStock = stockItems.filter(item => item.status === 'IN_STOCK').length;

  // const qualityData = [
  //   { categoria: 'Em Estoque', quantidade: inStock, percentual: totalStock > 0 ? Math.round((inStock / totalStock) * 100) : 0 },
  //   { categoria: 'Estoque Baixo', quantidade: lowStock, percentual: totalStock > 0 ? Math.round((lowStock / totalStock) * 100) : 0 },
  //   { categoria: 'Sem Estoque', quantidade: outStock, percentual: totalStock > 0 ? Math.round((outStock / totalStock) * 100) : 0 },
  // ];

  // Dados de manutenção baseados nas máquinas
  // const maintenanceData = machines.slice(0, 4).map(machine => ({
  //   maquina: machine.name,
  //   horas: Math.round(machine.oee * 720), // Estimativa de horas operacionais
  //   manutencoes: Math.floor(Math.random() * 5) + 1, // Simulado (não há campo na API)
  //   status: machine.status
  // }));

  // const getReportData = () => {
  //   switch (selectedReport) {
  //     case 'producao':
  //       return productionData;
  //     case 'eficiencia':
  //       return efficiencyByDepartment;
  //     case 'qualidade':
  //       return qualityData;
  //     case 'manutencao':
  //       return maintenanceData;
  //     default:
  //       return productionData;
  //   }
  // };

  // const getItemDisplayName = (item: ReportData): string => {
  //   if ('mes' in item) return item.mes;
  //   if ('setor' in item) return item.setor;
  //   if ('categoria' in item) return item.categoria;
  //   if ('maquina' in item) return item.maquina;
  //   return 'Item';
  // };

  // const getItemDescription = (item: ReportData): string => {
  //   if ('meta' in item) return `Meta: ${item.meta}`;
  //   if ('eficiencia' in item) return `Eficiência: ${item.eficiencia}%`;
  //   if ('quantidade' in item) return `${item.quantidade} unidades`;
  //   if ('horas' in item) return `${item.horas}h operação`;
  //   return '';
  // };

  // const getItemValue = (item: ReportData): number => {
  //   if ('realizado' in item) return item.realizado;
  //   if ('producao' in item) return item.producao;
  //   if ('percentual' in item) return item.percentual;
  //   if ('manutencoes' in item) return item.manutencoes;
  //   return 0;
  // };

  // const getItemSubValue = (item: ReportData): string => {
  //   if ('eficiencia' in item) return `${item.eficiencia}%`;
  //   if ('percentual' in item) return `${item.percentual}%`;
  //   if ('status' in item) return item.status;
  //   return 'Unidades';
  // };

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
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-16 px-4 md:px-8`}>
        {loading ? (
          <div className="max-w-7xl mx-auto min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="max-w-7xl mx-auto animate-fadeInUp">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-4xl font-bold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  Relatórios Administrativos
                </h1>
                <p className={`text-xl ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Análise detalhada de dados e performance para gestão
                </p>
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
                  }`}>{machines.reduce((sum, m) => sum + Math.round(m.throughput * 8), 0)}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{machines.length} máquinas ativas</span>
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
                  }`}>{machines.length > 0 ? Math.round((machines.reduce((sum, m) => sum + m.oee, 0) / machines.length) * 100) : 0}%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>Média OEE das máquinas</span>
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
                  }`}>{totalStock > 0 ? Math.round((inStock / totalStock) * 100) : 0}%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{inStock} itens em estoque</span>
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
                  }`}>{employees.length}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>Funcionários ativos</span>
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
              {/* Seção de Relatórios Rápidos */}
              <div className={`rounded-2xl shadow-sm border p-8 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                  }`}>
                    <FaPrint className={`text-2xl ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`} />
                  </div>
                  Relatórios Rápidos (PDF)
                </h3>
                <div className="space-y-4">
                  <Button
                    variant="outlined"
                    startIcon={loading ? null : <FaPrint />}
                    fullWidth
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const blob = await generateGeneralReport();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        alert('Relatório Geral gerado com sucesso!');
                      } catch (err) {
                        console.error('Erro:', err);
                        alert('Erro ao gerar relatório. Verifique se o servidor está rodando.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className={`rounded-xl py-4 font-semibold ${
                      isDarkMode 
                        ? "border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white" 
                        : "border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                    }`}
                  >
                    {loading ? 'Gerando...' : 'Gerar Relatório Geral (PDF)'}
                  </Button>
                </div>
              </div>


            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default Relatorios;
