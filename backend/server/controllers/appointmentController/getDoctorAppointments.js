import Appointment from '../../models/appointmentModel.js';

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const appointments = await Appointment.find({ doctor: doctorId })
            .populate('patient', 'name email patientProfile.medicalHistory profileImage')
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