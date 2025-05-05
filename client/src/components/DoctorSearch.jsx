import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { Search, X, Star, User, Stethoscope, RefreshCw } from "lucide-react";

export default function DoctorSearch({ onDoctorSelect }) {
    const { axiosInstance } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");
    const [experienceFilter, setExperienceFilter] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allSpecialties, setAllSpecialties] = useState([]);

    // Fetch all doctors on component mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    // Filter doctors when filters or search query change
    useEffect(() => {
        if (doctors.length > 0) {
            filterDoctors();
        }
    }, [searchQuery, specialtyFilter, experienceFilter, doctors]);

    // Extract unique specialties for filter
    useEffect(() => {
        if (doctors.length > 0) {
            const specialties = new Set();
            doctors.forEach(doctor => {
                if (doctor.specialties && doctor.specialties.length > 0) {
                    doctor.specialties.forEach(specialty => {
                        specialties.add(specialty);
                    });
                }
            });
            setAllSpecialties(Array.from(specialties).sort());
        }
    }, [doctors]);

    const fetchDoctors = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get("/api/appointment/doctors");
            setDoctors(response.data.data || []);
            setFilteredDoctors(response.data.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setError("Failed to load doctors. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = [...doctors];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                doctor =>
                    doctor.name.toLowerCase().includes(query) ||
                    (doctor.specialties && doctor.specialties.some(s => s.toLowerCase().includes(query)))
            );
        }

        // Filter by specialty
        if (specialtyFilter) {
            filtered = filtered.filter(
                doctor => doctor.specialties && doctor.specialties.includes(specialtyFilter)
            );
        }

        // Filter by experience
        if (experienceFilter) {
            const minYears = parseInt(experienceFilter);
            filtered = filtered.filter(doctor => doctor.experience >= minYears);
        }

        setFilteredDoctors(filtered);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSpecialtyFilter("");
        setExperienceFilter("");
    };

    // Format years of experience text
    const formatExperience = (years) => {
        if (!years && years !== 0) return "Experience not specified";
        return years === 1 ? "1 year of experience" : `${years} years of experience`;
    };

    return (
        <div className="doctor-search">
            {/* Search and filters section */}
            <div className="mb-8">
                {/* Search bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by doctor name or specialty"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Filter options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="specialtyFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Specialty
                        </label>
                        <select
                            id="specialtyFilter"
                            value={specialtyFilter}
                            onChange={(e) => setSpecialtyFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Specialties</option>
                            {allSpecialties.map((specialty, index) => (
                                <option key={index} value={specialty}>{specialty}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="experienceFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Experience
                        </label>
                        <select
                            id="experienceFilter"
                            value={experienceFilter}
                            onChange={(e) => setExperienceFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Any Experience</option>
                            <option value="2">2+ Years</option>
                            <option value="5">5+ Years</option>
                            <option value="10">10+ Years</option>
                            <option value="15">15+ Years</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="flex items-center px-4 py-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Doctor results section */}
            {isLoading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading doctors...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 bg-red-50 rounded-lg">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchDoctors}
                        className="mt-2 px-4 py-2 text-blue-500 hover:text-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">No doctors found</h4>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters to find available doctors.</p>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start">
                                    {/* Doctor Avatar */}
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center mr-4">
                                        {doctor.profileImage ? (
                                            <img
                                                src={doctor.profileImage}
                                                alt={`Dr. ${doctor.name}`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-blue-600" />
                                        )}
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Dr. {doctor.name}</h3>

                                        {doctor.specialties && doctor.specialties.length > 0 && (
                                            <div className="flex items-center mb-2">
                                                <Stethoscope className="w-4 h-4 text-blue-600 mr-1" />
                                                <p className="text-sm text-gray-700">{doctor.specialties.join(', ')}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center mb-2">
                                            <span className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                                <span className="text-sm font-medium">{doctor.rating || '4.5'}</span>
                                            </span>
                                            <span className="mx-2 text-gray-300">|</span>
                                            <span className="text-sm text-gray-500">{formatExperience(doctor.experience)}</span>
                                        </div>

                                        <div className="mt-3 flex items-center">
                                            <span className="text-blue-600 font-semibold">${doctor.consultationFee || '0'}</span>
                                            <span className="text-sm text-gray-500 ml-1">per consultation</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onDoctorSelect(doctor)}
                                    className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}