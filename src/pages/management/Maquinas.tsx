import React, { useState, useEffect } from "react";
import { listMachines, createMachine, updateMachine, deleteMachine } from '../../services/machines';
import { listEmployees } from '../../services/employees';
import { Header, Sidebar } from '../../components/layout';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Chip, Avatar } from '@mui/material';
import { FaIndustry, FaCog, FaTools, FaPlus, FaEye, FaEdit, FaCheckCircle, FaChartLine, FaTimes } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import type { Machine, MachineDTO } from '../../types';
import { useNotification } from '../../components/system/NotificationSystem';
import { dataCache, CACHE_KEYS } from '../../utils/dataCache';
import { useButtonLock } from '../../hooks/useButtonLock';
import { rateLimiter, strictRateLimiter } from '../../utils/rateLimiter';
import ResponsiveGrid from '../../components/common/VirtualizedGrid';
import { SyncLoader } from '../../components/ui';
import { useUserRole, canCreate, canEdit, canDelete } from '../../hooks/useUserRole';
import { getErrorMessage, getFieldErrors, hasFieldErrors } from '../../utils/errorHandler';

const Maquinas: React.FC = () => {
  // Helper para gerar miniaturas em listas (mantém original em modais)
  const getThumb = (url?: string, size: number = 96): string | undefined => {
    if (!url) return url as any;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${size}&h=${size}&fit=crop`;
  };
  console.log('Maquinas component is rendering');

  const notification = useNotification();
  const userRole = useUserRole();
  
  // Hooks para travar botões após clique
  const createLock = useButtonLock({ lockDuration: 3000 }); // 3 segundos
  const updateLock = useButtonLock({ lockDuration: 2000 }); // 2 segundos
  const deleteLock = useButtonLock({ lockDuration: 2000 }); // 2 segundos
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
  const [machines, setMachines] = useState<Machine[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMachineForEdit, setSelectedMachineForEdit] = useState<Machine | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Configuração dos campos do formulário baseada no MachineDTO do backend
  const machineFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Nome da Máquina',
      type: 'text',
      required: true,
      placeholder: 'Digite o nome da máquina'
    },
    {
      name: 'sector',
      label: 'ID do Setor',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 1'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'OPERANDO', label: 'Operando' },
        { value: 'PARADA', label: 'Parada' },
        { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
        { value: 'AVARIADA', label: 'Avariada' }
      ]
    },
    {
      name: 'oee',
      label: 'OEE (0.0-1.0)',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 0.92'
    },
    {
      name: 'throughput',
      label: 'Vazão (un/h)',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 120'
    },
    {
      name: 'lastMaintenance',
      label: 'Última Manutenção',
      type: 'date',
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'photo',
      label: 'URL da Foto (Opcional)',
      type: 'url',
      required: false,
      placeholder: 'Cole a URL da imagem ou deixe vazio para usar ícone padrão'
    },
    {
      name: 'serieNumber',
      label: 'Número de Série',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 12345'
    }
  ];

  const loadMachines = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (!forceRefresh) {
        const cached = dataCache.get<any[]>(CACHE_KEYS.MACHINES, 3 * 60 * 1000);
        if (cached) {
          // Verificar se já está no formato esperado (possui "image" e "department")
          const isMapped = Array.isArray(cached) && cached.length > 0 && cached[0] && (
            typeof (cached[0] as any).image !== 'undefined' || typeof (cached[0] as any).department !== 'undefined'
          );
          if (isMapped) {
            setMachines(cached as any[]);
            setLoading(false);
            return;
          }
          // Mapear dados crus do backend salvos via prefetch
          const mappedFromCache = (cached || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            sector: typeof m.sector === 'object' ? m.sector?.id || '' : m.sector,
            status: m.status || '',
            oee: m.oee,
            throughput: m.throughput,
            lastMaintenance: m.lastMaintenance,
            photo: m.photo,
            serieNumber: m.serieNumber,
            machineModel: 1,
            department: typeof m.sector === 'object' ? m.sector?.name || '' : '',
            model: `Modelo ${m.serieNumber}`,
            efficiency: Math.round((m.oee || 0) * 100),
            production: Math.round((m.throughput || 0) * 8),
            image: m.photo
          }));
          dataCache.set(CACHE_KEYS.MACHINES, mappedFromCache);
          setMachines(mappedFromCache);
          setLoading(false);
          return;
        }
      }
      const { data: machinePage } = await listMachines({ pageNumber: 0, pageSize: 100 });
      
      console.log('=== MÁQUINAS RETORNADAS DO BACKEND ===');
      console.log('Total de máquinas:', machinePage.content?.length);
      machinePage.content?.forEach((m: any) => {
        console.log(`Máquina "${m.name}":`, {
          id: m.id,
          lastMaintenance: m.lastMaintenance,
          lastMaintenanceType: typeof m.lastMaintenance
        });
      });
      
      const mappedMachines = (machinePage.content || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        sector: typeof m.sector === 'object' ? m.sector?.id || '' : m.sector,
        status: m.status || '',
        oee: m.oee,
        throughput: m.throughput,
        lastMaintenance: m.lastMaintenance,
        photo: m.photo,
        serieNumber: m.serieNumber,
        machineModel: 1, // Valor padrão para exibição
        // Campos para exibição
        department: typeof m.sector === 'object' ? m.sector?.name || '' : '',
        model: `Modelo ${m.serieNumber}`,
        efficiency: Math.round(m.oee * 100),
        production: Math.round(m.throughput * 8), // Simulação de produção diária
        image: m.photo
      }));
      dataCache.set(CACHE_KEYS.MACHINES, mappedMachines);
      setMachines(mappedMachines);
    } catch (err) {
      console.error('Erro ao carregar máquinas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // Tentar usar cache compartilhado de employees
      const cached = dataCache.get<any[]>(CACHE_KEYS.EMPLOYEES, 3 * 60 * 1000);
      const source = cached || (await listEmployees({ pageNumber: 0, pageSize: 100 })).data.content || [];
      const mappedEmployees = (source || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        photo: e.photo,
        machineIds: [] // Por enquanto vazio, pode ser implementado depois
      }));
      setEmployees(mappedEmployees);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const handleSubmitMachine = async (data: Record<string, any>) => {
    try {
      setFieldErrors({}); // Limpar erros anteriores
      console.log('Dados da máquina:', data);
      console.log('Modo:', formMode);
      
      let dto: MachineDTO | Partial<MachineDTO>;
      
      if (formMode === 'create') {
        dto = {
          name: data.name,
          sector: parseInt(data.sector) || 0,
          status: data.status,
          oee: parseFloat(data.oee) || 0,
          throughput: parseInt(data.throughput) || 0,
          lastMaintenance: data.lastMaintenance,
          photo: data.photo && data.photo.trim() !== '' ? data.photo : 'https://via.placeholder.com/150x150/10b981/ffffff?text=🏢',
          serieNumber: parseInt(data.serieNumber) || 0,
          machineModel: 1
        };
      } else {
        dto = {} as Partial<MachineDTO>;
        
        if (data.name) dto.name = data.name;
        if (data.sector && !isNaN(parseInt(data.sector))) dto.sector = parseInt(data.sector);
        if (data.status) dto.status = data.status;
        if (data.oee && !isNaN(parseFloat(data.oee))) dto.oee = parseFloat(data.oee);
        if (data.throughput && !isNaN(parseInt(data.throughput))) dto.throughput = parseInt(data.throughput);
        if (data.lastMaintenance) dto.lastMaintenance = data.lastMaintenance;
        if (data.photo !== undefined) dto.photo = data.photo || undefined;
        if (data.serieNumber && !isNaN(parseInt(data.serieNumber))) dto.serieNumber = parseInt(data.serieNumber);
      }
      
      if (formMode === 'create') {
        if (!rateLimiter.canMakeRequest('createMachine')) {
          const timeLeft = rateLimiter.getTimeUntilReset('createMachine');
          notification.warning(
            `Aguarde ${timeLeft} segundos antes de criar outra máquina`,
            'Limite de Requisições'
          );
          return;
        }

        await createLock.executeWithLock(async () => {
          await createMachine(dto as MachineDTO);
          await loadMachines();
          notification.success('Máquina criada com sucesso!', 'Sucesso');
        });
      } else {
        if (selectedMachineForEdit) {
          if (!rateLimiter.canMakeRequest('updateMachine')) {
            const timeLeft = rateLimiter.getTimeUntilReset('updateMachine');
            notification.warning(
              `Aguarde ${timeLeft} segundos antes de atualizar`,
              'Limite de Requisições'
            );
            return;
          }

          await updateLock.executeWithLock(async () => {
            await updateMachine(selectedMachineForEdit.id, dto as MachineDTO);
            await loadMachines();
            notification.success('Máquina atualizada com sucesso!', 'Sucesso');
          });
        } else {
          throw new Error('Máquina não encontrada para edição');
        }
      }
      
      setShowFormModal(false);
      setFieldErrors({});
    } catch (err: any) {
      console.error('Erro ao salvar máquina:', err);
      
      // Extrair erros de campos se houver
      if (hasFieldErrors(err)) {
        const errors = getFieldErrors(err);
        setFieldErrors(errors);
        console.log('Erros de campos:', errors);
      }
      
      // Mostrar mensagem de erro
      const errorMessage = getErrorMessage(err);
      notification.error(errorMessage, 'Erro');
    }
  };

  const handleOpenDetails = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedMachine(null);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedMachineForEdit(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (machine: Machine) => {
    setFormMode('edit');
    
    // Pré-preencher dados para edição
    const machineData = {
      id: machine.id,
      name: machine.name || '',
      sector: machine.sector?.toString() || '',
      status: machine.status?.toUpperCase() || '',
      oee: machine.oee?.toString() || '',
      throughput: machine.throughput?.toString() || '',
      lastMaintenance: machine.lastMaintenance || '', // Deixar vazio se não tiver
      photo: machine.photo || '',
      serieNumber: machine.serieNumber?.toString() || ''
    };
    
    console.log('=== ABRINDO EDIÇÃO DE MÁQUINA ===');
    console.log('Máquina original:', machine);
    console.log('Dados pré-preenchidos:', machineData);
    console.log('lastMaintenance:', machineData.lastMaintenance);
    
    setSelectedMachineForEdit(machineData as any);
    setShowFormModal(true);
  };

  const handleDeleteMachine = async () => {
    if (selectedMachine) {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir a máquina "${selectedMachine.name}"?\n\n` +
        `Esta ação irá remover permanentemente:\n` +
        `• Todos os dados da máquina\n` +
        `• Histórico de manutenções\n` +
        `• Dados de produção e OEE\n` +
        `• Alocações de funcionários\n` +
        `• Todas as informações relacionadas\n\n` +
        `Esta ação não pode ser desfeita!`
      );
      
      if (confirmed) {
        try {
          // Verificar rate limit para deleção (mais restritivo)
          if (!strictRateLimiter.canMakeRequest('deleteMachine')) {
            const timeLeft = strictRateLimiter.getTimeUntilReset('deleteMachine');
            notification.warning(
              `Aguarde ${timeLeft} segundos antes de deletar outra máquina`,
              'Limite de Requisições'
            );
            return;
          }

          console.log('=== DELETANDO MÁQUINA ===');
          console.log('Nome:', selectedMachine.name);
          console.log('ID:', selectedMachine.id);
          console.log('Série:', selectedMachine.serieNumber);
          
          // Executar com bloqueio de botão
          await deleteLock.executeWithLock(async () => {
            await deleteMachine(selectedMachine.id);
            console.log('Máquina deletada com sucesso');
            
            await loadMachines();
            setSelectedMachine(null);
            setShowDetailsModal(false);
            notification.success('Máquina removida com sucesso!', 'Sucesso');
          });
        } catch (err: any) {
          console.error('Erro ao deletar máquina:', err);
          const errorMessage = getErrorMessage(err);
          notification.error(errorMessage, 'Erro');
        }
      }
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadMachines();
    loadEmployees();
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

  const totalMachines = machines.length;
  const operatingMachines = machines.filter(m => {
    const status = m.status?.toUpperCase() || '';
    return status === 'OPERANDO' || status === 'OPERATING' || status === 'ACTIVE';
  }).length;
  const maintenanceMachines = machines.filter(m => {
    const status = m.status?.toUpperCase() || '';
    return status === 'MANUTENÇÃO' || status === 'MANUTENCAO' || status === 'MAINTENANCE' || status === 'EM_MANUTENCAO';
  }).length;

  const averageOEE = machines.length ? Math.round(machines.reduce((sum, m) => sum + (m.oee * 100), 0) / machines.length) : 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operando': return 'success';
      case 'parada': return 'error';
      case 'manutencao': return 'warning';
      default: return 'default';
    }
  };

  const getMachineIcon = (name: string) => {
    if (name.includes('Corte')) return <FaIndustry />;
    if (name.includes('Prensa')) return <FaCog />;
    if (name.includes('Injetora')) return <FaTools />;
    if (name.includes('Montadora')) return <FaIndustry />;
    return <FaIndustry />;
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className={`transition-all duration-300 pt-14 sm:pt-16 ml-0 ${
        sidebarCollapsed ? 'md:ml-12 notebook:ml-16' : 'md:ml-56 notebook:ml-64'
      }`}>
        {loading ? (
          <div className="p-3 sm:p-4 md:p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen animate-fadeInUp" style={{ background: 'var(--bg-gradient)' }}>
          
          <div className={`rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Máquinas</h1>
                <p className={`text-sm sm:text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Monitoramento e controle das máquinas de produção</p>
              </div>
              {canCreate(userRole) && (
                <Button
                  variant="contained"
                  startIcon={<FaPlus />}
                  onClick={handleOpenCreate}
                  sx={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    py: 2,
                    px: 4,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'var(--primary-dark)',
                    },
                  }}
                >
                  Adicionar Máquina
                </Button>
              )}
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 notebook:grid-cols-4 gap-3 sm:gap-4 md:gap-6 notebook:gap-8 mb-4 sm:mb-6 md:mb-8">
            <div className={`rounded-xl sm:rounded-2xl shadow-sm border-2 p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#3b82f6' : '#3b82f6'
            }}>
              <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Total de Máquinas</p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{totalMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>Todas operacionais</span>
                  </div>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaIndustry className={`text-lg sm:text-xl md:text-2xl ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl sm:rounded-2xl shadow-sm border-2 p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#10b981' : '#10b981'
            }}>
              <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Em Operação</p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{operatingMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{Math.round((operatingMachines/totalMachines)*100)}% ativas</span>
                  </div>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaCheckCircle className={`text-lg sm:text-xl md:text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl sm:rounded-2xl shadow-sm border-2 p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#f97316' : '#f97316'
            }}>
              <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Em Manutenção</p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{maintenanceMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                    <span>Preventiva</span>
                  </div>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                }`}>
                  <FaTools className={`text-lg sm:text-xl md:text-2xl ${
                    isDarkMode ? "text-orange-400" : "text-orange-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl sm:rounded-2xl shadow-sm border-2 p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#eab308' : '#eab308'
            }}>
              <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>OEE Médio</p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{averageOEE}%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+3.2% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}>
                  <FaChartLine className={`text-lg sm:text-xl md:text-2xl ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Máquinas com Virtualização */}
          <ResponsiveGrid
            items={machines}
            enableVirtualization={machines.length > 20}
            renderItem={(machine) => {
              const operadores = employees.filter(emp => emp.machineIds && emp.machineIds.includes(machine.id));
              return (
                <div
                  className={`rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                  onClick={() => handleOpenDetails(machine)}
                >
                  <div className="mb-6">
                    <div className="flex justify-end mb-2">
                      <Chip 
                        label={machine.status}
                        color={getStatusColor(machine.status) as any}
                        size="small"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={getThumb(machine.image, 96)}
                        alt={machine.name}
                        imgProps={{ loading: 'lazy', decoding: 'async' }}
                        className={`w-16 h-16 border-4 shadow-lg ${
                          machine.status === 'Operando' ? 'border-green-400' :
                          machine.status === 'Parada' ? 'border-red-400' :
                          'border-yellow-400'
                        }`}
                      />
                      <div>
                        <h3 className={`text-xl font-bold mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>{machine.name}</h3>
                        <p className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Máquina de Produção</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {operadores.length > 0 ? operadores.map(emp => (
                        <Chip 
                          key={emp.id} 
                          label={emp.name.split(' ')[0]} 
                          avatar={
                            <Avatar 
                              src={getThumb(emp.photo, 40)} 
                              alt={emp.name}
                              sx={{ width: 24, height: 24 }}
                              imgProps={{ loading: 'lazy', decoding: 'async' }}
                            />
                          } 
                          size="small" 
                        />
                      )) : <span className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>Sem operador</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`text-center p-4 rounded-2xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}>
                        <p className={`text-xs mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>OEE</p>
                        <p className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>{Math.round(machine.oee * 100)}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                          <div
                            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${machine.oee * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className={`text-center p-4 rounded-2xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}>
                        <p className={`text-xs mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Vazão</p>
                        <p className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>{machine.throughput}</p>
                        <p className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>un/h</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      startIcon={<FaEye />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(machine);
                      }}
                      sx={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        py: 2,
                        borderRadius: '12px',
                        '&:hover': {
                          backgroundColor: 'var(--primary-dark)',
                        },
                      }}
                      fullWidth
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FaEdit />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(machine);
                      }}
                      sx={{
                        color: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        py: 2,
                        borderRadius: '12px',
                        '&:hover': {
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          borderColor: 'var(--primary)',
                        },
                      }}
                      fullWidth
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </div>
        )}
      </main>

        {/* Modais */}
        <Dialog
          open={showDetailsModal}
          onClose={handleCloseDetails}
          keepMounted
          maxWidth="md"
          fullWidth
        >
          {selectedMachine && (
            <>
              <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="text-white text-lg">
                        {getMachineIcon(selectedMachine.name)}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedMachine.name}</h2>
                      <p className="text-sm opacity-90">Detalhes da Máquina</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    aria-label="Fechar"
                    className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-all duration-200 font-bold text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </DialogTitle>

              <DialogContent className={`p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"}`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>Informações Básicas</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Nome:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Modelo:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              selectedMachine.status === 'Ativa' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {selectedMachine.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Departamento:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"}`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>Métricas</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>OEE:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.oee}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Eficiência:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.efficiency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Produção:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.production} unidades</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Última Manutenção:</span>
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedMachine.lastMaintenance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>Histórico de Manutenção</h3>
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center py-2 border-b-2 ${isDarkMode ? "border-gray-600" : "border-blue-200"}`}>
                        <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Manutenção Preventiva</span>
                        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>15/01/2024</span>
                      </div>
                      <div className={`flex justify-between items-center py-2 border-b-2 ${isDarkMode ? "border-gray-600" : "border-blue-200"}`}>
                        <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Troca de Filtros</span>
                        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>10/01/2024</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Calibração</span>
                        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>05/01/2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className={`p-6 border-t-2 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                <div className="flex gap-3 w-full justify-between">
                  <Button
                    variant="contained"
                    startIcon={<FaChartLine />}
                    onClick={() => {
                      window.open('http://172.20.10.2:8000/', '_blank');
                    }}
                    sx={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#059669',
                      },
                    }}
                  >
                    Visualizar Operação
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="contained"
                      startIcon={<FaEdit />}
                      onClick={() => {
                        handleCloseDetails();
                        handleOpenEdit(selectedMachine);
                      }}
                      sx={{
                        backgroundColor: 'var(--primary-dark)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: 'var(--primary)',
                        },
                        display: canEdit(userRole) ? 'inline-flex' : 'none'
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleCloseDetails();
                        handleDeleteMachine();
                      }}
                      sx={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#b91c1c',
                        },
                        display: canDelete(userRole) ? 'inline-flex' : 'none'
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </DialogActions>
            </>
          )}
        </Dialog>

        <CUDModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setFieldErrors({});
          }}
          mode={formMode}
          title={formMode === 'create' ? 'Adicionar Nova Máquina' : 'Editar Máquina'}
          fields={machineFields}
          initialData={selectedMachineForEdit || {}}
          onSubmit={handleSubmitMachine}
          entityType="machine"
          serverErrors={fieldErrors}
        />
    </div>
  );
};

export default Maquinas;
