import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProfile } from '../config/multer.js';
import * as employee from '../controllers/employeeController.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'manager'), employee.getEmployees);
router.get('/:id', employee.getEmployee);
router.get('/:id/metrics', employee.getEmployeeMetrics);
router.post('/', authorize('admin'), uploadProfile.single('profileImage'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  validate,
], employee.createEmployee);
router.put('/:id', authorize('admin'), uploadProfile.single('profileImage'), employee.updateEmployee);
router.delete('/:id', authorize('admin'), employee.deleteEmployee);

export default router;
