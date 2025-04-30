/* eslint-env serviceworker */
/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDNiIa0aMIpebXEq06VWlPP3DrraCawun0",
    authDomain: "medai-87fda.firebaseapp.com",
    projectId: "medai-87fda",
    storageBucket: "medai-87fda.appspot.com",
    messagingSenderId: "941795786554",
    appId: "1:941795786554:web:66640d6a712467459dda03",
    measurementId: "G-MQY372HYX2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const { name, medicine, dosage, time } = payload.data;
    const title = `Medication Reminder 💊`;
    const body = `Hi ${name}, it's time to take your medication: ${medicine} (${dosage}) scheduled at ${time}.`;
    const options = {
        body: body,
        icon: '/medicine.png',
    };

    self.registration.showNotification(title, options);
});
