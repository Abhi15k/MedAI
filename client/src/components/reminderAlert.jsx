import { toast } from 'react-toastify';
import { Clock, Pill, Bell } from 'lucide-react';

// Function to show the enhanced medication toast
export const showMedicationReminder = (name, medicine, dosage, time) => {
  // Get greeting based on time
  const getGreeting = () => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  toast.info(
    <div className="flex items-start space-x-3">
      <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
        <Pill className="h-6 w-6 text-blue-600" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-blue-800">{getGreeting()}, {name}!</h3>
        <p className="mt-1 text-sm text-gray-600">
          Time to take your <span className="font-semibold text-blue-700">{medicine}</span> 
          <span className="text-gray-500"> ({dosage})</span>
        </p>
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>{time}</span>
        </div>
      </div>
    </div>,
    {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 border-l-4 border-l-blue-500"
    }
  );
};
