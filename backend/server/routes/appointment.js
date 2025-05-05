import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { getDoctors } from '../controllers/appointmentController/getDoctors.js';
import { getDoctorAvailability } from '../controllers/appointmentController/getDoctorAvailability.js';
import { bookAppointment } from '../controllers/appointmentController/bookAppointment.js';
import { getPatientAppointments } from '../controllers/appointmentController/getPatientAppointments.js';
import { getDoctorAppointments } from '../controllers/appointmentController/getDoctorAppointments.js';
import { manageAppointmentStatus } from '../controllers/appointmentController/manageAppointmentStatus.js';
import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';

const AppointmentRouter = express.Router();

// Get all doctors with optional specialty filter
AppointmentRouter.get('/doctors', getDoctors);

// Get doctor availability slots
AppointmentRouter.get('/doctors/:id/availability', getDoctorAvailability);

// Book a new appointment
AppointmentRouter.post('/appointments', authenticateUser, bookAppointment);

// Get patient's appointments
AppointmentRouter.get('/appointments/patient', authenticateUser, getPatientAppointments);

// Get doctor's appointments
AppointmentRouter.get('/appointments/doctor', authenticateUser, authorizeRoles(['doctor']), getDoctorAppointments);

// Get all appointments (admin only)
AppointmentRouter.get('/appointments', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({
                path: 'doctor',
                select: 'specialty',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('patient', 'name email')
            .sort({ date: 1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
});

// Accept or reject appointment
AppointmentRouter.patch('/appointments/:id/status', authenticateUser, authorizeRoles(['doctor', 'admin']), manageAppointmentStatus);

// Get specific appointment details
AppointmentRouter.get('/appointments/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            // Enhanced populate for doctor with more detailed information
            .populate({
                path: 'doctor',
                select: 'specialty consultationFee experience bio qualifications availableSlots ratings',
                populate: {
                    path: 'user',
                    select: 'name email profileImage'
                }
            })
            .populate('patient', 'name email profileImage');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check
        if (req.user.role === 'patient' && !appointment.patient._id.equals(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only view your own appointments'
            });
        }

        if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if (!doctor || !appointment.doctor._id.equals(doctor._id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only view your own appointments'
                });
            }
        }

        // Transform the appointment to ensure doctor name is directly accessible
        const appointmentObj = appointment.toObject();

        // Add doctorName field for easy access on the frontend
        if (appointmentObj.doctor && appointmentObj.doctor.user) {
            appointmentObj.doctorName = appointmentObj.doctor.user.name;
            appointmentObj.doctorEmail = appointmentObj.doctor.user.email;
            appointmentObj.doctorProfileImage = appointmentObj.doctor.user.profileImage;
            // Add specialty as a direct property for easier access
            appointmentObj.doctorSpecialty = appointmentObj.doctor.specialty;
        }

        res.status(200).json({
            success: true,
            message: 'Appointment retrieved successfully',
            data: appointmentObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
            error: error.message
        });
    }
});

// Cancel appointment
AppointmentRouter.patch('/appointments/:id/cancel', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check - only the patient can cancel their appointment
        if (req.user.role === 'patient' && !appointment.patient.equals(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only cancel your own appointments'
            });
        }

        // Admin or doctor can also cancel
        if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if (!doctor || !appointment.doctor.equals(doctor._id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You can only cancel your own appointments'
                });
            }
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling appointment',
            error: error.message
        });
    }
});

export default AppointmentRouter;