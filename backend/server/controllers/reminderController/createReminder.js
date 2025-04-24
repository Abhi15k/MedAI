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
    console.log("Received data:", req.body);

    try {
        const newReminder = new Medicine({
            userId,
            medicine,
            dosage,
            time,
            frequency,
            startDate,
            notes
        });

        const savedReminder = await newReminder.save();
        return res.status(201).json(savedReminder);
    } catch (err) {
        console.error("Error saving reminder:", err);
        return res.status(500).json({ error: 'Server error' });
    }
}