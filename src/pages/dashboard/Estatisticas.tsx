import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Chip } from '@mui/material';
import { FaChartLine, FaIndustry, FaCog, FaTachometerAlt, FaUsers, FaBuilding } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import { listEmployees } from '../../services/employees';
import { listMachines } from '../../services/machines';
import { listDepartments } from '../../services/departments';
import { SyncLoader } from '../../components/ui';
import MetricsCard from '../../components/data/MetricsCard';

interface MachineOEE {
  id: number;
  machineId: number;
  machineName: string;
  date: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  downtime: number;
  production: number;
  target: number;
  status: 'operating' | 'maintenance' | 'stopped';
}

interface EmployeeEfficiency {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  efficiency: number;
  productivity: number;
  quality: number;
  attendance: number;
  overtime: number;
  status: 'active' | 'absent' | 'overtime';
}

interface DepartmentMetrics {
  id: number;
  departmentId: number;
  departmentName: string;
  date: string;
  efficiency: number;
  production: number;
  quality: number;
  cost: number;
  employees: number;
  status: 'operational' | 'maintenance' | 'closed';
}

const Estatisticas: React.FC = () => {
  console.log('Estatisticas component is rendering');

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
  const [showOEEModal, setShowOEEModal] = useState(false);
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  const [machineOEEData, setMachineOEEData] = useState<MachineOEE[]>([]);
  const [employeeEfficiencyData, setEmployeeEfficiencyData] = useState<EmployeeEfficiency[]>([]);
  const [departmentMetricsData, setDepartmentMetricsData] = useState<DepartmentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      console.log('=== CARREGANDO DADOS DAS ESTATÍSTICAS ===');
      
      const [employeesRes, machinesRes, departmentsRes] = await Promise.all([
        listEmployees({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } })),
        listMachines({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } })),
        listDepartments({ pageSize: 1000, pageNumber: 0 }).catch(() => ({ data: { content: [] } }))
      ]);
      
      const employees = employeesRes.data.content || [];
      const machines = machinesRes.data.content || [];
      const departments = departmentsRes.data.content || [];
      
      console.log('Dados carregados para estatísticas:');
      console.log('- Funcionários:', employees.length);
      console.log('- Máquinas:', machines.length);
      console.log('- Departamentos:', departments.length);
      
      // NOTA: Dados simulados - aguardando API de métricas OEE
      const machineOEE: MachineOEE[] = machines.map((machine: any, index: number) => ({
        id: index + 1,
        machineId: machine.id,
        machineName: machine.name,
        date: new Date().toISOString().split('T')[0],
        availability: Math.round(85 + Math.random() * 15), // SIMULADO: 85-100%
        performance: Math.round(80 + Math.random() * 20), // SIMULADO: 80-100%
        quality: Math.round(90 + Math.random() * 10), // SIMULADO: 90-100%
        oee: Math.round((machine.oee || 0.82) * 100), // Usa OEE da máquina ou padrão 82%
        downtime: Math.round(Math.random() * 5), // SIMULADO: 0-5 horas
        production: Math.round((machine.throughput || 100) * (0.8 + Math.random() * 0.4)), // SIMULADO
        target: machine.throughput || 100,
        status: machine.status === 'OPERATING' || machine.status === 'ACTIVE' ? 'operating' : 
                machine.status === 'MAINTENANCE' ? 'maintenance' : 'stopped'
      }));
      
      const employeeEfficiency: EmployeeEfficiency[] = employees.map((emp: any, index: number) => ({
        id: index + 1,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.sector?.name || 'N/A',
        date: new Date().toISOString().split('T')[0],
        efficiency: Math.round(80 + Math.random() * 20), // 80-100%
        productivity: Math.round(75 + Math.random() * 25), // 75-100%
        quality: Math.round(85 + Math.random() * 15), // 85-100%
        attendance: emp.availability ? 100 : Math.round(70 + Math.random() * 30),
        overtime: Math.round(Math.random() * 5), // 0-5 horas
        status: emp.status === 'ACTIVE' ? 'active' : emp.status === 'ON_LEAVE' ? 'absent' : 'active'
      }));
      
      const departmentMetrics: DepartmentMetrics[] = departments.map((dept: any, index: number) => ({
        id: index + 1,
        departmentId: dept.id,
        departmentName: dept.name,
        date: new Date().toISOString().split('T')[0],
        efficiency: Math.round(75 + Math.random() * 25), // 75-100%
        production: Math.round((dept.budget || 50000) * 0.05), // Estimativa baseada no orçamento
        quality: Math.round(85 + Math.random() * 15), // 85-100%
        cost: dept.budget || Math.round(30000 + Math.random() * 70000),
        employees: dept.employees || Math.round(5 + Math.random() * 25),
        status: dept.status === 'active' ? 'operational' : 
                dept.status === 'maintenance' ? 'maintenance' : 'closed'
      }));
      
      setMachineOEEData(machineOEE);
      setEmployeeEfficiencyData(employeeEfficiency);
      setDepartmentMetricsData(departmentMetrics);
      
      console.log('Estatísticas geradas:', {
        machineOEE: machineOEE.length,
        employeeEfficiency: employeeEfficiency.length,
        departmentMetrics: departmentMetrics.length
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados das estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatisticsData();
  }, []);


