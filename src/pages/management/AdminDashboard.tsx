import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Sidebar } from "../../components/layout";
import { Card, CardContent } from '@mui/material';
import { 
  FaUsers, FaIndustry, FaTools, FaChartBar, FaUserShield, FaBoxes, FaTasks,
  FaBuilding, FaBell, FaCog, FaTachometerAlt, FaUserPlus, FaNetworkWired,
  FaDatabase, FaShieldAlt, FaClipboardList, FaArrowRight
} from 'react-icons/fa';
import { listUsers } from '../../services/users';
import { listEmployees } from '../../services/employees';
import { listMachines } from '../../services/machines';
import { listDepartments } from '../../services/departments';
import { listAllocations } from '../../services/allocatedEmployeeMachine';
import { listStock } from '../../services/stock';

interface QuickAccessCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  stats?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Estados para dados da API
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalMachines, setTotalMachines] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalAllocations, setTotalAllocations] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carregar dados da API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, employeesRes, machinesRes, departmentsRes, allocationsRes, stockRes] = await Promise.all([
        listUsers({ pageNumber: 0, pageSize: 1 }),
        listEmployees({ pageNumber: 0, pageSize: 1 }),
        listMachines({ pageNumber: 0, pageSize: 1 }),
        listDepartments({ pageNumber: 0, pageSize: 1 }),
        listAllocations({ pageNumber: 0, pageSize: 1 }),
        listStock({ pageNumber: 0, pageSize: 100 })
      ]);

      setTotalUsers(usersRes.data.totalElements || 0);
      setTotalEmployees(employeesRes.data.totalElements || 0);
      setTotalMachines(machinesRes.data.totalElements || 0);
      setTotalDepartments(departmentsRes.data.totalElements || 0);
      setTotalAllocations(allocationsRes.data.totalElements || 0);
      
      // Contar itens com estoque baixo
      const stockItems = stockRes.data.content || [];
      const lowStock = stockItems.filter((item: any) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK').length;
      setLowStockCount(lowStock);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const quickAccessCards: QuickAccessCard[] = [
    {
      title: "Gestão de Usuários",
      description: "Gerenciar usuários do sistema e permissões",
      icon: <FaUsers />,
      route: "/usuarios",
      color: "#3b82f6",
      stats: loading ? 'Carregando...' : `${totalUsers} usuários`
    },
    {
      title: "Funcionários",
      description: "Cadastro e gestão de funcionários",
      icon: <FaUserShield />,
      route: "/funcionarios",
      color: "#10b981",
      stats: loading ? 'Carregando...' : `${totalEmployees} funcionários`
    },
    {
      title: "Máquinas",
      description: "Controle de máquinas industriais",
      icon: <FaIndustry />,
      route: "/maquinas",
      color: "#f59e0b",
      stats: loading ? 'Carregando...' : `${totalMachines} máquinas`
    },
    {
      title: "Departamentos",
      description: "Organização departamental",
      icon: <FaBuilding />,
      route: "/departamentos",
      color: "#8b5cf6",
      stats: loading ? 'Carregando...' : `${totalDepartments} departamentos`
    },
    {
      title: "Manutenção",
      description: "Gestão de manutenções",
      icon: <FaTools />,
      route: "/manutencao",
      color: "#ef4444",
      stats: loading ? 'Carregando...' : 'Em breve'
    },
    {
      title: "Alertas & Logs",
      description: "Monitoramento de alertas",
      icon: <FaBell />,
      route: "/alertas-logs",
      color: "#f97316",
      stats: "8 alertas"
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: <FaCog />,
      route: "/configuracoes",
      color: "#6b7280",
      stats: "Configurado"
    },
    {
      title: "Dashboard",
      description: "Visão geral e métricas",
      icon: <FaTachometerAlt />,
      route: "/dashboard",
      color: "#06b6d4",
      stats: "Tempo real"
    },
    {
      title: "Relatórios",
      description: "Relatórios e análises",
      icon: <FaChartBar />,
      route: "/relatorios",
      color: "#84cc16",
      stats: loading ? 'Carregando...' : 'Em breve'
    },
    {
      title: "Estoque",
      description: "Controle de inventário",
      icon: <FaBoxes />,
      route: "/estoque",
      color: "#ec4899",
      stats: loading ? 'Carregando...' : `${lowStockCount} baixo estoque`
    },
    {
      title: "Atribuições",
      description: "Gestão de tarefas",
      icon: <FaTasks />,
      route: "/atribuicoes",
      color: "#14b8a6",
      stats: loading ? 'Carregando...' : `${totalAllocations} ativas`
    },
    {
      title: "Cadastro de Usuários",
      description: "Cadastrar novos usuários",
      icon: <FaUserPlus />,
      route: "/cadastro-usuarios",
      color: "#a855f7",
      stats: loading ? 'Carregando...' : `${totalUsers} cadastrados`
    }
  ];

  const systemStats = [
    {
      title: "Sistema Online",
      value: "99.9%",
      icon: <FaNetworkWired />,
      color: "#10b981",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
    {
      title: "Usuários Ativos",
      value: loading ? '...' : totalUsers.toString(),
      icon: <FaUsers />,
      color: "#3b82f6",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Alertas Pendentes",
      value: loading ? '...' : lowStockCount.toString(),
      icon: <FaBell />,
      color: "#f59e0b",
      bgColor: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      title: "Backup Atualizado",
      value: "Hoje",
      icon: <FaDatabase />,
      color: "#8b5cf6",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main 
        className="pt-16 transition-all duration-300"
        style={{ 
          marginLeft: sidebarCollapsed ? '4rem' : '16rem'
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaShieldAlt className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text)]">Painel Administrativo</h1>
                <p className="text-[var(--muted)]">Central de controle e gestão do sistema</p>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemStats.map((stat, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-2xl border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: stat.color }}
                  >
                    <div className="text-xl">{stat.icon}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: stat.color }}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access Section */}
          <Card className="mb-8 shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaClipboardList className="text-[var(--primary)] text-2xl" />
                <div>
                  <h2 className="text-2xl font-bold text-[var(--primary)]">Acesso Rápido</h2>
                  <p className="text-[var(--muted)]">Selecione uma funcionalidade para acessar</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {quickAccessCards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(card.route)}
                    className="group relative p-6 rounded-2xl border-2 border-gray-200 bg-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{
                      borderColor: card.color + '30',
                    }}
                  >
                    {/* Background Gradient on Hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}15 100%)`
                      }}
                    ></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                          style={{ 
                            backgroundColor: card.color,
                            boxShadow: `0 8px 20px ${card.color}40`
                          }}
                        >
                          <div className="text-2xl">{card.icon}</div>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-white transition-all duration-300"
                          style={{
                            boxShadow: `0 0 0 0 ${card.color}40`,
                          }}
                        >
                          <FaArrowRight 
                            className="text-gray-400 group-hover:translate-x-1 transition-all duration-300" 
                            style={{
                              color: card.color
                            }}
                          />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                      
                      {card.stats && (
                        <div 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300"
                          style={{
                            backgroundColor: `${card.color}10`,
                            borderColor: `${card.color}30`
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: card.color }}
                          ></div>
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: card.color }}
                          >
                            {card.stats}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Border Accent */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ backgroundColor: card.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
