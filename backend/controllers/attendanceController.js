import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// Helper: get today's date string YYYY-MM-DD (IST-aware)
const todayStr = () => {
  const now = new Date();
  // offset to IST (UTC+5:30)
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
};

// Determine status based on total minutes worked
const computeStatus = (minutes) => {
  if (minutes == null) return 'absent';
  if (minutes >= 480) return 'present';       // 8+ hours
  return 'partially-present';                  // checked in & out but < 8h
};

// @desc    Employee checks in
// @route   POST /api/attendance/check-in
// @access  Employee
export const checkIn = async (req, res) => {
  try {
    const today = todayStr();
    
    // Check if today is Sunday (0) in IST
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    if (ist.getDay() === 0) {
      return res.status(400).json({ success: false, message: 'Check-in is not allowed on Sundays. It is a weekly off.' });
    }

    const existing = await Attendance.findOne({ employeeId: req.user._id, date: today });

    if (existing && existing.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const record = existing
      ? existing
      : new Attendance({ employeeId: req.user._id, date: today });

    record.checkIn = new Date();
    record.status = 'partially-present'; // checked in but not out yet
    await record.save();

    res.json({ success: true, message: 'Checked in successfully', data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Employee checks out
// @route   POST /api/attendance/check-out
// @access  Employee
export const checkOut = async (req, res) => {
  try {
    const today = todayStr();
    const record = await Attendance.findOne({ employeeId: req.user._id, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'You have not checked in today' });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    record.checkOut = new Date();
    const diffMs = record.checkOut - record.checkIn;
    const totalMinutes = Math.round(diffMs / 60000);
    record.totalHours = totalMinutes;
    record.status = computeStatus(totalMinutes);
    await record.save();

    res.json({ success: true, message: 'Checked out successfully', data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    const filter = { employeeId: req.user._id };
    
    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(month ? 100 : 30);

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get all employees' attendance for a date or last 30 days (admin)
// @route   GET /api/attendance/all?date=YYYY-MM-DD
// @access  Admin
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filterDate = date || todayStr();

    // Get all employees
    const allEmployees = await Employee.find({ role: 'employee' }).select('email _id joiningDate');

    // Get attendance records for that date
    const records = await Attendance.find({ date: filterDate }).populate('employeeId', 'email joiningDate');

    // Build a map by employeeId for quick lookup
    const recordMap = {};
    records.forEach((r) => {
      if (r.employeeId) recordMap[r.employeeId._id.toString()] = r;
    });

    // Merge: all employees get a row; absent if no record
    const result = allEmployees.map((emp) => {
      const r = recordMap[emp._id.toString()];
      return {
        employeeId: emp._id,
        employeeName: emp.email.split('@')[0],
        employeeEmail: emp.email,
        joiningDate: emp.joiningDate,
        date: filterDate,
        checkIn: r?.checkIn || null,
        checkOut: r?.checkOut || null,
        totalHours: r?.totalHours ?? null,
        status: r ? r.status : 'absent',
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getEmployeeAttendanceByAdmin = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query; // format: YYYY-MM
    const filter = { employeeId };
    
    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(month ? 100 : 60); 

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
