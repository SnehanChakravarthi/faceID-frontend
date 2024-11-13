import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to compress images
export async function compressImage(dataUrl: string): Promise<Blob> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  const MAX_WIDTH = 1024; // Adjusted max width
  const MAX_HEIGHT = 1024; // Adjusted max height

  let { width, height } = img;

  if (width > height) {
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = Math.round((width * MAX_HEIGHT) / height);
      height = MAX_HEIGHT;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.95 // Adjusted compression quality
    );
  });
}
