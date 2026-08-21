import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Announcement from '../models/Announcement.js';
import Document from '../models/Document.js';
import Notification from '../models/Notification.js';

// Get employee dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile associated with this user' });
    }

    // Get Leave Balances & History
    const leaves = await Leave.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(5);
    const approvedLeaves = await Leave.find({ employee: employeeId, status: 'Approved' });
    
    // Calculate leave days taken (mocking balances)
    let leavesTaken = 0;
    approvedLeaves.forEach(l => {
      const diffTime = Math.abs(l.endDate - l.startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leavesTaken += diffDays;
    });

    const totalAllowedLeaves = 30;
    const leaveBalance = totalAllowedLeaves - leavesTaken;

    // Get Announcements
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);

    // Get Attendance for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: startOfMonth }
    });

    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'Late').length;
    const halfDays = attendanceRecords.filter(r => r.status === 'Half-Day').length;

    // Get latest Payslip
    const latestPayslip = await Payroll.findOne({ employee: employeeId }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: {
        leaveBalance,
        leavesTaken,
        attendanceStats: {
          present: presentDays,
          late: lateDays,
          halfDay: halfDays,
          absent: 0 // Mock calculation
        },
        recentLeaves: leaves,
        announcements,
        latestPayslip
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clock-In
export const clockIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile associated with this user' });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // Check if already clocked in today
    const existingRecord = await Attendance.findOne({ employee: employeeId, date: today });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: 'Already clocked in for today' });
    }

    // Determine status (Late after 9:30 AM)
    const now = new Date();
    let status = 'Present';
    const limitTime = new Date();
    limitTime.setHours(9, 30, 0, 0); // 9:30 AM

    if (now > limitTime) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      clockIn: new Date(),
      status,
      ipAddress: req.ip,
      location: req.body.location || 'Remote/Office'
    });

    res.status(201).json({ success: true, message: 'Clock-in successful', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clock-Out
export const clockOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile associated with this user' });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record) {
      return res.status(404).json({ success: false, message: 'No clock-in record found for today' });
    }

    if (record.clockOut) {
      return res.status(400).json({ success: false, message: 'Already clocked out for today' });
    }

    record.clockOut = new Date();
    
    // Calculate hours worked
    const diffMs = record.clockOut - record.clockIn;
    const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    record.hoursWorked = parseFloat(diffHours);

    await record.save();

    res.status(200).json({ success: true, message: 'Clock-out successful', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply for Leave
export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    const { type, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employee: employeeId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason
    });

    // Notify Admins
    // Fetch all admins
    // Note: Here we create notifications in the collection
    await Notification.create({
      recipient: req.user._id, // notify employee that leave is submitted
      title: 'Leave Application Submitted',
      message: `Your leave request for ${type} starting from ${startDate} has been submitted.`
    });

    res.status(201).json({ success: true, message: 'Leave applied successfully', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Leave History
export const getLeaves = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    const leaves = await Leave.find({ employee: employeeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Payslips
export const getPayslips = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    const payslips = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 });
    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile details
export const getProfile = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    const employee = await Employee.findById(employeeId).populate('department manager');
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Policies
export const getPolicies = async (req, res) => {
  try {
    const policies = await Document.find({ type: 'Policy' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read
export const markNotificationRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
