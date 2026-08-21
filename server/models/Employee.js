import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, required: true },
  assignedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Returned', 'Damaged'], default: 'Active' }
});

const trainingSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  provider: { type: String },
  status: { type: String, enum: ['Enrolled', 'In Progress', 'Completed'], default: 'Enrolled' },
  progress: { type: Number, default: 0 }, // 0 to 100
  completionDate: { type: Date }
});

const performanceSchema = new mongoose.Schema({
  reviewCycle: { type: String, required: true }, // e.g. "Q1 2026", "Annual 2026"
  reviewer: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String }
});

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  photo: {
    type: String,
    default: ''
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required']
  },
  bankDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true }
  },
  assets: [assetSchema],
  trainings: [trainingSchema],
  performanceReviews: [performanceSchema]
}, {
  timestamps: true
});

// Virtual field for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
