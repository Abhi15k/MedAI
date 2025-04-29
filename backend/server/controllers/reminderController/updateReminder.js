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
    const capitalizedMedicine = medicine.charAt(0).toUpperCase() + medicine.slice(1);
    const capitalizedDosage = dosage.charAt(0).toUpperCase() + dosage.slice(1);
    const capitalizedNotes = notes.charAt(0).toUpperCase() + notes.slice(1);
    console.log("Received data:", req.body);
    try {
        const updatedReminder = await Medicine.findByIdAndUpdate(
            id,
            { userId, medicine: capitalizedMedicine, dosage: capitalizedDosage, time, frequency, startDate, notes: capitalizedNotes },
            { new: true }
        );

        if (!updatedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        return res.status(200).json({ message: "Updated successfully", updatedReminder });
    } catch (err) {
        console.error('Error updating reminder:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}