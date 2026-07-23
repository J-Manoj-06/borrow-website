import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import { uploadFileWithProgress } from '../../services/firebase/storageService';

export const FileUploader = ({
  folderPath = 'books/covers',
  onUploadSuccess,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5,
  label = 'Drag & drop image here or click to browse',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [completedUrl, setCompletedUrl] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error(`Invalid file format. Allowed: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`);
      return;
    }

    // Validate size limit
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setCurrentFile(file);

    // Generate local preview
    if (file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }

    startUpload(file);
  };

  const startUpload = async (fileToUpload) => {
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFileWithProgress(
        folderPath,
        fileToUpload,
        {},
        (snapshot) => {
          setProgress(snapshot.progress);
        }
      );

      setCompletedUrl(result.downloadURL);
      setUploading(false);
      toast.success(`File uploaded successfully to Cloudinary Storage!`);
      if (onUploadSuccess) onUploadSuccess(result.downloadURL, result);
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      setUploading(false);
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept={allowedTypes.join(',')}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: `2px dashed ${isDragOver ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
          backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.05)' : '#F8FAFC',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: BORROW_COLORS.primary,
            backgroundColor: 'rgba(37, 99, 235, 0.02)',
          },
        }}
      >
        {previewUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 100,
                height: 130,
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>

            {completedUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: BORROW_COLORS.success }}>
                <CheckCircleIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Uploaded to Cloudinary (WebP)
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 44, color: BORROW_COLORS.primary, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              Supports WebP, PNG, JPEG up to {maxSizeMB}MB
            </Typography>
          </>
        )}
      </Box>

      {/* Upload Progress Bar */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.primary }}>
              Uploading to Cloudinary Storage... {progress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
