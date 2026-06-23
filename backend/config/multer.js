import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

['profiles', 'projects', 'documents'].forEach((folder) => {
  ensureDir(path.join(uploadsRoot, folder));
});

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsRoot, folder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype === 'application/pdf' ||
    file.mimetype.includes('document') || file.mimetype.includes('spreadsheet') ||
    file.mimetype === 'text/plain' || file.mimetype === 'application/zip';
  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const uploadProfile = multer({
  storage: storage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const uploadProject = multer({
  storage: storage('projects'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const uploadDocument = multer({
  storage: storage('documents'),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter,
});

export const uploadsRootPath = uploadsRoot;
