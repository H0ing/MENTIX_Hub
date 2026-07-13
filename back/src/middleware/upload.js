import multer from 'multer';
import path from 'path';
import AppError from '../utils/AppError.js';
import {
  avatarStorage as cloudAvatarStorage,
  projectImageStorage as cloudProjectImageStorage,
  projectFileStorage as cloudProjectFileStorage,
} from './cloudinaryStorage.js';

function imageFilter(req, file, cb) {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp).', 400), false);
  }
}

function projectFileFilter(req, file, cb) {
  // Only allow ZIP files
  const allowedMimes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip'
  ];
  
  const allowedExtensions = ['.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only ZIP files are allowed.', 400), false);
  }
}

export const uploadAvatar = multer({
  storage: cloudAvatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('avatar');

export const uploadProjectImage = multer({
  storage: cloudProjectImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).single('image');

export const uploadProjectFile = multer({
  storage: cloudProjectFileStorage,
  fileFilter: projectFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
}).single('file');