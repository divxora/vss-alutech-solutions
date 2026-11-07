import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed extensions for engineering blueprints, CAD dies & spec sheets
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.dwg',
  '.dxf',
  '.step',
  '.stp',
  '.iges',
  '.igs',
  '.zip',
  '.rar',
  '.png',
  '.jpg',
  '.jpeg',
  '.doc',
  '.docx',
  '.xlsx',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename and prepend timestamp
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const quoteUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: "${ext}". Please upload engineering drawings (PDF, DWG, DXF, STEP, IGES, ZIP, PNG, JPG).`
        )
      );
    }
  },
});
