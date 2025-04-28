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


// Config dotenv
dotenv.config({ path: "backend/server/.env" });

// Database config
connectDB();

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json()); // Middleware for parsing JSON data
app.use(morgan("dev"));   // Logging middleware
app.use(cors()); // Enable CORS for all routes
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
  response.send("Server is up and running");
});

export default app;
