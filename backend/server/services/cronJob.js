import cron from 'node-cron';
import Medicine from './../models/medicineModel.js';
import { calculateNextRunAt } from '../utils/calculateNextRun.js';
import { sendReminderEmail } from './sendEmail.js';
import { sendPushNotification } from './sendNotification.js';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '* * * * *'; // Default: every minute

// Helper function to send email and push notifications
const processReminder = async (reminder) => {
    const user = reminder.userId;

    if (!user || !user.email) {
        console.warn(`User not found for reminder ID: ${reminder._id}`);
        return;
    }

    try {
        // Send reminder email
        await sendReminderEmail({
            email: user.email,
            name: user.name || 'User',
            medicine: reminder.medicine,
            dosage: reminder.dosage,
            time: reminder.time,
        });

        if (user.fcmToken) {
            await sendPushNotification(
                user.fcmToken,
                user.name || 'User',
                reminder.medicine,
                reminder.dosage,
                reminder.time,
            );
        }
        // Update next run time and save
        reminder.nextRunAt = calculateNextRunAt(reminder.startDate, reminder.time, reminder.frequency);
        await reminder.save();
    } catch (err) {
        console.error(`Error processing reminder ID: ${reminder._id}`, err);
    }
};

// Cron job to process reminders
cron.schedule(CRON_SCHEDULE, async () => {
    const currentTime = new Date();

    try {
        // Fetch reminders and populate user details
        const dueReminders = await Medicine.find({
            nextRunAt: { $lte: currentTime },
        }).populate('userId', 'email name fcmToken'); // Fetch only required fields

        console.log(`[${new Date().toISOString()}] Found ${dueReminders.length} due reminders.`);
        // Process reminders concurrently
        await Promise.all(dueReminders.map(processReminder));
        console.log(`[${new Date().toISOString()}] Successfully processed ${dueReminders.length} reminders.`);
    } catch (err) {
        console.error('Cron Job Error:', err);
    }
});