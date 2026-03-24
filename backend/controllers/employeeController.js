// Empty for now, generic employee endpoints (e.g. getProfile) could go here
// Add work update is handled in workController for cleaner resource management

export const getEmployeeProfile = async (req, res) => {
  try {
    const employee = req.user;
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        _id: employee._id,
        email: employee.email,
        role: employee.role,
        isPasswordChanged: employee.isPasswordChanged,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
