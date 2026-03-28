import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

// @desc    Admin creates and assigns a task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    // Create Notification for the assigned employee
    await Notification.create({
      recipient: assignedTo,
      sender: req.user._id,
      message: `A new task "${title}" has been assigned to you.`,
      type: 'task_assigned',
      relatedId: task._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Admin gets all tasks
// @route   GET /api/tasks/admin
// @access  Private/Admin
export const getAdminTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'email name role')
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Employee gets their assigned tasks
// @route   GET /api/tasks/my
// @access  Private
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Role check: Only admin or the assigned employee can update status
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    // Create Notification about status change
    // If employee updates, notify the creator (admin)
    // If admin updates, notify the assignedTo (employee)
    const isAdmin = req.user.role === 'admin';
    const recipient = isAdmin ? task.assignedTo : task.createdBy;
    const sender = req.user._id;

    if (recipient.toString() !== sender.toString()) {
      await Notification.create({
        recipient,
        sender,
        message: `${isAdmin ? 'Admin' : 'Employee'} marked task "${task.title}" as ${status.replace('-', ' ')}.`,
        type: 'task_updated',
        relatedId: task._id,
      });
    }

    res.json({
      success: true,
      message: 'Task status updated',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
