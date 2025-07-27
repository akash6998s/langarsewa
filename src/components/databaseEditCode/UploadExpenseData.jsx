import React from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const UploadExpenseData = () => {
  const handleAddExpense = async () => {
    try {
      const expensesRef = doc(collection(db, "expenses")); // auto-generate doc ID

      const data = {
        2025: {
          May: [
            {
              amount: 36000,
              description:
                "22 मई 2025- गुरु महाराज की पुण्य तिथि पर हर बार की तरह श्री सुदर्शन सेवा भोजन वितरण अर्थात हमारी टीम की तरफ से लंगर सेवा दी जाएगी जिसके उपरांत कुल 36000/- की पर्ची कटाई गई है।",
            },
            {
              amount: 250,
              description:
                "30-may raat late tak seva hui hai jiske liye kharch hua hai, jitne bhi seva daar (14 sevadar ) the unke liye (cold drink) mangwai gayi hai.",
            },
          ],
        },
      };

      await setDoc(expensesRef, data);
      alert("Expense data added successfully!");
    } catch (error) {
      console.error("Error adding expenses:", error);
      alert("Failed to add expense data.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleAddExpense}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Expense Data
      </button>
    </div>
  );
};

export default UploadExpenseData;
