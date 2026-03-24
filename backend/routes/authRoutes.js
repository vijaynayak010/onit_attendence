import express from 'express';
import { adminLogin, employeeLogin, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/employee/login', employeeLogin);
router.post('/change-password', protect, changePassword);

export default router;
