import { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";

const Attendance = () => {
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("July");
  const [members, setMembers] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));

  useEffect(() => {
    const monthIndex = months.findIndex(
      (m) => m.toLowerCase() === month.toLowerCase()
    );
    const days = new Date(Number(year), monthIndex + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [year, month]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const membersCollectionRef = collection(db, "members");
      const memberSnapshot = await getDocs(membersCollectionRef);
      const fetchedMembers = memberSnapshot.docs.map((doc) => ({
        id: doc.id,
        roll_no: doc.data().roll_no,
        name: doc.data().name || "Unnamed",
        last_name: doc.data().last_name || "",
        attendance: [],
      }));

      const membersWithAttendance = await Promise.all(
        fetchedMembers.map(async (member) => {
          const memberDocRef = collection(db, "members");
          const q = query(memberDocRef, where("roll_no", "==", member.roll_no));
          const memberDataSnapshot = await getDocs(q);

          let currentMonthAttendance = [];
          if (!memberDataSnapshot.empty) {
            const memberDoc = memberDataSnapshot.docs[0].data();
            currentMonthAttendance =
              memberDoc.attendance?.[year]?.[month] || [];
          }

          return {
            ...member,
            attendance: currentMonthAttendance,
          };
        })
      );
      setMembers(membersWithAttendance);
    } catch (error) {
      console.error("Error fetching members or attendance: ", error);
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Attendance Sheet
      </h2>

      {/* Year & Month Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            disabled={loading}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
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

        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
            disabled={loading}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
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

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center text-blue-600 text-lg font-medium mb-4 p-4 bg-blue-100 rounded-lg shadow-sm">
          Loading attendance data...
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 text-lg font-medium mb-4 p-4 bg-red-100 rounded-lg shadow-sm">
          Error: {error}
        </div>
      )}

      {/* Attendance Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden"> {/* Changed this container for proper fixed header */}
          <div className="overflow-x-auto"> {/* This div handles horizontal scrolling for the entire table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {/* The sticky left-0 and z-index are crucial for the first column's header */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-40 w-28 sm:w-36">
                    Roll No & Name
                  </th>
                  {daysInMonth.map((day) => (
                    <th
                      key={day}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* This div handles vertical scrolling for the table body */}
          <div className="overflow-y-auto max-h-[calc(100vh-280px)]"> {/* Fixed height and vertical scroll */}
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={daysInMonth.length + 1}
                      className="text-center py-8 text-gray-500 text-base"
                    >
                      No members found or attendance data for the selected period.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.roll_no} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                      <td className="px-4 py-3 align-top sticky left-0 bg-white z-10 shadow-sm w-28 sm:w-36">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          <div className="font-bold text-base">{member.roll_no}</div>
                          <div className="text-gray-600 text-sm break-words">
                            {member.name} {member.last_name}
                          </div>
                        </div>
                      </td>
                      {daysInMonth.map((day) => (
                        <td
                          key={day}
                          className={`px-3 py-3 whitespace-nowrap text-center text-sm font-medium ${
                            member.attendance.includes(day)
                              ? "text-green-600"
                              : "text-gray-300"
                          }`}
                        >
                          {member.attendance.includes(day) ? "✔" : ""}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;