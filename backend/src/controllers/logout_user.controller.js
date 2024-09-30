// logout.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';

const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.body; // Assuming you send userId with the logout request

  // Optional: Clear refresh token from the database
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  // Send a response indicating success
  res.status(200).json({ message: 'Logout successful.' });
});

export { logoutUser };