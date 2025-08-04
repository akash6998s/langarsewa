import React, { useState, useEffect } from "react";
import Loader from './Loader';
import { theme } from "../theme";

const { colors, fonts } = theme;

const TeamPerformance = () => {
  const [members, setMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

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
        }
      } catch (error) {
        console.error("Error loading from local storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const membersWithAttendance = members.map((member) => ({
    ...member,
    ...calculateAttendance(member),
  }));

  const sortedMembers = [...membersWithAttendance].sort((a, b) => b.percentage - a.percentage);

  return (
    <div
      className="container pb-24 mx-auto p-4 min-h-screen"
      style={{
        background: colors.background,
        fontFamily: fonts.body,
        color: colors.neutralDark,
      }}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2
            className="text-3xl font-extrabold pt-6 mb-4 text-center"
            style={{ fontFamily: fonts.heading, color: colors.primary }}
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
                  borderColor: colors.tertiary,
                  backgroundColor: colors.neutralLight,
                  color: colors.neutralDark,
                  "--tw-ring-color": colors.primary,
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
                  borderColor: colors.tertiary,
                  backgroundColor: colors.neutralLight,
                  color: colors.neutralDark,
                  "--tw-ring-color": colors.primary,
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

          {selectedYear && selectedMonth && members.length > 0 ? (
            <div
              className="overflow-x-auto rounded-lg shadow-md"
              style={{ backgroundColor: colors.neutralLight }}
            >
              <table
                className="w-full divide-y"
                style={{ borderColor: colors.tertiaryLight }}
              >
                <thead style={{ backgroundColor: colors.tertiaryLight }}>
                  <tr>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.neutralDark }}
                    >
                      Rank
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.neutralDark }}
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.neutralDark }}
                    >
                      Days Present
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.neutralDark }}
                    >
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? colors.neutralLight : colors.tertiaryLight,
                      }}
                    >
                      <td
                        className="px-2 sm:px-6 py-4 text-sm font-medium"
                        style={{ color: colors.neutralDark }}
                      >
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className="text-sm"
                            style={{ color: colors.neutralDark }}
                          >
                            {member.name} {member.last_name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-2 sm:px-6 py-4 text-sm"
                        style={{ color: colors.neutralDark }}
                      >
                        {member.presentDays}
                      </td>
                      <td
                        className="px-2 sm:px-6 py-4 text-sm"
                        style={{ color: colors.neutralDark }}
                      >
                        {member.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p
              className="text-center mt-6 p-4 rounded-lg shadow-sm"
              style={{
                color: colors.neutralDark,
                backgroundColor: colors.neutralLight,
              }}
            >
              {members.length > 0
                ? "Please select a year and a month to view team performance."
                : "No member data found in local storage. Make sure you have member data available to load."}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TeamPerformance;