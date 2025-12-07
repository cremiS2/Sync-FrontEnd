import React, { useState, useEffect } from 'react';
import { TextField, Box, Avatar, Typography } from '@mui/material';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  label = 'Foto',
  placeholder = 'Cole a URL da imagem'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value);

  // Sincronizar com valor externo
  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  const handleImageError = () => {
    // Não fazer nada se a imagem não carregar
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder={placeholder}
        sx={{ mb: 2 }}
      />

      {previewUrl && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            src={previewUrl}
            onError={handleImageError}
            sx={{ 
              width: 80, 
              height: 80,
              border: '2px solid #e0e0e0'
            }}
          />
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Cole a URL de uma imagem pequena para melhor performance.
      </Typography>
    </Box>
  );
};

export default ImageUpload;
