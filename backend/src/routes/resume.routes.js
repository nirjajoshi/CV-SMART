import express from 'express';
import { addResume } from '../controllers/resume.contoller.js';

const router = express.Router();

// Route to upload and index resumes
router.post('/uploadResume',addResume);

export default router;