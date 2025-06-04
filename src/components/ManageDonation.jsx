import { useEffect, useState } from "react";

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

function ManageDonation() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [tab, setTab] = useState("add");
  const [year, setYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [amount, setAmount] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState(null); // {type: 'success'|'error', text: string}

  const [members, setMembers] = useState([]);

  // Fetch members on component mount
  useEffect(() => {
    fetch("https://langarsewa-db.onrender.com/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => {
        console.error("Error fetching members:", err);
        showMessage("Failed to load members.", "error");
      });
  }, []);

  // Single-select toggle for roll numbers:
  const toggleRoll = (roll) => {
    if (selectedRolls.includes(roll)) {
      setSelectedRolls([]);
    } else {
      setSelectedRolls([roll]);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
  };

  const closeMessagePopup = () => {
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === "add" && (!amount || isNaN(amount) || Number(amount) <= 0)) {
      setMessage({
        type: "error",
        text: "Please enter a valid donation amount.",
      });
      return;
    }

    if (selectedRolls.length === 0) {
      setMessage({ type: "error", text: "Please select a roll number." });
      return;
    }

    try {
      for (const roll of selectedRolls) {
        const payload = {
          roll_no: roll,
          year: String(year),
          month: selectedMonth.toLowerCase(),
          amount: Number(amount),
        };

        let response, data;
        if (tab === "add") {
          response = await fetch("https://langarsewa-db.onrender.com/donations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.message || `Failed to add donation for roll ${roll}`
            );
          }
        } else {
          response = await fetch(
            "https://langarsewa-db.onrender.com/donations/deduct-donation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.message || `Failed to delete donation for roll ${roll}`
            );
          }
        }
      }

      setMessage({
        type: "success",
        text:
          tab === "add"
            ? "Donations added successfully!"
            : "Donations deleted successfully!",
      });
      setSelectedRolls([]);
      setAmount("");
      setShowPopup(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सेवा दान प्रबंधन
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

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              min="0"
              step="0.01"
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPopup(true)}
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

      {/* Popup Roll Selector */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf7] rounded-3xl p-8 w-[95%] max-w-lg overflow-y-auto shadow-2xl border border-orange-200 max-h-[90vh] transform scale-95 animate-scaleIn">
            <h3 className="text-3xl font-extrabold text-center mb-7 text-[#8b4513] tracking-wide">
              Select Roll Numbers
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {" "}
              {/* Adjusted grid for more columns */}
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.roll_no);
                  const isSelected = selectedRolls.includes(roll);
                  return (
                    <button
                      key={member.roll_no}
                      onClick={() => toggleRoll(roll)}
                      className={`p-3 rounded-lg text-lg font-bold transition-all duration-200 border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5
                        ${
                          isSelected
                            ? "bg-[#f59e0b] text-white border-[#e67e22] shadow-lg"
                            : "bg-white text-[#5a2e0e] hover:bg-yellow-50 hover:border-yellow-200"
                        }
                      `}
                    >
                      {member.roll_no}
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
                onClick={() => setShowPopup(false)}
                className="bg-gradient-to-r from-[#ff9800] to-[#f57c00] text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-[#f57c00] hover:to-[#ef6c00] shadow-xl transition transform hover:scale-105"
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

export default ManageDonation;
