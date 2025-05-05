import { HeartPulse, Stethoscope } from "lucide-react";
import DropDown from "./DropDown";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { Link } from "react-router-dom";

export default function Navbar() {
    const { user } = useContext(AuthContext);

    // Check if user is a doctor or admin
    const isDoctor = user?.user?.role === 'doctor';
    const isAdmin = user?.user?.role === 'admin';

    return (
        <nav className="flex justify-between items-center bg-white p-6 h-[65px] border-b-gray-200 border-b-2">
            <Link to="/" className="text-blue-950 text-2xl font-bold flex gap-2"><HeartPulse size={32} strokeWidth={2.75} /> MedAI </Link>

            <div className="flex space-x-5 text-[16px] tracking-wide place-items-center">
                {!user ? <div className="space-x-6">
                    <Link to="/login"><button type="button" className="text-white font-normal bg-blue-950 w-[100px] h-[35px] rounded-full hover:bg-[#2d3a61] cursor-pointer">
                        Login
                    </button></Link>
                    <Link to="/signup"><button type="button" className="text-white font-normal bg-blue-950 w-[100px] h-[35px] rounded-full hover:bg-[#2d3a61] cursor-pointer">
                        SignUp
                    </button></Link>
                </div> : <>
                    {(isDoctor || isAdmin) ? (
                        <Link to="/doctor-dashboard" className="text-blue-950 hover:text-gray-400 flex items-center">
                            <Stethoscope className="mr-1 h-4 w-4" /> Doctor Dashboard
                        </Link>
                    ) : (
                        <Link to="/appointment" className="text-blue-950 hover:text-gray-400">Book an Appointment</Link>
                    )}
                    <Link to="/summarizer" className="text-blue-950 hover:text-gray-400">Report Summarizer</Link>
                    <Link to="/prediction" className="text-blue-950 hover:text-gray-400">Disease Prediction</Link>
                    <Link to="/reminder" className="text-blue-950 hover:text-gray-400">Medicine Reminder</Link>
                    <DropDown />
                </>}
            </div>
        </nav>
    );
}