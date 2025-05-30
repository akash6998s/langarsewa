import { useState } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const dates = Array.from({ length: 31 }, (_, i) => i + 1);
const rollNumbers = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

function ManageAttendance() {
  const today = new Date();
  const [tab, setTab] = useState("add");
  const [selectedMonth, setSelectedMonth] = useState(months[today.getMonth()]);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedRolls, setSelectedRolls] = useState([]); // multiple selections
  const [showPopup, setShowPopup] = useState(false);

  // message: { text: string, type: "success" | "error" } | null
  const [message, setMessage] = useState(null);

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

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
  };

  const closeMessagePopup = () => {
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRolls.length === 0) {
      showMessage("Please select at least one roll number.", "error");
      return;
    }

    const payload = {
      year: selectedYear.toString(),
      month: selectedMonth.toLowerCase(),
      date: Number(selectedDate),
      roll_numbers: selectedRolls,
    };

    const apiUrl =
      tab === "add"
        ? "https://langarsewa-db.onrender.com/attendance/update"
        : "https://langarsewa-db.onrender.com/attendance/delete";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showMessage(
          tab === "add"
            ? "Attendance successfully added!"
            : "Attendance successfully deleted!",
          "success"
        );
        setSelectedRolls([]);
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || "Something went wrong.", "error");
      }
    } catch (error) {
      showMessage("Network error. Please check your connection.", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif relative">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सेवा उपस्थिति प्रबंधन
        </h1>

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

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPopup(true)}
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

      {/* Popup Roll Selector */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md  overflow-y-auto shadow-xl border border-orange-200">
            <h3 className="text-2xl font-bold text-center mb-6 text-[#6d4c41]">
              Select Roll Number(s)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {rollNumbers.map((roll) => {
                const isSelected = selectedRolls.includes(roll);
                return (
                  <button
                    key={roll}
                    onClick={() => toggleRoll(roll)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      isSelected
                        ? "bg-[#f59e0b] text-white"
                        : "bg-gray-100 hover:bg-yellow-100"
                    }`}
                  >
                    {roll}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-[#a16207] text-white px-6 py-2 rounded-lg hover:bg-[#854d0e] shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Popup Modal */}
      {message && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div
            className={`max-w-sm w-full p-6 rounded-xl shadow-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-900 border border-green-400"
                : "bg-red-100 text-red-900 border border-red-400"
            }`}
          >
            <p className="text-lg font-semibold mb-4">{message.text}</p>
            <button
              onClick={closeMessagePopup}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                message.type === "success"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAttendance;
