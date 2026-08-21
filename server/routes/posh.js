import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import upload from '../middleware/multer.js';
import { submitComplaint, getEmployeeComplaints } from '../controllers/poshController.js';

const router = express.Router();

router.use(protect);

// Employee POSH actions
router.post('/submit', authorize('Employee'), upload.single('evidence'), submitComplaint);
router.get('/my-complaints', authorize('Employee'), getEmployeeComplaints);

export default router;
