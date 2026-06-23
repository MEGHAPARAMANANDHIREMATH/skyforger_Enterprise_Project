import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProfile } from '../config/multer.js';
import * as auth from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], auth.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], auth.login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
], auth.forgotPassword);

router.put('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], auth.resetPassword);

router.get('/me', protect, auth.getMe);
router.put('/profile', protect, uploadProfile.single('avatar'), auth.updateProfile);
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], auth.changePassword);

router.get('/users', protect, authorize('admin'), auth.getUsers);
router.put('/users/:id', protect, authorize('admin'), auth.updateUser);
router.delete('/users/:id', protect, authorize('admin'), auth.deleteUser);

export default router;
