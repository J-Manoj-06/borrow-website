import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';

import { getCloudinaryUrl } from '../../utils/imageUtils';
import { FALLBACK_IMAGES, IMAGE_RETRY_CONFIG } from '../../config/imageConfig';

export const SmartImage = ({
  src,
  alt = 'Image',
  preset = 'preview',
  fallbackType = 'bookCover', // 'bookCover' | 'studentAvatar'
  width,
  height,
  borderRadius = '8px',
  objectFit = 'cover',
  sx = {},
  onClick,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [displaySrc, setDisplaySrc] = useState('');

  const fallbackUrl = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.bookCover;

  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);

    const optimized = getCloudinaryUrl(src, preset);
    setDisplaySrc(optimized || fallbackUrl);
  }, [src, preset, fallbackType]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    if (retryCount < IMAGE_RETRY_CONFIG.maxRetries) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        // Force refresh query parameter
        setDisplaySrc(`${getCloudinaryUrl(src, preset)}?retry=${retryCount + 1}`);
      }, IMAGE_RETRY_CONFIG.retryDelayMs);
    } else {
      setLoading(false);
      setError(true);
      setDisplaySrc(fallbackUrl);
    }
  };

  const handleManualRetry = (e) => {
    e.stopPropagation();
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setDisplaySrc(`${getCloudinaryUrl(src, preset)}?retry=${Date.now()}`);
  };

  return (
    <Box
      onClick={onClick}
      className={className}
      sx={{
        position: 'relative',
        width: width || '100%',
        height: height || '100%',
        borderRadius,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      {...props}
    >
      {/* Animated Skeleton Loader while fetching */}
      {loading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: '#E2E8F0',
          }}
        />
      )}

      {/* Main Image with Progressive Fade-In */}
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.25s ease-in-out',
          display: 'block',
        }}
      />

      {/* Error Fallback Retry Overlay */}
      {error && !loading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            zIndex: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '50%',
          }}
        >
          <IconButton size="small" onClick={handleManualRetry} title="Retry loading image" sx={{ color: '#FFFFFF', p: 0.5 }}>
            <RefreshIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default SmartImage;
