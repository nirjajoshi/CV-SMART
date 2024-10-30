// resume.middleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a base uploads directory
const baseUploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');

// Function to ensure the base upload directory exists
const ensureBaseDirectoryExists = () => {
  if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
  }
};

// Create a unique subdirectory for each upload
const createUniqueUploadDir = () => {
  const timestamp = Date.now(); // Unique timestamp for folder name
  const uploadDir = path.join(baseUploadsDir, `upload_${timestamp}`);
  
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the unique upload directory
  return uploadDir;
};

// Allowed file types: PDF, DOC, DOCX
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Ensure the base directory exists when the module is loaded
ensureBaseDirectoryExists();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = createUniqueUploadDir(); // Create and use a unique upload directory
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Keep original filename with timestamp
  },
});

export const uploadResume = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  },
});
