import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import CustomPopup from './Popup';
import { theme } from '../theme';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Summary() {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setPopupMessage(null);
      let calculatedTotalExpense = 0;
      let calculatedTotalActiveDonation = 0;
      let calculatedTotalArchivedDonation = 0;
      const currentYear = new Date().getFullYear().toString();

      try {
        const expensesString = localStorage.getItem("expenses");
        const expensesData = expensesString ? JSON.parse(expensesString) : {};

        if (expensesData[currentYear]) {
          months.forEach(month => {
            if (expensesData[currentYear][month] && Array.isArray(expensesData[currentYear][month])) {
              expensesData[currentYear][month].forEach(expenseItem => {
                if (expenseItem.amount) {
                  calculatedTotalExpense += Number(expenseItem.amount);
                }
              });
            }
          });
        }

        const allMembersString = localStorage.getItem("allMembers");
        const allMembers = allMembersString ? JSON.parse(allMembersString) : [];

        allMembers.forEach((member) => {
          if (member.donation && member.donation[currentYear]) {
            months.forEach(month => {
              const lowerCaseMonth = month.toLowerCase();
              if (member.donation[currentYear][month] !== undefined) {
                calculatedTotalActiveDonation += Number(member.donation[currentYear][month]);
              } else if (member.donation[currentYear][lowerCaseMonth] !== undefined) {
                calculatedTotalActiveDonation += Number(member.donation[currentYear][lowerCaseMonth]);
              }
            });
          }
        });

        const allArchivedDonationsString = localStorage.getItem("allArchivedDonations");
        const allArchivedDonations = allArchivedDonationsString ? JSON.parse(allArchivedDonationsString) : [];

        allArchivedDonations.forEach((archivedMember) => {
          if (archivedMember.total_donation) {
            calculatedTotalArchivedDonation += Number(archivedMember.total_donation);
          }
        });

      } catch (e) {
        console.error("Error fetching financial data from localStorage: ", e);
        setPopupMessage("Failed to load financial data from local storage.");
        setPopupType("error");
      } finally {
        setTotalExpense(calculatedTotalExpense);
        setTotalDonation(calculatedTotalActiveDonation + calculatedTotalArchivedDonation);
        setRemainingAmount(calculatedTotalActiveDonation + calculatedTotalArchivedDonation - calculatedTotalExpense);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const remainingAmountColorClass = remainingAmount >= 0 ? theme.colors.success : theme.colors.danger;

  return (
    <div
      className="w-full mx-auto sm:p-6 md:p-8"
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

      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center"
        style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}
      >
        Financial Summary
      </h1>

      {!isLoading && popupType !== 'error' && (
        <div className="space-y-4 w-full">
          {/* Total Donations */}
          <div
            className="rounded-md shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border"
            style={{
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary,
              borderWidth: '1px',
            }}
          >
            <strong
              className="text-base sm:text-lg mb-2 sm:mb-0"
              style={{ color: theme.colors.primary }}
            >
              Total Donations ({new Date().getFullYear()}):
            </strong>
            <span
              className="text-xl sm:text-2xl font-bold"
              style={{ color: theme.colors.success }}
            >
              ₹{Math.round(totalDonation)}
            </span>
          </div>

          {/* Total Expenses */}
          <div
            className="rounded-md shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border"
            style={{
              backgroundColor: theme.colors.dangerLight,
              borderColor: theme.colors.danger,
              borderWidth: '1px',
            }}
          >
            <strong
              className="text-base sm:text-lg mb-2 sm:mb-0"
              style={{ color: theme.colors.primary }}
            >
              Total Expenses ({new Date().getFullYear()}):
            </strong>
            <span
              className="text-xl sm:text-2xl font-bold"
              style={{ color: theme.colors.danger }}
            >
              ₹{Math.round(totalExpense)}
            </span>
          </div>

         

          {/* Remaining Amount */}
          <div
            className="rounded-md shadow p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-l-4"
            style={{
              backgroundColor: remainingAmount >= 0 ? theme.colors.successLight : theme.colors.dangerLight,
              borderColor: remainingAmount >= 0 ? theme.colors.success : theme.colors.danger,
            }}
          >
            <strong
              className="text-base sm:text-xl mb-2 sm:mb-0"
              style={{ color: theme.colors.neutralDark }}
            >
              Remaining Amount:
            </strong>
            <span
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: remainingAmountColorClass }}
            >
               ₹{Math.round(remainingAmount)}
            </span>
          </div>
        </div>
      )}

      {!isLoading && popupType === 'error' && (
        <p
          className="text-center text-lg sm:text-xl font-medium mt-6"
          style={{ color: theme.colors.primary }}
        >
          Could not load financial data. Please ensure data is in local storage or try again later.
        </p>
      )}
    </div>
  );
}
