import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { AiOutlineClose } from "react-icons/ai";
import CustomPopup from "./Popup"; // Import your custom Popup component
import Loader from "./Loader"; // Import your Loader component
import Popup from "reactjs-popup"; // Keep this for the roll number selection modal
import "reactjs-popup/dist/index.css"; // Keep this for reactjs-popup base styles
import { theme } from '../theme'; // Import the theme

function ManageDonation() {
  const [activeTab, setActiveTab] = useState("add");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  
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
  
  // Dynamically set the default month to the current month name
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = months[currentMonthIndex];
  const [month, setMonth] = useState(currentMonthName);
  
  const [amount, setAmount] = useState("");
  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(null);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true); // Renamed from 'loading' for clarity
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  const years = Array.from(
    { length: 11 }, // Generates 11 years
    (_, i) => String(new Date().getFullYear() + i) // Starting from the current year
  );

  useEffect(() => {
    const fetchRolls = async () => {
      setIsLoading(true); // Start loading
      setPopupMessage(null); // Clear any previous messages
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        const rolls = [];
        querySnapshot.forEach((doc) => {
          rolls.push(doc.id);
        });
        setRollNumbers(rolls);
      } catch (err) {
        console.error("Error fetching rolls:", err);
        setPopupMessage("Failed to load roll numbers. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchRolls();
  }, []);

  const handleDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      setPopupMessage("Please fill all fields with a valid amount.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for submission
    setPopupMessage(null); // Clear previous popup messages
    const memberRef = doc(db, "members", selectedRoll);

    try {
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        setPopupMessage("Member not found.");
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      const data = memberSnap.data();
      const existingDonation = data.donation || {};
      const updatedDonation = { ...existingDonation };
      const donationAmount = parseInt(amount);

      if (!updatedDonation[year]) {
        updatedDonation[year] = {};
      }

      const currentMonthAmount = updatedDonation[year][month] || 0;
      updatedDonation[year][month] = currentMonthAmount + donationAmount;

      await updateDoc(memberRef, {
        donation: updatedDonation,
      });

      setPopupMessage("Donation added successfully.");
      setPopupType("success");
      setAmount("");
      setSelectedRoll(null);
    } catch (e) {
      console.error("Error adding donation:", e);
      setPopupMessage("Failed to add donation. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      setPopupMessage("Please fill all fields with a valid amount to delete.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for deletion
    setPopupMessage(null); // Clear previous popup messages
    const memberRef = doc(db, "members", selectedRoll);

    try {
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        setPopupMessage("Member not found.");
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      const data = memberSnap.data();
      const existingDonation = data.donation || {};
      const updatedDonation = { ...existingDonation };
      const amountToDelete = parseInt(amount);

      if (
        updatedDonation[year] &&
        updatedDonation[year][month] !== undefined
      ) {
        const currentMonthAmount = updatedDonation[year][month];
        updatedDonation[year][month] = Math.max(0, currentMonthAmount - amountToDelete);

        if (updatedDonation[year][month] === 0) {
          delete updatedDonation[year][month];
          if (Object.keys(updatedDonation[year]).length === 0) {
            delete updatedDonation[year];
          }
        }

        await updateDoc(memberRef, {
          donation: updatedDonation,
        });

        setPopupMessage("Donation updated successfully.");
        setPopupType("success");
        setSelectedRoll(null);
        setAmount("");
      } else {
        setPopupMessage("No donation found for the selected date.");
        setPopupType("error");
      }
    } catch (e) {
      console.error("Error deleting donation:", e);
      setPopupMessage("Failed to delete donation. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-10rem)] m-4 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center"
      style={{
        backgroundColor: theme.colors.neutralLight,
        fontFamily: theme.fonts.body,
      }}
    >
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

      <h2
        className="text-3xl font-extrabold mb-8 text-center"
        style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}
      >
        Manage Member Donations
      </h2>

      <div
        className="flex rounded-xl p-1 mb-8 shadow-sm"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "add" ? theme.colors.primary : "transparent",
            color:
              activeTab === "add"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "add" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "add") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "add") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Add Donation
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "delete" ? theme.colors.danger : "transparent",
            color:
              activeTab === "delete"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "delete" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.dangerLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "delete") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "delete") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          Delete Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
        <div className="relative">
          <label
            htmlFor="year-select"
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Select Year
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
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
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
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
            htmlFor="month-select"
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Select Month
          </label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
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
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
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

        <div className="md:col-span-2">
          <label
            htmlFor="amount-input"
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.primary }}
          >
            Enter Amount
          </label>
          <input
            id="amount-input"
            type="number"
            placeholder="e.g., 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              outlineColor: theme.colors.primary,
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg mb-6">
        <Popup
          trigger={
            <button
              className="w-full py-3 font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.neutralLight,
                "--tw-ring-color": theme.colors.primaryLight,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            >
              Select Roll Number: {selectedRoll || "None Selected"}
            </button>
          }
          modal
          nested
          contentStyle={{
            background: theme.colors.neutralLight,
            borderRadius: "0.75rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            width: "90%",
            maxWidth: "672px",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            margin: "auto",
            border: `1px solid ${theme.colors.primaryLight}`,
          }}
          overlayStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {(close) => (
            <div
              className="rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              <div
                className="flex items-start justify-between p-6 pb-3 border-b sticky top-0 z-10"
                style={{
                  backgroundColor: theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                }}
              >
                <h3
                  className="text-2xl font-bold flex-grow pr-4"
                  style={{ color: theme.colors.neutralDark }}
                >
                  Select Roll Number
                </h3>

                <button
                  onClick={close}
                  className="rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2"
                  style={{
                    color: theme.colors.primary,
                    outlineColor: theme.colors.primaryLight,
                  }}
                  aria-label="Close popup"
                >
                  <AiOutlineClose
                    className="text-2xl"
                    style={{ color: theme.colors.primary }}
                  />
                </button>
              </div>

              {rollNumbers.length === 0 && !isLoading ? (
                <p
                  className="text-center py-8 px-6"
                  style={{ color: theme.colors.primary }}
                >
                  No roll numbers available.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 p-6 overflow-y-auto flex-grow">
                  {rollNumbers
                    .sort((a, b) => Number(a) - Number(b)) // Sort roll numbers numerically
                    .map((roll) => (
                      <button
                        key={roll}
                        onClick={() => {
                          setSelectedRoll(roll);
                          close();
                        }}
                        className={`
                          flex items-center justify-center p-3 rounded-lg border-2
                          text-lg font-bold transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                        `}
                        style={{
                          backgroundColor: selectedRoll === roll
                            ? theme.colors.primary
                            : theme.colors.tertiaryLight,
                          color: selectedRoll === roll
                            ? theme.colors.neutralLight
                            : theme.colors.primary,
                          borderColor: selectedRoll === roll
                            ? theme.colors.primary
                            : theme.colors.primaryLight,
                          boxShadow: selectedRoll === roll
                            ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                            : "none",
                          transform: selectedRoll === roll
                            ? "scale(1.05)"
                            : "none",
                          "--tw-ring-color": theme.colors.primaryLight,
                        }}
                        onMouseEnter={(e) => {
                          if (selectedRoll !== roll) {
                            e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.color = theme.colors.neutralDark;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedRoll !== roll) {
                            e.currentTarget.style.backgroundColor = theme.colors.tertiaryLight;
                            e.currentTarget.style.borderColor = theme.colors.primaryLight;
                            e.currentTarget.style.color = theme.colors.primary;
                          }
                        }}
                      >
                        {roll}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </Popup>
      </div>

      <div className="w-full max-w-lg">
        {activeTab === "add" && (
          <button
            onClick={handleDonation}
            className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "add" ? "Adding..." : "Add Donation"}
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDeleteDonation}
            className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              backgroundColor: theme.colors.danger,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.dangerLight,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.dangerLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.danger}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "delete"
              ? "Deleting..."
              : "Delete Donation"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ManageDonation;
