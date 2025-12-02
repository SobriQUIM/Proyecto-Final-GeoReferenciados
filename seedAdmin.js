const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@admin.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin
        await User.create({
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
