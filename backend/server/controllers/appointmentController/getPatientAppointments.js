import Appointment from '../../models/appointmentModel.js';

// Get all appointments for a patient
export const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;

        const appointments = await Appointment.find({ patient: patientId })
            .populate('doctor', 'name email doctorProfile.specialization profileImage')
            .sort({ date: -1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};