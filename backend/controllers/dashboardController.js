import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
  const [
    totalEmployees,
    activeEmployees,
    activeProjects,
    completedProjects,
    pendingTasks,
    completedTasks,
    totalDepartments,
    recentTasks,
    recentNotifications,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: { $in: ['todo', 'in-progress', 'review'] } }),
    Task.countDocuments({ status: 'completed' }),
    Department.countDocuments(),
    Task.find()
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort('-updatedAt')
      .limit(8),
    Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .limit(5),
  ]);

  const tasksByStatus = await Task.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const tasksByPriority = await Task.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const projectProgress = await Project.find({ status: { $in: ['active', 'planning'] } })
    .select('name progress status')
    .limit(6);

  const employeeProductivity = await Employee.find({ status: 'active' })
    .select('firstName lastName productivityScore tasksCompleted')
    .sort('-productivityScore')
    .limit(5);

  const monthlyTasks = await Task.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        created: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalEmployees,
        activeEmployees,
        activeProjects,
        completedProjects,
        pendingTasks,
        completedTasks,
        totalDepartments,
      },
      tasksByStatus,
      tasksByPriority,
      projectProgress,
      employeeProductivity,
      monthlyTasks,
      recentActivities: recentTasks,
      recentNotifications,
    },
  });
};

export const getEmployeeDashboard = async (req, res) => {
  if (!req.user.employee) {
    return res.json({ success: true, data: { myTasks: [], stats: {} } });
  }
  const empId = req.user.employee._id;
  const [myTasks, completed, inProgress, overdue] = await Promise.all([
    Task.find({ assignedTo: empId }).populate('project', 'name').sort('-updatedAt').limit(10),
    Task.countDocuments({ assignedTo: empId, status: 'completed' }),
    Task.countDocuments({ assignedTo: empId, status: 'in-progress' }),
    Task.countDocuments({
      assignedTo: empId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    }),
  ]);
  const employee = await Employee.findById(empId);
  res.json({
    success: true,
    data: {
      myTasks,
      stats: {
        completed,
        inProgress,
        overdue,
        productivityScore: employee?.productivityScore || 0,
      },
    },
  });
};
