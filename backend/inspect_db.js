import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for inspection.\n");
    
    const adminEmail = 'admin@onitindia.com';
    const admin = await Employee.findOne({ email: adminEmail });
    
    if (admin) {
      console.log(`User found: ${adminEmail}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Password Hash (trimmed): ${admin.password.substring(0, 10)}...`);
      console.log(`Is Password Changed: ${admin.isPasswordChanged}`);
    } else {
      console.log(`User NOT FOUND: ${adminEmail}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error during inspection:", err);
    process.exit(1);
  }
};

inspect();
