import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";
import { theme } from ".././theme";

const Activity = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState("attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const daysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const rollNumber = localStorage.getItem("rollNumber");

        const attendanceResponse = await fetch(
          `https://langarsewa-db.onrender.com/attendance/${rollNumber}`
        );
        if (!attendanceResponse.ok)
          throw new Error(
            `HTTP error! Attendance status: ${attendanceResponse.status}`
          );
        const attendanceJson = await attendanceResponse.json();
        setAttendanceData(attendanceJson);

        const donationResponse = await fetch(
          `https://langarsewa-db.onrender.com/donations/summary/${rollNumber}`
        );
        if (!donationResponse.ok)
          throw new Error(
            `HTTP error! Donations status: ${donationResponse.status}`
          );
        const donationJson = await donationResponse.json();
        setDonationData(donationJson);

        const availableYears = Object.keys(attendanceJson.attendance);
        if (
          !availableYears.includes(selectedYear) &&
          availableYears.length > 0
        ) {
          setSelectedYear(availableYears[availableYears.length - 1]);
        }
      } catch (e) {
        setError(e.message);
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const calculateYearlyAttendancePercentage = () => {
    if (!attendanceData || !attendanceData.attendance[selectedYear]) return 0;

    let totalPossibleDays = 0;
    let totalPresentDays = 0;

    for (const monthName of months) {
      const monthIndex = months.indexOf(monthName);
      const days = daysInMonth(parseInt(selectedYear), monthIndex);
      totalPossibleDays += days;

      const daysPresent =
        attendanceData.attendance[selectedYear][monthName] || [];
      totalPresentDays += daysPresent.length;
    }

    return totalPossibleDays > 0
      ? ((totalPresentDays / totalPossibleDays) * 100).toFixed(2)
      : 0;
  };

  const calculateYearlyDonationTotal = () => {
    if (!donationData || !donationData.donations_summary[selectedYear])
      return 0;

    const yearDonations = donationData.donations_summary[selectedYear];
    return Object.values(yearDonations).reduce(
      (sum, amount) => sum + amount,
      0
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-red-100 rounded-lg shadow-lg text-red-700 font-sans text-center">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p className="mb-2">{error}</p>
        <p>Please try refreshing the page or check your connection.</p>
      </div>
    );
  }

  const availableYears = Object.keys(attendanceData.attendance);
  const yearlyAttendancePercentage = calculateYearlyAttendancePercentage();
  const yearlyDonationTotal = calculateYearlyDonationTotal();

  return (
    <div
      className="max-w-7xl mx-auto pb-16 pt-8 px-4 bg-[#FEF3C7] rounded-xl shadow-xl font-sans min-h-screen"
      style={{ fontFamily: theme.fonts.body }}
    >
      {/* Header */}
      <header className="mb-10 text-center">
        <h1
          className="text-4xl font-extrabold mb-3"
          style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
        >
          Performance Tracker
        </h1>
        <div className="mt-6 inline-flex items-center space-x-4 justify-center">
          <label
            htmlFor="year-select"
            className="font-semibold text-gray-700 text-lg"
          >
            Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            className="rounded-md border border-[#F59E0B] px-4 py-2 text-gray-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] transition"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Attendance Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-8 border-[#D97706] flex flex-col items-center">
          <h3
            className="text-2xl font-semibold mb-2"
            style={{ color: theme.colors.primary }}
          >
            Presence Percentage
          </h3>
          <p className="text-6xl font-bold text-gray-900">
            {yearlyAttendancePercentage}%
          </p>
          <p className="mt-2 text-gray-500">For the year {selectedYear}</p>
        </div>

        {/* Donations Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-8 border-[#10B981] flex flex-col items-center">
          <h3
            className="text-2xl font-semibold mb-2"
            style={{ color: theme.colors.secondary }}
          >
            Total Donation
          </h3>
          <p className="text-6xl font-bold text-gray-900">
            ₹{yearlyDonationTotal.toLocaleString()}
          </p>
          <p className="mt-2 text-gray-500">For the year {selectedYear}</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="flex justify-center gap-8 mb-8">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-8 py-3 rounded-full font-semibold text-lg shadow-md transition duration-300 ${
            activeTab === "attendance"
              ? "bg-[#D97706] text-white shadow-lg hover:bg-[#bf6d04]"
              : "bg-[#F59E0B] text-[#4b4b4b] hover:bg-[#D97706]"
          }`}
          aria-label="Show presence tab"
        >
          Donation
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-8 py-3 rounded-full font-semibold text-lg shadow-md transition duration-300 ${
            activeTab === "donations"
              ? "bg-[#10B981] text-white shadow-lg hover:bg-[#0e9e70]"
              : "bg-[#34D399] text-[#4b4b4b] hover:bg-[#10B981]"
          }`}
          aria-label="Show donations tab"
        >
          Expense
        </button>
      </section>

      {/* Attendance Table */}
{activeTab === "attendance" && (
  <section>

    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
      <table
        className="min-w-[900px] w-full border-collapse text-sm"
        style={{
          fontFamily: theme.fonts.body,
          color: theme.colors.neutralDark,
          backgroundColor: theme.colors.surface,
        }}
      >
        <thead
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.surface,
            fontFamily: theme.fonts.heading,
          }}
        >
          <tr>
            <th
              className="py-2 px-4 text-left border-r"
              style={{ borderColor: theme.colors.neutralLight }}
            >
              Month
            </th>
            {[...Array(31)].map((_, i) => {
              const date = new Date(
                parseInt(selectedYear),
                0,
                i + 1
              ); // Month irrelevant here, just for weekday
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <th
                  key={i}
                  className="py-2 px-2 text-center border-r text-xs"
                  title={dayName}
                  style={{ borderColor: theme.colors.neutralLight }}
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
          {months.map((monthName, monthIndex) => {
            const yearAttendance =
              attendanceData.attendance[selectedYear] || {};
            const daysPresent = yearAttendance[monthName] || [];
            const totalDaysInMonth = daysInMonth(
              parseInt(selectedYear),
              monthIndex
            );

            return (
              <tr
                key={monthName}
                style={{
                  backgroundColor:
                    monthIndex % 2 === 0
                      ? theme.colors.neutralLight
                      : theme.colors.surface,
                }}
              >
                <td
                  className="py-2 px-4 border-r font-medium text-left capitalize"
                  style={{ borderColor: theme.colors.neutralLight }}
                >
                  {monthName}
                </td>
                {[...Array(31)].map((_, dayIndex) => {
                  const day = dayIndex + 1;
                  const isPresent = daysPresent.includes(day);
                  const isInvalidDay = day > totalDaysInMonth;

                  return (
                    <td
                      key={day}
                      className="text-center border-r"
                      style={{
                        borderColor: theme.colors.neutralLight,
                        color: isInvalidDay
                          ? theme.colors.tertiary
                          : isPresent
                          ? "#16a34a" // Tailwind green-600
                          : theme.colors.tertiary,
                      }}
                      aria-label={
                        isInvalidDay
                          ? "Invalid day"
                          : isPresent
                          ? "Present"
                          : "Absent"
                      }
                    >
                      {isInvalidDay ? (
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
  </section>
)}

{/* Donations Table */}
{activeTab === "donations" && (
  <section>
    <h2
      className="text-3xl font-bold mb-6"
      style={{ color: theme.colors.secondary, fontFamily: theme.fonts.heading }}
    >
      Monthly Offerings
    </h2>
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
      <table
        className="min-w-[900px] w-full border-collapse text-base"
        style={{
          fontFamily: theme.fonts.body,
          color: theme.colors.neutralDark,
          backgroundColor: theme.colors.surface,
        }}
      >
        <thead
          style={{
            backgroundColor: theme.colors.secondary,
            color: theme.colors.surface,
            fontFamily: theme.fonts.heading,
          }}
        >
          <tr>
            <th
              className="py-2 px-4 text-left border-r"
              style={{ borderColor: theme.colors.neutralLight }}
            >
              Moon Cycle
            </th>
            <th
              className="py-2 px-4 text-right border-r"
              style={{ borderColor: theme.colors.neutralLight }}
            >
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((monthName, idx) => {
            const yearDonations =
              donationData.donations_summary[selectedYear] || {};
            const donationAmount = yearDonations[monthName] || 0;

            return (
              <tr
                key={monthName}
                style={{
                  backgroundColor:
                    idx % 2 === 0
                      ? theme.colors.neutralLight
                      : theme.colors.surface,
                }}
              >
                <td
                  className="py-2 px-4 border-r font-medium capitalize"
                  style={{ borderColor: theme.colors.neutralLight }}
                >
                  {monthName}
                </td>
                <td
                  className="py-2 px-4 font-semibold text-right"
                  style={{ borderColor: theme.colors.neutralLight, color: theme.colors.secondary }}
                >
                  ₹{donationAmount.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
)}

    </div>
  );
};

export default Activity;
