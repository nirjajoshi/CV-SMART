import express from 'express';
import { User } from '../models/user.models.js';

const router = express.Router();

// Route to get user_id based on email
router.get('/get-user-id', async (req, res) => {
    const { email } = req.query; // Get email from query parameters

    try {
        // Fetch user based on email and return the _id
        const user = await User.findOne({ email }).select('_id'); // Fetch _id based on email
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ userId: user._id }); // Return userId in response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
