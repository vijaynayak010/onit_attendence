import express from 'express';
import { addWork } from '../controllers/workController.js';
import { getEmployeeProfile } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { employeeOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Routes require employee privileges
router.post('/add-work', protect, employeeOnly, addWork);
router.get('/profile', protect, employeeOnly, getEmployeeProfile);

export default router;
