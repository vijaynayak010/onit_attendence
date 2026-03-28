import WorkUpdate from '../models/WorkUpdate.js';

// @desc    Employee adds regular work update
// @route   POST /api/employee/add-work
// @access  Private/Employee
export const addWork = async (req, res) => {
  try {
    const { taskTitle, description, status } = req.body;

    const workUpdate = await WorkUpdate.create({
      employeeId: req.user._id,
      taskTitle,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Work update added successfully',
      data: workUpdate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Admin gets work updates
// @route   GET /api/admin/work-updates
// @access  Private/Admin
export const getWorkUpdates = async (req, res) => {
  try {
    const { date, employeeId, month } = req.query; // Added month
    let query = {};

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth = new Date(year, m, 1);
      query.date = { $gte: startOfMonth, $lt: endOfMonth };
    } else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const updates = await WorkUpdate.find(query)
      .populate('employeeId', 'email joiningDate')
      .sort({ date: -1 });

    const formattedUpdates = updates.map(update => {
      const employeeName = update.employeeId ? update.employeeId.email.split('@')[0] : 'Unknown';
      
      return {
        _id: update._id,
        employeeName,
        joiningDate: update.employeeId?.joiningDate,
        date: update.date.toISOString().split('T')[0], // YYYY-MM-DD
        taskTitle: update.taskTitle,
        description: update.description,
        status: update.status
      };
    });

    res.json({
      success: true,
      message: 'Work updates retrieved successfully',
      data: formattedUpdates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Employee gets their own work updates (or admin gets their own)
// @route   GET /api/employee/work-updates
// @access  Private
export const getMyWorkUpdates = async (req, res) => {
  try {
    const { date, month } = req.query;
    let query = { employeeId: req.user._id };

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth = new Date(year, m, 1);
      query.date = { $gte: startOfMonth, $lt: endOfMonth };
    } else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const updates = await WorkUpdate.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'My work updates retrieved successfully',
      data: updates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
