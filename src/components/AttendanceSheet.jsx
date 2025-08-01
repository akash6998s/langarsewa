import { useState, useEffect, useCallback } from "react";
// No Firebase imports needed
import Loader from "../components/Loader"; // Assuming Loader component exists
import Popup from "../components/Popup"; // Assuming Popup component exists
import { theme } from "../theme"; // Import the theme
import LoadData from "./LoadData";

const Attendance = () => {
  // Get the current month and year to set as defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });

  // State variables for year, month, members, days in month, loading, and popup
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
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
  const years = Array.from({ length: 11 }, (_, i) => String(currentDate.getFullYear() + i));

  // --- Utility for Month Name Normalization ---
  const normalizeMonthName = (monthName) => {
    if (!monthName) return '';
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  };

  // --- Effect to calculate days in month and their short day names ---
  useEffect(() => {
    const normalizedMonth = normalizeMonthName(month);
    const monthIndex = months.findIndex(
      (m) => m.toLowerCase() === normalizedMonth.toLowerCase()
    );

    const safeMonthIndex = monthIndex !== -1 ? monthIndex : 0;

    const numDays = new Date(Number(year), safeMonthIndex + 1, 0).getDate();
    const daysArray = [];
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(Number(year), safeMonthIndex, i);
      const dayOfWeekShort = date.toLocaleDateString('en-US', { weekday: 'short' });
      daysArray.push({ day: i, dayOfWeek: dayOfWeekShort });
    }
    setDaysInMonth(daysArray);
  }, [year, month]);

  // --- Function to fetch members and their attendance data from localStorage ---
  const fetchMembersFromLocalStorage = useCallback(async () => {
    setLoading(true);
    setPopupMessage("");
    setPopupType("");

    const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const storedMembers = localStorage.getItem('allMembers');
      let allMembersData = storedMembers ? JSON.parse(storedMembers) : [];

      allMembersData.sort((a, b) => {
        const rollA = parseInt(a.roll_no, 10);
        const rollB = parseInt(b.roll_no, 10);

        if (isNaN(rollA) && isNaN(rollB)) return 0;
        if (isNaN(rollA)) return 1;
        if (isNaN(rollB)) return -1;

        return rollA - rollB;
      });

      const membersWithAttendance = allMembersData.map((member) => {
        const normalizedMonth = normalizeMonthName(month);
        const currentMonthAttendance = member.attendance?.[year]?.[normalizedMonth] || [];

        return {
          ...member,
          attendance: currentMonthAttendance,
        };
      });

      setMembers(membersWithAttendance);
    } catch (error) {
      console.error("Error fetching data from localStorage: ", error);
      setPopupMessage("Failed to load attendance data from local storage.");
      setPopupType("error");
    } finally {
      await minLoadPromise;
      setLoading(false);
    }
  }, [year, month]);

  // --- Effect to trigger data fetching when component mounts or `fetchMembersFromLocalStorage` changes ---
  useEffect(() => {
    fetchMembersFromLocalStorage();
  }, [fetchMembersFromLocalStorage]);

  // --- Filtered members based on search query ---
  const filteredMembers = members.filter(member => {
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
    const presentRollNumbers = members
      .filter((member) => member.attendance.includes(day))
      .map((member) => member.roll_no);

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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy);
      } else {
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
      {loading ? (
        <div className="min-h-screen flex items-center justify-center w-full" style={{ background: theme.colors.background }}>
          <Loader />
        </div>
      ) : (
        <>
          {/* Year & Month Dropdowns Container */}
          <div className="flex flex-row gap-4 mb-3 justify-center">
            {/* Year Dropdown */}
            <div className="relative flex-1">
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
            <div className="relative flex-1">
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
          <div className="mb-3 flex justify-center">
            <input
              type="text"
              placeholder="Search by roll no or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-white"
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: "1px",
                borderStyle: "solid",
                '--tw-ring-color': theme.colors.primaryLight,
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
                      className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-40 w-16 border border-gray-300"
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
                        className="p-1 text-center text-xs font-semibold uppercase tracking-wider border border-gray-300 cursor-pointer select-none min-w-[40px] sm:min-w-0 sm:px-3 sm:py-3 sm:text-sm"
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
                          className="px-2 py-3 align-top sticky left-0 z-10 shadow-sm w-16 border border-gray-300"
                          style={{ backgroundColor: theme.colors.neutralLight }}
                        >
                          <div
                            className="text-sm font-medium break-words"
                            style={{ color: theme.colors.neutralDark }}
                          >
                            <div
                              className="font-bold text-sm"
                              style={{ color: theme.colors.neutralDark }}
                            >
                              {member.roll_no}
                            </div>
                            <div
                              className="text-xs break-words"
                              style={{ color: theme.colors.primary }}
                            >
                              {member.name} {member.last_name}
                            </div>
                          </div>
                        </td>
                        {daysInMonth.map((dayData) => (
                          <td
                            key={`data-${member.roll_no}-${dayData.day}`}
                            className={`p-1 whitespace-nowrap text-center text-xs font-medium border border-gray-300 min-w-[40px] sm:min-w-0 sm:px-3 sm:py-3 sm:text-sm`}
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
