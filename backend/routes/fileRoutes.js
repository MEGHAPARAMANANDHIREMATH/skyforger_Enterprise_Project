import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadDocument } from '../config/multer.js';
import * as file from '../controllers/fileController.js';

const router = express.Router();

router.use(protect);

router.get('/', file.getFiles);
router.post('/upload', uploadDocument.single('file'), file.uploadFile);
router.delete('/:id', file.deleteFile);

export default router;
