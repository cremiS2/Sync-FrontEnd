import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className={`transition-all duration-300 pt-16 ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
