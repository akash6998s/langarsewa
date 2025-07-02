import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";
import { theme } from "../theme";

const Activity = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [activeTab, setActiveTab] = useState("attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const daysInMonth = (year, monthIndex) =>
    new Date(year, monthIndex + 1, 0).getDate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rollNumber = localStorage.getItem("rollNumber");

        const response = await fetch(
          `https://langar-backend.onrender.com/api/members/${rollNumber}`
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();

        const formattedAttendance = {};
        const attendanceRaw = data.attendance || {};
        Object.keys(attendanceRaw).forEach((year) => {
          formattedAttendance[year] = {};
          Object.keys(attendanceRaw[year]).forEach((month) => {
            formattedAttendance[year][month.toLowerCase()] = attendanceRaw[
              year
            ][month]
              .split(",")
              .map((day) => parseInt(day.trim()))
              .filter((num) => !isNaN(num));
          });
        });

        const formattedDonations = {};
        const donationRaw = data.donations || {};
        Object.keys(donationRaw).forEach((year) => {
          formattedDonations[year] = {};
          Object.keys(donationRaw[year]).forEach((month) => {
            formattedDonations[year][month.toLowerCase()] = parseInt(
              donationRaw[year][month] || 0
            );
          });
        });

        setAttendanceData({ attendance: formattedAttendance });
        setDonationData({ donations_summary: formattedDonations });

        const availableYears = Object.keys(formattedAttendance);
        if (
          availableYears.length > 0 &&
          !availableYears.includes(selectedYear)
        ) {
          setSelectedYear(availableYears[availableYears.length - 1]);
        }

        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateYearlyDonationTotal = () => {
    if (!donationData || !donationData.donations_summary[selectedYear])
      return 0;
    return Object.values(donationData.donations_summary[selectedYear]).reduce(
      (sum, val) => sum + val,
      0
    );
  };

  const getSelectedMonthAttendanceStats = () => {
    if (!attendanceData || !attendanceData.attendance[selectedYear]) {
      return { percent: 0, presentDays: 0, totalDays: 0 };
    }

    const monthName = months[selectedMonth];
    const year = parseInt(selectedYear);
    const totalDays = daysInMonth(year, selectedMonth);

    const presentDaysArray =
      attendanceData.attendance[selectedYear][monthName] || [];

    const percent =
      totalDays > 0
        ? ((presentDaysArray.length / totalDays) * 100).toFixed(2)
        : 0;

    return {
      percent,
      presentDays: presentDaysArray.length,
      totalDays,
    };
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div
        className="flex justify-center items-center min-h-screen px-4"
        style={{ backgroundColor: theme.colors.background }}
      >
        <p
          className="text-lg font-semibold"
          style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
        >
          Error: {error}
        </p>
      </div>
    );
  }

  const yearlyDonation = calculateYearlyDonationTotal();
  const selectedMonthStats = getSelectedMonthAttendanceStats();

  return (
    <div
      className="max-w-7xl mx-auto px-2 mt-8 pb-16 rounded-xl shadow-xl min-h-[calc(100vh-120px)]"
      style={{ fontFamily: theme.fonts.body, color: theme.colors.neutralDark }}
    >
      {/* Header Toggle */}
      <header className="mb-10 text-center select-none">
        <div
          onClick={() => setShowSummary((prev) => !prev)}
          className="inline-flex items-center cursor-pointer"
        >
          <h2
            className="text-4xl font-extrabold tracking-wide mr-3"
            style={{
              color: theme.colors.primary,
              fontFamily: theme.fonts.heading,
            }}
          >
            {showSummary ? "Hide Summary" : "Show Summary"}
          </h2>
          <svg
            className={`w-8 h-8 transform transition-transform duration-300 ${
              showSummary ? "rotate-90" : "rotate-0"
            }`}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </header>

      {/* Summary Cards */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Attendance Summary */}
          <div className="rounded-2xl shadow-lg p-6 border-l-8 border-yellow-500 bg-white text-center">
            <h3 className="text-xl font-semibold text-yellow-600 mb-2">
              Attendance Summary
            </h3>
            <p className="text-5xl font-bold">{selectedMonthStats.percent}%</p>
            <p className="mt-2">
              Present: {selectedMonthStats.presentDays} /{" "}
              {selectedMonthStats.totalDays} days in {months[selectedMonth]}{" "}
              {selectedYear}
            </p>
          </div>

          {/* Donation Summary */}
          <div className="rounded-2xl shadow-lg p-6 border-l-8 border-emerald-500 bg-white text-center">
            <h3 className="text-2xl font-semibold text-emerald-600 mb-2">
              Total Donation
            </h3>
            <p className="text-6xl font-bold text-gray-900">
              ₹{yearlyDonation.toLocaleString()}
            </p>
            <p className="mt-2 text-gray-500">For the year {selectedYear}</p>
          </div>
        </div>
      )}

      {/* Dropdown Filters */}
     <div className="flex gap-4 w-full sm:w-auto mb-6">
  {/* Year Dropdown */}
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
    style={{
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    }}
  >
    {Object.keys(attendanceData?.attendance || {}).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>

  {/* Month Dropdown */}
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(Number(e.target.value))}
    className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
    style={{
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    }}
  >
    {months.map((month, index) => (
      <option key={index} value={index}>
        {month.charAt(0).toUpperCase() + month.slice(1)}
      </option>
    ))}
  </select>
