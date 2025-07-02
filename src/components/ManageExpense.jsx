import { useState, useEffect } from "react";
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
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

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
    (exp) =>
      exp.Year === String(year) &&
      exp.Month.toLowerCase() === month.toLowerCase()
  );

  if (loading) return <Loader />;

  return (
    <div className="text-[#4e342e] font-serif">
      <div className="mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          Manage Expense
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("add")}
            className={`px-8 py-3 rounded-l-full border border-[#d7a76b] text-lg shadow-md ${
              tab === "add"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold scale-105"
                : "bg-white text-[#8b4513] hover:bg-amber-100"
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setTab("delete")}
            className={`px-8 py-3 rounded-r-full border border-[#d7a76b] text-lg shadow-md ${
              tab === "delete"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold scale-105"
                : "bg-white text-[#8b4513] hover:bg-rose-100"
            }`}
          >
            Delete Expense
          </button>
        </div>

        {/* Add Expense Form */}
        {tab === "add" && (
          <form
            onSubmit={handleAddExpense}
            className="bg-[#fffdf7] rounded-3xl shadow-xl p-8 space-y-6 border border-orange-200"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
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
                className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
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
                className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
                required
              />
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border p-3 rounded-xl bg-[#fffaf3] shadow-md"
              required
            />

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-xl font-semibold transition shadow-lg"
              >
                Add Expense
              </button>
            </div>
          </form>
        )}

        {/* Delete Expense Section */}
        {tab === "delete" && (
          <div>
            <div className="bg-[#fffdf7] rounded-3xl shadow-xl p-8 space-y-6 border border-orange-200 mb-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
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
                  className="border p-3 rounded-xl bg-[#fffaf3] shadow-md"
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
              <ul className="max-w-4xl mx-auto pb-8 space-y-4 overflow-y-auto font-sans">
                {filteredExpenses.map(({ ID, Description, Amount }) => (
                  <li
                    key={ID}
                    className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 transform hover:scale-[1.01] transition-all duration-200 ease-out flex flex-col"
                  >
                    {/* Top Row: Amount (left) and Delete Button (right) */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <p className="font-bold text-teal-600 text-xl">
                        ₹ {Amount}
                      </p>
                      <button
                        onClick={() => handleDeleteById(ID)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Bottom Row: Description (full width) */}
                    <div className="w-full">
                      <p className="font-medium text-gray-800 text-lg leading-snug">
                        {Description}
                      </p>
                    </div>
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
