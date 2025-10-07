import React, { useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// ✅ Your Firebase config (replace with actual values)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "langar-backend",
  storageBucket: "langar-backend.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ✅ Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const UpdateMembers = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");

    try {
      const membersRef = collection(db, "members");
      const snapshot = await getDocs(membersRef);

      const updatePromises = snapshot.docs.map((docSnap) =>
        updateDoc(doc(db, "members", docSnap.id), {
          duty: "",
          incharge: "",
        })
      );

      await Promise.all(updatePromises);
      setMessage("✅ All members updated successfully!");
    } catch (error) {
      console.error("Error updating members:", error);
      setMessage("❌ Error updating members. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Update Members in Firestore
      </h1>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-semibold ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Updating..." : "Add Keys to All Members"}
      </button>

      {message && (
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default UpdateMembers;
