import Medicine from '../../models/medicineModel.js';
import { validationResult } from 'express-validator';
import { createReminderValidators } from '../../utils/reminderValidator.js';

export default async function updateReminder(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Reminder ID is required' });
    }

    await Promise.all(createReminderValidators.map(validator => validator.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, medicine, dosage, time, frequency, startDate, notes } = req.body;
    console.log("Received data:", req.body);
    try {
        const updatedReminder = await Medicine.findByIdAndUpdate(
            id,
            { userId, medicine, dosage, time, frequency, startDate, notes },
            { new: true }
        );

        if (!updatedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        return res.status(200).json({ message: 'Reminder updated successfully', updatedReminder });
    } catch (err) {
        console.error('Error updating reminder:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}