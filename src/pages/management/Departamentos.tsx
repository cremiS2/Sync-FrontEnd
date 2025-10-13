import React, { useState, useEffect } from 'react';
import { Header, Sidebar } from '../../components/layout';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import {
  FaUsers, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye,
  FaUserTie, FaUserCog, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt,
  FaBuilding, FaTools, FaIndustry
} from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment, type DepartmentDTO } from '../../services/departments';
import { listSectors, createSector, updateSector, deleteSector, type SectorDTO } from '../../services/sectors';
import { listEmployees } from '../../services/employees';
import type { Department, Sector, Employee } from '../../types';



const Departamentos: React.FC = () => {
  console.log('Departamentos component is rendering');
  
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



  // Carregar funcionários e calcular contagem por departamento
  const loadEmployeesAndCalculateCounts = async () => {
    try {
      const { data: empPage } = await listEmployees({ pageNumber: 0, pageSize: 1000 });
      const allEmployees = empPage.content || [];
      
      // Calcular contagem de funcionários por departamento (contando através dos setores)
      const counts: Record<number, number> = {};
      allEmployees.forEach((emp: Employee) => {
        const deptId = emp.sector?.department?.id;
        const deptName = emp.sector?.department?.name;
        const sectorName = emp.sector?.name;
        
        if (deptId) {
          counts[deptId] = (counts[deptId] || 0) + 1;
          console.log(`Funcionário "${emp.name}" - Setor: "${sectorName}" -> Departamento: "${deptName}" (ID: ${deptId})`);
        } else {
          console.warn(`Funcionário "${emp.name}" sem departamento vinculado ao setor`);
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
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const { data: deptPage } = await listDepartments({ pageNumber: 0, pageSize: 100 });
      setDepartments(deptPage.content || []);
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
      } else {
        console.log('Editando departamento:', selectedDepartmentForEdit?.name);
        const dto: Partial<DepartmentDTO> = {};
        if (data.name) dto.name = data.name;
        if (data.description) dto.description = data.description;
        if (data.location) dto.location = data.location;
        if (data.budget) dto.budget = parseFloat(data.budget);
        if (data.status) dto.status = data.status;
        
        await updateDepartment(selectedDepartmentForEdit.id, dto);
      }
      
      setShowFormModal(false);
      await loadDepartments(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmitSector = async (data: Record<string, any>) => {
    try {
      setLoading(true);
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
        } else {
          console.log('=== EDITANDO SETOR ===');
          console.log('ID do setor:', selectedSector?.id);
          console.log('DTO que será enviado:', dto);
          await updateSector(selectedSector!.id, dto);
        }
        
        setShowSectorModal(false);
        setSelectedSector(null);
        
        // Recarregar setores
        await loadSectorsForDepartment(selectedDepartment.id);
      }
    } catch (error) {
      console.error(`Erro ao ${sectorFormMode === 'create' ? 'criar' : 'editar'} setor:`, error);
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
      } catch (error) {
        console.error('Erro ao deletar setor:', error);
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

  const activeDepartments = departments.filter(dept => dept.status === 'active').length;
  const maintenanceDepartments = departments.filter(dept => dept.status === 'maintenance').length;
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
        { value: 'INACTIVE', label: 'Inativo' },
        { value: 'MAINTENANCE', label: 'Manutenção' }
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
          await loadDepartments();
          
          console.log('Departamento deletado com sucesso!');
        } catch (error) {
          console.error('Erro ao deletar departamento:', error);
          alert('Erro ao excluir departamento. Tente novamente.');
        } finally {
          setLoading(false);
        }
      }
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
                  <MenuItem value="active">Ativos</MenuItem>
                  <MenuItem value="inactive">Inativos</MenuItem>
                  <MenuItem value="maintenance">Em Manutenção</MenuItem>
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
                  }`}>Em Manutenção</p>
                  <p className={`text-4xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{maintenanceDepartments}</p>
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <span>1 departamento</span>
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

          {/* Grid de Departamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDepartments.map((department) => (
              <div key={department.id} className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="flex items-start justify-between mb-6">
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
                  <Chip 
                    label={department.status === 'active' ? 'Ativo' : department.status === 'maintenance' ? 'Manutenção' : 'Inativo'}
                    color={department.status === 'active' ? 'success' : department.status === 'maintenance' ? 'warning' : 'error' as any}
                    size="small"
                  />
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
            ))}
          </div>
        </div>
      </main>

      <Dialog
          open={!!selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedDepartment && (
            <>
              <DialogTitle className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
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
              </DialogTitle>

              <DialogContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUserTie className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">Gerente</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">João Silva</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">Localização</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{selectedDepartment.location}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUsers className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">Funcionários</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{departmentEmployeeCounts[selectedDepartment.id] || 0} colaboradores</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaDollarSign className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">Orçamento</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">R$ {selectedDepartment.budget.toLocaleString()}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">Criado em</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{new Date(selectedDepartment.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div>
                    <div className="p-4 bg-[var(--accent)] rounded-lg mb-4">
                      <h4 className="font-semibold text-[var(--text)] mb-2">Descrição</h4>
                      <p className="text-sm text-[var(--text)]">{selectedDepartment.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[var(--primary)]">Setores</h4>
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
                      </div>
                      <div className="space-y-3">
                        {sectors.length > 0 ? (
                          sectors.map((sector) => (
                            <div key={sector.id} className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-[var(--text)]">{sector.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Chip label="Ativo" color="success" size="small" />
                                  <div className="flex gap-1">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      onClick={() => handleEditSector(sector)}
                                      sx={{ minWidth: 'auto', p: 0.5 }}
                                    >
                                      <FaEdit size={12} />
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleDeleteSector(sector)}
                                      sx={{ minWidth: 'auto', p: 0.5 }}
                                    >
                                      <FaTrash size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <FaUserCog className="text-[var(--primary)] text-xs" />
                                    <span className="text-xs text-[var(--muted)]">Funcionários</span>
                                  </div>
                                  <p className="text-sm font-semibold text-[var(--text)]">{Array.isArray(sector.employees) ? sector.employees.length : (sector.employees || 0)}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <FaChartLine className="text-[var(--primary)] text-xs" />
                                    <span className="text-xs text-[var(--muted)]">Eficiência</span>
                                  </div>
                                  <p className="text-sm font-semibold text-[var(--text)]">{sector.efficiency || 0}%</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <FaIndustry className="text-[var(--primary)] text-xs" />
                                    <span className="text-xs text-[var(--muted)]">Máx. Funcionários</span>
                                  </div>
                                  <p className="text-sm font-semibold text-[var(--text)]">{sector.maxEmployees || sector.maximumQuantEmployee || 0}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FaBuilding className="text-4xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-2">Nenhum setor encontrado</p>
                            <p className="text-sm text-gray-400">Clique em "Novo Setor" para adicionar o primeiro setor</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="p-6">
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
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
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
          title={formMode === 'create' ? 'Novo Departamento' : 'Editar Departamento'}
          fields={departmentFields}
          initialData={selectedDepartmentForEdit || {}}
          onSubmit={handleSubmitDepartment}
          loading={loading}
          entityType="department"
        />

        <CUDModal
          open={showSectorModal}
          onClose={() => {
            setShowSectorModal(false);
            setSelectedSector(null);
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
        />
    </div>
  );
};

export default Departamentos;
