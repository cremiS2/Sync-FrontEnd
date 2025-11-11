import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Button, Chip } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import { listEmployees } from '../../services/employees';
import { listMachines } from '../../services/machines';
import { listDepartments } from '../../services/departments';
import {
  FaIndustry, FaUsers, FaChartLine, FaCog, FaTools, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaBuilding, FaDollarSign, FaArrowUp,
  FaEye
} from 'react-icons/fa';
import { BasicChart } from '../../components/charts';

interface DashboardStats {
  totalMachines: number;
  operatingMachines: number;
  maintenanceMachines: number;
  totalEmployees: number;
  activeEmployees: number;
  averageOEE: number;
  totalDepartments: number;
  activeDepartments: number;
  totalBudget: number;
  monthlyProduction: number;
}

interface RecentActivity {
  id: number;
  type: 'machine' | 'employee' | 'department' | 'alert';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const Dashboard: React.FC = () => {
  console.log('Dashboard component is rendering');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalMachines: 0,
    operatingMachines: 0,
    maintenanceMachines: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    averageOEE: 0,
    totalDepartments: 0,
    activeDepartments: 0,
    totalBudget: 0,
    monthlyProduction: 0
  });
  const [, setLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Carregar dados reais das APIs
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== CARREGANDO DADOS DO DASHBOARD ===');
      
      // Carregar dados em paralelo
      const [employeesRes, machinesRes, departmentsRes] = await Promise.all([
        listEmployees({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } })),
        listMachines({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } })),
        listDepartments({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } }))
      ]);
      
      const employees = employeesRes.data.content || [];
      const machines = machinesRes.data.content || [];
      const departments = departmentsRes.data.content || [];
      
      console.log('Dados carregados:');
      console.log('- Funcionários:', employees.length);
      console.log('- Máquinas:', machines.length);
      console.log('- Departamentos:', departments.length);
      
      // Calcular estatísticas
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter((emp: any) => emp.status === 'ACTIVE' || emp.availability).length;
      
      const totalMachines = machines.length;
      
      // Debug: Mostrar status de cada máquina
      console.log('=== DEBUG: STATUS DAS MÁQUINAS ===');
      machines.forEach((machine: any) => {
        console.log(`Máquina "${machine.name}" - Status: "${machine.status}"`);
      });
      
      const operatingMachines = machines.filter((machine: any) => {
        // Aceitar tanto inglês quanto português, com ou sem acento
        const isOperating = machine.status === 'OPERATING' || 
                           machine.status === 'ACTIVE' || 
                           machine.status === 'Operando' ||
                           machine.status === 'OPERANDO';
        if (isOperating) console.log(`✅ Máquina "${machine.name}" está OPERANDO`);
        return isOperating;
      }).length;
      
      const maintenanceMachines = machines.filter((machine: any) => {
        // Aceitar tanto inglês quanto português
        const isMaintenance = machine.status === 'MAINTENANCE' || 
                             machine.status === 'Manutenção' ||
                             machine.status === 'MANUTENÇÃO';
        if (isMaintenance) console.log(`🔧 Máquina "${machine.name}" está em MANUTENÇÃO`);
        return isMaintenance;
      }).length;
      
      const stoppedMachines = totalMachines - operatingMachines - maintenanceMachines;
      
      console.log('=== CONTAGEM DE MÁQUINAS ===');
      console.log(`Total: ${totalMachines}`);
      console.log(`Operando: ${operatingMachines}`);
      console.log(`Manutenção: ${maintenanceMachines}`);
      console.log(`Paradas: ${stoppedMachines}`);
      
      const totalDepartments = departments.length;
      const activeDepartments = departments.filter((dept: any) => 
        dept.status === 'ACTIVE' || dept.status === 'active'
      ).length;
      
      // Calcular OEE médio
      const averageOEE = machines.length > 0 
        ? Math.round(machines.reduce((sum: number, machine: any) => sum + (machine.oee || 0), 0) / machines.length * 100)
        : 0;
      
      // Calcular orçamento total e produção
      const totalBudget = departments.reduce((sum: number, dept: any) => sum + (dept.budget || 0), 0);
      const monthlyProduction = machines.reduce((sum: number, machine: any) => sum + (machine.throughput || 0), 0) * 30; // Estimativa mensal
      
      setStats({
        totalEmployees,
        activeEmployees,
        totalMachines,
        operatingMachines,
        maintenanceMachines,
        totalDepartments,
        activeDepartments,
        averageOEE,
        totalBudget,
        monthlyProduction
      });
      
      console.log('Estatísticas calculadas:', {
        totalEmployees,
        activeEmployees,
        totalMachines,
        operatingMachines,
        maintenanceMachines,
        averageOEE
      });
      
      // Gerar atividades recentes baseadas nos dados reais
      const activities: RecentActivity[] = [];
      
      // Adicionar atividades de funcionários
      employees.slice(0, 2).forEach((emp: any, index: number) => {
        activities.push({
          id: activities.length + 1,
          type: 'employee',
          title: emp.name,
          description: `Funcionário ${emp.status === 'ACTIVE' ? 'ativo' : 'inativo'} - Setor: ${emp.sector?.name || 'N/A'}`,
          time: `${(index + 1) * 5} min atrás`,
          status: emp.status === 'ACTIVE' ? 'success' : 'warning'
        });
      });
      
      // Adicionar atividades de máquinas
      machines.slice(0, 2).forEach((machine: any, index: number) => {
        const timeAgo = `${(index + 1) * 15} min atrás`;
        let description = '';
        let status: 'success' | 'warning' | 'error' | 'info' = 'info';
        
        if (machine.status === 'OPERATING' || machine.status === 'ACTIVE') {
          description = `Máquina operando - OEE: ${Math.round((machine.oee || 0) * 100)}%`;
          status = 'success';
        } else if (machine.status === 'MAINTENANCE') {
          description = 'Máquina em manutenção preventiva';
          status = 'warning';
        } else {
          description = 'Máquina parada';
          status = 'error';
        }
        
        activities.push({
          id: activities.length + 1,
          type: 'machine',
          title: machine.name,
          description,
          time: timeAgo,
          status
        });
      });
      
      // Adicionar atividades de departamentos
      departments.slice(0, 1).forEach((dept: any) => {
        const isActive = dept.status === 'ACTIVE' || dept.status === 'active';
        activities.push({
          id: activities.length + 1,
          type: 'department',
          title: dept.name,
          description: `Departamento ${isActive ? 'ativo' : 'inativo'} - Orçamento: R$ ${(dept.budget || 0).toLocaleString()}`,
          time: '1 hora atrás',
          status: isActive ? 'success' : 'warning'
        });
      });
      
      // Adicionar alertas baseados nos dados
      if (maintenanceMachines > 0) {
        activities.push({
          id: activities.length + 1,
          type: 'alert',
          title: 'Alerta de Manutenção',
          description: `${maintenanceMachines} máquina(s) em manutenção`,
          time: '30 min atrás',
          status: 'warning'
        });
      }
      
      if (averageOEE < 70) {
        activities.push({
          id: activities.length + 1,
          type: 'alert',
          title: 'Alerta de Performance',
          description: `OEE médio baixo: ${averageOEE}%`,
          time: '45 min atrás',
          status: 'error'
        });
      }
      
      // Limitar a 5 atividades mais recentes
      setRecentActivities(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar dados dos gráficos baseados nos dados reais
  const chartData = {
    // NOTA: Dados de produção mensal são ESTIMATIVAS baseadas no throughput atual das máquinas
    // Para dados históricos reais, seria necessário um endpoint no backend que retorne produção por mês
    production: [
      { label: 'Jan', value: 0, color: '#3B82F6' },  // Dados históricos não disponíveis
      { label: 'Fev', value: 0, color: '#10B981' },
      { label: 'Mar', value: 0, color: '#F59E0B' },
      { label: 'Abr', value: 0, color: '#EF4444' },
      { label: 'Mai', value: 0, color: '#8B5CF6' },
      { label: 'Jun', value: Math.round(stats.monthlyProduction), color: '#06B6D4' }  // Apenas mês atual (estimativa)
    ],
    departments: [
      { label: 'Ativos', value: stats.activeDepartments, color: '#10B981' },
      { label: 'Inativos', value: stats.totalDepartments - stats.activeDepartments, color: '#EF4444' }
    ],
    machines: [
      { label: 'Operando', value: stats.operatingMachines, color: '#10B981' },
      { label: 'Manutenção', value: stats.maintenanceMachines, color: '#F59E0B' },
      { label: 'Paradas', value: stats.totalMachines - stats.operatingMachines - stats.maintenanceMachines, color: '#EF4444' }
    ]
  };

  console.log('Chart data:', chartData);



  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'machine': return <FaIndustry />;
      case 'employee': return <FaUsers />;
      case 'department': return <FaBuilding />;
      case 'alert': return <FaExclamationTriangle />;
      default: return <FaChartLine />;
    }
  };


  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
        <div className="p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>

          {/* Monday.com Style Dashboard */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className={`rounded-2xl shadow-sm border p-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                    }`}>Dashboard</h1>
                  <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Visão geral do sistema de produção</p>
                </div>
                <div className={`flex items-center gap-8 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-blue-600 text-base" />
                    <span className="font-medium">{currentTime.toLocaleTimeString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-base" />
                    <span className="font-medium">Sistema Operacional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`} style={{
                  borderColor: isDarkMode ? '#3b82f6' : '#3b82f6'
                }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Máquinas Ativas</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.operatingMachines}/{stats.totalMachines}</p>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <FaArrowUp className="text-green-600" />
                      <span>+2 este mês</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                    }`}>
                    <FaIndustry className={`text-2xl ${isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`} style={{
                  borderColor: isDarkMode ? '#10b981' : '#10b981'
                }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Funcionários Ativos</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.activeEmployees}/{stats.totalEmployees}</p>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <FaArrowUp className="text-green-600" />
                      <span>+5 este mês</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-green-900/30" : "bg-green-100"
                    }`}>
                    <FaUsers className={`text-2xl ${isDarkMode ? "text-green-400" : "text-green-600"
                      }`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`} style={{
                  borderColor: isDarkMode ? '#f97316' : '#f97316'
                }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>OEE Médio</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.averageOEE}%</p>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <FaArrowUp className="text-green-600" />
                      <span>+3.2% vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                    }`}>
                    <FaChartLine className={`text-2xl ${isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`} style={{
                  borderColor: isDarkMode ? '#8b5cf6' : '#8b5cf6'
                }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Produção Mensal</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.monthlyProduction.toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <FaArrowUp className="text-green-600" />
                      <span>+8.5% vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                    }`}>
                    <FaCog className={`text-2xl ${isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                    }`}>
                    <FaTools className={`text-2xl ${isDarkMode ? "text-orange-400" : "text-orange-600"
                      }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Em Manutenção</h3>
                    <p className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.maintenanceMachines}</p>
                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Máquinas</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                    }`}>
                    <FaBuilding className={`text-2xl ${isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Departamentos</h3>
                    <p className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{stats.activeDepartments}/{stats.totalDepartments}</p>
                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Ativos</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-green-900/30" : "bg-green-100"
                    }`}>
                    <FaDollarSign className={`text-2xl ${isDarkMode ? "text-green-400" : "text-green-600"
                      }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Orçamento</h3>
                    <p className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}>R$ {(stats.totalBudget / 1000000).toFixed(1)}M</p>
                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Total Anual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics Section */}
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Produção Mensal</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <BasicChart
                    title=""
                    data={chartData.production}
                    type="bar"
                    height={280}
                    noCard={true}
                  />
                </div>
              </div>
              <div className={`rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Distribuição por Departamento</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <BasicChart
                    title=""
                    data={chartData.departments}
                    type="pie"
                    height={280}
                    noCard={true}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Status das Máquinas</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <BasicChart
                    title=""
                    data={chartData.machines}
                    type="bar"
                    height={280}
                    noCard={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Activities */}
          <div className="grid grid-cols-1 gap-8">
            {/* Activities Section */}
            <div>
              <div className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                    }`}>Atividades Recentes</h3>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaEye />}
                    sx={{
                      color: 'white',
                      backgroundColor: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      transform: 'translateY(0)',
                      transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                        borderColor: 'var(--primary-dark)',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    Ver Todas
                  </Button>
                </div>

                <div className="space-y-6">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className={`flex items-start gap-6 p-6 rounded-2xl transition-colors ${isDarkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-50 hover:bg-gray-100"
                      }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${activity.status === 'success' ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') :
                          activity.status === 'warning' ? (isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100') :
                            activity.status === 'error' ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-100') :
                              (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100')
                        }`}>
                        <div className={`text-lg ${activity.status === 'success' ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                            activity.status === 'warning' ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                              activity.status === 'error' ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
                                (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                          }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold mb-2 text-lg ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}>{activity.title}</h4>
                        <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}>{activity.description}</p>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}>{activity.time}</span>
                          <Chip
                            label={activity.status === 'success' ? 'Sucesso' :
                              activity.status === 'warning' ? 'Aviso' :
                                activity.status === 'error' ? 'Erro' : 'Info'}
                            color={getStatusColor(activity.status)}
                            size="small"
                            sx={{ fontSize: '0.75rem', height: '24px', borderRadius: '8px' }}
                          />
                        </div>
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

export default Dashboard;

