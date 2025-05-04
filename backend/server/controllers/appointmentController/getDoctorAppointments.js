import Doctor from '../../models/doctorModel.js';
import Appointment from '../../models/appointmentModel.js';

export const getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, date } = req.query;

        // Find the doctor profile associated with this user
        const doctor = await Doctor.findOne({ user: userId });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        // Create base query
        const query = { doctor: doctor._id };

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
            .populate('patient', 'name email')
            .sort({ date: 1, timeSlot: 1 });

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