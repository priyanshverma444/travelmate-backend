import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

// @desc    Register new user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user (protected)
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// @desc    Request password reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${email}`;

  const message = `You requested a password reset. Click the link below:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

  await sendEmail({
    to: email,
    subject: 'TravelMate - Password Reset',
    text: message,
  });

  res.json({ message: 'Password reset link sent to your email.' });
});

// @desc    Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email,
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});