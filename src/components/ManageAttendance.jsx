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
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      month: selectedMonth,
      date: selectedDate,
      year: selectedYear,
      rolls: selectedRolls,
      type: tab === "add" ? "Present" : "Delete"
    };
    alert(`${tab === "add" ? "Attendance Added!" : "Attendance Deleted!"}`);
    console.log("Payload:", payload);
    setSelectedRolls([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सेवा उपस्थिति प्रबंधन
        </h1>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("add")}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "add"
                ? "bg-[#ff9800] text-white font-semibold shadow-lg"
                : "bg-white text-[#8b4513] hover:bg-[#ffecb3]"
            }`}
          >
            Add Attendance
          </button>
          <button
            onClick={() => setTab("delete")}
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
              Select Roll Numbers
            </button>
            {selectedRolls.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {selectedRolls.map((roll) => (
                  <span
                    key={roll}
                    className="bg-[#ffe082] text-[#4e342e] px-4 py-1 rounded-full text-sm shadow"
                  >
                    {roll}
                  </span>
                ))}
              </div>
            )}
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

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md max-h-[80vh] overflow-y-auto shadow-xl border border-orange-200">
            <h3 className="text-2xl font-bold text-center mb-6 text-[#6d4c41]">Select Roll Numbers</h3>
            <div className="grid grid-cols-4 gap-4">
              {rollNumbers.map((roll) => (
                <button
                  key={roll}
                  onClick={() => toggleRoll(roll)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    selectedRolls.includes(roll)
                      ? "bg-[#f59e0b] text-white"
                      : "bg-gray-100 hover:bg-yellow-100"
                  }`}
                >
                  {roll}
                </button>
              ))}
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
    </div>
  );
}

export default ManageAttendance;
