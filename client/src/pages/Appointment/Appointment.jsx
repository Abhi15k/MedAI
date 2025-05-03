import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Appointment.css';

const Appointment = () => {
    const [activeTab, setActiveTab] = useState('book');
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        // Redirect to login if not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (activeTab === 'book') {
            fetchDoctors();
        } else if (activeTab === 'appointments') {
            fetchAppointments();
        } else if (activeTab === 'manage' && ['doctor', 'admin'].includes(userRole)) {
            fetchDoctorAppointments();
        }
    }, [activeTab, navigate, userRole]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/appointment/doctors', {
                params: {
                    specialty: selectedSpecialty,
                    name: searchQuery
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setDoctors(response.data.data);

            // Extract unique specialties
            const uniqueSpecialties = [...new Set(
                response.data.data
                    .map(doctor => doctor.doctorProfile?.specialization)
                    .filter(Boolean)
            )];

            setSpecialties(uniqueSpecialties);
            setLoading(false);
        } catch (err) {
            setError('Error fetching doctors. Please try again.');
            setLoading(false);
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/appointment/appointments/patient', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setAppointments(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching appointments. Please try again.');
            setLoading(false);
            console.error('Error fetching appointments:', err);
        }
    };

    const fetchDoctorAppointments = async () => {
        try {
            setLoading(true);
            setError('');

            let endpoint = '/api/appointment/appointments/doctor';
            if (userRole === 'admin') {
                endpoint = '/api/appointment/appointments';
            }

            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setAppointments(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching appointments. Please try again.');
            setLoading(false);
            console.error('Error fetching appointments:', err);
        }
    };

    const handleSearch = () => {
        fetchDoctors();
    };

    const handleSpecialtyChange = (e) => {
        setSelectedSpecialty(e.target.value);
        setTimeout(fetchDoctors, 100);
    };

    const handleBookAppointment = (doctorId) => {
        navigate(`/appointment/book/${doctorId}`);
    };

    const handleViewAppointment = (appointmentId) => {
        navigate(`/appointment/details/${appointmentId}`);
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            setLoading(true);

            await axios.patch(`/api/appointment/appointments/${appointmentId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Refresh appointments list
            if (userRole === 'doctor') {
                fetchDoctorAppointments();
            } else if (userRole === 'admin') {
                fetchDoctorAppointments();
            }

            setLoading(false);
        } catch (err) {
            setError(`Error updating appointment status. Please try again.`);
            setLoading(false);
            console.error('Error updating appointment status:', err);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
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

            // Refresh appointments list
            fetchAppointments();

            setLoading(false);
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

    return (
        <div className="appointment-container">
            <div className="tabs">
                <button
                    className={activeTab === 'book' ? 'active' : ''}
                    onClick={() => setActiveTab('book')}
                >
                    Book Appointment
                </button>
                <button
                    className={activeTab === 'appointments' ? 'active' : ''}
                    onClick={() => setActiveTab('appointments')}
                >
                    My Appointments
                </button>
                {['doctor', 'admin'].includes(userRole) && (
                    <button
                        className={activeTab === 'manage' ? 'active' : ''}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage Appointments
                    </button>
                )}
            </div>

            <div className="tab-content">
                {/* Book Appointment Tab */}
                {activeTab === 'book' && (
                    <div className="book-appointment">
                        <h2>Find a Doctor</h2>

                        <div className="search-filters">
                            <div className="filter-group">
                                <label>Specialty:</label>
                                <select
                                    value={selectedSpecialty}
                                    onChange={handleSpecialtyChange}
                                >
                                    <option value="">All Specialties</option>
                                    {specialties.map(specialty => (
                                        <option key={specialty} value={specialty}>
                                            {specialty}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Search by Name:</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Doctor's name"
                                />
                            </div>

                            <button onClick={handleSearch}>Search</button>
                        </div>

                        {loading ? (
                            <div className="loading">Loading doctors...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            <div className="doctors-list">
                                {doctors.length === 0 ? (
                                    <p>No doctors found. Try different search criteria.</p>
                                ) : (
                                    doctors.map(doctor => (
                                        <div key={doctor._id} className="doctor-card">
                                            <div className="doctor-info">
                                                <div className="doctor-avatar">
                                                    <img
                                                        src={doctor.profileImage || "/avatar.png"}
                                                        alt={doctor.name}
                                                    />
                                                </div>
                                                <div className="doctor-details">
                                                    <h3>{doctor.name}</h3>
                                                    <p className="specialty">
                                                        {doctor.doctorProfile?.specialization || "General Physician"}
                                                    </p>
                                                    <p className="experience">
                                                        {doctor.doctorProfile?.experience
                                                            ? `${doctor.doctorProfile.experience} years experience`
                                                            : "Experience not specified"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBookAppointment(doctor._id)}
                                                className="book-btn"
                                            >
                                                Book Appointment
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* My Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div className="appointments">
                        <h2>My Appointments</h2>

                        {loading ? (
                            <div className="loading">Loading appointments...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            <div className="appointments-list">
                                {appointments.length === 0 ? (
                                    <p>No appointments found.</p>
                                ) : (
                                    appointments.map(appointment => (
                                        <div key={appointment._id} className="appointment-card">
                                            <div className="appointment-header">
                                                <div className="appointment-date">
                                                    <h3>{formatDate(appointment.date)}</h3>
                                                    <p>{appointment.timeSlot}</p>
                                                </div>
                                                <div className={`appointment-status ${appointment.status}`}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </div>
                                            </div>

                                            <div className="appointment-body">
                                                <div className="doctor-info">
                                                    <img
                                                        src={appointment.doctor.profileImage || "/avatar.png"}
                                                        alt={appointment.doctor.name}
                                                    />
                                                    <div>
                                                        <h4>{appointment.doctor.name}</h4>
                                                        <p>{appointment.doctor.doctorProfile?.specialization || "Doctor"}</p>
                                                    </div>
                                                </div>
                                                <div className="appointment-reason">
                                                    <p><strong>Reason:</strong> {appointment.reason}</p>
                                                </div>
                                            </div>

                                            <div className="appointment-actions">
                                                <button
                                                    onClick={() => handleViewAppointment(appointment._id)}
                                                    className="view-btn"
                                                >
                                                    View Details
                                                </button>
                                                {appointment.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                        className="cancel-btn"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Manage Appointments Tab (for doctors and admin) */}
                {activeTab === 'manage' && ['doctor', 'admin'].includes(userRole) && (
                    <div className="manage-appointments">
                        <h2>{userRole === 'doctor' ? 'My Patient Appointments' : 'All Appointments'}</h2>

                        {loading ? (
                            <div className="loading">Loading appointments...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            <div className="appointments-list">
                                {appointments.length === 0 ? (
                                    <p>No appointments found.</p>
                                ) : (
                                    appointments.map(appointment => (
                                        <div key={appointment._id} className="appointment-card">
                                            <div className="appointment-header">
                                                <div className="appointment-date">
                                                    <h3>{formatDate(appointment.date)}</h3>
                                                    <p>{appointment.timeSlot}</p>
                                                </div>
                                                <div className={`appointment-status ${appointment.status}`}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </div>
                                            </div>

                                            <div className="appointment-body">
                                                <div className="patient-info">
                                                    <img
                                                        src={appointment.patient.profileImage || "/avatar.png"}
                                                        alt={appointment.patient.name}
                                                    />
                                                    <div>
                                                        <h4>{appointment.patient.name}</h4>
                                                        <p>Patient</p>
                                                    </div>
                                                </div>
                                                <div className="appointment-reason">
                                                    <p><strong>Reason:</strong> {appointment.reason}</p>
                                                </div>
                                            </div>

                                            <div className="appointment-actions">
                                                <button
                                                    onClick={() => handleViewAppointment(appointment._id)}
                                                    className="view-btn"
                                                >
                                                    View Details
                                                </button>

                                                {appointment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(appointment._id, 'accepted')}
                                                            className="accept-btn"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(appointment._id, 'rejected')}
                                                            className="reject-btn"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointment;