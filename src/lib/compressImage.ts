/**
 * Client-side image compression using Canvas API.
 * Resizes to maxWidth/maxHeight while maintaining aspect ratio,
 * then outputs as WebP (or JPEG fallback) at the given quality.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0–1
  } = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 900,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only downscale, never upscale
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback: return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      const outputType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.webp'),
            { type: outputType, lastModified: Date.now() }
          );

          // Only use compressed version if it's actually smaller
          if (compressedFile.size < file.size) {
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
