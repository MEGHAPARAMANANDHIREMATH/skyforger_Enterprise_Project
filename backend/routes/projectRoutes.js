import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProject } from '../config/multer.js';
import * as project from '../controllers/projectController.js';

const router = express.Router();

router.use(protect);

router.get('/', project.getProjects);
router.get('/:id', project.getProject);
router.get('/:id/timeline', project.getProjectTimeline);
router.post('/', authorize('admin', 'manager'), uploadProject.single('coverImage'), [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  validate,
], project.createProject);
router.put('/:id', authorize('admin', 'manager'), uploadProject.single('coverImage'), project.updateProject);
router.delete('/:id', authorize('admin', 'manager'), project.deleteProject);
router.put('/:id/team', authorize('admin', 'manager'), project.assignTeamMembers);

export default router;
