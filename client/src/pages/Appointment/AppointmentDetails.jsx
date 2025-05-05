import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, Mail, Stethoscope, FileText, MessageSquare, Check, X } from 'lucide-react';
import './AppointmentDetails.css';

const AppointmentDetails = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user, axiosInstance } = useContext(AuthContext);

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userRole = user?.user?.role;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAppointmentDetails();
    }, [appointmentId, navigate, user]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axiosInstance.get(`/api/appointment/appointments/${appointmentId}`);
            console.log("Appointment details:", response.data);

            setAppointment(response.data.data);
            if (response.data.data.notes) {
                setNotes(response.data.data.notes);
            }

            setLoading(false);
        } catch (err) {
            setError('Error fetching appointment details. Please try again.');
            setLoading(false);
            console.error('Error fetching appointment details:', err);
            toast.error('Could not load appointment details');
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!window.confirm(`Are you sure you want to ${status} this appointment?`)) {
            return;
        }

        try {
            setIsSubmitting(true);

            await axiosInstance.patch(`/api/appointment/appointments/${appointmentId}/status`, {
                status,
                doctorNotes: notes
            });

            toast.success(`Appointment ${status} successfully`);

            // Refresh appointment details
            fetchAppointmentDetails();
        } catch (err) {
            console.error(`Error ${status} appointment:`, err);
            toast.error(`Failed to ${status} appointment`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            setIsSubmitting(true);

            await axiosInstance.patch(`/api/appointment/appointments/${appointmentId}/cancel`);

            toast.success('Appointment cancelled successfully');

            // Redirect back to appointments page
            navigate('/appointment');
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            toast.error('Failed to cancel appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeSlotObj) => {
        if (!timeSlotObj || !timeSlotObj.startTime) return '';

        const [hours, minutes] = timeSlotObj.startTime.split(':');
        const hourNum = parseInt(hours);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/appointment')}
                        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <span className="mr-2">&larr;</span> Back to Appointments
                    </button>

                    {loading ? (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading appointment details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <p>{error}</p>
                        </div>
                    ) : appointment ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Appointment Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
                                        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0">
                                        <div className="flex items-center mb-2">
                                            <Calendar className="h-5 w-5 mr-2" />
                                            <span>{formatDate(appointment.date)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 mr-2" />
                                            <span>{formatTime(appointment.timeSlot)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Doctor & Patient Info */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">Doctor Information</h3>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                                                    {appointment.doctor?.profileImage ? (
                                                        <img
                                                            src={appointment.doctor.profileImage}
                                                            alt="Doctor"
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={32} />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">
                                                    Dr. {appointment.doctor?.userId?.name || appointment.doctor?.name || 'Unknown Doctor'}
                                                </h4>

                                                {(appointment.doctor?.specialty || appointment.doctor?.specialties) && (
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <Stethoscope className="h-4 w-4 mr-1 text-blue-600" />
                                                        <span>
                                                            {appointment.doctor?.specialty ||
                                                                (Array.isArray(appointment.doctor?.specialties) ?
                                                                    appointment.doctor?.specialties.join(', ') :
                                                                    'Specialist')}
                                                        </span>
                                                    </div>
                                                )}

                                                {(appointment.doctor?.email || appointment.doctor?.userId?.email) && (
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <Mail className="h-4 w-4 mr-1 text-blue-600" />
                                                        <span>{appointment.doctor?.email || appointment.doctor?.userId?.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                                                    {appointment.patient?.profileImage ? (
                                                        <img
                                                            src={appointment.patient.profileImage}
                                                            alt="Patient"
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={32} />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">
                                                    {appointment.patient?.name || 'Unknown Patient'}
                                                </h4>
                                                {appointment.patient?.email && (
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <Mail className="h-4 w-4 mr-1 text-blue-600" />
                                                        <span>{appointment.patient.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="mb-8">
                                    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                            Reason for Visit
                                        </h3>
                                        <p className="text-gray-700">{appointment.reason || 'No reason provided'}</p>
                                    </div>

                                    {appointment.notes && (
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                                                Notes
                                            </h3>
                                            <p className="text-gray-700">{appointment.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Input for Doctor/Admin */}
                                {['doctor', 'admin'].includes(userRole) && appointment.status === 'pending' && (
                                    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">Add Notes</h3>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add notes about this appointment..."
                                            rows={4}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center gap-4 mt-8">
                                    {/* Actions for Doctors and Admins */}
                                    {['doctor', 'admin'].includes(userRole) && appointment.status === 'pending' && (
                                        <>
                                            <button
                                                className="flex items-center justify-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                onClick={() => handleUpdateStatus('confirmed')}
                                                disabled={isSubmitting}
                                            >
                                                <Check className="h-5 w-5 mr-2" />
                                                Accept Appointment
                                            </button>
                                            <button
                                                className="flex items-center justify-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                onClick={() => handleUpdateStatus('rejected')}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-5 w-5 mr-2" />
                                                Reject Appointment
                                            </button>
                                        </>
                                    )}

                                    {/* Actions for Patients */}
                                    {userRole === 'patient' && ['pending', 'confirmed'].includes(appointment.status) && (
                                        <button
                                            className="flex items-center justify-center px-6 py-2.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                            onClick={handleCancelAppointment}
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Cancel Appointment
                                        </button>
                                    )}

                                    {/* Confirm completed for doctor if appointment is confirmed */}
                                    {userRole === 'doctor' && appointment.status === 'confirmed' && (
                                        <button
                                            className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            onClick={() => handleUpdateStatus('completed')}
                                            disabled={isSubmitting}
                                        >
                                            <Check className="h-5 w-5 mr-2" />
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                            <p>Appointment not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AppointmentDetails;