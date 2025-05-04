import mongoose from "mongoose";
import { calculateNextRunAt } from "../utils/calculateNextRun.js";


const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicine: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  time: {
    type: String,
    required: true,
    trim: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  frequency: {
    type: String,
    required: true,
    enum: ["Daily", "Weekly", "Monthly"],
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxLength: 100,
    required: true
  },
  nextRunAt: {
    type: Date,
  }
}, {
  timestamps: true
});


// Auto-calculate nextRunAt before save for scheduling reminders
medicineSchema.pre('save', function (next) {
  if (!this.nextRunAt) {
    this.nextRunAt = calculateNextRunAt(this.startDate, this.time, this.frequency);
  }
  next();
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
