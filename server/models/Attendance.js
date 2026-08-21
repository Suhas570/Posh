import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  clockIn: {
    type: Date,
    required: [true, 'Clock In time is required']
  },
  clockOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day'],
    default: 'Present'
  },
  ipAddress: String,
  location: String,
  hoursWorked: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
