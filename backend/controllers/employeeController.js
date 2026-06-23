import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Task from '../models/Task.js';

const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  return `EMP${String(count + 1).padStart(4, '0')}`;
};

export const getEmployees = async (req, res) => {
  const { search, department, status } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
  }
  const employees = await Employee.find(filter)
    .populate('department', 'name')
    .populate('user', 'name email role avatar')
    .populate('manager', 'firstName lastName')
    .sort('-createdAt');
  res.json({ success: true, count: employees.length, data: employees });
};

export const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('department')
    .populate('user', 'name email role avatar')
    .populate('manager', 'firstName lastName employeeId');
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  const tasks = await Task.find({ assignedTo: employee._id }).populate('project', 'name');
  res.json({ success: true, data: { employee, tasks } });
};

export const createEmployee = async (req, res) => {
  const { firstName, lastName, email, phone, position, department, hireDate, salary, skills, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

  const employeeId = await generateEmployeeId();
  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password: password || 'Employee@123',
    role: role || 'employee',
  });

  const employeeData = {
    user: user._id,
    employeeId,
    firstName,
    lastName,
    email,
    phone: phone || '',
    position,
    department: department || undefined,
    hireDate: hireDate || Date.now(),
    salary: salary || 0,
    skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim())) : [],
  };
  if (req.file) employeeData.profileImage = `/uploads/profiles/${req.file.filename}`;

  const employee = await Employee.create(employeeData);
  user.employee = employee._id;
  await user.save();

  if (department) {
    await Department.findByIdAndUpdate(department, { $inc: { employeeCount: 1 } });
  }

  const populated = await Employee.findById(employee._id).populate('department').populate('user', 'name email role');
  res.status(201).json({ success: true, data: populated });
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  const oldDept = employee.department?.toString();
  const fields = ['firstName', 'lastName', 'phone', 'position', 'department', 'hireDate', 'salary', 'skills', 'status', 'address', 'manager'];
  fields.forEach((f) => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });
  if (req.body.skills && typeof req.body.skills === 'string') {
    employee.skills = req.body.skills.split(',').map((s) => s.trim());
  }
  if (req.file) employee.profileImage = `/uploads/profiles/${req.file.filename}`;

  await employee.save();

  if (req.body.department && oldDept !== req.body.department) {
    if (oldDept) await Department.findByIdAndUpdate(oldDept, { $inc: { employeeCount: -1 } });
    await Department.findByIdAndUpdate(req.body.department, { $inc: { employeeCount: 1 } });
  }

  if (req.body.firstName || req.body.lastName) {
    await User.findByIdAndUpdate(employee.user, {
      name: `${employee.firstName} ${employee.lastName}`,
    });
  }

  const populated = await Employee.findById(employee._id).populate('department').populate('user', 'name email role');
  res.json({ success: true, data: populated });
};

export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  if (employee.department) {
    await Department.findByIdAndUpdate(employee.department, { $inc: { employeeCount: -1 } });
  }
  await User.findByIdAndDelete(employee.user);
  await employee.deleteOne();
  res.json({ success: true, message: 'Employee deleted' });
};

export const getEmployeeMetrics = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  const tasks = await Task.find({ assignedTo: employee._id });
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  res.json({
    success: true,
    data: {
      totalTasks: tasks.length,
      completed,
      inProgress,
      overdue,
      productivityScore: employee.productivityScore,
      tasksCompleted: employee.tasksCompleted,
    },
  });
};
