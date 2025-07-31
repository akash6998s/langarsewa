import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import Summary from "./Summary";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from '../theme';
import { db } from "../firebase"; // Ensure db is imported from firebase.js

// Import jsPDF and applyPlugin from jspdf-autotable
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply the plugin to jsPDF. This makes .autoTable() available on jsPDF instances.
applyPlugin(jsPDF);

// Import the DownloadIcon from MUI
import DownloadIcon from '@mui/icons-material/Download';

// Dynamically generate years for consistency with other components
const currentYear = new Date().getFullYear();
// CHANGE THIS LINE:
const years = Array.from({ length: 11 }, (_, i) => String(2025 + i)); // From 2025 to 2035 (11 years total)
// Previously: const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ManageFinance() {
  const [activeTab, setActiveTab] = useState("donation");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  // Set initial month to the current month for a more relevant default view
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]); // This will now hold all expenses with year/month info
  // State for donation filter: 0 = show all, 1 = show paid, 2 = show unpaid
  const [donationFilter, setDonationFilter] = useState(0);

  // New state for search input
  const [searchTerm, setSearchTerm] = useState("");

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
        const memberRoll = docSnap.id;

        const donationData = member?.donation?.[selectedYear]?.[selectedMonth];
        let amount = 0;

        if (typeof donationData === "number") {
          amount = donationData;
        } else if (Array.isArray(donationData)) {
          amount = donationData.reduce((sum, val) => sum + Number(val || 0), 0);
        }

        const firstName = member.name || "";
        const lastName = member.last_name || "";
        const fullName = (firstName + " " + lastName).trim();
        const phoneNumber = member.phone_no || "N/A";

        donationList.push({
          roll: memberRoll,
          name: fullName || "Unknown",
          phone: phoneNumber,
          amount: amount,
        });
      });

      donationList.sort((a, b) => {
        const rollA = parseInt(a.roll, 10);
        const rollB = parseInt(b.roll, 10);

        if (isNaN(rollA) || isNaN(rollB)) {
          return a.roll.localeCompare(b.roll);
        }
        return rollA - rollB;
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

  // Modified fetchAllExpenses to correctly include year and month in each expense object
  const fetchAllExpenses = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      let allExpensesList = [];

      if (!querySnapshot.empty) {
        const expenseDoc = querySnapshot.docs[0].data(); // Assuming one document holds all expenses

        for (const yearKey in expenseDoc) {
          if (Object.hasOwnProperty.call(expenseDoc, yearKey)) {
            const yearData = expenseDoc[yearKey];
            for (const monthKey in yearData) {
              if (Object.hasOwnProperty.call(yearData, monthKey)) {
                const monthExpenses = yearData[monthKey];
                if (Array.isArray(monthExpenses)) {
                  monthExpenses.forEach(expense => {
                    const expenseWithMetadata = {
                      year: yearKey,
                      month: monthKey,
                      description: expense.description,
                      amount: expense.amount
                    };
                    allExpensesList.push(expenseWithMetadata);
                    // Add console.log here to inspect each item before it's added
                    console.log("Adding expense:", expenseWithMetadata);
                  });
                }
              }
            }
          }
        }
      }
      setExpenses(allExpensesList);
      // Also log the final list for review
      console.log("Final expenses list loaded:", allExpensesList);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setPopupMessage("Failed to load expenses. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch data whenever the active tab, selected year, or selected month changes
  useEffect(() => {
    if (activeTab === "donation") {
      fetchDonations();
    } else {
      fetchAllExpenses();
    }
    setSearchTerm("");
  }, [activeTab, selectedYear, selectedMonth]);

  // Filtered donations based on donationFilter state AND search term
  const filteredDonations = donations.filter(d => {
    const matchesFilter = (() => {
      if (donationFilter === 1) {
        return d.amount > 0;
      } else if (donationFilter === 2) {
        return d.amount === 0;
      }
      return true;
    })();

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(searchTermLower) ||
      d.roll.toLowerCase().includes(searchTermLower) ||
      d.phone.toLowerCase().includes(searchTermLower) ||
      String(d.amount).includes(searchTermLower);

    return matchesFilter && matchesSearch;
  });

  // Filtered expenses based on search term, now searching across all relevant columns
  const filteredExpenses = expenses.filter(e => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      e.description?.toLowerCase().includes(searchTermLower) || // Added optional chaining in case desc is missing
      String(e.amount || '').includes(searchTermLower) ||       // Added empty string fallback for amount
      String(e.year || '').toLowerCase().includes(searchTermLower) ||
      String(e.month || '').toLowerCase().includes(searchTermLower)
    );
  });

  // Function to handle filter button click
  const handleFilterClick = () => {
    setDonationFilter(prevFilter => (prevFilter + 1) % 3); // Cycle through 0, 1, 2
  };

  // Function to handle double-click on Name header
  const handleCopyNames = () => {
    const namesToCopy = filteredDonations.map(d => d.name).join(',');
    navigator.clipboard.writeText(namesToCopy)
      .then(() => {
        setPopupMessage('Names copied to clipboard!');
        setPopupType('success');
      })
      .catch(err => {
        console.error('Failed to copy names:', err);
        setPopupMessage('Failed to copy names. Please try again.');
        setPopupType('error');
      });
  };

  // --- Function to download PDF of filtered donations ---
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    const title = `Donation Report - ${selectedMonth} ${selectedYear}`;
    const headers = [["Roll Number", "Name", "Phone Number", "Amount (₹)"]];
    const data = filteredDonations.map(d => [d.roll, d.name, d.phone, d.amount]);

    doc.setFontSize(16);
    doc.text(title, 14, 20);

    doc.autoTable({
      startY: 30, // Start table below title
      head: headers,
      body: data,
      theme: 'grid', // 'striped', 'grid', 'plain'
      headStyles: {
        fillColor: theme.colors.primary, // Using your theme color
        textColor: theme.colors.neutralLight,
        fontStyle: 'bold',
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: theme.colors.primary,
      },
      bodyStyles: {
        fillColor: theme.colors.neutralLight,
      },
      alternateRowStyles: {
        fillColor: theme.colors.tertiaryLight,
      },
    });

    doc.save(`Donations_${selectedMonth}_${selectedYear}.pdf`);
  };


  return (
    <div class="rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center w-[90vw] min-h-screen" 
      style={{
        backgroundColor: theme.colors.neutralLight,
        fontFamily: theme.fonts.body,
      }}
    >
      {isLoading && <Loader />}

      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}

      <Summary />

      <div
        className="flex rounded-xl p-1 my-8 shadow-sm max-w-sm w-full"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setActiveTab("donation")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "donation" ? theme.colors.primary : "transparent",
            color:
              activeTab === "donation"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "donation" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "donation") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "donation") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading}
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "expense" ? theme.colors.danger : "transparent",
            color:
              activeTab === "expense"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "expense" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.dangerLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "expense") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "expense") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading}
        >
          Expenses
        </button>
      </div>

      {/* Conditionally render Year/Month selectors */}
      {activeTab === "donation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
          <div className="relative">
            <label
              htmlFor="finance-year-select"
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Select Year
            </label>
            <select
              id="finance-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              disabled={isLoading}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
              style={{ color: theme.colors.primary }}
            >
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <label
              htmlFor="finance-month-select"
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Select Month
            </label>
            <select
              id="finance-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              disabled={isLoading}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
              style={{ color: theme.colors.primary }}
            >
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      )}


      {/* Search Input Field and Download Button for Donations */}
      {activeTab === "donation" && (
        <div className="w-full max-w-2xl mb-8 flex items-center space-x-4">
          <div className="relative flex-grow">
            <label
              htmlFor="search-input"
              className="sr-only"
            >
              Search Donations
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: theme.colors.primary }}
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search-input"
              className="block w-full py-3 pl-10 pr-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              placeholder="Search donations by name, roll, phone, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out shadow-md
            focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center whitespace-nowrap"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
            }}
            disabled={isLoading || filteredDonations.length === 0}
            title="Download PDF of filtered donations"
          >
            <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
            Download PDF
          </button>
        </div>
      )}

      {/* Search input for Expenses (always visible on this tab, no download button) */}
      {activeTab === "expense" && (
        <div className="w-full max-w-lg mb-8 relative">
          <label
            htmlFor="search-input-expense"
            className="sr-only"
          >
            Search Expenses
          </label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              style={{ color: theme.colors.primary }}
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="search-input-expense"
            className="block w-full py-3 pl-10 pr-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              outlineColor: theme.colors.primary,
              "--tw-ring-color": theme.colors.primary,
            }}
            placeholder="Search expenses by year, month, description, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}


      {activeTab === "donation" && (
        <div
          className="w-full max-w-2xl rounded-xl shadow-md overflow-hidden border"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y" style={{ borderColor: theme.colors.primaryLight }}>
              <thead style={{ backgroundColor: theme.colors.tertiaryLight }}>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Roll Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary, cursor: 'pointer' }}
                    onDoubleClick={handleCopyNames}
                    title="Double-click to copy names"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    <div className="flex items-center">
                      Amount (₹)
                      <button
                        onClick={handleFilterClick}
                        className="ml-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: theme.colors.neutralLight,
                          "--tw-ring-color": theme.colors.primaryLight,
                        }}
                        title={
                          donationFilter === 0
                            ? "Show Paid"
                            : donationFilter === 1
                            ? "Show Unpaid"
                            : "Show All"
                        }
                      >
                        {donationFilter === 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        )}
                        {donationFilter === 1 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {donationFilter === 2 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: theme.colors.primaryLight }}
              >
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((d, index) => (
                    <tr
                      key={index}
                      className="transition-colors duration-150 ease-in-out"
                      style={{ '--tw-bg-opacity': 1, backgroundColor: theme.colors.neutralLight, }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.tertiaryLight}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutralLight}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap font-medium"
                        style={{ color: theme.colors.neutralDark }}
                      >
                        {d.roll}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: theme.colors.primary }}
                      >
                        {d.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: theme.colors.primary }}
                      >
                        {d.phone}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap font-bold"
                        style={{ color: theme.colors.success }}
                      >
                        {d.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-center italic"
                      style={{ color: theme.colors.primary }}
                      colSpan="4"
                    >
                      {isLoading ? "Loading donations..." : "No members found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "expense" && (
        <div
          className="w-full max-w-2xl rounded-xl shadow-md overflow-hidden border"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y" style={{ borderColor: theme.colors.primaryLight }}>
              <thead style={{ backgroundColor: theme.colors.tertiaryLight }}>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Month
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: theme.colors.primary }}
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: theme.colors.primaryLight }}
              >
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((e, index) => (
                    <tr
                      key={index}
                      className="transition-colors duration-150 ease-in-out"
                      style={{ '--tw-bg-opacity': 1, backgroundColor: theme.colors.neutralLight, }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.tertiaryLight}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutralLight}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {e.year}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {e.month}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {e.description}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap font-bold"
                        style={{ color: theme.colors.danger }}
                      >
                        {e.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-center italic"
                      style={{ color: theme.colors.primary }}
                      colSpan="4"
                    >
                      {isLoading ? "Loading expenses..." : "No expense data available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}