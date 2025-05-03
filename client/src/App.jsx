import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Appointment from "./pages/Appointment/Appointment";
import BookAppointment from "./pages/Appointment/BookAppointment";
import AppointmentDetails from "./pages/Appointment/AppointmentDetails";
import Reminder from "./pages/Reminder/Reminder";
import Prediction from "./pages/Prediction/Prediction";
import Summarizer from "./pages/Summarizer/Summarizer";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/appointment/book/:doctorId" element={<BookAppointment />} />
        <Route path="/appointment/details/:appointmentId" element={<AppointmentDetails />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/summarizer" element={<Summarizer />} />
      </Routes>
    </Router>
  );
}

export default App;
