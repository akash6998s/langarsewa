import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc, deleteField } from "firebase/firestore"; // Import deleteField for proper Firestore field deletion
import LoadData from "./LoadData";

const Managemember = () => {
  const [members, setMembers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("add");
  const [selectedRollNo, setSelectedRollNo] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    // This part still relies on localStorage, which might not be synchronized
    // with real-time Firebase changes. For a fully robust app, consider
    // fetching members directly from Firestore here if not already handled by LoadData.
    const stored = localStorage.getItem("allMembers");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMembers(parsed);
      } catch (err) {
        console.error("Invalid localStorage data for allMembers.", err);
        setError("Failed to load members from local storage. Try refreshing.");
      }
    }
  }, []);

  const getMaxRollNo = () => {
    // Ensure that roll_no is treated as a number for max calculation
    const rollNos = members.map((m) => Number(m.roll_no) || 0);
    return Math.max(...rollNos, 0);
  };

  const handleRollChange = (rollNo) => {
    setSelectedRollNo(rollNo);
    setMessage("");

    // Convert rollNo to a number for strict comparison if needed
    const numRollNo = Number(rollNo);
    const isNew = numRollNo === (getMaxRollNo() + 1);

    if (isNew) {
      // Blank for new roll number, pre-fill roll_no
      setMemberData({
        name: "",
        last_name: "",
        email: "",
        phone_no: "",
        address: "",
        roll_no: numRollNo, // Use the numeric rollNo
        // Set defaults for other fields if necessary
        approved: false,
        isAdmin: false,
        isSuperAdmin: false,
        password: "",
        img: "",
        attendance: {},
        donation: {},
      });
    } else {
      // Load from existing
      const member = members.find((m) => Number(m.roll_no) === numRollNo);
      if (member) {
        setMemberData({ ...member });
      } else {
        setMemberData(null); // Clear form if member not found for selected roll
        setMessage("❌ Member not found for this roll number.");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setMemberData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!memberData?.roll_no) {
        setMessage("❌ Please select a roll number first.");
        return;
    }
    if (!memberData.name || !memberData.last_name || !memberData.email || !memberData.phone_no || !memberData.address) {
        setMessage("❌ All fields must be filled.");
        return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(memberData.email)) {
        setMessage("❌ Please enter a valid email address.");
        return;
    }
    // Basic phone number validation
    if (!/^\d{10}$/.test(memberData.phone_no)) {
        setMessage("❌ Phone number must be 10 digits.");
        return;
    }

    setLoading(true);
    setMessage("");
    try {
      // Use memberData.roll_no as the ID if memberData.id is not available
      // It's crucial that 'id' in Firestore matches 'roll_no' for members for easy lookups.
      const idToUse = String(memberData.roll_no);
      const ref = doc(db, "members", idToUse);
      
      const dataToSave = {
        ...memberData,
        id: idToUse, // Ensure 'id' field matches the document ID
        roll_no: Number(memberData.roll_no), // Ensure roll_no is stored as a number
      };

      await setDoc(ref, dataToSave, { merge: true });

      setMessage("✅ Member saved successfully!");
      // Optionally, re-fetch members from localStorage or Firebase after save
      // For now, assuming LoadData will handle this or a page refresh will.
    } catch (err) {
      console.error("Save error:", err);
      setMessage("❌ Error saving member. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRollNo) {
        setMessage("❌ Please select a member to delete.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete details for Roll No: ${selectedRollNo}? This action cannot be undone.`)) {
        return;
    }

    setLoading(true);
    setMessage("");
    const memberToDelete = members.find((m) => String(m.roll_no) === String(selectedRollNo));

    if (!memberToDelete || !memberToDelete.id) {
      setMessage("❌ Member not found or invalid ID.");
      setLoading(false);
      return;
    }

    try {
      const ref = doc(db, "members", memberToDelete.id);
      // We are "deleting" by clearing fields, not deleting the document itself.
      // This matches your original functionality but is an uncommon pattern.
      // If you truly want to delete the member document, use `deleteDoc(ref)`.
      // For now, retaining your functionality to clear specific fields.
      const fieldsToClear = {
        name: deleteField(),
        last_name: deleteField(),
        email: deleteField(),
        phone_no: deleteField(),
        address: deleteField(),
        attendance: deleteField(),
        donation: deleteField(),
        approved: false, // Explicitly set to false, not deleted
        isAdmin: false, // Explicitly set to false, not deleted
        isSuperAdmin: false, // Explicitly set to false, not deleted
        password: deleteField(), // Delete sensitive fields
        img: deleteField(),
      };
      await updateDoc(ref, fieldsToClear);
      setMessage("🗑️ Member details deleted (roll number document retained).");
      setMemberData(null); // Clear the form after deletion
      setSelectedRollNo(""); // Reset selected roll
      // Re-fetch members to update UI (localStorage or Firebase)
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Error deleting member details. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const maxRoll = getMaxRollNo();
  const addTabRolls = [...members.map((m) => Number(m.roll_no)), maxRoll + 1].sort((a, b) => a - b);
  const deleteTabRolls = members.map((m) => Number(m.roll_no)).sort((a, b) => a - b);


  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
      <LoadData /> {/* Global loading indicator */}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Manage Members</h2>

      {/* Tabs for Add/Delete Member */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm w-full max-w-lg">
        <button
          onClick={() => {
            setSelectedTab("add");
            setSelectedRollNo("");
            setMemberData(null);
            setMessage("");
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${selectedTab === "add" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
        >
          Add Member
        </button>
        <button
          onClick={() => {
            setSelectedTab("delete");
            setSelectedRollNo("");
            setMemberData(null);
            setMessage("");
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${selectedTab === "delete" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
        >
          Delete Member
        </button>
      </div>

      {/* Roll Number Select Dropdown */}
      <div className="w-full max-w-lg mb-8 relative">
        <label htmlFor="member-roll-select" className="block text-sm font-medium text-gray-700 mb-1">Select Roll Number</label>
        <select
          id="member-roll-select"
          value={selectedRollNo}
          onChange={(e) => handleRollChange(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
        >
          <option value="">-- Select --</option>
          {(selectedTab === "add" ? addTabRolls : deleteTabRolls).map((roll) => (
            <option key={roll} value={roll}>
              {roll} {selectedTab === "add" && roll === maxRoll + 1 ? "(New)" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
      </div>

      {loading && (
        <div className="text-center text-blue-600 font-medium mb-4">Processing...</div>
      )}
      {error && (
        <div className="text-center text-red-600 font-medium mb-4">{error}</div>
      )}

      {memberData && (
        <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Input Fields */}
            <div>
              <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                id="name-input"
                type="text"
                className={`w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out ${selectedTab === "add" && String(selectedRollNo) <= maxRoll ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                readOnly={selectedTab === "add" && String(selectedRollNo) <= maxRoll}
              />
            </div>

            <div>
              <label htmlFor="last-name-input" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                id="last-name-input"
                type="text"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                value={memberData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email-input"
                type="email" // Use type="email" for better mobile keyboard
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                value={memberData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="phone-input"
                type="tel" // Use type="tel" for better mobile keyboard
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                value={memberData.phone_no || ""}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
              />
            </div>

            <div className="md:col-span-2"> {/* Make address span two columns on medium screens */}
              <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="address-input"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                rows="3" // Increased rows for more space
                value={memberData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
              ></textarea>
            </div>
          </div>

          {selectedTab === "add" && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Save Member
            </button>
          )}

          {selectedTab === "delete" && (
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            >
              Delete Member Details
            </button>
          )}

          {message && (
            <p className={`text-sm mt-4 text-center font-medium ${message.includes("✅") || message.includes("🗑️") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Managemember;