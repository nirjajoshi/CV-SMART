import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import es from '../utils/elasticsearchClient.js'; // Import Elasticsearch client
import { uploadResume } from '../middlewares/resume.middleware.js'; // Import resume multer config
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data'; // Import FormData to handle multipart/form-data
import cloudinary from '../utils/cloudinary.js'; // Import Cloudinary configuration

// Define __dirname for ES modules
const __dirname = path.resolve();

const addResume = [
  uploadResume.single('file'),
  asyncHandler(async (req, res) => {
    const { email, location } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No resume uploaded.' });
    }

    try {
      // Check if the user exists in MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const filePath = path.join(file.destination, file.filename);

      // Upload file to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(filePath, {
        folder: 'resumes',
        resource_type: 'raw',
      });

      // Manually construct the Cloudinary URL using the public ID
      const cloudinaryUrl = `https://res.cloudinary.com/dcra1zgrv/raw/upload/${cloudinaryResult.public_id}`;

      // Create FormData and append file for embedding
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post('http://localhost:5000/get-embedding', formData, {
        headers: { ...formData.getHeaders() },
      });
      const embeddings = response.data.embeddings[0];

      if (!Array.isArray(embeddings) || embeddings.length !== 384) {
        return res.status(500).json({ error: 'Invalid embeddings format' });
      }

      const common_id = "cvsmart";

      // Check if the resume already exists for this user in Elasticsearch
      const existingResume = await es.search({
        index: 'resume_index',
        body: {
          query: {
            match: { user_id: user._id.toString() }
          }
        }
      });

      // Prepare the document for Elasticsearch
      const doc = {
        user_id: user._id.toString(),
        file_name: file.originalname,
        file_type: file.mimetype,
        location,
        posted_date: new Date(),
        common_id,
        embeddings,
        cloudinary_url: cloudinaryUrl, // Use the constructed Cloudinary URL here
      };

      if (existingResume.hits.hits.length > 0) {
        // Document exists, update it
        const docId = existingResume.hits.hits[0]._id;
        await es.update({
          index: 'resume_index',
          id: docId,
          body: { doc }
        });
        res.status(200).json({ message: 'Resume updated successfully!' });
      } else {
        // Document doesn't exist, add a new one
        await es.index({
          index: 'resume_index',
          body: doc,
        });
        res.status(200).json({ message: 'Resume added successfully!' });
      }
    } catch (err) {
      console.error(`Error adding resume: ${err.message}`);
      res.status(500).json({ error: 'Error adding resume' });
    }
  })
];

export { addResume };
