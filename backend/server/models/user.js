const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    contactNumber: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // Patient-specific fields
    patientProfile: {
        bloodGroup: String,
        allergies: [String],
        medicalHistory: [
            {
                condition: String,
                diagnosedDate: Date,
                notes: String
            }
        ],
        medications: [
            {
                name: String,
                dosage: String,
                frequency: String,
                startDate: Date,
                endDate: Date
            }
        ]
    },
    // Doctor-specific fields
    doctorProfile: {
        specialization: String,
        licenseNumber: String,
        experience: Number,
        qualifications: [String],
        availabilitySchedule: [
            {
                day: String,
                startTime: String,
                endTime: String
            }
        ]
    },
    profileImage: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;