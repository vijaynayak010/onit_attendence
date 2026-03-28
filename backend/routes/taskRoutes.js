import express from 'express';
import { createTask, getAdminTasks, getMyTasks, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/', protect, adminOnly, createTask);
router.get('/admin', protect, adminOnly, getAdminTasks);
router.delete('/:id', protect, adminOnly, deleteTask);

// Common routes
router.get('/my', protect, getMyTasks);
router.patch('/:id/status', protect, updateTaskStatus);

export default router;
