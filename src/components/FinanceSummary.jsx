import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { theme } from ".././theme";

const FinanceSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("https://langarsewa-db.onrender.com/summary/financial");
        if (!response.ok) {
          throw new Error("Failed to fetch financial summary");
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

  if (error)
    return (
      <p
        className="text-center font-semibold mt-8"
        style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
      >
        {error}
      </p>
    );

  return (
    <div
      className="max-w-lg mx-auto p-8 mb-12 rounded-2xl shadow-lg border"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #fff9e5 100%)`,
        borderColor: theme.colors.primaryLight,
        fontFamily: theme.fonts.body,
      }}
    >
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex justify-center items-center cursor-pointer select-none mb-6"
        aria-expanded={showDetails}
        aria-controls="financial-details"
      >
        <h2
          className="text-3xl font-extrabold tracking-wide mr-3"
          style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
        >
          Financial Overview
        </h2>
        <svg
          className={`w-8 h-8 text-${theme.colors.primary} transform transition-transform duration-300 ${
            showDetails ? "rotate-90" : "rotate-0"
          }`}
          fill="none"
          stroke={theme.colors.primary}
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
          className="space-y-6 text-xl"
          style={{ fontFamily: theme.fonts.body, color: theme.colors.neutralDark }}
        >
          <div
            className="flex justify-between items-center p-6 rounded-xl shadow-md border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.secondaryLight,
              boxShadow: `0 4px 6px -1px ${theme.colors.secondaryLight}`,
            }}
          >
            <p className="font-semibold" style={{ color: theme.colors.secondary }}>
              Total Donations:
            </p>
            <p
              className="font-extrabold text-3xl"
              style={{ color: theme.colors.secondary }}
            >
              ₹{(summary.totalDonations + summary.otherAmount).toLocaleString()}
            </p>
          </div>

          <div
            className="flex justify-between items-center p-6 rounded-xl shadow-md border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.accent,
              boxShadow: `0 4px 6px -1px ${theme.colors.accent}66`,
            }}
          >
            <p className="font-semibold" style={{ color: theme.colors.accent }}>
              Total Expenses:
            </p>
            <p className="font-extrabold text-3xl" style={{ color: theme.colors.accent }}>
              ₹{summary.totalExpenses.toLocaleString()}
            </p>
          </div>

          <div
            className="flex justify-between items-center p-6 rounded-xl shadow-md border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primaryLight,
              boxShadow: `0 4px 6px -1px ${theme.colors.primaryLight}aa`,
            }}
          >
            <p className="font-semibold" style={{ color: theme.colors.primary }}>
              Remaining Amount:
            </p>
            <p
              className="font-extrabold text-3xl"
              style={{
                color:
                  summary.remainingAmount >= 0
                    ? theme.colors.primary
                    : theme.colors.accent,
              }}
            >
              ₹{summary.remainingAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSummary;
