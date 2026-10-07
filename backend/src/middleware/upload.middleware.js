import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// File filter (academic submissions)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|docx|doc|zip|tar|gz|txt|py|js|java|cpp|c/i;
  const ext = path.extname(file.originalname).replace('.', '');
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not supported. Allowed formats: PDF, DOCX, ZIP, TXT, Code files.`));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter,
});
