import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();
    const adminEmail = 'admin@onitindia.com';
    const adminPassword = 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    const existingAdmin = await Employee.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      await Employee.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isPasswordChanged: true,
        name: 'System Admin'
      });
      console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin'; // Ensure role is correct
      existingAdmin.isPasswordChanged = true;
      await existingAdmin.save();
      console.log(`Admin user password reset: ${adminEmail} / ${adminPassword}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
