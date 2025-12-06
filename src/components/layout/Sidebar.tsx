import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaUsers, FaIndustry, FaBuilding, 
  FaFileAlt, FaUserShield, FaSignOutAlt,
  FaChevronLeft, FaChevronRight, FaBoxes, FaTasks
} from 'react-icons/fa';
import { prefetch, CACHE_KEYS } from '../../utils/dataCache';
import { listEmployees } from '../../services/employees';
import { listMachines } from '../../services/machines';
import { listDepartments } from '../../services/departments';
import { listSectors } from '../../services/sectors';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, mobileOpen = false, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegar role do usuário
  const userRole = localStorage.getItem('userRole');

  const menuItems: Array<{
    id: string;
    label: string;
    icon: any;
    group: string;
    route: string;
    requiredRole?: string; // Pode ser uma role ou múltiplas separadas por vírgula
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaHome,
      group: 'main',
      route: '/dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: FaChartLine,
      group: 'main',
      route: '/estatisticas'
    },
    {
      id: 'employees',
      label: 'Funcionários',
      icon: FaUsers,
      group: 'management',
      route: '/funcionarios'
    },
    {
      id: 'machines',
      label: 'Máquinas',
      icon: FaIndustry,
      group: 'management',
      route: '/maquinas'
    },
    {
      id: 'departments',
      label: 'Departamentos',
      icon: FaBuilding,
      group: 'management',
      route: '/departamentos'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FaFileAlt,
      group: 'management',
      route: '/relatorios'
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: FaBoxes,
      group: 'management',
      route: '/estoque'
    },
    {
      id: 'assignments',
      label: 'Atribuições',
      icon: FaTasks,
      group: 'management',
      route: '/atribuicoes'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: FaUserShield,
      group: 'system',
      route: '/admin',
      requiredRole: 'ADMIN' // Apenas admins podem ver
    }
  ];

  // Filtrar itens baseado na role do usuário
  const filteredMenuItems = menuItems.filter(item => {
    // Se o item não tem requiredRole, mostrar para todos
    if (!item.requiredRole) return true;
    // Se tem requiredRole, verificar se o usuário tem uma das roles permitidas
    const allowedRoles = item.requiredRole.split(',').map(r => r.trim());
    return allowedRoles.includes(userRole || '');
  });

  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const groupLabels = {
    main: 'Principal',
    management: 'Gestão',
    system: 'Sistema'
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-nav fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] transition-all duration-300 z-50
        ${isCollapsed ? 'w-12 sm:w-16' : 'w-56 sm:w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2 sm:p-4">
        <button
          onClick={onToggle}
          className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          {isCollapsed ? <FaChevronRight className="text-xs sm:text-sm" /> : <FaChevronLeft className="text-xs sm:text-sm" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 sm:px-4 pb-4">
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <div key={groupKey} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 sm:mb-3 px-1 sm:px-2">
                {groupLabels[groupKey as keyof typeof groupLabels]}
              </h3>
            )}
            
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.route;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    onMouseEnter={async () => {
                      try {
                        if (item.route === '/funcionarios') {
                          await prefetch(CACHE_KEYS.EMPLOYEES, async () => {
                            const { data } = await listEmployees({ pageNumber: 0, pageSize: 100 });
                            return data.content || [];
                          }, 5 * 60 * 1000);
                        } else if (item.route === '/maquinas') {
                          await prefetch(CACHE_KEYS.MACHINES, async () => {
                            const { data } = await listMachines({ pageNumber: 0, pageSize: 100 });
                            return data.content || [];
                          }, 5 * 60 * 1000);
                        } else if (item.route === '/departamentos') {
                          await Promise.all([
                            prefetch(CACHE_KEYS.DEPARTMENTS, async () => {
                              const { data } = await listDepartments({ pageSize: 1000, pageNumber: 0 });
                              return data.content || [];
                            }, 5 * 60 * 1000),
                            prefetch(CACHE_KEYS.SECTORS, async () => {
                              const { data } = await listSectors({ pageNumber: 0, pageSize: 200 });
                              return data.content || [];
                            }, 5 * 60 * 1000)
                          ]);
                        }
                      } catch {}
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`text-base sm:text-lg flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`} />
                    {!isCollapsed && (
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section - Sair */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 border-t border-white/10">
        <button 
          onClick={() => {
            // Limpar todos os dados de sessão
            localStorage.removeItem('user_token');
            localStorage.removeItem('userRole');
            localStorage.clear();
            sessionStorage.clear();
            
            // Usar window.location.href para forçar reload completo
            // Isso impede voltar com as setas do navegador
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-white transition-colors"
        >
          <FaSignOutAlt className="text-base sm:text-lg text-red-400" />
          {!isCollapsed && <span className="text-xs sm:text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
