import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname n'existe pas en ESM → on le recrée
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${basename}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, PDF.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

const uploadAttachment = upload.single('attachment');

export const handleUpload = (req, res, next) => {
  uploadAttachment(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Fichier trop volumineux. Taille maximum : 10 MB.',
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};