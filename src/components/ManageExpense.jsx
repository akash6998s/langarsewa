import { useState } from "react";

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
  const [deleteDesc, setDeleteDesc] = useState("");

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const newExpense = {
      id: Date.now(),
      year,
      month,
      description,
      amount: Number(amount),
    };
    setExpenses((prev) => [...prev, newExpense]);
    alert("Expense added!");
    setDescription("");
    setAmount("");
  };

  const handleDeleteExpense = (e) => {
    e.preventDefault();
    if (!deleteDesc.trim()) {
      alert("Please enter a description to delete.");
      return;
    }
    const filtered = expenses.filter(
      (exp) =>
        !(
          exp.year === year &&
          exp.month === month &&
          exp.description.toLowerCase() === deleteDesc.toLowerCase()
        )
    );
    if (filtered.length === expenses.length) {
      alert("No matching expense found to delete.");
      return;
    }
    setExpenses(filtered);
    alert("Expense deleted!");
    setDeleteDesc("");
  };

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
          <form
            onSubmit={handleDeleteExpense}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md"
          >
            <div className="grid sm:grid-cols-2 gap-4">
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

            <input
              type="text"
              value={deleteDesc}
              onChange={(e) => setDeleteDesc(e.target.value)}
              placeholder="Enter Description to Delete"
              className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xl font-semibold transition shadow-lg"
              >
                Delete Expense
              </button>
            </div>
          </form>
        )}

        {expenses.length > 0 && (
          <div className="mt-10 bg-white/90 p-6 rounded-3xl shadow-lg border border-yellow-200 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-[#6d4c41] text-center">
              Recorded Expenses
            </h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {expenses.map(({ id, year, month, description, amount }) => (
                <li
                  key={id}
                  className="flex justify-between items-center bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-100"
                >
                  <div>
                    <p className="font-semibold text-[#4e342e]">
                      {description} ({month}, {year})
                    </p>
                    <p className="text-[#7b451e]">₹ {amount.toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageExpense;
