import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import POSHComplaint from '../models/POSHComplaint.js';
import Announcement from '../models/Announcement.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';

// Get Admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalDepartments = await Department.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // POSH counts - ONLY Normal complaints
    const totalNormalComplaints = await POSHComplaint.countDocuments({ isAnonymous: false });
    const pendingNormal = await POSHComplaint.countDocuments({ isAnonymous: false, status: 'New' });
    const reviewNormal = await POSHComplaint.countDocuments({ isAnonymous: false, status: 'Under Review' });
    const closedNormal = await POSHComplaint.countDocuments({ isAnonymous: false, status: 'Closed' });

    // Get leaves list
    const recentLeaves = await Leave.find().populate('employee').sort({ createdAt: -1 }).limit(5);

    // Get department-wise headcounts
    const departments = await Department.find();
    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id, status: 'Active' });
      return { name: dept.name, code: dept.code, count };
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          employees: totalEmployees,
          totalEmployees: totalEmployees,
          departments: totalDepartments,
          totalDepartments: totalDepartments,
          pendingLeaves,
          pendingPOSH: pendingNormal,
          posh: {
            total: totalNormalComplaints,
            pending: pendingNormal,
            underReview: reviewNormal,
            closed: closedNormal
          }
        },
        recentLeaves,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- EMPLOYEE CRUD ---
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('department manager');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    const employee = await Employee.create(employeeData);

    // Write audit log
    await AuditLog.create({
      user: req.user._id,
      email: req.user.email,
      role: req.user.role,
      action: 'CREATE_EMPLOYEE',
      details: `Created employee profile for ${employee.firstName} ${employee.lastName} (ID: ${employee.employeeId})`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Employee profile created', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await AuditLog.create({
      user: req.user._id,
      email: req.user.email,
      role: req.user.role,
      action: 'UPDATE_EMPLOYEE',
      details: `Updated employee profile for ID: ${employee.employeeId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Employee profile updated', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Deactivate User account associated
    await User.findOneAndDelete({ employeeProfile: id });

    await AuditLog.create({
      user: req.user._id,
      email: req.user.email,
      role: req.user.role,
      action: 'DELETE_EMPLOYEE',
      details: `Deleted employee profile for ID: ${employee.employeeId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Employee profile and associated login deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- DEPARTMENT CRUD ---
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('manager');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, message: 'Department created', data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Department updated', data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- LEAVE MANAGEMENT ---
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employee').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.remarks = remarks;
    leave.approvedBy = req.user.employeeProfile?._id;
    await leave.save();

    res.status(200).json({ success: true, message: `Leave request ${status.toLowerCase()} successfully`, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ATTENDANCE MANAGEMENT ---
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0,0,0,0);
      query.date = queryDate;
    }

    const attendance = await Attendance.find(query).populate('employee').sort({ date: -1 });
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PAYROLL MANAGEMENT ---
export const getAllPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find().populate('employee').sort({ year: -1, month: -1 });
    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, allowances, deductions } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const basicSalary = employee.baseSalary;
    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      status: 'Processed'
    });

    res.status(201).json({ success: true, message: 'Payroll processed successfully', data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ANNOUNCEMENTS & POLICIES ---
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user.role
    });
    res.status(201).json({ success: true, message: 'Announcement posted', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPolicy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const policy = await Document.create({
      name: req.body.name || req.file.originalname,
      type: 'Policy',
      fileUrl: req.file.path,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Policy document uploaded successfully', data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
