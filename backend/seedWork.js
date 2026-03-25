import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import WorkUpdate from './models/WorkUpdate.js';
import connectDB from './config/db.js';

dotenv.config();

const seedWork = async () => {
  try {
    await connectDB();
    
    // Find admin user
    const admin = await Employee.findOne({ email: 'admin@onitindia.com' });
    if (!admin) {
      console.log('Admin user not found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    const today = new Date();
    
    const dummyUpdates = [
      {
        employeeId: admin._id,
        taskTitle: 'API Integration and Testing',
        description: 'Completed end-to-end testing of authentication and attendance APIs. Everything works perfectly.',
        status: 'completed',
        date: today
      },
      {
        employeeId: admin._id,
        taskTitle: 'Dashboard UI Refinement',
        description: 'Refined the dashboard layout and added new statistics cards for better visualization of daily activity.',
        status: 'in-progress',
        date: today
      },
      {
        employeeId: admin._id,
        taskTitle: 'Bug Investigation: Session Timeout',
        description: 'Investigating reports of unexpected session timeouts when browsing the attendance history page.',
        status: 'in-progress',
        date: today
      }
    ];

    // Clear existing updates for this user for today to avoid duplicates if re-run
    await WorkUpdate.deleteMany({ 
      employeeId: admin._id,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999)
      }
    });

    await WorkUpdate.insertMany(dummyUpdates);
    
    console.log('Dummy work updates seeded successfully for admin@onitindia.com');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding work updates:', err);
    process.exit(1);
  }
};

seedWork();
