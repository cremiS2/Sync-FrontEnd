import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import {
  FaUsers, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye,
  FaUserTie, FaUserCog, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt,
  FaBuilding, FaTools, FaIndustry, FaTimes
} from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment, type DepartmentDTO } from '../../services/departments';
import { listSectors, getSector, createSector, updateSector, deleteSector, type SectorDTO } from '../../services/sectors';
import { listEmployees } from '../../services/employees';
import type { Department, Sector, Employee } from '../../types';
import { useNotification } from '../../components/system/NotificationSystem';
import { useUserRole, canCreate, canEdit, canDelete } from '../../hooks/useUserRole';
import { dataCache, CACHE_KEYS } from '../../utils/dataCache';
import ResponsiveGrid from '../../components/common/VirtualizedGrid';
import { SyncLoader } from '../../components/ui';
import { getErrorMessage, getFieldErrors, hasFieldErrors } from '../../utils/errorHandler';


const Departamentos: React.FC = () => {
  console.log('Departamentos component is rendering');
  
  const notification = useNotification();
  const userRole = useUserRole();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartmentForEdit, setSelectedDepartmentForEdit] = useState<any | null>(null);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [sectorFormMode, setSectorFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [departmentEmployeeCounts, setDepartmentEmployeeCounts] = useState<Record<number, number>>({});
  const [departmentFieldErrors, setDepartmentFieldErrors] = useState<Record<string, string>>({});
  const [sectorFieldErrors, setSectorFieldErrors] = useState<Record<string, string>>({});



  // Carregar funcionários e calcular contagem por departamento
  const loadEmployeesAndCalculateCounts = async () => {
    try {
      const { data: empPage } = await listEmployees({ pageNumber: 0, pageSize: 1000 });
      const allEmployees = empPage.content || [];
      
      console.log('=== PROBLEMA IDENTIFICADO ===');
      console.log('O backend NÃO retorna o campo "department" dentro do setor quando busca funcionários.');
      console.log('Solução: Buscar cada setor individualmente para pegar o departmentId');
      
      // Coletar IDs únicos de setores
      const sectorIds = [...new Set(allEmployees.map(emp => emp.sector?.id).filter(Boolean))];
      console.log('Setores únicos encontrados:', sectorIds);
      
      // Buscar cada setor individualmente para pegar o departmentId
      const sectorToDepartmentMap: Record<number, number> = {};
      
      for (const sectorId of sectorIds) {
        try {
          const { data: sector } = await getSector(sectorId);
          // O department pode vir como objeto {id, name} ou como número direto
          let deptId: number | null = null;
          if (typeof sector.department === 'number') {
            deptId = sector.department;
          } else if (sector.department?.id) {
            deptId = sector.department.id;
          }
          
          if (deptId) {
            sectorToDepartmentMap[sectorId] = deptId;
            console.log(`✅ Setor ID ${sectorId} ("${sector.name}") -> Departamento ID: ${deptId}`);
          } else {
            console.warn(`❌ Setor ID ${sectorId} sem departamento`);
          }
        } catch (err) {
          console.error(`Erro ao buscar setor ${sectorId}:`, err);
        }
      }
      
      console.log('=== MAPA SETOR -> DEPARTAMENTO ===');
      console.log(sectorToDepartmentMap);
      
      // Calcular contagem de funcionários por departamento
      const counts: Record<number, number> = {};
      allEmployees.forEach((emp: Employee) => {
        const sectorId = emp.sector?.id;
        const sectorName = emp.sector?.name;
        
        if (sectorId && sectorToDepartmentMap[sectorId]) {
          const deptId = sectorToDepartmentMap[sectorId];
          counts[deptId] = (counts[deptId] || 0) + 1;
          console.log(`✅ Funcionário "${emp.name}" - Setor: "${sectorName}" -> Departamento ID: ${deptId}`);
        } else {
          console.warn(`❌ Funcionário "${emp.name}" - Setor ID ${sectorId} não mapeado`);
        }
      });
      
      console.log('=== CONTAGEM FINAL DE FUNCIONÁRIOS POR DEPARTAMENTO ===');
      console.log(counts);
      setDepartmentEmployeeCounts(counts);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  // Carregar departamentos
  const loadDepartments = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      // Cache por 3 minutos
      if (!forceRefresh) {
        const cached = dataCache.get<Department[]>(CACHE_KEYS.DEPARTMENTS, 3 * 60 * 1000);
        if (cached) {
          setDepartments(cached);
          // Ainda assim calculamos contagens com cache de funcionários
          await loadEmployeesAndCalculateCounts();
          return;
        }
      }
      const response = await listDepartments({ pageSize: 1000, pageNumber: 0 });
      const depts = response.data.content || [];
      
      // LOG: Ver todos os status possíveis que o backend retorna
      console.log('=== STATUS DOS DEPARTAMENTOS ===');
      depts.forEach((dept: any) => {
        console.log(`Departamento: ${dept.name} | Status: "${dept.status}"`);
      });
      console.log('================================');
      
      dataCache.set(CACHE_KEYS.DEPARTMENTS, depts);
      setDepartments(depts);
      // Carregar funcionários para calcular contagens
      await loadEmployeesAndCalculateCounts();
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmitDepartment = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      setDepartmentFieldErrors({}); // Limpar erros anteriores
      console.log('Dados do departamento:', data);
      
      if (formMode === 'create') {
        console.log('Criando novo departamento');
        const dto: DepartmentDTO = {
          name: data.name,
          description: data.description,
          location: data.location,
          budget: parseFloat(data.budget) || 0,
          status: data.status
        };
        await createDepartment(dto);
        notification.success('Departamento criado com sucesso!', 'Sucesso');
      } else {
        console.log('Editando departamento:', selectedDepartmentForEdit?.name);
        console.log('Dados recebidos do formulário:', data);
        
        // Enviar TODOS os campos, não apenas os alterados
        const dto: DepartmentDTO = {
          name: data.name || selectedDepartmentForEdit.name,
          description: data.description || selectedDepartmentForEdit.description,
          location: data.location || selectedDepartmentForEdit.location,
          budget: parseFloat(data.budget) || selectedDepartmentForEdit.budget,
          status: data.status || selectedDepartmentForEdit.status
        };
        
        console.log('DTO que será enviado:', dto);
        console.log('ID do departamento:', selectedDepartmentForEdit.id);
        
        await updateDepartment(selectedDepartmentForEdit.id, dto);
        notification.success('Departamento atualizado com sucesso!', 'Sucesso');
      }
      
      setShowFormModal(false);
      setDepartmentFieldErrors({});
      // Invalidar cache e recarregar
      dataCache.invalidate(CACHE_KEYS.DEPARTMENTS);
      await loadDepartments(true); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao salvar departamento:', error);
      console.error('Detalhes do erro:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      // Extrair erros de campos se houver
      if (hasFieldErrors(error)) {
        const fieldErrors = getFieldErrors(error);
        setDepartmentFieldErrors(fieldErrors);
        console.log('Erros de campos:', fieldErrors);
      }
      
      // Mostrar mensagem de erro
      const errorMessage = getErrorMessage(error);
      notification.error(errorMessage, 'Erro');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmitSector = async (data: Record<string, any>) => {
    try {
      setLoading(true);
      setSectorFieldErrors({}); // Limpar erros anteriores
      console.log('Dados do setor:', data);
      
      if (selectedDepartment) {
        // Formato correto baseado no Postman
        const dto: SectorDTO = {
          name: data.name,
          department: selectedDepartment.id,
          maximumQuantEmployee: parseInt(data.maximumQuantEmployee) || 10,
          efficiency: parseFloat(data.efficiency) || 85.0,
          description: data.description || `Setor ${data.name}`
        };
        
        if (sectorFormMode === 'create') {
          console.log('=== CRIANDO SETOR ===');
          console.log('DTO que será enviado:', dto);
          await createSector(dto);
          notification.success('Setor criado com sucesso!', 'Sucesso');
        } else {
          console.log('=== EDITANDO SETOR ===');
          console.log('ID do setor:', selectedSector?.id);
          console.log('DTO que será enviado:', dto);
          await updateSector(selectedSector!.id, dto);
          notification.success('Setor atualizado com sucesso!', 'Sucesso');
        }
        
        setShowSectorModal(false);
        setSelectedSector(null);
        setSectorFieldErrors({});
        
        // Recarregar setores
        await loadSectorsForDepartment(selectedDepartment.id);
      }
    } catch (error: any) {
      console.error(`Erro ao ${sectorFormMode === 'create' ? 'criar' : 'editar'} setor:`, error);
      
      // Extrair erros de campos se houver
      if (hasFieldErrors(error)) {
        const fieldErrors = getFieldErrors(error);
        setSectorFieldErrors(fieldErrors);
        console.log('Erros de campos:', fieldErrors);
      }
      
      // Mostrar mensagem de erro
      const errorMessage = getErrorMessage(error);
      notification.error(errorMessage, 'Erro');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSector = (sector: Sector) => {
    setSelectedSector(sector);
    setSectorFormMode('edit');
    setShowSectorModal(true);
  };

  const handleDeleteSector = async (sector: Sector) => {
    if (window.confirm(`Tem certeza que deseja excluir o setor "${sector.name}"?`)) {
      try {
        setLoading(true);
        console.log('=== DELETANDO SETOR ===');
        console.log('ID do setor:', sector.id);
        
        await deleteSector(sector.id);
        
        // Recarregar setores
        if (selectedDepartment) {
          await loadSectorsForDepartment(selectedDepartment.id);
        }
        
        // Recarregar departamentos para atualizar o orçamento total
        await loadDepartments(true);
        
        notification.success('Setor removido com sucesso!', 'Sucesso');
      } catch (error: any) {
        console.error('Erro ao deletar setor:', error);
        notification.error(
          error?.response?.data?.menssagem || error.message || 'Erro ao deletar setor',
          'Erro'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateSector = () => {
    setSelectedSector(null);
    setSectorFormMode('create');
    setShowSectorModal(true);
  };

  // Carregar setores de um departamento
  const loadSectorsForDepartment = async (departmentId: number) => {
    try {
      console.log('=== CARREGANDO SETORES ===');
      console.log('Department ID:', departmentId);
      
      // Tentar sem filtros primeiro para ver se o GET funciona
      const { data: sectorPage } = await listSectors();
      console.log('Resposta da API:', sectorPage);
      console.log('Setores encontrados:', sectorPage.content?.length || 0);
      
      // Filtrar setores do departamento
      const departmentSectors = sectorPage.content?.filter(s => {
        console.log('=== SETOR INDIVIDUAL ===');
        console.log('Nome:', s.name);
        console.log('ID:', s.id);
        console.log('Employees (tipo):', typeof s.employees, s.employees);
        console.log('Department:', s.department);
        console.log('Efficiency:', s.efficiency);
        console.log('MaxEmployees:', s.maxEmployees);
        console.log('MaximumQuantEmployee:', s.maximumQuantEmployee);
        return s.department?.id === departmentId;
      }) || [];
      
      console.log('Setores filtrados para o departamento:', departmentSectors.length);
      setSectors(departmentSectors);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
      setSectors([]);
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

  
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dept.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dept.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeDepartments = departments.filter(dept => 
    dept.status?.toUpperCase() === 'ACTIVE'
  ).length;
  const inactiveDepartments = departments.filter(dept => 
    dept.status?.toUpperCase() === 'INACTIVE'
  ).length;
  // Calcular total de funcionários usando a contagem real
  const totalEmployees = Object.values(departmentEmployeeCounts).reduce((sum, count) => sum + count, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);



  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedDepartmentForEdit(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (department: Department) => {
    setFormMode('edit');
    const departmentData = {
      id: department.id,
      name: department.name || '',
      description: department.description || '',
      location: department.location || '',
      budget: department.budget?.toString() || '0',
      status: department.status || 'ACTIVE'
    };
    setSelectedDepartmentForEdit(departmentData);
    setShowFormModal(true);
  };

  const getDepartmentIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rh') || lowerName.includes('recursos')) return <FaUserTie />;
    if (lowerName.includes('ti') || lowerName.includes('tecnologia')) return <FaTools />;
    if (lowerName.includes('produção') || lowerName.includes('fabrica')) return <FaIndustry />;
    if (lowerName.includes('financ') || lowerName.includes('contab')) return <FaDollarSign />;
    return <FaBuilding />;
  };

  // Campos do formulário de departamento
  const departmentFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Nome do Departamento',
      type: 'text',
      required: true,
      placeholder: 'Ex.: Recursos Humanos'
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      placeholder: 'Descreva as responsabilidades do departamento'
    },
    {
      name: 'location',
      label: 'Localização',
      type: 'text',
      required: true,
      placeholder: 'Ex.: Prédio A - 2° Andar'
    },
    {
      name: 'budget',
      label: 'Orçamento (R$)',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 50000'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Ativo' },
        { value: 'INACTIVE', label: 'Inativo' }
      ]
    }
  ];

  // Campos do formulário de setor
  const sectorFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Nome do Setor',
      type: 'text',
      required: true,
      placeholder: 'Ex.: Produção'
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      placeholder: 'Descreva as responsabilidades do setor'
    },
    {
      name: 'maximumQuantEmployee',
      label: 'Máximo de Funcionários',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 20',
      defaultValue: '10'
    },
    {
      name: 'efficiency',
      label: 'Eficiência (%)',
      type: 'number',
      required: true,
      placeholder: 'Ex.: 85.0',
      defaultValue: '85'
    }
  ];

  const handleDeleteDepartment = async () => {
    if (selectedDepartment) {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir o departamento "${selectedDepartment.name}"?\n\n` +
        `Esta ação irá remover permanentemente:\n` +
        `• O departamento e todos os seus dados\n` +
        `• Todos os setores vinculados\n` +
        `• Todas as informações relacionadas\n\n` +
        `Esta ação não pode ser desfeita!`
      );
      
      if (confirmed) {
        try {
          setLoading(true);
          console.log('=== DELETANDO DEPARTAMENTO ===');
          console.log('Nome:', selectedDepartment.name);
          console.log('ID:', selectedDepartment.id);
          
          await deleteDepartment(selectedDepartment.id);
          setSelectedDepartment(null);
          // Invalidar cache e recarregar
          dataCache.invalidate(CACHE_KEYS.DEPARTMENTS);
          await loadDepartments(true);
          
          console.log('Departamento deletado com sucesso!');
          notification.success('Departamento removido com sucesso!', 'Sucesso');
        } catch (error: any) {
          console.error('Erro ao deletar departamento:', error);
          notification.error(
            error?.response?.data?.menssagem || error.message || 'Erro ao excluir departamento',
            'Erro'
          );
        } finally {
          setLoading(false);
        }
      }
    }
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
      <main className={`transition-all duration-300 pt-16 ml-0 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        {loading ? (
          <div className="p-4 md:p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-4 md:p-6 min-h-screen animate-fadeInUp" style={{ background: 'var(--bg-gradient)' }}>
          {/* Monday.com Style Header */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Departamentos</h1>
                <p className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Gestão e monitoramento dos departamentos da empresa</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Filtros e Controles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                placeholder="Buscar departamentos..."
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
                  <MenuItem value="ACTIVE">Ativos</MenuItem>
                  <MenuItem value="INACTIVE">Inativos</MenuItem>
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
                  display: canCreate(userRole) ? 'inline-flex' : 'none'
                }}
              >
                Novo Departamento
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
                  }`}>Total de Departamentos</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{departments.length}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>{activeDepartments} ativos</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  <FaBuilding className={`text-2xl ${
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
                  }`}>Total de Funcionários</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{totalEmployees}</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+12 este mês</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                  <FaUsers className={`text-2xl ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#f59e0b' : '#f59e0b'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Orçamento Total</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>R$ {(totalBudget / 1000).toFixed(0)}k</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span>+5.2% vs mês anterior</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}>
                  <FaDollarSign className={`text-2xl ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`} style={{
              borderColor: isDarkMode ? '#ef4444' : '#ef4444'
            }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Inativos</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{inactiveDepartments}</p>
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <span>{inactiveDepartments} {inactiveDepartments === 1 ? 'departamento' : 'departamentos'}</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? "bg-red-900/30" : "bg-red-100"
                }`}>
                  <FaTools className={`text-2xl ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Departamentos com Virtualização */}
          <ResponsiveGrid
            items={filteredDepartments}
            enableVirtualization={filteredDepartments.length > 20}
            renderItem={(department) => (
              <div className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 h-full ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="mb-6">
                  <div className="flex justify-end mb-2">
                    <Chip 
                      label={department.status?.toUpperCase() === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      color={department.status?.toUpperCase() === 'ACTIVE' ? 'success' : 'error' as any}
                      size="small"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                    }`}>
                      <div className={`text-2xl ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}>
                        {getDepartmentIcon(department.name)}
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>{department.name}</h3>
                      <p className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>{department.location}</p>
                    </div>
                  </div>
                </div>

                <p className={`text-sm mb-6 line-clamp-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  {department.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`text-center p-4 rounded-2xl ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}>
                    <p className={`text-2xl font-bold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>{departmentEmployeeCounts[department.id] || 0}</p>
                    <p className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Funcionários</p>
                  </div>
                  <div className={`text-center p-4 rounded-2xl ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}>
                    <p className={`text-2xl font-bold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>{department.sectors.length}</p>
                    <p className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Setores</p>
                  </div>
                </div>

                <Button
                  variant="outlined"
                  startIcon={<FaEye />}
                  onClick={async () => {
                    setSelectedDepartment(department);
                    await loadSectorsForDepartment(department.id);
                  }}
                  sx={{
                    color: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    py: 1,
                    px: 2,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                    },
                  }}
                >
                  Visualizar
                </Button>
              </div>
            )}
          />
        </div>
        )}
      </main>

      <Dialog
          open={!!selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          keepMounted
          maxWidth="md"
          fullWidth
        >
          {selectedDepartment && (
            <>
              <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="text-white text-lg">
                        {getDepartmentIcon(selectedDepartment.name)}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedDepartment.name}</h2>
                      <p className="text-sm opacity-90">{selectedDepartment.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDepartment(null)}
                    aria-label="Fechar"
                    className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-all duration-200 font-bold text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </DialogTitle>

              <DialogContent className="p-8" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-5">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaUserTie className={isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gerente</span>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>João Silva</p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt className={isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Localização</span>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDepartment.location}</p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaUsers className={isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Funcionários</span>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{departmentEmployeeCounts[selectedDepartment.id] || 0} colaboradores</p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaDollarSign className={isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Orçamento</span>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>R$ {selectedDepartment.budget.toLocaleString()}</p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className={isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'} />
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Criado em</span>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{new Date(selectedDepartment.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div>
                    <div className={`p-4 rounded-lg border mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <h4 className={`font-bold mb-2 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Descrição</h4>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDepartment.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-bold text-lg ${isDarkMode ? 'text-blue-400' : 'text-[var(--primary-dark)]'}`}>Setores</h4>
                        {canCreate(userRole) && (
                          <Button
                            variant="contained"
                            startIcon={<FaPlus />}
                            onClick={handleCreateSector}
                            sx={{
                              bgcolor: 'var(--primary)',
                              '&:hover': { bgcolor: 'var(--primary-dark)' },
                              textTransform: 'none'
                            }}
                          >
                            Novo Setor
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {sectors.length > 0 ? (
                          sectors.map((sector) => (
                            <div key={sector.id} className={`p-4 rounded-lg border hover:shadow-md transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h5 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sector.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Chip label="Ativo" color="success" size="small" />
                                  <div className="flex gap-1">
                                    {canEdit(userRole) && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEditSector(sector)}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                      >
                                        <FaEdit size={12} />
                                      </Button>
                                    )}
                                    {canDelete(userRole) && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteSector(sector)}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                      >
                                        <FaTrash size={12} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-center gap-1 mb-2">
                                    <FaUserCog className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Funcionários</span>
                                  </div>
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(sector.employees) ? sector.employees.length : (sector.employees || 0)}</p>
                                </div>
                                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-center gap-1 mb-2">
                                    <FaChartLine className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Eficiência</span>
                                  </div>
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sector.efficiency || 0}%</p>
                                </div>
                                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-center gap-1 mb-2">
                                    <FaIndustry className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Máx. Funcionários</span>
                                  </div>
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sector.maxEmployees || sector.maximumQuantEmployee || 0}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FaBuilding className={`text-4xl mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                            <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nenhum setor encontrado</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Clique em "Novo Setor" para adicionar o primeiro setor</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="p-6 border-t-2" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="contained"
                    startIcon={<FaEdit />}
                    size="small"
                    onClick={() => {
                      handleOpenEdit(selectedDepartment);
                      setSelectedDepartment(null);
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
                    onClick={handleDeleteDepartment}
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

        <CUDModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setDepartmentFieldErrors({});
          }}
          mode={formMode}
          title={formMode === 'create' ? 'Novo Departamento' : 'Editar Departamento'}
          fields={departmentFields}
          initialData={selectedDepartmentForEdit || {}}
          onSubmit={handleSubmitDepartment}
          loading={loading}
          entityType="department"
          serverErrors={departmentFieldErrors}
        />

        <CUDModal
          open={showSectorModal}
          onClose={() => {
            setShowSectorModal(false);
            setSelectedSector(null);
            setSectorFieldErrors({});
          }}
          mode={sectorFormMode}
          title={sectorFormMode === 'create' ? 'Novo Setor' : 'Editar Setor'}
          fields={sectorFields}
          initialData={selectedSector ? {
            name: selectedSector.name,
            description: selectedSector.description || '',
            maximumQuantEmployee: selectedSector.maximumQuantEmployee || selectedSector.maxEmployees || 10,
            efficiency: selectedSector.efficiency || 85
          } : {}}
          onSubmit={handleSubmitSector}
          entityType="department"
          serverErrors={sectorFieldErrors}
        />
    </div>
  );
};

export default Departamentos;
