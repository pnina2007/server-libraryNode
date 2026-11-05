const mongoose = require('mongoose');

// כתובת החיבור למונגו מתוך משתני הסביבה
const DB = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(DB);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
};

module.exports = connectDB;