import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AppointmentDetails.css';

const AppointmentDetails = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        // Redirect to login if not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchAppointmentDetails();
    }, [appointmentId, navigate]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(`/api/appointment/appointments/${appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setAppointment(response.data.data);
            if (response.data.data.notes) {
                setNotes(response.data.data.notes);
            }

            setLoading(false);
        } catch (err) {
            setError('Error fetching appointment details. Please try again.');
            setLoading(false);
            console.error('Error fetching appointment details:', err);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!window.confirm(`Are you sure you want to ${status} this appointment?`)) {
            return;
        }

        try {
            setLoading(true);

            await axios.patch(`/api/appointment/appointments/${appointmentId}/status`,
                { status, notes },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Refresh appointment details
            fetchAppointmentDetails();
        } catch (err) {
            setError(`Error ${status} appointment. Please try again.`);
            setLoading(false);
            console.error(`Error ${status} appointment:`, err);
        }
    };

    const handleCancelAppointment = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            setLoading(true);

            await axios.delete(`/api/appointment/appointments/${appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setLoading(false);

            // Redirect back to appointments page
            navigate('/appointment');
        } catch (err) {
            setError('Error cancelling appointment. Please try again.');
            setLoading(false);
            console.error('Error cancelling appointment:', err);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeSlot) => {
        const [hours, minutes] = timeSlot.split(':');
        const hourNum = parseInt(hours);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    };

    return (
        <div className="appointment-details-container">
            <div className="back-link">
                <button onClick={() => navigate('/appointment')}>
                    &larr; Back to Appointments
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading appointment details...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : appointment ? (
                <div className="appointment-details-content">
                    <div className="appointment-header">
                        <div className="appointment-status-section">
                            <span className={`status-badge ${appointment.status}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                            <h2>Appointment Details</h2>
                            <div className="appointment-time">
                                <div className="date">
                                    <i className="far fa-calendar"></i>
                                    <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="time">
                                    <i className="far fa-clock"></i>
                                    <span>{formatTime(appointment.timeSlot)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="appointment-body">
                        <div className="person-details">
                            <div className="doctor-info">
                                <h3>Doctor</h3>
                                <div className="info-card">
                                    <img
                                        src={appointment.doctor.profileImage || "/avatar.png"}
                                        alt={appointment.doctor.name}
                                    />
                                    <div>
                                        <h4>{appointment.doctor.name}</h4>
                                        <p>{appointment.doctor.doctorProfile?.specialization || "General Physician"}</p>
                                        <span className="email">{appointment.doctor.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="patient-info">
                                <h3>Patient</h3>
                                <div className="info-card">
                                    <img
                                        src={appointment.patient.profileImage || "/avatar.png"}
                                        alt={appointment.patient.name}
                                    />
                                    <div>
                                        <h4>{appointment.patient.name}</h4>
                                        <span className="email">{appointment.patient.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="appointment-reason-section">
                            <h3>Reason for Visit</h3>
                            <div className="reason-card">
                                <p>{appointment.reason}</p>
                            </div>
                        </div>

                        {appointment.notes && (
                            <div className="appointment-notes-section">
                                <h3>Notes</h3>
                                <div className="notes-card">
                                    <p>{appointment.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Notes Input for Doctor/Admin */}
                        {['doctor', 'admin'].includes(userRole) && appointment.status === 'pending' && (
                            <div className="notes-input-section">
                                <h3>Add Notes</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about this appointment..."
                                    rows={4}
                                />
                            </div>
                        )}

                        <div className="appointment-actions">
                            {/* Actions for Doctors and Admins */}
                            {['doctor', 'admin'].includes(userRole) && appointment.status === 'pending' && (
                                <div className="doctor-actions">
                                    <button
                                        className="accept-btn"
                                        onClick={() => handleUpdateStatus('accepted')}
                                    >
                                        Accept Appointment
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleUpdateStatus('rejected')}
                                    >
                                        Reject Appointment
                                    </button>
                                </div>
                            )}

                            {/* Actions for Patients */}
                            {userRole === 'patient' && appointment.status === 'pending' && (
                                <div className="patient-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={handleCancelAppointment}
                                    >
                                        Cancel Appointment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="error">Appointment not found</div>
            )}
        </div>
    );
};

export default AppointmentDetails;