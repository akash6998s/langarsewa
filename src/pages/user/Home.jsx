import React from "react";
import { useNavigate } from "react-router-dom";
import AttendanceSheet from "../../components/AttendanceSheet";
import UserProfileDropdown from "../../components/UserProfileDropdown";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <UserProfileDropdown/>
      {/* Heading */}
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-800">
        सुदर्शन सेना - भोजन वितरण
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-wrap mb-6">
        <div className="w-1/2 p-2">
          <button
            onClick={() => navigate("/addsuvichar")}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-xl shadow"
          >
            ➕ Add Suvichar
          </button>
        </div>
        <div className="w-1/2 p-2">
          <button
            onClick={() => navigate("/addmessage")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow"
          >
            📝 Add Message
          </button>
        </div>
        <div className="w-1/2 p-2">
          <button
            onClick={() => navigate("/addcomplaint")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow"
          >
            🛑 Add Complaint
          </button>
        </div>
        <div className="w-1/2 p-2">
          <button
            onClick={() => navigate("/addsuggestion")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow"
          >
            💡 Add Suggestion
          </button>
        </div>
      </div>

      {/* Attendance Section */}
      <AttendanceSheet />
    </div>
  );
};

export default Home;
