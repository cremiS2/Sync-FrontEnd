import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaUsers, FaIndustry, FaBuilding, 
  FaCog, FaFileAlt, FaBell, FaQuestionCircle, FaSignOutAlt,
  FaChevronLeft, FaChevronRight, FaBoxes, FaTasks
} from 'react-icons/fa';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
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
      id: 'settings',
      label: 'Configurações',
      icon: FaCog,
      group: 'system',
      route: '/configuracoes'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: FaBell,
      group: 'system',
      route: '/alertas-logs'
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: FaQuestionCircle,
      group: 'system',
      route: '/admin'
    }
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
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
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] transition-all duration-300 z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          {isCollapsed ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 pb-4">
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <div key={groupKey} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-2">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`text-lg flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
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

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <button 
          onClick={() => {
            localStorage.removeItem('user_token');
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <FaSignOutAlt className="text-lg" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
