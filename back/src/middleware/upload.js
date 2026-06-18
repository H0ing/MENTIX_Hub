import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateFilename(prefix, file) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname).toLowerCase();
  return `${prefix}_${timestamp}_${random}${ext}`;
}

const avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function(req, file, cb) {
    cb(null, generateFilename('avatar', file));
  }
});

const projectImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/projects'));
  },
  filename: function(req, file, cb) {
    cb(null, generateFilename('project', file));
  }
});

const projectFileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/projects'));
  },
  filename: function(req, file, cb) {
    cb(null, generateFilename('file', file));
  }
});

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
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('avatar');

export const uploadProjectImage = multer({
  storage: projectImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).single('image'); // Changed from .array('images', 10) to .single('image')

export const uploadProjectFile = multer({
  storage: projectFileStorage,
  fileFilter: projectFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
}).single('file');