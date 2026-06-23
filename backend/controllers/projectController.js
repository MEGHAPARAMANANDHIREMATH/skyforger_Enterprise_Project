import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Employee from '../models/Employee.js';

export const getProjects = async (req, res) => {
  const { search, status, department } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (req.user.role === 'employee' && req.user.employee) {
    filter.teamMembers = req.user.employee._id;
  }
  const projects = await Project.find(filter)
    .populate('department', 'name')
    .populate('manager', 'name email')
    .populate('teamMembers', 'firstName lastName employeeId profileImage')
    .sort('-createdAt');
  res.json({ success: true, count: projects.length, data: projects });
};

export const getProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('department')
    .populate('manager', 'name email avatar')
    .populate('teamMembers', 'firstName lastName employeeId position profileImage')
    .populate('createdBy', 'name');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const tasks = await Task.find({ project: project._id })
    .populate('assignedTo', 'firstName lastName employeeId')
    .sort('order');
  res.json({ success: true, data: { project, tasks } });
};

export const createProject = async (req, res) => {
  const data = { ...req.body, manager: req.user._id, createdBy: req.user._id };
  if (req.file) data.coverImage = `/uploads/projects/${req.file.filename}`;
  if (typeof data.teamMembers === 'string') data.teamMembers = JSON.parse(data.teamMembers);
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  const project = await Project.create(data);
  const populated = await Project.findById(project._id)
    .populate('department', 'name')
    .populate('manager', 'name email')
    .populate('teamMembers', 'firstName lastName');
  res.status(201).json({ success: true, data: populated });
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const fields = ['name', 'description', 'status', 'priority', 'startDate', 'endDate', 'progress', 'department', 'budget', 'tags'];
  fields.forEach((f) => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
  if (req.body.teamMembers) {
    project.teamMembers = typeof req.body.teamMembers === 'string' ? JSON.parse(req.body.teamMembers) : req.body.teamMembers;
  }
  if (req.file) project.coverImage = `/uploads/projects/${req.file.filename}`;
  await project.save();
  const populated = await Project.findById(project._id)
    .populate('department', 'name')
    .populate('manager', 'name email')
    .populate('teamMembers', 'firstName lastName');
  res.json({ success: true, data: populated });
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ success: true, message: 'Project and associated tasks deleted' });
};

export const assignTeamMembers = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const { teamMembers } = req.body;
  project.teamMembers = teamMembers;
  await project.save();
  const populated = await Project.findById(project._id).populate('teamMembers', 'firstName lastName employeeId');
  res.json({ success: true, data: populated });
};

export const getProjectTimeline = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const tasks = await Task.find({ project: project._id }).select('title status dueDate startDate completedDate priority');
  res.json({
    success: true,
    data: {
      project: { name: project.name, startDate: project.startDate, endDate: project.endDate, progress: project.progress },
      tasks,
    },
  });
};
