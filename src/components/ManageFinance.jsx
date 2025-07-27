import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Summary from "./Summary";
import Loader from "./Loader"; // Import your Loader component
import CustomPopup from "./Popup"; // Import your custom Popup component

// Dynamically generate years for consistency with other components
const years = Array.from({ length: 2 }, (_, i) => String(new Date().getFullYear() + i));
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ManageFinance() {
  const [activeTab, setActiveTab] = useState("donation");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState("July");

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  // --- Functions to fetch data from Firebase ---

  const fetchDonations = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const donationList = [];

      querySnapshot.forEach((docSnap) => {
        const member = docSnap.data();
        const memberRoll = docSnap.id; // Use doc.id for roll number

        // Access donation data using selectedYear and selectedMonth
        const donationData = member?.donation?.[selectedYear]?.[selectedMonth];
        let amount = 0;

        if (typeof donationData === "number") {
          amount = donationData;
        } else if (Array.isArray(donationData)) {
          // This case might not be needed if donation amounts are always summed up to a single number
          // as handled in ManageDonation. If individual donations are stored in an array,
          // then this logic is correct to sum them.
          amount = donationData.reduce((sum, val) => sum + Number(val || 0), 0);
        }

        if (amount > 0) {
          donationList.push({
            roll: memberRoll,
            name: member.name || "Unknown", // Assuming 'name' field exists in member document
            amount: amount,
          });
        }
      });
      setDonations(donationList);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setPopupMessage("Failed to load donations. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      let expensesList = [];

      // Assuming 'expenses' collection has one document storing all expenses,
      // similar to how ManageExpense handles it.
      if (!querySnapshot.empty) {
        const expenseDoc = querySnapshot.docs[0].data();
        expensesList = expenseDoc?.[selectedYear]?.[selectedMonth] || [];
      }
      setExpenses(expensesList);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setPopupMessage("Failed to load expenses. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "donation") {
      fetchDonations();
    } else {
      fetchExpenses();
    }
  }, [activeTab, selectedYear, selectedMonth]);


  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      {/* Conditionally render Loader */}
      {isLoading && <Loader />}

      {/* Conditionally render Custom Popup */}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)} // Close popup by clearing message
        />
      )}

      {/* Summary component - Assuming it handles its own data fetching or receives props */}
      <Summary />

      {/* Tabs - Styled like ManageAttendance/Donation */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("donation")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "donation" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
          disabled={isLoading} // Disable button when loading
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "expense" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
          disabled={isLoading} // Disable button when loading
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
            disabled={isLoading} // Disable select when loading
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
            disabled={isLoading} // Disable select when loading
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
                    {isLoading ? "Loading donations..." : "No donation data available for selected period."}
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
                    {isLoading ? "Loading expenses..." : "No expense data available for selected period."}
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