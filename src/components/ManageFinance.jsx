import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import FinanceSummary from "./FinanceSummary";
import { theme } from ".././theme";
import { Filter } from "lucide-react";

const ManageFinance = () => {
  const [activeTab, setActiveTab] = useState("donations");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }).toLowerCase()
  );
  const [donationsData, setDonationsData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all"); // all, paid, unpaid

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const donationsRes = await fetch(
          "https://langarsewa-db.onrender.com/donations"
        );
        const donationsJson = await donationsRes.json();
        setDonationsData(donationsJson);

        const expensesRes = await fetch(
          "https://langarsewa-db.onrender.com/expenses"
        );
        const expensesJson = await expensesRes.json();
        const normalizedData = expensesJson.map((expense) => ({
          ...expense,
          month: months[expense.month - 1],
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

    if (filterMode === "paid" && amount <= 0) return false;
    if (filterMode === "unpaid" && amount > 0) return false;

    return matchesSearch;
  });

  const filteredExpenses = expenseData.filter(
    (expense) =>
      expense.year.toString() === selectedYear &&
      expense.month === selectedMonth &&
      expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFilterMode = () => {
    setFilterMode((prev) =>
      prev === "all" ? "paid" : prev === "paid" ? "unpaid" : "all"
    );
  };

  if (loading) return <Loader />;

  return (
    <div
      className="min-h-screen mt-8 pb-6 px-2 rounded-xl shadow-lg"
      style={{ fontFamily: theme.fonts.body, color: theme.colors.neutralDark }}
    >
      <FinanceSummary />

      {/* Tabs */}
      <div
        className="flex justify-center mb-8 rounded-lg shadow-sm  mx-auto border"
        style={{ borderColor: theme.colors.secondary }}
      >
        {["donations", "expense"].map((tab) => (
          <button
            key={tab}
            className="w-1/2 py-3 font-semibold rounded-lg transition-colors duration-300 text-center"
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
              setFilterMode("all");
            }}
            style={{
              backgroundColor:
                activeTab === tab ? theme.colors.primary : "transparent",
              color:
                activeTab === tab
                  ? theme.colors.surface
                  : theme.colors.neutralDark,
              boxShadow:
                activeTab === tab
                  ? `0 4px 6px -1px ${theme.colors.primaryLight}`
                  : "none",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "donations" && (
        <div className="shadow-md overflow-hidden  mx-auto mb-12">
          {/* Filters */}
          <div
            className="pb-6 flex flex-wrap justify-between gap-6 items-center rounded-t-lg border-b"
            style={{ borderColor: theme.colors.secondary }}
          >
            <div className="w-full flex gap-4">
              <div className="w-1/2">
                <Select
                  label="Year"
                  options={years}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  theme={theme}
                />
              </div>
              <div className="w-1/2">
                <Select
                  label="Month"
                  options={months.map(
                    (m) => m.charAt(0).toUpperCase() + m.slice(1)
                  )}
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value.toLowerCase())
                  }
                  theme={theme}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3">
              <SearchInput
                placeholder="Search by name or roll no."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                theme={theme}
              />
            </div>
          </div>

          {/* Donations Table */}
          <Table
            columns={[
              { header: "Roll No.", key: "roll" },
              { header: "Name", key: "name" },
              {
                header: (
                  <div className="flex flex-col items-center gap-1">
                    <span>Amount</span>
                    <button
                      onClick={toggleFilterMode}
                      className="p-1 rounded bg-yellow-300 text-yellow-900 hover:bg-yellow-400 transition flex items-center justify-center"
                      title={
                        filterMode === "all"
                          ? "Show all"
                          : filterMode === "paid"
                          ? "Show paid only"
                          : "Show unpaid only"
                      }
                      style={{
                        color: theme.colors.accent,
                        backgroundColor: theme.colors.secondary,
                      }}
                    >
                      <Filter size={16} stroke={theme.colors.primary} />
                    </button>
                  </div>
                ),
                key: "amount",
              },
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
        <div className="rounded-lg shadow-md overflow-hidden  mx-auto mb-12">
          {/* Filters */}
          <div
            className="bg-yellow-50 p-6 flex flex-wrap justify-between gap-6 items-center rounded-t-lg border-b"
            style={{ borderColor: theme.colors.secondary }}
          >
            <div className="w-full flex gap-4 px-6">
              <div className="w-1/2">
                <Select
                  label="Year"
                  options={years}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  theme={theme}
                />
              </div>
              <div className="w-1/2">
                <Select
                  label="Month"
                  options={months.map(
                    (m) => m.charAt(0).toUpperCase() + m.slice(1)
                  )}
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value.toLowerCase())
                  }
                  theme={theme}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 px-6">
              <SearchInput
                placeholder="Search by description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                theme={theme}
              />
            </div>
          </div>

          {/* Expenses Table */}
          <Table
            columns={[
              { header: "Year", key: "year" },
              { header: "Month", key: "month" },
              { header: "Amount", key: "amount" },
              { header: "Description", key: "description" },
            ]}
            data={filteredExpenses.map((expense) => ({
              year: expense.year,
              month:
                expense.month.charAt(0).toUpperCase() + expense.month.slice(1),
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

// Reusable Select component
const Select = ({ options, value, onChange, theme }) => (
  <div>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-md border px-4 py-2 shadow-sm
        focus:outline-none focus:ring-2 transition"
      style={{
        fontFamily: theme.fonts.body,
        borderColor: theme.colors.secondary,
        backgroundColor: theme.colors.background,
        color: theme.colors.neutralDark,
        focus: { ringColor: theme.colors.secondary },
      }}
    >
      {options.map((opt, i) => (
        <option
          key={i}
          value={typeof opt === "string" ? opt.toLowerCase() : opt}
        >
          {typeof opt === "string"
            ? opt.charAt(0).toUpperCase() + opt.slice(1)
            : opt}
        </option>
      ))}
    </select>
  </div>
);

// Reusable SearchInput component
const SearchInput = ({ placeholder, value, onChange, theme }) => (
  <div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border px-4 py-2 shadow-sm
        focus:outline-none focus:ring-2 transition"
      style={{
        fontFamily: theme.fonts.body,
        borderColor: theme.colors.secondary,
        backgroundColor: theme.colors.background,
        color: theme.colors.neutralDark,
      }}
    />
  </div>
);

// Reusable Table component
const Table = ({ columns, data, emptyMessage, theme }) => (
  <div className="overflow-x-auto">
    <table
      className="w-full table-fixed border-collapse"
      style={{ fontFamily: theme.fonts.body }}
    >
      <thead
        className="bg-yellow-200"
        style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
      >
        <tr>
          {columns.map(({ header, key }) => {
            let className =
              "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left";
            if (key === "roll") className += " w-[60px]";
            else if (key === "amount") className += " w-[100px] text-right";
            return (
              <th
                key={key}
                className={className}
                style={{ color: theme.colors.primary }}
              >
                {header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-yellow-100">
        {data.length > 0 ? (
          data.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-yellow-50 transition-colors duration-200"
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className={`px-6 w-m py-4 whitespace-nowrap text-sm text-yellow-900 ${
                    key === "amount" ? "w-24" : ""
                  }`}
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-4 text-center text-sm text-yellow-800 italic"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default ManageFinance;
