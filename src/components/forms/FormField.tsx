import React, { useState } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box, FormHelperText } from '@mui/material';

interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'url' | 'multiselect' | 'custom' | 'date' | 'unit' | 'currency';
  label: string;
  value: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  className?: string;
  component?: (props: { value: any; onChange: (value: any) => void; error?: string }) => React.ReactNode;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
  rows?: number;
}

// Unidades de medida industriais
const UNIT_OPTIONS = [
  // Métricas básicas
  { value: 'metro', label: 'Metro (m)' },
  { value: 'centimetro', label: 'Centímetro (cm)' },
  { value: 'milimetro', label: 'Milímetro (mm)' },
  { value: 'quilo', label: 'Quilograma (kg)' },
  { value: 'grama', label: 'Grama (g)' },
  { value: 'litro', label: 'Litro (L)' },
  { value: 'mililitro', label: 'Mililitro (mL)' },
  // Unidades de quantidade
  { value: 'unidade', label: 'Unidade (un)' },
  { value: 'peca', label: 'Peça (pç)' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'caixa', label: 'Caixa (cx)' },
  { value: 'palete', label: 'Palete' },
  { value: 'pacote', label: 'Pacote (pct)' },
  { value: 'fardo', label: 'Fardo' },
  // Específicas
  { value: 'cento', label: 'Cento (100 un)' },
  { value: 'milheiro', label: 'Milheiro (1000 un)' },
  { value: 'par', label: 'Par' },
  { value: 'duzia', label: 'Dúzia (12 un)' },
  // Outros
  { value: 'outros', label: 'Outros' },
];

// Funções de formatação de moeda
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseCurrencyToNumber = (value: string): number => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  // Converte para número com 2 casas decimais
  return parseInt(numbers || '0', 10) / 100;
};

