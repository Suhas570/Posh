import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import upload from '../middleware/multer.js';
import {
  getAdminDashboard,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  updateDepartment,
  getAllLeaves,
  reviewLeave,
  getAllAttendance,
  getAllPayroll,
  processPayroll,
  createAnnouncement,
  uploadPolicy
} from '../controllers/adminController.js';
import POSHComplaint from '../models/POSHComplaint.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getAdminDashboard);

// Employee Management
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Department Management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);

// Attendance Management
router.get('/attendance', getAllAttendance);

// Leave Approval
router.get('/leaves', getAllLeaves);
router.put('/leaves/:id/review', reviewLeave);

// Payroll Processing
router.get('/payroll', getAllPayroll);
router.post('/payroll/process', processPayroll);

// Broadcasts & Policies
router.post('/announcements', createAnnouncement);
router.post('/policies', upload.single('policy'), uploadPolicy);

// Admin POSH Management (Normal Complaints ONLY)
router.get('/posh-cases', async (req, res) => {
  try {
    const normalCases = await POSHComplaint.find({ isAnonymous: false })
      .populate({
        path: 'complainant',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: normalCases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/posh-cases/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { investigatorName } = req.body;

    const caseRecord = await POSHComplaint.findOne({ _id: id, isAnonymous: false });
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Normal case not found' });
    }

    caseRecord.assignedInvestigator = investigatorName;
    caseRecord.status = 'Assigned';
    caseRecord.timeline.push({
      status: 'Assigned',
      remarks: `Admin assigned case investigator: ${investigatorName}`,
      updatedBy: 'Admin'
    });

    await caseRecord.save();

    // Notify IC members
    const icUsers = await User.find({ role: 'Internal Committee' });
    for (const icUser of icUsers) {
      await Notification.create({
        recipient: icUser._id,
        title: 'POSH Case Assigned',
        message: `Admin assigned ${investigatorName} to Normal POSH Case ID: ${caseRecord.complaintId}`
      });
    }

    res.status(200).json({ success: true, message: 'Case assigned to investigator successfully', data: caseRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
