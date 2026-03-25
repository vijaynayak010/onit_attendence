import Employee from '../models/Employee.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });

    if (user && user.role === 'admin' && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        message: 'Admin logged in successfully',
        data: {
          token: generateToken(user._id, user.role),
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Employee login
// @route   POST /api/auth/employee/login
// @access  Public
export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });

    if (user && user.role === 'employee' && (await bcrypt.compare(password, user.password))) {
      if (!user.isPasswordChanged) {
        return res.json({
           success: true,
           message: 'Must change password before proceeding',
           data: {
             token: generateToken(user._id, user.role),
             _id: user._id,
             name: user.name,
             email: user.email,
             role: user.role,
             isPasswordChanged: false
           }
        });
      }

      res.json({
        success: true,
        message: 'Employee logged in successfully',
        data: {
          token: generateToken(user._id, user.role),
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPasswordChanged: user.isPasswordChanged
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid employee email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Change password (specifically for force change on first login)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // User is extracted from verify token middleware
    const user = await Employee.findById(req.user._id);

    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.isPasswordChanged = true;

      await user.save();

      res.json({
        success: true,
        message: 'Password initialized successfully. You can now use the dashboard.',
        data: {
          isPasswordChanged: true
        }
      });
    } else {
       res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
