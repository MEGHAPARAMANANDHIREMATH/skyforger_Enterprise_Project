import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['employee', 'project', 'productivity'], required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    filePath: { type: String, default: '' },
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
