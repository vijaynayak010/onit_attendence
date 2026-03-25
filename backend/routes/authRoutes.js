import express from 'express';
import { employeeLogin, adminLogin, changePassword } from '../controllers/authController.js';
import { validateLogin, validateChangePassword } from '../middleware/validator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/employee/login', validateLogin, employeeLogin);
router.post('/admin/login', validateLogin, adminLogin);
router.post('/change-password', protect, validateChangePassword, changePassword);

export default router;
