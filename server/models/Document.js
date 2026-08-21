import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Policy', 'Employee Record', 'Certificate', 'Evidence', 'Other'],
    required: [true, 'Document type is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL/Path is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required']
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee' // Optional: if associated with a specific employee profile
  }
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
