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

function ManageDonation() {
  const [activeTab, setActiveTab] = useState("add");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState("July");
  const [amount, setAmount] = useState("");
  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(null);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true); // Renamed from 'loading' for clarity
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

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
  const years = Array.from(
    { length: 2 },
    (_, i) => String(new Date().getFullYear() + i)
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
        setPopupMessage("No donation found for the selected date to subtract from.");
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

      {/* LoadData seems to be for global loading, removed its local rendering */}
      {/* <LoadData /> */}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Manage Member Donations
      </h2>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${
              activeTab === "add"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-200"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Add Donation
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${
              activeTab === "delete"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-200"
            }
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Delete Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
        <div className="relative">
          <label
            htmlFor="year-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Year
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Month
          </label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter Amount
          </label>
          <input
            id="amount-input"
            type="number"
            placeholder="e.g., 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* Original loading and error messages replaced by custom Loader and Popup */}

      <div className="w-full max-w-lg mb-6">
        <Popup
          trigger={
            <button className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75">
              Select Roll Number: {selectedRoll || "None Selected"}
            </button>
          }
          modal
          nested
          contentStyle={{
            background: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            width: "90%",
            maxWidth: "672px",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            margin: "auto",
          }}
          overlayStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {(close) => (
            <div className="bg-white rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative">
              <div className="flex items-start justify-between p-6 pb-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-gray-800 flex-grow pr-4">
                  Select Roll Number
                </h3>

                <button
                  onClick={close}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
                  aria-label="Close popup"
                >
                  <AiOutlineClose className="text-2xl text-gray-600 hover:text-gray-800" />

                </button>
              </div>

              {rollNumbers.length === 0 && !isLoading ? (
                <p className="text-gray-500 text-center py-8 px-6">
                  No roll numbers available.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 p-6 overflow-y-auto flex-grow">
                  {rollNumbers.map((roll) => (
                    <button
                      key={roll}
                      onClick={() => {
                        setSelectedRoll(roll);
                        close();
                      }}
                      className={`
                          flex items-center justify-center p-3 rounded-lg border-2
                          text-lg font-bold transition-all duration-200 ease-in-out
                          ${
                            selectedRoll === roll
                              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                              : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                          }
                          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                        `}
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
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && activeTab === "add" ? "Adding..." : "Add Donation"}
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDeleteDonation}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
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