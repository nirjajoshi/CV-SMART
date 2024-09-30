import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Validate password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Generate access token
  const accessToken = user.generateAccessToken();

  // Send response with user details and access token
  res.status(200).json({
    message: 'Login successful.',
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      status: user.status,
    },
    accessToken,
  });
});

export { loginUser };
