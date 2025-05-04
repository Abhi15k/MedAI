import Appointment from '../../models/appointmentModel.js';
import Doctor from '../../models/doctorModel.js';
import User from '../../models/userModel.js';
import { sendAppointmentEmail } from '../../services/sendEmail.js';

export const manageAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, doctorNotes } = req.body;
        const userId = req.user.user._id; // From auth middleware

        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Appointment ID and status are required'
            });
        }

        // Validate status
        if (!['confirmed', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be confirmed, rejected, or completed'
            });
        }

        // Find appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Verify the user is authorized to manage this appointment
        // Only the doctor assigned to this appointment can manage it
        const doctor = await Doctor.findOne({ userId });

        if (!doctor || !appointment.doctorId.equals(doctor._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to manage this appointment'
            });
        }

        // Update appointment
        appointment.status = status;

        if (doctorNotes) {
            appointment.doctorNotes = doctorNotes;
        }

        await appointment.save();

        // Fetch patient details for notifications
        const patient = await User.findById(appointment.patientId);
        const doctorUser = await User.findById(userId);

        // Send email to patient about appointment status change
        try {
            await sendAppointmentEmail({
                email: patient.email,
                name: patient.name,
                doctorName: doctorUser.name,
                date: appointment.date,
                time: appointment.timeSlot.startTime,
                status: status,
                notes: doctorNotes,
                subject: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`
            });
        } catch (emailError) {
            console.error("Error sending appointment update email:", emailError);
            // Don't fail the request if email sending fails
        }

        return res.status(200).json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: appointment
        });

    } catch (error) {
        console.error('Error updating appointment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
            error: error.message
        });
    }
};