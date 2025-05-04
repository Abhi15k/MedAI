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
                nameRegex.test(doctor.user.name)
            );
        }

        // Format response
        const formattedDoctors = filteredDoctors.map(doctor => ({
            id: doctor._id,
            userId: doctor.user._id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialties: [doctor.specialty], // Convert single specialty to array for frontend compatibility
            qualifications: doctor.qualifications || [],
            experience: doctor.experience,
            bio: doctor.bio,
            consultationFee: doctor.consultationFee,
            rating: doctor.ratings?.average || 0,
            reviewCount: doctor.ratings?.count || 0
        }));

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