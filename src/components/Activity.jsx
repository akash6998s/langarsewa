import { useEffect, useState, useMemo } from "react";
import Loader from "./Loader"; // Import your Loader component
import CustomPopup from "./Popup"; // Import your CustomPopup component
import { theme } from '../theme'; // Import the theme
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
const currentMonth = months[new Date().getMonth()]; // e.g., "July"
const years = Array.from({ length: 11 }, (_, i) => String(currentYear + i)); // From current year to current year + 10
const MAX_DAYS_IN_MONTH = 31;

const Activity = () => {
  const initialYear = String(currentYear);
  const [selectedYear, setSelectedYear] = useState(
    years.includes(initialYear)
      ? initialYear
      : String(currentYear) // Fallback to currentYear if not in list
  );
  const [memberAttendance, setMemberAttendance] = useState(null);
  const [memberDonation, setMemberDonation] = useState(null);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  // Utility to normalize month names (e.g., "july" to "July")
  const normalizeMonthName = (monthName) => {
    if (!monthName) return '';
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  };

  useEffect(() => {
    const loadActivityData = async () => { // Made async to use await
      setIsLoading(true); // Start loading
      setPopupMessage(null); // Clear any previous messages

      const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

      try {
        const stored = localStorage.getItem("loggedInMember");
        if (stored) {
          const parsedData = JSON.parse(stored);
          // Assuming attendance and donation are directly under the parsed member object
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
        // Ensure the loader stays for at least 4 seconds
        await minLoadPromise;
        setIsLoading(false); // End loading
      }
    };
    loadActivityData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Memoized attendance data for the selected year
  const currentYearAttendance = useMemo(() => {
    // Access attendance data for the selected year.
    // Ensure `selectedYear` is used as a string key to match the object structure.
    return memberAttendance?.[selectedYear] || {};
  }, [memberAttendance, selectedYear]);

  // Memoized donation data for the selected year
  const currentYearDonation = useMemo(() => {
    // Access donation data for the selected year.
    // Ensure `selectedYear` is used as a string key to match the object structure.
    return memberDonation?.[selectedYear] || {};
  }, [memberDonation, selectedYear]);

  // Calculate total donation for the selected year
  const totalDonationForSelectedYear = useMemo(() => {
    // Sum up all donation values for months within the current year's donation object
    return Object.values(currentYearDonation).reduce(
      (sum, monthDonation) => sum + (monthDonation || 0),
      0
    );
  }, [currentYearDonation]);

  // Calculate attendance percentage for the current month of the selected year
  const currentMonthAttendancePercentage = useMemo(() => {
    // Normalize currentMonth to match the casing in the attendance object (e.g., "July" vs "july")
    const normalizedCurrentMonth = normalizeMonthName(currentMonth);

    const monthIndex = months.indexOf(normalizedCurrentMonth);
    // Calculate total days in the current month of the selected year
    const daysInCurrentMonth = new Date(
      Number(selectedYear),
      monthIndex + 1, // Month index is 0-based, so add 1 for Date constructor
      0 // Day 0 of the next month gives the last day of the current month
    ).getDate();

    // Get attendance array for the current month from the current year's attendance data
    const attendanceForCurrentMonth =
      currentYearAttendance[normalizedCurrentMonth] || [];
    const attendedDaysCount = attendanceForCurrentMonth.length;

    if (daysInCurrentMonth === 0) {
      return 0; // Avoid division by zero if month has no days (shouldn't happen for valid dates)
    }

    return ((attendedDaysCount / daysInCurrentMonth) * 100).toFixed(2);
  }, [currentYearAttendance, selectedYear, currentMonth]); // Dependencies for this calculation

  return (
    <div
      className="flex py-2 flex-col font-[Inter,sans-serif]"
      style={{ background: theme.colors.background }}
    >
      <LoadData/>
      {/* Loader Component */}
      {isLoading && <Loader />}

      {/* Custom Popup Component */}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)} // Allow user to dismiss popup
        />
      )}

      {/* Page Title with themed heading font and color */}
      <h2
        className="text-3xl font-extrabold pt-6 mb-4 text-center font-[EB_Garamond,serif]"
        style={{ color: theme.colors.neutralDark }}
      >
        Your Activity Sheet
      </h2>

      {/* Summary Section */}
      {!isLoading && (
        <div
          className="rounded-lg shadow-md p-6 mx-6 md:mx-10 mb-6 flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4"
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
              Attendance ({currentMonth} {selectedYear}):
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: theme.colors.success }}
            >
              {currentMonthAttendancePercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Year Selector */}
      <div className="flex justify-center mb-8 px-6 md:px-10">
        <div className="relative w-full">
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
            disabled={isLoading} // Disable selector while loading
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
      </div>

      {/* Attendance Table */}
      <div className="flex-grow overflow-auto px-6 md:px-10 pb-6">
        <div
          className="rounded-lg shadow-xl flex flex-col"
          style={{ backgroundColor: theme.colors.neutralLight }}
        >
          <div className="overflow-auto">
            <table
              className="min-w-full table-fixed border-collapse border border-gray-300 shadow-md rounded-lg"
              style={{ borderColor: theme.colors.primaryLight }}
            >
              {/* Table Header */}
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

              {/* Table Body */}
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
                    // Normalize month name for lookup in currentYearAttendance
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

      {/* Fallback messages - only show if not loading and no active popup message */}
      {!isLoading && !popupMessage && (
        <>
          {memberAttendance && Object.keys(memberAttendance).length === 0 && (
            <p
              className="text-center mt-6 px-6 md:px-10"
              style={{ color: theme.colors.primary }}
            >
              No activity data found. Please ensure you are logged in correctly.
            </p>
          )}
          {memberAttendance && Object.keys(currentYearAttendance).length === 0 && (
            <p
              className="text-center mt-2 px-6 md:px-10"
              style={{ color: theme.colors.primary }}
            >
              No activity recorded for {selectedYear}.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Activity;
