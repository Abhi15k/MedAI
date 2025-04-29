import Medicine from '../../models/medicineModel.js';

export default async function getRemindersByUserId(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const reminders = await Medicine.find({ userId: id }).exec();
        
        return res.status(200).json(reminders);
    } catch (err) {
        console.error('Error fetching reminders:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}