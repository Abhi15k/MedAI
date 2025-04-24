import Medicine from '../../models/medicineModel.js';

export default async function deleteReminder(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Reminder ID is required' });
    }

    try {
        const deletedReminder = await Medicine.findByIdAndDelete(id);

        if (!deletedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        return res.status(200).json(`Reminder Deleted Successfully`);
    } catch (err) {
        console.error("Error deleting reminder:", err);
        return res.status(500).json({ error: 'Server error' });
    }
}