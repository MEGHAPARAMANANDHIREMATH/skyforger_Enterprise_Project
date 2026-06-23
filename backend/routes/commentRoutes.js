import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as comment from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', comment.getComments);
router.post('/', [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  validate,
], comment.addComment);
router.delete('/:id', comment.deleteComment);

export default router;
