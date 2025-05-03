import Appointment from '../../models/appointmentModel.js';

// Update appointment status (accept/reject)
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Status must be "accepted" or "rejected"'
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

        // Check authorization (only the assigned doctor or admin can update status)
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        // Update appointment
        appointment.status = status;
        if (notes) {
            appointment.notes = notes;
        }

        await appointment.save();

        // Return updated appointment
        const updatedAppointment = await Appointment.findById(id)
            .populate('doctor', 'name email doctorProfile.specialization')
            .populate('patient', 'name email');

        res.status(200).json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
            error: error.message
        });
    }
};