// CreateInchargeCollections.jsx
import React, { useState } from "react";
import { db } from "../firebase"; // your firebase.js should export the Firestore instance as `db`
import { doc, writeBatch } from "firebase/firestore";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function getUniqueRandomNumbers(count, min = 1, max = 100) {
  const set = new Set();
  while (set.size < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    set.add(n);
  }
  return Array.from(set);
}

export default function AddWeeklyCollections() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // We'll use a write batch for better performance (and atomic-ish behavior)
      const batch = writeBatch(db);

      for (const day of days) {
        // pick a random number of roll numbers between 5 and 10
        const count = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        const rolls = getUniqueRandomNumbers(count, 1, 100);

        // For each roll number create a doc under: /incharge/{day}/rolls/{rollNumber}
        // Note: Firestore path: collection(incharge) -> doc(day) -> collection(rolls) -> doc(rollNumber)
        for (const num of rolls) {
          const docRef = doc(db, "incharge", day, "rolls", String(num));
          batch.set(docRef, { rollNumber: num });
          // If you prefer to keep metadata, you can use:
          // batch.set(docRef, { rollNumber: num, createdAt: serverTimestamp() })
        }
      }

      // commit
      await batch.commit();

      setStatus(
        "Success — created `incharge` → (monday..sunday) → `rolls` with 5–10 numbers each."
      );
    } catch (err) {
      console.error("Error creating collections:", err);
      setStatus("Error: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Incharge Collections"}
      </button>

      {status && (
        <div style={{ marginTop: 12, color: status.startsWith("Error") ? "crimson" : "green" }}>
          {status}
        </div>
      )}
    </div>
  );
}
