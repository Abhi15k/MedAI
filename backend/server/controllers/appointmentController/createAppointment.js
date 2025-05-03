import Appointment from '../../models/appointmentModel.js';
import User from '../../models/user.js';

// Create a new appointment
export const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        const patientId = req.user.id;

        // Validate required fields
        if (!doctorId || !date || !timeSlot || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: doctorId, date, timeSlot, reason'
            });
        }

        // Verify doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check if the slot is available
        const appointmentDate = new Date(date);
        const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            timeSlot,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please select another slot.'
            });
        }

        // Create new appointment
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            date: appointmentDate,
            timeSlot,
            reason,
            status: 'pending'
        });

        await appointment.save();

        // Populate appointment with doctor and patient info for response
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctor', 'name email doctorProfile.specialization')
            .populate('patient', 'name email');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error booking appointment',
            error: error.message
        });
    }
};