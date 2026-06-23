import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import * as department from '../controllers/departmentController.js';

const router = express.Router();

router.use(protect);

router.get('/', department.getDepartments);
router.get('/:id', department.getDepartment);
router.post('/', authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  validate,
], department.createDepartment);
router.put('/:id', authorize('admin'), department.updateDepartment);
router.delete('/:id', authorize('admin'), department.deleteDepartment);

export default router;
