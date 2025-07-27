import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc, deleteField, collection, getDocs } from "firebase/firestore"; // Import deleteField, collection, getDocs
import Loader from "./Loader"; // Import your Loader component
import CustomPopup from "./Popup"; // Import your custom Popup component

const Managemember = () => {
  const [members, setMembers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("add");
  const [selectedRollNo, setSelectedRollNo] = useState("");
  const [memberData, setMemberData] = useState(null);

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  // Function to fetch members from Firebase
  const fetchMembersFromFirebase = async () => {
    setIsLoading(true);
    setPopupMessage(null); // Clear any previous messages
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const memberList = [];
      querySnapshot.forEach((doc) => {
        memberList.push({ id: doc.id, ...doc.data() });
      });
      setMembers(memberList);
    } catch (err) {
      console.error("Error fetching members from Firebase:", err);
      setPopupMessage("Failed to load members. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersFromFirebase();
  }, []); // Fetch members on component mount

  const getMaxRollNo = () => {
    const rollNos = members.map((m) => Number(m.roll_no) || 0);
    return Math.max(...rollNos, 0);
  };

  const handleRollChange = (rollNo) => {
    setSelectedRollNo(rollNo);
    setPopupMessage(null); // Clear any previous messages

    const numRollNo = Number(rollNo);
    const isNew = numRollNo === (getMaxRollNo() + 1);

    if (isNew) {
      setMemberData({
        name: "",
        last_name: "",
        email: "",
        phone_no: "",
        address: "",
        roll_no: numRollNo,
        approved: false,
        isAdmin: false,
        isSuperAdmin: false,
        password: "",
        img: "",
        attendance: {},
        donation: {},
      });
    } else {
      const member = members.find((m) => Number(m.roll_no) === numRollNo);
      if (member) {
        setMemberData({ ...member });
      } else {
        setMemberData(null);
        setPopupMessage("❌ Member not found for this roll number.");
        setPopupType("error");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setMemberData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!memberData?.roll_no) {
      setPopupMessage("❌ Please select a roll number first.");
      setPopupType("error");
      return;
    }
    if (!memberData.name || !memberData.last_name || !memberData.email || !memberData.phone_no || !memberData.address) {
      setPopupMessage("❌ All fields must be filled.");
      setPopupType("error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(memberData.email)) {
      setPopupMessage("❌ Please enter a valid email address.");
      setPopupType("error");
      return;
    }
    if (!/^\d{10}$/.test(memberData.phone_no)) {
      setPopupMessage("❌ Phone number must be 10 digits.");
      setPopupType("error");
      return;
    }

    setIsLoading(true);
    setPopupMessage(null); // Clear previous popup messages
    try {
      const idToUse = String(memberData.roll_no);
      const ref = doc(db, "members", idToUse);

      const dataToSave = {
        ...memberData,
        id: idToUse,
        roll_no: Number(memberData.roll_no),
      };

      await setDoc(ref, dataToSave, { merge: true });

      setPopupMessage("✅ Member saved successfully!");
      setPopupType("success");
      fetchMembersFromFirebase(); // Re-fetch members to update the list and max roll number
    } catch (err) {
      console.error("Save error:", err);
      setPopupMessage("❌ Error saving member. Please check console for details.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRollNo) {
      setPopupMessage("❌ Please select a member to delete.");
      setPopupType("error");
      return;
    }

    // Removed window.confirm as per instructions, direct action with popup feedback
    setIsLoading(true);
    setPopupMessage(null); // Clear previous popup messages

    const memberToDelete = members.find((m) => String(m.roll_no) === String(selectedRollNo));

    if (!memberToDelete || !memberToDelete.id) {
      setPopupMessage("❌ Member not found or invalid ID.");
      setPopupType("error");
      setIsLoading(false);
      return;
    }

    try {
      const ref = doc(db, "members", memberToDelete.id);
      const fieldsToClear = {
        name: deleteField(),
        last_name: deleteField(),
        email: deleteField(),
        phone_no: deleteField(),
        address: deleteField(),
        attendance: deleteField(),
        donation: deleteField(),
        approved: false,
        isAdmin: false,
        isSuperAdmin: false,
        password: deleteField(),
        img: deleteField(),
      };
      await updateDoc(ref, fieldsToClear);
      setPopupMessage("🗑️ Member details deleted (roll number document retained).");
      setPopupType("success");
      setMemberData(null);
      setSelectedRollNo("");
      fetchMembersFromFirebase(); // Re-fetch members to update UI
    } catch (err) {
      console.error("Delete error:", err);
      setPopupMessage("❌ Error deleting member details. Please check console.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const maxRoll = getMaxRollNo();
  const addTabRolls = [...members.map((m) => Number(m.roll_no)), maxRoll + 1].sort((a, b) => a - b);
  const deleteTabRolls = members.map((m) => Number(m.roll_no)).sort((a, b) => a - b);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center">
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

      {/* Removed LoadData as Loader component is now used */}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Manage Members</h2>

      {/* Tabs for Add/Delete Member */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8 shadow-sm w-full max-w-lg">
        <button
          onClick={() => {
            setSelectedTab("add");
            setSelectedRollNo("");
            setMemberData(null);
            setPopupMessage(null); // Clear messages on tab change
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${selectedTab === "add" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
          disabled={isLoading} // Disable button when loading
        >
          Add Member
        </button>
        <button
          onClick={() => {
            setSelectedTab("delete");
            setSelectedRollNo("");
            setMemberData(null);
            setPopupMessage(null); // Clear messages on tab change
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            ${selectedTab === "delete" ? "bg-red-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
          `}
          disabled={isLoading} // Disable button when loading
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
          disabled={isLoading} // Disable select when loading
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

      {/* Removed old loading and error display divs */}

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
                disabled={isLoading} // Disable input when loading
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
                disabled={isLoading} // Disable input when loading
              />
            </div>

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email-input"
                type="email"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                value={memberData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading} // Disable input when loading
              />
            </div>

            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="phone-input"
                type="tel"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                value={memberData.phone_no || ""}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                disabled={isLoading} // Disable input when loading
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="address-input"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
                rows="3"
                value={memberData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={isLoading} // Disable textarea when loading
              ></textarea>
            </div>
          </div>

          {selectedTab === "add" && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? "Saving..." : "Save Member"}
            </button>
          )}

          {selectedTab === "delete" && (
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? "Deleting..." : "Delete Member Details"}
            </button>
          )}

          {/* Removed old message display div */}
        </div>
      )}
    </div>
  );
};

export default Managemember;