import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

export const sendNotification = async (io, recipientId, notification) => {
  if (io && recipientId) {
    io.to(recipientId.toString()).emit('notification', notification);
  }
};

export const updateProjectProgress = async (Project, Task, projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) return;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = Math.round((completed / tasks.length) * 100);
  const status = progress === 100 ? 'completed' : progress > 0 ? 'active' : undefined;
  const update = { progress };
  if (status) update.status = status;
  await Project.findByIdAndUpdate(projectId, update);
};