const oeeFields: FormFieldConfig[] = [
    {
      name: 'machineId',
      label: 'Máquina',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Máquina de Corte CNC' },
        { value: '2', label: 'Prensa Hidráulica' },
        { value: '3', label: 'Máquina de Solda' }
      ]
    },
    {
      name: 'date',
      label: 'Data',
      type: 'text',
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'availability',
      label: 'Disponibilidade (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 95.2'
    },
    {
      name: 'performance',
      label: 'Performance (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 87.8'
    },
    {
      name: 'quality',
      label: 'Qualidade (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 98.5'
    },
    {
      name: 'downtime',
      label: 'Tempo de Parada (h)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 2.3'
    },
    {
      name: 'production',
      label: 'Produção Real (un)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 1250'
    },
    {
      name: 'target',
      label: 'Meta de Produção (un)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 1400'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'operating', label: 'Operando' },
        { value: 'maintenance', label: 'Manutenção' },
        { value: 'stopped', label: 'Parada' }
      ]
    }
  ];

  const efficiencyFields: FormFieldConfig[] = [
    {
      name: 'employeeId',
      label: 'Funcionário',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'João Silva' },
        { value: '2', label: 'Maria Santos' },
        { value: '3', label: 'Pedro Costa' }
      ]
    },
    {
      name: 'date',
      label: 'Data',
      type: 'text',
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'efficiency',
      label: 'Eficiência (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 94.2'
    },
    {
      name: 'productivity',
      label: 'Produtividade (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 88.5'
    },
    {
      name: 'quality',
      label: 'Qualidade (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 96.8'
    },
    {
      name: 'attendance',
      label: 'Presença (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 100'
    },
    {
      name: 'overtime',
      label: 'Hora Extra (h)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 2.5'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'absent', label: 'Ausente' },
        { value: 'overtime', label: 'Hora Extra' }
      ]
    }
  ];

  const departmentMetricsFields: FormFieldConfig[] = [
    {
      name: 'departmentId',
      label: 'Departamento',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Produção' },
        { value: '2', label: 'Qualidade' },
        { value: '3', label: 'Logística' }
      ]
    },
    {
      name: 'date',
      label: 'Data',
      type: 'text',
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'efficiency',
      label: 'Eficiência (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 92.5'
    },
    {
      name: 'production',
      label: 'Produção (un)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 2500'
    },
    {
      name: 'quality',
      label: 'Qualidade (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 97.2'
    },
    {
      name: 'cost',
      label: 'Custo (R$)',
      type: 'number',
      required: true,
      placeholder: 'Ex: 45000'
    },
    {
      name: 'employees',
      label: 'Funcionários',
      type: 'number',
      required: true,
      placeholder: 'Ex: 25'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'operational', label: 'Operacional' },
        { value: 'maintenance', label: 'Manutenção' },
        { value: 'closed', label: 'Fechado' }
      ]
    }
  ];

  const handleSubmitOEE = (data: Record<string, any>) => {
    console.log('Dados OEE:', data);
  };

  const handleSubmitEfficiency = (data: Record<string, any>) => {
    console.log('Dados Eficiência:', data);
  };

  const handleSubmitDepartmentMetrics = (data: Record<string, any>) => {
    console.log('Dados Departamento:', data);
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
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'operating': return 'Operando';
      case 'maintenance': return 'Manutenção';
      case 'stopped': return 'Parada';
      case 'active': return 'Ativo';
      case 'absent': return 'Ausente';
      case 'overtime': return 'Hora Extra';
      case 'operational': return 'Operacional';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };
  
  // The 'getOEEStatus' and 'getEfficiencyStatus' functions were not used, so they have been removed.
  // const getOEEStatus = (oee: number) => {
  //   if (oee >= 85) return { color: 'success', icon: <FaCheckCircle /> };
  //   if (oee >= 70) return { color: 'warning', icon: <FaExclamationTriangle /> };
  //   return { color: 'error', icon: <FaExclamationTriangle /> };
  // };

  // const getEfficiencyStatus = (efficiency: number) => {
  //   if (efficiency >= 90) return { color: 'success', icon: <FaArrowUp /> };
  //   if (efficiency >= 75) return { color: 'warning', icon: <FaThermometerHalf /> };
  //   return { color: 'error', icon: <FaArrowDown /> };
  // };

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
        {loading ? (
          <div className="p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-6 min-h-screen animate-fadeInUp" style={{ background: 'var(--bg-gradient)' }}>
          {/* Monday.com Style Header */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Estatísticas e Métricas</h1>
                <p className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Cadastro e acompanhamento de indicadores de performance</p>
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
                  }`}>OEE Médio</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>82.1%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+2.3% este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaTachometerAlt className={`text-2xl ${
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
                  }`}>Eficiência Média</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>91.2%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+1.8% este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaUsers className={`text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
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
                  }`}>Produção Total</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>12.5K</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+8.5% este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <FaIndustry className={`text-2xl ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#f97316' : '#f97316'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Qualidade Média</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>97.8%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+0.5% este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                }`}>
                  <FaChartLine className={`text-2xl ${
                    isDarkMode ? "text-orange-400" : "text-orange-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* OEE das Máquinas */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaCog className={`text-xl ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>OEE das Máquinas</h2>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Indicadores de eficiência operacional</p>
                </div>
              </div>
              <Chip label={`${machineOEEData.length} registros`} color="primary" size="small" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machineOEEData.map((oee) => {
                const oeeStatus = oee.oee >= 85 ? 'success' : oee.oee >= 70 ? 'warning' : 'error';
                return (
                  <MetricsCard
                    key={oee.id}
                    title={oee.machineName}
                    value={oee.oee}
                    unit="%"
                    status={oeeStatus}
                    icon={<FaCog />}
                    metrics={[
                      { label: 'Disponibilidade', value: oee.availability, unit: '%' },
                      { label: 'Performance', value: oee.performance, unit: '%' },
                      { label: 'Qualidade', value: oee.quality, unit: '%' },
                      { label: 'Produção', value: `${oee.production}/${oee.target}` }
                    ]}
                    footer={{
                      status: getStatusText(oee.status),
                      date: oee.date
                    }}
                    onClick={() => console.log('Clicou na máquina:', oee.machineName)}
                  />
                );
              })}
            </div>
          </div>

          {/* Eficiência dos Funcionários */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaUsers className={`text-xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Eficiência dos Funcionários</h2>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Indicadores de performance individual</p>
                </div>
              </div>
              <Chip label={`${employeeEfficiencyData.length} registros`} color="primary" size="small" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employeeEfficiencyData.map((efficiency) => {
                const efficiencyStatus = efficiency.efficiency >= 90 ? 'success' : efficiency.efficiency >= 75 ? 'warning' : 'error';
                return (
                  <MetricsCard
                    key={efficiency.id}
                    title={efficiency.employeeName}
                    subtitle={efficiency.department}
                    value={efficiency.efficiency}
                    unit="%"
                    status={efficiencyStatus}
                    icon={<FaUsers />}
                    metrics={[
                      { label: 'Produtividade', value: efficiency.productivity, unit: '%' },
                      { label: 'Qualidade', value: efficiency.quality, unit: '%' },
                      { label: 'Presença', value: efficiency.attendance, unit: '%' },
                      { label: 'Hora Extra', value: efficiency.overtime, unit: 'h' }
                    ]}
                    footer={{
                      status: getStatusText(efficiency.status),
                      date: efficiency.date
                    }}
                    onClick={() => console.log('Clicou no funcionário:', efficiency.employeeName)}
                  />
                );
              })}
            </div>
          </div>

          {/* Métricas dos Departamentos */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <FaBuilding className={`text-xl ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Métricas dos Departamentos</h2>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Indicadores de performance departamental</p>
                </div>
              </div>
              <Chip label={`${departmentMetricsData.length} registros`} color="primary" size="small" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentMetricsData.map((metric) => {
                const departmentStatus = metric.efficiency >= 90 ? 'success' : metric.efficiency >= 75 ? 'warning' : 'error';
                return (
                  <MetricsCard
                    key={metric.id}
                    title={metric.departmentName}
                    value={metric.efficiency}
                    unit="%"
                    status={departmentStatus}
                    icon={<FaBuilding />}
                    metrics={[
                      { label: 'Produção', value: metric.production.toLocaleString() },
                      { label: 'Qualidade', value: metric.quality, unit: '%' },
                      { label: 'Custo', value: `R$ ${metric.cost.toLocaleString()}` },
                      { label: 'Funcionários', value: metric.employees }
                    ]}
                    footer={{
                      status: getStatusText(metric.status),
                      date: metric.date
                    }}
                    onClick={() => console.log('Clicou no departamento:', metric.departmentName)}
                  />
                );
              })}
            </div>
          </div>
        </div>
        )}
      </main>

      <CUDModal
          open={showOEEModal}
          onClose={() => setShowOEEModal(false)}
          mode="create"
          title="Cadastrar OEE da Máquina"
          fields={oeeFields}
          initialData={{}}
          onSubmit={handleSubmitOEE}
          entityType="department"
        />

        <CUDModal
          open={showEfficiencyModal}
          onClose={() => setShowEfficiencyModal(false)}
          mode="create"
          title="Cadastrar Eficiência do Funcionário"
          fields={efficiencyFields}
          initialData={{}}
          onSubmit={handleSubmitEfficiency}
          entityType="department"
        />

        <CUDModal
          open={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          mode="create"
          title="Cadastrar Métricas do Departamento"
          fields={departmentMetricsFields}
          initialData={{}}
          onSubmit={handleSubmitDepartmentMetrics}
          entityType="department"
        />
    </div>
  );
};

export default Estatisticas;
