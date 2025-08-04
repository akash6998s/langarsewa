import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
const theme = {
  colors: {
    primary: "#334155",
    primaryLight: "#64748b",
    tertiaryLight: "#f1f5f9",
    background: "#ffffff",
    neutralLight: "#ffffff",
    neutralDark: "#334155",
    success: "#22c55e",
    error: "#ef4444",
  },
  fonts: {
    body: "system-ui, sans-serif",
  },
};

// Mock Loader Component
const Loader = () => (
  <div
    className="fixed inset-0 flex flex-col justify-center items-center z-500"
    style={{
      backdropFilter: "blur(6px)",
      backgroundColor: `${theme.colors.neutralLight}`,
    }}
  >
    <div className="flex flex-col items-center space-y-6">
      <div
        className="w-16 h-16 rounded-full border-8 border-solid animate-spin"
        style={{
          borderColor: `${theme.colors.primaryLight}66`,
          borderTopColor: theme.colors.primary,
          borderBottomColor: `${theme.colors.primaryLight}33`,
          borderLeftColor: `${theme.colors.primaryLight}33`,
          borderRightColor: `${theme.colors.primaryLight}33`,
        }}
      ></div>
      <div
        className="text-2xl font-semibold"
        style={{
          color: theme.colors.primary,
          fontFamily: theme.fonts.body,
        }}
      >
        Loading...
      </div>
    </div>
  </div>
);

// Mock CustomPopup Component
const CustomPopup = ({ message, type, onClose }) => {
  if (!message) return null;

  let bgColor, textColor, title;
  switch (type) {
    case "success":
      bgColor = theme.colors.success;
      textColor = theme.colors.neutralLight;
      title = "Success";
      break;
    case "error":
      bgColor = theme.colors.error;
      textColor = theme.colors.neutralLight;
      title = "Error";
      break;
    default:
      bgColor = theme.colors.primary;
      textColor = theme.colors.neutralLight;
      title = "Notification";
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="w-11/12 max-w-sm p-6 rounded-lg shadow-xl relative"
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: bgColor }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold leading-none p-1 rounded-full transition-colors duration-150 ease-in-out"
            style={{ color: theme.colors.neutralDark }}
          >
            &times;
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: theme.colors.neutralDark }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded-md font-semibold transition-colors duration-150 ease-in-out"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Mock LoadData component as a placeholder
const LoadData = () => null;

// =================================================================================================
// End of mock components
// =================================================================================================

const TeamPerformance = () => {
  const [members, setMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [sortOrder, setSortOrder] = useState("none");
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

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

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem("allMembers");
      if (storedData) {
        const parsedMembers = JSON.parse(storedData);
        setMembers(parsedMembers);

        const years = new Set();
        parsedMembers.forEach((member) => {
          if (member.attendance) {
            Object.keys(member.attendance).forEach((year) => years.add(year));
          }
        });
        const sortedYears = Array.from(years).sort();
        setAvailableYears(sortedYears);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString();
        const currentMonth = months[currentDate.getMonth()];

        if (sortedYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
        setSelectedMonth(currentMonth);
      } else {
        setMembers([]);
        setAvailableYears([]);
        setPopupMessage("No member data found in local storage under key 'allMembers'.");
        setPopupType("error");
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
      setPopupMessage("Error loading data from local storage.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDaysInMonth = (year, month) => {
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) return 0;
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const calculateAttendance = (member) => {
    if (!member.attendance || !selectedYear || !selectedMonth) {
      return { presentDays: 0, percentage: 0 };
    }

    const yearAttendance = member.attendance[selectedYear];

    if (!yearAttendance) {
      return { presentDays: 0, percentage: 0 };
    }

    const monthData = yearAttendance[selectedMonth];
    const presentDays = monthData ? monthData.length : 0;
    const totalDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const percentage =
      totalDaysInMonth > 0 ? (presentDays / totalDaysInMonth) * 100 : 0;

    return { presentDays, percentage };
  };

  const handleSortClick = () => {
    if (sortOrder === "none") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortOrder("asc");
    } else {
      setSortOrder("none");
    }
  };

  const membersWithAttendance = members.map((member) => ({
    ...member,
    ...calculateAttendance(member),
  }));

  let sortedMembers = [...membersWithAttendance];
  if (sortOrder === "desc") {
    sortedMembers.sort((a, b) => b.percentage - a.percentage);
  } else if (sortOrder === "asc") {
    sortedMembers.sort((a, b) => a.percentage - b.percentage);
  }

  return (
    <div
      className="container pb-24 mx-auto p-4 min-h-screen font-sans"
      style={{ backgroundColor: theme.colors.background }}
    >
      <LoadData />
      {isLoading && <Loader />}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}

      <h2
        className="text-3xl font-extrabold pt-6 mb-4 text-center font-[EB_Garamond,serif]"
        style={{ color: theme.colors.primary }}
      >
        Team Performance
      </h2>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.tertiaryLight,
              backgroundColor: theme.colors.neutralLight,
              color: theme.colors.neutralDark,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
          >
            <option value="">--Select Year--</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.tertiaryLight,
              backgroundColor: theme.colors.neutralLight,
              color: theme.colors.neutralDark,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
          >
            <option value="">--Select Month--</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isLoading && selectedYear && selectedMonth && members.length > 0 ? (
        <div
          className="overflow-x-auto rounded-lg shadow-md"
          style={{ backgroundColor: theme.colors.neutralLight }}
        >
          <table
            className="w-full divide-y"
            style={{ borderColor: theme.colors.tertiaryLight }}
          >
            <thead style={{ backgroundColor: theme.colors.tertiaryLight }}>
              <tr>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.neutralDark }}
                >
                  S.no
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.neutralDark }}
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.neutralDark }}
                >
                  Days Present
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                  onClick={handleSortClick}
                  style={{ color: theme.colors.neutralDark }}
                >
                  <div className="flex items-center">
                    Percentage
                    {sortOrder === "desc" && (
                      <ChevronDown className="ml-1 h-4 w-4 text-neutralDark" />
                    )}
                    {sortOrder === "asc" && (
                      <ChevronUp className="ml-1 h-4 w-4 text-neutralDark" />
                    )}
                    {sortOrder === "none" && (
                      <div className="flex flex-col ml-1">
                        <ChevronUp className="h-2 w-2 opacity-50" />
                        <ChevronDown className="h-2 w-2 opacity-50" />
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: theme.colors.neutralLight }}>
              {sortedMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={index % 2 === 0 ? "" : "bg-tertiaryLight"}
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? theme.colors.neutralLight
                        : theme.colors.tertiaryLight,
                  }}
                >
                  <td
                    className="px-2 sm:px-6 py-4 text-sm font-medium"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    {index + 1}
                  </td>
                  <td className="px-2 sm:px-6 py-4">
                    <div className="flex flex-col">
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.neutralDark }}
                      >
                        {member.name} {member.last_name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-2 sm:px-6 py-4 text-sm"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    {member.presentDays}
                  </td>
                  <td
                    className="px-2 sm:px-6 py-4 text-sm"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    {member.percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && (
          <p
            className="text-center mt-6 p-4 rounded-lg shadow-sm"
            style={{
              color: theme.colors.neutralDark,
              backgroundColor: theme.colors.neutralLight,
            }}
          >
            {members.length > 0
              ? "Please select a year and a month to view team performance."
              : "No member data found in local storage. Make sure you have member data available to load."}
          </p>
        )
      )}
    </div>
  );
};

export default TeamPerformance;