import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoadData from './LoadData';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Summary() {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let calculatedTotalExpense = 0;
      let calculatedTotalDonation = 0;
      const currentYear = new Date().getFullYear().toString();

      // --- 1. Get Total Expense from Firebase ---
      // IMPORTANT: The original code was hardcoding a specific document ID ("hPTZ3pkljqT2yuiKLDA3").
      // If expenses are stored per year/month in a single document, this might need adjustment
      // to iterate through the correct structure. Assuming the single document structure from your code.
      try {
        const expenseDocRef = doc(db, "expenses", "hPTZ3pkljqT2yuiKLDA3");
        const expenseDocSnap = await getDoc(expenseDocRef);

        if (expenseDocSnap.exists()) {
          const expenseData = expenseDocSnap.data();
          // Iterate through all months for the current year in this Firebase document
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
          console.log("No Firebase expense document found at expenses/hPTZ3pkljqT2yuiKLDA3 for current year/months.");
        }
      } catch (e) {
        console.error("Error fetching Firebase expense data: ", e);
        setError("Failed to load Firebase expenses.");
      }

      // --- 2. Get Total Expense from local Storage ---
      // Note: If Firebase is the primary source, local storage might be redundant or for offline caching.
      // Ensure data consistency if using both.
      try {
        const localExpensesString = localStorage.getItem("expenses");
        if (localExpensesString) {
          const localExpenses = JSON.parse(localExpensesString);

          if (localExpenses[currentYear]) {
            months.forEach(month => {
              if (localExpenses[currentYear][month] && Array.isArray(localExpenses[currentYear][month])) {
                localExpenses[currentYear][month].forEach(expenseItem => {
                  if (expenseItem.amount) {
                    calculatedTotalExpense += Number(expenseItem.amount);
                  }
                });
              }
            });
          }
        } else {
          console.log("No 'expenses' data found in local storage.");
        }
      } catch (e) {
        console.error("Error parsing or calculating local storage expenses: ", e);
        setError(prev => (prev ? prev + " Failed to load local expenses." : "Failed to load local expenses."));
      }
      setTotalExpense(calculatedTotalExpense);

      // --- 3. Get Total Donation from local Storage ---
      // Note: Donations are currently only from local storage in this component.
      // If donations are also in Firebase, you'd need to fetch them similarly.
      try {
        const allMembersString = localStorage.getItem("allMembers");
        if (allMembersString) {
          const allMembers = JSON.parse(allMembersString);

          allMembers.forEach(member => {
            if (member.donation && member.donation[currentYear]) {
              months.forEach(month => {
                if (member.donation[currentYear][month]) {
                  calculatedTotalDonation += Number(member.donation[currentYear][month]);
                }
              });
            }
          });
        } else {
          console.log("No 'allMembers' data found in local storage.");
        }
      } catch (e) {
        console.error("Error parsing or calculating donation data from local storage: ", e);
        setError(prev => (prev ? prev + " Failed to load donations." : "Failed to load donations."));
      } finally {
        setTotalDonation(calculatedTotalDonation);

        // --- Calculate Remaining Amount ---
        setRemainingAmount(calculatedTotalDonation - calculatedTotalExpense);

        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  const remainingAmountColorClass = remainingAmount >= 0 ? 'text-green-600' : 'text-red-600';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg font-sans text-blue-600 font-medium">
        Loading finance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-300 rounded-xl shadow-lg font-sans text-red-700 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className=" bg-white p-6 sm:p-8 font-sans flex flex-col items-center max-w-2xl mx-auto">
      <LoadData /> {/* Global loading indicator */}

      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Financial Summary</h1>

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

    </div>
  );
}