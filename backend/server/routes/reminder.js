import express from 'express';
import createReminder from '../controllers/reminderController/createReminder.js';
import getAllReminder from '../controllers/reminderController/getAllReminder.js';
import getRemindersByUserId from '../controllers/reminderController/getReminderById.js';
import deleteReminder from '../controllers/reminderController/deleteReminder.js';
import updateReminder from '../controllers/reminderController/updateReminder.js';
import { authenticateUser } from '../middleware/auth.js';
import updateFcmToken from '../controllers/reminderController/updateFcmToken.js';


const ReminderRouter = express.Router();

ReminderRouter.get('/', authenticateUser, getAllReminder);
ReminderRouter.get('/:id', authenticateUser, getRemindersByUserId);
ReminderRouter.post('/', authenticateUser, createReminder);
ReminderRouter.put('/:id', authenticateUser, updateReminder);
ReminderRouter.delete('/:id', authenticateUser, deleteReminder);
ReminderRouter.post('/fcm-token', authenticateUser, updateFcmToken);

export default ReminderRouter;