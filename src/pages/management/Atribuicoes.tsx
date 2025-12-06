import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField } from '@mui/material';
import { FaTasks, FaClock, FaPlus, FaUser, FaCog } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import { listAllocations, createAllocation } from '../../services/allocatedEmployeeMachine';
import { listEmployees } from '../../services/employees';
import { listMachines } from '../../services/machines';
import type { AllocatedEmployeeMachine, AllocatedEmployeeMachineDTO, Employee, Machine } from '../../types';
import { useNotification } from '../../components/system/NotificationSystem';
import { SyncLoader } from '../../components/ui';
import { useUserRole, canCreate } from '../../hooks/useUserRole';

const Atribuicoes: React.FC = () => {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAllocation, setSelectedAllocation] = useState<AllocatedEmployeeMachine | null>(null);
  const [allocations, setAllocations] = useState<AllocatedEmployeeMachine[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados da API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allocationsRes, employeesRes, machinesRes] = await Promise.all([
        listAllocations({ pageNumber: 0, pageSize: 100 }),
        listEmployees({ pageNumber: 0, pageSize: 100 }),
        listMachines({ pageNumber: 0, pageSize: 100 })
      ]);
      
      setAllocations(allocationsRes.data.content as AllocatedEmployeeMachine[] || []);
      setEmployees(employeesRes.data.content || []);
      setMachines(machinesRes.data.content || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAllocation = async (data: Record<string, any>) => {
    if (!data.employee || !data.machine) {
      notification.error('Por favor, selecione um funcionário e uma máquina', 'Dados incompletos');
      return;
    }
    
    const employeeId = parseInt(data.employee);
    const machineId = parseInt(data.machine);
    
    if (isNaN(employeeId) || isNaN(machineId) || employeeId <= 0 || machineId <= 0) {
      notification.error('IDs de funcionário ou máquina inválidos', 'Erro de validação');
      return;
    }
    
    const allocationTitle = data.title || 'Atribuição';
    
    const dto: AllocatedEmployeeMachineDTO = {
      employee: employeeId,
      machine: machineId
    };
    
    const selectedEmployee = employees.find(e => e.id === dto.employee);
    const selectedMachine = machines.find(m => m.id === dto.machine);
    
    if (!selectedEmployee) {
      notification.error(`Funcionário com ID ${dto.employee} não encontrado na lista!`, 'Erro de Dados');
      return;
    }
    
    if (!selectedMachine) {
      notification.error(`Máquina com ID ${dto.machine} não encontrada na lista!`, 'Erro de Dados');
      return;
    }
    
    if (selectedEmployee.availability === false) {
      notification.error(
        `O funcionário "${selectedEmployee.name}" já está alocado em outra máquina!\n\nDesaloque-o primeiro antes de criar uma nova atribuição.`,
        'Funcionário Indisponível'
      );
      return;
    }

    try {
      await createAllocation(dto);
      
      await loadAllData();
      setShowModal(false);
      setSelectedAllocation(null);
      notification.success(`${allocationTitle} criada com sucesso!`, 'Sucesso');
    } catch (err: any) {
      const responseData = err?.response?.data;
      let errorMsg = responseData?.menssagem || responseData?.message || responseData?.error || err.message;
      
      if (err?.response?.status === 500) {
        errorMsg = 'Erro no servidor ao criar atribuição. Verifique se seu usuário tem permissões adequadas ou entre em contato com o administrador.';
      }
      
      notification.error(errorMsg, 'Erro ao criar atribuição');
    }
  };


  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const handleStorageChange = () => checkTheme();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredAllocations = allocations.filter((allocation) => {
    const employeeName = allocation.employee?.name || '';
    const machineName = allocation.machine?.name || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machineName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalAllocations = allocations.length;
  const activeEmployees = new Set(allocations.map(a => a.employee?.id)).size;
  const activeMachines = new Set(allocations.map(a => a.machine?.id)).size;
  const recentAllocations = allocations.filter(a => {
    if (!a.allocatedAt) return false;
    const allocDate = new Date(a.allocatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return allocDate >= weekAgo;
  }).length;


  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <main className={`transition-all duration-300 pt-16 ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {loading ? (
          <div className="p-4 md:p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <SyncLoader />
          </div>
        ) : (
        <div className="p-4 md:p-6 min-h-screen animate-fadeInUp" style={{ background: 'var(--bg-gradient)' }}>
          <div className={`rounded-xl md:rounded-2xl shadow-sm border p-4 md:p-8 mb-4 md:mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Atribuições</h1>
            <p className={`text-sm md:text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Gerencie tarefas e atribuições da equipe</p>
          </div>

          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Filtros e Busca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                placeholder="Buscar por funcionário ou máquina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' } }}
              />
              {canCreate(userRole) && (
                <Button 
                  variant="contained" 
                  startIcon={<FaPlus />}
                  onClick={() => {
                    setSelectedAllocation(null);
                    setModalMode('create');
                    setShowModal(true);
                  }}
                  sx={{ backgroundColor: 'var(--primary)', color: 'white', textTransform: 'none', py: 2, borderRadius: '12px',
                    '&:hover': { backgroundColor: 'var(--primary-dark)' } }}>
                  Nova Atribuição
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {[
              { label: 'Total de Atribuições', value: totalAllocations, icon: FaTasks, color: '#3b82f6' },
              { label: 'Funcionários Alocados', value: activeEmployees, icon: FaUser, color: '#10b981' },
              { label: 'Máquinas em Uso', value: activeMachines, icon: FaCog, color: '#8b5cf6' },
              { label: 'Últimos 7 Dias', value: recentAllocations, icon: FaClock, color: '#eab308' }
            ].map((kpi, idx) => (
              <div key={idx} className={`rounded-2xl shadow-sm border-2 p-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                style={{ borderColor: kpi.color }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-3 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{kpi.label}</p>
                    <p className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{kpi.value}</p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center`}
                    style={{ backgroundColor: isDarkMode ? `${kpi.color}30` : `${kpi.color}20` }}>
                    <kpi.icon className="text-2xl" style={{ color: kpi.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAllocations.map((allocation) => (
              <div key={allocation.id}
                className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Atribuição #{allocation.id}</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Funcionário alocado à máquina</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaUser className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className="font-semibold">{allocation.employee?.name || 'N/A'}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaCog className={`text-lg ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                    <span className="font-semibold">{allocation.machine?.name || 'N/A'}</span>
                  </div>
                  {allocation.allocatedBy && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Alocado por:</span>
                      <span className="font-semibold">{allocation.allocatedBy.username || 'Admin'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </main>

      {/* Modal CUD */}
      <CUDModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAllocation(null);
        }}
mode={modalMode}
        title={modalMode === 'create' ? 'Nova Atribuição' : 'Editar Atribuição'}
        entityType="employee"
fields={[
          { 
            name: 'title', 
            label: 'Título da Atribuição', 
            type: 'text', 
            required: false,
            placeholder: 'Ex: Vistoria, Manutenção, Inspeção...'
          },
          { 
            name: 'employee', 
            label: 'Funcionário', 
            type: 'select', 
            required: true,
            options: employees.map(emp => ({ value: emp.id.toString(), label: emp.name }))
          },
          { 
            name: 'machine', 
            label: 'Máquina', 
            type: 'select', 
            required: true,
            options: machines.map(machine => ({ value: machine.id.toString(), label: machine.name }))
          },
        ] as FormFieldConfig[]}
initialData={selectedAllocation ? {
          employee: selectedAllocation.employee?.id?.toString(),
          machine: selectedAllocation.machine?.id?.toString()
        } : {}}
        onSubmit={handleSubmitAllocation}
      />
    </div>
  );
};

export default Atribuicoes;
