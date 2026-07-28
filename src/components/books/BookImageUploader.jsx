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
import { uploadFileWithProgress } from '../../services/firebase/storageService';

export const BookImageUploader = ({ currentImageUrl, onFileSelect, onUrlChange, onRemove, bookId = 'new' }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (currentImageUrl) setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  // Paste Event Listener (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              handleFileChange(file);
              toast.success('Image pasted from clipboard!');
              break;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 300 || img.height < 300) {
          toast.error(`Image resolution too low (${img.width}x${img.height}px). Minimum required is 300x300px.`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
    });
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    // 1. Accepted File Types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image format! Please select a JPG, JPEG, PNG, or WEBP file.');
      return;
    }

    // 2. Max File Size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB maximum limit.');
      return;
    }

    // 3. Min Dimensions (300 x 300 pixels)
    const isValidDim = await validateImageDimensions(file);
    if (!isValidDim) return;

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (onFileSelect) onFileSelect(file);

    // 4. Cloudinary Storage Upload Flow
    setUploading(true);
    setUploadProgress(0);

    try {
      const folderPath = `books/${bookId}`;
      const result = await uploadFileWithProgress(
        folderPath,
        file,
        { version: 1 },
        (snapshot) => {
          setUploadProgress(snapshot.progress);
        }
      );

      setUploading(false);
      setPreviewUrl(result.downloadURL);
      toast.success('Book cover image uploaded & optimized to Cloudinary!');
      if (onUrlChange) onUrlChange(result.downloadURL);
    } catch (err) {
      console.error('Cloudinary Storage upload error:', err);
      setUploading(false);
      toast.error('Cloudinary upload failed. Using local image preview.');
      if (onUrlChange) onUrlChange(objectUrl);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setFileName('');
    if (onRemove) onRemove();
    if (onUrlChange) onUrlChange('');
    if (onFileSelect) onFileSelect(null);
    toast.success('Cover image removed.');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
          Book Cover Image <span style={{ color: BORROW_COLORS.error }}>* (Required)</span>
        </Typography>
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
          Min 300x300px • Max 10MB
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
          p: 2.5,
          textAlign: 'center',
          backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.04)' : BORROW_COLORS.background,
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        {/* Cover Image Preview */}
        <Box
          sx={{
            width: 110,
            height: 150,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#E2E8F0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
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
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  color: '#FFFFFF',
                  p: 0.5,
                  '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
                }}
              >
                <ZoomInIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </>
          ) : (
            <PhotoCameraIcon sx={{ fontSize: 36, color: BORROW_COLORS.textMuted }} />
          )}
        </Box>

        {/* Upload Actions & Controls */}
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
            {previewUrl ? 'Cover Image Uploaded' : 'Upload Cover Image (Required)'}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mb: 1.5, display: 'block' }}>
            Drag & drop file here, click browse, or paste image with <strong>Ctrl+V</strong>. Supports JPG, PNG, WEBP.
          </Typography>

          {fileName && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Selected: ${fileName}`}
              color="success"
              size="small"
              sx={{ mb: 1.5, fontWeight: 600 }}
            />
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, mb: 0.5, display: 'block' }}>
                Uploading to Cloudinary... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={previewUrl ? <RefreshIcon /> : <CloudUploadIcon />}
              disabled={uploading}
              sx={{
                borderRadius: '8px',
                borderColor: BORROW_COLORS.primary,
                color: BORROW_COLORS.primary,
                fontSize: '0.8125rem',
                py: 0.5,
                px: 2,
              }}
            >
              {uploading ? 'Uploading...' : previewUrl ? 'Replace Cover' : 'Browse File'}
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
                onClick={handleRemoveImage}
                sx={{ borderRadius: '8px', fontSize: '0.8125rem', py: 0.5, px: 1.5 }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Zoom Modal Lightbox */}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="sm">
        <Box sx={{ position: 'relative', p: 1, backgroundColor: '#0F172A' }}>
          <IconButton
            onClick={() => setZoomOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#FFFFFF', zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <img src={previewUrl} alt="Cover Zoom Preview" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
        </Box>
      </Dialog>
    </Box>
  );
};

export default BookImageUploader;
