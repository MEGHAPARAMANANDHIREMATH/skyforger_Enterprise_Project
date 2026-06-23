import File from '../models/File.js';
import Task from '../models/Task.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const category = req.body.category || 'document';
  const folder = category === 'profile' ? 'profiles' : category === 'project' ? 'projects' : 'documents';

  const file = await File.create({
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: `/uploads/${folder}/${req.file.filename}`,
    mimetype: req.file.mimetype,
    size: req.file.size,
    category,
    uploadedBy: req.user._id,
    relatedTo: req.body.relatedModel ? { model: req.body.relatedModel, id: req.body.relatedId } : undefined,
  });

  if (req.body.taskId) {
    await Task.findByIdAndUpdate(req.body.taskId, { $push: { attachments: file._id } });
  }

  res.status(201).json({ success: true, data: file });
};

export const getFiles = async (req, res) => {
  const { category, relatedModel, relatedId } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (relatedModel && relatedId) filter['relatedTo.model'] = relatedModel;
  if (relatedId) filter['relatedTo.id'] = relatedId;
  const files = await File.find(filter).populate('uploadedBy', 'name').sort('-createdAt');
  res.json({ success: true, count: files.length, data: files });
};

export const deleteFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ success: false, message: 'File not found' });
  const fullPath = path.join(process.cwd(), file.path.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  await Task.updateMany({ attachments: file._id }, { $pull: { attachments: file._id } });
  await file.deleteOne();
  res.json({ success: true, message: 'File deleted' });
};
