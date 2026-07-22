import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const BookImageUploader = ({ currentImageUrl, onFileSelect }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (currentImageUrl) setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileChange = (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
        Book Cover Image (JPEG, PNG, WEBP)
      </Typography>

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${isDragOver ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
          borderRadius: '16px',
          p: 2.5,
          textAlign: 'center',
          backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Cover Preview */}
        <Box
          sx={{
            width: 110,
            height: 150,
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#E2E8F0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
            border: `1px solid ${BORROW_COLORS.border}`,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Book cover preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <PhotoCameraIcon sx={{ fontSize: 40, color: BORROW_COLORS.textSecondary }} />
          )}
        </Box>

        {/* Upload Action */}
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
            {previewUrl ? 'Change Cover Image' : 'Upload High Resolution Cover'}
          </Typography>
          <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 2 }}>
            Drag and drop your image file here, or click browse to upload from your computer. Images are auto-compressed to WebP format.
          </Typography>

          {fileName && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Selected: ${fileName}`}
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: '10px',
                borderColor: BORROW_COLORS.primary,
                color: BORROW_COLORS.primary,
                px: 2.5,
              }}
            >
              Browse Image
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookImageUploader;
