import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box } from '@mui/material';

interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'url' | 'multiselect' | 'custom' | 'date';
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
}

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
  component
}) => {
  // Campo customizado
  if (type === 'custom' && component) {
    return (
      <div className={className}>
        {component({ value, onChange, error })}
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
          onChange={(e) => onChange(e.target.value as any)}
          label={label}
          renderValue={type === 'multiselect' ? (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as (string | number)[]).map((val) => {
                const option = options.find(opt => opt.value === val);
                return <Chip key={val} label={option ? option.label : ''} size="small" />;
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
      </FormControl>
    );
  }

  // Campo de data com formato brasileiro
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
          // Formato de exibição (navegador pode usar formato local)
          style: { colorScheme: 'light' }
        }}
      />
    );
  }

  return (
    <TextField
      type={type}
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
    />
  );
};

export default FormField; 