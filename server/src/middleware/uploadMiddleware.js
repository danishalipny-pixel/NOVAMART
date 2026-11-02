import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Memory storage keeps file buffers in memory for direct stream upload to Cloudinary
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Unsupported file format: ${file.mimetype}. Allowed formats: JPEG, PNG, WebP, AVIF, GIF.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB per image
  }
});

export default upload;
