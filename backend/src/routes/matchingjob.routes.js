import express from 'express';
import { fetchJobsForCandidate  } from '../controllers/fetchMatchingJobs.controller.js';

const router = express.Router();

// Define your route
router.get('/matching-jobs', async (req, res) => {
    const { userId } = req.query; // Extract userId from query parameters
    const commonId = 'cvsmart'; // Hardcode your commonId here or retrieve it from somewhere else

    // Check if userId is provided
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // Call the function with both commonId and userId
        const jobs = await fetchJobsForCandidate (commonId, userId);
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching matching jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
