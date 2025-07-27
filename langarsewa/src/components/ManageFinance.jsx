import React, { useEffect, useState, useMemo } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { theme } from "../theme";
import { Filter, Copy } from "lucide-react";

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
  const [donationFilter, setDonationFilter] = useState("all");

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
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  const toggleDonationFilter = () => {
    setDonationFilter((prev) =>
      prev === "all" ? "paid" : prev === "paid" ? "unpaid" : "all"
    );
  };

  // --- MODIFIED copyFilteredMemberNames FUNCTION ---
  const copyFilteredMemberNames = async () => {
    const names = filteredMembers.map((member) =>
      `${member.Name} ${member.LastName}`.trim()
    );
    const textToCopy = names.join("\n");

    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        showPopup("Names copied to clipboard!", "success");
      } else {
        // Fallback for older browsers or environments without full Clipboard API support
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; // Prevents scrolling to bottom of page
        textArea.style.opacity = 0; // Make it invisible
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            showPopup("Names copied to clipboard! (Fallback)", "success");
          } else {
            throw new Error("Failed to copy using execCommand.");
          }
        } catch (err) {
          console.error("Fallback copy failed:", err);
          showPopup("Failed to copy names. Please copy manually.", "error");
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error("Clipboard API copy failed:", err);
      showPopup("Failed to copy names. Please copy manually.", "error");
    }
  };
  // --- END MODIFIED FUNCTION ---

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
        )
          throw new Error("Failed to fetch one or more APIs");

        setMembers(await membersRes.json());
        setDonations(await donationsRes.json());
        setExpenses(await expensesRes.json());
        setSummary(await summaryRes.json());
      } catch (err) {
        showPopup("Error fetching data", "error");
        console.error(err);
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
    (exp) =>
      exp.Year?.toString() === selectedYear &&
      exp.Month?.toLowerCase() === selectedMonth.toLowerCase() &&
      exp.Description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = members.filter((member) => {
    const nameMatch = member.Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const rollMatch = member.RollNumber.toString().includes(searchTerm);
    const matchesSearch = nameMatch || rollMatch;

    const amount = getDonationAmount(member.RollNumber);

    if (donationFilter === "paid") {
      return matchesSearch && parseFloat(amount) > 0;
    } else if (donationFilter === "unpaid") {
      return matchesSearch && (!amount || parseFloat(amount) === 0);
    }

    return matchesSearch;
  });

  const totalDonationsOfMonth = useMemo(() => {
    return members.reduce((sum, member) => {
      const amount = getDonationAmount(member.RollNumber);
      return sum + (parseFloat(amount) || 0);
    }, 0);
  }, [members, donations, selectedYear, selectedMonth]);

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
      style={{
        background: theme.colors.background,
        color: theme.colors.neutralDark,
      }}
    >
      <div className="mx-auto pt-4 pb-20">
        <div className="flex justify-center">
          <h1
            className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-wider uppercase drop-shadow-lg relative inline-block"
            style={{ color: theme.colors.primary }}
          >
            Manage Finance
            <span
              className="absolute left-1/2 -bottom-2 w-1/2 h-1 rounded-full"
              style={{
                transform: "translateX(-50%)",
                background: `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
              }}
            />
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <Card label="Total Donations" value={totalDonationsOverall} />
          <Card label="Total Expenses" value={summary.totalExpenses || 0} />
          <Card label="Balance" value={summary.balance || 0} />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          {["donations", "expenses"].map((tab) => {
            const isActive = activeTab === tab;
            const isDonation = tab === "donations";
            const bgColor = isActive
              ? isDonation
                ? theme.colors.success
                : theme.colors.danger
              : theme.colors.neutralLight;
            const textColor = isActive ? "#ffffff" : theme.colors.primary;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm("");
                }}
                className={`px-10 py-4 ${
                  isDonation ? "rounded-l-full" : "rounded-r-full"
                } text-lg font-semibold shadow-md`}
                style={{
                  borderColor: theme.colors.primaryLight,
                  background: bgColor,
                  color: textColor,
                }}
              >
                {isDonation ? "Donations" : "Expenses"}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4 w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-4 py-2 text-sm shadow-sm w-1/2"
              style={{
                borderColor: theme.colors.primaryLight,
                backgroundColor: theme.colors.neutralLight,
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
              className="border rounded px-4 py-2 text-sm shadow-sm w-1/2"
              style={{
                borderColor: theme.colors.primaryLight,
                backgroundColor: theme.colors.neutralLight,
              }}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

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
              backgroundColor: theme.colors.neutralLight,
            }}
          />
        </div>

        {/* Donations Table */}
        {activeTab === "donations" && (
          <div
            className="rounded-2xl shadow-xl border overflow-hidden"
            style={{
              background: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
            }}
          >
            <div
              className="px-3 py-3 rounded-t-2xl border-b flex justify-between items-center"
              style={{
                background: theme.colors.neutralLightLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              <p className="text-base font-semibold">
                Total Donations in {selectedMonth}
              </p>
              <h2 className="font-bold">₹ {totalDonationsOfMonth}</h2>
            </div>

            <table className="w-full table-fixed text-left">
              <thead
                className="uppercase text-sm"
                style={{ background: theme.colors.primary, color: "#fff" }}
              >
                <tr>
                  <th className="w-[60px] px-3 py-3 border-b-2 font-bold tracking-wider">
                    Roll
                  </th>
                  <th className="px-3 py-3 border-b-2 font-bold tracking-wider">
                    Name
                  </th>
                  <th className="w-[120px] px-3 py-3 border-b-2 font-bold tracking-wider text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>Amount</span>
                      <button
                        onClick={toggleDonationFilter}
                        title={`Filter: ${donationFilter}`}
                        className="p-1 rounded hover:bg-opacity-70"
                        style={{
                          backgroundColor: theme.colors.neutralLight,
                          border: `1px solid ${theme.colors.primaryLight}`,
                          color: theme.colors.primary,
                        }}
                      >
                        <Filter size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <tr
                      key={member.RollNumber}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f0f0f0" : "#ffffff",
                      }}
                    >
                      <td className="px-3 py-4">{member.RollNumber}</td>
                      <td className="px-3 py-4">
                        {member.Name} {member.LastName}
                      </td>
                      <td
                        style={{ color: theme.colors.success }}
                        className="px-3 py-4 text-right font-medium"
                      >
                        ₹ {getDonationAmount(member.RollNumber)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      No donations found for this period or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* COPY BUTTON IS NOW HERE, at the bottom of the table */}
            <div
              className="p-3 flex justify-center border-t"
              style={{ borderColor: theme.colors.primaryLight }}
            >
              <button
                onClick={copyFilteredMemberNames}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 shadow-sm transition"
                title="Copy filtered member names"
              >
                <Copy size={16} />
                Copy Filtered Names
              </button>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        {activeTab === "expenses" && (
          <div
            className="rounded-2xl shadow-xl border overflow-hidden"
            style={{
              background: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
            }}
          >
            <div
              className="px-3 py-3 rounded-t-2xl border-b flex justify-between items-center"
              style={{
                background: theme.colors.neutralLightLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              <p className="text-base font-semibold">
                Total Expenses in {selectedMonth}
              </p>
              <h2 className="font-bold">₹ {totalExpensesOfMonth}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left min-w-[600px]">
                <thead
                  className="uppercase text-sm"
                  style={{ background: theme.colors.primary, color: "#fff" }}
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
                <tbody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp, index) => (
                      <tr
                        key={exp.ID}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f0f0f0" : "#ffffff",
                        }}
                      >
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
                      <td
                        colSpan="4"
                        className="text-center py-8 text-gray-500"
                      >
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

const Card = ({ label, value }) => {
  let icon = "";
  let textColor = theme.colors.primary;
  let bgColor = "#ffffff";
  let borderColor = theme.colors.primaryLight;

  if (label === "Total Donations") {
    icon = "💰";
    textColor = theme.colors.success;
  } else if (label === "Total Expenses") {
    icon = "📉";
    textColor = theme.colors.danger;
  } else if (label === "Balance") {
    icon = "📊";
    textColor = theme.colors.primary;
  }

  return (
    <div
      className="flex items-center justify-between px-6 py-4 rounded-xl shadow-sm border"
      style={{
        backgroundColor: bgColor,
        borderColor,
        color: textColor,
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-lg shadow-sm"
          style={{ backgroundColor: textColor, color: "#fff" }}
        >
          {icon}
        </div>
        <div className="text-sm font-semibold tracking-wide opacity-80">
          {label}
        </div>
      </div>
      <div className="text-xl font-bold tracking-tight">₹ {value}</div>
    </div>
  );
};

export default ManageFinance;