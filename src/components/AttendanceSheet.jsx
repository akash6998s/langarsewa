import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";
import { theme } from ".././theme";

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

const years = [2025, 2026, 2027];

const AttendanceSheet = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const days = getDaysInMonth(selectedMonth, selectedYear);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("https://langarsewa-db.onrender.com/attendance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        setMembers(data);
        setFilteredMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) || m.roll.toString().includes(term)
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-red-600 font-semibold p-4 text-center">{error}</div>
    );

  // Sticky styles for first two columns
  const stickyRollStyle = {
    position: "sticky",
    left: 0,
    backgroundColor: theme.colors.surface,
    zIndex: 4,
    minWidth: "80px",
    maxWidth: "80px",
    paddingLeft: "12px",
    paddingRight: "12px",
  };
  const stickyNameStyle = {
    position: "sticky",
    left: "80px", // width of roll column
    backgroundColor: theme.colors.surface,
    zIndex: 5,
    minWidth: "180px",
    maxWidth: "250px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingLeft: "12px",
    paddingRight: "12px",
  };

  return (
    <div
      className="min-h-screen pb-16 px-4 sm:px-8"
      style={{
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.neutralDark,
            }}
          >
            {months.map((month) => (
              <option key={month.number} value={month.number}>
                {month.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
            style={{
              borderColor: theme.colors.primary,
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

        <input
          type="text"
          placeholder="Search by name or roll"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full sm:w-72 text-sm shadow-sm"
          style={{
            borderColor: theme.colors.accent,
            color: theme.colors.neutralDark,
          }}
        />
      </div>

      <div
        className="overflow-x-auto rounded-md border shadow-md"
        style={{ borderColor: theme.colors.neutralLight }}
      >
        <table
          className="min-w-[900px] w-full border-collapse"
          style={{
            fontFamily: theme.fonts.body,
            color: theme.colors.neutralDark,
            backgroundColor: theme.colors.surface,
            tableLayout: "auto",
          }}
        >
          <thead
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.surface,
              fontFamily: theme.fonts.heading,
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              <th
                className="py-3 px-4 text-left"
                style={{
                  ...stickyRollStyle,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.surface,
                }}
                title="Roll Number"
              >
                Roll
              </th>
              <th
                className="py-3 px-4 text-left"
                style={{
                  ...stickyNameStyle,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.surface,
                }}
                title="Name"
              >
                Name
              </th>
              {[...Array(days)].map((_, i) => {
                const date = new Date(selectedYear, selectedMonth, i + 1);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                return (
                  <th
                    key={i}
                    className="py-2 px-2 text-center text-xs"
                    title={dayName}
                    style={{
                      borderColor: theme.colors.neutralLight,
                      minWidth: "30px",
                      maxWidth: "30px",
                    }}
                  >
                    {i + 1}
                    <div
                      style={{
                        fontSize: "10px",
                        color: theme.colors.primaryLight,
                      }}
                    >
                      {dayName}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, rowIndex) => {
                const monthName = months[selectedMonth].name.toLowerCase();
                const daysPresent =
                  member.attendance?.[selectedYear]?.[monthName] || [];

                return (
                  <tr
                    key={member.roll}
                    style={{
                      backgroundColor:
                        rowIndex % 2 === 0
                          ? theme.colors.neutralLight
                          : theme.colors.surface,
                    }}
                    className="hover:bg-primary/10"
                  >
                    <td
                      className="py-2 px-4 font-medium"
                      style={stickyRollStyle}
                      title={`Roll: ${member.roll}`}
                    >
                      {member.roll}
                    </td>
                    <td
                      className="py-2 px-4"
                      style={stickyNameStyle}
                      title={`${member.name} ${member.last_name}`}
                    >
                      {member.name} {member.last_name}
                    </td>
                    {[...Array(days)].map((_, i) => (
                      <td
                        key={i}
                        className="text-center"
                        style={{ borderColor: theme.colors.neutralLight }}
                      >
                        {daysPresent.includes(i + 1) && (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={2 + days}
                  className="text-center py-6"
                  style={{ color: theme.colors.tertiary }}
                >
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSheet;
