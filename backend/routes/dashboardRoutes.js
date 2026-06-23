import express from 'express';
import { protect } from '../middleware/auth.js';
import * as dashboard from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', dashboard.getDashboardStats);
router.get('/employee', dashboard.getEmployeeDashboard);

export default router;
