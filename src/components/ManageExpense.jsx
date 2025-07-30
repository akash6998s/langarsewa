import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import Loader from "./Loader"; // Import your Loader component
import CustomPopup from "./Popup"; // Import your CustomPopup component
import { theme } from '../theme'; // Import the theme

const years = ["2024", "2025"];
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

export default function ManageExpense() {
  const [mode, setMode] = useState("add");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState([]);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    setIsLoading(true); // Start loading
    setPopupMessage(null); // Clear any previous messages
    try {
      const snapshot = await getDocs(collection(db, "expenses"));
      const data = [];

      snapshot.forEach((docSnap) => {
        const expense = docSnap.data();
        if (
          expense[selectedYear] &&
          expense[selectedYear][selectedMonth]
        ) {
          expense[selectedYear][selectedMonth].forEach((e) => {
            data.push({ ...e, docId: docSnap.id });
          });
        }
      });

      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setPopupMessage("Failed to load expenses. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description) {
      setPopupMessage("Please fill all fields.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for submission
    setPopupMessage(null); // Clear previous popup messages

    try {
      const snapshot = await getDocs(collection(db, "expenses"));
      let docRef = null;

      if (snapshot.empty) {
        // If no expense document exists, create a new one
        const newDocRef = doc(collection(db, "expenses"));
        await setDoc(newDocRef, {
          [selectedYear]: {
            [selectedMonth]: [
              {
                amount: parseFloat(amount),
                description,
                id: uuidv4(),
              },
            ],
          },
        });
      } else {
        // If an expense document exists, update the first one found
        const firstDoc = snapshot.docs[0];
        docRef = doc(db, "expenses", firstDoc.id);
        const docData = firstDoc.data();

        const existing = docData[selectedYear]?.[selectedMonth] || [];
        const updated = [
          ...existing,
          {
            amount: parseFloat(amount),
            description,
            id: uuidv4(),
          },
        ];

        // Use dot notation to update nested fields
        await updateDoc(docRef, {
          [`${selectedYear}.${selectedMonth}`]: updated,
        });
      }

      setAmount("");
      setDescription("");
      setPopupMessage("Expense added successfully.");
      setPopupType("success");
      fetchExpenses(); // Re-fetch expenses to update the list
    } catch (e) {
      console.error("Error adding expense:", e);
      setPopupMessage("Failed to add expense. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleDeleteExpense = async (idToDelete) => {
    setIsLoading(true); // Start loading for deletion
    setPopupMessage(null); // Clear previous popup messages

    try {
      const snapshot = await getDocs(collection(db, "expenses"));
      if (snapshot.empty) {
        setPopupMessage("No expense document found to delete from.");
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      const firstDoc = snapshot.docs[0];
      const docRef = doc(db, "expenses", firstDoc.id);
      const docData = firstDoc.data();

      const currentExpenses = docData[selectedYear]?.[selectedMonth] || [];

      const updatedExpenses = currentExpenses.filter(
        (e) => e.id !== idToDelete
      );

      // Update the document with the filtered expenses
      await updateDoc(docRef, {
        [`${selectedYear}.${selectedMonth}`]: updatedExpenses,
      });

      setPopupMessage("Expense deleted successfully.");
      setPopupType("success");
      fetchExpenses(); // Re-fetch expenses to update the list
    } catch (e) {
      console.error("Error deleting expense:", e);
      setPopupMessage("Failed to delete expense. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div
      className="p-6 max-w-3xl mx-auto rounded-xl shadow-lg"
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
        className="text-3xl font-extrabold text-center mb-6"
        style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}
      >
        Manage Expenses
      </h2>

      <div
        className="flex justify-center space-x-4 mb-6 rounded-xl p-1 shadow-sm"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setMode("add")}
          className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              mode === "add" ? theme.colors.primary : "transparent",
            color:
              mode === "add"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              mode === "add" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (mode !== "add") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== "add") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading} // Disable button when loading
        >
          Add Expense
        </button>
        <button
          onClick={() => setMode("delete")}
          className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              mode === "delete" ? theme.colors.danger : "transparent",
            color:
              mode === "delete"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              mode === "delete" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.dangerLight,
          }}
          onMouseEnter={(e) => {
            if (mode !== "delete") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== "delete") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading} // Disable button when loading
        >
          Delete Expense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2.5 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            color: theme.colors.primary,
            borderWidth: '1px',
            borderStyle: 'solid',
            outlineColor: theme.colors.primary,
            "--tw-ring-color": theme.colors.primary,
          }}
          disabled={isLoading} // Disable select when loading
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2.5 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            color: theme.colors.primary,
            borderWidth: '1px',
            borderStyle: 'solid',
            outlineColor: theme.colors.primary,
            "--tw-ring-color": theme.colors.primary,
          }}
          disabled={isLoading} // Disable select when loading
        >
          {months.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      {mode === "add" && (
        <div
          className="p-4 shadow rounded-lg mb-6"
          style={{
            backgroundColor: theme.colors.neutralLight,
            border: `1px solid ${theme.colors.primaryLight}`,
          }}
        >
          <div className="mb-4">
            <input
              type="number"
              placeholder="Amount (₹)"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                outlineColor: theme.colors.success,
                "--tw-ring-color": theme.colors.success,
              }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading} // Disable input when loading
            />
          </div>
          <div className="mb-4">
            <textarea // Changed from input to textarea
              placeholder="Description"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2"
              rows="4" // Added rows attribute for height
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                outlineColor: theme.colors.success,
                "--tw-ring-color": theme.colors.success,
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading} // Disable textarea when loading
            ></textarea> {/* Changed from input to textarea */}
          </div>
          <button
            onClick={handleAddExpense}
            className="w-full py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              backgroundColor: theme.colors.success,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.successLight,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.successLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.success}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      )}

      {mode === "delete" && (
        <div
          className="p-4 shadow rounded-lg"
          style={{
            backgroundColor: theme.colors.neutralLight,
            border: `1px solid ${theme.colors.primaryLight}`,
          }}
        >
          {expenses.length === 0 ? (
            <p className="text-center" style={{ color: theme.colors.primary }}>
              No expenses found.
            </p>
          ) : (
            <ul className="space-y-3">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="flex flex-col border p-3 rounded-lg shadow-sm transition-colors duration-150 ease-in-out" // Changed to flex-col
                  style={{
                    backgroundColor: theme.colors.neutralLight,
                    borderColor: theme.colors.primaryLight,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.tertiaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutralLight}
                >
                  <div className="flex justify-between items-center w-full mb-2"> {/* New flex container for amount and button */}
                    <p
                      className="text-lg font-medium"
                      style={{ color: theme.colors.neutralDark }}
                    >
                      ₹{exp.amount}
                    </p>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="px-3 py-1 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-opacity-75"
                      style={{
                        backgroundColor: theme.colors.danger,
                        color: theme.colors.neutralLight,
                        "--tw-ring-color": theme.colors.dangerLight,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.dangerLight}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.danger}
                      disabled={isLoading} // Disable button when loading
                    >
                      {isLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <p
                    className="text-sm w-full" // Added w-full for full width
                    style={{ color: theme.colors.primary }}
                  >
                    {exp.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}