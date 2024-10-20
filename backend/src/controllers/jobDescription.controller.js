import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import es from '../utils/elasticsearchClient.js';
import fs from 'fs';
import path from 'path';
import { upload } from '../middlewares/multer.middleware.js';
import axios from 'axios';
import FormData from 'form-data'; // Import FormData to handle multipart/form-data

// Define __dirname for ES modules
const __dirname = path.resolve();

const addJobDescription = [
  upload.single('file'), // Use multer middleware to handle single file upload
  asyncHandler(async (req, res) => {
    const { email, location } = req.body;
    const file = req.file;

    console.log('Received email:', email);
    
    try {
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const user = await User.findOne({ email });
      console.log('Found user:', user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const filePath = path.join(__dirname, 'uploads', 'job_descriptions', file.filename);
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

      const embeddings = response.data.embeddings[0]; // Access the first array

      // Ensure embeddings are of the correct dimension
      if (!Array.isArray(embeddings) || embeddings.length !== 384) { // Adjust based on the actual length
        console.error('Invalid embeddings received:', embeddings);
        return res.status(500).json({ error: 'Invalid embeddings format' });
      }

      const common_id = "cvsmart"; 

      // Create the document to be indexed in Elasticsearch
      const doc = {
        user_id: user._id.toString(), // Ensure this is a string for keyword type
        file_name: file.originalname,
        file_content: "Base64 or extracted content goes here", // If you're including file content
        location,
        posted_date: new Date(),
        common_id,
        embeddings: embeddings, // Use the embeddings received from the Flask server
      };

      await es.index({
        index: 'job_description_index',
        body: doc,
      });

      res.status(200).json({ message: 'Job Description and file added successfully!' });
    } catch (err) {
      console.error(`Error adding job description: ${err.message}`);
      res.status(500).json({ error: 'Error adding job description' });
    }
  })
];

export { addJobDescription };
