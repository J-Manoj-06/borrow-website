import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import LinearProgress from '@mui/material/LinearProgress';
import toast from 'react-hot-toast';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import { uploadFileWithProgress } from '../../services/firebase/storageService';
import BookImageEditorDialog from './BookImageEditorDialog';

export const BookGalleryManager = ({
  initialPrimaryUrl = '',
  initialGalleryUrls = [],
  onChange,
  bookId = 'new',
}) => {
  // State holds array of image objects: [{ id, url, isPrimary, uploading, progress, name }]
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);

  // Initialize from props
  useEffect(() => {
    const list = [];
    if (initialPrimaryUrl) {
      list.push({ id: 'primary-0', url: initialPrimaryUrl, isPrimary: true, name: 'Primary Cover' });
    }
    if (initialGalleryUrls && Array.isArray(initialGalleryUrls)) {
      initialGalleryUrls.forEach((url, i) => {
        if (url && url !== initialPrimaryUrl) {
          list.push({ id: `gallery-${i}`, url, isPrimary: false, name: `Gallery Image ${i + 1}` });
        }
      });
    }
    setImages(list);
  }, [initialPrimaryUrl, initialGalleryUrls]);

  // Notify parent of updates whenever images array changes
  const notifyParent = (updatedList) => {
    setImages(updatedList);
    const primaryObj = updatedList.find((img) => img.isPrimary) || updatedList[0];
    const primaryUrl = primaryObj ? primaryObj.url : '';
    const galleryUrls = updatedList.map((img) => img.url).filter(Boolean);

    if (onChange) {
      onChange({ primaryUrl, galleryUrls, allImages: updatedList });
    }
  };

  // Keyboard Navigation for Lightbox Carousel
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevLightbox();
      else if (e.key === 'ArrowRight') handleNextLightbox();
      else if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images]);

  const validateImage = (file) => {
    return new Promise((resolve) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`"${file.name}" invalid format. Only JPG, PNG, WEBP allowed.`);
        return resolve(false);
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit.`);
        return resolve(false);
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 300 || img.height < 300) {
          toast.error(`"${file.name}" resolution too low (${img.width}x${img.height}px). Minimum 300x300px required.`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
    });
  };

  const handleFilesUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    if (images.length + fileList.length > 10) {
      toast.error('Maximum 10 images allowed per book gallery.');
      return;
    }

    const newFiles = Array.from(fileList);
    for (const file of newFiles) {
      const isValid = await validateImage(file);
      if (!isValid) continue;

      if (images.some((img) => img.name === file.name)) {
        toast.error(`"${file.name}" is already added to the gallery.`);
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const objectUrl = URL.createObjectURL(file);
      const isFirst = images.length === 0;

      const newImgObj = {
        id: tempId,
        url: objectUrl,
        isPrimary: isFirst,
        uploading: true,
        progress: 0,
        name: file.name,
      };

      const updatedList = [...images, newImgObj];
      notifyParent(updatedList);

      try {
        const folderPath = `books/${bookId}`;
        const result = await uploadFileWithProgress(
          folderPath,
          file,
          { version: 1 },
          (snapshot) => {
            setImages((prev) =>
              prev.map((item) => (item.id === tempId ? { ...item, progress: snapshot.progress } : item))
            );
          }
        );

        setImages((prev) => {
          const list = prev.map((item) =>
            item.id === tempId ? { ...item, url: result.downloadURL, uploading: false, progress: 100 } : item
          );
          notifyParent(list);
          return list;
        });

        toast.success(`Uploaded "${file.name}" to Cloudinary!`);
      } catch (err) {
        console.error('Upload failed:', err);
        setImages((prev) => {
          const list = prev.map((item) => (item.id === tempId ? { ...item, uploading: false } : item));
          notifyParent(list);
          return list;
        });
        toast.error(`Upload error for "${file.name}". Using preview.`);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFilesUpload(e.dataTransfer.files);
  };

  const handleSetPrimary = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    notifyParent(updated);
    toast.success(`Set "${images[index]?.name || 'Image'}" as primary cover.`);
  };

  const handleDeleteImage = (index) => {
    const isPrimary = images[index]?.isPrimary;
    const updated = images.filter((_, i) => i !== index);

    if (isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    notifyParent(updated);
    toast.success('Image removed from gallery.');
  };

  const handleReplaceImage = async (index, file) => {
    if (!file) return;
    const isValid = await validateImage(file);
    if (!isValid) return;

    const objectUrl = URL.createObjectURL(file);
    const updated = [...images];
    updated[index] = {
      ...updated[index],
      url: objectUrl,
      name: file.name,
      uploading: true,
      progress: 0,
    };
    notifyParent(updated);

    try {
      const folderPath = `books/${bookId}`;
      const result = await uploadFileWithProgress(folderPath, file, { version: 1 }, (snapshot) => {
        setImages((prev) =>
          prev.map((item, i) => (i === index ? { ...item, progress: snapshot.progress } : item))
        );
      });
      updated[index].url = result.downloadURL;
      updated[index].uploading = false;
      notifyParent(updated);
      toast.success('Image replaced successfully.');
    } catch {
      updated[index].uploading = false;
      notifyParent(updated);
    }
  };

  // Handle Save from Image Editor Dialog
  const handleEditorSave = (editedDataUrl) => {
    if (editingImageIndex !== null && images[editingImageIndex]) {
      const updated = [...images];
      updated[editingImageIndex] = {
        ...updated[editingImageIndex],
        url: editedDataUrl,
      };
      notifyParent(updated);
      setEditingImageIndex(null);
    }
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'book-image.jpg';
    link.target = '_blank';
    link.click();
  };

  // Context Menu Handlers
  const handleMenuOpen = (e, index) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuIndex(null);
  };

  // Lightbox Carousel controls
  const handleNextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
          Book Cover & Image Gallery <span style={{ color: BORROW_COLORS.error }}>* (Primary Required)</span>
        </Typography>
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
          {images.length}/10 images uploaded
        </Typography>
      </Box>

      {/* Drag & Drop Upload Dropzone */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${isDragOver ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
          borderRadius: '12px',
          p: 2,
          textAlign: 'center',
          backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.04)' : BORROW_COLORS.background,
          transition: 'all 0.15s ease',
          mb: 2,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 32, color: BORROW_COLORS.primary, mb: 0.5 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
          Drag & Drop Gallery Images Here
        </Typography>
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mb: 1 }}>
          Select multiple files, paste image with <strong>Ctrl+V</strong>, or browse from computer.
        </Typography>

        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCameraIcon />}
          size="small"
          sx={{ borderRadius: '8px', fontSize: '0.75rem', py: 0.5, px: 2 }}
        >
          Browse Files (Batch Upload)
          <input
            type="file"
            hidden
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
          />
        </Button>
      </Box>

      {/* Responsive Gallery Grid */}
      {images.length === 0 ? (
        <Box sx={{ p: 2, borderRadius: '8px', border: `1px solid ${BORROW_COLORS.border}`, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
            No images uploaded yet. Upload a cover image to continue.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {images.map((img, idx) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={img.id || idx}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: '8px',
                  border: img.isPrimary ? `2px solid ${BORROW_COLORS.primary}` : `1px solid ${BORROW_COLORS.border}`,
                  overflow: 'hidden',
                  boxShadow: BORROW_COLORS.cardShadow,
                  transition: 'all 0.12s ease',
                  '&:hover': {
                    borderColor: BORROW_COLORS.primary,
                  },
                }}
              >
                {/* Image Thumbnail */}
                <Box
                  onClick={() => setLightboxIndex(idx)}
                  sx={{
                    height: 130,
                    backgroundColor: '#E2E8F0',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.name || `Gallery ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Primary Cover Badge */}
                  {img.isPrimary && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '12px !important', color: '#FFFFFF' }} />}
                      label="Primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        height: 20,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: BORROW_COLORS.primary,
                        color: '#FFFFFF',
                      }}
                    />
                  )}

                  {/* Three-Dot Menu Trigger */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, idx)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      color: '#FFFFFF',
                      p: 0.25,
                      '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Upload Progress Bar */}
                {img.uploading && (
                  <LinearProgress variant="determinate" value={img.progress || 0} sx={{ height: 3 }} />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu for Individual Image Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '8px',
            minWidth: 160,
            boxShadow: BORROW_COLORS.cardShadowHover,
            border: `1px solid ${BORROW_COLORS.border}`,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const idx = activeMenuIndex;
            handleMenuClose();
            if (idx !== null) setEditingImageIndex(idx);
          }}
          sx={{ fontSize: '0.8125rem' }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit & Crop Image
        </MenuItem>

        <MenuItem
          onClick={() => {
            const idx = activeMenuIndex;
            handleMenuClose();
            if (idx !== null) setLightboxIndex(idx);
          }}
          sx={{ fontSize: '0.8125rem' }}
        >
          <ListItemIcon><ZoomInIcon fontSize="small" /></ListItemIcon>
          Full Preview
        </MenuItem>

        {activeMenuIndex !== null && !images[activeMenuIndex]?.isPrimary && (
          <MenuItem
            onClick={() => {
              const idx = activeMenuIndex;
              handleMenuClose();
              if (idx !== null) handleSetPrimary(idx);
            }}
            sx={{ fontSize: '0.8125rem' }}
          >
            <ListItemIcon><StarBorderIcon fontSize="small" /></ListItemIcon>
            Set as Primary Cover
          </MenuItem>
        )}

        <MenuItem
          component="label"
          onClick={() => handleMenuClose()}
          sx={{ fontSize: '0.8125rem' }}
        >
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          Replace Image
          <input
            type="file"
            hidden
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => {
              const idx = activeMenuIndex;
              if (idx !== null && e.target.files && e.target.files[0]) {
                handleReplaceImage(idx, e.target.files[0]);
              }
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            const idx = activeMenuIndex;
            handleMenuClose();
            if (idx !== null && images[idx]) {
              handleDownload(images[idx].url, images[idx].name);
            }
          }}
          sx={{ fontSize: '0.8125rem' }}
        >
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          Download
        </MenuItem>

        <MenuItem
          onClick={() => {
            const idx = activeMenuIndex;
            handleMenuClose();
            if (idx !== null) handleDeleteImage(idx);
          }}
          sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.error }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete Image
        </MenuItem>
      </Menu>

      {/* Advanced Image Editor Dialog */}
      <BookImageEditorDialog
        open={editingImageIndex !== null}
        onClose={() => setEditingImageIndex(null)}
        imageUrl={editingImageIndex !== null && images[editingImageIndex] ? images[editingImageIndex].url : ''}
        onSave={handleEditorSave}
      />

      {/* Fullscreen Lightbox Carousel Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <Dialog fullScreen open={lightboxIndex !== null} onClose={() => setLightboxIndex(null)}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 24,
                right: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                color: '#FFFFFF',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {images[lightboxIndex].name || `Image ${lightboxIndex + 1}`}
                </Typography>
                {images[lightboxIndex].isPrimary && (
                  <Chip label="Primary Cover" size="small" color="primary" sx={{ fontWeight: 700 }} />
                )}
              </Box>

              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {lightboxIndex + 1} of {images.length} (Use ← → Arrow Keys)
              </Typography>

              <IconButton onClick={() => setLightboxIndex(null)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {images.length > 1 && (
              <IconButton
                onClick={handlePrevLightbox}
                sx={{
                  position: 'absolute',
                  left: 24,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  zIndex: 10,
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}

            <Box
              sx={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={images[lightboxIndex].url}
                alt="Full preview"
                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }}
              />
            </Box>

            {images.length > 1 && (
              <IconButton
                onClick={handleNextLightbox}
                sx={{
                  position: 'absolute',
                  right: 24,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  zIndex: 10,
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default BookGalleryManager;
