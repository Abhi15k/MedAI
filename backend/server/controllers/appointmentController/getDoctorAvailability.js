import User from '../../models/user.js';
import Appointment from '../../models/appointmentModel.js';

// Get doctor availability slots
export const getDoctorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Find doctor
        const doctor = await User.findById(id);

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get doctor's availability schedule
        const requestedDate = new Date(date);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][requestedDate.getDay()];

        // Find the schedule for the requested day
        const daySchedule = doctor.doctorProfile.availabilitySchedule.find(
            schedule => schedule.day.toLowerCase() === dayOfWeek.toLowerCase()
        );

        if (!daySchedule) {
            return res.status(200).json({
                success: true,
                message: 'Doctor is not available on this day',
                data: { available: false, slots: [] }
            });
        }

        // Generate time slots (30 min increments)
        const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);

        // Find existing appointments for this doctor on this date
        const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

        const existingAppointments = await Appointment.find({
            doctor: id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'accepted'] }
        });

        // Filter out already booked slots
        const bookedSlots = existingAppointments.map(appointment => appointment.timeSlot);
        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({
            success: true,
            message: 'Availability retrieved successfully',
            data: {
                available: availableSlots.length > 0,
                slots: availableSlots
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching availability',
            error: error.message
        });
    }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
    ) {
        // Format the current time as HH:MM
        const formattedHour = currentHour.toString().padStart(2, '0');
        const formattedMinute = currentMinute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);

        // Move to next 30-minute slot
        currentMinute += 30;
        if (currentMinute >= 60) {
            currentHour += 1;
            currentMinute -= 60;
        }
    }

    return slots;
}