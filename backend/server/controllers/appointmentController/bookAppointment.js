import Appointment from '../../models/appointmentModel.js';
import Doctor from '../../models/doctorModel.js';
import User from '../../models/user.js';

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason, notes } = req.body;

        // Get patient ID from the auth middleware
        // The JWT payload structure has the user info in req.user.user
        const patientId = req.user.user._id;

        console.log("Booking request received:", { doctorId, date, patientId });

        if (!doctorId || !date || !timeSlot || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate timeSlot has both startTime and endTime
        if (!timeSlot.startTime || !timeSlot.endTime) {
            return res.status(400).json({
                success: false,
                message: 'TimeSlot must include startTime and endTime'
            });
        }

        // Get doctor information
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get doctor's user profile for name/email
        const doctorUser = await User.findById(doctor.user);

        // Parse the requested date
        const appointmentDate = new Date(date);

        // Get day name (Monday, Tuesday, etc.) to match our schema
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[appointmentDate.getDay()];

        console.log(`Checking availability for ${dayOfWeek}`);

        // Find the availability for the requested day
        const daySchedule = doctor.availableSlots?.find(slot => slot.day === dayOfWeek);

        if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Doctor is not available on this day'
            });
        }

        // Check if the timeslot is valid
        const requestedSlot = `${timeSlot.startTime}-${timeSlot.endTime}`;
        const isValidSlot = daySchedule.slots.includes(requestedSlot);

        if (!isValidSlot) {
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
            doctor: doctorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            'timeSlot.startTime': timeSlot.startTime,
            'timeSlot.endTime': timeSlot.endTime,
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
            patient: patientId,
            doctor: doctorId,
            date: appointmentDate,
            timeSlot: {
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime
            },
            reason,
            notes: notes || "",
            status: 'pending'
        });

        console.log("Creating appointment:", newAppointment);
        await newAppointment.save();

        // Populate doctor and patient details for the response
        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('patient', 'name email')
            .populate('doctor', 'name email');

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