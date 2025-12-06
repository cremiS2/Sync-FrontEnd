import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "../../components/layout";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Dialog, DialogContent, DialogActions } from '@mui/material';
import { FaBoxes, FaExclamationTriangle, FaCheckCircle, FaWarehouse, FaEdit, FaPlus, FaIndustry, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import CUDModal from '../../components/forms/CUDModal';
import type { FormFieldConfig } from '../../components/forms/CUDModal';
import { listStock, createStock, updateStock, deleteStock } from '../../services/stock';
import type { Stock, StockDTO } from '../../types';
import { useNotification } from '../../components/system/NotificationSystem';
import { SyncLoader } from '../../components/ui';
import { useUserRole, canCreate, canEdit, canDelete } from '../../hooks/useUserRole';
import { getErrorMessage, getFieldErrors, hasFieldErrors } from '../../utils/errorHandler';

const Estoque: React.FC = () => {
  const notification = useNotification();
  const userRole = useUserRole();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [selectedItem, setSelectedItem] = useState<Stock | null>(null);
  const [items, setItems] = useState<Stock[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Stock | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Carregar dados da API
  useEffect(() => {
    loadStockItems();
  }, []);

  const loadStockItems = async () => {
    try {
      setLoading(true);
      const { data: stockPage } = await listStock({ pageNumber: 0, pageSize: 100 });
      setItems(stockPage.content || []);
    } catch (err) {
      console.error('Erro ao carregar itens de estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitItem = async (data: Record<string, any>) => {
    try {
      setFieldErrors({}); // Limpar erros anteriores
      console.log('Dados do formulário:', data);
      
      const dto: StockDTO = {
        codigo: data.codigo,
        nome: data.nome,
        categoria: data.categoria,
        quantidade: parseFloat(data.quantidade) || 0,
        unidade: data.unidade,
        precoUnitario: parseFloat(data.precoUnitario) || 0,
        fornecedor: data.fornecedor,
        dataEntrada: data.dataEntrada,
        dataValidade: data.dataValidade,
        localizacao: data.localizacao,
        status: data.status,
        descricao: data.descricao
      };

      if (modalMode === 'create') {
        await createStock(dto);
        await loadStockItems();
        notification.success('Item adicionado ao estoque com sucesso!', 'Sucesso');
      } else {
        if (selectedItem) {
          await updateStock(selectedItem.id, dto);
          await loadStockItems();
          notification.success('Item do estoque atualizado com sucesso!', 'Sucesso');
        }
      }
      
      setShowModal(false);
      setSelectedItem(null);
      setFieldErrors({});
    } catch (err: any) {
      console.error('Erro ao salvar item:', err);
      
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

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      await deleteStock(id);
      await loadStockItems();
      notification.success('Item removido do estoque com sucesso!', 'Sucesso');
    } catch (err: any) {
      console.error('Erro ao excluir item:', err);
      const errorMessage = getErrorMessage(err);
      notification.error(errorMessage, 'Erro');
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

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.categoria === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = items.length;
  const inStockItems = items.filter(i => i.status === "IN_STOCK").length;
  const lowStockItems = items.filter(i => i.status === "LOW_STOCK").length;
  const outOfStockItems = items.filter(i => i.status === "OUT_OF_STOCK").length;
  const categories = [...new Set(items.map(i => i.categoria))];

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
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Estoque</h1>
            <p className={`text-sm md:text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Gerencie o inventário de peças e materiais</p>
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
              {canCreate(userRole) && (
                <Button 
                  variant="contained" 
                  startIcon={<FaPlus />}
                  onClick={() => {
                    setSelectedItem(null);
                    setModalMode('create');
                    setShowModal(true);
                  }}
                  sx={{ backgroundColor: 'var(--primary)', color: 'white', textTransform: 'none', py: 2, borderRadius: '12px',
                    '&:hover': { backgroundColor: 'var(--primary-dark)' } }}>
                  Novo Item
                </Button>
              )}
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
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{item.nome}</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item.categoria}</p>
                  </div>
                  <Chip label={getStatusText(item.status)} color={getStatusColor(item.status) as any} size="small" icon={getStatusIcon(item.status)} />
                </div>
                <div className="space-y-4 mb-6">
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span>Código:</span>
                    <span className="font-semibold">{item.codigo}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span>Quantidade:</span>
                    <span className="font-bold text-lg">{item.quantidade} {item.unidade}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <span>Fornecedor:</span>
                    <span className="font-semibold">{item.fornecedor}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <FaIndustry className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span>{item.localizacao}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Entrada:</span>
                    <span className="text-sm font-semibold">{new Date(item.dataEntrada).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Preço Unit.:</span>
                    <span className="text-sm font-semibold">R$ {item.precoUnitario.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="contained" startIcon={<FaEye />} size="small" fullWidth
                    onClick={() => {
                      setSelectedItemForDetails(item);
                      setShowDetailsModal(true);
                    }}
                    sx={{ backgroundColor: 'var(--primary)', color: 'white', textTransform: 'none', py: 2, borderRadius: '12px',
                      '&:hover': { backgroundColor: 'var(--primary-dark)' } }}>
                    Visualizar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedItemForDetails && (
        <Dialog
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItemForDetails(null);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '16px'
            }
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaBoxes className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedItemForDetails.nome}</h2>
                  <p className="text-sm text-white/80">{selectedItemForDetails.categoria}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedItemForDetails(null);
                }}
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all duration-200"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <DialogContent className="p-6" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Código</h4>
                  <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{selectedItemForDetails.codigo}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Quantidade</h4>
                  <p className="text-lg font-bold" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>{selectedItemForDetails.quantidade} {selectedItemForDetails.unidade}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Fornecedor</h4>
                  <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{selectedItemForDetails.fornecedor}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Localização</h4>
                  <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{selectedItemForDetails.localizacao}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Status</h4>
                  <Chip label={getStatusText(selectedItemForDetails.status)} color={getStatusColor(selectedItemForDetails.status) as any} size="small" />
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Preço Unitário</h4>
                  <p className="text-lg font-bold text-green-600">R$ {selectedItemForDetails.precoUnitario.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Data de Entrada</h4>
                  <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{new Date(selectedItemForDetails.dataEntrada).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                  <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Data de Validade</h4>
                  <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{new Date(selectedItemForDetails.dataValidade).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
            {selectedItemForDetails.descricao && (
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                <h4 className="font-bold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Descrição</h4>
                <p className="text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>{selectedItemForDetails.descricao}</p>
              </div>
            )}
          </DialogContent>

          <DialogActions className="p-4 gap-2" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>
            <Button
              variant="outlined"
              startIcon={<FaEdit />}
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedItem(selectedItemForDetails);
                setModalMode('edit');
                setShowModal(true);
              }}
              sx={{ color: 'var(--primary)', borderColor: 'var(--primary)', textTransform: 'none', borderRadius: '12px',
                '&:hover': { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
                display: canEdit(userRole) ? 'inline-flex' : 'none' }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              startIcon={<FaTrash />}
              onClick={() => {
                if (selectedItemForDetails) {
                  handleDeleteItem(selectedItemForDetails.id);
                  setShowDetailsModal(false);
                  setSelectedItemForDetails(null);
                }
              }}
              sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', borderRadius: '12px',
                '&:hover': { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' },
                display: canDelete(userRole) ? 'inline-flex' : 'none' }}
            >
              Excluir
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedItemForDetails(null);
              }}
              sx={{ backgroundColor: '#3b82f6', color: 'white', textTransform: 'none', borderRadius: '12px',
                '&:hover': { backgroundColor: '#2563eb' } }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Modal CUD */}
      <CUDModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
          setFieldErrors({});
        }}
        mode={modalMode}
        title={modalMode === 'create' ? 'Novo Item' : 'Editar Item'}
        entityType="machine"
        serverErrors={fieldErrors}
        fields={[
          { name: 'codigo', label: 'Código', type: 'text', required: true },
          { name: 'nome', label: 'Nome do Item', type: 'text', required: true },
          { 
            name: 'categoria', 
            label: 'Categoria', 
            type: 'select', 
            required: true,
            options: [
              { value: 'Fixação', label: 'Fixação' },
              { value: 'Lubrificantes', label: 'Lubrificantes' },
              { value: 'Peças', label: 'Peças' },
              { value: 'Ferramentas', label: 'Ferramentas' },
              { value: 'Outros', label: 'Outros' }
            ]
          },
          { name: 'quantidade', label: 'Quantidade', type: 'number', required: true },
          { name: 'unidade', label: 'Unidade', type: 'text', required: true, placeholder: 'Ex: unidades, litros, kg' },
          { name: 'precoUnitario', label: 'Preço Unitário (R$)', type: 'number', required: true, placeholder: 'Ex: 10.50' },
          { name: 'fornecedor', label: 'Fornecedor', type: 'text', required: true },
          { name: 'dataEntrada', label: 'Data de Entrada', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
          { name: 'dataValidade', label: 'Data de Validade', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
          { name: 'localizacao', label: 'Localização', type: 'text', required: true, placeholder: 'Ex: Prateleira A1' },
          { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            required: true,
            options: [
              { value: 'IN_STOCK', label: 'Em Estoque' },
              { value: 'LOW_STOCK', label: 'Estoque Baixo' },
              { value: 'OUT_OF_STOCK', label: 'Sem Estoque' }
            ]
          },
          { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
        ] as FormFieldConfig[]}
        initialData={selectedItem || {}}
        onSubmit={handleSubmitItem}
      />
    </div>
  );
};

export default Estoque;
