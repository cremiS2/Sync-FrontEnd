import React, { useState, useEffect, useCallback } from "react";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/employees';
import { listMachines } from '../../services/machines';
import { listAllocations } from '../../services/allocatedEmployeeMachine';
import { Header, Sidebar } from "../../components/layout";
import { Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import StatusChip from '../../components/ui/StatusChip';
import { FaUsers, FaPlus, FaEdit, FaEye, FaUserTie, FaBuilding, FaChartLine, FaTrash, FaClock, FaTimes } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import ImageUpload from '../../components/forms/ImageUploadSimple';
import type { Employee, EmployeeDTO } from '../../types';
import { useNotification } from '../../components/system/NotificationSystem';
import { dataCache, CACHE_KEYS } from '../../utils/dataCache';
import ResponsiveGrid from '../../components/common/VirtualizedGrid';

// Interface estendida para o frontend com campos extras
interface ExtendedEmployee extends Employee {
  department: string; // Na verdade armazena o nome do SETOR (para exibição no card)
  role: string;
  performance: number;
  machineIds: number[];
}

const Funcionarios: React.FC = () => {
  // Helper para gerar miniaturas em listas (mantém original em modais)
  const getThumb = (url?: string, size: number = 96): string | undefined => {
    if (!url) return url as any;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${size}&h=${size}&fit=crop`;
  };
  console.log('Funcionarios component is rendering');
  
  const notification = useNotification();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [employees, setEmployees] = useState<ExtendedEmployee[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  // const [loadingData, setLoadingData] = useState<boolean>(false);
  // const [errorLoad, setErrorLoad] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<any | null>(null);

  const handleCardClick = (emp: ExtendedEmployee) => {
    setSelectedEmployee(emp);
    setShowEmployeeModal(true);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedEmployeeForEdit(null);
    setShowFormModal(true);
  };


  const handleOpenEdit = (employee: ExtendedEmployee) => {
    setFormMode('edit');
    // Pré-preencher dados para edição
    const employeeData = {
      name: employee.name || '',
      employeeID: employee.employeeID?.toString() || '',
      sector: employee.sector?.id?.toString() || '',
      shift: employee.shift || '', // Manter valor original do backend
      status: employee.status || '', // Manter valor original do backend
      photo: employee.photo || '',
      // Manter o user original para exibição, mas não enviar na requisição
      user: employee.user?.toString() || 'Nenhum'
    };
    
    console.log('Dados do funcionário para edição:', employeeData);
    setSelectedEmployeeForEdit(employeeData);
    setShowFormModal(true);
  };

  const loadEmployees = useCallback(async (forceRefresh = false) => {
    // Verificar cache primeiro (válido por 3 minutos)
    if (!forceRefresh) {
      const cachedEmployees = dataCache.get<any[]>(CACHE_KEYS.EMPLOYEES, 3 * 60 * 1000);
      // Usar cache apenas se já estiver no formato estendido esperado
      const isExtended = Array.isArray(cachedEmployees) && cachedEmployees.length > 0 &&
        cachedEmployees[0] && typeof cachedEmployees[0].performance === 'number' && Array.isArray(cachedEmployees[0].machineIds);
      if (isExtended) {
        console.log('[Funcionarios] Usando dados do cache (ExtendedEmployee)');
        setEmployees(cachedEmployees as ExtendedEmployee[]);
        return;
      }
    }

    console.log('[Funcionarios] Buscando dados da API...');
    const { data: empPage } = await listEmployees({ pageNumber: 0, pageSize: 100 });
    const { data: allocationsPage } = await listAllocations({ pageNumber: 0, pageSize: 1000 }).catch(() => ({ data: { content: [] } }));
    const allocations = allocationsPage.content || [];
    
    const mappedEmployees = (empPage.content || []).map((e: Employee): ExtendedEmployee => {
      // Buscar máquinas alocadas para este funcionário
      const employeeAllocations = allocations.filter((alloc: any) => alloc.employee?.id === e.id);
      const employeeMachineIds = employeeAllocations.map((alloc: any) => alloc.machine?.id).filter(Boolean);
      
      // Calcular performance baseado em disponibilidade e status
      let calculatedPerformance = 85; // Base
      if (e.availability) calculatedPerformance += 10; // +10% se disponível
      if ((e.status || '').toUpperCase() === 'ATIVO') calculatedPerformance += 5; // +5% se ativo
      calculatedPerformance = Math.min(100, calculatedPerformance); // Máximo 100%
      
      return {
        id: e.id,
        name: e.name,
        photo: e.photo,
        shift: e.shift || '',
        status: e.status || '',
        availability: e.availability,
        sector: e.sector,
        user: e.user,
        department: e.sector?.name ?? 'N/A',
        role: e.user?.roles?.[0]?.name ?? '',
        performance: calculatedPerformance, // Calculado com base em dados reais
        machineIds: employeeMachineIds, // Buscado da API de alocações
        employeeID: e.employeeID
      };
    });
    
    // Armazenar no cache já no formato estendido
    dataCache.set(CACHE_KEYS.EMPLOYEES, mappedEmployees);
    setEmployees(mappedEmployees);
  }, []);

  const handleDeleteEmployee = async () => {
    if (selectedEmployee) {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir o funcionário "${selectedEmployee.name}"?\n\n` +
        `Esta ação irá remover permanentemente:\n` +
        `• Todos os dados do funcionário\n` +
        `• Histórico de atividades\n` +
        `• Alocações de máquinas\n` +
        `• Informações de usuário vinculadas\n\n` +
        `Esta ação não pode ser desfeita!`
      );
      
      if (confirmed) {
        try {
          console.log('=== DELETANDO FUNCIONÁRIO ===');
          console.log('Nome:', selectedEmployee.name);
          console.log('ID:', selectedEmployee.id);
          
          await deleteEmployee(selectedEmployee.id);
          console.log('Funcionário deletado com sucesso');
          
          // Invalidar cache e recarregar lista
          dataCache.invalidate(CACHE_KEYS.EMPLOYEES);
          await loadEmployees(true);
          setSelectedEmployee(null);
          setShowEmployeeModal(false);
          notification.success('Funcionário removido com sucesso!', 'Sucesso');
        } catch (err: any) {
          console.error('Erro ao deletar funcionário:', err);
          notification.error(
            err?.response?.data?.menssagem || err.message || 'Erro ao excluir funcionário',
            'Erro'
          );
        }
      }
    }
  };

  const handleSubmitEmployee = async (data: Record<string, any>) => {
    console.log('Dados do formulário:', data);
    
    let dto: EmployeeDTO;
    
    if (formMode === 'create') {
      // Na criação, enviar todos os campos obrigatórios
      dto = {
        name: data.name,
        employeeID: parseInt(data.employeeID),
        sector: parseInt(data.sector),
        shift: data.shift, // Usar valor do formulário
        status: data.status, // Usar valor do formulário
        // Usar foto padrão se não tiver foto
        photo: data.photo && data.photo.trim() !== '' ? data.photo : 'https://via.placeholder.com/150x150/6366f1/ffffff?text=👤',
        user: parseInt(data.user),
        availability: true, // ← VOLTAR PARA BOOLEAN
      };
    } else {
      // Na edição, enviar apenas os campos que foram alterados
      dto = {} as Partial<EmployeeDTO> & { name: string; employeeID: number; sector: number; shift: string; status: string; availability: boolean; };
      
      // Sempre enviar name (obrigatório)
      if (data.name && data.name.trim() !== '') {
        dto.name = data.name;
      }
      
      // Enviar apenas se employeeID foi alterado e é válido
      if (data.employeeID && data.employeeID !== '' && !isNaN(parseInt(data.employeeID))) {
        dto.employeeID = parseInt(data.employeeID);
      }
      
      // Enviar apenas se sector foi alterado e é válido
      if (data.sector && data.sector !== '' && !isNaN(parseInt(data.sector))) {
        dto.sector = parseInt(data.sector);
      }
      
      // Enviar apenas se shift foi alterado
      if (data.shift && data.shift !== '') {
        dto.shift = data.shift; // Usar valor direto do formulário
      }
      
      // Enviar apenas se status foi alterado
      if (data.status && data.status !== '') {
        dto.status = data.status; // Usar valor direto do formulário
      }
      
      // Só enviar photo se tiver valor válido
      if (data.photo !== undefined && data.photo.trim() !== '') {
        dto.photo = data.photo;
      }
      
      // Não enviar user na edição para evitar conflitos
      
      console.log('Campos a serem enviados na edição:', Object.keys(dto));
    }
    
    console.log('DTO mapeado:', dto);
    console.log('Validação dos campos:');
    console.log('- name:', typeof data.name, data.name);
    console.log('- employeeID:', typeof data.employeeID, data.employeeID);
    console.log('- sector:', typeof data.sector, data.sector);
    console.log('- shift:', typeof data.shift, data.shift);
    console.log('- status:', typeof data.status, data.status);
    console.log('- photo:', typeof data.photo, data.photo);
    console.log('- user:', typeof data.user, data.user);
    
    // Log detalhado do DTO que será enviado
    console.log('=== DTO FINAL QUE SERÁ ENVIADO ===');
    console.log(JSON.stringify(dto, null, 2));
    
    // Validação adicional
    console.log('Validação do DTO:');
    console.log('- name válido:', !!dto.name && dto.name.trim() !== '');
    console.log('- employeeID válido:', !isNaN(dto.employeeID) && dto.employeeID > 0);
    console.log('- sector válido:', !isNaN(dto.sector) && dto.sector > 0);
    console.log('- shift válido:', !!dto.shift && dto.shift.trim() !== '');
    console.log('- status válido:', !!dto.status && dto.status.trim() !== '');
    
    // Validação específica para criação
    if (formMode === 'create') {
      if (!data.name || data.name.trim() === '') {
        throw new Error('Nome é obrigatório');
      }
      if (!data.employeeID || data.employeeID.trim() === '' || isNaN(parseInt(data.employeeID))) {
        throw new Error('Matrícula/ID Interno é obrigatório e deve ser um número');
      }
      if (parseInt(data.employeeID) > 99999) {
        throw new Error('Matrícula/ID Interno não pode passar de 5 dígitos (máximo: 99999)');
      }
      if (!data.sector || data.sector.trim() === '' || isNaN(parseInt(data.sector))) {
        throw new Error('Setor é obrigatório e deve ser um número');
      }
      if (!data.shift || data.shift.trim() === '') {
        throw new Error('Turno é obrigatório');
      }
      if (!data.status || data.status.trim() === '') {
        throw new Error('Status é obrigatório');
      }
      if (!data.user || data.user.trim() === '' || isNaN(parseInt(data.user))) {
        throw new Error('Usuário é obrigatório e deve ser um número');
      }
    }
    
    try {
      if (formMode === 'create') {
        console.log('Criando novo funcionário...');
        console.log('Token atual:', localStorage.getItem('user_token'));
        console.log('Token existe:', !!localStorage.getItem('user_token'));
        
        const response = await createEmployee(dto);
        console.log('Funcionário criado com sucesso:', response.headers?.location);
        // Invalidar cache e recarregar lista
        dataCache.invalidate(CACHE_KEYS.EMPLOYEES);
        await loadEmployees(true);
        notification.success('Funcionário criado com sucesso!', 'Sucesso');
      } else {
        console.log('Editando funcionário:', selectedEmployeeForEdit?.id);
        // Para edição, usar o ID original do funcionário, não o employeeID
        const originalEmployee = employees.find(emp => emp.employeeID === parseInt(data.employeeID));
        if (originalEmployee) {
          await updateEmployee(originalEmployee.id, dto);
          console.log('Funcionário atualizado com sucesso');
          // Invalidar cache e recarregar lista
          dataCache.invalidate(CACHE_KEYS.EMPLOYEES);
          await loadEmployees(true);
          notification.success('Funcionário atualizado com sucesso!', 'Sucesso');
        } else {
          throw new Error('Funcionário não encontrado para edição');
        }
      }
      setShowFormModal(false);
    } catch (err: any) {
      console.error('Erro ao salvar funcionário:', err);
      
      if (err?.response?.status === 401) {
        console.error('Erro 401: Token expirado ou inválido');
        notification.error('Sessão expirada. Faça login novamente.', 'Erro');
        // Redirecionar para login
        window.location.href = '/login';
        return;
      }
      
      notification.error(
        err?.response?.data?.menssagem || err.message || 'Erro ao salvar funcionário',
        'Erro'
      );
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Funcionarios] Carregando dados...');
        // Buscar employees com alocações usando a função loadEmployees
        await loadEmployees();
        
        // Buscar máquinas com cache (válido por 3 minutos)
        const cachedMachines = dataCache.get(CACHE_KEYS.MACHINES, 3 * 60 * 1000);
        if (cachedMachines) {
          console.log('[Funcionarios] Usando máquinas do cache');
          setMachines(cachedMachines as any[]);
        } else {
          console.log('[Funcionarios] Buscando máquinas da API...');
          const { data: machPage } = await listMachines({ pageNumber: 0, pageSize: 100 });
          const machines = machPage.content || [];
          dataCache.set(CACHE_KEYS.MACHINES, machines);
          setMachines(machines);
        }
      } catch (err) {
        console.error('[Funcionarios] Falha ao carregar dados:', err);
      } finally {
        console.log('[Funcionarios] Concluído carregamento de dados');
      }
    };
    fetchData();
  }, [loadEmployees]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
    const matchesShift = filterShift === "all" || emp.shift === filterShift;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesShift && matchesStatus;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => (emp.status || '').toUpperCase() === "ATIVO").length;
  const averagePerformance = employees.length ? Math.round(employees.reduce((sum, emp) => sum + (emp.performance || 0), 0) / employees.length) : 0;
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const shifts = [...new Set(employees.map(emp => emp.shift).filter(Boolean))];
  const statuses = [...new Set(employees.map(emp => emp.status).filter(Boolean))];

  // Configuração dos campos do formulário baseada no EmployeeDTO do backend
  const employeeFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Nome Completo',
      type: 'text',
      required: true,
      placeholder: 'Digite o nome completo'
    },
    {
      name: 'employeeID',
      label: 'Matrícula/ID Interno',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 12345 (máximo 5 dígitos)'
    },
    {
      name: 'sector',
      label: 'ID do Setor',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 1'
    },
    {
      name: 'shift',
      label: 'Turno',
      type: 'select',
      required: true,
      options: [
        { value: 'DIURNO', label: 'Diurno' },
        { value: 'VESPERTINO', label: 'Vespertino' },
        { value: 'NOTURNO', label: 'Noturno' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Ativo' },
        { value: 'ON_LEAVE', label: 'Em Licença' },
      ]
    },
    {
      name: 'photo',
      label: 'Foto (Opcional)',
      type: 'custom',
      required: false,
      component: (props: { value: any; onChange: (value: any) => void; error?: string }) => (
        <ImageUpload
          value={props.value}
          onChange={props.onChange}
          label="Foto do Funcionário (Opcional)"
          placeholder="Cole a URL da imagem ou deixe vazio para usar avatar padrão"
        />
      )
    },
    ...(formMode === 'create' ? [{
      name: 'user',
      label: 'ID do Usuário',
      type: 'number' as const,
      required: false,
      placeholder: 'Ex.: 1'
    }] : [])
  ];

  const getStatusColor = (status: string) => {
    const s = (status || '').toUpperCase().replace(/\s+/g, '_');
    switch (s) {
      case 'ACTIVE':
      case 'ATIVO':
        return 'success';
      case 'ON_LEAVE':
      case 'MEDICAL_LEAVE':
      case 'EM_LICENCA':
      case 'LICENCA_MEDICA':
        return 'warning';
      case 'ABSENT':
      case 'INACTIVE':
      case 'INATIVO':
        return 'error';
      case 'NEXT_SHIFT':
      case 'PROXIMO_TURNO':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const s = (status || '').toUpperCase().replace(/\s+/g, '_');
    switch (s) {
      case 'ACTIVE':
      case 'ATIVO':
        return 'Ativo';
      case 'ON_LEAVE':
      case 'EM_LICENCA':
        return 'Em Licença';
      case 'MEDICAL_LEAVE':
      case 'LICENCA_MEDICA':
        return 'Licença Médica';
      case 'ABSENT':
      case 'INACTIVE':
      case 'INATIVO':
        return 'Ausente';
      case 'NEXT_SHIFT':
      case 'PROXIMO_TURNO':
        return 'Próximo Turno';
      default:
        return status;
    }
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
                }`}>Funcionários</h1>
                <p className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Gestão e acompanhamento da equipe de produção</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Filtros e Busca</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <TextField
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                    },
                  },
                }}
              />
              
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Departamento</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Departamento"
                  sx={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Turno</InputLabel>
                <Select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  label="Turno"
                  sx={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {shifts.map(shift => (
                    <MenuItem key={shift} value={shift}>{shift}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>{getStatusText(status)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'var(--primary-dark)',
                  },
                }}
              >
                Novo Funcionário
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
                  }`}>Total de Funcionários</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{totalEmployees}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+3 este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaUsers className={`text-2xl ${
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
                  }`}>Funcionários Ativos</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{activeEmployees}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{Math.round((activeEmployees/totalEmployees)*100)}% da equipe</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaUserTie className={`text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
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
                  }`}>Performance Média</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{averagePerformance}%</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+2.1% vs mês anterior</span>
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

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#8b5cf6' : '#8b5cf6'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Departamentos</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{departments.length}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>Distribuídos</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <FaBuilding className={`text-2xl ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Funcionários com Virtualização */}
          <ResponsiveGrid
            items={filteredEmployees}
            enableVirtualization={filteredEmployees.length > 20}
            renderItem={(employee) => (
              <div
                className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
                onClick={() => handleCardClick(employee)}
              >
                <div className="mb-6">
                  <div className="flex justify-end mb-2">
                    <StatusChip status={employee.status} size="small" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={getThumb(employee.photo, 96)} 
                      alt={employee.name}
                      sx={{ width: 64, height: 64 }}
                      imgProps={{ loading: 'lazy', decoding: 'async' }}
                    />
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{employee.name}</h3>
                      <p className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>{employee.role || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className={`flex items-center gap-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <FaBuilding className={`text-lg ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`} />
                    <span>{employee.department || '-'}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <FaClock className={`text-lg ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`} />
                    <span>{employee.shift || '-'}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <FaChartLine className={`text-lg ${
                      isDarkMode ? "text-yellow-400" : "text-yellow-600"
                    }`} />
                    <span>{employee.performance}% Performance</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<FaEye />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(employee);
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
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FaEdit />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(employee);
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
            )}
          />
        </div>
      </main>

      {/* Modal de Detalhes */}
      <Dialog
          open={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          keepMounted
          maxWidth="md"
          fullWidth
        >
          {selectedEmployee && (
            <>
              <DialogTitle className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedEmployee.photo}
                      sx={{ width: 40, height: 40 }}
                      imgProps={{ loading: 'lazy', decoding: 'async' }}
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                      <p className="text-sm opacity-90">{selectedEmployee.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmployeeModal(false)}
                    aria-label="Fechar"
                    className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-all duration-200 font-bold text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </DialogTitle>

              <DialogContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUserTie className="text-[var(--primary-dark)]" />
                        <span className="text-sm font-bold text-gray-900">Cargo</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{selectedEmployee.role}</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBuilding className="text-[var(--primary-dark)]" />
                        <span className="text-sm font-bold text-gray-900">Departamento</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{selectedEmployee.department}</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-[var(--primary-dark)]" />
                        <span className="text-sm font-bold text-gray-900">Turno</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{selectedEmployee.shift}</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className="text-[var(--primary-dark)]" />
                        <span className="text-sm font-bold text-gray-900">Status</span>
                      </div>
                      <Chip 
                        label={getStatusText(selectedEmployee.status)}
                        color={getStatusColor(selectedEmployee.status) as any}
                        size="small"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Máquinas associadas */}
                    <h4 className="text-lg font-bold text-[var(--primary-dark)]">Máquinas Operadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const maquinas = machines.filter((maq: any) => selectedEmployee.machineIds.includes(maq.id));
                        if (maquinas.length === 0) return <span className="text-sm text-gray-800 font-medium">Nenhuma máquina associada.</span>;
                        return maquinas.map((maq: any) => (
                          <Chip 
                            key={maq.id} 
                            label={maq.name} 
                            avatar={
                              <Avatar 
                                src={getThumb(maq.photo, 40)} 
                                sx={{ width: 24, height: 24 }} 
                                imgProps={{ loading: 'lazy', decoding: 'async' }}
                              />
                            } 
                          />
                        ));
                      })()}
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - selectedEmployee.performance / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[var(--primary)]">
                            {selectedEmployee.performance}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-800 font-bold">Performance Geral</p>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="p-6 border-t-2 border-gray-200">
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="contained"
                    startIcon={<FaEdit />}
                    size="small"
                    onClick={() => {
                      handleOpenEdit(selectedEmployee);
                      setShowEmployeeModal(false);
                    }}
                    sx={{
                      backgroundColor: 'var(--primary-dark)',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'var(--primary)',
                      },
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FaTrash />}
                    size="small"
                    onClick={handleDeleteEmployee}
                    sx={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontWeight: 'bold',
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

        {/* Modal de Formulário */}
        <CUDModal
          open={showFormModal}
          onClose={() => setShowFormModal(false)}
          mode={formMode}
          title={formMode === 'create' ? 'Novo Funcionário' : 'Editar Funcionário'}
          fields={employeeFields}
          initialData={selectedEmployeeForEdit || {}}
          onSubmit={handleSubmitEmployee}
          entityType="employee"
        />
        
    </div>
  );
};

export default Funcionarios;