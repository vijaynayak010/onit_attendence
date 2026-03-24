import Employee from '../models/Employee.js';
import bcrypt from 'bcrypt';

// @desc    Admin creates employee
// @route   POST /api/admin/create-employee
// @access  Private/Admin
export const createEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await Employee.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Employee already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
      email,
      password: hashedPassword,
      role: 'employee',
      isPasswordChanged: false,
    });

    if (employee) {
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          _id: employee._id,
          email: employee.email,
          role: employee.role,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid employee data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'employee' }).select('-password');
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employee/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  try {
    const { email, role } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (email) employee.email = email;
    if (role) employee.role = role;

    await employee.save();

    res.json({ success: true, message: 'Employee updated successfully', data: { _id: employee._id, email: employee.email, role: employee.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employee/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.deleteOne();

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Reset Employee Password
// @route   PUT /api/admin/employee/:id/reset-password
// @access  Private/Admin
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);
    employee.isPasswordChanged = false; // force change on next login if desired

    await employee.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
