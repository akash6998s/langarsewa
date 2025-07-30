import React, { useState, useEffect } from 'react';
// Removed Firebase imports as they are no longer needed
// import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';

import Loader from './Loader';
import CustomPopup from './Popup';
import { theme } from '../theme';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function Summary() {
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalDonation, setTotalDonation] = useState(0); // This will now represent Grand Total
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [popupMessage, setPopupMessage] = useState(null);
    const [popupType, setPopupType] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setPopupMessage(null);

            let calculatedTotalExpense = 0;
            let calculatedTotalActiveDonation = 0; // Temp variable for active
            let calculatedTotalArchivedDonation = 0; // Temp variable for archived
            const currentYear = new Date().getFullYear().toString();

            try {
                // --- 1. Get Total Expense from Local Storage ---
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
                } else {
                    console.log("No expense data found in localStorage for the current year.");
                }

                // --- 2. Get Total Donation from Local Storage (from all active members) ---
                const allMembersString = localStorage.getItem("allMembers");
                const allMembers = allMembersString ? JSON.parse(allMembersString) : [];

                allMembers.forEach((member) => {
                    if (member.donation && member.donation[currentYear]) {
                        months.forEach(month => {
                            const lowerCaseMonth = month.toLowerCase(); // For robust matching
                            if (member.donation[currentYear][month] !== undefined) {
                                calculatedTotalActiveDonation += Number(member.donation[currentYear][month]);
                            } else if (member.donation[currentYear][lowerCaseMonth] !== undefined) {
                                calculatedTotalActiveDonation += Number(member.donation[currentYear][lowerCaseMonth]);
                            }
                        });
                    }
                });

                // --- 3. Get Total Donation from Local Storage (from archived members) ---
                const allArchivedDonationsString = localStorage.getItem("allArchivedDonations");
                const allArchivedDonations = allArchivedDonationsString ? JSON.parse(allArchivedDonationsString) : [];

                allArchivedDonations.forEach((archivedMember) => {
                    // Assuming total_donation is directly available for archived members
                    if (archivedMember.total_donation) {
                        calculatedTotalArchivedDonation += Number(archivedMember.total_donation);
                    }
                });

            } catch (e) {
                console.error("Error fetching financial data from localStorage: ", e);
                setPopupMessage("Failed to load financial data from local storage.");
                setPopupType("error");
            } finally {
                // --- Set States and Calculate Remaining Amount ---
                setTotalExpense(calculatedTotalExpense);
                // Combine active and archived donations into the single totalDonation state
                setTotalDonation(calculatedTotalActiveDonation + calculatedTotalArchivedDonation);
                setRemainingAmount(calculatedTotalActiveDonation + calculatedTotalArchivedDonation - calculatedTotalExpense);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    const remainingAmountColorClass = remainingAmount >= 0 ? theme.colors.success : theme.colors.danger;

    return (
        <div
            className="p-6 sm:p-8 flex flex-col items-center max-w-2xl mx-auto rounded-xl shadow-lg"
            style={{
                backgroundColor: theme.colors.neutralLight,
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
                className="text-3xl font-extrabold mb-8 text-center"
                style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}
            >
                Financial Summary
            </h1>

            {!isLoading && popupType !== 'error' && (
                <div className="w-full space-y-4">
                    {/* Grand Total Donations Card (Active + Archived) - First in order */}
                    <div
                        className="rounded-lg shadow-sm p-4 flex justify-between items-center border"
                        style={{
                            backgroundColor: theme.colors.primaryLight,
                            borderColor: theme.colors.primary,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                        }}
                    >
                        <strong
                            className="text-lg"
                            style={{ color: theme.colors.primary }}
                        >
                            Total Donations ({new Date().getFullYear()}):
                        </strong>
                        <span
                            className="text-2xl font-bold"
                            style={{ color: theme.colors.success }}
                        >
                            ₹{totalDonation.toFixed(2)} {/* Now represents combined total */}
                        </span>
                    </div>

                    {/* Total Expenses Card - Second in order */}
                    <div
                        className="rounded-lg shadow-sm p-4 flex justify-between items-center border"
                        style={{
                            backgroundColor: theme.colors.dangerLight,
                            borderColor: theme.colors.danger,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                        }}
                    >
                        <strong
                            className="text-lg"
                            style={{ color: theme.colors.primary }}
                        >
                            Total Expenses ({new Date().getFullYear()}):
                        </strong>
                        <span
                            className="text-2xl font-bold"
                            style={{ color: theme.colors.danger }}
                        >
                            ₹{totalExpense.toFixed(2)}
                        </span>
                    </div>

                    {/* Separator */}
                    <div
                        className="border-t my-6"
                        style={{ borderColor: theme.colors.primaryLight }}
                    ></div>

                    {/* Remaining Amount Card - Third in order */}
                    <div
                        className={`rounded-lg shadow-md p-4 flex justify-between items-center border-l-4`}
                        style={{
                            backgroundColor: remainingAmount >= 0 ? theme.colors.successLight : theme.colors.dangerLight,
                            borderColor: remainingAmount >= 0 ? theme.colors.success : theme.colors.danger,
                        }}
                    >
                        <strong
                            className="text-xl"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            Remaining Amount:
                        </strong>
                        <span
                            className={`text-3xl font-extrabold`}
                            style={{ color: remainingAmountColorClass }}
                        >
                            ₹{remainingAmount.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
            {!isLoading && popupType === 'error' && (
                <p
                    className="text-center text-xl font-medium mt-4"
                    style={{ color: theme.colors.primary }}
                >
                    Could not load financial data. Please ensure data is in local storage or try again later.
                </p>
            )}
        </div>
    );
}