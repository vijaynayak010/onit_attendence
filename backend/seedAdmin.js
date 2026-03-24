import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();
    const existingAdmin = await Employee.findOne({ email: 'admin@onitindia.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await Employee.create({
        email: 'admin@onitindia.com',
        password: hashedPassword,
        role: 'admin',
        isPasswordChanged: true
      });
      console.log('Admin user seeded: admin@onitindia.com / admin123');
    } else {
      console.log('Admin user already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
