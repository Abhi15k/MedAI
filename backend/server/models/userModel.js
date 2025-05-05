import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Check if the model exists already to prevent recompilation
const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
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
        default: 'patient',
        required: true
    },
    fcmToken: {
        type: String,
        default: null
    },

}, {
    timestamps: true
}));

// Hash password before saving
UserModel.schema.pre('save', async function (next) {
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
UserModel.schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default UserModel;