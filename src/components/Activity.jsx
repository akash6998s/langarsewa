import { useEffect, useState, useMemo } from "react";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from '../theme';
import LoadData from "./LoadData";


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

const currentYear = new Date().getFullYear();
const currentMonth = months[new Date().getMonth()];
// const years = Array.from({ length: 11 }, (_, i) => String(currentYear + i));
const years = [
    "2025", "2026", "2027", "2028", "2029", "2030", 
    "2031", "2032", "2033", "2034", "2035"
];
const MAX_DAYS_IN_MONTH = 31;

const Activity = () => {
  const initialYear = String(currentYear);
  const [selectedYear, setSelectedYear] = useState(
    years.includes(initialYear)
      ? initialYear
      : String(currentYear)
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // New state for selected month
  const [memberAttendance, setMemberAttendance] = useState(null);
  const [memberDonation, setMemberDonation] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");

  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const normalizeMonthName = (monthName) => {
    if (!monthName) return '';
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  };

  useEffect(() => {
    const loadActivityData = async () => {
      setIsLoading(true);
      setPopupMessage(null);

      const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const stored = localStorage.getItem("loggedInMember");
        if (stored) {
          const parsedData = JSON.parse(stored);
          setMemberAttendance(parsedData.attendance || {});
          setMemberDonation(parsedData.donation || {});
        } else {
          setMemberAttendance({});
          setMemberDonation({});
          setPopupMessage("No member data found in local storage. Please ensure you are logged in.");
          setPopupType("error");
        }
      } catch (error) {
        console.error("Error parsing member data from localStorage:", error);
        setMemberAttendance({});
        setMemberDonation({});
        setPopupMessage("Error loading activity data from local storage. Please try logging in again.");
        setPopupType("error");
      } finally {
        await minLoadPromise;
        setIsLoading(false);
      }
    };
    loadActivityData();
  }, []);

  const currentYearAttendance = useMemo(() => {
    return memberAttendance?.[selectedYear] || {};
  }, [memberAttendance, selectedYear]);

  const currentYearDonation = useMemo(() => {
    return memberDonation?.[selectedYear] || {};
  }, [memberDonation, selectedYear]);

  const totalDonationForSelectedYear = useMemo(() => {
    return Object.values(currentYearDonation).reduce(
      (sum, monthDonation) => sum + (monthDonation || 0),
      0
    );
  }, [currentYearDonation]);

  const currentMonthAttendanceStats = useMemo(() => {
    const normalizedSelectedMonth = normalizeMonthName(selectedMonth);

    const monthIndex = months.indexOf(normalizedSelectedMonth);
    const daysInSelectedMonth = new Date(
      Number(selectedYear),
      monthIndex + 1,
      0
    ).getDate();

    const attendanceForSelectedMonth =
      currentYearAttendance[normalizedSelectedMonth] || [];
    const attendedDaysCount = attendanceForSelectedMonth.length;

    const percentage = daysInSelectedMonth === 0 ? 0 : ((attendedDaysCount / daysInSelectedMonth) * 100).toFixed(2);

    return {
      percentage,
      attendedDaysCount,
      totalDays: daysInSelectedMonth,
    };
  }, [currentYearAttendance, selectedYear, selectedMonth]);

  return (

    <>
    <div
      className="flex py-4 flex-col  font-[Inter,sans-serif]"
    >
      <LoadData />
      {isLoading && <Loader />}

      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}


      {!isLoading && (
        <div
          className="rounded-lg mt-4 shadow-md p-6 mx-1 md:mx-10 mb-6 flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4"
          style={{ backgroundColor: theme.colors.neutralLight }}
        >
          <div className="text-center">
            <p
              className="text-lg font-semibold"
              style={{ color: theme.colors.primary }}
            >
              Total Donation ({selectedYear}):
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: theme.colors.success }}
            >
              ₹{totalDonationForSelectedYear}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-lg font-semibold"
              style={{ color: theme.colors.primary }}
            >
              Attendance ({selectedMonth} {selectedYear}):
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: theme.colors.success }}
            >
              {currentMonthAttendanceStats.percentage}%
            </p>
            <p className="text-sm" style={{ color: theme.colors.neutralDark }}>
              {currentMonthAttendanceStats.attendedDaysCount} / {currentMonthAttendanceStats.totalDays} days
            </p>
          </div>
        </div>
      )}

      {/* Year and Month Selectors */}
      <div className="flex flex-col sm:flex-row justify-center mb-8 px-1 md:px-10 gap-4">
        <div className="relative w-full sm:w-1/2">
          <label htmlFor="year-select" className="sr-only">
            Select Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            disabled={isLoading}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
            style={{ color: theme.colors.primary }}
          >
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <div className="relative w-full sm:w-1/2">
          <label htmlFor="month-select" className="sr-only">
            Select Month
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            disabled={isLoading}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
            style={{ color: theme.colors.primary }}
          >
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        className="flex rounded-xl p-1 mb-8 shadow-sm justify-center mx-1 md:mx-10"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "attendance" ? theme.colors.primary : "transparent",
            color:
              activeTab === "attendance"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "attendance" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "attendance") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "attendance") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("donation")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "donation" ? theme.colors.primary : "transparent",
            color:
              activeTab === "donation"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "donation" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "donation") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "donation") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Donation
        </button>
      </div>

      {activeTab === "attendance" && (
        <div className="flex-grow overflow-auto px-1 md:px-10 pb-6">
          <div
            className="rounded-lg shadow-xl flex flex-col"
            style={{ backgroundColor: theme.colors.neutralLight }}
          >
            <div className="overflow-auto">
              <table
                className="min-w-full table-fixed border-collapse border border-gray-300 shadow-md rounded-lg"
                style={{ borderColor: theme.colors.primaryLight }}
              >
                <thead
                  className="sticky top-0 z-50"
                  style={{ backgroundColor: theme.colors.tertiaryLight }}
                >
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-40 w-28 sm:w-36 border border-gray-300 bg-white"
                      style={{
                        backgroundColor: theme.colors.tertiaryLight,
                        color: theme.colors.primary,
                      }}
                    >
                      Month
                    </th>
                    {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => (
                      <th
                        key={i + 1}
                        scope="col"
                        className="px-3 py-3 text-center text-xs font-semibold uppercase border border-gray-300"
                        style={{ color: theme.colors.primary }}
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={MAX_DAYS_IN_MONTH + 1}
                        className="text-center py-8 text-base border border-gray-300"
                        style={{ color: theme.colors.primary }}
                      >
                        Loading activity data...
                      </td>
                    </tr>
                  ) : (
                    months.map((month) => {
                      const monthIndex = months.indexOf(month);
                      const daysInMonth = new Date(
                        Number(selectedYear),
                        monthIndex + 1,
                        0
                      ).getDate();
                      const attendanceForMonth = currentYearAttendance[normalizeMonthName(month)] || [];

                      return (
                        <tr
                          key={month}
                          className="transition-colors duration-150 ease-in-out hover:bg-gray-100"
                        >
                          <td
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium sticky left-0 z-10 w-28 sm:w-36 border border-gray-300 bg-white"
                            style={{ color: theme.colors.neutralDark }}
                          >
                            {month}
                          </td>
                          {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => {
                            const dayNumber = i + 1;
                            const isAttended = attendanceForMonth.includes(dayNumber);
                            const isDayInMonth = dayNumber <= daysInMonth;

                            return (
                              <td
                                key={dayNumber}
                                className={`px-3 py-3 text-center text-sm border border-gray-300 ${
                                  isDayInMonth && isAttended ? "font-bold" : ""
                                }`}
                                style={{
                                  color:
                                    isDayInMonth && isAttended
                                      ? theme.colors.success
                                      : theme.colors.primaryLight,
                                  backgroundColor: isDayInMonth ? "white" : "#f9f9f9",
                                }}
                              >
                                {isDayInMonth && isAttended ? "✔" : ""}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "donation" && (
        <div className="flex-grow overflow-auto px-1 md:px-10 pb-6">
          <div
            className="rounded-lg shadow-xl flex flex-col"
            style={{ backgroundColor: theme.colors.neutralLight }}
          >
            <div className="overflow-auto">
              <table
                className="min-w-full table-fixed border-collapse border border-gray-300 shadow-md rounded-lg"
                style={{ borderColor: theme.colors.primaryLight }}
              >
                <thead
                  className="sticky top-0 z-50"
                  style={{ backgroundColor: theme.colors.tertiaryLight }}
                >
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider sticky left-0 z-40 border border-gray-300 w-1/2"
                      style={{
                        backgroundColor: theme.colors.tertiaryLight,
                        color: theme.colors.primary,
                      }}
                    >
                      Month
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-gray-300 w-1/2"
                      style={{
                        backgroundColor: theme.colors.tertiaryLight,
                        color: theme.colors.primary,
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-8 text-base border border-gray-300"
                        style={{ color: theme.colors.primary }}
                      >
                        Loading donation data...
                      </td>
                    </tr>
                  ) : (
                    months.map((month) => {
                      const donationAmount = currentYearDonation[normalizeMonthName(month)] || 0;
                      return (
                        <tr
                          key={month}
                          className="transition-colors duration-150 ease-in-out hover:bg-gray-100"
                        >
                          <td
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium sticky left-0 z-10 border border-gray-300"
                            style={{ color: theme.colors.neutralDark }}
                          >
                            {month}
                          </td>
                          <td
                            className="px-4 py-3 whitespace-nowrap text-sm border border-gray-300"
                            style={{ color: theme.colors.success }}
                          >
                            ₹{donationAmount}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !popupMessage && (
        <>
          {activeTab === "attendance" &&
            (memberAttendance && Object.keys(currentYearAttendance).length === 0) && (
              <p
                className="text-center mt-2 px-6 md:px-10"
                style={{ color: theme.colors.primary }}
              >
                No attendance recorded for {selectedYear}.
              </p>
            )}
          {activeTab === "donation" &&
            (memberDonation && Object.keys(currentYearDonation).length === 0) && (
              <p
                className="text-center mt-2 px-6 md:px-10"
                style={{ color: theme.colors.primary }}
              >
                No donations recorded for {selectedYear}.
              </p>
            )}
          {memberAttendance && Object.keys(memberAttendance).length === 0 && (
            <p
              className="text-center mt-6 px-6 md:px-10"
              style={{ color: theme.colors.primary }}
            >
              No activity data found. Please ensure you are logged in correctly.
            </p>
          )}
        </>
      )}
    </div>
    </>
    
  );
};

export default Activity;