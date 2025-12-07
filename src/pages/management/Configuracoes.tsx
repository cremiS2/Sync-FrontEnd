import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { 
  FaCog, FaBell, FaLock, FaShieldAlt, FaDatabase, FaSave, FaGlobe, FaClock
} from 'react-icons/fa';

const Configuracoes: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Sincronizar com o tema global
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Estados das configurações
  const [config, setConfig] = useState({
    // Geral
    nomeEmpresa: "Sync Industrial",
    email: "contato@sync.com",
    telefone: "(11) 1234-5678",
    
    // Notificações
    notificacoesEmail: true,
    notificacoesPush: true,
    alertasManutencao: true,
    alertasProducao: false,
    
    // Segurança
    autenticacao2FA: true,
    sessaoTimeout: 30,
    senhaComplexidade: true,
    
    // Sistema
    backupAutomatico: true,
    frequenciaBackup: "diario",
    retencaoDados: 90,
    
    // Aparência
    temaEscuro: isDarkMode,
    corPrimaria: "#3c20f3",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Salvando configurações:", config);
    setHasChanges(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    // Reset para valores padrão
    setHasChanges(false);
  };

  const configSections = [
    {
      id: "geral",
      title: "Configurações Gerais",
      icon: <FaCog />,
      color: "#3b82f6",
      fields: [
        { key: "nomeEmpresa", label: "Nome da Empresa", type: "text" },
        { key: "email", label: "E-mail Principal", type: "email" },
        { key: "telefone", label: "Telefone", type: "text" },
      ]
    },
    {
      id: "notificacoes",
      title: "Notificações",
      icon: <FaBell />,
      color: "#f59e0b",
      fields: [
        { key: "notificacoesEmail", label: "Notificações por E-mail", type: "boolean" },
        { key: "notificacoesPush", label: "Notificações Push", type: "boolean" },
        { key: "alertasManutencao", label: "Alertas de Manutenção", type: "boolean" },
        { key: "alertasProducao", label: "Alertas de Produção", type: "boolean" },
      ]
    },
    {
      id: "seguranca",
      title: "Segurança",
      icon: <FaShieldAlt />,
      color: "#ef4444",
      fields: [
        { key: "autenticacao2FA", label: "Autenticação de Dois Fatores", type: "boolean" },
        { key: "sessaoTimeout", label: "Timeout de Sessão (minutos)", type: "number" },
        { key: "senhaComplexidade", label: "Exigir Senha Complexa", type: "boolean" },
      ]
    },
    {
      id: "sistema",
      title: "Sistema",
      icon: <FaDatabase />,
      color: "#10b981",
      fields: [
        { key: "backupAutomatico", label: "Backup Automático", type: "boolean" },
        { key: "retencaoDados", label: "Retenção de Dados (dias)", type: "number" },
      ]
    }
  ];

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
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaCog className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text)]">Configurações</h1>
                <p className="text-[var(--muted)]">Gerencie as configurações do sistema</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeInDown">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <FaCog className="animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Configurações salvas com sucesso!</p>
                <p className="text-sm text-green-600">Todas as alterações foram aplicadas.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {hasChanges && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between animate-fadeInDown">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-yellow-800">Você tem alterações não salvas</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleReset}
                  sx={{
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    '&:hover': {
                      backgroundColor: '#f59e0b',
                      color: 'white',
                    },
                  }}
                >
                  Descartar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FaSave />}
                  onClick={handleSave}
                  sx={{
                    backgroundColor: 'var(--primary)',
                    '&:hover': {
                      backgroundColor: 'var(--primary-dark)',
                    },
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {configSections.map((section) => (
              <div
                key={section.id}
                className="bg-[var(--accent)] rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Section Header */}
                <div 
                  className="p-6 border-b border-transparent"
                  style={{ 
                    background: `linear-gradient(135deg, ${section.color}15 0%, ${section.color}05 100%)`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md"
                      style={{ backgroundColor: section.color }}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text)]">{section.title}</h2>
                      <p className="text-sm text-[var(--muted)]">{section.fields.length} configurações</p>
                    </div>
                  </div>
                </div>

                {/* Section Fields */}
                <div className="p-6 space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--text)]">
                        {field.label}
                      </label>
                      
                      {field.type === "boolean" ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config[field.key as keyof typeof config] as boolean}
                              onChange={(e) => handleChange(field.key, e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: section.color,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: section.color,
                                },
                              }}
                            />
                          }
                          label={
                            <span className={`text-sm ${config[field.key as keyof typeof config] ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted)]'}`}>
                              {config[field.key as keyof typeof config] ? 'Habilitado' : 'Desabilitado'}
                            </span>
                          }
                        />
                      ) : (
                        <TextField
                          fullWidth
                          type={field.type}
                          value={config[field.key as keyof typeof config]}
                          onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: section.color,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: section.color,
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* System Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--accent)] p-6 rounded-2xl border-0">
              <div className="flex items-center gap-3 mb-2">
                <FaGlobe className="text-2xl text-blue-600" />
                <h3 className="font-semibold text-blue-800">Versão do Sistema</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">v1.0.0</p>
              <p className="text-sm text-blue-600 mt-1">Atualizado em 13/10/2024</p>
            </div>

            <div className="bg-[var(--accent)] p-6 rounded-2xl border-0">
              <div className="flex items-center gap-3 mb-2">
                <FaClock className="text-2xl text-green-600" />
                <h3 className="font-semibold text-green-800">Último Backup</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">Hoje</p>
              <p className="text-sm text-green-600 mt-1">às 03:00 AM</p>
            </div>

            <div className="bg-[var(--accent)] p-6 rounded-2xl border-0">
              <div className="flex items-center gap-3 mb-2">
                <FaLock className="text-2xl text-purple-600" />
                <h3 className="font-semibold text-purple-800">Status de Segurança</h3>
              </div>
              <p className="text-2xl font-bold text-purple-900">Seguro</p>
              <p className="text-sm text-purple-600 mt-1">Todas as verificações OK</p>
            </div>
          </div>

          {/* Save Button (Fixed Bottom) */}
          {hasChanges && (
            <div className="fixed bottom-8 right-8 z-50">
              <Button
                variant="contained"
                size="large"
                startIcon={<FaSave />}
                onClick={handleSave}
                sx={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(60, 32, 243, 0.3)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-dark)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 50px rgba(60, 32, 243, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Salvar Todas as Alterações
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;
