import express from 'express';
import {
  registerUser,
  authUser,
  getMe,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;