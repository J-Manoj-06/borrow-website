import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { logActivityRecord } from './activityService';
import { compressImageToWebP } from '../imageService';
import { uploadImageToCloudinary, deleteCloudinaryImage } from '../cloudinaryService';

/**
 * Generate Multi-Resolution WebP Thumbnails (Small, Medium, Large)
 */
export const generateMultiResolutionThumbnails = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    return { small: null, medium: null, large: null };
  }

  try {
    const smallBlob = await compressImageToWebP(file, 160, 0.75);
    const mediumBlob = await compressImageToWebP(file, 400, 0.8);
    const largeBlob = await compressImageToWebP(file, 800, 0.85);

    return {
      small: smallBlob,
      medium: mediumBlob,
      large: largeBlob,
    };
  } catch (err) {
    console.warn('Thumbnail generation warning:', err);
    return { small: null, medium: null, large: null };
  }
};

/**
 * Upload File with Progress - Uses Cloudinary as primary image storage provider
 */
export const uploadFileWithProgress = (folderPath, file, options = {}, onProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      // If it's an image, attempt Cloudinary upload first
      if (file.type.startsWith('image/')) {
        try {
          const res = await uploadImageToCloudinary(file, folderPath, onProgress);

          const fileName = file.name || 'image.webp';
          logActivityRecord({
            user: 'Librarian',
            action: `uploaded media file "${fileName}" to Cloudinary Storage`,
            target: fileName,
            type: 'system',
          }).catch(console.warn);

          resolve({
            downloadURL: res.secure_url,
            storagePath: res.public_id,
            fileName,
            size: res.bytes || file.size,
            contentType: file.type,
            provider: 'Cloudinary',
          });
          return;
        } catch (cloudinaryErr) {
          console.warn('Cloudinary upload warning, using Firebase Storage fallback:', cloudinaryErr.message);
        }
      }

      // Fallback: Firebase Storage upload task
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImageToWebP(file, 800, 0.85);
      }

      const timestamp = Date.now();
      const version = options.version || 1;
      const cleanName = (file.name || 'file').replace(/\.[^/.]+$/, '');
      const ext = processedFile.type === 'image/webp' ? '.webp' : file.name.substring(file.name.lastIndexOf('.'));
      const fileName = options.fileName || `${cleanName}_v${version}_${timestamp}${ext}`;

      const storagePath = `${folderPath}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, processedFile, {
        contentType: processedFile.type,
        customMetadata: {
          originalName: file.name,
          version: String(version),
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              state: snapshot.state,
            });
          }
        },
        (error) => {
          console.error('Firebase Storage upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          logActivityRecord({
            user: 'Librarian',
            action: `uploaded media file "${fileName}" to Firebase Storage`,
            target: fileName,
            type: 'system',
          }).catch(console.warn);

          resolve({
            downloadURL,
            storagePath,
            fileName,
            size: processedFile.size,
            contentType: processedFile.type,
            version,
            provider: 'Firebase Storage',
          });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Soft Delete Storage File (Purges from Cloudinary and Firebase Storage)
 */
export const softDeleteStorageFile = async (storagePathOrUrl) => {
  if (!storagePathOrUrl) return;

  try {
    // 1. Purge from Cloudinary
    await deleteCloudinaryImage(storagePathOrUrl).catch(console.warn);

    // 2. Purge from Firebase Storage if it's a Firebase Storage path
    if (!storagePathOrUrl.startsWith('http')) {
      const fileRef = ref(storage, storagePathOrUrl);
      await deleteObject(fileRef).catch(console.warn);
    }

    console.log(`Deleted storage file ${storagePathOrUrl}`);
  } catch (err) {
    console.warn(`Soft delete storage file failed for ${storagePathOrUrl}:`, err.message);
  }
};
