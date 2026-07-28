import { IMAGE_PRESETS, FALLBACK_IMAGES } from '../config/imageConfig';

/**
 * Transforms a raw image URL into a Cloudinary-optimized URL with format & quality params
 */
export const getCloudinaryUrl = (originalUrl, presetName = 'preview', customOptions = {}) => {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return FALLBACK_IMAGES.bookCover;
  }

  // Check if URL is from Cloudinary
  const isCloudinary = originalUrl.includes('cloudinary.com') || originalUrl.includes('res.cloudinary');
  if (!isCloudinary) {
    return originalUrl;
  }

  const preset = IMAGE_PRESETS[presetName] || IMAGE_PRESETS.preview;
  const width = customOptions.width || preset.width;
  const height = customOptions.height || preset.height;
  const crop = customOptions.crop || preset.crop;
  const format = customOptions.format || preset.format;
  const quality = customOptions.quality || preset.quality;

  const transformations = `w_${width},h_${height},c_${crop},f_${format},q_${quality}`;

  // Insert transformation into Cloudinary URL pattern: /upload/{transformations}/
  if (originalUrl.includes('/upload/')) {
    return originalUrl.replace('/upload/', `/upload/${transformations}/`);
  }

  return originalUrl;
};

/**
 * Asynchronously preloads an array of image URLs into browser memory
 */
export const preloadImages = (urls = []) => {
  if (!Array.isArray(urls)) return Promise.resolve();

  const promises = urls.map((url) => {
    return new Promise((resolve) => {
      if (!url) return resolve();
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });

  return Promise.all(promises);
};

export default {
  getCloudinaryUrl,
  preloadImages,
};
