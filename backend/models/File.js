import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    category: { type: String, enum: ['profile', 'project', 'document', 'task'], default: 'document' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedTo: {
      model: { type: String, enum: ['Employee', 'Project', 'Task', 'User'] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

const File = mongoose.model('File', fileSchema);
export default File;
