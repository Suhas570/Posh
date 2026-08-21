import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import {
  getICCases,
  getICCaseDetails,
  startInvestigation,
  assignInvestigator,
  updateInvestigationNotes,
  addWitnessStatement,
  closeCase,
  rejectCase
} from '../controllers/icController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Internal Committee'));

router.get('/cases', getICCases);
router.get('/cases/:id', getICCaseDetails);
router.put('/cases/:id/start-investigation', startInvestigation);
router.put('/cases/:id/assign-investigator', assignInvestigator);
router.put('/cases/:id/notes', updateInvestigationNotes);
router.post('/cases/:id/witness', addWitnessStatement);
router.put('/cases/:id/close', closeCase);
router.put('/cases/:id/reject', rejectCase);

export default router;
