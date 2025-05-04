import { validationResult } from 'express-validator';
import { createReminderValidators }  from '../../utils/reminderValidator.js'; // Adjust path
import Medicine from '../../models/medicineModel.js'; // Adjust path to your model

export default async function createReminder(req, res) {

    await Promise.all(createReminderValidators.map(validator => validator.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, medicine, dosage, time, frequency, startDate, notes } = req.body;
    const capitalizedMedicine = medicine.charAt(0).toUpperCase() + medicine.slice(1);
    const capitalizedDosage = dosage.charAt(0).toUpperCase() + dosage.slice(1);
    const capitalizedNotes = notes.charAt(0).toUpperCase() + notes.slice(1);


    try {
        const newReminder = new Medicine({
            userId,
            medicine: capitalizedMedicine,
            dosage: capitalizedDosage,
            time,
            frequency,
            startDate,
            notes: capitalizedNotes,
        });

        const savedReminder = await newReminder.save();
        console.log("Saved Reminder:", savedReminder);
        return res.status(201).json(savedReminder);
    } catch (err) {
        console.error("Error saving reminder:", err);
        return res.status(500).json({ error: 'Server error' });
    }
}