import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { theme } from "../theme";
import Topbar from "./Topbar";
import { FaTrophy } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

const { colors, fonts } = theme;

// Custom Tooltip for the Bar Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-lg shadow-lg"
        style={{
          backgroundColor: colors.neutralLight,
          border: `1px solid ${colors.primary}`,
          color: colors.neutralDark,
        }}
      >
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-sm">
          Total Days Present:{" "}
          <span style={{ color: colors.primary }}>
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const TeamPerformance = () => {
  const [members, setMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterZero, setFilterZero] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [monthlyData, setMonthlyData] = useState([]);
  const [showGraphPopup, setShowGraphPopup] = useState(false);

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

  const showCopyPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

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

  useEffect(() => {
    if (selectedYear && members.length > 0) {
      const monthlyTotals = months.map((month) => ({
        month,
        totalAttendance: 0,
      }));

      members.forEach((member) => {
        const yearAttendance = member.attendance?.[selectedYear];
        if (yearAttendance) {
          months.forEach((month, index) => {
            const monthData = yearAttendance[month];
            if (monthData) {
              monthlyTotals[index].totalAttendance += monthData.length;
            }
          });
        }
      });
      setMonthlyData(monthlyTotals);
    } else {
      setMonthlyData([]);
    }
  }, [members, selectedYear]);

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

  const sortedMembers = [...membersWithAttendance].sort(
    (a, b) => b.percentage - a.percentage
  );

  const rankedMembers = sortedMembers.reduce((acc, member, index) => {
    if (index === 0) {
      acc.push({ ...member, rank: 1 });
    } else {
      const prevMember = acc[acc.length - 1];
      const rank =
        member.percentage === prevMember.percentage
          ? prevMember.rank
          : prevMember.rank + 1;
      acc.push({ ...member, rank });
    }
    return acc;
  }, []);

  const displayedMembers = filterZero
    ? rankedMembers.filter((m) => m.presentDays === 0)
    : rankedMembers;

  const allMembersRankOne =
    displayedMembers.length > 0 &&
    displayedMembers.every((member) => member.rank === 1);

  return (
    <>
      <Topbar />
      <div
        className="container pb-24 pt-24 mx-auto p-4 min-h-screen"
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
              className="text-3xl font-extrabold mb-4 text-center"
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
                  className="w-full p-2 border rounded-md "
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
                  className="w-full p-2 border rounded-md "
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
              {selectedYear && (
                <button
                  onClick={() => setShowGraphPopup(true)}
                  className="w-full sm:w-auto p-2 rounded-md transition-colors duration-200 ease-in-out font-semibold text-sm"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.neutralLight,
                    ":hover": { backgroundColor: colors.primaryDark },
                  }}
                >
                  View Graph
                </button>
              )}
            </div>

            {/* Graph Popup */}
            {showGraphPopup && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
                onClick={() => setShowGraphPopup(false)}
              >
                <div
                  className="p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative"
                  style={{ backgroundColor: colors.neutralLight }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
                >
                  <button
                    className="absolute top-2 right-4 text-2xl font-bold"
                    onClick={() => setShowGraphPopup(false)}
                    style={{ color: colors.neutralDark }}
                  >
                    &times;
                  </button>
                  <h3
                    className="text-xl font-bold mb-4 text-center"
                    style={{ color: colors.primary }}
                  >
                    Total Monthly Attendance for {selectedYear}
                  </h3>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 20,
                          right: 10, // Adjusted for mobile
                          left: 10,  // Adjusted for mobile
                          bottom: 5,
                        }}
                        barCategoryGap="15%" // Add gap between bar categories
                      >
                        <CartesianGrid vertical={false} stroke={colors.tertiary} />
                        <defs>
                          <linearGradient
                            id="colorUv"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={colors.primary}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={colors.primaryLight}
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          style={{
                            fill: colors.neutralDark,
                            fontSize: "12px",
                          }}
                          tickFormatter={(tick) => tick.substring(0, 3)}
                          interval="preserveStartEnd" // Optimizes label display
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          style={{
                            fill: colors.neutralDark,
                            fontSize: "12px",
                          }}
                        >
                          <Label
                            value="Total Days Present"
                            angle={-90}
                            position="insideLeft"
                            style={{
                              textAnchor: "middle",
                              fill: colors.neutralDark,
                            }}
                          />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="totalAttendance"
                          fill="url(#colorUv)"
                          barSize={20}
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {selectedYear && selectedMonth && members.length > 0 ? (
              <div
                className="overflow-x-auto rounded-lg shadow-md"
                style={{ backgroundColor: colors.neutralLight }}
              >
                <table
                  className="min-w-full table-auto border-collapse border border-gray-300 shadow-md rounded-lg"
                  style={{ borderColor: colors.primaryLight }}
                >
                  <thead
                    className="sticky top-0 z-50"
                    style={{ backgroundColor: colors.tertiaryLight }}
                  >
                    <tr>
                      <th
                        scope="col"
                        className="p-1.5 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-40 w-12 sm:w-16 border border-gray-300"
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          color: colors.primary,
                        }}
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="p-1.5 text-left text-xs font-bold uppercase tracking-wider border border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          color: colors.primary,
                        }}
                        onDoubleClick={() => {
                          const namesText = displayedMembers
                            .map((m) => `${m.name} ${m.last_name || ""}`.trim())
                            .join(",\n");

                          navigator.clipboard
                            .writeText(namesText)
                            .then(() => {
                              showCopyPopup("Names copied to clipboard!");
                            })
                            .catch((err) =>
                              console.error("Clipboard error:", err)
                            );
                        }}
                      >
                        Name
                      </th>

                      <th
                        scope="col"
                        className="p-1.5 text-left text-xs font-bold uppercase tracking-wider border border-gray-300 w-20"
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          color: colors.primary,
                        }}
                      >
                        Days Present
                      </th>
                      <th
                        scope="col"
                        className="p-1.5 text-left text-xs font-bold uppercase tracking-wider border border-gray-300 w-20 cursor-pointer"
                        onClick={() => setFilterZero((prev) => !prev)}
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          color: colors.primary,
                        }}
                      >
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {displayedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="transition-colors duration-150 ease-in-out"
                        style={{
                          backgroundColor: member.rank === 1 && !allMembersRankOne ? '#FFD700' : colors.neutralLight,
                          color: colors.neutralDark,
                        }}
                      >
                        <td
                          className="p-1.5 whitespace-nowrap text-sm font-medium sticky left-0 z-10 w-12 sm:w-16 border border-gray-300"
                        >
                          <span style={{ color: member.rank === 1 && !allMembersRankOne ? 'black' : colors.neutralDark }}>
                            {member.rank}
                          </span>
                          {!allMembersRankOne && member.rank === 1 && (
                            <FaTrophy
                              className="inline-block text-yellow-700 ml-1"
                              title="Top Performer"
                            />
                          )}
                        </td>
                        <td
                          className="p-1.5 text-sm border border-gray-300 whitespace-normal break-words"
                        >
                          {member.name} {member.last_name}{" "}
                        </td>
                        <td
                          className="p-1.5 whitespace-nowrap text-sm border border-gray-300 w-20"
                        >
                          {member.presentDays}
                        </td>
                        <td
                          className="p-1.5 whitespace-nowrap text-sm border border-gray-300 w-20"
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
                  ? "Please select a year and a month to view individual performance, or a year to view the monthly graph."
                  : "No member data found in local storage. Make sure you have member data available to load."}
              </p>
            )}
          </>
        )}

        {showPopup && (
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-xl text-center z-50 transition-opacity duration-300 ease-in-out"
            style={{
              opacity: showPopup ? 1 : 0,
            }}
          >
            {popupMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default TeamPerformance;