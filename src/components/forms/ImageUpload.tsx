import React, { useState, useEffect, useRef } from 'react';
import { TextField, Box, Avatar, Typography, Button, Alert } from '@mui/material';
import { FaUser, FaLink, FaUpload, FaTrash } from 'react-icons/fa';

// Exemplo de avatares
const SAMPLE_AVATARS = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
];

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
  placeholder = 'Cole a URL da imagem',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [uploadMode, setUploadMode] = useState<'none' | 'avatar' | 'url' | 'file'>('none');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // sincroniza valor externo
  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const maxSize = 80;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      let quality = 0.3;
      let base64 = canvas.toDataURL('image/jpeg', quality);
      while (base64.length > 20000 && quality > 0.1) {
        quality -= 0.05;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      if (base64.length > 25000) {
        setError('Não foi possível comprimir a imagem o suficiente. Tente uma imagem mais simples.');
        return;
      }

      setPreviewUrl(base64);
      onChange(base64);
      setError('');
    };

    img.src = URL.createObjectURL(file);
  };

  const handleClear = () => {
    setPreviewUrl('');
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageError = () => {
    setError('Não foi possível carregar a imagem. Verifique a URL.');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>

      {/* Botões de modo */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={uploadMode === 'none' ? 'contained' : 'outlined'}
          startIcon={<FaUser />}
          onClick={() => {
            setUploadMode('none');
            setPreviewUrl('');
            onChange('');
            setError('');
          }}
          sx={{ textTransform: 'none' }}
        >
          Sem Foto
        </Button>
        <Button
          size="small"
          variant={uploadMode === 'avatar' ? 'contained' : 'outlined'}
          startIcon={<FaUser />}
          onClick={() => setUploadMode('avatar')}
          sx={{ textTransform: 'none' }}
        >
          Avatar
        </Button>
        <Button
          size="small"
          variant={uploadMode === 'url' ? 'contained' : 'outlined'}
          startIcon={<FaLink />}
          onClick={() => setUploadMode('url')}
          sx={{ textTransform: 'none' }}
        >
          URL
        </Button>
        <Button
          size="small"
          variant={uploadMode === 'file' ? 'contained' : 'outlined'}
          startIcon={<FaUpload />}
          onClick={() => setUploadMode('file')}
          sx={{ textTransform: 'none' }}
        >
          Upload
        </Button>
        {previewUrl && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<FaTrash />}
            onClick={handleClear}
            sx={{ textTransform: 'none' }}
          >
            Limpar
          </Button>
        )}
      </Box>

      {/* Modos */}
      {uploadMode === 'none' && (
        <Box sx={{ mb: 2, textAlign: 'center', py: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'grey.300' }}>
            <FaUser size={30} color="#666" />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            Nenhuma foto selecionada
          </Typography>
        </Box>
      )}

      {uploadMode === 'avatar' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Escolha um avatar:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {SAMPLE_AVATARS.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar}
                sx={{
                  width: 50,
                  height: 50,
                  cursor: 'pointer',
                  border: previewUrl === avatar ? '2px solid var(--primary)' : '2px solid transparent',
                  '&:hover': {
                    border: '2px solid var(--primary)',
                    opacity: 0.8
                  }
                }}
                onClick={() => {
                  setPreviewUrl(avatar);
                  onChange(avatar);
                  setError('');
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {uploadMode === 'url' && (
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          sx={{ mb: 2 }}
        />
      )}

      {uploadMode === 'file' && (
        <Box sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FaUpload />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              textTransform: 'none',
              py: 1.5,
              borderStyle: 'dashed'
            }}
          >
            Clique para selecionar uma imagem
          </Button>
        </Box>
      )}

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

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {uploadMode === 'none' && 'Recomendado: Use "Sem Foto" para evitar problemas no banco de dados.'}
        {uploadMode === 'avatar' && 'Avatares simples e pequenos.'}
        {uploadMode === 'url' && 'Cole uma URL de imagem pequena.'}
        {uploadMode === 'file' && 'Imagem será comprimida para 80x80px.'}
      </Typography>
    </Box>
  );
};

export default ImageUpload;