</div>


      {/* Tabs */}
      <div className="flex justify-center mb-6 rounded-lg shadow border border-emerald-500 bg-white max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`w-1/2 py-3 font-semibold rounded-lg transition ${
            activeTab === "attendance" ? "bg-yellow-500 text-white" : ""
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`w-1/2 py-3 font-semibold rounded-lg transition ${
            activeTab === "donations" ? "bg-emerald-500 text-white" : ""
          }`}
        >
          Donations
        </button>
      </div>

      {/* Attendance Table */}
      {activeTab === "attendance" && (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
          <table className="min-w-[900px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left sticky left-0 z-20 bg-yellow-500 text-white border border-gray-300">
                  Month
                </th>
                {[...Array(31)].map((_, i) => {
                  const date = new Date(parseInt(selectedYear), 0, i + 1);
                  const dayName = date.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  return (
                    <th
                      key={i}
                      className="py-2 px-2 text-center text-xs border border-gray-300"
                      title={dayName}
                    >
                      {i + 1}
                      <div className="text-[10px] text-yellow-100">
                        {dayName}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {months.map((monthName, monthIndex) => {
                const yearData = attendanceData.attendance[selectedYear] || {};
                const daysPresent = yearData[monthName] || [];
                const totalDays = daysInMonth(
                  parseInt(selectedYear),
                  monthIndex
                );
                return (
                  <tr
                    key={monthName}
                    className={monthIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 px-4 font-medium capitalize sticky left-0 z-10 bg-white border border-gray-300">
                      {monthName}
                    </td>
                    {[...Array(31)].map((_, dayIndex) => {
                      const day = dayIndex + 1;
                      const isPresent = daysPresent.includes(day);
                      const isInvalid = day > totalDays;
                      return (
                        <td
                          key={dayIndex}
                          className="text-center border border-gray-300"
                          style={{
                            color: isInvalid
                              ? theme.colors.tertiary
                              : isPresent
                              ? "#16a34a"
                              : theme.colors.tertiary,
                          }}
                        >
                          {isInvalid ? (
                            <span className="text-xl">•</span>
                          ) : isPresent ? (
                            <Check className="w-4 h-4 mx-auto" />
                          ) : (
                            ""
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Donations Table */}
      {activeTab === "donations" && (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left border border-gray-300">
                  Month
                </th>
                <th className="py-2 px-4 text-left border border-gray-300">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((monthName, idx) => {
                const donation =
                  donationData.donations_summary[selectedYear] || {};
                const amount = donation[monthName] || 0;
                return (
                  <tr
                    key={monthName}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 px-4 font-medium capitalize border border-gray-300">
                      {monthName}
                    </td>
                    <td className="py-2 px-4 font-semibold text-emerald-600 border border-gray-300">
                      ₹{amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Activity;
