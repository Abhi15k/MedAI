import express from 'express';

const ReminderRouter = express.Router();

// Demo route to get all reminders
ReminderRouter.get('/', (req, res) => {
    res.json({ message: 'Get all reminders' });
});

// Demo route to create a new reminder
ReminderRouter.post('/', (req, res) => {
    res.json({ message: 'Create a new reminder' });
});

// Demo route to update a reminder by ID
ReminderRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Update reminder with ID: ${id}` });
});

// Demo route to delete a reminder by ID
ReminderRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Delete reminder with ID: ${id}` });
});

export default ReminderRouter;