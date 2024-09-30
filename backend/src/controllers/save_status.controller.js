import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';

// Function to save user updates
const saveUserUpdates = asyncHandler(async (req, res) => {
  const { userId, email, status } = req.body; // Assuming you send userId, email, and status with the request

  // Find the user by their ID and update their details
  const user = await User.findByIdAndUpdate(
    userId,
    { email, status }, // You can add more fields as needed
    { new: true } // Return the updated document
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Send a response indicating success along with the updated user
  res.status(200).json({
    message: 'User details updated successfully.',
    user: {
      id: user._id,
      email: user.email,
      status: user.status,
    },
  });
});

export { saveUserUpdates };
