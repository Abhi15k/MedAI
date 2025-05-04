import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Appointment from "./pages/Appointment/Appointment";
import BookAppointment from "./pages/Appointment/BookAppointment";
import AppointmentDetails from "./pages/Appointment/AppointmentDetails";
import Reminder from "./pages/Reminder/Reminder";
import Prediction from "./pages/Prediction/Prediction";
import Summarizer from "./pages/Summarizer/Summarizer";
import Login from "./pages/Home/Login";
import { ToastContainer } from "react-toastify";
import NotFound from "./pages/Home/NotFound";
import { AuthContext } from "./contexts/authContext";
import { useContext } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SignUp from "./pages/Home/SignUp";
import FcmToken from "./components/FcmToken";


// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading state or spinner while authentication state is being determined
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    </div>;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
    <ToastContainer />
    {user && <FcmToken />}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

          {/* Protected routes */}
          <Route
            path="/appointment"
            element={
              <ProtectedRoute>
                <Appointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminder"
            element={
              <ProtectedRoute>
                <Reminder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prediction"
            element={
              <ProtectedRoute>
                <Prediction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summarizer"
            element={
              <ProtectedRoute>
                <Summarizer />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;