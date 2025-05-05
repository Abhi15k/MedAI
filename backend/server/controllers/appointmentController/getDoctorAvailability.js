import Doctor from '../../models/doctorModel.js';
import Appointment from '../../models/appointmentModel.js';

export const getDoctorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID and date are required'
            });
        }

        // Parse the requested date
        const requestedDate = new Date(date);
        // Get day name (Monday, Tuesday, etc.) to match our schema
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[requestedDate.getDay()];

        // Get doctor's regular availability for that day
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Find the availability data for the requested day from availableSlots array
        const daySchedule = doctor.availableSlots?.find(slot => slot.day === dayOfWeek);
        const doctorAvailability = [];

        // If doctor has slots for this day, convert them to the format expected by the frontend
        if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
            daySchedule.slots.forEach(slotStr => {
                // Parse the slot string format (e.g., "09:00-09:30")
                const [startTime, endTime] = slotStr.split('-');
                if (startTime && endTime) {
                    doctorAvailability.push({ startTime, endTime });
                }
            });
        }

        if (doctorAvailability.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Doctor is not available on this day',
                data: []
            });
        }

        // Get existing appointments for that day
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctorId: id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $nin: ['cancelled', 'rejected'] }
        });

        // Filter out already booked slots
        const availableSlots = doctorAvailability.filter(slot => {
            return !bookedAppointments.some(appointment =>
                appointment.timeSlot.startTime === slot.startTime
            );
        });

        res.status(200).json({
            success: true,
            data: availableSlots
        });

    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor availability',
            error: error.message
        });
    }
};