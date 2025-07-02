import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { theme } from "../theme";

const ManageFinance = () => {
  const [members, setMembers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});

  const [activeTab, setActiveTab] = useState("donations");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersRes, donationsRes, expensesRes, summaryRes] =
          await Promise.all([
            fetch("https://langar-backend.onrender.com/api/members"),
            fetch("https://langar-backend.onrender.com/api/donations"),
            fetch("https://langar-backend.onrender.com/api/expenses"),
            fetch("https://langar-backend.onrender.com/api/summary"),
          ]);

        if (
          !membersRes.ok ||
          !donationsRes.ok ||
          !expensesRes.ok ||
          !summaryRes.ok
        ) {
          throw new Error("Failed to fetch one or more APIs");
        }

        setMembers(await membersRes.json());
        setDonations(await donationsRes.json());
        setExpenses(await expensesRes.json());
        setSummary(await summaryRes.json());
      } catch (err) {
        showPopup("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDonationAmount = (rollNumber) => {
    const entry = donations.find(
      (d) => (d?.RollNumber || "").toString() === (rollNumber || "").toString()
    );
    return entry?.[selectedYear]?.[selectedMonth] ?? 0;
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.Year?.toString() === selectedYear &&
      expense.Month?.toLowerCase() === selectedMonth.toLowerCase() &&
      expense.Description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = members.filter(
    (member) =>
      member.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.RollNumber.toString().includes(searchTerm)
  );

  const totalDonationsOfMonth = filteredMembers.reduce((sum, member) => {
    const amount = getDonationAmount(member.RollNumber);
    return sum + (parseFloat(amount) || 0);
  }, 0);

  const totalExpensesOfMonth = filteredExpenses.reduce((sum, exp) => {
    return sum + (parseFloat(exp.Amount) || 0);
  }, 0);

  const totalDonationsOverall = members.reduce((sum, member) => {
    const donationEntry = donations.find(
      (d) => d.RollNumber.toString() === member.RollNumber.toString()
    );

    if (!donationEntry) return sum;

    const yearlyDonations = Object.values(donationEntry).filter(
      (v) => typeof v === "object"
    );

    const total = yearlyDonations.reduce((yearSum, yearObj) => {
      const monthsTotal = Object.values(yearObj).reduce(
        (monthSum, val) => monthSum + (parseFloat(val) || 0),
        0
      );
      return yearSum + monthsTotal;
    }, 0);

    return sum + total;
  }, 0);

  if (loading) return <Loader />;

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: theme.colors.background, color: theme.colors.neutralDark }}
    >
      <div className="mx-auto px-4 pt-4 max-w-4xl pb-20">
        <h1
          className="text-2xl font-extrabold text-center mb-10 tracking-tight drop-shadow-lg"
          style={{ color: theme.colors.primary }}
        >
          Manage Finances
        </h1>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <Card label="Total Donations" value={totalDonationsOverall} />
          <Card label="Total Expenses" value={summary.totalExpenses || 0} />
          <Card label="Balance" value={summary.balance || 0} />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          {["donations", "expenses"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
              }}
              className={`px-10 py-4 ${
                tab === "donations"
                  ? "rounded-l-full"
                  : "rounded-r-full"
              } border-2 text-lg font-semibold transition-all transform shadow-lg`}
              style={{
                borderColor: theme.colors.primaryLight,
                background:
                  activeTab === tab
                    ? `linear-gradient(to right, ${
                        tab === "donations"
                          ? `${theme.colors.primaryLight}, ${theme.colors.primary}`
                          : `${theme.colors.accent}, #f43f5e`
                      })`
                    : theme.colors.surface,
                color:
                  activeTab === tab
                    ? theme.colors.surface
                    : theme.colors.primary,
              }}
            >
              {tab === "donations" ? "Donations" : "Expenses"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
              style={{
                borderColor: theme.colors.primaryLight,
                backgroundColor: theme.colors.surface,
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
              style={{
                borderColor: theme.colors.primaryLight,
                backgroundColor: theme.colors.surface,
              }}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <input
              type="text"
              placeholder={
                activeTab === "donations"
                  ? "Search by Name or Roll No."
                  : "Search by Description"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded text-sm shadow-sm w-full"
              style={{
                borderColor: theme.colors.primaryLight,
                backgroundColor: theme.colors.surface,
              }}
            />
          </div>
        </div>

        {/* Donations Table */}
        {activeTab === "donations" && (
          <div
            className="rounded-2xl shadow-xl border"
            style={{ background: theme.colors.surface, borderColor: theme.colors.primaryLight }}
          >
            <div
              className="px-4 py-3 rounded-t-2xl border-b flex justify-between items-center"
              style={{
                background: theme.colors.surfaceLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              <p className="text-base font-semibold">
                Total Donations in {selectedMonth} {selectedYear}
              </p>
              <h2 className="text-xl font-extrabold">
                ₹ {totalDonationsOfMonth}
              </h2>
            </div>

            <table className="w-full table-fixed text-left">
              <thead
                style={{
                  background: theme.colors.surfaceLight,
                  color: theme.colors.primary,
                }}
                className="uppercase text-sm"
              >
                <tr>
                  <th className="w-[60px] px-3 py-3 border-b-2 font-bold tracking-wider">
                    Roll
                  </th>
                  <th className="px-3 py-3 border-b-2 font-bold tracking-wider">
                    Name
                  </th>
                  <th className="w-[90px] px-3 py-3 border-b-2 font-bold tracking-wider text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.RollNumber}>
                      <td className="px-3 py-4">{member.RollNumber}</td>
                      <td className="px-3 py-4">
                        {member.Name} {member.LastName}
                      </td>
                      <td className="px-3 py-4 text-right font-medium text-green-700">
                        ₹ {getDonationAmount(member.RollNumber)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      No donations found for this period or search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses Table */}
        {activeTab === "expenses" && (
          <div
            className="rounded-2xl shadow-xl border"
            style={{ background: theme.colors.surface, borderColor: theme.colors.primaryLight }}
          >
            <div
              className="px-4 py-3 rounded-t-2xl border-b flex justify-between items-center"
              style={{
                background: theme.colors.surfaceLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.accent,
              }}
            >
              <p className="text-base font-semibold">
                Total Expenses in {selectedMonth} {selectedYear}
              </p>
              <h2 className="text-xl font-extrabold">
                ₹ {totalExpensesOfMonth}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left min-w-[600px]">
                <thead
                  style={{
                    background: theme.colors.surfaceLight,
                    color: theme.colors.accent,
                  }}
                  className="uppercase text-sm"
                >
                  <tr>
                    <th className="px-6 py-3 border-b-2 font-bold tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 border-b-2 font-bold tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 border-b-2 font-bold tracking-wider text-right">
                      Amount
                    </th>
                    <th className="px-6 py-3 border-b-2 font-bold tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.ID}>
                        <td className="px-6 py-4">{exp.Year}</td>
                        <td className="px-6 py-4">{exp.Month}</td>
                        <td className="px-6 py-4 text-right font-medium text-red-700">
                          ₹ {exp.Amount}
                        </td>
                        <td className="px-6 py-4">{exp.Description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No expenses found for this period or search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
};

const Card = ({ label, value }) => (
  <div
    className="p-5 rounded-xl shadow-lg text-center border transform hover:scale-105 transition"
    style={{
      background: theme.colors.surface,
      borderColor: theme.colors.primaryLight,
    }}
  >
    <div
      className="text-3xl font-extrabold mb-1"
      style={{ color: theme.colors.primary }}
    >
      ₹ {value}
    </div>
    <div
      className="text-md font-semibold"
      style={{ color: theme.colors.primaryLight }}
    >
      {label}
    </div>
  </div>
);

export default ManageFinance;
