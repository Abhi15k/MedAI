// server/index.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import AppointmentRouter from "./routes/appointment.js";
import PredictionRouter from "./routes/prediction.js";
import ReminderRouter from "./routes/reminder.js";
import SummarizeRouter from "./routes/reminder.js";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import './services/cronJob.js';

// Config dotenv
dotenv.config({ path: "backend/server/.env" });

// Database config
connectDB();

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json()); // Middleware for parsing JSON data
app.use(morgan("dev"));   // Logging middleware

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Use environment variable if available
  credentials: true, // Critical for cookies to work cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookie parser with a secret key for signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET)); // Use a secret for signed cookies
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded data

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
