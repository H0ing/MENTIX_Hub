import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const FOLDERS = {
  AVATARS: 'uploads/avatars',
  DEFAULT_COVERS: 'uploads/default-covers',
  PROJECTS: 'uploads/projects',
  BACKUPS: 'backups',
};

export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDERS.AVATARS,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

export const projectImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDERS.PROJECTS,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, quality: 'auto' }],
  },
});

export const projectFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDERS.PROJECTS,
    resource_type: 'raw',
  },
});

export const backupStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDERS.BACKUPS,
    resource_type: 'raw',
    allowed_formats: ['sql', 'csv'],
  },
});

export const cloudinaryFolders = FOLDERS;
