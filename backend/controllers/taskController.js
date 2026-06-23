import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { updateProjectProgress, sendNotification } from '../utils/helpers.js';

const createTaskNotification = async (io, task, type, recipientUserId, senderId, title, message) => {
  if (!recipientUserId) return;
  const notification = await Notification.create({
    recipient: recipientUserId,
    sender: senderId,
    type,
    title,
    message,
    link: `/tasks/${task._id}`,
    metadata: { taskId: task._id, projectId: task.project },
  });
  sendNotification(io, recipientUserId, notification);
};

export const getTasks = async (req, res) => {
  const { search, status, priority, project, assignedTo } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (project) filter.project = project;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (req.user.role === 'employee' && req.user.employee) {
    filter.assignedTo = req.user.employee._id;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const tasks = await Task.find(filter)
    .populate('project', 'name status')
    .populate('assignedTo', 'firstName lastName employeeId profileImage')
    .populate('assignedBy', 'name')
    .sort('order');
  res.json({ success: true, count: tasks.length, data: tasks });
};

export const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name')
    .populate('assignedTo', 'firstName lastName employeeId email')
    .populate('assignedBy', 'name email')
    .populate('attachments');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: task });
};

export const createTask = async (req, res) => {
  const io = req.app.get('io');
  const maxOrder = await Task.findOne({ project: req.body.project, status: req.body.status || 'todo' }).sort('-order');
  const task = await Task.create({
    ...req.body,
    assignedBy: req.user._id,
    order: maxOrder ? maxOrder.order + 1 : 0,
  });
  const populated = await Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignedTo', 'firstName lastName employeeId');

  if (task.assignedTo) {
    const employee = await Employee.findById(task.assignedTo).populate('user');
    if (employee?.user) {
      await createTaskNotification(
        io, task, 'task_assigned', employee.user._id, req.user._id,
        'New Task Assigned', `You have been assigned: ${task.title}`
      );
    }
  }
  res.status(201).json({ success: true, data: populated });
};

export const updateTask = async (req, res) => {
  const io = req.app.get('io');
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  const oldStatus = task.status;
  const oldAssignee = task.assignedTo?.toString();
  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'estimatedHours', 'actualHours', 'tags', 'order'];
  fields.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

  if (req.body.status === 'completed' && oldStatus !== 'completed') {
    task.completedDate = Date.now();
    if (task.assignedTo) {
      const emp = await Employee.findByIdAndUpdate(task.assignedTo, { $inc: { tasksCompleted: 1 } }, { new: true });
      if (emp) {
        const total = await Task.countDocuments({ assignedTo: emp._id });
        const done = await Task.countDocuments({ assignedTo: emp._id, status: 'completed' });
        emp.productivityScore = total > 0 ? Math.round((done / total) * 100) : 0;
        await emp.save();
      }
    }
  }

  await task.save();
  await updateProjectProgress(Project, Task, task.project);

  if (req.body.assignedTo && req.body.assignedTo !== oldAssignee) {
    const employee = await Employee.findById(req.body.assignedTo).populate('user');
    if (employee?.user) {
      await createTaskNotification(
        io, task, 'task_assigned', employee.user._id, req.user._id,
        'Task Assigned', `You have been assigned: ${task.title}`
      );
    }
  }

  const populated = await Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignedTo', 'firstName lastName employeeId');
  res.json({ success: true, data: populated });
};

export const updateTaskStatus = async (req, res) => {
  req.body = { status: req.body.status, order: req.body.order };
  return updateTask(req, res);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  const projectId = task.project;
  await task.deleteOne();
  await updateProjectProgress(Project, Task, projectId);
  res.json({ success: true, message: 'Task deleted' });
};

export const getKanbanBoard = async (req, res) => {
  const { projectId } = req.params;
  const filter = { project: projectId };
  if (req.user.role === 'employee' && req.user.employee) {
    filter.assignedTo = req.user.employee._id;
  }
  const tasks = await Task.find(filter)
    .populate('assignedTo', 'firstName lastName profileImage')
    .sort('order');
  const columns = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    review: tasks.filter((t) => t.status === 'review'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };
  res.json({ success: true, data: columns });
};

export const bulkUpdateKanban = async (req, res) => {
  const { updates } = req.body;
  for (const item of updates) {
    const update = { status: item.status, order: item.order };
    if (item.status === 'completed') update.completedDate = Date.now();
    await Task.findByIdAndUpdate(item.id, update);
  }
  const projectId = req.params.projectId;
  await updateProjectProgress(Project, Task, projectId);
  const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'firstName lastName profileImage').sort('order');
  const columns = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    review: tasks.filter((t) => t.status === 'review'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };
  res.json({ success: true, data: columns });
};
