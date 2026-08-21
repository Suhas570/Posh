import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    required: true // e.g. "Admin", "Internal Committee Member"
  }
});

const poshComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  complaintType: {
    type: String,
    required: [true, 'Complaint type is required']
  },
  incidentDate: {
    type: Date,
    required: [true, 'Incident date is required']
  },
  incidentTime: {
    type: String,
    required: [true, 'Incident time is required']
  },
  incidentLocation: {
    type: String,
    required: [true, 'Incident location is required']
  },
  accusedPerson: {
    type: String,
    required: [true, 'Accused person name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  evidence: {
    type: String, // Path/URL to uploaded evidence file
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Assigned', 'Under Review', 'Investigation', 'Awaiting Evidence', 'Resolved', 'Closed', 'Rejected', 'Insufficient Evidence'],
    default: 'New'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    // Set to null or omit for anonymous complaints
    default: null
  },
  assignedInvestigator: {
    type: String,
    default: ''
  },
  outcome: {
    type: String,
    enum: ['Complaint Substantiated', 'Complaint Not Substantiated', 'Insufficient Evidence', 'False Complaint', 'Other', ''],
    default: ''
  },
  closingRemarks: {
    type: String,
    default: ''
  },
  recommendation: {
    type: String,
    default: ''
  },
  closureDate: {
    type: Date
  },
  timeline: [timelineSchema]
}, {
  timestamps: true
});

const POSHComplaint = mongoose.model('POSHComplaint', poshComplaintSchema);
export default POSHComplaint;
