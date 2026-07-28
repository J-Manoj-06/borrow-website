import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

import { BORROW_COLORS } from '../../theme/borrowTheme';

export const BookImageUploader = ({
  currentImageUrl = '',
  onFileSelect,
  onRemove,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (file) => {
    if (!file) return;

    // Supported Formats: PNG, JPG, JPEG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file format! Please select a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    // Max Size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setFileName(file.name);
    setFileSizeStr(formatFileSize(file.size));

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setFileName('');
    setFileSizeStr('');
    if (onRemove) onRemove();
    toast.success('Book cover image removed.');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
          Book Cover <span style={{ color: BORROW_COLORS.error }}>* (Required)</span>
        </Typography>
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
          Supports PNG, JPG, JPEG, WEBP • Max 10MB
        </Typography>
      </Box>

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${isDragOver ? BORROW_COLORS.primary : previewUrl ? BORROW_COLORS.success : BORROW_COLORS.border}`,
          borderRadius: '12px',
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.04)' : BORROW_COLORS.background,
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Large Cover Image Preview */}
        <Box
          sx={{
            width: 130,
            height: 175,
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#E2E8F0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
            border: `1px solid ${BORROW_COLORS.border}`,
            position: 'relative',
          }}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Book cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={() => setZoomOpen(true)}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  color: '#FFFFFF',
                  p: 0.5,
                  '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
                }}
              >
                <ZoomInIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </>
          ) : (
            <PhotoCameraIcon sx={{ fontSize: 42, color: BORROW_COLORS.textMuted }} />
          )}
        </Box>

        {/* Upload Actions & Metadata */}
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
            {previewUrl ? 'Book Cover Selected' : '+ Upload Book Cover'}
          </Typography>
          <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1.5 }}>
            Drag & Drop image here, or click browse to upload to Cloudinary.
          </Typography>

          {/* Filename & File Size Badge */}
          {fileName && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={fileName}
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {fileSizeStr && (
                <Chip
                  label={fileSizeStr}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          )}

          {/* Real-time Upload Progress Indicator */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, mb: 0.5, display: 'block' }}>
                Uploading to Cloudinary... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          {/* Action Buttons: Browse / Replace & Remove */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button
              variant="contained"
              component="label"
              startIcon={previewUrl ? <RefreshIcon /> : <CloudUploadIcon />}
              disabled={uploading}
              sx={{
                borderRadius: '8px',
                px: 2.5,
                py: 0.75,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {uploading ? `Uploading (${uploadProgress}%)` : previewUrl ? 'Replace Cover' : 'Click to Browse'}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              />
            </Button>

            {previewUrl && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemove}
                disabled={uploading}
                sx={{ borderRadius: '8px', px: 2, fontSize: '0.8125rem', fontWeight: 600 }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Fullscreen Zoom Lightbox Dialog */}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="sm">
        <Box sx={{ position: 'relative', p: 1, backgroundColor: '#0F172A' }}>
          <IconButton
            onClick={() => setZoomOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#FFFFFF', zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <img src={previewUrl} alt="Cover Large Zoom" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
        </Box>
      </Dialog>
    </Box>
  );
};

export default BookImageUploader;
