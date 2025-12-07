import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaChartBar, FaIndustry, FaBuilding,
  FaChevronLeft, FaChevronRight, FaBoxes, FaTasks,
  FaHome, FaSignOutAlt, FaTools, FaUserShield
} from 'react-icons/fa';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaHome />,
      route: '/dashboard',
      group: 'main'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FaChartBar />,
      route: '/estatisticas',
      group: 'main'
    },
    {
      id: 'employees',
      label: 'Funcionários',
      icon: <FaUsers />,
      route: '/funcionarios',
      group: 'management'
    },
    {
      id: 'machines',
      label: 'Máquinas',
      icon: <FaIndustry />,
      route: '/maquinas',
      group: 'management'
    },
    {
      id: 'departments',
      label: 'Departamentos',
      icon: <FaBuilding />,
      route: '/departamentos',
      group: 'management'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FaTachometerAlt />,
      route: '/relatorios',
      group: 'management'
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: <FaBoxes />,
      route: '/estoque',
      group: 'management'
    },
    {
      id: 'assignments',
      label: 'Atribuições',
      icon: <FaTasks />,
      route: '/atribuicoes',
      group: 'management'
    },
    {
      id: 'maintenance',
      label: 'Manutenção',
      icon: <FaTools />,
      route: '/manutencao',
      group: 'management'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <FaUserShield />,
      route: '/admin',
      group: 'system'
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

  const isActive = (route: string) => location.pathname === route;

  return (
    <div 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] transition-all duration-300 z-30 shadow-2xl ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white backdrop-blur-sm"
        >
          {open ? <FaChevronLeft className="text-sm" /> : <FaChevronRight className="text-sm" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 pb-4 overflow-y-auto h-[calc(100%-8rem)]">
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <div key={groupKey} className="mb-6">
            {open && (
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-2">
                {groupLabels[groupKey as keyof typeof groupLabels]}
              </h3>
            )}
            
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.route);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={!open ? item.label : undefined}
                  >
                    <div className={`text-lg flex-shrink-0 ${
                      active ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {Icon}
                    </div>
                    {open && (
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
          title={!open ? 'Sair' : undefined}
        >
          <FaSignOutAlt className="text-lg" />
          {open && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
