import { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

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
const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i
);
const dates = Array.from({ length: 31 }, (_, i) => i + 1);

function ManageAttendance() {
  const today = new Date();
  const [tab, setTab] = useState("add");
  const [selectedMonth, setSelectedMonth] = useState(months[today.getMonth()]);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showPopupRoll, setShowPopupRoll] = useState(false);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState({ message: "", type: "" });

  const API_URL = "https://langar-backend.onrender.com/api";

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      showPopup("Failed to load members.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedRolls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRolls.length === 0) {
      showPopup("Please select at least one roll number.", "error");
      return;
    }

    const payload = {
      Year: selectedYear.toString(),
      Month: selectedMonth,
      Date: selectedDate.toString(),
      RollNumber: selectedRolls,
    };

    const apiUrl =
      tab === "add"
        ? `${API_URL}/attendance/mark-attendance`
        : `${API_URL}/attendance/delete-attendance`;

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showPopup(
          tab === "add"
            ? "Attendance successfully added!"
            : "Attendance successfully deleted!",
          "success"
        );
        setSelectedRolls([]);
      } else {
        const errorData = await response.text();
        showPopup(errorData || "Something went wrong.", "error");
      }
    } catch (error) {
      showPopup("Network error. Please check your connection.", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="text-[#4e342e] font-serif">
      <div className="mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          Manage Attendance
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleTabChange("add")}
            className={`px-8 py-3 rounded-l-full border border-[#d7a76b] text-lg shadow-md ${
              tab === "add"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold scale-105"
                : "bg-white text-[#8b4513] hover:bg-amber-100"
            }`}
          >
            Add Attendance
          </button>
          <button
            onClick={() => handleTabChange("delete")}
            className={`px-8 py-3 rounded-r-full border border-[#d7a76b] text-lg shadow-md ${
              tab === "delete"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold scale-105"
                : "bg-white text-[#8b4513] hover:bg-rose-100"
            }`}
          >
            Delete Attendance
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#fffdf7] rounded-3xl shadow-xl p-8 space-y-6 border border-orange-200"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPopupRoll(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-8 py-3 rounded-xl hover:scale-105 transition shadow-md"
            >
              Select Roll Number(s)
            </button>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-white text-xl font-semibold transition-all duration-300 shadow-lg ${
                tab === "add"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {tab === "add" ? "Submit Attendance" : "Delete Attendance"}
            </button>
          </div>
        </form>
      </div>

      {/* Roll Number Selection Popup */}
      {showPopupRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[95%] max-w-lg overflow-y-auto rounded-3xl border border-orange-200 bg-[#fffdf7] px-4 pb-12 shadow-2xl max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setShowPopupRoll(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 hover:scale-110 transition"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Increase pt-16 to a higher value like pt-24 or pt-32 for more space */}
            <div className="mb-6 grid grid-cols-4 gap-4 pt-24"> {/* Changed from pt-16 to pt-24 */}
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.RollNumber);
                  const isSelected = selectedRolls.includes(roll);

                  return (
                    <button
                      key={member.RollNumber}
                      onClick={() => toggleRoll(roll)}
                      className={`
                  flex items-center justify-center rounded-xl border border-gray-200 p-3 text-lg font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 transform hover:shadow-md
                  ${
                    isSelected
                      ? "scale-105 border-amber-500 bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-lg"
                      : "bg-white text-[#5a2e0e] hover:border-yellow-200 hover:bg-yellow-50"
                  }
                `}
                    >
                      {member.RollNumber}
                    </button>
                  );
                })
              ) : (
                <p className="col-span-full text-center text-lg text-gray-600">
                  No members found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Popup Notification */}
      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default ManageAttendance;
