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
        // Get lowercase day name (monday, tuesday, etc.) to match our schema
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[requestedDate.getDay()];

        // Get doctor's regular availability for that day
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get doctor's scheduled availability for that day
        const doctorAvailability = doctor.availability[dayOfWeek] || [];
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

        // Create available time slots (30-minute intervals)
        const availableSlots = [];

        doctorAvailability.forEach(slot => {
            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);

            let currentTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;

            // Create 30-minute slots
            while (currentTime + 30 <= endTime) {
                const slotStartHour = Math.floor(currentTime / 60);
                const slotStartMinute = currentTime % 60;

                const slotEndHour = Math.floor((currentTime + 30) / 60);
                const slotEndMinute = (currentTime + 30) % 60;

                const startTimeString = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
                const endTimeString = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;

                // Check if this slot is already booked
                const isBooked = bookedAppointments.some(appointment =>
                    appointment.timeSlot.startTime === startTimeString
                );

                if (!isBooked) {
                    availableSlots.push({
                        startTime: startTimeString,
                        endTime: endTimeString
                    });
                }

                currentTime += 30; // Move to next 30-minute slot
            }
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