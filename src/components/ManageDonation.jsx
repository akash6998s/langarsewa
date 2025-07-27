import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import LoadData from "./LoadData";

function ManageDonation() {
  const [activeTab, setActiveTab] = useState("add");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState("July");
  const [amount, setAmount] = useState("");
  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 2 }, (_, i) => String(new Date().getFullYear() + i));

  useEffect(() => {
    const fetchRolls = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        const rolls = [];
        querySnapshot.forEach((doc) => {
          rolls.push(doc.id);
        });
        setRollNumbers(rolls);
      } catch (err) {
        console.error("Error fetching rolls:", err);
        setError("Failed to load roll numbers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRolls();
  }, []);

  const handleDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      alert("Please fill all fields with a valid amount.");
      return;
    }

    const memberRef = doc(db, "members", selectedRoll);
    try {
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        alert("Member not found.");
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

      alert("Donation added successfully.");
      setAmount("");
      setSelectedRoll(null);
    } catch (e) {
      console.error("Error adding donation:", e);
      alert("Failed to add donation. Please try again.");
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedRoll || !year || !month || amount === "" || isNaN(parseInt(amount))) {
      alert("Please fill all fields with a valid amount to delete.");
      return;
    }

    const memberRef = doc(db, "members", selectedRoll);
    try {
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        alert("Member not found.");
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

        alert("Donation updated successfully.");
        setSelectedRoll(null);
        setAmount("");
      } else {
        alert("No donation found for the selected date to subtract from.");
      }
    } catch (e) {
      console.error("Error deleting donation:", e);
      alert("Failed to delete donation. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      <LoadData />

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Manage Member Donations</h2>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "add" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Add Donation
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${activeTab === "delete" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Delete Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
        <div className="relative">
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="amount-input" className="block text-sm font-medium text-gray-700 mb-1">Enter Amount</label>
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

      {loading && (
        <div className="text-center text-blue-600 font-medium mb-4">Loading roll numbers...</div>
      )}
      {error && (
        <div className="text-center text-red-600 font-medium mb-4">{error}</div>
      )}

      <div className="w-full max-w-lg mb-6">
        <Popup
          trigger={
            <button
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75"
            >
              Select Roll Number: {selectedRoll || "None Selected"}
            </button>
          }
          modal
          nested
          contentStyle={{
            background: 'white',
            borderRadius: '0.75rem', /* rounded-xl */
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', /* shadow-2xl */
            width: '90%', // Still responsive, takes 90% of parent width
            maxWidth: '672px', // **Changed from 400px (md) to 672px (2xl)**
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            margin: 'auto'
          }}
          overlayStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {(close) => (
            <div className="bg-white rounded-xl shadow-2xl p-0 md:p-0 max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col relative"> {/* **Changed max-w-md to max-w-2xl** */}
              <div className="flex items-start justify-between p-6 pb-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-gray-800 flex-grow pr-4">
                  Select Roll Number
                </h3>
                
                <button
                  onClick={() => close()}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
                  aria-label="Close popup"
                >
                  <span className="material-icons text-3xl">close</span>
                </button>
              </div>

              {rollNumbers.length === 0 && !loading ? (
                  <p className="text-gray-500 text-center py-8 px-6">No roll numbers available.</p>
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
                            ${selectedRoll === roll
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
          >
            Add Donation
          </button>
        )}

        {activeTab === "delete" && (
          <button
            onClick={handleDeleteDonation}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Delete Donation
          </button>
        )}
      </div>
    </div>
  );
}

export default ManageDonation;