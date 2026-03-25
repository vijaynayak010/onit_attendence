import express from 'express';
import { addWork, getMyWorkUpdates } from '../controllers/workController.js';
import { getEmployeeProfile } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { employeeOnly } from '../middleware/roleMiddleware.js';
import { validateWorkUpdate } from '../middleware/validator.js';

const router = express.Router();

// Routes require employee privileges
router.post('/add-work', protect, employeeOnly, validateWorkUpdate, addWork);
router.get('/work-updates', protect, employeeOnly, getMyWorkUpdates);
router.get('/profile', protect, employeeOnly, getEmployeeProfile);

export default router;
