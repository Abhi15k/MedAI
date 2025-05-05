import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowLeft, Star, Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import './BookAppointment.css';

export default function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { axiosInstance, user } = useContext(AuthContext);

    // Get doctor from location state or use empty object
    const selectedDoctor = location.state?.doctor || {};

    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [bookingReason, setBookingReason] = useState("");
    const [bookingNotes, setBookingNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState('dates'); // 'dates' or 'slots'
    const [dateRange, setDateRange] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(0);
    const [commonConditions, setCommonConditions] = useState([
        "Annual Check-up", "Consultation", "Follow-up", "Medication Review",
        "Vaccination", "Cold & Flu", "Headache", "Stomach Pain", "Allergy"
    ]);

    // If no doctor is selected, redirect back to appointment page
    useEffect(() => {
        if (!selectedDoctor || !selectedDoctor.id) {
            toast.error("Please select a doctor first");
            navigate('/appointment');
        }
    }, [selectedDoctor, navigate]);

    // Generate date range for the calendar view
    useEffect(() => {
        const generateDateRange = () => {
            const today = new Date();
            const dates = [];

            // Start from current week based on currentWeek state
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + (currentWeek * 7));

            // Generate 14 days from the start date
            for (let i = 0; i < 14; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                // Format date as YYYY-MM-DD for API
                const formattedDate = date.toISOString().split('T')[0];

                dates.push({
                    date: formattedDate,
                    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    dayNumber: date.getDate(),
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    fullDate: date
                });
            }

            setDateRange(dates);
        };

        generateDateRange();
    }, [currentWeek]);

    // Function to fetch available time slots
    const fetchAvailableSlots = async (date) => {
        if (!selectedDoctor?.id || !date) return;

        setIsLoading(true);
        setError(null);
        setCurrentView('slots');

        try {
            // Add data validation before making the API call
            if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                throw new Error("Invalid date format");
            }

            console.log(`Attempting to fetch availability for doctor: ${selectedDoctor.id}, date: ${date}`);

            // Use formatted date and get day of week
            const selectedDateObj = new Date(date);
            const dayOfWeek = selectedDateObj.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

            console.log(`Day of week for selected date: ${dayOfWeek}`);

            // Add error handling with more detailed logging
            const response = await axiosInstance.get(
                `/api/appointment/doctors/${selectedDoctor.id}/availability`, {
                params: { date: date }
            }
            );

            console.log("Availability response:", response.data);

            // Handle case where response is successful but data might be missing
            if (response.data && response.data.success === false) {
                throw new Error(response.data.message || "Failed to get availability");
            }

            if (!response.data || !Array.isArray(response.data.data)) {
                console.warn("Unexpected response format:", response.data);
                setAvailableSlots([]);
                return;
            }

            setAvailableSlots(response.data.data || []);
            setSelectedTimeSlot(null);
        } catch (error) {
            console.error("Error fetching availability:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Server responded with error:", error.response.status);
                console.error("Error data:", error.response.data);

                // Check for the specific error about missing schedule
                if (error.response.data?.error?.includes("tuesday") ||
                    error.response.data?.error?.includes("undefined")) {
                    setError("This doctor hasn't set up their availability schedule yet. Please select a different doctor or contact support.");
                    toast.error("Doctor's schedule is not configured");
                } else {
                    setError("Failed to load available time slots. Please try again or contact support.");
                    toast.error("Failed to load available time slots");
                }
            } else {
                setError("Failed to load available time slots. Please try again or contact support.");
                toast.error("Failed to load available time slots");
            }

            setAvailableSlots([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        fetchAvailableSlots(date);
    };

    // Handle common condition selection
    const handleConditionSelect = (condition) => {
        setBookingReason(condition);
    };

    // Go back to date selection view
    const backToDateSelection = () => {
        setCurrentView('dates');
        setSelectedTimeSlot(null);
    };

    // Navigate weeks
    const navigateWeek = (direction) => {
        setCurrentWeek(prev => prev + direction);
    };

    // Function to handle appointment booking
    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !bookingReason) {
            setError("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Prepare the request payload with proper data structure
            const appointmentData = {
                doctorId: selectedDoctor.id,
                date: selectedDate,
                timeSlot: {
                    startTime: selectedTimeSlot.startTime,
                    endTime: selectedTimeSlot.endTime
                },
                reason: bookingReason,
                notes: bookingNotes || ""
            };

            console.log("Sending appointment request:", appointmentData);

            const response = await axiosInstance.post("/api/appointment/appointments", appointmentData);
            console.log("Booking response:", response.data);

            toast.success("Appointment booked successfully!");

            // Redirect back to appointments page with parameter to show appointments list
            navigate('/appointment?view=appointments');
        } catch (error) {
            console.error("Error booking appointment:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Server responded with error:", error.response.status);
                console.error("Error data:", error.response.data);
            }

            setError(error.response?.data?.message || "Failed to book appointment. Please try again.");
            toast.error(error.response?.data?.message || "Failed to book appointment");
        } finally {
            setIsLoading(false);
        }
    };

    // Format time for display (HH:MM format)
    const formatTime = (timeString) => {
        if (!timeString) return '';

        const [hours, minutes] = timeString.split(':');
        if (!hours || !minutes) return timeString;

        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    // Check if date is today
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Group time slots by morning, afternoon, evening
    const groupedTimeSlots = () => {
        const morning = [];
        const afternoon = [];
        const evening = [];

        availableSlots.forEach(slot => {
            const hour = parseInt(slot.startTime.split(':')[0]);
            if (hour < 12) {
                morning.push(slot);
            } else if (hour < 17) {
                afternoon.push(slot);
            } else {
                evening.push(slot);
            }
        });

        return { morning, afternoon, evening };
    };

    // Get minimum date for date picker (today)
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get maximum date for date picker (3 months from now)
    const getMaxDateString = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        const year = maxDate.getFullYear();
        const month = String(maxDate.getMonth() + 1).padStart(2, '0');
        const day = String(maxDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const { morning, afternoon, evening } = groupedTimeSlots();

    return (
        <>
            <Navbar />
            <main className="bg-gray-100 py-6 min-h-screen">
                <div className="container mx-auto px-4">
                    <button
                        onClick={() => navigate('/appointment')}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back to Appointments
                    </button>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
                            <h1 className="text-2xl font-bold">Book an Appointment</h1>

                            {selectedDoctor && (
                                <div className="mt-4 pt-4 border-t border-blue-400 flex items-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 mr-4 overflow-hidden">
                                        {selectedDoctor.profileImage ? (
                                            <img
                                                src={selectedDoctor.profileImage}
                                                alt={`Dr. ${selectedDoctor.name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold">{selectedDoctor.name?.charAt(0) || "D"}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">Dr. {selectedDoctor.name || 'Unknown'}</h2>
                                        <p className="text-blue-100">{selectedDoctor.specialties?.join(', ') || 'Specialist'}</p>

                                        <div className="flex flex-wrap items-center mt-2 gap-2">
                                            <span className="bg-blue-500 text-xs px-2 py-1 rounded-full text-white flex items-center">
                                                <span className="mr-1">${selectedDoctor.consultationFee || '0'}</span> consultation fee
                                            </span>
                                            <span className="bg-blue-500 text-xs px-2 py-1 rounded-full text-white flex items-center">
                                                <Star size={12} className="mr-1" /> {selectedDoctor.rating || "4.5"} rating
                                            </span>
                                            <span className="bg-blue-500 text-xs px-2 py-1 rounded-full text-white flex items-center">
                                                <CalendarIcon size={12} className="mr-1" /> {selectedDoctor.experience || 0} years experience
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="p-6">
                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Progress Steps */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${currentView === 'dates' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            1
                                        </div>
                                        <p className="text-xs text-center mt-1">Select Date</p>
                                    </div>
                                    <div className="flex-1 relative">
                                        <div className="absolute top-5 w-full">
                                            <div className={`h-1 ${selectedDate ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${selectedDate ? (currentView === 'slots' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600') : 'bg-gray-200 text-gray-500'}`}>
                                            2
                                        </div>
                                        <p className="text-xs text-center mt-1">Select Time</p>
                                    </div>
                                    <div className="flex-1 relative">
                                        <div className="absolute top-5 w-full">
                                            <div className={`h-1 ${selectedTimeSlot ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${selectedTimeSlot ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                            3
                                        </div>
                                        <p className="text-xs text-center mt-1">Confirm Details</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Select Date & Time */}
                                <div>
                                    {currentView === 'dates' ? (
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                            <div className="mb-4 flex justify-between items-center">
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    Select a Date
                                                </h3>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => navigateWeek(-1)}
                                                        disabled={currentWeek === 0}
                                                        className={`p-1 rounded-full ${currentWeek === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigateWeek(1)}
                                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-2 mb-4">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                                                    <div key={index} className="text-center text-xs font-medium text-gray-500">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-7 gap-2">
                                                {dateRange.map((day, index) => {
                                                    const isSelected = day.date === selectedDate;
                                                    const isDayToday = isToday(day.date);

                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleDateSelect(day.date)}
                                                            className={`p-2 rounded-lg flex flex-col items-center justify-center h-20 relative ${isSelected
                                                                    ? 'bg-blue-600 text-white'
                                                                    : isDayToday
                                                                        ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                                                        : 'hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="text-xs font-medium">{day.dayName}</span>
                                                            <span className="text-xl font-semibold">{day.dayNumber}</span>
                                                            <span className="text-xs">{day.month}</span>
                                                            {isDayToday && !isSelected && (
                                                                <span className="absolute bottom-1 w-4 h-1 bg-blue-500 rounded-full"></span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 text-xs text-gray-500 flex items-start">
                                                <Calendar className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <p>Select your preferred date. You can book appointments up to 3 months in advance.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                            <div className="mb-4 flex justify-between items-center">
                                                <button
                                                    onClick={backToDateSelection}
                                                    className="flex items-center text-blue-600 hover:underline"
                                                >
                                                    <ChevronLeft size={16} className="mr-1" /> Change Date
                                                </button>
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    {formatDateForDisplay(selectedDate)}
                                                </h3>
                                            </div>

                                            {isLoading ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                                    <p className="mt-3 text-gray-500">Loading available slots...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {availableSlots.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                                                            <h5 className="text-gray-700 font-medium mb-1">No Available Slots</h5>
                                                            <p className="text-sm text-gray-500 mb-4">Dr. {selectedDoctor.name} is not available on this date.</p>
                                                            <button
                                                                onClick={backToDateSelection}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                            >
                                                                Select Another Date
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm text-center text-gray-500 mb-4">
                                                                Click on a time slot to select it
                                                            </div>

                                                            {morning.length > 0 && (
                                                                <div className="mb-6">
                                                                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                                        <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                                                                        Morning
                                                                    </h4>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {morning.map((slot, index) => (
                                                                            <button
                                                                                key={index}
                                                                                onClick={() => setSelectedTimeSlot(slot)}
                                                                                className={`py-3 px-2 text-sm rounded-lg transition-all ${selectedTimeSlot === slot
                                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                                    }`}
                                                                                aria-pressed={selectedTimeSlot === slot}
                                                                            >
                                                                                {formatTime(slot.startTime)}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {afternoon.length > 0 && (
                                                                <div className="mb-6">
                                                                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                                        <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                                                                        Afternoon
                                                                    </h4>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {afternoon.map((slot, index) => (
                                                                            <button
                                                                                key={index}
                                                                                onClick={() => setSelectedTimeSlot(slot)}
                                                                                className={`py-3 px-2 text-sm rounded-lg transition-all ${selectedTimeSlot === slot
                                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                                    }`}
                                                                                aria-pressed={selectedTimeSlot === slot}
                                                                            >
                                                                                {formatTime(slot.startTime)}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {evening.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                                        <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                                                                        Evening
                                                                    </h4>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {evening.map((slot, index) => (
                                                                            <button
                                                                                key={index}
                                                                                onClick={() => setSelectedTimeSlot(slot)}
                                                                                className={`py-3 px-2 text-sm rounded-lg transition-all ${selectedTimeSlot === slot
                                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                                    }`}
                                                                                aria-pressed={selectedTimeSlot === slot}
                                                                            >
                                                                                {formatTime(slot.startTime)}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Appointment Details */}
                                <div>
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                                            Appointment Details
                                        </h3>

                                        {selectedDate && selectedTimeSlot && (
                                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                                <h4 className="font-medium text-gray-700 mb-3">Your Selected Schedule</h4>
                                                <div className="flex items-start mb-3">
                                                    <Calendar className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Date:</p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatDateForDisplay(selectedDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Clock className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Time:</p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatTime(selectedTimeSlot?.startTime)} - {formatTime(selectedTimeSlot?.endTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <label htmlFor="appointmentReason" className="block text-sm font-medium text-gray-700 mb-2">
                                                Reason for Visit *
                                            </label>
                                            <input
                                                type="text"
                                                id="appointmentReason"
                                                value={bookingReason}
                                                onChange={(e) => setBookingReason(e.target.value)}
                                                placeholder="e.g., Annual checkup, Consultation, etc."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />

                                            {/* Common conditions */}
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500 mb-2">Common reasons (click to select):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {commonConditions.map((condition, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleConditionSelect(condition)}
                                                            className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                        >
                                                            {condition}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="appointmentNotes" className="block text-sm font-medium text-gray-700 mb-2">
                                                Additional Notes (Optional)
                                            </label>
                                            <textarea
                                                id="appointmentNotes"
                                                value={bookingNotes}
                                                onChange={(e) => setBookingNotes(e.target.value)}
                                                rows="4"
                                                placeholder="Any additional information for the doctor..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            ></textarea>
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={handleBookAppointment}
                                                disabled={!selectedDoctor || !selectedDate || !selectedTimeSlot || !bookingReason || isLoading}
                                                className={`w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-md ${!selectedDoctor || !selectedDate || !selectedTimeSlot || !bookingReason || isLoading
                                                    ? "bg-blue-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                                                        Booking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={18} className="mr-2" /> Book Appointment
                                                    </>
                                                )}
                                            </button>

                                            {!selectedDate && !selectedTimeSlot && (
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Please select a date and time to continue
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}