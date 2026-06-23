import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { uploadsRootPath } from './config/multer.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import Task from './models/Task.js';
import Employee from './models/Employee.js';
import Notification from './models/Notification.js';
import { sendNotification } from './utils/helpers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(userId.toString());
  });
  socket.on('disconnect', () => {});
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsRootPath));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Enterprise Workforce Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const checkDeadlines = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tasks = await Task.find({
    dueDate: { $lte: tomorrow, $gte: new Date() },
    status: { $ne: 'completed' },
  }).populate({ path: 'assignedTo', populate: { path: 'user' } });

  for (const task of tasks) {
    if (!task.assignedTo?.user) continue;
    const exists = await Notification.findOne({
      recipient: task.assignedTo.user._id,
      type: 'deadline',
      'metadata.taskId': task._id,
      createdAt: { $gte: new Date(Date.now() - 86400000) },
    });
    if (exists) continue;
    const notification = await Notification.create({
      recipient: task.assignedTo.user._id,
      type: 'deadline',
      title: 'Task Deadline Approaching',
      message: `Task "${task.title}" is due soon`,
      link: `/tasks/${task._id}`,
      metadata: { taskId: task._id },
    });
    sendNotification(io, task.assignedTo.user._id, notification);
  }
};

setInterval(checkDeadlines, 3600000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  checkDeadlines();
});

export default app;
