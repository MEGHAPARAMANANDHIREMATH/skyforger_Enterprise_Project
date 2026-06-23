import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TaskComment from '../models/TaskComment.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Department.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      TaskComment.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('Cleared existing data...');

    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software development and technical operations', budget: 500000, location: 'Building A', employeeCount: 0 },
      { name: 'Human Resources', description: 'Employee relations and recruitment', budget: 200000, location: 'Building B', employeeCount: 0 },
      { name: 'Marketing', description: 'Brand management and digital marketing', budget: 350000, location: 'Building C', employeeCount: 0 },
      { name: 'Finance', description: 'Financial planning and accounting', budget: 400000, location: 'Building A', employeeCount: 0 },
      { name: 'Operations', description: 'Business operations and logistics', budget: 300000, location: 'Building D', employeeCount: 0 },
    ]);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@enterprise.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const managerUser = await User.create({
      name: 'Sarah Johnson',
      email: 'manager@enterprise.com',
      password: 'Manager@123',
      role: 'manager',
    });

    const empUserData = [
      { name: 'John Smith', email: 'john@enterprise.com', password: 'Employee@123', role: 'employee' },
      { name: 'Emily Davis', email: 'emily@enterprise.com', password: 'Employee@123', role: 'employee' },
      { name: 'Michael Brown', email: 'michael@enterprise.com', password: 'Employee@123', role: 'employee' },
      { name: 'Lisa Wilson', email: 'lisa@enterprise.com', password: 'Employee@123', role: 'employee' },
      { name: 'David Lee', email: 'david@enterprise.com', password: 'Employee@123', role: 'employee' },
    ];
    const empUsers = await Promise.all(empUserData.map((u) => User.create(u)));

    const managerEmp = await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP0001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'manager@enterprise.com',
      phone: '+1-555-0101',
      position: 'Project Manager',
      department: departments[0]._id,
      hireDate: new Date('2020-03-15'),
      salary: 95000,
      skills: ['Project Management', 'Agile', 'Leadership'],
      status: 'active',
      productivityScore: 88,
      tasksCompleted: 45,
    });
    managerUser.employee = managerEmp._id;
    await managerUser.save();

    const employees = [];
    const empData = [
      { user: empUsers[0], id: 'EMP0002', first: 'John', last: 'Smith', pos: 'Senior Developer', dept: 0, skills: ['React', 'Node.js', 'MongoDB'] },
      { user: empUsers[1], id: 'EMP0003', first: 'Emily', last: 'Davis', pos: 'UI/UX Designer', dept: 0, skills: ['Figma', 'CSS', 'Design Systems'] },
      { user: empUsers[2], id: 'EMP0004', first: 'Michael', last: 'Brown', pos: 'Marketing Specialist', dept: 2, skills: ['SEO', 'Content Marketing', 'Analytics'] },
      { user: empUsers[3], id: 'EMP0005', first: 'Lisa', last: 'Wilson', pos: 'HR Coordinator', dept: 1, skills: ['Recruitment', 'Onboarding', 'Compliance'] },
      { user: empUsers[4], id: 'EMP0006', first: 'David', last: 'Lee', pos: 'Financial Analyst', dept: 3, skills: ['Excel', 'Budgeting', 'Forecasting'] },
    ];

    for (const e of empData) {
      const emp = await Employee.create({
        user: e.user._id,
        employeeId: e.id,
        firstName: e.first,
        lastName: e.last,
        email: e.user.email,
        phone: `+1-555-0${Math.floor(Math.random() * 900) + 100}`,
        position: e.pos,
        department: departments[e.dept]._id,
        hireDate: new Date(2021 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
        salary: 60000 + Math.floor(Math.random() * 40000),
        skills: e.skills,
        manager: managerEmp._id,
        status: 'active',
        productivityScore: 60 + Math.floor(Math.random() * 35),
        tasksCompleted: Math.floor(Math.random() * 30),
      });
      await User.findByIdAndUpdate(e.user._id, { employee: emp._id });
      employees.push(emp);
      await Department.findByIdAndUpdate(departments[e.dept]._id, { $inc: { employeeCount: 1 } });
    }

    await Department.findByIdAndUpdate(departments[0]._id, { $inc: { employeeCount: 1 }, head: managerEmp._id });

    const projects = await Project.insertMany([
      {
        name: 'Enterprise Portal Redesign',
        description: 'Complete overhaul of the internal enterprise portal with modern UI/UX',
        status: 'active',
        priority: 'high',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-06-30'),
        progress: 45,
        department: departments[0]._id,
        manager: managerUser._id,
        teamMembers: [employees[0]._id, employees[1]._id],
        budget: 150000,
        tags: ['frontend', 'redesign'],
        createdBy: adminUser._id,
      },
      {
        name: 'Workforce Analytics Dashboard',
        description: 'Build analytics dashboard for workforce productivity tracking',
        status: 'active',
        priority: 'critical',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-05-15'),
        progress: 30,
        department: departments[0]._id,
        manager: managerUser._id,
        teamMembers: [employees[0]._id, employees[1]._id, employees[2]._id],
        budget: 120000,
        tags: ['analytics', 'dashboard'],
        createdBy: managerUser._id,
      },
      {
        name: 'Q2 Marketing Campaign',
        description: 'Launch comprehensive marketing campaign for Q2 product releases',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-06-30'),
        progress: 10,
        department: departments[2]._id,
        manager: managerUser._id,
        teamMembers: [employees[2]._id],
        budget: 80000,
        tags: ['marketing', 'campaign'],
        createdBy: adminUser._id,
      },
      {
        name: 'HR Onboarding Automation',
        description: 'Automate employee onboarding workflows and documentation',
        status: 'active',
        priority: 'medium',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-07-31'),
        progress: 55,
        department: departments[1]._id,
        manager: managerUser._id,
        teamMembers: [employees[3]._id],
        budget: 60000,
        tags: ['hr', 'automation'],
        createdBy: adminUser._id,
      },
      {
        name: 'Financial Reporting System',
        description: 'Implement automated financial reporting and budget tracking',
        status: 'completed',
        priority: 'high',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        progress: 100,
        department: departments[3]._id,
        manager: managerUser._id,
        teamMembers: [employees[4]._id],
        budget: 90000,
        tags: ['finance', 'reporting'],
        createdBy: adminUser._id,
      },
    ]);

    const taskData = [
      { title: 'Design system components', project: 0, assignee: 1, status: 'completed', priority: 'high', order: 0 },
      { title: 'Setup React project structure', project: 0, assignee: 0, status: 'completed', priority: 'high', order: 1 },
      { title: 'Implement authentication module', project: 0, assignee: 0, status: 'in-progress', priority: 'critical', order: 0 },
      { title: 'Create dashboard layouts', project: 0, assignee: 1, status: 'in-progress', priority: 'medium', order: 1 },
      { title: 'API integration for portal', project: 0, assignee: 0, status: 'review', priority: 'high', order: 0 },
      { title: 'User testing sessions', project: 0, assignee: 1, status: 'todo', priority: 'medium', order: 0 },
      { title: 'Data pipeline architecture', project: 1, assignee: 0, status: 'in-progress', priority: 'critical', order: 0 },
      { title: 'Chart components development', project: 1, assignee: 1, status: 'todo', priority: 'high', order: 0 },
      { title: 'KPI metrics definition', project: 1, assignee: 2, status: 'review', priority: 'medium', order: 0 },
      { title: 'Campaign strategy document', project: 2, assignee: 2, status: 'in-progress', priority: 'medium', order: 0 },
      { title: 'Social media content calendar', project: 2, assignee: 2, status: 'todo', priority: 'low', order: 0 },
      { title: 'Onboarding checklist template', project: 3, assignee: 3, status: 'completed', priority: 'medium', order: 0 },
      { title: 'Document automation workflow', project: 3, assignee: 3, status: 'in-progress', priority: 'high', order: 0 },
      { title: 'Budget report templates', project: 4, assignee: 4, status: 'completed', priority: 'high', order: 0 },
      { title: 'Quarterly forecast model', project: 4, assignee: 4, status: 'completed', priority: 'critical', order: 1 },
    ];

    const tasks = [];
    for (const t of taskData) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 5);
      const task = await Task.create({
        title: t.title,
        description: `Detailed work item for: ${t.title}`,
        project: projects[t.project]._id,
        assignedTo: employees[t.assignee]._id,
        assignedBy: managerUser._id,
        status: t.status,
        priority: t.priority,
        dueDate,
        order: t.order,
        estimatedHours: 8 + Math.floor(Math.random() * 24),
        actualHours: t.status === 'completed' ? 10 + Math.floor(Math.random() * 20) : 0,
        completedDate: t.status === 'completed' ? new Date() : undefined,
      });
      tasks.push(task);
    }

    await TaskComment.insertMany([
      { task: tasks[2]._id, user: managerUser._id, content: 'Please prioritize JWT implementation with refresh tokens.' },
      { task: tasks[2]._id, user: empUsers[0]._id, content: 'Working on it. Should be done by end of week.' },
      { task: tasks[6]._id, user: managerUser._id, content: 'Great progress on the data pipeline!' },
      { task: tasks[12]._id, user: empUsers[3]._id, content: 'Automation workflow is 70% complete.' },
    ]);

    await Notification.insertMany([
      { recipient: empUsers[0]._id, sender: managerUser._id, type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned: Implement authentication module', link: `/tasks/${tasks[2]._id}`, isRead: false },
      { recipient: empUsers[1]._id, sender: managerUser._id, type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned: Create dashboard layouts', link: `/tasks/${tasks[3]._id}`, isRead: true },
      { recipient: empUsers[0]._id, sender: managerUser._id, type: 'deadline', title: 'Task Deadline Approaching', message: 'Task "Data pipeline architecture" is due soon', link: `/tasks/${tasks[6]._id}`, isRead: false },
      { recipient: managerUser._id, sender: adminUser._id, type: 'system', title: 'System Update', message: 'New reporting features are now available', isRead: false },
    ]);

    console.log('Seed data created successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:   admin@enterprise.com / Admin@123');
    console.log('Manager: manager@enterprise.com / Manager@123');
    console.log('Employee: john@enterprise.com / Employee@123');
    console.log('(All employees use password: Employee@123)');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
