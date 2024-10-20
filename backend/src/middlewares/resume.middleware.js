import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define __dirname for ES modules
const __dirname = path.resolve();

// Set the path for the uploads folder
const uploadDir = path.join(__dirname, 'uploads', 'resumes');

// Check if the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Set the destination folder
  },
  filename: (req, file, cb) => {
    // Keep the original filename
    cb(null, file.originalname); // Save with the original filename
  },
});

// Create the multer instance
const uploadResume = multer({ storage });
export { uploadResume };
