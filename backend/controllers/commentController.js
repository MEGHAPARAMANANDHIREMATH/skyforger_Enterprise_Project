import TaskComment from '../models/TaskComment.js';
import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../utils/helpers.js';

export const getComments = async (req, res) => {
  const comments = await TaskComment.find({ task: req.params.taskId })
    .populate('user', 'name avatar role')
    .sort('createdAt');
  res.json({ success: true, count: comments.length, data: comments });
};

export const addComment = async (req, res) => {
  const io = req.app.get('io');
  const task = await Task.findById(req.params.taskId).populate('assignedTo');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  const comment = await TaskComment.create({
    task: req.params.taskId,
    user: req.user._id,
    content: req.body.content,
  });
  const populated = await TaskComment.findById(comment._id).populate('user', 'name avatar role');

  if (task.assignedTo) {
    const employee = await Employee.findById(task.assignedTo).populate('user');
    if (employee?.user && employee.user._id.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: employee.user._id,
        sender: req.user._id,
        type: 'comment',
        title: 'New Comment on Task',
        message: `${req.user.name} commented on "${task.title}"`,
        link: `/tasks/${task._id}`,
      });
      sendNotification(io, employee.user._id, notification);
    }
  }

  res.status(201).json({ success: true, data: populated });
};

export const deleteComment = async (req, res) => {
  const comment = await TaskComment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
};
