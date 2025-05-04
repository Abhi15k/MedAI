import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useContext, useEffect, useState } from "react";
import ReminderDialog from "../../components/ReminderDialog";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";

export default function Reminder() {
    const { user, axiosInstance } = useContext(AuthContext);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState(null);

    useEffect(() => {
        fetchReminders();
    }, [user?.user?._id, axiosInstance]);

    const fetchReminders = async () => {
        if (!user?.user?._id) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/reminder/${user.user._id}`);
            setReminders(response.data || []);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            toast.error('Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    const addReminder = (newReminder) => {
        setReminders(prev => [...prev, newReminder]);
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        // This will trigger the dialog to open with the reminder data
    };

    const handleDelete = async (reminderId) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) return;

        try {
            await axiosInstance.delete(`/reminder/${reminderId}`);
            setReminders(prev => prev.filter(item => item._id !== reminderId));
            toast.success('Reminder deleted successfully');
        } catch (error) {
            console.error('Error deleting reminder:', error);
            toast.error('Failed to delete reminder');
        }
    };

    return (
        <>
            <Navbar />
            <main className="bg-gray-100 py-3 min-h-screen">
                <header className="flex bg-[#ff3262] place-content-start place-items-center mx-6 rounded-lg">
                    <div className="ml-15 w-[550px] font-semibold text-center text-white absolute z-10">
                        <h1 className="text-7xl text-blue-950">Never Miss a Dosage</h1>
                        <p className="text-blue-950 mt-10 text-[16px] font-normal tracking-wider">
                            Stay on track with smart medication reminders, personalized schedules, and effortless health management—powered by intelligent automation.
                        </p>
                    </div>
                    <div className="w-full flex place-content-end">
                        <img
                            className="w-[800px] h-[550px] rotate-y-180 rounded-lg"
                            src="medicine.png"
                            alt="Medication reminder header image"
                        />
                    </div>
                </header>

                <div className="bg-white shadow-lg rounded-sm border border-gray-200 mx-6 my-10">
                    <header className="flex px-5 py-4 border-b border-gray-100 place-content-between place-items-center">
                        <h2 className="font-semibold text-xl text-blue-950">Reminders</h2>
                        <ReminderDialog
                            onReminderAdded={addReminder}
                            editingReminder={editingReminder}
                            setEditingReminder={setEditingReminder}
                            onReminderUpdated={(updatedReminder) => {
                                setReminders(prev =>
                                    prev.map(item =>
                                        item._id === updatedReminder._id ? updatedReminder : item
                                    )
                                );
                                setEditingReminder(null);
                            }}
                        />
                    </header>

                    <div className="py-2 px-5">
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8">
                                                Loading reminders...
                                            </td>
                                        </tr>
                                    ) : reminders.length > 0 ? (
                                        reminders.map((item, index) => (
                                            <tr key={item._id || index}>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">{item.medicine}</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">
                                                        {new Date(item.startDate).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left font-medium text-green-500">
                                                        {item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        }) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">{item.dosage}</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">{item.frequency}</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left text-wrap max-w-xs truncate">
                                                        {item.notes || 'No notes'}
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap max-w-10">
                                                    <div className="text-left flex gap-4">
                                                        <button
                                                            className="text-blue-950 cursor-pointer hover:text-gray-500"
                                                            onClick={() => handleEdit(item)}
                                                            aria-label="Edit reminder"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-600 cursor-pointer hover:text-red-400"
                                                            onClick={() => handleDelete(item._id)}
                                                            aria-label="Delete reminder"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8">
                                                You don't have any reminders
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}