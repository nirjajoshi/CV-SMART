import express from 'express';
import { fetchMatchingCandidates } from '../controllers/fetchMatchingCandidates.controller.js'; // Import the matching candidates controller

const router = express.Router();

// Define your route for fetching matching candidates
router.get('/matching-candidates', async (req, res) => {
    const { userId } = req.query; // Extract userId from query parameters
    const commonId = 'cvsmart'; // Hardcode your commonId here or retrieve it from somewhere else

    // Check if userId is provided
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // Call the function with both commonId and userId
        const candidates = await fetchMatchingCandidates(commonId, userId);
        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error fetching matching candidates:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
