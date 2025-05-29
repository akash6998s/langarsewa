import React, { useEffect, useState } from 'react';
import Loader from "./Loader";

const FinanceSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:5000/summary/financial');
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
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">Financial Overview</h2>
      <div className="space-y-6 text-xl">
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

    </div>
  );
};

export default FinanceSummary;