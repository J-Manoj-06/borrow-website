import React, { useState, useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';

// Icons
import CropIcon from '@mui/icons-material/Crop';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomButton from '../common/CustomButton';

export const BookImageEditorDialog = ({ open, onClose, imageUrl, onSave }) => {
  // Transform State
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cropPreset, setCropPreset] = useState('2:3'); // '2:3' | '1:1' | '4:3' | '3:4' | '16:9' | 'free'
  const [qualityPreset, setQualityPreset] = useState(0.80); // 0.92 | 0.80 | 0.60

  // Metadata State
  const [imgMeta, setImgMeta] = useState({ width: 0, height: 0, sizeKb: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load Image & Metadata
  useEffect(() => {
    if (!open || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      imageRef.current = img;
      setImgMeta({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        sizeKb: Math.round((imageUrl.length * 0.75) / 1024) || 240,
      });
      renderCanvas();
    };
  }, [open, imageUrl]);

  // Re-render Canvas on transform update
  useEffect(() => {
    if (imageRef.current) renderCanvas();
  }, [rotation, flipH, flipV, zoom, cropPreset, qualityPreset]);

  // Keyboard Shortcuts Listener (Ctrl+S & Esc)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, rotation, flipH, flipV, zoom, cropPreset, qualityPreset]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    let srcWidth = img.naturalWidth || img.width;
    let srcHeight = img.naturalHeight || img.height;

    // Apply Crop Aspect Ratio Presets
    let cropWidth = srcWidth;
    let cropHeight = srcHeight;

    if (cropPreset === '2:3') {
      // Book Cover Recommended
      if (srcWidth / srcHeight > 2 / 3) {
        cropWidth = srcHeight * (2 / 3);
      } else {
        cropHeight = srcWidth * (3 / 2);
      }
    } else if (cropPreset === '1:1') {
      const minDim = Math.min(srcWidth, srcHeight);
      cropWidth = minDim;
      cropHeight = minDim;
    } else if (cropPreset === '4:3') {
      cropHeight = (srcWidth * 3) / 4;
    } else if (cropPreset === '3:4') {
      cropWidth = (srcHeight * 3) / 4;
    } else if (cropPreset === '16:9') {
      cropHeight = (srcWidth * 9) / 16;
    }

    const cropX = (srcWidth - cropWidth) / 2;
    const cropY = (srcHeight - cropHeight) / 2;

    // Determine target canvas dimensions considering rotation
    const isRotated90 = rotation % 180 !== 0;
    const targetWidth = isRotated90 ? cropHeight : cropWidth;
    const targetHeight = isRotated90 ? cropWidth : cropHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Translate to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply Transforms
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);

    // Draw Cropped Region
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      -cropWidth / 2,
      -cropHeight / 2,
      cropWidth,
      cropHeight
    );

    ctx.restore();
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setCropPreset('2:3');
    setQualityPreset(0.80);
    toast.success('Editor reset to original image.');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export edited canvas to WebP/JPEG data URL with selected compression quality
    const editedDataUrl = canvas.toDataURL('image/jpeg', qualityPreset);
    if (onSave) onSave(editedDataUrl);
    toast.success('Image edits applied & compressed!');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CropIcon sx={{ color: BORROW_COLORS.primary }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            Advanced Book Image Editor
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: BORROW_COLORS.textMuted }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Editor Content */}
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column: Live HTML5 Canvas Viewport */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                width: '100%',
                height: 380,
                borderRadius: '10px',
                backgroundColor: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                border: `1px solid ${BORROW_COLORS.border}`,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 6,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                }}
              />
            </Box>
          </Grid>

          {/* Right Column: Controls & Metadata */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* 1. Crop Ratio Presets */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                  CROP ASPECT RATIO PRESETS
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={cropPreset}
                  onChange={(e) => setCropPreset(e.target.value)}
                >
                  <MenuItem value="2:3">Book Cover 2:3 (Recommended)</MenuItem>
                  <MenuItem value="1:1">Square 1:1</MenuItem>
                  <MenuItem value="3:4">Standard 3:4</MenuItem>
                  <MenuItem value="4:3">Landscape 4:3</MenuItem>
                  <MenuItem value="16:9">Widescreen 16:9</MenuItem>
                  <MenuItem value="free">Original / Free</MenuItem>
                </TextField>
              </Box>

              {/* 2. Rotate & Flip Buttons */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                  ROTATE & FLIP
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <IconButton
                    size="small"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    sx={{ border: `1px solid ${BORROW_COLORS.border}`, borderRadius: '6px' }}
                  >
                    <RotateLeftIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    sx={{ border: `1px solid ${BORROW_COLORS.border}`, borderRadius: '6px' }}
                  >
                    <RotateRightIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => setFlipH((prev) => !prev)}
                    sx={{
                      border: `1px solid ${BORROW_COLORS.border}`,
                      borderRadius: '6px',
                      backgroundColor: flipH ? BORROW_COLORS.primarySurface : 'transparent',
                    }}
                  >
                    <FlipIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => setFlipV((prev) => !prev)}
                    sx={{
                      border: `1px solid ${BORROW_COLORS.border}`,
                      borderRadius: '6px',
                      transform: 'rotate(90deg)',
                      backgroundColor: flipV ? BORROW_COLORS.primarySurface : 'transparent',
                    }}
                  >
                    <FlipIcon fontSize="small" />
                  </IconButton>

                  <Chip label={`Rotation: ${rotation}°`} size="small" sx={{ fontWeight: 600, alignSelf: 'center' }} />
                </Box>
              </Box>

              {/* 3. Zoom Slider */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted }}>
                    ZOOM SCALE ({zoom.toFixed(1)}x)
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(_, val) => setZoom(val)}
                  sx={{ color: BORROW_COLORS.primary }}
                />
              </Box>

              {/* 4. Compression Presets */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                  OPTIMIZATION & COMPRESSION PRESET
                </Typography>
                <ToggleButtonGroup
                  value={qualityPreset}
                  exclusive
                  onChange={(_, val) => val && setQualityPreset(val)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value={0.92}>High (92%)</ToggleButton>
                  <ToggleButton value={0.80}>Balanced (80%)</ToggleButton>
                  <ToggleButton value={0.60}>Max (60%)</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* 5. Metadata Panel */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: BORROW_COLORS.background,
                  border: `1px solid ${BORROW_COLORS.border}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: BORROW_COLORS.textMuted }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted }}>
                    IMAGE METADATA & SPECS
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                  <strong>Dimensions:</strong> {imgMeta.width} × {imgMeta.height} px
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                  <strong>Estimated Size:</strong> ~{Math.round(imgMeta.sizeKb * qualityPreset)} KB
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${BORROW_COLORS.border}`, justifyContent: 'space-between' }}>
        <CustomButton
          variant="outline"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
        >
          Reset to Original
        </CustomButton>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <CustomButton variant="outline" size="small" onClick={onClose}>
            Cancel (Esc)
          </CustomButton>

          <CustomButton
            variant="primary"
            size="small"
            startIcon={<CheckIcon />}
            onClick={handleSave}
          >
            Save & Apply (Ctrl+S)
          </CustomButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BookImageEditorDialog;
