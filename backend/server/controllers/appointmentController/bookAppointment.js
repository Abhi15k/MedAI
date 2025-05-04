import Appointment from '../../models/appointmentModel.js';
import Doctor from '../../models/doctorModel.js';
import { sendAppointmentEmail } from '../../services/sendEmail.js';

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason, notes } = req.body;
        const patientId = req.user.user._id; // From auth middleware

        if (!doctorId || !date || !timeSlot || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify the doctor exists
        const doctor = await Doctor.findById(doctorId).populate('userId');
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Verify the timeslot is valid and available
        const appointmentDate = new Date(date);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[appointmentDate.getDay()];

        // Check if doctor works on this day
        const doctorAvailability = doctor.availability[dayOfWeek] || [];
        if (doctorAvailability.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Doctor is not available on this day'
            });
        }

        // Check if timeslot is within doctor's working hours
        const isValidTimeSlot = doctorAvailability.some(slot => {
            return timeSlot.startTime >= slot.startTime && timeSlot.endTime <= slot.endTime;
        });

        if (!isValidTimeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Selected time slot is not within doctor\'s working hours'
            });
        }

        // Check if slot is already booked
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            'timeSlot.startTime': timeSlot.startTime,
            status: { $nin: ['cancelled', 'rejected'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        // Create the appointment
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            date: appointmentDate,
            timeSlot,
            reason,
            notes,
            status: 'pending'
        });

        await newAppointment.save();

        // Populate doctor and patient details for the response
        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('patientId', 'name email')
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        // Send confirmation email to patient and notification to doctor
        try {
            await sendAppointmentEmail({
                email: req.user.user.email,
                name: req.user.user.name,
                doctorName: doctor.userId.name,
                date: appointmentDate,
                time: timeSlot.startTime,
                subject: "Appointment Requested"
            });
        } catch (emailError) {
            console.error("Error sending appointment email:", emailError);
            // Don't fail the request if email sending fails
        }

        return res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedAppointment
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error booking appointment',
            error: error.message
        });
    }
};