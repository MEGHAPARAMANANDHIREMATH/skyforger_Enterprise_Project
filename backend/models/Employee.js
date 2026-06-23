import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    position: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    hireDate: { type: Date, default: Date.now },
    salary: { type: Number, default: 0 },
    skills: [{ type: String }],
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
    address: { type: String, default: '' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    tasksCompleted: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
