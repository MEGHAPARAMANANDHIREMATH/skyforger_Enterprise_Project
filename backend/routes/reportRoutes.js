import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as report from '../controllers/reportController.js';

const router = express.Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/', report.getReports);
router.post('/employee', report.generateEmployeeReport);
router.post('/project', report.generateProjectReport);
router.post('/productivity', report.generateProductivityReport);
router.delete('/:id', report.deleteReport);

export default router;
