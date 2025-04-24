import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Appointment from "./pages/Appointment/Appointment";
import Reminder from "./pages/Reminder/Reminder";
import Prediction from "./pages/Prediction/Prediction";
import Summarizer from "./pages/Summarizer/Summarizer";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/summarizer" element={<Summarizer />} />
      </Routes>
    </Router>
  );
}

export default App;
