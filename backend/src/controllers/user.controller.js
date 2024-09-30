import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from '../models/user.models.js';

import jwt from 'jsonwebtoken';

const registerUser = asyncHandler(async(req,res) =>{
    // res.status(200).json({
    //     message : "ok"
    // })
    const { email, password, fullname, role, status } = req.body;

  // Validate required fields
  if (!email || !password || !fullname || !role) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  // Create new user
  const user = new User({
    email,
    password,
    fullname,
    role,
    status
  });

  // Save user to database
  await user.save();

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save();

  // Send response with tokens
  res.status(200).json({
    message: 'User registered successfully.',
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      status: user.status
    },
    accessToken,
    refreshToken
  });

})

export {registerUser};