const FormField: React.FC<FormFieldProps> = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  disabled = false,
  error,
  helperText,
  size = 'small',
  fullWidth = true,
  className = '',
  component,
  maxLength,
  minValue,
  maxValue,
  minDate,
  maxDate,
  rows = 3
}) => {
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Handler para campo de moeda
  const handleCurrencyChange = (inputValue: string) => {
    // Remove tudo exceto números
    const numbers = inputValue.replace(/\D/g, '');
    
    // Limita a 12 dígitos (até 9.999.999.999,99)
    const limitedNumbers = numbers.slice(0, 12);
    
    // Converte para número
    const numericValue = parseInt(limitedNumbers || '0', 10) / 100;
    
    // Verifica limites
    if (maxValue !== undefined && numericValue > maxValue) {
      onChange(maxValue);
      return;
    }
    if (minValue !== undefined && numericValue < minValue) {
      onChange(minValue);
      return;
    }
    
    onChange(numericValue);
  };

  // Validação de valor numérico
  const handleNumberChange = (inputValue: string) => {
    const numValue = parseFloat(inputValue);
    if (inputValue === '' || inputValue === '-') {
      onChange(inputValue);
      return;
    }
    if (!isNaN(numValue)) {
      if (minValue !== undefined && numValue < minValue) {
        onChange(minValue);
        return;
      }
      if (maxValue !== undefined && numValue > maxValue) {
        onChange(maxValue);
        return;
      }
      onChange(inputValue);
    }
  };

  // Validação de texto com maxLength
  const handleTextChange = (inputValue: string) => {
    if (maxLength && inputValue.length > maxLength) {
      onChange(inputValue.slice(0, maxLength));
      return;
    }
    onChange(inputValue);
  };

  // Campo customizado
  if (type === 'custom' && component) {
    return (
      <div className={className}>
        {component({ value, onChange, error })}
      </div>
    );
  }

  // Campo de unidade de medida industrial
  if (type === 'unit') {
    const isCustomValue = typeof value === 'string' && 
      !UNIT_OPTIONS.some(opt => opt.value === value) && 
      value !== '';

    return (
      <div className={className}>
        <FormControl 
          size={size} 
          fullWidth={fullWidth} 
          required={required}
          disabled={disabled}
          error={!!error}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            value={isCustomValue || showCustomInput ? 'outros' : value}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === 'outros') {
                setShowCustomInput(true);
                if (!isCustomValue) {
                  setCustomUnit('');
                  onChange('');
                }
              } else {
                setShowCustomInput(false);
                setCustomUnit('');
                onChange(selectedValue);
              }
            }}
            label={label}
          >
            {UNIT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
        
        {(showCustomInput || isCustomValue) && (
          <TextField
            label="Digite a unidade"
            value={isCustomValue ? value : customUnit}
            onChange={(e) => {
              const newValue = e.target.value;
              setCustomUnit(newValue);
              onChange(newValue);
            }}
            placeholder="Ex: galão, tambor, bobina..."
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            error={!!error}
            sx={{ mt: 2 }}
            inputProps={{
              maxLength: maxLength || 50
            }}
          />
        )}
      </div>
    );
  }

  if (type === 'select' || type === 'multiselect') {
    return (
      <FormControl 
        size={size} 
        fullWidth={fullWidth} 
        required={required}
        disabled={disabled}
        error={!!error}
        className={className}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          multiple={type === 'multiselect'}
          value={type === 'multiselect' ? (Array.isArray(value) ? value : []) : value}
          onChange={(e) => onChange(e.target.value as string | number | (string | number)[])}
          label={label}
          renderValue={type === 'multiselect' ? (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 100, overflow: 'auto' }}>
              {(selected as (string | number)[]).map((val) => {
                const option = options.find(opt => opt.value === val);
                return <Chip key={val} label={option ? option.label : String(val)} size="small" />;
              })}
            </Box>
          ) : undefined}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }

  // Campo de moeda (preço) com formatação em tempo real
  if (type === 'currency') {
    const numericValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
    const displayValue = formatCurrency(numericValue);
    
    return (
      <TextField
        label={label}
        value={`R$ ${displayValue}`}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        placeholder={placeholder || 'R$ 0,00'}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={error || helperText}
        size={size}
        fullWidth={fullWidth}
        className={className}
        inputProps={{
          style: {
            textAlign: 'right'
          }
        }}
      />
    );
  }

  // Campo de data com validações
  if (type === 'date') {
    return (
      <TextField
        type="date"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={error || helperText}
        size={size}
        fullWidth={fullWidth}
        className={className}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          min: minDate,
          max: maxDate,
          style: { colorScheme: 'light' }
        }}
      />
    );
  }

  // Campo de textarea com controle de overflow
  if (type === 'textarea') {
    const currentLength = typeof value === 'string' ? value.length : 0;
    const showCounter = maxLength && currentLength > 0;
    
    return (
      <TextField
        multiline
        rows={rows}
        label={label}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={
          error || 
          (showCounter ? `${currentLength}/${maxLength} caracteres` : helperText)
        }
        size={size}
        fullWidth={fullWidth}
        className={className}
        inputProps={{
          maxLength: maxLength,
          style: { 
            overflow: 'auto',
            wordBreak: 'break-word'
          }
        }}
        sx={{
          '& .MuiInputBase-root': {
            overflow: 'hidden'
          },
          '& .MuiInputBase-input': {
            overflow: 'auto !important',
            wordBreak: 'break-word'
          }
        }}
      />
    );
  }

  // Campo numérico com validações
  if (type === 'number') {
    return (
      <TextField
        type="number"
        label={label}
        value={value}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={
          error || 
          (minValue !== undefined && maxValue !== undefined 
            ? `Valor entre ${minValue} e ${maxValue}` 
            : helperText)
        }
        size={size}
        fullWidth={fullWidth}
        className={className}
        inputProps={{
          min: minValue,
          max: maxValue,
          step: 'any'
        }}
      />
    );
  }

  // Campos de texto padrão (text, email, password, url)
  const currentLength = typeof value === 'string' ? value.length : 0;
  const showCounter = maxLength && currentLength > 0;

  return (
    <TextField
      type={type}
      label={label}
      value={value}
      onChange={(e) => handleTextChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={
        error || 
        (showCounter ? `${currentLength}/${maxLength} caracteres` : helperText)
      }
      size={size}
      fullWidth={fullWidth}
      className={className}
      inputProps={{
        maxLength: maxLength,
        style: {
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }
      }}
      sx={{
        '& .MuiInputBase-input': {
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }
      }}
    />
  );
};

export default FormField;