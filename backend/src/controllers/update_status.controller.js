import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId, status } = req.body; // Assuming you send userId and status with the request

  // Find the user by their ID and update their status
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Send a response indicating success along with the updated user
  res.status(200).json({
    message: 'Status updated successfully.',
    user: {
      id: user._id,
      email: user.email,
      status: user.status,
    },
  });
});

export { updateUserStatus };
