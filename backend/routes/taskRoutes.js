import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import * as task from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

router.get('/', task.getTasks);
router.get('/kanban/:projectId', task.getKanbanBoard);
router.put('/kanban/:projectId/bulk', task.bulkUpdateKanban);
router.get('/:id', task.getTask);
router.post('/', authorize('admin', 'manager'), [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project is required'),
  validate,
], task.createTask);
router.put('/:id', task.updateTask);
router.patch('/:id/status', task.updateTaskStatus);
router.delete('/:id', authorize('admin', 'manager'), task.deleteTask);

export default router;
