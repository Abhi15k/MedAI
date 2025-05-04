import Appointment from '../../models/appointmentModel.js';

export const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id; // From auth middleware
        const { status } = req.query;

        // Create base query
        const query = { patient: patientId };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Find appointments with populated doctor details
        const appointments = await Appointment.find(query)
            .populate({
                path: 'doctor',
                select: 'specialty consultationFee',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .sort({ date: 1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};