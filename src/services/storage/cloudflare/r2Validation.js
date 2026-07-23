/**
 * Cloudflare R2 Upload Validation & Path Sanitization Utilities
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate image file constraints before upload
 */
export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('No file provided for upload validation.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(`Invalid file type (${file.type}). Allowed formats: JPG, PNG, WebP, GIF, PDF.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum limit of 5 MB.`);
  }

  return true;
};

/**
 * Sanitize filename to prevent directory traversal & invalid S3 characters
 */
export const sanitizeFilename = (filename = '') => {
  return filename
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
};

/**
 * Production File Naming & Path Generation Strategy
 * Structure:
 *   - books/{bookId}/{timestamp}_{sanitized_filename}.webp
 *   - users/{userId}/{timestamp}_avatar.webp
 *   - categories/{categoryId}/{timestamp}_cover.webp
 */
export const generateR2StoragePath = ({
  category = 'books',
  entityId = 'common',
  filename = 'image.webp',
}) => {
  const timestamp = Date.now();
  const cleanName = sanitizeFilename(filename);
  return `${category}/${entityId}/${timestamp}_${cleanName}`;
};
