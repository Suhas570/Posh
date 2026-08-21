import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import {
  getSuperAdminDashboard,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getUsers,
  updateUserRole,
  triggerBackup
} from '../controllers/superAdminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin'));

router.get('/dashboard', getSuperAdminDashboard);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.post('/backup', triggerBackup);

export default router;
