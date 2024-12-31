import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js'; // Adjust the path to your User schema file
import { ROLES } from './utils/constants.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if an admin user already exists
    const exisctingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      return;
    }

    // Create the admin user
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin1234', // Replace with a secure password
      role: ROLES.ADMIN,
      batch: 'a2', // Replace with valid branch if needed // Replace with valid batch if needed
    };

    const adminUser = new User(adminData);

    // Save the admin user
    await adminUser.save();
    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

createAdmin();