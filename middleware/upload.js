import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';

// Configure multer for memory storage (will upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP) are allowed', HTTP_STATUS.BAD_REQUEST));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter
});

export default upload;
