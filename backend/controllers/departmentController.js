import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

export const getDepartments = async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const departments = await Department.find(filter)
    .populate('head', 'firstName lastName employeeId position')
    .sort('name');
  res.json({ success: true, count: departments.length, data: departments });
};

export const getDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id).populate('head', 'firstName lastName employeeId');
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  const employees = await Employee.find({ department: department._id }).populate('user', 'name email');
  res.json({ success: true, data: { department, employees } });
};

export const createDepartment = async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
};

export const updateDepartment = async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: department });
};

export const deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  const empCount = await Employee.countDocuments({ department: department._id });
  if (empCount > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete department with employees' });
  }
  await department.deleteOne();
  res.json({ success: true, message: 'Department deleted' });
};
