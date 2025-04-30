import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the file path
const serviceAccountPath = path.join(__dirname, '../utils/medai-87fda-firebase-adminsdk-fbsvc-77b51b45a0.json');

// Initialize only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const sendPushNotification = async (fcmToken, name, medicine, dosage, time) => {
    if (!fcmToken || typeof fcmToken !== 'string') {
        console.warn('FCM token is missing, invalid, or not a string. Skipping notification.');
        return;
    }

    const message = {
        token: fcmToken,
        data: {
            name: name,
            medicine: medicine,
            dosage: dosage,
            time: time,
        },
    };

    try {
        const response = await admin.messaging().send(message);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};