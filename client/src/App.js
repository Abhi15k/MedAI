// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Appointment from './pages/Appointment/Appointment';
import Reminder from './pages/Reminder/Reminder';
import Prediction from './pages/Prediction/Prediction';
import Summarizer from './pages/Summarizer/Summarizer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/predict" element={<Prediction />} />
        <Route path="/summarizer" element={<Summarizer />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
