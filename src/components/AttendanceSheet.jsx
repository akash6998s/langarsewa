import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";
import { theme } from "../theme";

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

  const stickyCellStyle = (left, bg) => ({
    position: "sticky",
    left,
    backgroundColor: bg,
    zIndex: 10,
    border: "1px solid #d1d5db",
    width: left === 0 ? "50px" : "150px",
    padding: "8px 12px",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const attendanceRes = await fetch(
          "https://langar-backend.onrender.com/api/attendance"
        );
        const membersRes = await fetch("https://langar-backend.onrender.com/api/members");

        if (!attendanceRes.ok) throw new Error("Failed to fetch attendance");
        if (!membersRes.ok) throw new Error("Failed to fetch members");

        const attendanceData = await attendanceRes.json();
        const membersData = await membersRes.json();

        const attendanceFormatted = attendanceData.map((item) => {
          const attendance = {};
          for (const year in item) {
            if (year === "RollNumber") continue;
            attendance[year] = {};
            for (const month in item[year]) {
              attendance[year][month.toLowerCase()] = item[year][month]
                .split(",")
                .map((day) => parseInt(day.trim()))
                .filter(Boolean);
            }
          }
          return {
            roll: item.RollNumber,
            attendance,
          };
        });

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
            attendance: attendance ? attendance.attendance : {},
          };
        });

        setMembers(merged);
        setFilteredMembers(merged);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.roll.toString().includes(term)
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div
        className="font-semibold text-center"
        style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
      >
        {error}
      </div>
    );

  return (
    <div
      style={{ fontFamily: theme.fonts.body, color: theme.colors.neutralDark }}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
            style={{
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.surface,
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
              backgroundColor: theme.colors.surface,
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
          placeholder="Search by name or roll number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full sm:w-72 text-sm shadow-sm"
          style={{
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.surface,
          }}
        />
      </div>

      {/* Attendance Table */}
      {filteredMembers.length > 0 ? (
        <div
          className="overflow-x-auto rounded-md border shadow-md"
          style={{
            borderColor: "#e5e7eb",
            backgroundColor: theme.colors.surface,
          }}
        >
          <div
            style={{
              maxHeight: "620px",
              overflowY: "auto",
            }}
          >
            <table
              className="min-w-[900px] w-full border-collapse border border-neutral-300"
              style={{
                tableLayout: "fixed",
                borderColor: "#e5e7eb",
              }}
            >
              <thead
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.surface,
                }}
              >
                <tr>
                  <th style={stickyCellStyle(0, theme.colors.primary)}>
                    Roll
                  </th>
                  <th style={stickyCellStyle(50, theme.colors.primary)}>
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
                        className="py-2 px-2 text-center text-xs border border-neutral-300"
                        title={dayName}
                        style={{
                          width: "36px",
                          color: theme.colors.surface,
                        }}
                      >
                        {i + 1}
                        <div style={{ fontSize: "10px" }}>{dayName}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member, rowIndex) => {
                  const monthName = months[selectedMonth].name.toLowerCase();
                  const daysPresent =
                    member.attendance?.[selectedYear]?.[monthName] || [];

                  return (
                    <tr
                      key={member.roll}
                      className="hover:bg-[rgba(217,119,6,0.1)]"
                      style={{
                        backgroundColor:
                          rowIndex % 2 === 0
                            ? theme.colors.neutralLight
                            : theme.colors.surface,
                      }}
                    >
                      <td style={stickyCellStyle(0, theme.colors.surface)}>
                        {member.roll}
                      </td>
                      <td style={stickyCellStyle(50, theme.colors.surface)}>
                        {member.name} {member.last_name}
                      </td>

                      {[...Array(days)].map((_, i) => (
                        <td
                          key={i}
                          className="text-center border border-neutral-300"
                          style={{
                            width: "36px",
                            color: theme.colors.success,
                            padding: "6px 4px",
                          }}
                        >
                          {daysPresent.includes(i + 1) && (
                            <Check
                              className="w-4 h-4 mx-auto"
                              style={{ color: theme.colors.secondary }}
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
        <div
          className="w-full text-center py-10 text-lg font-medium"
          style={{
            backgroundColor: theme.colors.surface,
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
