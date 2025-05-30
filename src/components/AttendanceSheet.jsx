import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";

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
        if (!res.ok) {
          throw new Error("Failed to fetch members");
        }
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
        m.name.toLowerCase().includes(term) ||
        m.roll.toString().toLowerCase().includes(term)
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 text-lg font-semibold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-full my-8 font-sans text-gray-700">
      <h1 className="text-xl font-semibold mb-6 text-center">
        Attendance Sheet
      </h1>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 max-w-md mx-auto">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
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
          className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search by name or roll"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="sticky left-0 bg-gray-100 border border-gray-300 px-3 py-2 text-left font-medium min-w-[4rem]">
                Roll
              </th>
              <th className="sticky left-[4rem] bg-gray-100 border border-gray-300 px-4 py-2 text-left font-medium min-w-[8rem]">
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
                    className="border border-gray-300 px-2 py-1 text-center font-medium text-gray-500 min-w-[2.5rem]"
                    title={dayName}
                  >
                    {i + 1}
                    <div className="text-xs">{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, idx) => {
                const monthName = months[selectedMonth].name.toLowerCase();
                const daysPresent =
                  member.attendance?.[selectedYear]?.[monthName] || [];

                return (
                  <tr
                    key={member.roll}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="sticky left-0 bg-white border border-gray-300 px-3 py-2 font-medium text-gray-700">
                      {member.roll}
                    </td>
                    <td className="sticky left-[4rem] bg-white border border-gray-300 px-4 py-2 font-medium text-gray-700">
                      {member.name}
                    </td>
                    {[...Array(days)].map((_, i) => (
                      <td
                        key={i}
                        className="border border-gray-300 px-2 py-1 text-center"
                      >
                        {daysPresent.includes(i + 1) && (
                          <span
                            aria-label="Present"
                            role="img"
                            className="text-green-600 font-bold select-none"
                          >
                            
<Check className="text-green-600 w-5 h-5 font-bold" aria-label="Present" />
                          </span>
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
                  className="text-center py-4 text-gray-500 italic"
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
