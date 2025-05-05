import Appointment from '../../models/appointmentModel.js';

export const getPatientAppointments = async (req, res) => {
    try {
        // Update to access the patient ID from the nested user object
        const patientId = req.user.user._id;
        console.log("Fetching appointments for patient ID:", patientId);
        const { status } = req.query;

        // Create base query
        const query = { patient: patientId };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Find appointments with properly populated doctor details
        const appointments = await Appointment.find(query)
            // First populate the doctor field which references the Doctor model
            .populate({
                path: 'doctor',
                select: 'specialty consultationFee experience bio qualifications availableSlots ratings',
                // Then populate the user field within the doctor which contains name and email
                populate: {
                    path: 'user',
                    select: 'name email profileImage'
                }
            })
            .sort({ date: 1, timeSlot: 1 });

        console.log(`Found ${appointments.length} appointments for patient ${patientId}`);

        // Transform appointments to ensure doctor name is accessible in expected format
        const formattedAppointments = appointments.map(appointment => {
            const appointmentObj = appointment.toObject();

            // Make doctor name more directly accessible
            if (appointmentObj.doctor && appointmentObj.doctor.user) {
                appointmentObj.doctorName = appointmentObj.doctor.user.name;
                appointmentObj.doctorEmail = appointmentObj.doctor.user.email;
                appointmentObj.doctorProfileImage = appointmentObj.doctor.user.profileImage;
            }

            return appointmentObj;
        });

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: formattedAppointments
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};