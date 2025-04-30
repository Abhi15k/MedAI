import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { AuthContext } from '../contexts/authContext';
import { toast } from 'react-toastify';

export default function ReminderDialog({ 
  onReminderAdded, 
  editingReminder = null, 
  setEditingReminder, 
  onReminderUpdated 
}) {
    const { user, axiosInstance } = React.useContext(AuthContext);
    const [open, setOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({
        medicine: '',
        start: '',
        time: '',
        dosage: '',
        frequency: 'Daily',
        notes: ''
    });

    // Handle opening the dialog
    const handleClickOpen = () => {
        setOpen(true);
    };

    // Handle closing the dialog
    const handleClose = () => {
        setOpen(false);
        // Reset form if we were editing
        if (editingReminder) {
            setEditingReminder(null);
        }
        // Reset form values
        setFormData({
            medicine: '',
            start: '',
            time: '',
            dosage: '',
            frequency: 'Daily',
            notes: ''
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Format date for the input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Open dialog when editingReminder changes and is not null
    React.useEffect(() => {
        if (editingReminder) {
            // Format the data for the form
            setFormData({
                medicine: editingReminder.medicine || '',
                start: formatDateForInput(editingReminder.startDate),
                time: editingReminder.time || '',
                dosage: editingReminder.dosage || '',
                frequency: editingReminder.frequency || 'Daily',
                notes: editingReminder.notes || ''
            });
            setOpen(true);
        }
    }, [editingReminder]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const reminderPayload = {
            userId: user.user._id,
            medicine: formData.medicine,
            startDate: formData.start,
            time: formData.time,
            dosage: formData.dosage,
            frequency: formData.frequency,
            notes: formData.notes
        };
        
        try {
            let response;
            
            if (editingReminder) {
                // Update existing reminder
                response = await axiosInstance.put(`/reminder/${editingReminder._id}`, reminderPayload);
                toast.success('Reminder updated successfully');
                
                if (onReminderUpdated) {
                    onReminderUpdated(response.data.updatedReminder);
                }
            } else {
                // Create new reminder
                response = await axiosInstance.post('/reminder', reminderPayload);
                toast.success('Reminder added successfully');
                
                if (onReminderAdded) {
                    onReminderAdded(response.data);
                }
            }
            
            handleClose();
        } catch (error) {
            console.error('Error saving reminder:', error);
            toast.error(error.response?.data?.message || 'Failed to save reminder');
        }
    };

    return (
        <>
            {!editingReminder && (
                <button 
                    className="bg-[#ff3665] px-3 py-2 text-sm font-semibold rounded-sm text-white hover:bg-[#ff8787] cursor-pointer" 
                    onClick={handleClickOpen}
                    aria-label="Add new reminder"
                >
                    Add Reminder
                </button>
            )}
            
            <Dialog 
                open={open} 
                onClose={handleClose}
                aria-labelledby="reminder-dialog-title"
            >
                <DialogTitle 
                    id="reminder-dialog-title"
                    fontSize={'23px'} 
                    color='#162556'
                >
                    {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
                </DialogTitle>
                
                <DialogContent>
                    <DialogContentText fontSize={'15px'} color='#44537f'>
                        {editingReminder 
                            ? 'Update your medication reminder details in the fields shown below.'
                            : 'Stay on track with your medications by setting up personalized reminders.'}
                    </DialogContentText>
                    
                    <form  onSubmit={handleSubmit} className="space-y-4 mt-5">
                        <div>
                            <label htmlFor="medicine" className="block text-sm font-medium text-gray-700 mb-1">
                                Medicine Name
                            </label>
                            <input
                                id="medicine"
                                type="text"
                                name="medicine"
                                value={formData.medicine}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all"
                                placeholder="eg. Paracetamol"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                id="start"
                                type="date"
                                name="start"
                                value={formData.start}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                                Time
                            </label>
                            <input
                                id="time"
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage
                            </label>
                            <input
                                id="dosage"
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all"
                                placeholder="eg. 500mg, 1 tablet"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                            </label>
                            <select 
                                id="frequency"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all" 
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleInputChange}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <input
                                id="notes"
                                type="text"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3665] focus:border-[#ff3665c7] outline-none transition-all"
                                placeholder="eg. before food, after food"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={handleClose}
                                className="w-1/2 bg-white border-2 border-gray-200 hover:bg-gray-400 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="w-1/2 bg-[#ff3665] hover:bg-[#ff365edd] text-white font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {editingReminder ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}