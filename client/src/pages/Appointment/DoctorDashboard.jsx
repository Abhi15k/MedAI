import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import {
    Calendar, Clock, User, FileText, CheckCircle, XCircle,
    Filter, RefreshCw, ChevronDown, Calendar as CalendarIcon,
    CalendarDays, Clock3, Check, AlertTriangle, Search, X
} from 'lucide-react';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { user, axiosInstance } = useContext(AuthContext);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0
    });

    useEffect(() => {
        if (!user || user?.user?.role !== 'doctor') {
            navigate('/appointment');
            return;
        }

        fetchAppointments();
    }, [user, navigate]);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = '/api/appointment/appointments/doctor';
            const params = new URLSearchParams();

            if (statusFilter) {
                params.append('status', statusFilter);
            }

            if (dateFilter) {
                params.append('date', dateFilter);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axiosInstance.get(url);
            const appointmentsData = response.data.data || [];

            setAppointments(appointmentsData);
            calculateStats(appointmentsData);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments. Please try again.');
            toast.error('Could not load appointments');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (appointmentsData) => {
        const stats = {
            total: appointmentsData.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0
        };

        appointmentsData.forEach(appointment => {
            if (stats.hasOwnProperty(appointment.status)) {
                stats[appointment.status]++;
            }
        });

        setStats(stats);
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this appointment?`)) {
            return;
        }

        try {
            await axiosInstance.patch(`/api/appointment/appointments/${appointmentId}/status`, {
                status: newStatus,
                doctorNotes: "Status updated by doctor"
            });

            toast.success(`Appointment ${newStatus} successfully`);
            fetchAppointments();
        } catch (err) {
            console.error(`Error ${newStatus} appointment:`, err);
            toast.error(`Failed to ${newStatus} appointment`);
        }
    };

    const handleViewDetails = (appointmentId) => {
        navigate(`/appointment/${appointmentId}`);
    };

    const resetFilters = () => {
        setStatusFilter('');
        setDateFilter('');
        setSearchQuery('');
    };

    // Filter appointments based on search query
    const filteredAppointments = appointments.filter(appointment => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            appointment.patient?.name?.toLowerCase().includes(query) ||
            appointment.patient?.email?.toLowerCase().includes(query) ||
            appointment.reason?.toLowerCase().includes(query)
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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

    const getStatusBadgeClasses = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-6 flex justify-between items-center flex-wrap">
                        <h1 className="text-3xl font-bold text-blue-950 mb-4 md:mb-0">
                            Doctor Dashboard
                        </h1>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                                onClick={fetchAppointments}
                                className="bg-blue-100 text-blue-800 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Total Appointments</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <CalendarDays className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <Clock3 className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Confirmed</p>
                                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
                                </div>
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Patient name or reason"
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status Filter
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date Filter
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
                                </button>
                                <button
                                    onClick={fetchAppointments}
                                    className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appointments List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-blue-950 mb-5">
                            Your Appointments
                        </h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-3 text-gray-600">Loading appointments...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                                <p className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    {error}
                                </p>
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-800 mb-2">No appointments found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {statusFilter || dateFilter || searchQuery ?
                                        "No appointments match your current filters." :
                                        "You don't have any appointments yet. They will appear here once patients book with you."}
                                </p>
                                {(statusFilter || dateFilter || searchQuery) && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Patient
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reason
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAppointments.map((appointment) => (
                                            <tr key={appointment._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            {appointment.patient?.profileImage ? (
                                                                <img
                                                                    src={appointment.patient.profileImage}
                                                                    alt="Patient"
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-gray-900">
                                                                {appointment.patient?.name || "Unknown Patient"}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {appointment.patient?.email || ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatDate(appointment.date)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatTime(appointment.timeSlot?.startTime)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {appointment.reason || "No reason provided"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(appointment.status)}`}>
                                                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleViewDetails(appointment._id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Details
                                                        </button>

                                                        {appointment.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                                                                    className="text-green-600 hover:text-green-900 flex items-center"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'rejected')}
                                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {appointment.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Mark Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DoctorDashboard;