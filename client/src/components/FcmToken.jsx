import { useContext, useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../configs/firebase.js";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/authContext.jsx";

const FcmToken = () => {
  const { axiosInstance, user } = useContext(AuthContext);

  // Function to request notification permission and get FCM token
  const requestPermission = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return;
    }

    try {
      if (user) {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAP_ID, // Use environment variable for VAPID key
          serviceWorkerRegistration: registration,
        });

        if (token) {

          // Send the token to the server
          await axiosInstance.post("/reminder/fcm-token", {
            userId: user.user._id,
            fcmToken: token,
          });
        } else {
          console.warn("No registration token available.");
        }
      }
    } catch (err) {
      console.error("Error during FCM setup:", err);
    }
  };

  // Function to handle foreground messages
  const handleForegroundMessages = () => {
    onMessage(messaging, (payload) => {
      const { medicine, dosage } = payload.data;
      toast.info(`Time to take your Medicine: ${medicine} (${dosage})`, {
        autoClose: 5000,
        icon: () => <span>💊</span>
      });
    });
  }
  useEffect(() => {
    requestPermission();
    handleForegroundMessages();
  }, []);

  return null;
};

export default FcmToken;