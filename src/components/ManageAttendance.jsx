import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import Popup from "reactjs-popup"; // Import Popup for the modal functionality
import "reactjs-popup/dist/index.css"; // Keep this for base Popup styles, overridden by custom ones
import LoadData from "./LoadData"; // Assuming LoadData is for global loading state

export default function ManageAttendance() {
  const [activeTab, setActiveTab] = useState("add");
  const [members, setMembers] = useState([]);
  const [year, setYear] = useState(String(new Date().getFullYear())); // Default to current year
  const [month, setMonth] = useState("July"); // Default to current month for example
  const [day, setDay] = useState(String(new Date().getDate())); // Default to current day for example
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showPopup, setShowPopup] = useState(false); // We'll manage popup visibility directly with this state
  const [loading, setLoading] = useState(true); // State for component specific loading
  const [error, setError] = useState(null); // State for component specific error

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 2 }, (_, i) => String(new Date().getFullYear() + i)); // Current year and next year

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        const memberList = [];
        querySnapshot.forEach((doc) => {
          memberList.push({ id: doc.id, ...doc.data() });
        });
        setMembers(memberList);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const handleSubmit = async () => {
    if (selectedRolls.length === 0) {
      alert("Please select at least one member.");
      return;
    }
    const dayNumber = Number(day);
    let successCount = 0;
    let skipCount = 0;

    for (let roll of selectedRolls) {
      const memberRef = doc(db, "members", roll);
      try {
        const memberSnap = await getDoc(memberRef);
        const data = memberSnap.data();
        const attendance = data?.attendance || {};
        const existingDays = attendance?.[year]?.[month] || [];

        if (!existingDays.includes(dayNumber)) {
          const newAttendance = {
            ...attendance,
            [year]: {
              ...(attendance[year] || {}),
              [month]: [...existingDays, dayNumber]
            }
          };
          await updateDoc(memberRef, { attendance: newAttendance });
          successCount++;
        } else {
          skipCount++;
        }
      } catch (e) {
        console.error(`Error updating attendance for ${roll}:`, e);
        // Optionally, add a more specific error message to the user for this roll
      }
    }

    alert(`Attendance added for ${successCount} members. ${skipCount} members already marked for this day.`);
    setSelectedRolls([]);
  };

  const handleDelete = async () => {
    if (selectedRolls.length === 0) {
      alert("Please select at least one member.");
      return;
    }
    const dayNumber = Number(day);
    let deletedCount = 0;

    for (let roll of selectedRolls) {
      const memberRef = doc(db, "members", roll);
      try {
        const memberSnap = await getDoc(memberRef);
        const data = memberSnap.data();
        const attendance = data?.attendance || {};

        if (attendance[year] && attendance[year][month] && attendance[year][month].includes(dayNumber)) {
          const updatedMonth = attendance[year][month].filter((d) => d !== dayNumber);

          if (updatedMonth.length > 0) {
            attendance[year][month] = updatedMonth;
          } else {
            // If month becomes empty, delete the month
            delete attendance[year][month];
          }

          if (Object.keys(attendance[year] || {}).length === 0) {
            // If year becomes empty, delete the year
            delete attendance[year];
          }

          await updateDoc(memberRef, { attendance });
          deletedCount++;
        }
      } catch (e) {
        console.error(`Error deleting attendance for ${roll}:`, e);
        // Optionally, add a more specific error message
      }
    }

    alert(`Attendance deleted for ${deletedCount} members.`);
    setSelectedRolls([]);
  };

  // Get days in selected month/year
  const getDaysInMonth = (year, month) => {
    const monthIndex = months.indexOf(month);
    return new Date(Number(year), monthIndex + 1, 0).getDate();
  };
  const currentDaysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: currentDaysInMonth }, (_, i) => String(i + 1));

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      <LoadData /> {/* Global loading indicator from parent */}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Manage Member Attendance</h2>

      {/* Tab Buttons (Identical to ManageDonation) */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "add" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Add Attendance
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "delete" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Delete Attendance
        </button>
      </div>

      {/* Date Selectors (Styled similar to ManageDonation inputs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg mb-8"> {/* Increased gap for consistency */}
        {/* Year Select */}
        <div className="relative">
          <label htmlFor="year-select-att" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
          <select
            id="year-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
        {/* Month Select */}
        <div className="relative">
          <label htmlFor="month-select-att" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <select
            id="month-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
        {/* Day Select */}
        <div className="relative">
          <label htmlFor="day-select-att" className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
          <select
            id="day-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {daysArray.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center text-blue-600 font-medium mb-4">Loading members...</div>
      )}
      {error && (
        <div className="text-center text-red-600 font-medium mb-4">{error}</div>
      )}

      {/* Select Roll Number Button & Popup Trigger (Identical to ManageDonation) */}
      <div className="w-full max-w-lg mb-6">
        <Popup
          trigger={
            <button
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75"
              onClick={() => setShowPopup(true)} // Manually control popup visibility
            >
              Select Roll Numbers ({selectedRolls.length} selected)
            </button>
          }
          modal
          nested
          open={showPopup} // Control open state with `showPopup`
          onClose={() => setShowPopup(false)} // Update state on close
          contentStyle={{
            background: 'white',
            borderRadius: '0.75rem', /* rounded-xl */
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', /* shadow-2xl */
            width: '90%', // Responsive width
            maxWidth: '672px', // Corresponds to max-w-2xl
            padding: '0', // Remove default padding for internal control
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh', // Ensure popup doesn't exceed viewport height
            margin: 'auto'
          }}
          overlayStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)', /* bg-black bg-opacity-60 */
          }}
        >
          {(close) => (
            // This div is the direct child of reactjs-popup's content wrapper.
            // It gets the full styling for the popup box itself.
            <div className="bg-white rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative">
              {/* Sticky Header for Heading and Close Button */}
              <div className="flex items-start justify-between p-6 pb-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                {/* Heading - Top Left */}
                <h2 className="text-2xl font-bold text-gray-800 flex-grow pr-4">
                  Select Roll Numbers
                </h2>
                
                {/* Close Button - Top Right */}
                <button
                  onClick={() => close()} // Use close from Popup render prop
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
                  aria-label="Close popup"
                >
                  <span className="material-icons text-3xl">close</span>
                </button>
              </div>

              {/* Scrollable Content Area */}
              {members.length === 0 && !loading ? (
                  <p className="text-gray-500 text-center py-8 px-6">No members available.</p>
              ) : (
                  <div className="grid grid-cols-5 gap-2 p-6 overflow-y-auto flex-grow">
                  {members.map((member) => (
                      <button
                          key={member.id}
                          onClick={() => toggleRoll(member.id)}
                          className={`
                            flex items-center justify-center p-3 rounded-lg border-2
                            text-lg font-bold transition-all duration-200 ease-in-out
                            ${selectedRolls.includes(member.id)
                              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                              : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                          `}
                      >
                        {member.id}
                      </button>
                  ))}
                  </div>
              )}
            </div>
          )}
        </Popup>
      </div>

      {/* Action Buttons (Identical to ManageDonation) */}
      <div className="w-full max-w-lg">
        {activeTab === "add" && (
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Submit Attendance
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Delete Attendance
          </button>
        )}
      </div>
    </div>
  );
}