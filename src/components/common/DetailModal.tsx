import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface DetailField {
  label: string;
  value: string | React.ReactNode;
  type?: 'text' | 'chip' | 'custom';
  chipColor?: string;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  title,
  fields,
  actions,
  maxWidth = 'md'
}) => {
  const renderFieldValue = (field: DetailField) => {
    switch (field.type) {
      case 'chip':
        return (
          <Chip
            label={field.value}
            size="small"
            sx={{
              backgroundColor: field.chipColor || 'var(--primary)',
              color: 'white',
              fontWeight: 600
            }}
          />
        );
      case 'custom':
        return field.value;
      default:
        return <span className="text-gray-900 font-medium">{field.value}</span>;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <DialogTitle className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
        <span className="text-2xl font-extrabold text-[var(--primary-dark)]">{title}</span>
        <Button
          onClick={onClose}
          aria-label="Fechar"
          sx={{ 
            minWidth: 'auto', 
            p: 1.5,
            color: '#1f2937',
            fontSize: '1.25rem',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#f3f4f6',
              color: '#ef4444'
            }
          }}
        >
          <FaTimes />
        </Button>
      </DialogTitle>
      
      <DialogContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-bold text-[var(--primary-dark)] uppercase tracking-wide">
                {field.label}
              </p>
              {renderFieldValue(field)}
            </div>
          ))}
        </div>
      </DialogContent>
      
      {actions && (
        <DialogActions className="border-t border-gray-200 pt-3">
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DetailModal;
