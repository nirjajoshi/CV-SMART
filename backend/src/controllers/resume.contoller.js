import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import es from '../utils/elasticsearchClient.js';  // Import Elasticsearch client
import { uploadResume } from '../middlewares/resume.middleware.js';  // Import resume multer config
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data'; // Import FormData to handle multipart/form-data

// Define __dirname for ES modules
const __dirname = path.resolve();

const addResume = [
  uploadResume.single('file'),  // Use multer middleware to handle single file upload for resumes
  asyncHandler(async (req, res) => {
    const { email, location } = req.body;  // Extract email and location from request body
    const file = req.file;  // File info from multer

    console.log('Received email:', email);

    try {
      if (!file) {
        return res.status(400).json({ error: 'No resume uploaded.' });
      }

      const user = await User.findOne({ email });
      console.log('Found user:', user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const filePath = path.join(__dirname, 'uploads', 'resumes', file.filename);
      console.log('File path:', filePath);
      
      // Attempt to read the file to ensure it's accessible
      try {
        fs.accessSync(filePath); // This will throw if the file is not accessible
        console.log(`Successfully accessed file at ${filePath}`);
      } catch (err) {
        console.error(`Error accessing file: ${err.message}`);
        return res.status(500).json({ error: 'File access error' });
      }

      // Create a FormData instance and append the file
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath)); // Send the file stream

      // Get embeddings from the Flask server
      const response = await axios.post('http://localhost:5000/get-embedding', formData, {
        headers: formData.getHeaders() // Set the correct headers for multipart/form-data
      });

      const embeddings = response.data.embeddings[0];

      // Ensure embeddings are of the correct dimension
      if (!Array.isArray(embeddings) || embeddings.length !== 384) { // Change to 384 based on the model used
        console.error('Invalid embeddings received:', embeddings);
        return res.status(500).json({ error: 'Invalid embeddings format' });
      }

      const common_id = "cvsmart"; 

      // Create the document to be indexed in Elasticsearch
      const doc = {
        user_id: user._id.toString(), // Ensure this is a string for keyword type
        file_name: file.originalname,
        file_path: `uploads/resumes/${file.filename}`,  // Save the file path
        file_type: file.mimetype,
        location,
        posted_date: new Date(),
        common_id,
        embeddings: embeddings, // Use the embeddings received from the Flask server
      };

      // Index the resume document in Elasticsearch
      await es.index({
        index: 'resume_index', 
        body: doc,
      });

      res.status(200).json({ message: 'Resume and file added successfully!' });
    } catch (err) {
      console.error(`Error adding resume: ${err.message}`);
      res.status(500).json({ error: 'Error adding resume' });
    }
  })
];

export { addResume };
