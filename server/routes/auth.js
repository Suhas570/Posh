import express from 'express';
import { login, forgotPassword, resetPassword, registerUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/register', registerUser);

export default router;
