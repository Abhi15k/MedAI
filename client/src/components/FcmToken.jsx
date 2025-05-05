import { useContext, useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../configs/firebase.js";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/authContext.jsx";

const FcmToken = () => {
  const { axiosInstance, user } = useContext(AuthContext);
  const tokenSentRef = useRef(false);

  // Function to request notification permission and get FCM token
  const requestPermission = async () => {
    // Check if user object and user.user._id exist
    if (!user || !user.user || !user.user._id) {
      console.log("User not fully loaded, skipping FCM token setup");
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return;
    }

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAP_ID, // Use environment variable for VAPID key
        serviceWorkerRegistration: registration,
      });

      if (token) {
        // Only send token to server if we haven't already sent it
        if (!tokenSentRef.current) {
          try {
            await axiosInstance.post("/reminder/fcm-token", {
              userId: user.user._id,
              fcmToken: token,
            });
            tokenSentRef.current = true;
            console.log("FCM token successfully sent to server");
          } catch (err) {
            console.error("Failed to send FCM token to server:", err);
            // Don't update tokenSentRef so we can retry later
          }
        }
      } else {
        console.warn("No registration token available.");
        toast.warn("Notification permissions are required for medication reminders");
      }
    } catch (err) {
      console.error("Error during FCM setup:", err);
      toast.error("Failed to set up notifications. Some features may not work properly.");
    }
  };

  // Function to handle foreground messages
  const handleForegroundMessages = () => {
    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        const { medicine, dosage } = payload.data || {};
        toast.info(`Time to take your Medicine: ${medicine || 'Unknown'} (${dosage || 'Unknown'})`, {
          autoClose: 5000,
          icon: () => <span>💊</span>
        });
      });

      // Return cleanup function
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up message listener:", err);
      return null;
    }
  }

  useEffect(() => {
    // Delay FCM setup a bit to ensure user is properly loaded
    const timer = setTimeout(() => {
      if (user && user.user && user.user._id) {
        requestPermission();
        const unsubscribe = handleForegroundMessages();

        // Return cleanup function for the message listener
        return () => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      }
    }, 1500); // Give 1.5 seconds for auth to initialize properly

    return () => clearTimeout(timer);
  }, [user, axiosInstance]); // Add dependencies

  return null;
};

export default FcmToken;