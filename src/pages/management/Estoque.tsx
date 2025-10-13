import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { FaBoxes, FaExclamationTriangle, FaCheckCircle, FaWarehouse, FaEdit, FaPlus, FaIndustry } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastUpdate: string;
}

const Estoque: React.FC = () => {
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
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [items] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Parafusos M8",
      category: "Fixação",
      quantity: 5000,
      minQuantity: 1000,
      unit: "unidades",
      location: "Prateleira A1",
      status: "IN_STOCK",
      lastUpdate: "2024-10-13"
    },
    {
      id: 2,
      name: "Óleo Lubrificante Industrial",
      category: "Lubrificantes",
      quantity: 15,
      minQuantity: 20,
      unit: "litros",
      location: "Armário B3",
      status: "LOW_STOCK",
      lastUpdate: "2024-10-12"
    },
    {
      id: 3,
      name: "Correia Transportadora",
      category: "Peças",
      quantity: 0,
      minQuantity: 2,
      unit: "unidades",
      location: "Depósito C",
      status: "OUT_OF_STOCK",
      lastUpdate: "2024-10-10"
    },
    {
      id: 4,
      name: "Rolamentos SKF 6205",
      category: "Peças",
      quantity: 50,
      minQuantity: 10,
      unit: "unidades",
      location: "Prateleira A3",
      status: "IN_STOCK",
      lastUpdate: "2024-10-13"
    },
    {
      id: 5,
      name: "Graxa Industrial",
      category: "Lubrificantes",
      quantity: 8,
      minQuantity: 15,
      unit: "kg",
      location: "Armário B3",
      status: "LOW_STOCK",
      lastUpdate: "2024-10-11"
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

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = items.length;
  const inStockItems = items.filter(i => i.status === "IN_STOCK").length;
  const lowStockItems = items.filter(i => i.status === "LOW_STOCK").length;
  const outOfStockItems = items.filter(i => i.status === "OUT_OF_STOCK").length;
  const categories = [...new Set(items.map(i => i.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'success';
      case 'LOW_STOCK': return 'warning';
      case 'OUT_OF_STOCK': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'IN_STOCK': 'Em Estoque',
      'LOW_STOCK': 'Estoque Baixo',
      'OUT_OF_STOCK': 'Sem Estoque'
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return <FaCheckCircle />;
      case 'LOW_STOCK': return <FaExclamationTriangle />;
      case 'OUT_OF_STOCK': return <FaExclamationTriangle />;
      default: return <FaBoxes />;
    }
  };

  return (
    <div className="w-screen min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6 min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
          <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Estoque</h1>
            <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Gerencie o inventário de peças e materiais</p>
          </div>

          <div className={`rounded-2xl shadow-sm border p-8 mb-8 hover:shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Filtros e Busca</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' } }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Categoria</InputLabel>
                <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="Categoria"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status"
                  sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="IN_STOCK">Em Estoque</MenuItem>
                  <MenuItem value="LOW_STOCK">Estoque Baixo</MenuItem>
                  <MenuItem value="OUT_OF_STOCK">Sem Estoque</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<FaPlus />}
                onClick={() => setShowModal(true)}
                sx={{ backgroundColor: 'var(--primary)', color: 'white', textTransform: 'none', py: 2, borderRadius: '12px',
                  '&:hover': { backgroundColor: 'var(--primary-dark)' } }}>
                Novo Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {[
              { label: 'Total de Itens', value: totalItems, icon: FaBoxes, color: '#3b82f6' },
              { label: 'Em Estoque', value: inStockItems, icon: FaCheckCircle, color: '#10b981' },
              { label: 'Estoque Baixo', value: lowStockItems, icon: FaExclamationTriangle, color: '#eab308' },
              { label: 'Sem Estoque', value: outOfStockItems, icon: FaWarehouse, color: '#ef4444' }
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
            {filteredItems.map((item) => (
              <div key={item.id}
                className={`rounded-2xl shadow-sm border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{item.name}</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item.category}</p>
                  </div>
                  <Chip label={getStatusText(item.status)} color={getStatusColor(item.status) as any} size="small" icon={getStatusIcon(item.status)} />
                </div>
                <div className="space-y-4 mb-6">
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span>Quantidade:</span>
                    <span className="font-bold text-lg">{item.quantity} {item.unit}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span>Mínimo:</span>
                    <span className="font-semibold">{item.minQuantity} {item.unit}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaIndustry className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Atualizado:</span>
                    <span className="text-sm font-semibold">{new Date(item.lastUpdate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min((item.quantity / item.minQuantity) * 100, 100)}%`,
                        backgroundColor: item.status === 'IN_STOCK' ? '#10b981' : item.status === 'LOW_STOCK' ? '#eab308' : '#ef4444'
                      }}>
                    </div>
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
          setSelectedItem(null);
        }}
        mode={modalMode}
        title={modalMode === 'create' ? 'Novo Item' : 'Editar Item'}
        entityType="machine"
        fields={[
          { name: 'name', label: 'Nome do Item', type: 'text', required: true },
          { 
            name: 'category', 
            label: 'Categoria', 
            type: 'select', 
            required: true,
            options: [
              { value: 'Fixação', label: 'Fixação' },
              { value: 'Lubrificantes', label: 'Lubrificantes' },
              { value: 'Peças', label: 'Peças' },
              { value: 'Ferramentas', label: 'Ferramentas' }
            ]
          },
          { name: 'quantity', label: 'Quantidade', type: 'number', required: true },
          { name: 'minQuantity', label: 'Quantidade Mínima', type: 'number', required: true },
          { name: 'unit', label: 'Unidade', type: 'text', required: true, placeholder: 'Ex: unidades, litros, kg' },
          { name: 'location', label: 'Localização', type: 'text', required: true, placeholder: 'Ex: Prateleira A1' },
        ] as FormFieldConfig[]}
        initialData={selectedItem || {}}
        onSubmit={(data) => {
          console.log('Dados do formulário:', data);
          setShowModal(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};

export default Estoque;
