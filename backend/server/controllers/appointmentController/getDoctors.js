import Appointment from '../../models/appointmentModel.js';
import User from '../../models/user.js';

// Get all doctors with optional filters

export const getDoctors = async (req, res) => {
    try {
        const { specialty, name, date } = req.query;

        // Build query filter
        const filter = { role: 'doctor', isActive: true };

        // Add specialty filter if provided
        if (specialty) {
            filter['doctorProfile.specialization'] = { $regex: specialty, $options: 'i' };
        }

        // Add name filter if provided
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Find doctors matching the criteria
        const doctors = await User.find(filter).select(
            'name email doctorProfile profileImage'
        );

        res.status(200).json({
            success: true,
            message: 'Doctors retrieved successfully',
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};