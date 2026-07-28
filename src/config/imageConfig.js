/**
 * Global Image Configuration & Performance Constants
 */

export const IMAGE_PRESETS = {
  thumbnail: { width: 120, height: 160, crop: 'fill', quality: 'auto', format: 'auto' },
  preview: { width: 300, height: 420, crop: 'fill', quality: 'auto', format: 'auto' },
  large: { width: 600, height: 800, crop: 'limit', quality: 'auto', format: 'auto' },
  full: { width: 1200, height: 1600, crop: 'limit', quality: 'auto', format: 'auto' },
  avatar: { width: 120, height: 120, crop: 'thumb', quality: 'auto', format: 'auto' },
};

export const FALLBACK_IMAGES = {
  bookCover:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%23F1F5F9"/><g transform="translate(110, 160)"><path d="M40 0H10C4.477 0 0 4.477 0 10V70C0 75.523 4.477 80 10 80H40C45.523 80 50 75.523 50 70V10C50 4.477 45.523 0 40 0ZM40 70H10V10H40V70Z" fill="%2394A3B8"/></g><text x="150" y="270" fill="%2364748B" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">No Cover Available</text></svg>',
  studentAvatar:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%23E2E8F0"/><circle cx="60" cy="45" r="22" fill="%2394A3B8"/><path d="M20 105C20 85 38 72 60 72C82 72 100 85 100 105" fill="%2394A3B8"/></svg>',
};

export const IMAGE_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
};

export default {
  IMAGE_PRESETS,
  FALLBACK_IMAGES,
  IMAGE_RETRY_CONFIG,
};
