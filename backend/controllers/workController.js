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
    const updates = await WorkUpdate.find().populate('employeeId', 'email').sort({ date: -1 });

    const formattedUpdates = updates.map(update => {
      // Trying to get username from email if name doesn't exist. Model only has 'email'.
      const employeeName = update.employeeId ? update.employeeId.email.split('@')[0] : 'Unknown';
      
      return {
        employeeName,
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
// @desc    Employee gets their own work updates
// @route   GET /api/employee/work-updates
// @access  Private/Employee
export const getMyWorkUpdates = async (req, res) => {
  try {
    const updates = await WorkUpdate.find({ employeeId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    res.json({
      success: true,
      message: 'My work updates retrieved successfully',
      data: updates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
