import { useEffect, useState, useMemo } from "react";
import LoadData from "./LoadData";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));
const MAX_DAYS_IN_MONTH = 31;

const Activity = () => {
  const initialYear = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(
    years.includes(initialYear) ? initialYear : "2025"
  );
  const [memberAttendance, setMemberAttendance] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("loggedInMember");
      if (stored) {
        const parsedData = JSON.parse(stored);
        setMemberAttendance(parsedData.attendance || {});
      } else {
        setMemberAttendance({});
      }
    } catch (error) {
      console.error("Error parsing member data from localStorage:", error);
      setMemberAttendance({});
    }
  }, []);

  const currentYearAttendance = useMemo(() => {
    return memberAttendance?.[selectedYear] || {};
  }, [memberAttendance, selectedYear]);

  return (
    <div className="flex flex-col bg-gray-50 font-sans min-h-screen">
      <LoadData className="mb-4" />

      <h2 className="text-3xl font-extrabold text-gray-800 pt-6 mb-4 text-center">
        Your Activity Sheet
      </h2>

      {/* Year Selector */}
      <div className="flex justify-center mb-8 px-6 md:px-10">
        <div className="relative">
          <label htmlFor="year-select" className="sr-only">Select Year</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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
        <div className="bg-white rounded-lg shadow-xl flex flex-col">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-40 w-28 sm:w-36"
                  >
                    Month
                  </th>
                  {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => (
                    <th
                      key={i + 1}
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memberAttendance === null ? (
                  <tr>
                    <td colSpan={MAX_DAYS_IN_MONTH + 1} className="text-center py-8 text-gray-500 text-base">
                      Loading activity data...
                    </td>
                  </tr>
                ) : (
                  months.map((month) => {
                    const monthIndex = months.indexOf(month);
                    const daysInMonth = new Date(Number(selectedYear), monthIndex + 1, 0).getDate();
                    const attendanceForMonth = currentYearAttendance[month] || [];

                    return (
                      <tr key={month} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 w-28 sm:w-36">
                          {month}
                        </td>
                        {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => {
                          const dayNumber = i + 1;
                          const isAttended = attendanceForMonth.includes(dayNumber);
                          const isDayInMonth = dayNumber <= daysInMonth;

                          return (
                            <td
                              key={dayNumber}
                              className={`px-3 py-3 whitespace-nowrap text-center text-sm ${
                                isDayInMonth && isAttended
                                  ? "text-green-600 font-bold"
                                  : "text-gray-400"
                              }`}
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

      {/* Fallback messages */}
      {memberAttendance && Object.keys(memberAttendance).length === 0 && (
        <p className="text-center text-gray-500 mt-6 px-6 md:px-10">
          No activity data found. Please ensure you are logged in correctly.
        </p>
      )}
      {memberAttendance && Object.keys(currentYearAttendance).length === 0 && (
        <p className="text-center text-gray-500 mt-2 px-6 md:px-10">
          No activity recorded for {selectedYear}.
        </p>
      )}
    </div>
  );
};

export default Activity;
