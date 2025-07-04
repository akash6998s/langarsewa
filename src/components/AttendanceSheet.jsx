import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";
import { theme } from "../theme"; // Assuming `theme.js` is in the parent directory

const months = [
  { name: "January", number: 0 },
  { name: "February", number: 1 },
  { name: "March", number: 2 },
  { name: "April", number: 3 },
  { name: "May", number: 4 },
  { name: "June", number: 5 },
  { name: "July", number: 6 },
  { name: "August", number: 7 },
  { name: "September", number: 8 },
  { name: "October", number: 9 },
  { name: "November", number: 10 },
  { name: "December", number: 11 },
];

// Generate years 2025 to 2035
const years = Array.from({ length: 11 }, (_, i) => 2025 + i);

// Helper function for sticky cell styles
const stickyCellStyle = (left, z = 0) => {
  let width = "150px"; // Default width for non-sticky or other columns (though not used directly for non-sticky here)
  let textAlign = "left"; // Default alignment

  if (left === 0) {
    width = "120px"; // DECREASED WIDTH for the combined sticky column
    textAlign = "left"; // Keep text left-aligned for name
  }

  return {
    position: "sticky",
    left,
    zIndex: z,
    border: `1px solid ${theme.colors.secondaryLight}`,
    width,
    minWidth: width,
    maxWidth: width,
    padding: "8px 10px",
    whiteSpace: "normal",
    wordWrap: "break-word",
    backgroundColor: theme.colors.neutralLight,
    textAlign,
  };
};

