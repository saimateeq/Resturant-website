import fs from 'fs/promises';
import cloudinary from '../config/cloudinary.js';

export async function uploadImage(localPath, folder = 'savoria') {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } finally {
    await fs.unlink(localPath).catch(() => {});
  }
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId).catch(() => {});
}
