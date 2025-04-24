import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path: 'backend/server/.env'}); // Load environment variables from .env file

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('Error: MONGO_URI is not defined in the .env file');
    process.exit(1);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoURI); // Removed deprecated options
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;