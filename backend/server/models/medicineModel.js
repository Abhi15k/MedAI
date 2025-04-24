import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
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
    default: Date.now,
    required: false 
  },
  notes: {
    type: String,
    trim: true,
    maxLength: 100, 
    required: false 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine; 