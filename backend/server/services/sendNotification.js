import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
  }
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
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};