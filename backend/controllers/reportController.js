import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Report from '../models/Report.js';
import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { uploadsRootPath } from '../config/multer.js';

const ensureReportsDir = () => {
  const dir = path.join(uploadsRootPath, 'reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const generatePDF = (title, content, filename) => {
  return new Promise((resolve, reject) => {
    const dir = ensureReportsDir();
    const filePath = path.join(dir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    content.forEach((line) => {
      if (line.type === 'heading') doc.fontSize(14).text(line.text).moveDown(0.5);
      else if (line.type === 'subheading') doc.fontSize(12).text(line.text).moveDown(0.3);
      else doc.fontSize(10).text(line.text).moveDown(0.2);
    });
    doc.end();
    stream.on('finish', () => resolve(`/uploads/reports/${filename}`));
    stream.on('error', reject);
  });
};

export const getReports = async (req, res) => {
  const reports = await Report.find({ generatedBy: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: reports.length, data: reports });
};

export const generateEmployeeReport = async (req, res) => {
  const employees = await Employee.find()
    .populate('department', 'name')
    .sort('-productivityScore');
  const content = [
    { type: 'heading', text: 'Employee Performance Report' },
    { type: 'subheading', text: `Total Employees: ${employees.length}` },
  ];
  employees.forEach((emp) => {
    content.push({
      type: 'text',
      text: `${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${emp.position} | Dept: ${emp.department?.name || 'N/A'} | Productivity: ${emp.productivityScore}% | Tasks Completed: ${emp.tasksCompleted}`,
    });
  });
  const filename = `employee-report-${Date.now()}.pdf`;
  const filePath = await generatePDF('Employee Performance Report', content, filename);
  const report = await Report.create({
    title: 'Employee Performance Report',
    type: 'employee',
    generatedBy: req.user._id,
    data: { employeeCount: employees.length, employees: employees.map((e) => ({ id: e._id, name: `${e.firstName} ${e.lastName}`, score: e.productivityScore })) },
    filePath,
  });
  res.status(201).json({ success: true, data: report });
};

export const generateProjectReport = async (req, res) => {
  const projects = await Project.find()
    .populate('department', 'name')
    .populate('manager', 'name');
  const content = [
    { type: 'heading', text: 'Project Status Report' },
    { type: 'subheading', text: `Total Projects: ${projects.length}` },
  ];
  for (const proj of projects) {
    const taskCount = await Task.countDocuments({ project: proj._id });
    const completed = await Task.countDocuments({ project: proj._id, status: 'completed' });
    content.push({
      type: 'text',
      text: `${proj.name} | Status: ${proj.status} | Progress: ${proj.progress}% | Tasks: ${completed}/${taskCount} | Manager: ${proj.manager?.name || 'N/A'}`,
    });
  }
  const filename = `project-report-${Date.now()}.pdf`;
  const filePath = await generatePDF('Project Status Report', content, filename);
  const report = await Report.create({
    title: 'Project Status Report',
    type: 'project',
    generatedBy: req.user._id,
    data: { projectCount: projects.length },
    filePath,
  });
  res.status(201).json({ success: true, data: report });
};

export const generateProductivityReport = async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'firstName lastName').populate('project', 'name');
  const byStatus = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const content = [
    { type: 'heading', text: 'Productivity Report' },
    { type: 'subheading', text: `Total Tasks: ${tasks.length}` },
  ];
  byStatus.forEach((s) => content.push({ type: 'text', text: `Status "${s._id}": ${s.count} tasks` }));
  content.push({ type: 'subheading', text: 'Recent Tasks' });
  tasks.slice(0, 20).forEach((t) => {
    content.push({
      type: 'text',
      text: `${t.title} | ${t.status} | ${t.priority} | Assignee: ${t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}`,
    });
  });
  const filename = `productivity-report-${Date.now()}.pdf`;
  const filePath = await generatePDF('Productivity Report', content, filename);
  const report = await Report.create({
    title: 'Productivity Report',
    type: 'productivity',
    generatedBy: req.user._id,
    data: { taskCount: tasks.length, byStatus },
    filePath,
  });
  res.status(201).json({ success: true, data: report });
};

export const deleteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
  if (report.filePath) {
    const fullPath = path.join(process.cwd(), report.filePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  await report.deleteOne();
  res.json({ success: true, message: 'Report deleted' });
};
