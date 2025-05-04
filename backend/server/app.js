// server/index.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import AppointmentRouter from "./routes/appointment.js";
import PredictionRouter from "./routes/prediction.js";
import ReminderRouter from "./routes/reminder.js";
<<<<<<< HEAD
import SummarizeRouter from "./routes/summarizer.js";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from 'path';
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import './services/cronJob.js';

// Resolve __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
=======
 main
>>>>>>> 187287bd0a1103b810bfeade1270c4218998d212

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
app.use(cors({
  origin: "http://localhost:5173", // Allow requests from this origin
  credentials: true, // Allow credentials
}));

// Middleware setup
app.use(express.json()); // Middleware for parsing JSON data
app.use(morgan("dev"));   // Logging middleware
<<<<<<< HEAD
app.use(cookieParser()); // Middleware for parsing cookies
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded data
=======
main
>>>>>>> 187287bd0a1103b810bfeade1270c4218998d212

// Routes
app.use("/api/appointment", AppointmentRouter);
app.use("/api/reminder", ReminderRouter);
app.use("/api/predict", PredictionRouter);
app.use("/api/summarize", SummarizeRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

export default app;
