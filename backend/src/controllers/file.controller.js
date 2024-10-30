// controllers/file.controller.js
import path from 'path';
import fs from 'fs';

export const viewFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'job_descriptions', filename); // Adjust path as necessary

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Set the correct content type based on the file extension
  const fileExtension = path.extname(filename).toLowerCase();
  let contentType;

  switch (fileExtension) {
    case '.pdf':
      contentType = 'application/pdf';
      break;
    case '.doc':
      contentType = 'application/msword';
      break;
    case '.docx':
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    default:
      return res.status(400).send('Invalid file type');
  }

  // Send the file
  res.set('Content-Type', contentType);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File send error:', err);
      res.status(err.status).end();
    }
  });
};
