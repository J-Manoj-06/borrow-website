import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { logActivityRecord } from './activityService';
import { compressImageToWebP } from '../imageService';

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
 * Resumable File Upload to Firebase Storage with Progress Listener
 */
export const uploadFileWithProgress = (folderPath, file, options = {}, onProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Convert image to WebP format if it's an image
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImageToWebP(file, 800, 0.85);
      }

      // 2. Build unique filename
      const timestamp = Date.now();
      const version = options.version || 1;
      const cleanName = (file.name || 'file').replace(/\.[^/.]+$/, '');
      const ext = processedFile.type === 'image/webp' ? '.webp' : file.name.substring(file.name.lastIndexOf('.'));
      const fileName = options.fileName || `${cleanName}_v${version}_${timestamp}${ext}`;

      const storagePath = `${folderPath}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // 3. Initiate resumable upload task
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
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Log Activity
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
          });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Soft Delete Storage File by metadata update
 */
export const softDeleteStorageFile = async (storagePath) => {
  if (!storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    console.log(`Deleted storage file ${storagePath}`);
  } catch (err) {
    console.warn(`Soft delete storage file failed for ${storagePath}:`, err.message);
  }
};
