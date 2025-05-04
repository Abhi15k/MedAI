// server/index.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import AppointmentRouter from "./routes/appointment.js";
import PredictionRouter from "./routes/prediction.js";
import ReminderRouter from "./routes/reminder.js";
import SummarizeRouter from "./routes/reminder.js";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from 'path';

// Resolve __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('Environment variables loaded:', process.env);
console.log('Starting application...');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Database config
connectDB();

// Initialize express app
const app = express();

// Enable CORS
app.use(cors());

// Middleware setup
app.use('/api/summarize', SummarizeRouter); // Ensure multer middleware handles multipart/form-data before express.json()
app.use(express.json()); // Middleware for parsing JSON data
app.use(morgan("dev"));   // Logging middleware
// app.set('trust proxy', true);

// Routes
app.use("/api/appointment", AppointmentRouter);
app.use("/api/reminder", ReminderRouter);
app.use("/api/predict", PredictionRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});

// Root endpoint
app.get("/", (req, res) => {
  response.send("Server is up and running");
});

export default app;
