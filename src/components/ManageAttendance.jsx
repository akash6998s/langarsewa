import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { AiOutlineClose } from "react-icons/ai";
import CustomPopup from "./Popup"; // Renamed to avoid conflict with reactjs-popup if it's still needed elsewhere
import Loader from "./Loader"; // Import your Loader component
import Popup from "reactjs-popup"; // Keep this for the roll selection modal
import { theme } from '../theme'; // Import the theme

export default function ManageAttendance() {
  const [activeTab, setActiveTab] = useState("add");
  const [members, setMembers] = useState([]);
  const [year, setYear] = useState(String(new Date().getFullYear())); // Default to current year
  const [month, setMonth] = useState("July"); // Default to current month for example
  const [day, setDay] = useState(String(new Date().getDate())); // Default to current day for example
  const [selectedRolls, setSelectedRolls] = useState([]);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  // State for the reactjs-popup modal (for selecting rolls)
  const [showRollSelectionPopup, setShowRollSelectionPopup] = useState(false);


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
  { length: 11 }, // Create an array with 11 elements
  (_, i) => String(2025 + i) // Map each element to a string representing years from 2025 to 2035
);

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
        `Attendance added for ${successCount} members.`
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
    <div
      className="min-h-[calc(100vh-10rem)] rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center"
      style={{
        backgroundColor: theme.colors.neutralLight,
        fontFamily: theme.fonts.body,
      }}
    >
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

      <h2
        className="text-3xl font-extrabold mb-8 text-center"
        style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}
      >
        Manage Member Attendance
      </h2>

      {/* Tab Buttons */}
      <div
        className="flex rounded-xl p-1 mb-8 shadow-sm"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "add" ? theme.colors.primary : "transparent",
            color:
              activeTab === "add"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "add" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "add") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "add") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Add Attendance
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "delete" ? theme.colors.danger : "transparent",
            color:
              activeTab === "delete"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "delete" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.dangerLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "delete") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "delete") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Delete Attendance
        </button>
      </div>

      {/* Date Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg mb-8">
        {/* Year Select */}
        <div className="relative">
          <label
            htmlFor="year-select-att"
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Select Year
          </label>
          <select
            id="year-select-att" // Unique ID
            className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              outlineColor: theme.colors.primary,
            }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
            style={{ color: theme.colors.primary }}
          >
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
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Select Month
          </label>
          <select
            id="month-select-att" // Unique ID
            className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              outlineColor: theme.colors.primary,
            }}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
            style={{ color: theme.colors.primary }}
          >
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
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Select Day
          </label>
          <select
            id="day-select-att" // Unique ID
            className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              outlineColor: theme.colors.primary,
            }}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {daysArray.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
            style={{ color: theme.colors.primary }}
          >
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

      {/* Select Roll Number Button & Popup Trigger */}
      <div className="w-full max-w-lg mb-6">
        <Popup
          trigger={
            <button
              className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
              onClick={() => setShowRollSelectionPopup(true)} // Open the popup
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.neutralLight,
                "--tw-ring-color": theme.colors.primaryLight,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            >
              Select Roll Numbers ({selectedRolls.length} selected)
            </button>
          }
          modal
          nested
          open={showRollSelectionPopup} // Control popup visibility
          onClose={() => setShowRollSelectionPopup(false)} // Close the popup
          contentStyle={{
            background: theme.colors.neutralLight,
            borderRadius: "0.75rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            width: "90%",
            maxWidth: "672px",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            margin: "auto",
            border: `1px solid ${theme.colors.primaryLight}`,
          }}
          overlayStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {(close) => (
            <div
              className="rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              <div
                className="flex items-start justify-between p-6 pb-3 border-b sticky top-0 z-10"
                style={{
                  backgroundColor: theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                }}
              >
                <h2
                  className="text-2xl font-bold flex-grow pr-4"
                  style={{ color: theme.colors.neutralDark }}
                >
                  Select Roll Numbers
                </h2>

                <button
                  onClick={close}
                  className="rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2"
                  style={{
                    color: theme.colors.primary,
                    outlineColor: theme.colors.primaryLight,
                  }}
                  aria-label="Close popup"
                >
                  <AiOutlineClose
                    className="text-2xl"
                    style={{ color: theme.colors.primary }}
                  />
                </button>
              </div>

              {members.length === 0 && !isLoading ? ( // Using isLoading for member fetching
                <p
                  className="text-center py-8 px-6"
                  style={{ color: theme.colors.primary }}
                >
                  No members available.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 p-6 overflow-y-auto flex-grow">
                  {members
                    .sort((a, b) => Number(a.id) - Number(b.id)) // Sort members numerically by ID
                    .map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleRoll(member.id)}
                        className={`
                          flex items-center justify-center p-3 rounded-lg border-2
                          text-lg font-bold transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                        `}
                        style={{
                          backgroundColor: selectedRolls.includes(member.id)
                            ? theme.colors.primary
                            : theme.colors.tertiaryLight,
                          color: selectedRolls.includes(member.id)
                            ? theme.colors.neutralLight
                            : theme.colors.primary,
                          borderColor: selectedRolls.includes(member.id)
                            ? theme.colors.primary
                            : theme.colors.primaryLight,
                          boxShadow: selectedRolls.includes(member.id)
                            ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                            : "none",
                          transform: selectedRolls.includes(member.id)
                            ? "scale(1.05)"
                            : "none",
                          "--tw-ring-color": theme.colors.primaryLight,
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedRolls.includes(member.id)) {
                            e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.color = theme.colors.neutralDark;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRolls.includes(member.id)) {
                            e.currentTarget.style.backgroundColor = theme.colors.tertiaryLight;
                            e.currentTarget.style.borderColor = theme.colors.primaryLight;
                            e.currentTarget.style.color = theme.colors.primary;
                          }
                        }}
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

      {/* Action Buttons */}
      <div className="w-full max-w-lg">
        {activeTab === "add" && (
          <button
            onClick={handleSubmit}
            className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "add" ? "Adding..." : "Submit Attendance"}
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDelete}
            className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              backgroundColor: theme.colors.danger,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.dangerLight,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.dangerLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.danger}
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