import express from 'express';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee, resetPassword } from '../controllers/adminController.js';
import { getWorkUpdates } from '../controllers/workController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin operations
router.post('/create-employee', protect, adminOnly, createEmployee);
router.get('/work-updates', protect, adminOnly, getWorkUpdates);

// Employee Management
router.get('/employees', protect, adminOnly, getEmployees);
router.put('/employee/:id', protect, adminOnly, updateEmployee);
router.delete('/employee/:id', protect, adminOnly, deleteEmployee);
router.put('/employee/:id/reset-password', protect, adminOnly, resetPassword);

export default router;
