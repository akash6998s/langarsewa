import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'; // Added collection, getDocs
import { db } from '../firebase';
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your custom Popup component

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Summary() {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading
      setPopupMessage(null); // Clear any previous messages

      let calculatedTotalExpense = 0;
      let calculatedTotalDonation = 0;
      const currentYear = new Date().getFullYear().toString();

      // --- 1. Get Total Expense from Firebase ---
      try {
        const expenseDocRef = doc(db, "expenses", "hPTZ3pkljqT2yuiKLDA3"); // Hardcoded ID from original
        const expenseDocSnap = await getDoc(expenseDocRef);

        if (expenseDocSnap.exists()) {
          const expenseData = expenseDocSnap.data();
          if (expenseData[currentYear]) {
            months.forEach(month => {
              if (expenseData[currentYear][month] && Array.isArray(expenseData[currentYear][month])) {
                expenseData[currentYear][month].forEach(expenseItem => {
                  if (expenseItem.amount) {
                    calculatedTotalExpense += Number(expenseItem.amount);
                  }
                });
              }
            });
          }
        } else {
          console.log("No Firebase expense document found at expenses/hPTZ3pkljqT2yuiKLDA3 for current year/months. This might be expected if no expenses are logged yet.");
        }
      } catch (e) {
        console.error("Error fetching Firebase expense data: ", e);
        setPopupMessage("Failed to load expenses.");
        setPopupType("error");
      }

      // --- 2. Get Total Donation from Firebase (from all members) ---
      // This replaces the localStorage.getItem("allMembers") for donations
      try {
        const membersCollectionRef = collection(db, "members");
        const querySnapshot = await getDocs(membersCollectionRef);

        querySnapshot.forEach((docSnap) => {
          const memberData = docSnap.data();
          if (memberData.donation && memberData.donation[currentYear]) {
            months.forEach(month => {
              if (memberData.donation[currentYear][month]) {
                calculatedTotalDonation += Number(memberData.donation[currentYear][month]);
              }
            });
          }
        });
      } catch (e) {
        console.error("Error fetching Firebase donation data from members: ", e);
        setPopupMessage(prev => (prev ? prev + " Failed to load donations." : "Failed to load donations."));
        setPopupType("error");
      } finally {
        // --- Calculate Remaining Amount ---
        setTotalExpense(calculatedTotalExpense);
        setTotalDonation(calculatedTotalDonation);
        setRemainingAmount(calculatedTotalDonation - calculatedTotalExpense);

        setIsLoading(false); // End loading regardless of success or failure
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  const remainingAmountColorClass = remainingAmount >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-6 sm:p-8 font-sans flex flex-col items-center max-w-2xl mx-auto">
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

      {/* Removed LoadData component */}

      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Financial Summary</h1>

      {/* Only render content if not loading and no critical error popup is active */}
      {!isLoading && popupType !== 'error' && (
        <div className="w-full space-y-4">
          {/* Total Donations Card */}
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 flex justify-between items-center border border-blue-200">
            <strong className="text-gray-700 text-lg">Total Donations ({new Date().getFullYear()}):</strong>
            <span className="text-2xl font-bold text-green-600">₹{totalDonation.toFixed(2)}</span>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-red-50 rounded-lg shadow-sm p-4 flex justify-between items-center border border-red-200">
            <strong className="text-gray-700 text-lg">Total Expenses ({new Date().getFullYear()}):</strong>
            <span className="text-2xl font-bold text-red-600">₹{totalExpense.toFixed(2)}</span>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Remaining Amount Card */}
          <div className={`rounded-lg shadow-md p-4 flex justify-between items-center border-l-4
                           ${remainingAmount >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <strong className="text-gray-800 text-xl">Remaining Amount:</strong>
            <span className={`text-3xl font-extrabold ${remainingAmountColorClass}`}>₹{remainingAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
      {/* Show a message if no data could be loaded due to an error */}
      {!isLoading && popupType === 'error' && (
          <p className="text-center text-gray-600 text-xl font-medium mt-4">
            Could not load financial data. Please check your connection or try again later.
          </p>
      )}
    </div>
  );
}