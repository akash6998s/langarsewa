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
import CustomPopup from "./Popup"; // Import your custom Popup component

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
    <div className="p-6 max-w-3xl mx-auto">
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
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
        Manage Expenses
      </h2>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setMode("add")}
          className={`px-5 py-2 rounded-lg font-semibold shadow ${
            mode === "add"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          disabled={isLoading} // Disable button when loading
        >
          ➕ Add Expense
        </button>
        <button
          onClick={() => setMode("delete")}
          className={`px-5 py-2 rounded-lg font-semibold shadow ${
            mode === "delete"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          disabled={isLoading} // Disable button when loading
        >
          🗑️ Delete Expense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading} // Disable select when loading
        >
          {years.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading} // Disable select when loading
        >
          {months.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      {mode === "add" && (
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <div className="mb-4">
            <input
              type="number"
              placeholder="Amount (₹)"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading} // Disable input when loading
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Description"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading} // Disable input when loading
            />
          </div>
          <button
            onClick={handleAddExpense}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Saving..." : "✅ Save Expense"}
          </button>
        </div>
      )}

      {mode === "delete" && (
        <div className="bg-white p-4 shadow rounded-lg">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500">No expenses found.</p>
          ) : (
            <ul className="space-y-3">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="flex justify-between items-center border p-3 rounded-lg shadow-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      ₹{exp.amount}
                    </p>
                    <p className="text-sm text-gray-500">{exp.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
                    disabled={isLoading} // Disable button when loading
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}