import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Check } from "lucide-react";

const Activity = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState("attendance"); // 'attendance' or 'donations'
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
        setError(null); // Clear previous errors
        const rollNumber = localStorage.getItem("rollNumber");

        // Fetch Attendance Data
        const attendanceResponse = await fetch(
          `https://langarsewa-db.onrender.com/attendance/${rollNumber}`
        );
        if (!attendanceResponse.ok)
          throw new Error(
            `HTTP error! Attendance status: ${attendanceResponse.status}`
          );
        const attendanceJson = await attendanceResponse.json();
        setAttendanceData(attendanceJson);

        // Fetch Donation Data
        const donationResponse = await fetch(
          `https://langarsewa-db.onrender.com/donations/summary/${rollNumber}`
        );
        if (!donationResponse.ok)
          throw new Error(
            `HTTP error! Donations status: ${donationResponse.status}`
          );
        const donationJson = await donationResponse.json();
        setDonationData(donationJson);

        // Set selected year to the latest available year if current year has no data
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

  // --- Loading State ---
  if (loading) {
    return <Loader />;
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 p-4 font-sans">
        <div className="flex flex-col items-center p-10 bg-white rounded-3xl shadow-2xl border border-red-100">
          <svg
            className="w-24 h-24 text-red-500 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-3xl font-serif font-bold text-red-700 mb-4">
            A Moment of Disconnect
          </p>
          <p className="text-lg text-gray-600 text-center leading-relaxed">
            The path to data is currently obscured.
            <br />
            Error: {error}. Please attempt to refresh the connection.
          </p>
        </div>
      </div>
    );
  }

  const availableYears = Object.keys(attendanceData.attendance);
  const yearlyAttendancePercentage = calculateYearlyAttendancePercentage();
  const yearlyDonationTotal = calculateYearlyDonationTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start font-sans">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl border border-purple-100">
        {/* --- Dashboard Header --- */}
        <div className="p-8 border-b border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-purple-600 text-white">
          <h1 className="text-4xl font-extrabold font-serif tracking-tight text-white sm:text-5xl">
            Performance Tracker
          </h1>
          <div className="flex items-center gap-4">
            <label
              htmlFor="year-select"
              className="text-lg font-medium text-purple-100"
            >
              Year:
            </label>
            <div className="relative">
              <select
                id="year-select"
                value={selectedYear}
                onChange={handleYearChange}
                className="block appearance-none w-36 bg-purple-700 border border-purple-500 text-white py-3 pl-5 pr-10 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition duration-300 cursor-pointer text-lg"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-200">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --- Summary Cards --- */}
        <div className="p-8 bg-purple-50 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-purple-100">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105 border border-purple-100">
            <div className="text-purple-600 mb-3">
              {/* Icon for Devotional Presence */}
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h-5m-2 2L3 18m16 0l2 2m-2-2a5 5 0 00-5-5H7a5 5 0 00-5 5m7-12a3 3 0 11-6 0 3 3 0 016 0zm7 0a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Devotional Presence
            </h3>
            <p
              className={`text-5xl font-bold ${
                yearlyAttendancePercentage >= 75
                  ? "text-green-600"
                  : yearlyAttendancePercentage >= 50
                  ? "text-orange-500"
                  : "text-red-500"
              }`}
            >
              {yearlyAttendancePercentage}%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105 border border-purple-100">
            <div className="text-amber-600 mb-3">
              {/* Icon for Offerings Total */}
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12m-10.408 0H3c.512-.598 1.482-1 2.592-1m0 0a3 3 0 100 6m-9-4h.01"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Total Offerings
            </h3>
            <p className="text-5xl font-bold text-amber-600">
              ₹{yearlyDonationTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* --- Tab Navigation --- */}
        <div className="flex justify-center border-b border-purple-200 bg-white p-3">
          <button
            className={`px-8 py-3 text-lg font-medium rounded-t-xl transition-all duration-300 ease-in-out shadow-md
              ${
                activeTab === "attendance"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white transform scale-105 -translate-y-1"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            onClick={() => setActiveTab("attendance")}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h-5m-2 2L3 18m16 0l2 2m-2-2a5 5 0 00-5-5H7a5 5 0 00-5 5m7-12a3 3 0 11-6 0 3 3 0 016 0zm7 0a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Presence
            </span>
          </button>
          <button
            className={`px-8 py-3 text-lg font-medium rounded-t-xl transition-all duration-300 ease-in-out shadow-md
              ${
                activeTab === "donations"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white transform scale-105 -translate-y-1"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            onClick={() => setActiveTab("donations")}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12m-10.408 0H3c.512-.598 1.482-1 2.592-1m0 0a3 3 0 100 6m-9-4h.01"
                ></path>
              </svg>
              Offerings
            </span>
          </button>
        </div>

        {/* --- Tab Content: Attendance --- */}
        {activeTab === "attendance" && (
          <div className="p-8 bg-white">
            <h2 className="sr-only">Monthly Presence Tracker</h2>
            <div className="overflow-x-auto border border-purple-200 rounded-lg shadow-inner">
              <table className="min-w-full divide-y divide-purple-100">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="sticky left-0 bg-purple-50 px-5 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider min-w-[140px] shadow-sm z-10">
                      Moon Cycle
                    </th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th
                        key={i}
                        className="px-3 py-4 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider border-l border-purple-100"
                      >
                        Day {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
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
                        className="hover:bg-purple-50 transition-colors duration-200 ease-in-out"
                      >
                        <td className="sticky left-0 bg-white px-5 py-4 whitespace-nowrap text-base font-medium text-gray-900 capitalize shadow-sm z-10">
                          {monthName}
                        </td>
                        {Array.from({ length: 31 }, (_, dayIndex) => {
                          const day = dayIndex + 1;
                          const isPresent = daysPresent.includes(day);
                          const isInvalidDay = day > totalDaysInMonth;

                          let cellClasses =
                            "px-3 py-4 text-center text-base border-l border-purple-100";

                          if (isInvalidDay) {
                            cellClasses += " bg-gray-100 text-gray-300";
                          } else if (isPresent) {
                            cellClasses += " bg-green-50 text-green-700"; // Success color
                          } else {
                            cellClasses += " bg-rose-50 text-rose-500"; // Absence color
                          }

                          return (
                            <td key={day} className={cellClasses}>
                              {isInvalidDay ? (
                                <span className="text-gray-200">⋅</span>
                              ) : isPresent ? (
                                <Check
                                  className="text-green-600 w-5 h-5 font-bold"
                                  aria-label="Present"
                                />
                              ) : (
                                "-"
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
          </div>
        )}

        {/* --- Tab Content: Donations --- */}
        {activeTab === "donations" && (
          <div className="p-8 bg-white">
            <h2 className="sr-only">Monthly Offerings Summary</h2>
            <div className="overflow-x-auto border border-purple-200 rounded-lg shadow-inner">
              <table className="min-w-full divide-y divide-purple-100">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Moon Cycle
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
                  {months.map((monthName) => {
                    const yearDonations =
                      donationData.donations_summary[selectedYear] || {};
                    const donationAmount = yearDonations[monthName] || 0;

                    return (
                      <tr
                        key={monthName}
                        className="hover:bg-purple-50 transition-colors duration-200 ease-in-out"
                      >
                        <td className="px-5 py-4 whitespace-nowrap text-base font-medium text-gray-900 capitalize">
                          {monthName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-base text-right font-medium">
                          <span
                            className={`${
                              donationAmount > 0
                                ? "text-amber-600 font-bold"
                                : "text-gray-400"
                            }`}
                          >
                            ₹{donationAmount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
