import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import FinanceSummary from "./FinanceSummary";
import { theme } from ".././theme";

const ManageFinance = () => {
  const [activeTab, setActiveTab] = useState("donations");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }).toLowerCase()
  );
  const [donationsData, setDonationsData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const donationsRes = await fetch("https://langarsewa-db.onrender.com/donations");
        const donationsJson = await donationsRes.json();
        setDonationsData(donationsJson);

        const expensesRes = await fetch("https://langarsewa-db.onrender.com/expenses");
        const expensesJson = await expensesRes.json();
        const normalizedData = expensesJson.map(expense => ({
          ...expense,
          month: months[expense.month - 1]
        }));
        setExpenseData(normalizedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDonations = donationsData.filter((entry) => {
    const amount = entry.donations?.[selectedYear]?.[selectedMonth] ?? 0;
    const fullName = `${entry.name} ${entry.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.roll.toString().includes(searchTerm.toLowerCase());
    return amount > 0 && matchesSearch;
  });

  const filteredExpenses = expenseData.filter(
    (expense) =>
      expense.year.toString() === selectedYear &&
      expense.month === selectedMonth &&
      expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className="min-h-screen py-6 px-6 lg:px-10 rounded-xl shadow-lg"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <FinanceSummary />

      {/* Tabs */}
      <div className="flex justify-center mb-8 rounded-lg shadow-sm bg-white border border-yellow-400 max-w-md mx-auto">
        <button
          className={`w-1/2 py-3 font-semibold rounded-lg transition-colors duration-300 text-center
            ${
              activeTab === "donations"
                ? `bg-${theme.colors.primary} text-white shadow-md`
                : `text-${theme.colors.neutralDark} hover:bg-${theme.colors.neutralLight}`
            }`}
          onClick={() => {
            setActiveTab("donations");
            setSearchTerm("");
          }}
          style={{
            backgroundColor: activeTab === "donations" ? theme.colors.primary : "transparent",
            color: activeTab === "donations" ? theme.colors.surface : theme.colors.neutralDark,
            boxShadow: activeTab === "donations" ? `0 4px 6px -1px ${theme.colors.primaryLight}` : "none",
          }}
        >
          Donations
        </button>
        <button
          className={`w-1/2 py-3 font-semibold rounded-lg transition-colors duration-300 text-center
            ${
              activeTab === "expense"
                ? `bg-${theme.colors.primary} text-white shadow-md`
                : `text-${theme.colors.neutralDark} hover:bg-${theme.colors.neutralLight}`
            }`}
          onClick={() => {
            setActiveTab("expense");
            setSearchTerm("");
          }}
          style={{
            backgroundColor: activeTab === "expense" ? theme.colors.primary : "transparent",
            color: activeTab === "expense" ? theme.colors.surface : theme.colors.neutralDark,
            boxShadow: activeTab === "expense" ? `0 4px 6px -1px ${theme.colors.primaryLight}` : "none",
          }}
        >
          Expense
        </button>
      </div>

      {/* Content */}
      {activeTab === "donations" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-6xl mx-auto mb-12">
          {/* Filters */}
          <div className="bg-yellow-50 p-6 flex flex-wrap justify-center gap-6 items-center rounded-t-lg border-b border-yellow-300">
            <Select
              label="Year"
              options={years}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              theme={theme}
            />
            <Select
              label="Month"
              options={months.map(m => m.charAt(0).toUpperCase() + m.slice(1))}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value.toLowerCase())}
              theme={theme}
            />
            <SearchInput
              placeholder="Search by name or roll no."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
          </div>

          {/* Donations Table */}
          <Table
            columns={[
              { header: "Roll No.", key: "roll" },
              { header: "Name", key: "name" },
              { header: "Amount (₹)", key: "amount" },
            ]}
            data={filteredDonations.map((entry) => ({
              roll: entry.roll,
              name: `${entry.name} ${entry.last_name}`,
              amount: entry.donations?.[selectedYear]?.[selectedMonth] ?? 0,
            }))}
            emptyMessage="No donation data found."
            theme={theme}
          />
        </div>
      )}

      {activeTab === "expense" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-6xl mx-auto mb-12">
          {/* Filters */}
          <div className="bg-yellow-50 p-6 flex flex-wrap justify-center gap-6 items-center rounded-t-lg border-b border-yellow-300">
            <Select
              label="Year"
              options={years}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              theme={theme}
            />
            <Select
              label="Month"
              options={months.map(m => m.charAt(0).toUpperCase() + m.slice(1))}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value.toLowerCase())}
              theme={theme}
            />
            <SearchInput
              placeholder="Search by description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
          </div>

          {/* Expenses Table */}
          <Table
            columns={[
              { header: "Year", key: "year" },
              { header: "Month", key: "month" },
              { header: "Amount (₹)", key: "amount" },
              { header: "Description", key: "description" },
            ]}
            data={filteredExpenses.map(expense => ({
              year: expense.year,
              month: expense.month.charAt(0).toUpperCase() + expense.month.slice(1),
              amount: expense.amount,
              description: expense.description,
            }))}
            emptyMessage="No expense data found."
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

// Reusable Select component with label
const Select = ({ label, options, value, onChange, theme }) => (
  <div className="w-full sm:w-1/3 md:w-1/4">
    <label
      htmlFor={label.toLowerCase()}
      className="block mb-1 font-semibold text-yellow-900"
      style={{ fontFamily: theme.fonts.heading }}
    >
      {label}
    </label>
    <select
      id={label.toLowerCase()}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-yellow-400 bg-yellow-100 px-4 py-2 text-yellow-900 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
      style={{ fontFamily: theme.fonts.body }}
    >
      {options.map((opt, i) => (
        <option key={i} value={typeof opt === "string" ? opt.toLowerCase() : opt}>
          {typeof opt === "string" ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
        </option>
      ))}
    </select>
  </div>
);

// Reusable SearchInput component
const SearchInput = ({ placeholder, value, onChange, theme }) => (
  <div className="w-full sm:w-1/2 md:w-1/3">
    <label className="block mb-1 font-semibold text-yellow-900" style={{ fontFamily: theme.fonts.heading }}>
      Search
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-yellow-400 bg-yellow-100 px-4 py-2 text-yellow-900 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
      style={{ fontFamily: theme.fonts.body }}
    />
  </div>
);

// Reusable Table component
const Table = ({ columns, data, emptyMessage, theme }) => (
  <div className="overflow-x-auto">
    <table
      className="min-w-full divide-y divide-yellow-200"
      style={{ fontFamily: theme.fonts.body }}
    >
      <thead
        className="bg-yellow-200"
        style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
      >
        <tr>
          {columns.map(({ header, key }) => (
            <th
              key={key}
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: theme.colors.primary }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-yellow-100">
        {data.length > 0 ? (
          data.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-yellow-50 transition-colors duration-200"
              style={{ cursor: "default" }}
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-yellow-900"
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-yellow-800 italic">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default ManageFinance;
