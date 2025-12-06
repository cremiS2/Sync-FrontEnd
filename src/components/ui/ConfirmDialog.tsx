import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import ActionButton from './ActionButton';
import { FaExclamationTriangle, FaQuestionCircle, FaInfoCircle, FaTimes, FaCheck } from 'react-icons/fa';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'question';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'question',
  maxWidth = 'sm',
  fullWidth = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'question':
      default:
        return <FaQuestionCircle className="text-[var(--primary)]" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'question':
      default:
        return 'text-[var(--primary)]';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <div className={`text-xl ${getIconColor()}`}>
              {getIcon()}
            </div>
            <Typography variant="h6" className="font-semibold">
              {title}
            </Typography>
          </Box>
          <button
            onClick={onCancel}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Box>
      </DialogTitle>
      
      <DialogContent className="p-6">
        <Typography variant="body1" className="text-[var(--text)]">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions className="p-6 gap-3">
        <ActionButton
          label={cancelText}
          icon={<FaTimes />}
          onClick={onCancel}
          variant="outlined"
          color="error"
          size="medium"
        />
        <ActionButton
          label={confirmText}
          icon={<FaCheck />}
          onClick={onConfirm}
          variant="contained"
          color="success"
          size="medium"
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 