import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import Navbar from "../../components/Navbar";
import DoctorSearch from "../../components/DoctorSearch";
import { toast } from "react-toastify";
import {
    CalendarClock, CheckCircle, XCircle, ClipboardList, Users,
    Calendar, Clock, MapPin, FileText, AlertCircle, ChevronRight,
    User, Plus, Info, Check, X, BookOpen, Stethoscope, Mail,
    Phone, Video, ArrowRight, CalendarDays, Clock3, AlertTriangle
} from "lucide-react";

export default function Appointment() {
    const navigate = useNavigate();
    const { user, axiosInstance } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [statusFilter, setStatusFilter] = useState("");
    const [doctorView, setDoctorView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSearchSection, setShowSearchSection] = useState(true);

    useEffect(() => {
        if (user?.user?.role === 'doctor') {
            setDoctorView(true);
        } else {
            setDoctorView(false);
        }
    }, [user]);

    useEffect(() => {
        if (!doctorView && user?.user?._id) {
            fetchPatientAppointments();
        }
    }, [doctorView, user, axiosInstance]);

    useEffect(() => {
        if (doctorView && user?.user?._id) {
            fetchDoctorAppointments();
        }
    }, [doctorView, statusFilter, user, axiosInstance]);

    const fetchPatientAppointments = async () => {
        setAppointmentsLoading(true);
        try {
            const response = await axiosInstance.get("/api/appointment/appointments/patient");
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Failed to load your appointments");
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const fetchDoctorAppointments = async () => {
        setAppointmentsLoading(true);
        try {
            let url = "/api/appointment/appointments/doctor";
            if (statusFilter) {
                url += `?status=${statusFilter}`;
            }
            const response = await axiosInstance.get(url);
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
            toast.error("Failed to load your appointments");
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const handleDoctorSelect = useCallback((doctor) => {
        navigate('/book-appointment', { state: { doctor } });
    }, [navigate]);

    const handleStatusChange = async (appointmentId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change this appointment status to ${newStatus}?`)) {
            return;
        }

        try {
            setIsLoading(true);
            await axiosInstance.patch(`/api/appointment/appointments/${appointmentId}/status`, {
                status: newStatus,
                doctorNotes: "Status updated by doctor"
            });

            toast.success(`Appointment ${newStatus} successfully`);

            if (doctorView) {
                fetchDoctorAppointments();
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast.error("Failed to update appointment status");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';

        const [hours, minutes] = timeString.split(':');
        if (!hours || !minutes) return timeString;

        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const filteredAppointments = appointments.filter(appointment => {
        if (!appointment?.date) return false;

        const appointmentDate = new Date(appointment.date);
        const today = new Date();

        if (activeTab === "upcoming") {
            return appointmentDate >= today;
        } else {
            return appointmentDate < today;
        }
    });

    const getStatusBadgeClasses = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const groupAppointmentsByDate = (appointments) => {
        const grouped = {};

        appointments.forEach(appointment => {
            if (!appointment?.date) return;

            const dateKey = new Date(appointment.date).toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(appointment);
        });

        const sortedDates = Object.keys(grouped).sort((a, b) => {
            if (activeTab === "upcoming") {
                return new Date(a) - new Date(b);
            } else {
                return new Date(b) - new Date(a);
            }
        });

        return sortedDates.map(date => ({
            date,
            appointments: grouped[date]
        }));
    };

    const isToday = (dateString) => {
        const today = new Date();
        const appointmentDate = new Date(dateString);
        return (
            appointmentDate.getDate() === today.getDate() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear()
        );
    };

    const getDaysRemaining = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointmentDate = new Date(dateString);
        appointmentDate.setHours(0, 0, 0, 0);

        const diffTime = appointmentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays > 0) return `In ${diffDays} days`;
        if (diffDays === -1) return "Yesterday";
        return `${Math.abs(diffDays)} days ago`;
    };

    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        const isAppointmentToday = isToday(dateString);

        const formatted = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return isAppointmentToday ? `Today - ${formatted}` : formatted;
    };

    const handleViewDetails = (appointmentId) => {
        navigate(`/appointment/${appointmentId}`);
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }

        try {
            setIsLoading(true);
            await axiosInstance.patch(`/api/appointment/appointments/${appointmentId}/cancel`);
            toast.success("Appointment cancelled successfully");
            fetchPatientAppointments();
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast.error("Failed to cancel appointment");
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointmentDate = new Date(dateString);
        appointmentDate.setHours(0, 0, 0, 0);

        const diffTime = appointmentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "border-red-400 bg-red-50"; // Today
        if (diffDays === 1) return "border-orange-400 bg-orange-50"; // Tomorrow
        if (diffDays <= 3) return "border-yellow-400 bg-yellow-50"; // Next few days
        return "border-blue-200 bg-white"; // Further in future
    };

    const getRelativeTimeDisplay = (dateString, timeString) => {
        if (!dateString || !timeString) return "";

        const today = new Date();
        const appointmentDate = new Date(dateString);

        if (timeString) {
            const [hours, minutes] = timeString.split(":");
            appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }

        const diffTime = appointmentDate - today;
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));

        if (diffMinutes < 0) return "Past";
        if (diffMinutes < 60) return `In ${diffMinutes} min`;
        if (diffMinutes < 24 * 60) {
            const hours = Math.floor(diffMinutes / 60);
            return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }

        const days = Math.floor(diffMinutes / (24 * 60));
        return `In ${days} ${days === 1 ? 'day' : 'days'}`;
    };

    const renderAppointmentCard = (appointment) => {
        const isPast = new Date(appointment.date) < new Date();
        const priorityClass = isPast ? "border-gray-200 bg-gray-50" : getPriorityColor(appointment.date);
        const cardClass = `rounded-xl border ${priorityClass} p-4 shadow-sm transition-all hover:shadow-md mb-4`;

        return (
            <div key={appointment._id} className={cardClass}>
                <div className="flex flex-col md:flex-row md:items-start">
                    <div className="md:w-1/4 mb-4 md:mb-0 md:border-r md:border-gray-200 md:pr-4">
                        <div className={`text-center p-3 rounded-lg ${isToday(appointment.date) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                            <div className="text-xs font-medium mb-1">
                                {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                            </div>
                            <div className="text-2xl font-bold">
                                {new Date(appointment.date).getDate()}
                            </div>
                            <div className="text-xs">
                                {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="mt-3 text-center">
                            <div className="flex justify-center items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="font-medium">
                                    {formatTime(appointment.timeSlot?.startTime)} - {formatTime(appointment.timeSlot?.endTime)}
                                </span>
                            </div>

                            {!isPast && (
                                <div className="mt-2 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 inline-block">
                                    {getRelativeTimeDisplay(appointment.date, appointment.timeSlot?.startTime)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:w-2/4 md:px-4">
                        {!doctorView ? (
                            <div className="flex items-start mb-3">
                                <div className="flex-shrink-0 mr-3">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 overflow-hidden">
                                        {appointment.doctorId?.profileImage ? (
                                            <img
                                                src={appointment.doctorId.profileImage}
                                                alt="Doctor"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        Dr. {appointment.doctorId?.userId?.name || 'Unknown Doctor'}
                                    </h3>

                                    {appointment.doctorId?.specialties?.length > 0 && (
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Stethoscope className="h-4 w-4 mr-1 text-blue-600" />
                                            <span>{appointment.doctorId.specialties.join(', ')}</span>
                                        </div>
                                    )}

                                    {appointment.doctorId?.userId?.email && (
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Mail className="h-4 w-4 mr-1 text-blue-600" />
                                            <span>{appointment.doctorId.userId.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start mb-3">
                                <div className="flex-shrink-0 mr-3">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                        <User className="h-8 w-8" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        {appointment.patientId?.name || 'Unknown Patient'}
                                    </h3>

                                    {appointment.patientId?.email && (
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Mail className="h-4 w-4 mr-1 text-blue-600" />
                                            <span>{appointment.patientId.email}</span>
                                        </div>
                                    )}

                                    {appointment.patientId?.contactNumber && (
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Phone className="h-4 w-4 mr-1 text-blue-600" />
                                            <span>{appointment.patientId.contactNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h4>

                            <div className="flex items-start mb-2">
                                <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                    <span className="text-xs text-gray-500">Reason:</span>
                                    <p className="text-sm text-gray-700">{appointment.reason || 'No reason provided'}</p>
                                </div>
                            </div>

                            {appointment.notes && (
                                <div className="flex items-start">
                                    <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                    <div>
                                        <span className="text-xs text-gray-500">Notes:</span>
                                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:w-1/4 md:pl-4 md:border-l md:border-gray-200 flex flex-col items-center justify-center mt-4 md:mt-0">
                        <div className={`px-4 py-2 rounded-full text-sm font-medium mb-4 ${getStatusBadgeClasses(appointment.status)}`}>
                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                        </div>

                        {doctorView ? (
                            <div className="flex flex-col space-y-2 w-full">
                                {appointment.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Check size={16} className="mr-1" /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(appointment._id, 'rejected')}
                                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <X size={16} className="mr-1" /> Reject
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'confirmed' && !isPast && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(appointment._id, 'completed')}
                                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <CheckCircle size={16} className="mr-1" /> Mark Complete
                                        </button>
                                        <button
                                            className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <Video size={16} className="mr-1" /> Start Meeting
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2 w-full">
                                <button
                                    onClick={() => handleViewDetails(appointment._id)}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Info size={16} className="mr-1" /> View Details
                                </button>

                                {(appointment.status === 'pending' || appointment.status === 'confirmed') && !isPast && (
                                    <button
                                        onClick={() => handleCancelAppointment(appointment._id)}
                                        className="flex items-center justify-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <X size={16} className="mr-1" /> Cancel
                                    </button>
                                )}

                                {appointment.status === 'confirmed' && !isPast && (
                                    <button
                                        className="flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                        <Video size={16} className="mr-1" /> Join Meeting
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const groupedAppointments = groupAppointmentsByDate(filteredAppointments);

    return (
        <>
            <Navbar />
            <main className="bg-gray-100 py-6 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
                        <h1 className="text-3xl font-bold text-blue-950 mb-4 md:mb-0">
                            {doctorView ? "Manage Appointments" : "Book An Appointment"}
                        </h1>

                        {doctorView ? (
                            <div className="w-full md:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Appointments</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        ) : (
                            <div className="w-full md:w-auto">
                                <div className="inline-flex rounded-md shadow-sm" role="group">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("upcoming")}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-l-lg transition-all ${activeTab === "upcoming"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("past")}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-r-lg transition-all ${activeTab === "past"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                    >
                                        Past
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!doctorView && (
                        <>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowSearchSection(!showSearchSection)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                                >
                                    {showSearchSection ? (
                                        <>
                                            <BookOpen size={16} className="mr-1" /> View My Appointments
                                        </>
                                    ) : (
                                        <>
                                            <Users size={16} className="mr-1" /> Find a Doctor
                                        </>
                                    )}
                                </button>
                            </div>

                            {showSearchSection ? (
                                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                    <h2 className="text-xl font-semibold text-blue-950 mb-4 flex items-center">
                                        <Users className="mr-2" size={24} />
                                        Find a Doctor
                                    </h2>
                                    <DoctorSearch onDoctorSelect={handleDoctorSelect} />
                                </div>
                            ) : null}
                        </>
                    )}

                    {(doctorView || !showSearchSection) && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-blue-950 mb-5 flex items-center">
                                <CalendarClock className="mr-2" size={24} />
                                {doctorView ? "Your Patients" : `${activeTab === "upcoming" ? "Upcoming" : "Past"} Appointments`}
                            </h2>

                            {!doctorView && !appointmentsLoading && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-blue-800 text-2xl font-bold">
                                                    {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Appointments</div>
                                            </div>
                                            <div className="bg-blue-200 p-2 rounded-full">
                                                <CalendarDays className="h-5 w-5 text-blue-700" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-yellow-800 text-2xl font-bold">
                                                    {appointments.filter(a => a.status === 'pending').length}
                                                </div>
                                                <div className="text-sm text-gray-600">Pending</div>
                                            </div>
                                            <div className="bg-yellow-200 p-2 rounded-full">
                                                <Clock3 className="h-5 w-5 text-yellow-700" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-green-800 text-2xl font-bold">
                                                    {appointments.filter(a => a.status === 'confirmed').length}
                                                </div>
                                                <div className="text-sm text-gray-600">Confirmed</div>
                                            </div>
                                            <div className="bg-green-200 p-2 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-green-700" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-purple-800 text-2xl font-bold">
                                                    {appointments.filter(a => a.status === 'completed').length}
                                                </div>
                                                <div className="text-sm text-gray-600">Completed</div>
                                            </div>
                                            <div className="bg-purple-200 p-2 rounded-full">
                                                <Check className="h-5 w-5 text-purple-700" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!doctorView && activeTab === "upcoming" && !appointmentsLoading && filteredAppointments.length > 0 && (
                                <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md overflow-hidden">
                                    <div className="px-6 pt-4 pb-2">
                                        <h3 className="text-white text-lg font-medium">Next Appointment</h3>
                                    </div>
                                    <div className="bg-white p-4">
                                        <div className="flex flex-col md:flex-row items-center">
                                            <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-5xl font-bold text-blue-700">
                                                        {new Date(filteredAppointments[0].date).getDate()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(filteredAppointments[0].date).toLocaleDateString('en-US', { month: 'short' })}
                                                    </div>
                                                    <div className="mt-2 text-sm font-medium text-blue-700">
                                                        {formatTime(filteredAppointments[0].timeSlot?.startTime)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:w-2/4 text-center md:text-left mb-4 md:mb-0">
                                                <h4 className="text-lg font-semibold">
                                                    Dr. {filteredAppointments[0].doctorId?.userId?.name || 'Unknown'}
                                                </h4>
                                                {filteredAppointments[0].doctorId?.specialties?.length > 0 && (
                                                    <p className="text-gray-600">{filteredAppointments[0].doctorId.specialties.join(', ')}</p>
                                                )}
                                                <p className="text-gray-600 mt-1">{filteredAppointments[0].reason}</p>
                                            </div>

                                            <div className="md:w-1/4 flex justify-center">
                                                <button
                                                    onClick={() => handleViewDetails(filteredAppointments[0]._id)}
                                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {appointmentsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-3 text-gray-600">Loading appointments...</p>
                                </div>
                            ) : filteredAppointments.length > 0 ? (
                                <div className="space-y-2">
                                    {activeTab === "upcoming" && (
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-800">
                                                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled
                                            </h3>
                                            <div className="text-sm text-gray-500">
                                                {isToday(filteredAppointments[0]?.date) ? (
                                                    <div className="flex items-center text-red-600">
                                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                                        You have an appointment today
                                                    </div>
                                                ) : ''}
                                            </div>
                                        </div>
                                    )}

                                    {groupedAppointments.map(group => (
                                        <div key={group.date} className="mb-6">
                                            <div className="flex items-center mb-3">
                                                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                                <h3 className="font-medium text-gray-800 text-lg">
                                                    {formatDateHeader(group.date)}
                                                </h3>
                                            </div>

                                            {group.appointments.map(appointment => renderAppointmentCard(appointment))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    {activeTab === "upcoming" ? (
                                        <>
                                            <CalendarClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-medium text-gray-800 mb-2">No upcoming appointments</h3>
                                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                You don't have any appointments scheduled for the future.
                                                Book an appointment with a doctor to get started.
                                            </p>
                                            <button
                                                onClick={() => setShowSearchSection(true)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg inline-flex items-center text-sm font-medium transition-colors"
                                            >
                                                <Users size={16} className="mr-1" /> Find a Doctor
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-medium text-gray-800 mb-2">No past appointments</h3>
                                            <p className="text-gray-600 max-w-md mx-auto">
                                                You don't have any previous appointments. Your appointment history will appear here after you've had appointments.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}