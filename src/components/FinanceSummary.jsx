import React, { useEffect, useState } from 'react';
import Loader from "./Loader";

const FinanceSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('https://langarsewa-db.onrender.com/summary/financial');
        if (!response.ok) {
          throw new Error('Failed to fetch financial summary');
        }
        const data = await response.json();
        setSummary(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) return <p className="text-center text-red-500 font-medium text-lg mt-8">{error}</p>;

  return (
    <div className="max-w-lg mx-auto p-8 mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-xl border border-blue-200">
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex justify-center items-center cursor-pointer select-none"
        aria-expanded={showDetails}
        aria-controls="financial-details"
      >
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight mr-3">
          Financial Overview
        </h2>
        <svg
          className={`w-8 h-8 text-gray-700 transform transition-transform duration-300 ${
            showDetails ? 'rotate-90' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>

      {showDetails && summary && (
        <div
          id="financial-details"
          className="space-y-6 text-xl mt-8"
        >
          <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-green-100">
            <p className="font-semibold text-gray-700">Total Donations:</p>
            <p className="font-bold text-green-700 text-2xl">₹{summary.totalDonations.toLocaleString()}</p>
          </div>

          <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-red-100">
            <p className="font-semibold text-gray-700">Total Expenses:</p>
            <p className="font-bold text-red-700 text-2xl">₹{summary.totalExpenses.toLocaleString()}</p>
          </div>

          <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-blue-100">
            <p className="font-semibold text-gray-700">Remaining Amount:</p>
            <p className={`font-bold text-2xl ${summary.remainingAmount >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              ₹{summary.remainingAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSummary;
