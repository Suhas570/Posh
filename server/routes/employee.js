import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import {
  getDashboardData,
  clockIn,
  clockOut,
  applyLeave,
  getLeaves,
  getPayslips,
  getProfile,
  getPolicies,
  getNotifications,
  markNotificationRead
} from '../controllers/employeeController.js';

const router = express.Router();

// Apply auth protection to all employee routes
router.use(protect);

router.get('/dashboard', authorize('Employee'), getDashboardData);
router.post('/clock-in', authorize('Employee'), clockIn);
router.post('/clock-out', authorize('Employee'), clockOut);
router.post('/leave', authorize('Employee'), applyLeave);
router.get('/leaves', authorize('Employee'), getLeaves);
router.get('/payslips', authorize('Employee'), getPayslips);
router.get('/profile', authorize('Employee'), getProfile);
router.get('/policies', authorize('Employee'), getPolicies);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationRead);

export default router;
