import mongoose from 'mongoose';

const witnessStatementSchema = new mongoose.Schema({
  witnessName: { type: String, required: true },
  statement: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const investigationNoteSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POSHComplaint',
    required: [true, 'Complaint reference is required'],
    unique: true // One set of investigation notes per case
  },
  observations: {
    type: String,
    default: ''
  },
  witnessStatements: [witnessStatementSchema],
  evidenceSummary: {
    type: String,
    default: ''
  },
  progress: {
    type: String,
    default: ''
  },
  recommendation: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const InvestigationNote = mongoose.model('InvestigationNote', investigationNoteSchema);
export default InvestigationNote;
