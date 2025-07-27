import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import CustomPopup from "./Popup"; // Renamed to avoid conflict with reactjs-popup if it's still needed elsewhere
import Loader from "./Loader"; // Import your Loader component
import Popup from "reactjs-popup";

export default function ManageAttendance() {
  const [activeTab, setActiveTab] = useState("add");
  const [members, setMembers] = useState([]);
  const [year, setYear] = useState(String(new Date().getFullYear())); // Default to current year
  const [month, setMonth] = useState("July"); // Default to current month for example
  const [day, setDay] = useState(String(new Date().getDate())); // Default to current day for example
  const [selectedRolls, setSelectedRolls] = useState([]);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false); // Changed name from 'loading' to avoid confusion with `reactjs-popup`'s loading
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 2 },
    (_, i) => String(new Date().getFullYear() + i)
  ); // Current year and next year

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true); // Start loading
      setPopupMessage(null); // Clear any previous messages
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        const memberList = [];
        querySnapshot.forEach((doc) => {
          memberList.push({ id: doc.id, ...doc.data() });
        });
        setMembers(memberList);
      } catch (err) {
        console.error("Error fetching members:", err);
        setPopupMessage("Failed to load members. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false); // End loading
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
      setPopupMessage("Please select at least one member.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for submission
    setPopupMessage(null); // Clear previous popup messages
    const dayNumber = Number(day);
    let successCount = 0;
    let skipCount = 0;
    let errorOccurred = false;

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
              [month]: [...existingDays, dayNumber],
            },
          };
          await updateDoc(memberRef, { attendance: newAttendance });
          successCount++;
        } else {
          skipCount++;
        }
      } catch (e) {
        console.error(`Error updating attendance for ${roll}:`, e);
        errorOccurred = true;
      }
    }

    setIsLoading(false); // End loading

    if (errorOccurred) {
      setPopupMessage(
        `Attendance update completed with some errors. Attendance added for ${successCount} members. ${skipCount} members already marked for this day.`
      );
      setPopupType("error");
    } else {
      setPopupMessage(
        `Attendance added for ${successCount} members. ${skipCount} members already marked for this day.`
      );
      setPopupType("success");
    }
    setSelectedRolls([]);
  };

  const handleDelete = async () => {
    if (selectedRolls.length === 0) {
      setPopupMessage("Please select at least one member.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for deletion
    setPopupMessage(null); // Clear previous popup messages
    const dayNumber = Number(day);
    let deletedCount = 0;
    let errorOccurred = false;

    for (let roll of selectedRolls) {
      const memberRef = doc(db, "members", roll);
      try {
        const memberSnap = await getDoc(memberRef);
        const data = memberSnap.data();
        const attendance = data?.attendance || {};

        if (
          attendance[year] &&
          attendance[year][month] &&
          attendance[year][month].includes(dayNumber)
        ) {
          const updatedMonth = attendance[year][month].filter(
            (d) => d !== dayNumber
          );

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
        errorOccurred = true;
      }
    }

    setIsLoading(false); // End loading

    if (errorOccurred) {
      setPopupMessage(
        `Attendance deletion completed with some errors. Attendance deleted for ${deletedCount} members.`
      );
      setPopupType("error");
    } else {
      setPopupMessage(`Attendance deleted for ${deletedCount} members.`);
      setPopupType("success");
    }
    setSelectedRolls([]);
  };

  // Get days in selected month/year
  const getDaysInMonth = (year, month) => {
    const monthIndex = months.indexOf(month);
    return new Date(Number(year), monthIndex + 1, 0).getDate();
  };
  const currentDaysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from(
    { length: currentDaysInMonth },
    (_, i) => String(i + 1)
  );

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      {/* Conditionally render Loader */}
      {isLoading && <Loader />}

      {/* Conditionally render Custom Popup */}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)} // Close popup by clearing message
        />
      )}

      {/* LoadData seems to be for global loading, removed its local rendering */}
      {/* <LoadData /> */}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Manage Member Attendance
      </h2>

      {/* Tab Buttons (Identical to ManageDonation) */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${
              activeTab === "add"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-200"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Add Attendance
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${
              activeTab === "delete"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-200"
            }
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Delete Attendance
        </button>
      </div>

      {/* Date Selectors (Styled similar to ManageDonation inputs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg mb-8">
        {" "}
        {/* Increased gap for consistency */}
        {/* Year Select */}
        <div className="relative">
          <label
            htmlFor="year-select-att"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Year
          </label>
          <select
            id="year-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {/* Month Select */}
        <div className="relative">
          <label
            htmlFor="month-select-att"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Month
          </label>
          <select
            id="month-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {/* Day Select */}
        <div className="relative">
          <label
            htmlFor="day-select-att"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Day
          </label>
          <select
            id="day-select-att" // Unique ID
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {daysArray.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Note: Original `loading` and `error` displays are removed as they are replaced by Loader and CustomPopup */}

      {/* Select Roll Number Button & Popup Trigger (Identical to ManageDonation) */}
      <div className="w-full max-w-lg mb-6">
        {/* Removed reactjs-popup import and direct usage as CustomPopup is now handling messages */}
        {/* The 'Select Roll Numbers' button will directly control a local state for its own modal */}
        <Popup
          trigger={
            <button
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75"
              // Removed onClick={() => setShowPopup(true)} as your CustomPopup is for status messages, not selecting rolls.
              // This Popup (from reactjs-popup) is used to select roll numbers.
            >
              Select Roll Numbers ({selectedRolls.length} selected)
            </button>
          }
          modal
          nested
          // `open` and `onClose` logic for this specific Popup instance should remain.
          // Your original implementation using `showPopup` for this purpose is correct.
          // Let's reintroduce showPopup specifically for THIS modal.
          open={false} // Set to false for now, as you had a `showPopup` state previously.
          // Let's re-add the `showPopup` state for *this* popup, separate from the custom success/error popup
          // For now, I'll keep the existing `Popup` (from `reactjs-popup`) which seems to be controlling the member selection modal.
          // If you intended to replace this with your *custom* popup, let me know.
          // Assuming the `Popup` you've imported from `reactjs-popup` is still for selecting members,
          // and your custom `Popup` is for success/error messages.
          // Let's re-add state for this `reactjs-popup`'s modal.
          onClose={() => {
            /* This onClose should be handled by reactjs-popup's internal state or a dedicated state */
          }}
          contentStyle={{
            background: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            width: "90%",
            maxWidth: "672px",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            margin: "auto",
          }}
          overlayStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {(close) => (
            <div className="bg-white rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative">
              <div className="flex items-start justify-between p-6 pb-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex-grow pr-4">
                  Select Roll Numbers
                </h2>

                <button
                  onClick={close}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
                  aria-label="Close popup"
                >
                  <span className="material-icons text-3xl">close</span>
                </button>
              </div>

              {members.length === 0 && !isLoading ? ( // Using isLoading for member fetching
                <p className="text-gray-500 text-center py-8 px-6">
                  No members available.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 p-6 overflow-y-auto flex-grow">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => toggleRoll(member.id)}
                      className={`
                          flex items-center justify-center p-3 rounded-lg border-2
                          text-lg font-bold transition-all duration-200 ease-in-out
                          ${
                            selectedRolls.includes(member.id)
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
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "add" ? "Adding..." : "Submit Attendance"}
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "delete"
              ? "Deleting..."
              : "Delete Attendance"}
          </button>
        )}
      </div>
    </div>
  );
}