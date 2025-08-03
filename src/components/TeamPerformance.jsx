import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// =================================================================================================
// NOTE: For this self-contained document, these components are defined here
// and then imported to demonstrate the requested file structure.
// In a real project, these would be in separate files.
// =================================================================================================

// Mock theme object - now imported from a non-existent file path for demonstration
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
      backgroundColor: `${theme.colors.neutralLight}`, // semi-transparent light background
    }}
  >
    <div className="flex flex-col items-center space-y-6">
      {/* Spinner */}
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

      {/* Loading Text */}
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
  const [sortOrder, setSortOrder] = useState("none"); // 'none', 'asc', 'desc'
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  // Updated month names to match the user-provided data format
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

  // Updated mock data to match the new format and key names
  const mockMembers = [
    {
      id: "1",
      last_name: "Pathak",
      roll_no: 1,
      email: "deepakpathak724@gmail.com",
      attendance: {
        2025: {
          June: [
            1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22,
            23, 24, 25, 26, 27, 28, 29, 30,
          ],
          August: [1, 2],
          May: [
            1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
          ],
          April: [
            1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
            22, 23, 24, 25, 26, 27, 28, 29, 30,
          ],
          March: [1, 2, 4, 8, 9, 11, 13, 15, 16, 22, 23, 25, 29, 30],
          July: [
            1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 24,
            25, 26, 27, 28, 29, 30, 31,
          ],
          January: [4, 7, 11, 12, 18, 19, 21, 25, 26, 28],
        },
      },
      address: "Sector -30, Faridabad",
      isSuperAdmin: false,
      approved: true,
      donation: {
        2025: { April: 500, March: 500, July: 500, May: 500, June: 500 },
      },
      name: "Deepak",
      password: "Narayan@3911",
      phone_no: "9818121311",
      isAdmin: true,
    },
    {
      id: "2",
      donation: {
        2025: { May: 1100, March: 100 },
      },
      isAdmin: false,
      roll_no: 2,
      name: "Bijender",
      isSuperAdmin: false,
      phone_no: "8860801938",
      last_name: "Yadav",
      attendance: {
        2025: {
          January: [11, 26],
          June: [1, 5, 7, 8, 12, 14, 15, 21, 22, 28, 29],
          May: [1, 2, 3, 4, 11, 18, 22, 23, 25, 27],
          March: [2, 13, 15, 22, 29, 30],
          April: [1, 6, 8, 12, 16, 20, 29, 30],
          July: [1, 8, 10, 12, 13, 19, 20, 21, 22, 26, 27],
        },
      },
      address: "Faridabad",
    },
    {
      id: "3",
      phone_no: "8010853551",
      password: "Test@1234",
      roll_no: 3,
      donation: {
        2025: {
          July: 100,
          March: 100,
          May: 1100,
          August: 100,
          April: 100,
          June: 100,
        },
      },
      attendance: {
        2025: {
          June: [4, 7, 14, 21, 22, 28],
          January: [4, 5, 11, 12, 18, 19],
          July: [5, 10, 12, 19, 26, 1],
          May: [3, 4, 10, 17, 18, 22, 24, 25, 27, 31],
          August: [2],
          April: [5, 6, 12, 13, 19, 22, 23, 27, 30],
          March: [1, 8, 9, 13, 15, 16, 22, 23, 29, 30],
        },
      },
      email: "v.kumar8997@gmail.com",
      address: "Ghaziabad",
      isAdmin: true,
      name: "Vikas",
      approved: true,
      isSuperAdmin: false,
      last_name: "Singh",
    },
  ];

  // Effect to load data from local storage on component mount
  useEffect(() => {
    setIsLoading(true);
    try {
      // Use the new local storage key "allMembers"
      const storedData = localStorage.getItem("allMembers");
      if (storedData) {
        const parsedMembers = JSON.parse(storedData);
        setMembers(parsedMembers);

        // Extract available years from the attendance data
        const years = new Set();
        parsedMembers.forEach((member) => {
          if (member.attendance) {
            Object.keys(member.attendance).forEach((year) => years.add(year));
          }
        });
        const sortedYears = Array.from(years).sort();
        setAvailableYears(sortedYears);

        // Get the current year and month for default selection
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString();
        // Convert month index to capitalized month name to match the data format
        const currentMonth = months[currentDate.getMonth()];

        // Set the default year and month
        if (sortedYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
        setSelectedMonth(currentMonth);
      } else {
        // If no data exists, use the new mock data and save to local storage
        setMembers(mockMembers);
        localStorage.setItem("allMembers", JSON.stringify(mockMembers));
        setPopupMessage(
          "No member data found under key 'allMembers'. Using and saving new mock data to local storage."
        );
        setPopupType("success");

        const years = new Set();
        mockMembers.forEach((member) => {
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
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
      setPopupMessage("Error loading data from local storage.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to reset sort order when search term changes
  useEffect(() => {
    setSortOrder("none");
  }, [searchTerm]);

  const getDaysInMonth = (year, month) => {
    // Correctly get month index from the capitalized month names
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

    // Access month data using the capitalized selectedMonth
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

  // Filter members based on search term
  const filteredMembers = membersWithAttendance.filter((member) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const nameMatch = `${member.name} ${member.last_name}`
      .toLowerCase()
      .includes(lowerCaseSearchTerm);
    // Convert roll_no to a string for searching
    const rollNoMatch = String(member.roll_no)
      .toLowerCase()
      .includes(lowerCaseSearchTerm);
    return nameMatch || rollNoMatch;
  });

  let sortedMembers = [...filteredMembers];
  if (sortOrder === "desc") {
    sortedMembers.sort((a, b) => b.percentage - a.percentage);
  } else if (sortOrder === "asc") {
    sortedMembers.sort((a, b) => a.percentage - b.percentage);
  }

  return (
    <div
      className="container pb-8 mx-auto p-4 min-h-screen font-sans"
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

      <div className="mb-6 flex flex-col sm:flex-row items-center gap-2 w-full">
        <label
          htmlFor="search"
          className="font-medium sr-only"
          style={{ color: theme.colors.neutralDark }}
        >
          Search Members:
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or roll number..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
          style={{
            borderColor: theme.colors.tertiaryLight,
            backgroundColor: theme.colors.neutralLight,
            color: theme.colors.neutralDark,
            "--tw-ring-color": theme.colors.primaryLight,
          }}
        />
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
                  Member
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
                  <td className="px-2 sm:px-6 py-4">
                    <div className="flex flex-col">
                      <strong
                        className="text-sm font-medium"
                        style={{ color: theme.colors.neutralDark }}
                      >
                        {member.roll_no}
                      </strong>
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
              : "No member data found in local storage."}
          </p>
        )
      )}
    </div>
  );
};

export default TeamPerformance;