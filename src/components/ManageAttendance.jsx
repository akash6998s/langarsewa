import { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
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

  // ✅ Fetch members
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

  // ✅ Popup helper
  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll)
        ? prev.filter((r) => r !== roll)
        : [...prev, roll]
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
    <div className="bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सेवा उपस्थिति प्रबंधन
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleTabChange("add")}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "add"
                ? "bg-[#ff9800] text-white font-semibold shadow-lg"
                : "bg-white text-[#8b4513] hover:bg-[#ffecb3]"
            }`}
          >
            Add Attendance
          </button>
          <button
            onClick={() => handleTabChange("delete")}
            className={`px-8 py-3 rounded-r-full border-y border-r border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "delete"
                ? "bg-[#e53935] text-white font-semibold shadow-lg"
                : "bg-white text-[#8b4513] hover:bg-[#ffcdd2]"
            }`}
          >
            Delete Attendance
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7]"
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
              className="border p-3 rounded-lg bg-[#fffdf7]"
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
              className="border p-3 rounded-lg bg-[#fffdf7]"
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
              className={`w-full py-4 rounded-xl text-white text-xl font-semibold transition-all duration-300 shadow-lg ${
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf7] rounded-3xl p-8 w-[95%] max-w-lg overflow-y-auto shadow-2xl border border-orange-200 max-h-[90vh]">
            <h3 className="text-3xl font-extrabold text-center mb-7 text-[#8b4513] tracking-wide">
              Select Roll Numbers
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.RollNumber);
                  const isSelected = selectedRolls.includes(roll);
                  return (
                    <button
                      key={member.RollNumber}
                      onClick={() => toggleRoll(roll)}
                      className={`p-3 rounded-lg text-lg font-bold transition-all duration-200 border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5
                        ${
                          isSelected
                            ? "bg-[#f59e0b] text-white border-[#e67e22] shadow-lg"
                            : "bg-white text-[#5a2e0e] hover:bg-yellow-50 hover:border-yellow-200"
                        }
                      `}
                    >
                      {member.RollNumber}
                    </button>
                  );
                })
              ) : (
                <p className="col-span-full text-center text-gray-600 text-lg">
                  No members found.
                </p>
              )}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPopupRoll(false)}
                className="bg-gradient-to-r from-[#ff9800] to-[#f57c00] text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-[#f57c00] hover:to-[#ef6c00] shadow-xl transition transform hover:scale-105"
              >
                Done
              </button>
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
