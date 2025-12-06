import React, { useState, useEffect } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FaSearch, FaPlus, FaFilter } from 'react-icons/fa';

interface MaintenanceFiltersProps {
  searchTerm: string;
  filterStatus: string;
  filterType: string;
  filterPriority: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onCreateNew: () => void;
}

const MaintenanceFilters: React.FC<MaintenanceFiltersProps> = ({
  searchTerm,
  filterStatus,
  filterType,
  filterPriority,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
  onCreateNew
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#f1f5f9' : '#1e3a5f',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#3b82f6',
      },
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? '#f1f5f9' : '#1e3a5f',
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? '#94a3b8' : '#475569',
    },
  };

  return (
    <div 
      className="mb-6 rounded-xl shadow-lg p-6"
      style={{ 
        backgroundColor: isDarkMode ? '#1e3a5f' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-blue-500 text-lg" />
        <h2 className="text-lg font-semibold" style={{ color: isDarkMode ? '#f1f5f9' : '#1e3a5f' }}>
          Filtros e Busca
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <TextField
          placeholder="Buscar manutenções..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <FaSearch className="mr-2 text-gray-400" />
          }}
          sx={inputStyles}
        />
        
        <FormControl size="small" fullWidth sx={inputStyles}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => onStatusChange(e.target.value)} label="Status">
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="scheduled">Agendada</MenuItem>
            <MenuItem value="in_progress">Em Andamento</MenuItem>
            <MenuItem value="completed">Concluída</MenuItem>
            <MenuItem value="overdue">Atrasada</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth sx={inputStyles}>
          <InputLabel>Tipo</InputLabel>
          <Select value={filterType} onChange={(e) => onTypeChange(e.target.value)} label="Tipo">
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="preventive">Preventiva</MenuItem>
            <MenuItem value="corrective">Corretiva</MenuItem>
            <MenuItem value="emergency">Emergência</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth sx={inputStyles}>
          <InputLabel>Prioridade</InputLabel>
          <Select value={filterPriority} onChange={(e) => onPriorityChange(e.target.value)} label="Prioridade">
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="low">Baixa</MenuItem>
            <MenuItem value="medium">Média</MenuItem>
            <MenuItem value="high">Alta</MenuItem>
            <MenuItem value="critical">Crítica</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={onCreateNew}
          sx={{
            backgroundColor: '#3b82f6',
            color: 'white',
            '&:hover': { backgroundColor: '#2563eb' },
          }}
        >
          Nova Manutenção
        </Button>
      </div>
    </div>
  );
};

export default MaintenanceFilters;
