import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    qualifications: {
        type: [String],
        default: []
    },
    experience: {
        type: Number, // years of experience
        default: 0
    },
    bio: {
        type: String
    },
    consultationFee: {
        type: Number,
        default: 0
    },
    availableSlots: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        slots: [{
            type: String // Format: "09:00-09:30"
        }]
    }],
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);