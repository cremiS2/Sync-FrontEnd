import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Paper } from '@mui/material';
import { FaTimes, FaSave, FaUser, FaCog, FaBuilding, FaBoxes } from 'react-icons/fa';
import FormField from './FormField';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'url' | 'multiselect' | 'custom' | 'date' | 'unit' | 'currency';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  defaultValue?: any;
  component?: (props: { value: any; onChange: (value: any) => void; error?: string }) => React.ReactNode;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
  rows?: number;
}

export interface CUDModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'add';
  title: string;
  fields: FormFieldConfig[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  entityType?: 'employee' | 'machine' | 'department' | 'stock';
  serverErrors?: Record<string, string>;
}

const CUDModal: React.FC<CUDModalProps> = ({
  open,
  onClose,
  mode,
  title,
  fields,
  initialData = {},
  onSubmit,
  loading = false,
  maxWidth = 'sm',
  entityType = 'employee',
  serverErrors = {}
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      const initialFormData: Record<string, any> = {};
      fields.forEach(field => {
        initialFormData[field.name] = initialData[field.name] ?? field.defaultValue ?? '';
      });
      setFormData(initialFormData);
      setErrors({});
    }
  }, [open, initialData, fields]);

  // Update errors when serverErrors change
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      // Validação de campo obrigatório
      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.label} é obrigatório`;
        return;
      }
      
      // Validação de email
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Email inválido';
        }
      }
      
      // Validação de número
      if (field.type === 'number' && value !== '' && value !== null) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.name] = 'Valor deve ser numérico';
        } else {
          if (field.minValue !== undefined && numValue < field.minValue) {
            newErrors[field.name] = `Valor mínimo é ${field.minValue}`;
          }
          if (field.maxValue !== undefined && numValue > field.maxValue) {
            newErrors[field.name] = `Valor máximo é ${field.maxValue}`;
          }
        }
      }
      
      // Validação de tamanho máximo de texto
      if ((field.type === 'text' || field.type === 'textarea') && value && field.maxLength) {
        if (String(value).length > field.maxLength) {
          newErrors[field.name] = `Máximo de ${field.maxLength} caracteres`;
        }
      }
      
      // Validação de data
      if (field.type === 'date' && value) {
        const dateValue = value;
        
        // Validar formato da data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          newErrors[field.name] = 'Formato de data inválido (use AAAA-MM-DD)';
          return;
        }
        
        // Validar data mínima
        if (field.minDate && dateValue < field.minDate) {
          newErrors[field.name] = `Data não pode ser anterior a ${formatDateBR(field.minDate)}`;
        }
        
        // Validar data máxima
        if (field.maxDate && dateValue > field.maxDate) {
          newErrors[field.name] = `Data não pode ser posterior a ${formatDateBR(field.maxDate)}`;
        }
      }

      // Validação de URL
      if (field.type === 'url' && value) {
        try {
          new URL(value);
        } catch {
          newErrors[field.name] = 'URL inválida';
        }
      }
    });

    // Validações cruzadas de datas (ex: dataEntrada vs dataValidade)
    const dataEntrada = formData['dataEntrada'];
    const dataValidade = formData['dataValidade'];
    
    if (dataEntrada && dataValidade && dataValidade < dataEntrada) {
      newErrors['dataValidade'] = 'Data de validade não pode ser anterior à data de entrada';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateBR = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'employee':
        return <FaUser className="text-2xl" />;
      case 'machine':
        return <FaCog className="text-2xl" />;
      case 'department':
        return <FaBuilding className="text-2xl" />;
      case 'stock':
        return <FaBoxes className="text-2xl" />;
      default:
        return <FaUser className="text-2xl" />;
    }
  };

  const getSubmitLabel = () => {
    switch (mode) {
      case 'create':
      case 'add':
        return 'Criar';
      case 'edit':
        return 'Salvar';
      default:
        return 'Salvar';
    }
  };

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case 'employee':
        return 'Funcionário';
      case 'machine':
        return 'Máquina';
      case 'department':
        return 'Departamento';
      case 'stock':
        return 'Item de Estoque';
      default:
        return 'Item';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, md: '16px' },
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          margin: { xs: 0, sm: '32px' }
        }
      }}
    >
      {/* Header com gradiente e ícone */}
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white">
                {getEntityIcon()}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1 hidden sm:block">
                  {mode === 'create' || mode === 'add' 
                    ? `Adicionar novo ${getEntityTypeLabel().toLowerCase()}`
                    : `Editar ${getEntityTypeLabel().toLowerCase()} existente`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <DialogContent className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-6 md:pt-8 dark:bg-gray-800" sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Paper elevation={0} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.name} className="relative">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {field.label}
                    {field.required && field.type !== 'select' && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                <FormField
                  type={field.type}
                  label=""
                  value={formData[field.name] ?? ''}
                  onChange={(value) => handleInputChange(field.name, value)}
                  required={field.required}
                  options={field.options}
                  placeholder={field.placeholder}
                  error={errors[field.name]}
                  component={field.component}
                  maxLength={field.maxLength}
                  minValue={field.minValue}
                  maxValue={field.maxValue}
                  minDate={field.minDate}
                  maxDate={field.maxDate}
                  rows={field.rows}
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </Paper>
      </DialogContent>

      {/* Ações */}
      <DialogActions className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FaTimes />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSave />
            )}
            <span>{getSubmitLabel()}</span>
          </button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default CUDModal;