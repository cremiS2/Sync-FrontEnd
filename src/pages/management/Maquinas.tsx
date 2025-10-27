import React, { useState, useEffect } from "react";
import { listMachines, createMachine, updateMachine, deleteMachine } from '../../services/machines';
import { listEmployees } from '../../services/employees';
import { Header, Sidebar } from '../../components/layout';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Chip, Avatar } from '@mui/material';
import { FaIndustry, FaCog, FaTools, FaPlus, FaEye, FaEdit, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import type { Machine, MachineDTO } from '../../types';

const Maquinas: React.FC = () => {
  console.log('Maquinas component is rendering');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMachineForEdit, setSelectedMachineForEdit] = useState<Machine | null>(null);

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
        { value: 'MANUTENCAO', label: 'Manutenção' }
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
      type: 'text',
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

  const loadMachines = async () => {
    try {
      const { data: machinePage } = await listMachines({ pageNumber: 0, pageSize: 100 });
      const mappedMachines = (machinePage.content || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        sector: typeof m.sector === 'object' ? m.sector?.id || '' : m.sector,
        status: m.status?.toLowerCase() || '',
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
      setMachines(mappedMachines);
    } catch (err) {
      console.error('Erro ao carregar máquinas:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data: empPage } = await listEmployees({ pageNumber: 0, pageSize: 100 });
      const mappedEmployees = (empPage.content || []).map((e: any) => ({
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
    console.log('Dados da máquina:', data);
    console.log('Modo:', formMode);
    
    let dto: MachineDTO | Partial<MachineDTO>;
    
    if (formMode === 'create') {
      // Na criação, enviar todos os campos obrigatórios
      dto = {
        name: data.name,
        sector: parseInt(data.sector) || 0,
        status: data.status,
        oee: parseFloat(data.oee) || 0,
        throughput: parseInt(data.throughput) || 0,
        lastMaintenance: data.lastMaintenance,
        // Usar foto padrão se não tiver foto
        photo: data.photo && data.photo.trim() !== '' ? data.photo : 'https://via.placeholder.com/150x150/10b981/ffffff?text=🏢',
        serieNumber: parseInt(data.serieNumber) || 0,
        machineModel: 1 // Valor fixo padrão
      };
      console.log('DTO de criação:', dto);
      console.log('Validação dos campos:');
      console.log('- name:', typeof data.name, data.name);
      console.log('- sector:', typeof data.sector, data.sector, '->', parseInt(data.sector));
      console.log('- status:', typeof data.status, data.status);
      console.log('- oee:', typeof data.oee, data.oee, '->', parseFloat(data.oee));
      console.log('- throughput:', typeof data.throughput, data.throughput, '->', parseInt(data.throughput));
      console.log('- lastMaintenance:', typeof data.lastMaintenance, data.lastMaintenance);
      console.log('- photo:', typeof data.photo, data.photo);
      console.log('- serieNumber:', typeof data.serieNumber, data.serieNumber, '->', parseInt(data.serieNumber));
    } else {
      // Na edição, enviar apenas os campos que foram alterados
      dto = {} as Partial<MachineDTO>;
      
      if (data.name) dto.name = data.name;
      if (data.sector && !isNaN(parseInt(data.sector))) dto.sector = parseInt(data.sector);
      if (data.status) dto.status = data.status;
      if (data.oee && !isNaN(parseFloat(data.oee))) dto.oee = parseFloat(data.oee);
      if (data.throughput && !isNaN(parseInt(data.throughput))) dto.throughput = parseInt(data.throughput);
      if (data.lastMaintenance) dto.lastMaintenance = data.lastMaintenance;
      if (data.photo !== undefined) dto.photo = data.photo || undefined;
      if (data.serieNumber && !isNaN(parseInt(data.serieNumber))) dto.serieNumber = parseInt(data.serieNumber);
      
      console.log('DTO de edição:', dto);
      console.log('Campos a serem enviados:', Object.keys(dto));
    }
    
    try {
      if (formMode === 'create') {
        await createMachine(dto as MachineDTO);
        await loadMachines();
      } else {
        if (selectedMachineForEdit) {
          console.log('Editando máquina - ID:', selectedMachineForEdit.id);
          console.log('Editando máquina - DTO:', dto);
          await updateMachine(selectedMachineForEdit.id, dto as MachineDTO);
          await loadMachines();
        } else {
          throw new Error('Máquina não encontrada para edição');
        }
      }
      setShowFormModal(false);
    } catch (err: any) {
      console.error('Erro ao salvar máquina:', err);
      alert(`Erro ao salvar máquina: ${err?.response?.data?.menssagem || err.message}`);
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
      id: machine.id, // ← ADICIONAR O ID AQUI
      name: machine.name || '',
      sector: machine.sector?.toString() || '',
      status: machine.status?.toUpperCase() || '',
      oee: machine.oee?.toString() || '',
      throughput: machine.throughput?.toString() || '',
      lastMaintenance: machine.lastMaintenance || '',
      photo: machine.photo || '',
      serieNumber: machine.serieNumber?.toString() || ''
    };
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
          console.log('=== DELETANDO MÁQUINA ===');
          console.log('Nome:', selectedMachine.name);
          console.log('ID:', selectedMachine.id);
          console.log('Série:', selectedMachine.serieNumber);
          
          await deleteMachine(selectedMachine.id);
          console.log('Máquina deletada com sucesso');
          
          await loadMachines();
          setSelectedMachine(null);
          setShowDetailsModal(false);
        } catch (err: any) {
          console.error('Erro ao deletar máquina:', err);
          alert(`Erro ao excluir máquina: ${err?.response?.data?.menssagem || err.message}`);
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
  const operatingMachines = machines.filter(m => m.status === 'operando').length;
  const maintenanceMachines = machines.filter(m => m.status === 'manutencao').length;

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
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 pt-16 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
          {/* Monday.com Style Header */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Máquinas</h1>
                <p className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Monitoramento e controle das máquinas de produção</p>
              </div>
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
                  }`}>Total de Máquinas</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{totalMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>Todas operacionais</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaIndustry className={`text-2xl ${
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
                  }`}>Em Operação</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{operatingMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{Math.round((operatingMachines/totalMachines)*100)}% ativas</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaCheckCircle className={`text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
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
                  }`}>Em Manutenção</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{maintenanceMachines}</p>
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                    <span>Preventiva</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                }`}>
                  <FaTools className={`text-2xl ${
                    isDarkMode ? "text-orange-400" : "text-orange-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#eab308' : '#eab308'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>OEE Médio</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{averageOEE}%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+3.2% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}>
                  <FaChartLine className={`text-2xl ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Máquinas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {machines.map((machine) => {
              const operadores = employees.filter(emp => emp.machineIds && emp.machineIds.includes(machine.id));
              return (
                <div
                  key={machine.id}
                  className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                  onClick={() => handleOpenDetails(machine)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={machine.image}
                        className={`w-16 h-16 border-4 shadow-lg ${
                          machine.status === 'Operando' ? 'border-green-400' :
                          machine.status === 'Manutenção' ? 'border-yellow-400' :
                          machine.status === 'Parada' ? 'border-red-400' : 'border-gray-300'
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
                    <Chip 
                      label={machine.status}
                      color={getStatusColor(machine.status) as any}
                      size="small"
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {operadores.length > 0 ? operadores.map(emp => (
                        <Chip key={emp.id} label={emp.name.split(' ')[0]} avatar={<Avatar src={emp.photo} />} size="small" />
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
                      variant="outlined"
                      startIcon={<FaEye />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(machine);
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
                      Ver
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
            })}
          </div>
        </div>
        </main>

        {/* Modais */}
        <Dialog
          open={showDetailsModal}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          {selectedMachine && (
            <>
              <DialogTitle className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
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
              </DialogTitle>

              <DialogContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--primary)] mb-3">Informações Básicas</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nome:</span>
                            <span className="font-medium">{selectedMachine.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Modelo:</span>
                            <span className="font-medium">{selectedMachine.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedMachine.status === 'Ativa' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedMachine.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departamento:</span>
                            <span className="font-medium">{selectedMachine.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--primary)] mb-3">Métricas</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">OEE:</span>
                            <span className="font-medium">{selectedMachine.oee}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Eficiência:</span>
                            <span className="font-medium">{selectedMachine.efficiency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Produção:</span>
                            <span className="font-medium">{selectedMachine.production} unidades</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Última Manutenção:</span>
                            <span className="font-medium">{selectedMachine.lastMaintenance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--primary)] mb-3">Histórico de Manutenção</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Manutenção Preventiva</span>
                          <span className="text-sm font-medium">15/01/2024</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Troca de Filtros</span>
                          <span className="text-sm font-medium">10/01/2024</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Calibração</span>
                          <span className="text-sm font-medium">05/01/2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="p-6">
                <div className="flex gap-3 w-full justify-end">
                  <Button
                    variant="outlined"
                    onClick={handleCloseDetails}
                    sx={{
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      '&:hover': {
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderColor: 'var(--primary)',
                      },
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleCloseDetails();
                      handleOpenEdit(selectedMachine);
                    }}
                    sx={{
                      backgroundColor: 'var(--primary)',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                      },
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
                      '&:hover': {
                        backgroundColor: '#b91c1c',
                      },
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </DialogActions>
            </>
          )}
        </Dialog>

        <CUDModal
          open={showFormModal}
          onClose={() => setShowFormModal(false)}
          mode={formMode}
          title={formMode === 'create' ? 'Adicionar Nova Máquina' : 'Editar Máquina'}
          fields={machineFields}
          initialData={selectedMachineForEdit || {}}
          onSubmit={handleSubmitMachine}
          entityType="machine"
        />
    </div>
  );
};

export default Maquinas;
