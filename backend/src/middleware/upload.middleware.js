import multer from 'multer';
import path from 'path';

// Allowed MIME types and extensions for academic submissions
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

// Reasonable max file size: 15 MB
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isExtValid = ALLOWED_EXTENSIONS.has(ext);
  const isMimeValid = ALLOWED_MIME_TYPES.has(mime) || mime === 'application/octet-stream';

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file format "${ext}". Only PDF, DOC, and DOCX documents are permitted for assignment submission.`
    );
    error.status = 400;
    cb(error);
  }
};

// Use memoryStorage so file buffer is directly streamable to Supabase Storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});
