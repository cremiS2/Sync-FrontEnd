import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Chip, Avatar } from '@mui/material';
import { FaUsers, FaUserShield, FaBuilding } from 'react-icons/fa';
import { listUsers } from '../../services/users';
import type { User } from '../../types';
import { SyncLoader } from '../../components/ui';

const Usuarios: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Carregar usuários da API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await listUsers({ pageNumber: 0, pageSize: 100 });
      setUsers(data.content || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.roles?.some(r => r.name === filterRole);
    return matchesSearch && matchesRole;
  });

  // Estatísticas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.roles?.some(r => r.name === 'ADMIN')).length;
  const uniqueRoles = [...new Set(users.flatMap(u => u.roles?.map(r => r.name) || []))];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main 
        className={`pt-16 transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}
      >
        {loading ? (
          <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-6 md:p-8 animate-fadeInUp">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Gestão de Usuários</h1>
            <p className="text-[var(--muted)]">Gerencie usuários, permissões e controle de acesso</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Total de Usuários</p>
                  <p className="text-3xl font-bold text-[var(--text)]">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-[var(--text)]">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <FaUserShield className="text-2xl text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Administradores</p>
                  <p className="text-3xl font-bold text-[var(--text)]">{adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <FaUserShield className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Departamentos</p>
                  <p className="text-3xl font-bold text-[var(--text)]">{uniqueRoles.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                placeholder="Buscar por email ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text)]"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text)]"
              >
                <option value="all">Todas as Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Usuários */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--muted)]">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'var(--primary)' }}>
                      {user.email[0].toUpperCase()}
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--text)]">{user.email}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Roles:</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {user.roles?.map((role, idx) => (
                          <Chip key={idx} label={role.name} size="small" color="primary" />
                        ))}
                      </div>
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted)]">Criado em:</span>
                        <span className="text-sm text-[var(--text)]">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
};

export default Usuarios;
