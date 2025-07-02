import { useState, useEffect } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

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
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const backendUrl = "https://langar-backend.onrender.com/api/expenses";

  // Fetch expenses when tab changes to delete
  useEffect(() => {
    if (tab === "delete") {
      fetchExpenses();
    }
  }, [tab]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(backendUrl);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      showPopup("Error fetching expenses.", error);
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showPopup("Please enter a description.", "error");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showPopup("Please enter a valid amount.", "error");
      return;
    }

    const payload = {
      Year: String(year),
      Month: month,
      Amount: amount,
      Description: description,
    };

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add expense.");

      showPopup("Expense added successfully!", "success");
      setDescription("");
      setAmount("");
      if (tab === "delete") fetchExpenses();
    } catch (error) {
      showPopup(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteById = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete expense.");

      showPopup("Expense deleted successfully!", "success");
      setExpenses((prev) => prev.filter((exp) => exp.ID !== id));
    } catch (error) {
      showPopup(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) => exp.Year === String(year) && exp.Month.toLowerCase() === month.toLowerCase()
  );

  if (loading) return <Loader />;

  return (
    <div className=" bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          खर्च प्रबंधन
        </h1>

        {/* Tabs */}
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

        {/* Add Expense Form */}
        {tab === "add" && (
          <form
            onSubmit={handleAddExpense}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border p-3 rounded-lg bg-[#fffdf7]"
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
                placeholder="Enter Amount"
                min="0"
                step="0.01"
                className="border p-3 rounded-lg bg-[#fffdf7]"
                required
              />
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border p-3 rounded-lg bg-[#fffdf7]"
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

        {/* Delete Expense Section */}
        {tab === "delete" && (
          <div>
            <div className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md mb-6">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border p-3 rounded-lg bg-[#fffdf7]"
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
                  className="border p-3 rounded-lg bg-[#fffdf7]"
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
                {filteredExpenses.map(({ ID, Description, Amount }) => (
                  <li
                    key={ID}
                    className="flex items-start bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-100"
                  >
                    <div className="flex-grow mr-4">
                      <p className="font-semibold text-[#4e342e]">{Description}</p>
                      <p className="font-bold">₹ {Amount}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteById(ID)}
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

        {/* Popup */}
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ message: "", type: "" })}
        />
      </div>
    </div>
  );
}

export default ManageExpense;
