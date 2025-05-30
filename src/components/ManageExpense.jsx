import { useState, useEffect } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function ManageExpense() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [tab, setTab] = useState("add");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  // New state for message popup
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

  // Fetch expenses from backend when the tab is "delete" or when year/month changes
  useEffect(() => {
    if (tab === "delete") {
      fetchExpenses();
    }
  }, [tab, year, month]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("https://langarsewa-db.onrender.com/expenses");
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setMessage({ type: "error", text: "Error fetching expenses." });
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setMessage({ type: "error", text: "Please enter a description." });
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." });
      return;
    }

    const payload = {
      year,
      month: months.indexOf(month) + 1,
      amount: Number(amount),
      description,
    };

    try {
      const response = await fetch("https://langarsewa-db.onrender.com/expenses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        setMessage({ type: "error", text: "Failed to add expense: " + err.message });
        return;
      }

      const data = await response.json();
      setMessage({ type: "success", text: "Expense added successfully!" });
      setExpenses((prev) => [...prev, data.expense]);

      setDescription("");
      setAmount("");
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage({ type: "error", text: "Error adding expense, please try again." });
    }
  };

  // Delete expense by id from backend
  const handleDeleteById = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const response = await fetch(`https://langarsewa-db.onrender.com/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        setMessage({ type: "error", text: "Failed to delete expense: " + err.message });
        return;
      }
      setMessage({ type: "success", text: "Expense deleted successfully!" });
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      setMessage({ type: "error", text: "Error deleting expense, please try again." });
    }
  };

  // Function to close the message popup
  const closeMessagePopup = () => {
    setMessage(null);
  };

  // Filter expenses for showing in Delete tab based on year and month
  const filteredExpenses = expenses.filter(
    (exp) => exp.year === year && exp.month === months.indexOf(month) + 1
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          खर्च प्रबंधन
        </h1>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("add")}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "add"
                ? "bg-[#4caf50] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-green-100"
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setTab("delete")}
            className={`px-8 py-3 rounded-r-full border-y border-r border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "delete"
                ? "bg-[#e53935] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-red-100"
            }`}
          >
            Delete Expense
          </button>
        </div>

        {tab === "add" && (
          <form
            onSubmit={handleAddExpense}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
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
                placeholder="Enter Amount"
                min="0"
                step="0.01"
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xl font-semibold transition shadow-lg"
              >
                Add Expense
              </button>
            </div>
          </form>
        )}

        {tab === "delete" && (
          <div>
            <div className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md mb-6">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredExpenses.length > 0 ? (
              <ul className="max-w-4xl mx-auto space-y-3 overflow-y-auto">
                {filteredExpenses.map(({ id, description, amount }) => (
                  <li
                    key={id}
                    className="flex items-start bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-100" // Removed justify-between
                  >
                    <div className="flex-grow mr-4"> {/* Added flex-grow and mr-4 */}
                      <p className="font-semibold text-[#4e342e]">{description}</p>
                      <p className="text-[#7b451e]">₹ {amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteById(id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-[#7b451e] font-semibold">
                No expenses found for {month}, {year}.
              </p>
            )}
          </div>
        )}

        {/* Message Popup */}
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
    </div>
  );
}

export default ManageExpense;