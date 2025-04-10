import mongoose from 'mongoose';
import 'dotenv/config'; // To use environment variables

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};

export default connectDB;
