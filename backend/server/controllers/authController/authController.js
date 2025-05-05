import { validationResult } from "express-validator";
import { registerValidator, loginValidator } from "../../utils/userValidator.js";
import User from "../../models/userModel.js";
import Doctor from "../../models/doctorModel.js"; // Added Doctor model import
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../../utils/jwtTokenGenerator.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    await Promise.all(registerValidator.map(validator => validator.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, specialty } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: `User with email ${email} already exists. Try to login.` });
        }

        const newUser = new User({
            name,
            email,
            password,
            role
        });

        const savedUser = await newUser.save();

        // If the user is registering as a doctor, create a doctor profile
        let doctorProfile = null;
        if (role === 'doctor') {
            // Create basic doctor profile
            const newDoctor = new Doctor({
                user: savedUser._id,
                specialty: specialty || "General Medicine", // Default if not provided
                qualifications: [],
                experience: 0,
                bio: `Dr. ${name}'s profile`,
                consultationFee: 0,
                availableSlots: [] // Empty initially, to be set up later
            });

            doctorProfile = await newDoctor.save();
            console.log(`Created doctor profile for user ${email} with ID ${doctorProfile._id}`);
        }

        const accessToken = generateAccessToken(savedUser);

        // Format response
        const userResponse = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role
        };

        // Add doctor profile to response if created
        if (doctorProfile) {
            userResponse.doctorProfile = {
                _id: doctorProfile._id,
                specialty: doctorProfile.specialty,
                qualifications: doctorProfile.qualifications,
                experience: doctorProfile.experience,
                consultationFee: doctorProfile.consultationFee,
                bio: doctorProfile.bio
            };
        }

        res.status(201).json({
            message: `User with email ${email} created successfully`,
            accessToken,
            user: userResponse
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const login = async (req, res) => {
    await Promise.all(loginValidator.map(validator => validator.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: `${email} does not exist try creating an account` });
        }

        // Direct password comparison using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Failed login attempt for ${email}: Invalid password`);
            return res.status(401).json({ message: "Invalid Password try again" });
        }

        // Check if the user is a doctor and get doctor details if applicable
        let doctorDetails = null;
        if (user.role === 'doctor') {
            doctorDetails = await Doctor.findOne({ user: user._id });
            if (!doctorDetails) {
                console.log(`Warning: User ${email} has doctor role but no doctor profile found`);
            } else {
                console.log(`Doctor profile found for ${email}`);
            }
        }

        // Generate access token
        const accessToken = generateAccessToken(user);

        // Set refresh token cookie (httpOnly for security)
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === 'production', // secure in production
            sameSite: 'strict'
        });

        // Create a response object with the user data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // If this is a doctor, add the doctor details to the response
        if (doctorDetails) {
            userResponse.doctorProfile = {
                _id: doctorDetails._id,
                specialty: doctorDetails.specialty,
                qualifications: doctorDetails.qualifications,
                experience: doctorDetails.experience,
                consultationFee: doctorDetails.consultationFee,
                bio: doctorDetails.bio,
                availableSlots: doctorDetails.availableSlots,
                ratings: doctorDetails.ratings
            };
        }

        // Send successful response with combined user and doctor data
        res.status(200).json({
            message: `logged in successfully: ${email}`,
            accessToken,
            user: userResponse
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// New refresh token endpoint
export const refreshToken = async (req, res) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        // Find user by id from decoded token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user);

        // Create the user response object
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Check if the user is a doctor and get doctor details if applicable
        if (user.role === 'doctor') {
            const doctorDetails = await Doctor.findOne({ user: user._id });
            if (doctorDetails) {
                userResponse.doctorProfile = {
                    _id: doctorDetails._id,
                    specialty: doctorDetails.specialty,
                    qualifications: doctorDetails.qualifications,
                    experience: doctorDetails.experience,
                    consultationFee: doctorDetails.consultationFee,
                    bio: doctorDetails.bio,
                    availableSlots: doctorDetails.availableSlots,
                    ratings: doctorDetails.ratings
                };
            }
        }

        // Send new access token and user data
        return res.status(200).json({
            accessToken,
            user: userResponse
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
}

// Add logout function
export const logout = async (req, res) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({ message: "Logout failed", error: error.message });
    }
};

