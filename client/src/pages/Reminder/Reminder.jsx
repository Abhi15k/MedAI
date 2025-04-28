import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Reminder() {
    const [reminder, setReminder] = useState(null);

    useEffect(() => {
        const fetchReminder = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reminder`);
                setReminder(response.data);
                console.log("Reminder data:", response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchReminder();
    }, []);


    return (
        <>
            <Navbar />
            <main className="bg-gray-100 py-3 h-full">
                <header className="flex bg-[#ff3262] place-content-start place-items-center mx-6 rounded-lg ">
                    <div className=" ml-15 w-[550px] font-semibold text-center text-white absolute z-10">
                        <h1 className="text-7xl text-blue-950">Never Miss a Dosage</h1>
                        <p className="text-blue-950 mt-10 text-[16px] font-normal tracking-wider">Stay on track with smart medication reminders, personalized schedules, and effortless health management—powered by intelligent automation.</p>
                    </div>
                    <div className="w-full flex place-content-end">
                        <img className=" w-[800px] h-[550px] rotate-y-180 rounded-lg " src="medicine.png" alt="header image" />
                    </div>
                </header>
                <div className=" bg-white shadow-lg rounded-sm border border-gray-200 mx-6 my-10">
                    <header className="flex px-5 py-4 border-b border-gray-100 place-content-between place-items-center">
                        <h2 className="font-semibold text-xl text-blue-950">Reminders</h2>
                        <button className="bg-[#ff3665] px-3 py-2 text-sm font-semibold rounded-sm text-white hover:bg-[#ff8787] cursor-pointer ">Add Reminder</button>
                    </header>

                    <div className="py-2 px-5 ">
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                                    <tr>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Medicine Name</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Start Date</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Time</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Dosage</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Frequency</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap">
                                            <div className="font-semibold text-left">Notes</div>
                                        </th>
                                        <th className="p-2 whitespace-nowrap max-w-10">
                                            <div className="font-semibold text-left">Actions</div>
                                        </th>

                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {reminder?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left">{item.medicine}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left">{item.startDate}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left font-medium text-green-500">{item.time}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left">{item.dosage}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left">{item.frequency}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">
                                                <div className="text-left text-wrap">{item.notes}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap max-w-10">
                                                <div className="text-left flex gap-4">
                                                    <button className="text-blue-950 cursor-pointer hover:text-gray-500">
                                                        <Pencil />
                                                    </button>
                                                    <button className="text-red-600 cursor-pointer hover:text-red-400">
                                                        <Trash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}