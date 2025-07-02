import { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function ManageDonation() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [tab, setTab] = useState("add");
  const [year, setYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [amount, setAmount] = useState("");

  const [showPopupRoll, setShowPopupRoll] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://langar-backend.onrender.com/api";

  // ✅ Fetch Members
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
    if (selectedRolls.includes(roll)) {
      setSelectedRolls([]);
    } else {
      setSelectedRolls([roll]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === "add" && (!amount || isNaN(amount) || Number(amount) <= 0)) {
      showPopup("Please enter a valid donation amount.", "error");
      return;
    }

    if (selectedRolls.length === 0) {
      showPopup("Please select a roll number.", "error");
      return;
    }

    try {
      setLoading(true);

      for (const roll of selectedRolls) {
        const payload = {
          RollNumber: roll,
          Year: String(year),
          Month: selectedMonth,
          Amount: amount
        };

        const apiUrl =
          tab === "add"
            ? `${API_URL}/donations/add`
            : `${API_URL}/donations/delete`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Something went wrong");
        }
      }

      showPopup(
        tab === "add"
          ? "Donations added successfully!"
          : "Donations deleted successfully!",
        "success"
      );

      setSelectedRolls([]);
      setAmount("");
      setShowPopupRoll(false);
    } catch (error) {
      showPopup(error.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className=" bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सेवा दान प्रबंधन
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("add")}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "add"
                ? "bg-[#ff9800] text-white font-semibold shadow-lg"
                : "bg-white text-[#8b4513] hover:bg-[#ffecb3]"
            }`}
          >
            Add Donation
          </button>
          <button
            onClick={() => setTab("delete")}
            className={`px-8 py-3 rounded-r-full border-y border-r border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "delete"
                ? "bg-[#e53935] text-white font-semibold shadow-lg"
                : "bg-white text-[#8b4513] hover:bg-[#ffcdd2]"
            }`}
          >
            Delete Donation
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

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

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Donation Amount"
              required={tab === "add"}
              className="border p-3 rounded-lg bg-[#fffdf7]"
              min="0"
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPopupRoll(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-8 py-3 rounded-xl hover:scale-105 transition shadow-md"
            >
              Select Roll Number
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
              {tab === "add" ? "Submit Donation" : "Delete Donation"}
            </button>
          </div>
        </form>
      </div>

      {/* Roll Number Popup */}
      {showPopupRoll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf7] rounded-3xl p-8 w-[95%] max-w-lg overflow-y-auto shadow-2xl border border-orange-200 max-h-[90vh]">
            <h3 className="text-3xl font-extrabold text-center mb-7 text-[#8b4513]">
              Select Roll Numbers
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.RollNumber);
                  const isSelected = selectedRolls.includes(roll);
                  return (
                    <button
                      key={roll}
                      onClick={() => toggleRoll(roll)}
                      className={`p-3 rounded-lg text-lg font-bold border flex items-center justify-center shadow-sm ${
                        isSelected
                          ? "bg-[#f59e0b] text-white border-[#e67e22] shadow-lg"
                          : "bg-white text-[#5a2e0e] hover:bg-yellow-50 hover:border-yellow-200"
                      }`}
                    >
                      {roll}
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
                className="bg-gradient-to-r from-[#ff9800] to-[#f57c00] text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Message */}
      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default ManageDonation;
