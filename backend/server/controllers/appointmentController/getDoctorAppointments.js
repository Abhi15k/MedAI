import Doctor from '../../models/doctorModel.js';
import Appointment from '../../models/appointmentModel.js';

export const getDoctorAppointments = async (req, res) => {
    try {
        // Get the user ID from the authenticated user object
        const userId = req.user.user._id;
        console.log("Fetching appointments for doctor with user ID:", userId);
        const { status, date } = req.query;

        // Since appointments reference doctor as User ID, not Doctor ID
        // We can directly query appointments by user ID
        const query = { doctor: userId };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Add date filter if provided
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = { $gte: startDate, $lte: endDate };
        }

        // Find appointments with populated patient details
        const appointments = await Appointment.find(query)
            .populate('patient', 'name email profileImage')
            .sort({ date: 1 });

        console.log(`Found ${appointments.length} appointments for doctor user ID ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};