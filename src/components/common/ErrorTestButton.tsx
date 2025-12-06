import React, { useState } from 'react';
import { Button } from '@mui/material';
import { FaBug } from 'react-icons/fa';

/**
 * Componente de teste para verificar o ErrorBoundary
 * REMOVA ESTE COMPONENTE EM PRODUÇÃO
 */
const ErrorTestButton: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    // Isso vai disparar o ErrorBoundary e redirecionar para /404
    throw new Error('Erro de teste gerado pelo ErrorTestButton!');
  }

  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<FaBug />}
      onClick={() => setShouldError(true)}
      sx={{
        borderColor: '#ef4444',
        color: '#ef4444',
        '&:hover': {
          backgroundColor: '#ef4444',
          color: 'white',
        },
      }}
    >
      🐛 Testar ErrorBoundary
    </Button>
  );
};

export default ErrorTestButton;
