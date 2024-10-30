import express from 'express';
import { getJobs, updateJobStatus } from '../controllers/updatejobdescription.contoller.js';

const router = express.Router();

// Route to fetch all job descriptions
router.get('/jobs', getJobs);

// Route to update the status of a job description
router.put('/jobs/:id/status', updateJobStatus);

export default router;
