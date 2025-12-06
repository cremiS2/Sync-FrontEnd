import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Sidebar } from '../../components/layout';
import { Avatar, Button, TextField } from '@mui/material';
import { FaUser, FaEnvelope, FaPhone, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { logout } from '../../services/auth';

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Começa aberto
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para animação em cascata
  const [showBackBtn, setShowBackBtn] = useState(false);
  const [showAvatarCard, setShowAvatarCard] = useState(false);
  const [showStatusCard, setShowStatusCard] = useState(false);
  const [showLogoutBtn, setShowLogoutBtn] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);

  // Minimizar sidebar automaticamente ao entrar na página de perfil (com animação)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 400); // Delay para dar tempo de ver a animação
    return () => clearTimeout(timer);
  }, []);
  
  // Animação em cascata dos elementos
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowBackBtn(true), 200),
      setTimeout(() => setShowAvatarCard(true), 400),
      setTimeout(() => setShowInfoCard(true), 500),
      setTimeout(() => setShowStatusCard(true), 700),
      setTimeout(() => setShowLogoutBtn(true), 900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [userStatus, setUserStatus] = useState('online'); 
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    avatar: ''
  });
  const [, setLoading] = useState(true);
  const [editData, setEditData] = useState(userData);
  const [errors, setErrors] = useState({ email: '', phone: '' });

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user_token');
      const userRole = localStorage.getItem('userRole') || 'OPERADOR';
      let userEmail = '';
      let userName = 'Usuário';
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userEmail = payload.sub || payload.email || '';
          if (payload.name) userName = payload.name;
          else if (payload.fullName) userName = payload.fullName;
          else if (payload.username) userName = payload.username;
          else if (userEmail) userName = userEmail.split('@')[0];
        } catch { userName = 'Usuário'; }
      }
      
      const profileData = {
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: userEmail || 'usuario@empresa.com',
        phone: '(11) 99999-9999',
        position: getRoleDisplayName(userRole),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=256`
      };
      
      setUserData(profileData);
      setEditData(profileData);
    } catch {
      const defaultData = {
        name: 'Usuário',
        email: 'usuario@empresa.com',
        phone: '(11) 99999-9999',
        position: 'Funcionário',
        avatar: 'https://via.placeholder.com/150x150/6366f1/ffffff?text=👤'
      };
      setUserData(defaultData);
      setEditData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'GERENTE': 'Gerente',
      'OPERADOR': 'Operador'
    };
    return roleNames[role] || 'Usuário';
  };

  useEffect(() => { loadProfileData(); }, []);

  const handleEdit = () => { setEditData(userData); setIsEditing(true); };
  
  const handleSave = () => {
    const newErrors = {
      email: editData.email && !validateEmail(editData.email) ? 'Email inválido' : '',
      phone: editData.phone && !validatePhone(editData.phone) ? 'Telefone inválido' : ''
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.phone) return;
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => { setEditData(userData); setErrors({ email: '', phone: '' }); setIsEditing(false); };
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => { const clean = phone.replace(/\D/g, ''); return clean.length >= 10 && clean.length <= 11; };
  
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let newValue = value;
    const newErrors = { ...errors };
    if (field === 'email') newErrors.email = value && !validateEmail(value) ? 'Email inválido' : '';
    if (field === 'phone') { newValue = formatPhone(value); newErrors.phone = value && !validatePhone(value) ? 'Telefone inválido' : ''; }
    setErrors(newErrors);
    setEditData(prev => ({ ...prev, [field]: newValue }));
  };

  const handleStatusChange = (newStatus: string) => setUserStatus(newStatus);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'busy': return '#eab308';
      case 'away': return '#3b82f6';
      default: return '#64748b';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      default: return 'Offline';
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
  };
  const fieldBg = isDarkMode ? '#0f172a' : '#f8fafc';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDarkMode ? '#94a3b8' : '#475569';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => {
        setMobileMenuOpen(!mobileMenuOpen);
        // Quando abre no mobile, também expande o sidebar
        if (!mobileMenuOpen) {
          setSidebarCollapsed(false);
        }
      }} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className={`perfil-page transition-all duration-300 pt-16 md:pt-20 px-3 md:px-6 pb-6 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="max-w-5xl mx-auto">
          {/* Botões de Navegação */}
          <div className={`mb-3 md:mb-4 flex items-center gap-2 transition-all duration-500 ${showBackBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button variant="outlined" startIcon={<FaArrowLeft />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: textSecondary, borderColor: isDarkMode ? '#475569' : '#cbd5e1', fontSize: { xs: '0.75rem', md: '0.875rem' },
                '&:hover': { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' } }}>
              Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Coluna Lateral - Avatar e Status */}
            <div className="space-y-4 order-first lg:order-last">
              {/* Card Avatar */}
              <div className={`rounded-xl shadow-lg p-4 md:p-6 text-center transition-all duration-500 ${showAvatarCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={cardStyle}>
                <Avatar src={userData.avatar} alt={userData.name}
                  sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, margin: '0 auto 12px',
                    border: isDarkMode ? '3px solid #334155' : '3px solid #e2e8f0' }} />
                <h3 className="text-base md:text-lg font-semibold" style={{ color: textPrimary }}>{userData.name}</h3>
                <p className="text-sm mb-2" style={{ color: textSecondary }}>{userData.position}</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(userStatus) }} />
                  <span className="text-xs md:text-sm" style={{ color: textPrimary }}>{getStatusText(userStatus)}</span>
                </div>
              </div>

              {/* Card Status - Compacto no mobile */}
              <div className={`rounded-xl shadow-lg p-3 md:p-4 transition-all duration-500 ${showStatusCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={cardStyle}>
                <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
                  {['online', 'busy', 'away', 'offline'].map((status) => (
                    <button key={status} onClick={() => handleStatusChange(status)}
                      className="flex flex-col lg:flex-row items-center lg:gap-3 p-2 lg:p-3 rounded-lg transition-all"
                      style={{ backgroundColor: userStatus === status ? '#3b82f6' : fieldBg,
                        color: userStatus === status ? '#fff' : textPrimary }}>
                      <div className="w-2.5 h-2.5 rounded-full mb-1 lg:mb-0"
                        style={{ backgroundColor: userStatus === status ? 'white' : getStatusColor(status) }} />
                      <span className="text-xs lg:text-sm font-medium">{getStatusText(status)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Logout - Escondido no mobile, aparece só no desktop */}
              <div className={`hidden lg:block transition-all duration-500 ${showLogoutBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Button variant="outlined" startIcon={<FaSignOutAlt style={{ color: '#ef4444' }} />} onClick={handleLogout} fullWidth size="small"
                  sx={{ color: '#ef4444', borderColor: '#ef4444', py: 1.5,
                    '&:hover': { backgroundColor: '#ef4444', color: 'white', '& svg': { color: 'white' } } }}>
                  Sair da Conta
                </Button>
              </div>
            </div>

            {/* Coluna Principal - Informações */}
            <div className="lg:col-span-2 order-last lg:order-first">
              <div className={`rounded-xl shadow-lg p-4 md:p-6 transition-all duration-500 ${showInfoCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={cardStyle}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                  <h2 className="text-base md:text-xl font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
                    <FaUser className="text-blue-500" /> Informações Pessoais
                  </h2>
                  {!isEditing ? (
                    <Button variant="outlined" startIcon={<FaEdit />} onClick={handleEdit} size="small"
                      sx={{ color: '#3b82f6', borderColor: '#3b82f6', alignSelf: { xs: 'flex-start', sm: 'auto' },
                        '&:hover': { backgroundColor: '#3b82f6', color: 'white' } }}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="contained" startIcon={<FaSave />} onClick={handleSave} size="small"
                        sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}>Salvar</Button>
                      <Button variant="outlined" startIcon={<FaTimes />} onClick={handleCancel} size="small"
                        sx={{ color: textSecondary, borderColor: isDarkMode ? '#475569' : '#cbd5e1' }}>Cancelar</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 md:space-y-4">
                  {/* Nome */}
                  <div className="p-3 md:p-4 rounded-lg" style={{ backgroundColor: fieldBg }}>
                    <label className="block text-xs md:text-sm font-medium mb-1 flex items-center gap-2" style={{ color: textSecondary }}>
                      <FaUser className="text-blue-500 text-xs" /> Nome
                    </label>
                    {isEditing ? (
                      <TextField fullWidth value={editData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                        variant="outlined" size="small" sx={{ '& .MuiInputBase-input': { color: textPrimary, fontSize: '0.875rem' } }} />
                    ) : (
                      <p className="font-medium text-sm md:text-base" style={{ color: textPrimary }}>{userData.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-3 md:p-4 rounded-lg" style={{ backgroundColor: fieldBg }}>
                    <label className="block text-xs md:text-sm font-medium mb-1 flex items-center gap-2" style={{ color: textSecondary }}>
                      <FaEnvelope className="text-blue-500 text-xs" /> Email
                    </label>
                    {isEditing ? (
                      <TextField fullWidth value={editData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                        variant="outlined" size="small" type="email" error={!!errors.email} helperText={errors.email}
                        sx={{ '& .MuiInputBase-input': { color: textPrimary, fontSize: '0.875rem' } }} />
                    ) : (
                      <p className="font-medium text-sm md:text-base break-all" style={{ color: textPrimary }}>{userData.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {/* Cargo */}
                    <div className="p-3 md:p-4 rounded-lg" style={{ backgroundColor: fieldBg }}>
                      <label className="block text-xs md:text-sm font-medium mb-1 flex items-center gap-2" style={{ color: textSecondary }}>
                        <FaUser className="text-blue-500 text-xs" /> Cargo
                      </label>
                      {isEditing ? (
                        <TextField fullWidth value={editData.position} onChange={(e) => handleInputChange('position', e.target.value)}
                          variant="outlined" size="small" sx={{ '& .MuiInputBase-input': { color: textPrimary, fontSize: '0.875rem' } }} />
                      ) : (
                        <p className="font-medium text-sm md:text-base" style={{ color: textPrimary }}>{userData.position}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div className="p-3 md:p-4 rounded-lg" style={{ backgroundColor: fieldBg }}>
                      <label className="block text-xs md:text-sm font-medium mb-1 flex items-center gap-2" style={{ color: textSecondary }}>
                        <FaPhone className="text-blue-500 text-xs" /> Telefone
                      </label>
                      {isEditing ? (
                        <TextField fullWidth value={editData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                          variant="outlined" size="small" error={!!errors.phone} helperText={errors.phone} placeholder="(XX) XXXXX-XXXX"
                          sx={{ '& .MuiInputBase-input': { color: textPrimary, fontSize: '0.875rem' } }} />
                      ) : (
                        <p className="font-medium text-sm md:text-base" style={{ color: textPrimary }}>{userData.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botão Logout - Apenas no mobile, no final da página */}
          <div className={`lg:hidden mt-6 transition-all duration-500 ${showLogoutBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button variant="outlined" startIcon={<FaSignOutAlt style={{ color: '#ef4444' }} />} onClick={handleLogout} fullWidth size="medium"
              sx={{ color: '#ef4444', borderColor: '#ef4444', py: 1.5,
                '&:hover': { backgroundColor: '#ef4444', color: 'white', '& svg': { color: 'white' } } }}>
              Sair da Conta
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
