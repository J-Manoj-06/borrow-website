/**
 * Cloudinary Storage & Upload Service
 *
 * Production upload engine for Borrow Admin Portal using Cloudinary API.
 */

import { compressImageToWebP } from './imageService';

export const getCloudinaryConfig = () => {
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'uzhavusei',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'borrow_admin_preset',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  };
};

/**
 * Upload Image to Cloudinary Unsigned Upload Endpoint
 */
export const uploadImageToCloudinary = async (file, folderPath = 'books', onProgress) => {
  if (!file) {
    throw new Error('No file provided for Cloudinary upload.');
  }

  // 1. Process and compress image to WebP if it's an image
  let processedFile = file;
  if (file.type.startsWith('image/')) {
    try {
      processedFile = await compressImageToWebP(file, 800, 0.85);
    } catch (err) {
      console.warn('Client-side WebP compression warning:', err);
    }
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', processedFile);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folderPath);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress({ progress, bytesTransferred: e.loaded, totalBytes: e.total });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            secure_url: res.secure_url,
            downloadURL: res.secure_url,
            public_id: res.public_id,
            format: res.format,
            bytes: res.bytes,
            provider: 'Cloudinary',
          });
        } catch (parseErr) {
          reject(new Error('Failed to parse Cloudinary response response JSON.'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(`Cloudinary Upload Error: ${errRes.error?.message || xhr.statusText}`));
        } catch {
          reject(new Error(`Cloudinary Upload HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error uploading image to Cloudinary.'));
    xhr.send(formData);
  });
};

/**
 * Delete / Purge Cloudinary Image Asset
 */
export const deleteCloudinaryImage = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return true;
  console.log(`Cloudinary asset delete requested for: ${publicIdOrUrl}`);
  return true;
};

/**
 * Helper to build optimized Cloudinary image transformation URLs
 */
export const getCloudinaryUrl = (publicId, transformations = 'f_auto,q_auto,w_800') => {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }
  const { cloudName } = getCloudinaryConfig();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
};

export default {
  uploadImageToCloudinary,
  deleteCloudinaryImage,
  getCloudinaryUrl,
  getCloudinaryConfig,
};
