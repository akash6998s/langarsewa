import React, { useState, useEffect } from "react";
import Loader from "./Loader"; // Assuming you have a Loader component
import FinanceSummary from "./FinanceSummary";

const ManageFinance = () => {
  const [activeTab, setActiveTab] = useState("donations");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }).toLowerCase()
  );
  const [donationsData, setDonationsData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Initialize loading state to false

  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before API calls

      try {
        // Fetch donations data
        const donationsRes = await fetch("http://localhost:5000/donations");
        const donationsJson = await donationsRes.json();
        setDonationsData(donationsJson);

        // Fetch expenses data
        const expensesRes = await fetch("http://localhost:5000/expenses");
        const expensesJson = await expensesRes.json();
        const normalizedData = expensesJson.map(expense => ({
          ...expense,
          month: expense.month.toLowerCase()
        }));
        setExpenseData(normalizedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false); // Set loading to false after API calls (success or error)
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Filtered donations based on year, month, and search term
  const filteredDonations = donationsData.filter((entry) => {
    const amount = entry.donations?.[selectedYear]?.[selectedMonth] ?? 0;
    const fullName = `${entry.name} ${entry.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.roll.toString().includes(searchTerm.toLowerCase());
    return amount > 0 && matchesSearch;
  });

  // Filtered expenses based on year, month, and search term
  const filteredExpenses = expenseData.filter(
    (expense) =>
      expense.year.toString() === selectedYear &&
      expense.month === selectedMonth &&
      expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display Loader component when loading is true
  if (loading) {
    return <Loader />;
  }

  return (
    <>
   
    <div className="min-h-screen bg-gray-100 py-4  px-6 lg:px-8 rounded-xl shadow-md">
    <FinanceSummary/>

      {/* Tabs */}
      <div className="flex justify-center mb-8 rounded-lg bg-gray-200 ">
        <button
          className={`w-1/2 px-6 py-3 rounded-md font-semibold transition-colors duration-200 ${
            activeTab === "donations"
              ? "bg-indigo-600 text-white shadow"
              : "bg-transparent text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => { setActiveTab("donations"); setSearchTerm(""); }}
        >
          Donations
        </button>
        <button
          className={`w-1/2 px-6 py-3 rounded-md font-semibold transition-colors duration-200 ${
            activeTab === "expense"
              ? "bg-indigo-600 text-white shadow"
              : "bg-transparent text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => { setActiveTab("expense"); setSearchTerm(""); }}
        >
          Expense
        </button>
      </div>

      {activeTab === "donations" && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
          {/* Filters for Donations */}
          <div className="px-4 py-5 bg-gray-50 sm:p-6 flex flex-wrap justify-center gap-4 items-center">
            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-full"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-full"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Search Input for Donations */}
            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <input
                type="text"
                placeholder="Search by name or roll no."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              />
            </div>
          </div>

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Roll No.
                  </th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((entry, idx) => {
                    const amount = entry.donations?.[selectedYear]?.[selectedMonth] ?? 0;
                    const fullName = `${entry.name} ${entry.last_name}`;
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-2 text-center py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.roll}</td>
                        <td className="px-2 text-center py-4 whitespace-nowrap text-sm text-gray-500">{fullName}</td>
                        <td className="px-2 text-center py-4  whitespace-nowrap text-sm text-gray-500">{amount}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No donation data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "expense" && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
          {/* Filters for Expenses */}
          <div className="px-4 py-5 bg-gray-50 sm:p-6 flex flex-wrap justify-center gap-4 items-center">
            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-full"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-full"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Search Input for Expenses */}
            <div className="relative rounded-md shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <input
                type="text"
                placeholder="Search by description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
              />
            </div>
          </div>

          {/* Expense Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.month.charAt(0).toUpperCase() + expense.month.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.amount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{expense.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No expense data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
     </>
  );
};

export default ManageFinance;