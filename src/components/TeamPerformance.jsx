import React, { useState, useEffect } from "react";
import Loader from "./Loader";
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
import { theme } from "../theme";

const { colors, fonts } = theme;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-xl shadow-lg border border-gray-300"
        style={{
          backgroundColor: colors.neutralLight,
          color: colors.neutralDark,
        }}
      >
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-xs text-gray-600">
          <span
            className="font-semibold text-sm"
            style={{ color: colors.primary }}
          >
            {payload[0].value}
          </span>{" "}
          Days Present
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
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [showZeroPerformance, setShowZeroPerformance] = useState(false);

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
        setIsLoading(true);
        // Simulating a network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const monthlyData = selectedYear
    ? months.map((month) => ({
        month,
        totalAttendance: members.reduce((sum, member) => {
          const monthData = member.attendance?.[selectedYear]?.[month];
          return sum + (monthData ? monthData.length : 0);
        }, 0),
      }))
    : [];

  const getDaysInMonth = (year, month) => {
    const monthIndex = months.indexOf(month);
    return monthIndex !== -1 ? new Date(year, monthIndex + 1, 0).getDate() : 0;
  };

  const calculateAttendance = (member) => {
    const yearAttendance = member.attendance?.[selectedYear];
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
    const prevMember = acc.length > 0 ? acc[acc.length - 1] : null;
    const rank =
      prevMember && member.percentage === prevMember.percentage
        ? prevMember.rank
        : acc.length + 1;
    acc.push({ ...member, rank });
    return acc;
  }, []);

  const filteredMembers = showZeroPerformance
    ? rankedMembers.filter((member) => member.presentDays === 0)
    : rankedMembers;

  const handleCopyNames = async () => {
    const namesToCopy = rankedMembers
      .map((member) => `${member.name} ${member.last_name}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(namesToCopy);
      alert("Names copied to clipboard! ✅");
    } catch (err) {
      console.error("Failed to copy text:", err);
      alert(
        "Failed to copy names. This may be due to browser security settings. Please try again. ❌"
      );
    }
  };

  return (
    <>
      <Topbar />
      <div
        className="container mx-auto p-4 pt-24 pb-24 min-h-screen"
        style={{
          background: colors.background,
          fontFamily: fonts.body,
          color: colors.neutralDark,
        }}
      >
        {isLoading ? (
          <Loader />
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div
              className="p-6 md:p-10 rounded-3xl text-center shadow-lg transform transition-all duration-300 ease-in-out hover:scale-[1.01]"
              style={{
                background: `linear-gradient(135deg,${colors.tertiary},${colors.primary})`,
                color: colors.neutralLight,
              }}
            >
              <h2
                className="text-3xl md:text-5xl font-extrabold mb-2"
                style={{ fontFamily: fonts.heading }}
              >
                Team Performance Leaderboard
              </h2>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: colors.tertiary,
                  backgroundColor: colors.neutralLight,
                  color: colors.neutralDark,
                }}
              >
                <option value="">Select Year</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: colors.tertiary,
                  backgroundColor: colors.neutralLight,
                  color: colors.neutralDark,
                }}
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              {selectedYear && (
                <button
                  onClick={() => setShowGraphPopup(true)}
                  className="px-6 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.neutralLight,
                  }}
                  aria-label="View Graph of Monthly Attendance"
                >
                  📊 View Graph
                </button>
              )}
            </div>
            {showGraphPopup && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={() => setShowGraphPopup(false)}
              >
                <div
                  className="p-6 rounded-2xl shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out scale-95"
                  style={{ backgroundColor: colors.neutralLight }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-3xl font-bold transition hover:text-red-500"
                    onClick={() => setShowGraphPopup(false)}
                    style={{ color: colors.neutralDark }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h3
                    className="text-xl font-bold mb-6 text-center"
                    style={{ color: colors.primary, fontFamily: fonts.heading }}
                  >
                    Total Monthly Attendance for {selectedYear}
                  </h3>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          stroke={colors.tertiary}
                        />
                        <defs>
                          <linearGradient
                            id="colorAttendance"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={colors.primary}
                              stopOpacity={0.9}
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
                            opacity: 0.8,
                          }}
                          tickFormatter={(tick) => tick.substring(0, 3)}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          style={{
                            fill: colors.neutralDark,
                            fontSize: "12px",
                            opacity: 0.8,
                          }}
                        >
                          <Label
                            value="Days Present"
                            angle={-90}
                            position="insideLeft"
                            style={{
                              textAnchor: "middle",
                              fill: colors.neutralDark,
                              opacity: 0.9,
                            }}
                          />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="totalAttendance"
                          fill="url(#colorAttendance)"
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
              <div className="space-y-4">
                <div
                  className="flex items-center p-4 rounded-xl shadow-inner font-semibold text-sm"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.neutralLight,
                  }}
                >
                  <div className="w-1/4">Rank</div>
                  <div
                    className="w-1/2 cursor-pointer"
                    onDoubleClick={handleCopyNames}
                    title="Double-click to copy all names"
                  >
                    Name
                  </div>
                  <div
                    className="w-1/4 text-right cursor-pointer"
                    onClick={() => setShowZeroPerformance((prev) => !prev)}
                    title="Click to toggle members with 0% attendance"
                  >
                    Performance
                  </div>
                </div>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const isTopPerformer = member.rank === 1 && member.percentage > 0;
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-4 rounded-xl shadow-md transition-all duration-300 ease-in-out hover:scale-[1.01]`}
                        style={{
                          background: isTopPerformer
                            ? "linear-gradient(90deg, #FFD700, #FFC700)"
                            : colors.neutralLight,
                          color: isTopPerformer ? "black" : colors.neutralDark,
                        }}
                      >
                        <div className="flex items-center gap-3 w-1/4">
                          <div
                            className="w-10 h-10 flex items-center justify-center rounded-full font-bold"
                            style={{
                              backgroundColor: isTopPerformer
                                ? colors.primaryLight
                                : colors.neutralLight,
                              color: isTopPerformer
                                ? "black"
                                : colors.primary,
                            }}
                          >
                            {member.rank}
                          </div>
                          {isTopPerformer && (
                            <FaTrophy
                              className="inline-block text-yellow-700 text-lg"
                              title="Top Performer"
                            />
                          )}
                        </div>
                        <div className="w-1/2">
                          <p className="font-semibold text-base truncate">
                            {member.name} {member.last_name}
                          </p>
                          <p className="text-xs opacity-75">
                            {member.presentDays} days present
                          </p>
                        </div>
                        <span className="text-lg font-bold w-1/4 text-right">
                          {member.percentage.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="text-center mt-12 p-8 rounded-2xl shadow-lg border border-gray-200"
                    style={{
                      color: colors.neutralDark,
                      backgroundColor: colors.neutralLight,
                    }}
                  >
                    <p
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: fonts.heading }}
                    >
                      No Members with 0% Attendance 🥳
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="text-center mt-12 p-8 rounded-2xl shadow-lg border border-gray-200"
                style={{
                  color: colors.neutralDark,
                  backgroundColor: colors.neutralLight,
                }}
              >
                <p
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: fonts.heading }}
                >
                  No Data to Display 😔
                </p>
                <p className="text-sm opacity-80">
                  {members.length > 0
                    ? "Please select a year and month from the dropdowns above to view the leaderboard."
                    : "No member data found. Please ensure data is loaded into local storage."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TeamPerformance;