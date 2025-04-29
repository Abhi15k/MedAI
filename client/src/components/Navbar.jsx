import { HeartPulse } from "lucide-react";
import DropDown from "./DropDown";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { Link } from "react-router-dom";

export default function Navbar() {
    const { user } = useContext(AuthContext)
    return (
        <nav className="flex justify-between items-center bg-white p-6 h-[65px] border-b-gray-200 border-b-2">
            <a href="/" className="text-blue-950 text-2xl font-bold flex gap-2"><HeartPulse size={32} strokeWidth={2.75} /> MedAI </a>



            <div className="flex space-x-5 text-[16px] tracking-wide place-items-center">
                {!user ? <div className="space-x-6">
                    <Link to="/login"><button type="button" className="text-white font-normal bg-blue-950 w-[100px] h-[35px] rounded-full hover:bg-[#2d3a61] cursor-pointer">
                       Login
                    </button></Link>
                    <Link to="/signup"><button type="button" className="text-white font-normal bg-blue-950 w-[100px] h-[35px] rounded-full hover:bg-[#2d3a61] cursor-pointer">
                       SignUp
                    </button></Link>
                </div> : <><a href="/appointment" className="text-blue-950 hover:text-gray-400">Book an Appointment</a>
                    <a href="/summarizer" className="text-blue-950 hover:text-gray-400">Report Summarizer</a>
                    <a href="/prediction" className="text-blue-950 hover:text-gray-400">Disease Prediction</a>
                    <a href="/reminder" className="text-blue-950 hover:text-gray-400">Medicine Reminder</a>
                    <DropDown /></>
                }

            </div>
        </nav>
    );
}