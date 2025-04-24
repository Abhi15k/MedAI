import { HeartPulse } from "lucide-react";
import DropDown from "./DropDown";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center bg-white p-6 h-[65px] border-b-gray-100 border-b-2">
            <a href="/" className="text-blue-950 text-2xl font-bold flex gap-2"><HeartPulse size={32} strokeWidth={2.75} /> MedAI </a>

            <div className="flex space-x-5 text-[16px] tracking-wide place-items-center">
                <a href="/appointment" className="text-blue-950 hover:text-gray-400">Book an Appointment</a>
                <a href="/summarizer" className="text-blue-950 hover:text-gray-400">Report Summarizer</a>
                <a href="/prediction" className="text-blue-950 hover:text-gray-400">Disease Prediction</a>
                <a href="/reminder" className="text-blue-950 hover:text-gray-400">Medicine Reminder</a>
                <DropDown />
            </div>

        </nav>
    );
}