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
        setError(null);
        const rollNumber = localStorage.getItem("rollNumber");

        const attendanceResponse = await fetch(
          `https://langarsewa-db.onrender.com/attendance/${rollNumber}`
        );
        if (!attendanceResponse.ok)
          throw new Error(`Attendance error: ${attendanceResponse.status}`);
        const attendanceJson = await attendanceResponse.json();
        setAttendanceData(attendanceJson);

        const donationResponse = await fetch(
          `https://langarsewa-db.onrender.com/donations/summary/${rollNumber}`
        );
        if (!donationResponse.ok)
          throw new Error(`Donations error: ${donationResponse.status}`);
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

  const handleYearChange = (e) => setSelectedYear(e.target.value);

  const calculateYearlyDonationTotal = () => {
    if (!donationData || !donationData.donations_summary[selectedYear])
      return 0;

    return Object.values(donationData.donations_summary[selectedYear]).reduce(
      (sum, val) => sum + val,
      0
    );
  };

  const getCurrentMonthAttendanceStats = () => {
    if (!attendanceData || !attendanceData.attendance[selectedYear]) {
      return { percent: 0, presentDays: 0, currentDay: 0 };
    }

    const today = new Date();
    const currentMonthIndex = today.getMonth(); // 0-based month index
    const currentDay = today.getDate(); // day number
    const monthName = months[currentMonthIndex];

    const presentDaysArray =
      attendanceData.attendance[selectedYear][monthName] || [];

    const presentTillToday = presentDaysArray.filter((day) => day <= currentDay)
      .length;

    const percent =
      currentDay > 0
        ? ((presentTillToday / currentDay) * 100).toFixed(2)
        : 0;

    return {
      percent,
      presentDays: presentTillToday,
      currentDay,
    };
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div
        className="max-w-md mx-auto mt-20 p-8 rounded-lg shadow-lg text-center"
        style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          fontFamily: theme.fonts.body,
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p className="mb-2">{error}</p>
        <p>Please try refreshing the page or check your connection.</p>
      </div>
    );
  }

  const availableYears = Object.keys(attendanceData.attendance);
  const yearlyDonation = calculateYearlyDonationTotal();
  const currentMonthStats = getCurrentMonthAttendanceStats();

  return (
    <div
      className="max-w-7xl mx-auto  px-2 mt-8 rounded-xl shadow-xl min-h-screen"
      style={{
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      {/* Header and Toggle */}
      <header className="mb-10 text-center select-none">
        <div
          onClick={() => setShowSummary((prev) => !prev)}
          className="inline-flex items-center cursor-pointer"
          aria-expanded={showSummary}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setShowSummary((prev) => !prev);
          }}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </header>

      {/* Summary Cards */}
      {showSummary && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Presence This Month */}
          <div
            className="rounded-2xl shadow-lg p-8 border-l-8 flex flex-col items-center"
            style={{ backgroundColor: "#fff", borderColor: "#D97706" }}
          >
            <h3
              className="text-2xl font-semibold mb-2"
              style={{ color: theme.colors.primary }}
            >
              Presence Percentage
            </h3>
            <p className="text-6xl font-bold text-gray-900">{currentMonthStats.percent}%</p>
            <p className="mt-2 text-gray-600 text-lg">
              {`Present: ${currentMonthStats.presentDays} days`}
            </p>
            <p className="mt-1 text-gray-500">
              For {months[new Date().getMonth()]} {selectedYear}
            </p>
          </div>

          {/* Total Donation */}
          <div
            className="rounded-2xl shadow-lg p-8 border-l-8 flex flex-col items-center"
            style={{ backgroundColor: "#fff", borderColor: "#10B981" }}
          >
            <h3
              className="text-2xl font-semibold mb-2"
              style={{ color: theme.colors.secondary }}
            >
              Total Donation
            </h3>
            <p className="text-6xl font-bold text-gray-900">
              ₹{yearlyDonation.toLocaleString()}
            </p>
            <p className="mt-2 text-gray-500">For the year {selectedYear}</p>
          </div>
        </section>
      )}

      {/* Year Dropdown (hidden) */}
      <div className="mb-8 hidden justify-center">
        <div
          className="flex w-full items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl shadow-lg border max-w-xl"
          style={{ borderColor: "#FCD34D" }}
        >
          <label
            htmlFor="year-select"
            className="text-lg font-semibold tracking-wide"
            style={{
              fontFamily: theme.fonts.heading,
              color: theme.colors.primary,
            }}
          >
            Select Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            className="px-5 py-2.5 rounded-xl bg-[#FFF7ED] border text-gray-800 font-medium shadow-inner focus:outline-none focus:ring-2 transition duration-200"
            style={{ borderColor: "#F59E0B", focusRingColor: "#D97706" }}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <section
        className="flex justify-center mb-8 rounded-lg shadow-sm border max-w-md mx-auto"
        style={{ borderColor: theme.colors.secondary, backgroundColor: "#fff" }}
      >
        <button
          onClick={() => setActiveTab("attendance")}
          className="w-1/2 py-3 font-semibold rounded-lg transition-colors duration-300 text-center"
          style={{
            backgroundColor:
              activeTab === "attendance" ? theme.colors.primary : "transparent",
            color:
              activeTab === "attendance"
                ? theme.colors.surface
                : theme.colors.neutralDark,
          }}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className="w-1/2 py-3 font-semibold rounded-lg transition-colors duration-300 text-center"
          style={{
            backgroundColor:
              activeTab === "donations"
                ? theme.colors.secondary
                : "transparent",
            color:
              activeTab === "donations"
                ? theme.colors.surface
                : theme.colors.neutralDark,
          }}
        >
          Donations
        </button>
      </section>

      {/* Attendance Table */}
      {activeTab === "attendance" && (
        <section>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.surface,
                  fontFamily: theme.fonts.heading,
                }}
              >
                <tr>
                  <th
                    className="py-2 px-4 text-left sticky left-0 z-20 bg-yellow-500 text-white"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
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
                        className="py-2 px-2 text-center text-xs"
                        title={dayName}
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
                  const yearData = attendanceData.attendance[selectedYear] || {};
                  const daysPresent = yearData[monthName] || [];
                  const totalDays = daysInMonth(parseInt(selectedYear), monthIndex);
                  return (
                    <tr
                      key={monthName}
                      className={monthIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td
                        className="py-2 px-4 font-medium capitalize sticky left-0 z-10 bg-white"
                        style={{ fontFamily: theme.fonts.body }}
                      >
                        {monthName}
                      </td>

                      {[...Array(31)].map((_, dayIndex) => {
                        const day = dayIndex + 1;
                        const isPresent = daysPresent.includes(day);
                        const isInvalid = day > totalDays;
                        return (
                          <td
                            key={dayIndex}
                            className="text-center"
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
        </section>
      )}

      {/* Donations Table */}
      {activeTab === "donations" && (
        <section>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white">
            <table className="w-full border-collapse text-base">
              <thead
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors.surface,
                  fontFamily: theme.fonts.heading,
                }}
              >
                <tr>
                  <th className="py-2 px-4 text-left">Month</th>
                  <th className="py-2 px-4 text-left">Amount</th>
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
                      <td
                        className="py-2 px-4 font-medium capitalize"
                        style={{ fontFamily: theme.fonts.body }}
                      >
                        {monthName}
                      </td>
                      <td className="py-2 px-4 font-semibold text-left text-emerald-600">
                        ₹{amount.toLocaleString()}
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
