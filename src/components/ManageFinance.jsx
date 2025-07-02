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
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
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

        const membersData = await membersRes.json();
        const donationsData = await donationsRes.json();
        const expensesData = await expensesRes.json();
        const summaryData = await summaryRes.json();

        setMembers(membersData);
        setDonations(donationsData);
        setExpenses(expensesData);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error fetching data:", err);
        showPopup("Error fetching data", "error");
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

  if (loading) return <Loader />;

  return (
    <div
      className=" mt-8 pb-6 px-4 rounded-xl shadow-lg"
      style={{ fontFamily: theme.fonts.body, color: theme.colors.neutralDark }}
    >
      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card label="Total Donations" value={summary.totalDonations || 0} />
        <Card label="Total Expenses" value={summary.totalExpenses || 0} />
        <Card
          label="Deleted Donations"
          value={summary.totalDeletedDonations || 0}
        />
        <Card label="Balance" value={summary.balance || 0} />
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6 border rounded-lg overflow-hidden">
        {["donations", "expenses"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
            }}
            className={`w-1/2 py-2 font-semibold ${
              activeTab === tab
                ? "bg-yellow-400 text-white"
                : "bg-white text-yellow-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded px-4 py-2"
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
          className="border rounded px-4 py-2"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={
            activeTab === "donations"
              ? "Search by name or roll"
              : "Search by description"
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 flex-1"
        />
      </div>

      {/* Donations Table */}
      {activeTab === "donations" && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-yellow-200">
              <tr>
                <th className="border px-4 py-2">Roll No.</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">
                  Donation ({selectedMonth} {selectedYear})
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.RollNumber} className="hover:bg-yellow-50">
                  <td className="border px-4 py-2">{member.RollNumber}</td>
                  <td className="border px-4 py-2">
                    {member.Name} {member.LastName}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {getDonationAmount(member.RollNumber)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses Table */}
      {activeTab === "expenses" && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-yellow-200">
              <tr>
                <th className="border px-4 py-2">Year</th>
                <th className="border px-4 py-2">Month</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.ID} className="hover:bg-yellow-50">
                  <td className="border px-4 py-2">{exp.Year}</td>
                  <td className="border px-4 py-2">{exp.Month}</td>
                  <td className="border px-4 py-2 text-right">{exp.Amount}</td>
                  <td className="border px-4 py-2">{exp.Description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
};

// Dashboard Summary Card
const Card = ({ label, value }) => (
  <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
    <div className="text-xl font-bold text-yellow-900">{value}</div>
    <div className="text-sm text-yellow-700">{label}</div>
  </div>
);

export default ManageFinance;
