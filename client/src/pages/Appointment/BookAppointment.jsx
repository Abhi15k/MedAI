import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookAppointment.css';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [reason, setReason] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect to login if not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchDoctorDetails();
    }, [doctorId, navigate]);

    const fetchDoctorDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(`/api/appointment/doctors`, {
                params: { id: doctorId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Find the specific doctor from the response
            const doctorData = response.data.data.find(doc => doc._id === doctorId);

            if (!doctorData) {
                setError('Doctor not found');
                setLoading(false);
                return;
            }

            setDoctor(doctorData);
            setLoading(false);
        } catch (err) {
            setError('Error fetching doctor details. Please try again.');
            setLoading(false);
            console.error('Error fetching doctor details:', err);
        }
    };

    const fetchAvailability = async (date) => {
        if (!date) return;

        try {
            setLoading(true);
            setError('');
            setSelectedTimeSlot('');

            const response = await axios.get(`/api/appointment/doctors/${doctorId}/availability`, {
                params: { date },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setAvailableSlots(response.data.data.slots || []);
            setLoading(false);

            if (response.data.data.slots.length === 0) {
                setError('No available slots for this date. Please select another date.');
            }
        } catch (err) {
            setError('Error fetching availability. Please try again.');
            setLoading(false);
            console.error('Error fetching availability:', err);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchAvailability(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTimeSlot || !reason) {
            setError('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await axios.post('/api/appointment/appointments', {
                doctorId,
                date: selectedDate,
                timeSlot: selectedTimeSlot,
                reason
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setLoading(false);

            // Show success message and redirect
            alert('Appointment booked successfully!');
            navigate('/appointment');
        } catch (err) {
            setError(err.response?.data?.message || 'Error booking appointment. Please try again.');
            setLoading(false);
            console.error('Error booking appointment:', err);
        }
    };

    const formatTime = (timeSlot) => {
        const [hours, minutes] = timeSlot.split(':');
        const hourNum = parseInt(hours);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    };

    // Get today's date in YYYY-MM-DD format for min attribute of date input
    const today = new Date().toISOString().split('T')[0];

    // Calculate max date (3 months from today)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="book-appointment-container">
            <div className="back-link">
                <button onClick={() => navigate('/appointment')}>
                    &larr; Back to Appointments
                </button>
            </div>

            <div className="book-appointment-content">
                <div className="doctor-details-panel">
                    {doctor ? (
                        <>
                            <div className="doctor-profile">
                                <img
                                    src={doctor.profileImage || "/avatar.png"}
                                    alt={doctor.name}
                                    className="doctor-profile-img"
                                />
                                <h2>{doctor.name}</h2>
                                <p className="doctor-specialty">
                                    {doctor.doctorProfile?.specialization || "General Physician"}
                                </p>
                                {doctor.doctorProfile?.experience && (
                                    <p className="doctor-experience">
                                        {doctor.doctorProfile.experience} years experience
                                    </p>
                                )}
                            </div>

                            <div className="doctor-qualifications">
                                <h3>Qualifications</h3>
                                {doctor.doctorProfile?.qualifications && doctor.doctorProfile.qualifications.length > 0 ? (
                                    <ul>
                                        {doctor.doctorProfile.qualifications.map((qualification, index) => (
                                            <li key={index}>{qualification}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No qualification information available</p>
                                )}
                            </div>

                            <div className="doctor-availability">
                                <h3>Available Days</h3>
                                {doctor.doctorProfile?.availabilitySchedule && doctor.doctorProfile.availabilitySchedule.length > 0 ? (
                                    <ul>
                                        {doctor.doctorProfile.availabilitySchedule.map((schedule, index) => (
                                            <li key={index}>
                                                <strong>{schedule.day}:</strong> {schedule.startTime} - {schedule.endTime}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No availability information</p>
                                )}
                            </div>
                        </>
                    ) : loading ? (
                        <div className="loading">Loading doctor details...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <div className="error">Doctor not found</div>
                    )}
                </div>

                <div className="appointment-form-panel">
                    <h2>Book an Appointment</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="date">Select Date:</label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                min={today}
                                max={maxDateStr}
                                required
                            />
                        </div>

                        {selectedDate && (
                            <div className="form-group">
                                <label>Select Time Slot:</label>
                                <div className="time-slots">
                                    {loading ? (
                                        <div className="loading">Loading available slots...</div>
                                    ) : availableSlots.length > 0 ? (
                                        availableSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                                                onClick={() => setSelectedTimeSlot(slot)}
                                            >
                                                {formatTime(slot)}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="no-slots">
                                            No available slots for this date. Please select another date.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="reason">Reason for Visit:</label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please describe your symptoms or reason for the visit"
                                required
                            />
                        </div>

                        {error && <div className="error">{error}</div>}

                        <div className="form-group">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || !selectedDate || !selectedTimeSlot || !reason}
                            >
                                {loading ? 'Booking...' : 'Book Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;