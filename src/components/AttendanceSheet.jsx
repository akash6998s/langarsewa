import { useState, useEffect, useCallback } from "react";
// No Firebase imports needed
import Loader from "../components/Loader"; // Assuming Loader component exists
import Popup from "../components/Popup"; // Assuming Popup component exists
import { theme } from "../theme"; // Import the theme
import LoadData from "./LoadData";

const Attendance = () => {
  // State variables for year, month, members, days in month, loading, and popup
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [members, setMembers] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Define available months and years for dropdowns
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));

  // --- Utility for Month Name Normalization ---
  // Firebase stores months like "January", "February", etc.
  // JavaScript Date.toLocaleDateString('en-US', { month: 'long' }) also gives this format.
  // Ensure consistency by capitalizing the first letter and making the rest lowercase.
  const normalizeMonthName = (monthName) => {
    if (!monthName) return '';
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  };

  // --- Effect to calculate days in month and their short day names ---
  // This runs whenever the selected year or month changes
  useEffect(() => {
    const normalizedMonth = normalizeMonthName(month); // Normalize selected month name
    const monthIndex = months.findIndex(
      (m) => m.toLowerCase() === normalizedMonth.toLowerCase()
    );

    // If month not found, default to 0 (January) to avoid errors
    const safeMonthIndex = monthIndex !== -1 ? monthIndex : 0;

    const numDays = new Date(Number(year), safeMonthIndex + 1, 0).getDate();
    const daysArray = [];
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(Number(year), safeMonthIndex, i);
      // Get short form of the day of the week (e.g., "Mon", "Tue")
      const dayOfWeekShort = date.toLocaleDateString('en-US', { weekday: 'short' });
      daysArray.push({ day: i, dayOfWeek: dayOfWeekShort });
    }
    setDaysInMonth(daysArray);
  }, [year, month]); // Dependencies for this effect

  // --- Function to fetch members and their attendance data from localStorage ---
  // Wrapped in useCallback to memoize and prevent unnecessary re-creations
  const fetchMembersFromLocalStorage = useCallback(async () => {
    setLoading(true); // Ensure loading is true when data fetch starts
    setPopupMessage("");
    setPopupType("");

    const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

    try {
      // Get all members data from localStorage
      const storedMembers = localStorage.getItem('allMembers');
      let allMembersData = storedMembers ? JSON.parse(storedMembers) : [];

      // Sort members numerically by roll_no as per requirement
      allMembersData.sort((a, b) => {
        // Use 'roll_no' as per the provided data structure
        const rollA = parseInt(a.roll_no, 10);
        const rollB = parseInt(b.roll_no, 10);

        // Handle cases where roll_no might be missing or invalid (NaN)
        if (isNaN(rollA) && isNaN(rollB)) return 0;
        if (isNaN(rollA)) return 1; // Put members with invalid roll_no at the end
        if (isNaN(rollB)) return -1; // Put members with invalid roll_no at the end

        return rollA - rollB; // Numerical ascending sort
      });

      // Process each member to extract attendance for the selected year and month
      const membersWithAttendance = allMembersData.map((member) => {
        // Normalize the selected month name to match local storage keys (e.g., "July")
        const normalizedMonth = normalizeMonthName(month);

        // Access attendance from the member object for the current year and normalized month
        // Ensure the year is accessed as a string key
        const currentMonthAttendance = member.attendance?.[year]?.[normalizedMonth] || [];

        return {
          ...member,
          attendance: currentMonthAttendance, // This will be an array of days [1, 5, 10]
        };
      });

      setMembers(membersWithAttendance);
    } catch (error) {
      console.error("Error fetching data from localStorage: ", error);
      setPopupMessage("Failed to load attendance data from local storage.");
      setPopupType("error");
    } finally {
      // Ensure the loader stays for at least 3 seconds
      await minLoadPromise;
      setLoading(false);
    }
  }, [year, month]); // Dependencies: re-run if year or month changes

  // --- Effect to trigger data fetching when component mounts or `fetchMembersFromLocalStorage` changes ---
  useEffect(() => {
    fetchMembersFromLocalStorage();
  }, [fetchMembersFromLocalStorage]);

  // --- Filtered members based on search query ---
  const filteredMembers = members.filter(member => {
    // Ensure roll_no, name, and last_name are treated as strings before calling toLowerCase()
    // Handle potential null/undefined values by defaulting to an empty string
    const rollNo = String(member.roll_no || '').toLowerCase();
    const name = String(member.name || '').toLowerCase();
    const lastName = String(member.last_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      name.includes(query) ||
      lastName.includes(query) ||
      rollNo.includes(query)
    );
  });

  // --- Function to copy attendance for a specific day ---
  const handleCopyAttendance = (day) => {
    // Filter members who were present on the selected day and get their roll numbers
    const presentRollNumbers = members
      .filter((member) => member.attendance.includes(day))
      .map((member) => member.roll_no);

    // Sort the roll numbers numerically before joining for a clean, ordered output
    presentRollNumbers.sort((a, b) => {
      const rollA = parseInt(a, 10);
      const rollB = parseInt(b, 10);
      if (isNaN(rollA) && isNaN(rollB)) return 0;
      if (isNaN(rollA)) return 1;
      if (isNaN(rollB)) return -1;
      return rollA - rollB;
    });

    const textToCopy = presentRollNumbers.join(", ");

    try {
      // Use the modern Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers (document.execCommand is deprecated but still works)
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setPopupMessage("Copied roll numbers successfully!");
      setPopupType("success");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setPopupMessage("Failed to copy roll numbers. Please try manually.");
      setPopupType("error");
    }
  };

  // --- Component Render ---
  return (
    <div
      className="p-6 md:p-10 font-[Inter,sans-serif]"
      style={{ background: theme.colors.background }}
    >
      <LoadData/>
      {/* Conditional rendering for the main content */}
      {loading ? (
        <div className="min-h-screen flex items-center justify-center w-full" style={{ background: theme.colors.background }}>
          <Loader />
        </div>
      ) : (
        <>
          {/* Year & Month Dropdowns Container */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            {/* Year Dropdown */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block appearance-none w-full bg-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
                style={{
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                disabled={loading}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="block appearance-none w-full bg-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
                style={{
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                disabled={loading}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              placeholder="Search by roll no or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: "1px",
                borderStyle: "solid",
                backgroundColor: theme.colors.backgroundVariant,
                '--tw-ring-color': theme.colors.primaryLight, // Tailwind ring color
              }}
              disabled={loading}
            />
          </div>


          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
              <table className="w-full border-collapse table-auto">
                {/* Table Header */}
                <thead
                  style={{ backgroundColor: theme.colors.tertiaryLight }}
                  className="sticky top-0 z-50"
                >
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-40 w-28 sm:w-40 border border-gray-300"
                      style={{
                        backgroundColor: theme.colors.tertiaryLight,
                        color: theme.colors.primary,
                      }}
                    >
                      Roll No & Name
                    </th>
                    {daysInMonth.map((dayData) => (
                      <th
                        key={`header-${dayData.day}`}
                        className="p-1 text-center text-xs font-semibold uppercase tracking-wider border border-gray-300 cursor-pointer select-none min-w-[50px] sm:min-w-0 sm:px-3 sm:py-3 sm:text-sm"
                        style={{ color: theme.colors.primary }}
                        onDoubleClick={() => handleCopyAttendance(dayData.day)}
                        title={`Double-click to copy roll numbers for Day ${dayData.day}`}
                      >
                        {dayData.day}
                        <br />
                        {dayData.dayOfWeek}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody
                  className="bg-white divide-y"
                  style={{ borderColor: theme.colors.primaryLight }}
                >
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={daysInMonth.length + 1}
                        className="text-center py-8 text-base border border-gray-300"
                        style={{ color: theme.colors.primary }}
                      >
                        No members found or attendance data for the selected
                        period.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.roll_no}
                        className="transition-colors duration-150 ease-in-out"
                      >
                        <td
                          className="px-4 py-3 align-top sticky left-0 z-10 shadow-sm w-28 sm:w-40 border border-gray-300"
                          style={{ backgroundColor: theme.colors.neutralLight }}
                        >
                          <div
                            className="text-sm font-medium break-words"
                            style={{ color: theme.colors.neutralDark }}
                          >
                            <div
                              className="font-bold text-base"
                              style={{ color: theme.colors.neutralDark }}
                            >
                              {member.roll_no}
                            </div>
                            <div
                              className="text-sm break-words"
                              style={{ color: theme.colors.primary }}
                            >
                              {member.name} {member.last_name}
                            </div>
                          </div>
                        </td>
                        {daysInMonth.map((dayData) => (
                          <td
                            key={`data-${member.roll_no}-${dayData.day}`}
                            className={`p-1 whitespace-nowrap text-center text-xs font-medium border border-gray-300 min-w-[50px] sm:min-w-0 sm:px-3 sm:py-3 sm:text-sm`}
                            style={{
                              color: member.attendance.includes(dayData.day)
                                ? theme.colors.success
                                : theme.colors.primaryLight,
                            }}
                          >
                            {member.attendance.includes(dayData.day) ? "✔" : ""}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popup Component */}
          <Popup
            message={popupMessage}
            type={popupType}
            onClose={() => {
              setPopupMessage("");
              setPopupType("");
            }}
          />
        </>
      )}
    </div>
  );
};

export default Attendance;