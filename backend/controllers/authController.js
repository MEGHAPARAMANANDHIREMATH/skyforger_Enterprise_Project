import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken, generateResetToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const allowedRole = ['admin', 'manager', 'employee'].includes(role) ? role : 'employee';
  const user = await User.create({ name, email, password, role: allowedRole });
  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, token },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password').populate('employee');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' });
  }
  const token = generateToken(user._id);
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      employee: user.employee,
      token,
    },
  });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('employee');
  res.json({ success: true, data: user });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset instructions sent' });
  }
  const { resetToken, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 3600000;
  await user.save();
  res.json({
    success: true,
    message: 'Password reset token generated (local dev - use token below)',
    resetToken,
  });
};

export const resetPassword = async (req, res) => {
  const crypto = await import('crypto');
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  const token = generateToken(user._id);
  res.json({ success: true, message: 'Password reset successful', data: { token } });
};

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);
  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
    user.email = email;
  }
  if (name) user.name = name;
  if (req.file) {
    user.avatar = `/uploads/profiles/${req.file.filename}`;
  }
  await user.save();
  res.json({ success: true, data: user });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

// Admin user management
export const getUsers = async (req, res) => {
  const { search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).populate('employee').select('-password').sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.employee) await Employee.findByIdAndDelete(user.employee);
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
};
