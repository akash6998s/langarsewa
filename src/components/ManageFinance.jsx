import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

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

  // Calculate total donations for selected month
  const totalDonationsOfMonth = filteredMembers.reduce((sum, member) => {
    const amount = getDonationAmount(member.RollNumber);
    return sum + (parseFloat(amount) || 0);
  }, 0);

  // Calculate total expenses for selected month
  const totalExpensesOfMonth = filteredExpenses.reduce((sum, exp) => {
    return sum + (parseFloat(exp.Amount) || 0);
  }, 0);

  // Calculate total donations overall
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
    <div className="bg-[#fdfaf6] min-h-screen text-[#4e342e] font-sans">
      <div className="mx-auto px-4 pt-10 pb-16 max-w-7xl">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-[#7b341e] tracking-tight drop-shadow-lg">
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
          <button
            onClick={() => {
              setActiveTab("donations");
              setSearchTerm("");
            }}
            className={`px-10 py-4 rounded-l-full border-2 border-[#d7a76b] text-lg font-semibold transition-all duration-300 ease-in-out transform shadow-lg hover:shadow-xl ${
              activeTab === "donations"
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white scale-105"
                : "bg-white text-[#8b4513] hover:bg-amber-50 hover:text-orange-700"
            }`}
          >
            Donations
          </button>
          <button
            onClick={() => {
              setActiveTab("expenses");
              setSearchTerm("");
            }}
            className={`px-10 py-4 rounded-r-full border-2 border-[#d7a76b] text-lg font-semibold transition-all duration-300 ease-in-out transform shadow-lg hover:shadow-xl ${
              activeTab === "expenses"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white scale-105"
                : "bg-white text-[#8b4513] hover:bg-rose-50 hover:text-red-700"
            }`}
          >
            Expenses
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-4 py-2 text-sm shadow-sm w-full sm:w-auto"
              style={{
                borderColor: "#d7a76b",
                backgroundColor: "#fffaf3",
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
                borderColor: "#d7a76b",
                backgroundColor: "#fffaf3",
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
              className="border border-[#d7a76b] px-4 py-2 rounded text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
              style={{
                backgroundColor: "#fffaf3",
              }}
            />
          </div>
        </div>

        {/* Donations Table */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100">
            {/* Total Donations Header */}
            <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-t-2xl border-b border-orange-200 flex justify-between items-center">
              <p className="text-base font-semibold">
                Total Donations in {selectedMonth} {selectedYear}
              </p>
              <h2 className="text-xl font-extrabold">
                ₹ {totalDonationsOfMonth}
              </h2>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-orange-50 text-orange-800 uppercase text-sm">
                <tr>
                  <th className="w-[60px] px-3 py-3 border-b-2 border-orange-200 font-bold tracking-wider">
                    Roll
                  </th>
                  <th className="px-3 py-3 border-b-2 border-orange-200 font-bold tracking-wider">
                    Name
                  </th>
                  <th className="w-[90px] px-3 py-3 border-b-2 border-orange-200 font-bold tracking-wider text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.RollNumber}
                      className="hover:bg-orange-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        {member.RollNumber}
                      </td>
                      <td className="px-3 py-4 break-words">
                        {member.Name} {member.LastName}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right font-medium text-green-700">
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
  <div className="bg-white rounded-2xl shadow-xl border border-red-100">
    {/* Fixed Total Expenses Header */}
    <div className="bg-red-50 text-red-800 px-4 py-3 rounded-t-2xl border-b border-red-200 flex justify-between items-center">
      <p className="text-base font-semibold">
        Total Expenses in {selectedMonth} {selectedYear}
      </p>
      <h2 className="text-xl font-extrabold">
        ₹ {totalExpensesOfMonth}
      </h2>
    </div>

    {/* Scrollable Table */}
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-left min-w-[600px]">
        <thead className="bg-red-50 text-red-800 uppercase text-sm">
          <tr>
            <th className="px-6 py-3 border-b-2 border-red-200 font-bold tracking-wider">
              Year
            </th>
            <th className="px-6 py-3 border-b-2 border-red-200 font-bold tracking-wider">
              Month
            </th>
            <th className="px-6 py-3 border-b-2 border-red-200 font-bold tracking-wider text-right">
              Amount
            </th>
            <th className="px-6 py-3 border-b-2 border-red-200 font-bold tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((exp) => (
              <tr
                key={exp.ID}
                className="hover:bg-red-50 transition duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap">{exp.Year}</td>
                <td className="px-6 py-4 whitespace-nowrap">{exp.Month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-red-700">
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


        {/* Popup */}
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ message: "", type: "" })}
        />
      </div>
    </div>
  );
};

// Dashboard Summary Card Component
const Card = ({ label, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg text-center border border-yellow-200 transform hover:scale-105 transition duration-300 ease-in-out">
    <div className="text-3xl font-extrabold text-yellow-800 mb-1">
      ₹ {value}
    </div>
    <div className="text-md text-yellow-700 font-semibold">{label}</div>
  </div>
);

export default ManageFinance;
