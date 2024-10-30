// routes/jobRoutes.js
import { Router } from 'express';
import { addJobDescription } from '../controllers/jobDescription.controller.js';

const router = Router();

// Endpoint to add job description
router.post('/add_job_description',addJobDescription);

export default router;