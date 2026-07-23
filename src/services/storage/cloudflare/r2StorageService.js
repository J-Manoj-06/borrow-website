/**
 * Cloudflare R2 Reusable Storage Service
 */

import { getR2Config, isR2Configured } from './r2Config';
import {
  validateImageFile,
  generateR2StoragePath,
  sanitizeFilename,
} from './r2Validation';

/**
 * Generate public CDN / R2 URL for a given object key
 */
export const generatePublicUrl = (objectKey = '') => {
  if (!objectKey) return '';
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey;
  }
  const config = getR2Config();
  const cleanDomain = config.publicDomain.replace(/\/+$/, '');
  const cleanKey = objectKey.replace(/^\/+/, '');
  return `${cleanDomain}/${cleanKey}`;
};

/**
 * Validate image file
 */
export const validateImage = (file) => {
  return validateImageFile(file);
};

/**
 * Upload image file to Cloudflare R2 bucket
 */
export const uploadImage = async (file, pathOptions = {}) => {
  validateImageFile(file);

  const config = getR2Config();
  const storagePath = generateR2StoragePath({
    category: pathOptions.category || 'books',
    entityId: pathOptions.entityId || 'general',
    filename: pathOptions.filename || file.name,
  });

  if (!isR2Configured()) {
    console.warn('Cloudflare R2 is not fully configured in environment variables. Returning mock R2 path.');
    return {
      success: true,
      key: storagePath,
      url: generatePublicUrl(storagePath),
      mock: true,
    };
  }

  try {
    // Infrastructure preparation for S3 PutObject request to Cloudflare R2 S3 Endpoint
    const targetUrl = `${config.s3Endpoint}/${config.bucketName}/${storagePath}`;

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`R2 HTTP ${response.status}: ${response.statusText}`);
    }

    const publicUrl = generatePublicUrl(storagePath);

    return {
      success: true,
      key: storagePath,
      url: publicUrl,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Cloudflare R2 uploadImage error:', err);
    throw new Error(`Cloudflare R2 upload failed: ${err.message || 'Network error'}`);
  }
};

/**
 * Delete image file from Cloudflare R2 bucket
 */
export const deleteImage = async (fileUrlOrKey = '') => {
  if (!fileUrlOrKey) return true;

  const config = getR2Config();
  const objectKey = fileUrlOrKey.replace(config.publicDomain, '').replace(/^\/+/, '');

  if (!isR2Configured()) {
    console.warn(`Mock R2 deletion for key: ${objectKey}`);
    return true;
  }

  try {
    const targetUrl = `${config.s3Endpoint}/${config.bucketName}/${objectKey}`;
    const response = await fetch(targetUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`R2 HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (err) {
    console.error('Cloudflare R2 deleteImage error:', err);
    throw new Error(`Cloudflare R2 deletion failed: ${err.message}`);
  }
};

/**
 * Replace existing image with a new upload (Delete old + Upload new)
 */
export const replaceImage = async (oldFileUrlOrKey, newFile, pathOptions = {}) => {
  validateImageFile(newFile);

  // Upload new image first to prevent data loss if upload fails
  const uploadResult = await uploadImage(newFile, pathOptions);

  // Safely delete old image after successful new upload
  if (oldFileUrlOrKey) {
    deleteImage(oldFileUrlOrKey).catch((err) => {
      console.warn('Failed to cleanup old R2 image after replacement:', err);
    });
  }

  return uploadResult;
};

export default {
  uploadImage,
  deleteImage,
  replaceImage,
  generatePublicUrl,
  validateImage,
};
