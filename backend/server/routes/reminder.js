import express from 'express';
import createReminder from '../controllers/reminderController/createReminder.js';
import getAllReminder from '../controllers/reminderController/getAllReminder.js';
import getRemindersByUserId from '../controllers/reminderController/getReminderById.js';
import deleteReminder from '../controllers/reminderController/deleteReminder.js';
import updateReminder from '../controllers/reminderController/updateReminder.js';

const ReminderRouter = express.Router();

ReminderRouter.get('/', getAllReminder);
ReminderRouter.get('/:id', getRemindersByUserId);
ReminderRouter.post('/', createReminder);
ReminderRouter.put('/:id', updateReminder);
ReminderRouter.delete('/:id', deleteReminder);

export default ReminderRouter;