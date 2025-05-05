import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Changed from 'Doctor' to 'User' to match the controller
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    reason: {
        type: String,
        required: true
    },
    notes: {   // Renamed from 'note' to 'notes' to match frontend
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);