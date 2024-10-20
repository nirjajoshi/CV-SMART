import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import{es}from '../utils/elasticsearchClient'

// Get the directory name for the current module (since __dirname is not available in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getJobFile = async (req, res) => {
    try {
      const userId = req.params.id;  // Use the user_id to fetch the job description
  
      // Query Elasticsearch for the job description data using the user_id as the document ID
      const { body } = await es.get({
        index: 'job_description_index',
        id: userId
      });
  
      const jobData = body._source;
      const fileName = jobData.file_name;  // The file name stored in Elasticsearch
  
      // Construct the file path to locate the stored job description file
      const filePath = path.join(__dirname, '..', 'uploads', 'jobdescription', fileName);
  
      // Check if the file exists on the file system
      if (fs.existsSync(filePath)) {
        // Determine the appropriate MIME type for the file based on the extension
        const fileExtension = path.extname(fileName).toLowerCase();
        let mimeType;
  
        if (fileExtension === '.pdf') {
          mimeType = 'application/pdf';
        } else if (fileExtension === '.docx') {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else {
          mimeType = 'application/octet-stream'; // Generic binary for unknown types
        }
  
        // Send the file to the client
        res.setHeader('Content-Type', mimeType);
        return res.sendFile(filePath);  // Stream the file for download/viewing
      } else {
        return res.status(404).json({ message: 'File not found' });
      }
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ message: 'Error retrieving file and location' });
    }
  };;
