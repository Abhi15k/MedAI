import Medicine from '../../models/medicineModel.js';

export default async function getAllReminder(req, res) {
    try {
        const reminders = await Medicine.find().exec(); 
        return res.status(200).json(reminders);
    } catch (err) {
        console.error("Error fetching reminders:", err);
        return res.status(500).json({ error: 'Server error' });
    }
}