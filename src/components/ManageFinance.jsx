import { useEffect, useState, useMemo, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import Summary from "./Summary";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from "../theme";
import { db } from "../firebase";

// Import for PDF generation
import html2pdf from "html2pdf.js";

import DownloadIcon from "@mui/icons-material/Download";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => String(currentYear - 5 + i));

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

export default function ManageFinance() {
  const [activeTab, setActiveTab] = useState("donation");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );

  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [donationFilter, setDonationFilter] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  // Use a ref to target the donation table for the PDF download
  const donationTableRef = useRef(null);

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
        const phoneNumber = member.phone_no || "N/A";

        donationList.push({
          roll: memberRoll,
          name: firstName,
          lastName: lastName,
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

  const fetchAllExpenses = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      let allExpensesList = [];

      if (!querySnapshot.empty) {
        const expenseDoc = querySnapshot.docs[0].data();

        for (const yearKey in expenseDoc) {
          if (Object.hasOwnProperty.call(expenseDoc, yearKey)) {
            const yearData = expenseDoc[yearKey];
            for (const monthKey in yearData) {
              if (Object.hasOwnProperty.call(yearData, monthKey)) {
                const monthExpenses = yearData[monthKey];
                if (Array.isArray(monthExpenses)) {
                  monthExpenses.forEach((expense) => {
                    const expenseWithMetadata = {
                      year: yearKey,
                      month: monthKey,
                      description: expense.description,
                      amount: expense.amount,
                    };
                    allExpensesList.push(expenseWithMetadata);
                  });
                }
              }
            }
          }
        }
      }
      setExpenses(allExpensesList);
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
      fetchAllExpenses();
    }
    setSearchTerm("");
  }, [activeTab, selectedYear, selectedMonth]);

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesFilter = (() => {
        if (donationFilter === 1) {
          return d.amount > 0;
        } else if (donationFilter === 2) {
          return d.amount === 0;
        }
        return true;
      })();

      const searchTermLower = searchTerm.toLowerCase();
      const fullName = `${d.name} ${d.lastName}`.trim();
      const matchesSearch =
        fullName.toLowerCase().includes(searchTermLower) ||
        d.roll.toLowerCase().includes(searchTermLower) ||
        d.phone.toLowerCase().includes(searchTermLower) ||
        String(d.amount).includes(searchTermLower);

      return matchesFilter && matchesSearch;
    });
  }, [donations, searchTerm, donationFilter]);

  const totalDonationAmount = useMemo(() => {
    return filteredDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
  }, [filteredDonations]);

  const filteredExpenses = expenses.filter((e) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      e.description?.toLowerCase().includes(searchTermLower) ||
      String(e.amount || "").includes(searchTermLower) ||
      String(e.year || "")
        .toLowerCase()
        .includes(searchTermLower) ||
      String(e.month || "")
        .toLowerCase()
        .includes(searchTermLower)
    );
  });

  const handleFilterClick = () => {
    setDonationFilter((prevFilter) => (prevFilter + 1) % 3);
  };

  const handleCopyNames = () => {
    const namesToCopy = filteredDonations
      .map((d) => `${d.name} ${d.lastName}`)
      .join(", ");

    // Check for clipboard support and use the deprecated execCommand if not available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(namesToCopy)
        .then(() => {
          setPopupMessage("Names copied to clipboard!");
          setPopupType("success");
        })
        .catch((err) => {
          console.error("Failed to copy names:", err);
          setPopupMessage("Failed to copy names. Please try again.");
          setPopupType("error");
        });
    } else {
      // Fallback for browsers that don't support the Clipboard API
      const el = document.createElement("textarea");
      el.value = namesToCopy;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setPopupMessage("Names copied to clipboard!");
        setPopupType("success");
      } catch (err) {
        console.error("Fallback failed to copy names:", err);
        setPopupMessage("Failed to copy names. Please try again.");
        setPopupType("error");
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const handleDownloadPdf = () => {
    setIsLoading(true);

    // Create a new element to render the PDF content, separate from the UI
    const pdfContent = document.createElement("div");

    // Add a header for the PDF with a title and the total amount
    const headerHtml = `
      <div style="background-color: ${theme.colors.primary}; color: white; padding: 16px; text-align: center; font-family: sans-serif;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Donation Report</h1>
        <p style="font-size: 16px; margin: 8px 0 0;">${selectedMonth} ${selectedYear}</p>
        <p style="font-size: 16px; margin: 4px 0 0;">Total Donations: <span style="font-weight: bold;">₹${totalDonationAmount}</span></p>
      </div>
    `;
    pdfContent.innerHTML += headerHtml;

    // Create the table for the PDF
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontFamily = "sans-serif";

    // Create table header
    const tableHeader = document.createElement("thead");
    tableHeader.innerHTML = `
      <tr style="background-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary};">
        <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">Roll No & Name</th>
        <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">Phone No</th>
        <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">Amount (₹)</th>
      </tr>
    `;
    table.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement("tbody");
    filteredDonations.forEach((donation, index) => {
      const row = document.createElement("tr");
      // Alternate row colors for better readability
      row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
      row.innerHTML = `
        <td style="padding: 12px; border: 1px solid #ddd; color: ${theme.colors.neutralDark};">
          <span style="font-weight: bold;">${donation.roll}</span><br>
          ${donation.name} ${donation.lastName}
        </td>
        <td style="padding: 12px; border: 1px solid #ddd; color: ${theme.colors.primary};">${donation.phone}</td>
        <td style="padding: 12px; border: 1px solid #ddd; color: ${theme.colors.success}; font-weight: bold;">${donation.amount}</td>
      `;
      tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    pdfContent.appendChild(table);

    // Add a wrapper to render the cloned element off-screen
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.top = "-10000px";
    hiddenContainer.appendChild(pdfContent);
    document.body.appendChild(hiddenContainer);

    // Define html2pdf options
    const opt = {
      margin: 0.5,
      filename: `Donations_${selectedMonth}_${selectedYear}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate the PDF from the newly created content
    html2pdf()
      .set(opt)
      .from(pdfContent)
      .save()
      .then(() => {
        // Cleanup after PDF generation is complete
        document.body.removeChild(hiddenContainer);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setPopupMessage("Failed to generate PDF. Please try again.");
        setPopupType("error");
        document.body.removeChild(hiddenContainer);
        setIsLoading(false);
      });
  };

  return (
    <div
      className="m-4 px-4 pb-8 flex flex-col items-center min-h-screen"
      style={{
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
              activeTab === "donation"
                ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                : "none",
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
                borderWidth: "1px",
                borderStyle: "solid",
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              disabled={isLoading}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
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
                borderWidth: "1px",
                borderStyle: "solid",
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              disabled={isLoading}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
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

      {activeTab === "donation" && (
        <div className="w-full max-w-2xl mb-8 flex items-center space-x-4">
          <div className="relative flex-grow">
            <label htmlFor="search-input" className="sr-only">
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
                borderWidth: "1px",
                borderStyle: "solid",
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
             focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center"
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
            <span className="flex items-center justify-center">
              <DownloadIcon style={{ fontSize: 20 }} />
            </span>
          </button>
        </div>
      )}

      {activeTab === "expense" && (
        <div className="w-full max-w-2xl mb-8 relative">
          <label htmlFor="search-input-expense" className="sr-only">
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
              borderWidth: "1px",
              borderStyle: "solid",
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
          ref={donationTableRef}
          className="w-full max-w-2xl rounded-xl shadow-md overflow-hidden border"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="overflow-x-auto">
            <table
              className="min-w-full text-sm divide-y table-fixed"
              style={{ borderColor: theme.colors.primaryLight }}
            >
              <thead style={{ backgroundColor: theme.colors.tertiaryLight }}>
                <tr
                  style={{
                    borderBottomWidth: "1px",
                    borderBottomColor: theme.colors.primaryLight,
                  }}
                >
                  <th
                    scope="col"
                    colSpan="3"
                    className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.primary }}
                  >
                    Total Donation for {selectedMonth} {selectedYear}:{" "}
                    <span style={{ color: theme.colors.success }}>
                      ₹{totalDonationAmount}
                    </span>
                  </th>
                </tr>
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-2 w-[120px] text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.primary, cursor: "pointer" }}
                    onDoubleClick={handleCopyNames}
                    title="Double-click to copy names"
                  >
                    Roll No & Name
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 w-[100px] text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.primary }}
                  >
                    Phone No
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 w-[80px] text-left text-xs font-semibold uppercase tracking-wider overflow-hidden"
                    style={{ color: theme.colors.primary }}
                  >
                    <div className="flex flex-col items-center">
                      <span>Amount</span>
                      <button
                        onClick={handleFilterClick}
                        className="mt-1 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50"
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                          </svg>
                        )}
                        {donationFilter === 1 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {donationFilter === 2 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z"
                            />
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
                      style={{
                        "--tw-bg-opacity": 1,
                        backgroundColor: theme.colors.neutralLight,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.tertiaryLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.neutralLight)
                      }
                    >
                      <td
                        className="px-2 py-2 w-[120px] font-medium overflow-hidden"
                        style={{ color: theme.colors.neutralDark }}
                      >
                        <span className="font-bold">{d.roll}</span> <br />
                        {d.name} <br />
                        {d.lastName}
                      </td>
                      <td
                        className="px-2 py-2 w-[100px] overflow-hidden"
                        style={{ color: theme.colors.primary }}
                      >
                        {d.phone}
                      </td>
                      <td
                        className="px-2 text-center py-2 w-[80px] font-bold overflow-hidden"
                        style={{ color: theme.colors.success }}
                      >
                        {d.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-4 text-center italic"
                      style={{ color: theme.colors.primary }}
                      colSpan="3"
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
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          {/* This div now enables horizontal scrolling if the table content overflows */}
          <div className="overflow-x-auto">
            <table
              className="min-w-full text-sm divide-y"
              style={{ borderColor: theme.colors.primaryLight }}
            >
              <thead style={{ backgroundColor: theme.colors.tertiaryLight }}>
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider overflow-hidden min-w-[90px] w-[90px]"
                    style={{ color: theme.colors.primary }}
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider overflow-hidden min-w-[90px] w-[90px]"
                    style={{ color: theme.colors.primary }}
                  >
                    Month
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider overflow-hidden min-w-[250px] w-full"
                    style={{ color: theme.colors.primary }}
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider overflow-hidden min-w-[100px] w-[100px]"
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
                      style={{
                        "--tw-bg-opacity": 1,
                        backgroundColor: theme.colors.neutralLight,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.tertiaryLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.neutralLight)
                      }
                    >
                      <td
                        className="px-2 py-2 font-medium overflow-hidden whitespace-nowrap align-top"
                        style={{ color: theme.colors.primary }}
                      >
                        {e.year}
                      </td>
                      <td
                        className="px-2 py-2 font-medium overflow-hidden whitespace-nowrap align-top"
                        style={{ color: theme.colors.primary }}
                      >
                        {e.month}
                      </td>
                      <td
                        className="px-2 py-2 font-medium overflow-hidden align-top"
                        style={{
                          color: theme.colors.primary,
                          whiteSpace: "normal",
                        }}
                      >
                        {e.description}
                      </td>
                      <td
                        className="px-2 py-2 font-bold overflow-hidden whitespace-nowrap align-top"
                        style={{ color: theme.colors.danger }}
                      >
                        {e.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-4 text-center italic"
                      style={{ color: theme.colors.primary }}
                      colSpan="4"
                    >
                      {isLoading
                        ? "Loading expenses..."
                        : "No expense data available."}
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
