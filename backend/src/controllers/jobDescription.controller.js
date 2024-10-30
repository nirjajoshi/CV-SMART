import { upload } from '../middlewares/multer.middleware.js';
import { User } from '../models/user.models.js';
import es from '../utils/elasticsearchClient.js';
import fs from 'fs';
import path from 'path';
import cloudinary from '../utils/cloudinary.js';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const addJobDescription = [
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { email, location, commonId, status } = req.body;
    const file = req.file;

    if (!file) {
      console.error('No file uploaded.');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const filePath = path.join(__dirname, '..', 'uploads', 'job_descriptions', file.filename);
      let cloudinaryUrl;

      try {
        // Upload file to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(filePath, {
          folder: 'job_descriptions',
          resource_type: 'auto',
        });
        cloudinaryUrl = cloudinaryResult.secure_url;

        // Prepare to send the uploaded file to get embeddings
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        // Fetch embeddings
        let embeddings;
        try {
          const response = await axios.post('http://localhost:5000/get-embedding', formData, {
            headers: formData.getHeaders(),
          });
          embeddings = response.data.embeddings[0];
          if (!Array.isArray(embeddings) || embeddings.length !== 384) {
            console.error('Invalid embeddings format:', embeddings);
            return res.status(500).json({ error: 'Invalid embeddings format.' });
          }
        } catch (err) {
          console.error('Error fetching embeddings from Flask:', err);
          return res.status(500).json({ error: 'Error fetching embeddings from Flask.', details: err.message });
        }

        // Clean up local file after upload
        fs.unlinkSync(filePath);

        // Check if a job description with the same commonId or file_name already exists
        const existingJob = await es.search({
          index: 'job_description_index',
          query: {
            bool: {
              must: [
                { match: { common_id: commonId } },
                { match: { file_name: file.originalname } }
              ]
            }
          }
        });

        const doc = {
          user_id: user._id.toString(),
          file_name: file.originalname,
          file_url: cloudinaryUrl,
          location,
          posted_date: new Date(),
          common_id: commonId,
          status,
          embeddings,
          cloudinary_url: cloudinaryUrl,
        };

        if (existingJob.hits.total.value > 0) {
          // Update the existing document
          const existingJobId = existingJob.hits.hits[0]._id;
          await es.update({
            index: 'job_description_index',
            id: existingJobId,
            body: { doc },
          });
          res.status(200).json({ message: 'Job description updated successfully!' });
        } else {
          // Index a new document if no existing job found
          const jobId = `${user._id.toString()}_${Date.now()}`;
          await es.index({
            index: 'job_description_index',
            id: jobId,
            body: doc,
          });
          res.status(200).json({ message: 'Job description and file added successfully!' });
        }
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ error: 'Error uploading file to Cloudinary.', details: err.message });
      }
    } catch (err) {
      console.error(`Error adding job description: ${err.message}`, err);
      res.status(500).json({ error: 'Error adding job description.', details: err.message });
    }
  }),
];