const AttendanceSheet = () => {
  // State for selected month and year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  // Set selectedYear to current year if it's within the range, otherwise default to 2025
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() < 2025 || new Date().getFullYear() > 2035
      ? 2025
      : new Date().getFullYear()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate days in the selected month and year
  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const days = getDaysInMonth(selectedMonth, selectedYear);

  // Effect to fetch attendance and member data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const attendanceRes = await fetch(
          "https://langar-backend.onrender.com/api/attendance"
        );
        const membersRes = await fetch(
          "https://langar-backend.onrender.com/api/members"
        );

        if (!attendanceRes.ok) throw new Error("Failed to fetch attendance");
        if (!membersRes.ok) throw new Error("Failed to fetch members");

        const attendanceData = await attendanceRes.json();
        const membersData = await membersRes.json();

        // Format attendance data for easier lookup
        const attendanceFormatted = attendanceData.map((item) => {
          const attendance = {};
          for (const year in item) {
            if (year === "RollNumber") continue; // Skip RollNumber which is a direct property
            attendance[year] = {};
            for (const month in item[year]) {
              attendance[year][month.toLowerCase()] = item[year][month]
                .split(",")
                .map((day) => parseInt(day.trim()))
                .filter(Boolean); // Filter out any empty strings or NaN from parsing
            }
          }
          return {
            roll: item.RollNumber,
            attendance,
          };
        });

        // Merge member data with their attendance records
        const merged = membersData.map((member) => {
          const attendance = attendanceFormatted.find(
            (a) => a.roll === member.RollNumber
          );
          return {
            roll: member.RollNumber,
            name: member.Name,
            last_name: member.LastName,
            phone: member.PhoneNumber,
            email: member.Email,
            address: member.Address,
            photo: member.Photo,
            attendance: attendance ? attendance.attendance : {}, // Assign attendance or an empty object
          };
        });

        setMembers(merged);
        setFilteredMembers(merged); // Initialize filtered members with all members
        setLoading(false);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to filter members based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) || m.roll.toString().includes(term)
    );
    setFilteredMembers(results);
  }, [searchTerm, members]); // Re-run when searchTerm or members change

  // Loading and Error states
  if (loading) return <Loader />;
  if (error)
    return (
      <div
        className="font-semibold text-center"
        style={{
          color: theme.colors.danger,
          fontFamily: theme.fonts.body,
        }}
      >
        {error}
      </div>
    );

  return (
    <div
      style={{
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
            style={{
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.neutralLight,
              color: theme.colors.neutralDark,
            }}
          >
            {months.map((month) => (
              <option key={month.number} value={month.number}>
                {month.name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
            style={{
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.neutralLight,
              color: theme.colors.neutralDark,
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name or roll number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full sm:w-72 text-sm shadow-sm"
          style={{
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.neutralLight,
            color: theme.colors.neutralDark,
          }}
        />
      </div>

      {/* Attendance Table Section */}
      {filteredMembers.length > 0 ? (
        <div
          className="overflow-x-auto rounded-md border shadow-md"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.secondaryLight,
          }}
        >
          {/* Inner div for vertical scrolling of table body */}
          <div style={{ maxHeight: "620px", overflowY: "auto" }}>
            <table
              className="min-w-[900px] w-full border-collapse border"
              style={{
                tableLayout: "fixed",
                borderColor: theme.colors.secondaryLight,
              }}
            >
              {/* Table Header */}
              <thead
                style={{
                  position: "sticky", // Make header sticky
                  top: 0, // Stick to the top
                  zIndex: 40, // Ensure it's above other scrolling content
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.neutralLight,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <tr>
                  {/* Combined Roll No. / Name sticky header */}
                  <th
                    style={{
                      ...stickyCellStyle(0, 30), // Apply sticky style at left: 0
                      backgroundColor: theme.colors.primary, // Match header background
                      textAlign: "left", // Ensure header text is left-aligned
                      padding: "10px", // Slightly more padding for aesthetics
                      fontSize: "1rem", // Slightly larger font for header
                    }}
                  >
                    Roll No. / Name
                  </th>
                  {/* Daily headers (1 to 31) */}
                  {[...Array(days)].map((_, i) => {
                    const date = new Date(selectedYear, selectedMonth, i + 1);
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short", // e.g., "Mon", "Tue"
                    });
                    return (
                      <th
                        key={i}
                        className="py-2 px-2 text-center text-xs border"
                        title={dayName} // Full day name on hover
                        style={{
                          width: "36px", // Fixed width for daily columns
                          color: theme.colors.neutralLight,
                          borderColor: theme.colors.secondaryLight,
                        }}
                      >
                        {i + 1} {/* Day number */}
                        <div style={{ fontSize: "10px" }}>{dayName}</div>{" "}
                        {/* Short day name */}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {filteredMembers.map((member, rowIndex) => {
                  const monthName = months[selectedMonth].name.toLowerCase();
                  // Get days present for the current member, year, and month
                  const daysPresent =
                    member.attendance?.[selectedYear]?.[monthName] || [];

                  // Alternate row background colors for better readability
                  const rowBg = rowIndex % 2 === 0 ? "#f0f0f0" : "#ffffff";

                  return (
                    <tr
                      key={member.roll}
                      style={{
                        backgroundColor: rowBg,
                        transition: "background-color 0.3s ease", // Smooth transition for hover
                      }}
                      // Subtle hover effect for the entire row
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          rowIndex % 2 === 0 ? "#e0e0e0" : "#f8f8f8"; // Slightly darker on hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = rowBg; // Restore original
                      }}
                    >
                      {/* Combined Roll No. and Name data cell */}
                      <td
                        style={{
                          ...stickyCellStyle(0, 2), // Apply sticky style at left: 0
                          backgroundColor: rowBg, // Match row background (will be overridden by onMouseEnter)
                          textAlign: "left", // Ensure cell text is left-aligned
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.95rem", // Slightly larger for roll number
                            color: theme.colors.primary, // Using primary color for roll to make it stand out
                            marginBottom: "2px", // Small space between roll and name
                          }}
                        >
                          {member.roll}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem", // Slightly smaller for name
                            color: theme.colors.neutralDark, // Standard dark text color for name
                          }}
                        >
                          {member.name} {member.last_name}
                        </div>
                      </td>
                      {/* Daily attendance cells */}
                      {[...Array(days)].map((_, i) => (
                        <td
                          key={i}
                          className="text-center border"
                          style={{
                            width: "36px",
                            color: theme.colors.success, // Color for the checkmark
                            padding: "6px 4px",
                            borderColor: theme.colors.secondaryLight,
                          }}
                        >
                          {/* Render Check icon if member was present on this day */}
                          {daysPresent.includes(i + 1) && (
                            <Check
                              className="w-4 h-4 mx-auto"
                              style={{ color: theme.colors.success }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Message when no members are found (e.g., after filtering)
        <div
          className="w-full text-center py-10 text-lg font-medium"
          style={{
            backgroundColor: theme.colors.neutralLight,
            color: theme.colors.tertiary,
          }}
        >
          No members found.
        </div>
      )}
    </div>
  );
};

export default AttendanceSheet;