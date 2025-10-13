import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { FaTasks, FaClipboardList, FaCheckCircle, FaClock, FaEdit, FaPlus, FaUser, FaCog } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';

interface Assignment {
  id: number;
  title: string;
  description: string;
  assignedToName: string;
  machine: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
}

const Atribuicoes: React.FC = () => {
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
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignments] = useState<Assignment[]>([
    {
      id: 1,
      title: "Manutenção Preventiva - Máquina A1",
      description: "Realizar manutenção preventiva completa",
      assignedToName: "João Silva",
      machine: "Máquina A1 - Linha 1",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: "2024-10-20"
    },
    {
      id: 2,
      title: "Inspeção de Qualidade - Linha 2",
      description: "Verificar qualidade dos produtos",
      assignedToName: "Maria Santos",
      machine: "Máquina B2 - Linha 2",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: "2024-10-15"
    }
  ]);

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

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || assignment.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(a => a.status === "PENDING").length;
  const inProgressAssignments = assignments.filter(a => a.status === "IN_PROGRESS").length;
  const completedAssignments = assignments.filter(a => a.status === "COMPLETED").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'URGENT': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluída'
    };
    return map[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const map: Record<string, string> = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta',
      'URGENT': 'Urgente'
    };
    return map[priority] || priority;
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Atribuições</h1>
            <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Gerencie tarefas e atribuições da equipe</p>
          </div>

          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Filtros e Busca</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                placeholder="Buscar atribuições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' } }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Prioridade</InputLabel>
                <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} label="Prioridade"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="LOW">Baixa</MenuItem>
                  <MenuItem value="MEDIUM">Média</MenuItem>
                  <MenuItem value="HIGH">Alta</MenuItem>
                  <MenuItem value="URGENT">Urgente</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="PENDING">Pendente</MenuItem>
                  <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                  <MenuItem value="COMPLETED">Concluída</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<FaPlus />}
                onClick={() => setShowModal(true)}
                sx={{ backgroundColor: 'var(--primary)', color: 'white', textTransform: 'none', py: 2, borderRadius: '12px',
                  '&:hover': { backgroundColor: 'var(--primary-dark)' } }}>
                Nova Atribuição
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {[
              { label: 'Total de Atribuições', value: totalAssignments, icon: FaTasks, color: '#3b82f6' },
              { label: 'Pendentes', value: pendingAssignments, icon: FaClock, color: '#eab308' },
              { label: 'Em Andamento', value: inProgressAssignments, icon: FaClipboardList, color: '#3b82f6' },
              { label: 'Concluídas', value: completedAssignments, icon: FaCheckCircle, color: '#10b981' }
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
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id}
                className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{assignment.title}</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{assignment.description.substring(0, 60)}...</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaUser className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span>{assignment.assignedToName}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaCog className={`text-lg ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                    <span>{assignment.machine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Vencimento:</span>
                    <span className="text-sm font-semibold">{new Date(assignment.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Chip label={getStatusText(assignment.status)} color={getStatusColor(assignment.status) as any} size="small" />
                    <Chip label={getPriorityText(assignment.priority)} size="small"
                      sx={{ backgroundColor: getPriorityColor(assignment.priority), color: 'white' }} />
                  </div>
                </div>
                <Button variant="outlined" startIcon={<FaEdit />} size="small" fullWidth
                  sx={{ color: 'var(--primary)', borderColor: 'var(--primary)', textTransform: 'none', py: 2, borderRadius: '12px',
                    '&:hover': { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } }}>
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal CUD */}
      <CUDModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAssignment(null);
        }}
        mode={modalMode}
        title={modalMode === 'create' ? 'Nova Atribuição' : 'Editar Atribuição'}
        entityType="employee"
        fields={[
          { name: 'title', label: 'Título da Atribuição', type: 'text', required: true },
          { name: 'assignedToName', label: 'Funcionário', type: 'text', required: true, placeholder: 'Nome do funcionário' },
          { name: 'machine', label: 'Máquina', type: 'text', required: true, placeholder: 'Ex: Máquina A1 - Linha 1' },
          { 
            name: 'priority', 
            label: 'Prioridade', 
            type: 'select', 
            required: true,
            options: [
              { value: 'LOW', label: 'Baixa' },
              { value: 'MEDIUM', label: 'Média' },
              { value: 'HIGH', label: 'Alta' },
              { value: 'URGENT', label: 'Urgente' }
            ]
          },
          { name: 'dueDate', label: 'Data de Vencimento', type: 'text', required: true, placeholder: '2024-10-20' },
          { name: 'description', label: 'Descrição', type: 'textarea', required: true },
        ] as FormFieldConfig[]}
        initialData={selectedAssignment || {}}
        onSubmit={(data) => {
          console.log('Dados do formulário:', data);
          setShowModal(false);
          setSelectedAssignment(null);
        }}
      />
    </div>
  );
};

export default Atribuicoes;
