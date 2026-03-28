import express from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getEmployeeAttendanceByAdmin } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, employeeOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my', protect, getMyAttendance);

// Admin routes
router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/employee/:employeeId', protect, adminOnly, getEmployeeAttendanceByAdmin);

export default router;
