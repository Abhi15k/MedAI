import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { getDoctors } from '../controllers/appointmentController/getDoctors.js';
import { getDoctorAvailability } from '../controllers/appointmentController/getDoctorAvailability.js';
import { createAppointment } from '../controllers/appointmentController/createAppointment.js';
import { getPatientAppointments } from '../controllers/appointmentController/getPatientAppointments.js';
import { getDoctorAppointments } from '../controllers/appointmentController/getDoctorAppointments.js';
import { updateAppointmentStatus } from '../controllers/appointmentController/updateAppointmentStatus.js';
import Appointment from '../models/appointmentModel.js';

const AppointmentRouter = express.Router();

// Get all doctors with optional specialty filter
AppointmentRouter.get('/doctors', getDoctors);

// Get doctor availability slots
AppointmentRouter.get('/doctors/:id/availability', getDoctorAvailability);

// Book a new appointment
AppointmentRouter.post('/appointments', authenticateUser, createAppointment);

// Get patient's appointments
AppointmentRouter.get('/appointments/patient', authenticateUser, getPatientAppointments);

// Get doctor's appointments
AppointmentRouter.get('/appointments/doctor', authenticateUser, authorizeRoles(['doctor']), getDoctorAppointments);

// Get all appointments (admin only)
AppointmentRouter.get('/appointments', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctor', 'name email doctorProfile.specialization')
            .populate('patient', 'name email')
            .sort({ date: -1, timeSlot: 1 });

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
AppointmentRouter.patch('/appointments/:id/status', authenticateUser, authorizeRoles(['doctor', 'admin']), updateAppointmentStatus);

// Get specific appointment details
AppointmentRouter.get('/appointments/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            .populate('doctor', 'name email doctorProfile.specialization profileImage')
            .populate('patient', 'name email patientProfile profileImage');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check
        const userId = req.user.id;
        const userRole = req.user.role;

        if (
            userRole !== 'admin' &&
            appointment.doctor._id.toString() !== userId &&
            appointment.patient._id.toString() !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment retrieved successfully',
            data: appointment
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
AppointmentRouter.delete('/appointments/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check (only patient who booked or admin can cancel)
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole !== 'admin' && appointment.patient.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        // Update status to cancelled
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