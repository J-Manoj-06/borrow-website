import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { logActivityRecord } from './activityService';
import { compressImageToWebP } from '../imageService';
import { uploadImage, deleteImage, isR2Configured } from '../storage/cloudflare/r2StorageService';

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
 * Upload File with Progress - Routes to Cloudflare R2 when configured, with Firebase Storage fallback
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

      // Simulate progress callback
      if (onProgress) {
        onProgress({ progress: 25, bytesTransferred: Math.round(processedFile.size * 0.25), totalBytes: processedFile.size });
      }

      // 3. Attempt Cloudflare R2 Upload
      const category = folderPath.split('/')[0] || 'books';
      const entityId = folderPath.split('/')[1] || 'general';

      const r2Result = await uploadImage(processedFile, {
        category,
        entityId,
        filename: fileName,
      }).catch((r2Err) => {
        console.warn('Cloudflare R2 primary upload fallback to Firebase Storage:', r2Err);
        return null;
      });

      if (onProgress) {
        onProgress({ progress: 75, bytesTransferred: Math.round(processedFile.size * 0.75), totalBytes: processedFile.size });
      }

      if (r2Result && r2Result.url) {
        if (onProgress) {
          onProgress({ progress: 100, bytesTransferred: processedFile.size, totalBytes: processedFile.size });
        }

        // Log Activity
        logActivityRecord({
          user: 'Librarian',
          action: `uploaded media file "${fileName}" to Cloudflare R2 Storage`,
          target: fileName,
          type: 'system',
        }).catch(console.warn);

        resolve({
          downloadURL: r2Result.url,
          storagePath: r2Result.key,
          fileName,
          size: processedFile.size,
          contentType: processedFile.type,
          version,
          provider: 'Cloudflare R2',
        });
        return;
      }

      // Fallback: Initiate Firebase Storage upload task if R2 is not configured
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
            action: `uploaded media file "${fileName}" to Storage`,
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
 * Soft Delete Storage File (Purges from R2 and Firebase Storage)
 */
export const softDeleteStorageFile = async (storagePathOrUrl) => {
  if (!storagePathOrUrl) return;

  try {
    // 1. Purge from Cloudflare R2
    await deleteImage(storagePathOrUrl).catch((err) => {
      console.warn('Cloudflare R2 file deletion warning:', err);
    });

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
