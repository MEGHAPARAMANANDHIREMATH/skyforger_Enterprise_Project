import express from 'express';
import { protect } from '../middleware/auth.js';
import * as notification from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', notification.getNotifications);
router.put('/:id/read', notification.markAsRead);
router.put('/read-all', notification.markAllAsRead);
router.delete('/:id', notification.deleteNotification);

export default router;
