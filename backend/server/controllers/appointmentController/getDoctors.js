import Doctor from '../../models/doctorModel.js';
import User from '../../models/userModel.js';

export const getDoctors = async (req, res) => {
    try {
        const { specialty, name } = req.query;
        let query = {};

        // Apply specialty filter if provided
        if (specialty) {
            query.specialty = specialty;
        }

        // Find doctors with optional filters
        const doctors = await Doctor.find(query).populate({
            path: 'user',
            select: 'name email role'
        });

        // Apply name filter if provided (case-insensitive)
        let filteredDoctors = doctors;
        if (name) {
            const nameRegex = new RegExp(name, 'i');
            filteredDoctors = doctors.filter(doctor =>
                nameRegex.test(doctor.user?.name)
            );
        }

        // Format response with consistent structure
        const formattedDoctors = filteredDoctors.map(doctor => {
            // Handle potentially missing user data
            const userData = doctor.user || {};

            return {
                id: doctor._id,
                userId: userData._id || null,
                name: userData.name || 'Unknown Doctor',
                email: userData.email || '',
                specialties: Array.isArray(doctor.specialty) ?
                    doctor.specialty :
                    (doctor.specialty ? [doctor.specialty] : []),
                qualifications: doctor.qualifications || [],
                experience: doctor.experience || 0,
                bio: doctor.bio || '',
                consultationFee: doctor.consultationFee || 0,
                rating: doctor.ratings?.average || 0,
                reviewCount: doctor.ratings?.count || 0
            };
        });

        res.status(200).json({
            success: true,
            count: formattedDoctors.length,
            data: formattedDoctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};

export default getDoctors;