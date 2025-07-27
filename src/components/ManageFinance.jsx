import { useEffect, useState } from "react";
import Summary from "./Summary";
import LoadData from "./LoadData";

// Note: It's good practice to derive current year dynamically for 'years' array as well
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Dynamically generate years for consistency with other components
const years = Array.from({ length: 2 }, (_, i) => String(new Date().getFullYear() + i));

export default function ManageFinance() {
  const [activeTab, setActiveTab] = useState("donation");

  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear())); // Default to current year
  const [selectedMonth, setSelectedMonth] = useState("July"); // Default to current month for example

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // This is still using localStorage.getItem.
    // In a real application, you would ideally fetch this data from Firebase
    // just like you do for members in ManageAttendance/ManageDonation.
    const allMembers = JSON.parse(localStorage.getItem("allMembers")) || [];

    const donationList = allMembers.map((member) => {
      // Ensure that selectedYear and selectedMonth are correctly used to access donation data
      const donationData = member?.donation?.[selectedYear]?.[selectedMonth];
      let amount = 0;

      if (typeof donationData === "number") {
        amount = donationData;
      } else if (Array.isArray(donationData)) {
        amount = donationData.reduce((sum, val) => sum + Number(val || 0), 0);
      }

      return {
        // Prioritize 'id' if 'roll_no' is not consistently used
        roll: member.roll_no || member.id || "-",
        name: member.name || "Unknown",
        amount: amount
      };
    }).filter(d => d.amount > 0); // Filter out members with 0 donation for cleaner display

    setDonations(donationList);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    // This is still using localStorage.getItem.
    // Consider fetching expenses from Firebase if they are stored there.
    const expenseData = JSON.parse(localStorage.getItem("expenses")) || {};
    const expensesList = expenseData?.[selectedYear]?.[selectedMonth] || [];
    setExpenses(expensesList);
  }, [selectedYear, selectedMonth]);


  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      <LoadData />
      <Summary /> {/* Summary component is placed here */}


      {/* Tabs - Styled like ManageAttendance/Donation */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("donation")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "donation" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "expense" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Expenses
        </button>
      </div>

      {/* Dropdowns - Styled like ManageAttendance/Donation inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
        {/* Year Select */}
        <div className="relative">
          <label htmlFor="finance-year-select" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
          <select
            id="finance-year-select" // Unique ID for this component
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
        {/* Month Select */}
        <div className="relative">
          <label htmlFor="finance-month-select" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <select
            id="finance-month-select" // Unique ID for this component
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
      </div>

      {/* Donation Tab Content */}
      {activeTab === "donation" && (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.length > 0 ? (
                donations.map((d, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{d.roll}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{d.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">{d.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500 italic" colSpan="3">
                    No donation data available for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Tab Content */}
      {activeTab === "expense" && (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length > 0 ? (
                expenses.map((e, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{e.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{e.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500 italic" colSpan="2">
                    No expense data available for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}