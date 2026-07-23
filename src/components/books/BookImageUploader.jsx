import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import { uploadFileWithProgress } from '../../services/firebase/storageService';

export const BookImageUploader = ({ currentImageUrl, onFileSelect, onUrlChange, bookId = 'new' }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (currentImageUrl) setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileChange = async (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (onFileSelect) onFileSelect(file);

    // Upload to Cloudflare R2 / Storage with progress
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
      toast.success(`Book cover image uploaded & optimized (WebP)! [${result.provider || 'R2 CDN'}]`);
      if (onUrlChange) onUrlChange(result.downloadURL);
    } catch (err) {
      console.error('Storage upload failed:', err);
      setUploading(false);
      toast.error('Storage upload failed. Using local image preview.');
    }
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
            Drag and drop your image file here, or click browse to upload to Cloudflare R2 Storage. Images are auto-compressed to WebP format.
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

          {/* Upload Progress Bar */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, mb: 0.5, display: 'block' }}>
                Uploading to Cloudflare R2... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              sx={{
                borderRadius: '10px',
                borderColor: BORROW_COLORS.primary,
                color: BORROW_COLORS.primary,
                px: 2.5,
              }}
            >
              {uploading ? 'Uploading...' : 'Browse Image'}
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
