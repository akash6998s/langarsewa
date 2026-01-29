import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  setDoc,
  deleteField,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from "../theme";

const Managemember = () => {
  const [members, setMembers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("add");
  const [selectedRollNo, setSelectedRollNo] = useState("");
  const [memberData, setMemberData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const fetchMembersFromFirebase = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const memberList = [];
      querySnapshot.forEach((doc) => {
        memberList.push({
          id: doc.id,
          ...doc.data()
        });
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
  }, []);

  const getMaxRollNo = () => {
    const rollNos = members.map((m) => Number(m.roll_no) || 0);
    return Math.max(...rollNos, 0);
  };

  const handleRollChange = (rollNo) => {
    setSelectedRollNo(rollNo);
    setPopupMessage(null);

    const numRollNo = Number(rollNo);
    const isNew = numRollNo === getMaxRollNo() + 1;

    if (selectedTab === "add") {
      if (isNew) {
        setMemberData({
          name: "",
          last_name: "",
          post: "", // New Field Added
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
          duty: "",
          incharge: "",
          last_online: "",
          naamjap: "",
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
    } else if (selectedTab === "delete") {
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
    setMemberData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!memberData?.roll_no) {
      setPopupMessage("❌ Please select a roll number first.");
      setPopupType("error");
      return;
    }

    setIsLoading(true);
    setPopupMessage(null);
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
      fetchMembersFromFirebase();
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

    if (Number(selectedRollNo) === 8) {
      setPopupMessage("❌ You can't delete this Roll Number.");
      setPopupType("error");
      return;
    }

    setIsLoading(true);
    setPopupMessage(null);

    const memberToDelete = members.find(
      (m) => String(m.roll_no) === String(selectedRollNo)
    );

    if (!memberToDelete || !memberToDelete.id) {
      setPopupMessage("❌ Member not found or invalid ID.");
      setPopupType("error");
      setIsLoading(false);
      return;
    }

    try {
      const memberDocRef = doc(db, "members", memberToDelete.id);
      const memberDocSnap = await getDoc(memberDocRef);

      let totalDonation = 0;
      let memberDataFromDb = null;

      if (memberDocSnap.exists()) {
        memberDataFromDb = memberDocSnap.data();
        if (memberDataFromDb.donation && typeof memberDataFromDb.donation === "object") {
          for (const yearKey in memberDataFromDb.donation) {
            const yearDonations = memberDataFromDb.donation[yearKey];
            if (typeof yearDonations === 'object' && yearDonations !== null) {
              for (const monthKey in yearDonations) {
                const numAmount = Number(yearDonations[monthKey]);
                if (!isNaN(numAmount)) totalDonation += numAmount;
              }
            }
          }
        }
      }

      if (totalDonation > 0) {
        const archivedDocRef = doc(db, "archivedDonations", memberToDelete.id);
        await setDoc(archivedDocRef, {
          roll_no: Number(memberToDelete.roll_no),
          name: memberToDelete.name,
          last_name: memberToDelete.last_name,
          total_donation: totalDonation,
          deletion_date: new Date(),
        });
      }

      const fieldsToClear = {
        name: deleteField(),
        last_name: deleteField(),
        post: deleteField(), // Clears Post field on delete
        email: deleteField(),
        phone_no: deleteField(),
        address: deleteField(),
        attendance: deleteField(),
        donation: deleteField(),
        duty: deleteField(),
        incharge: deleteField(),
        last_online: deleteField(),
        naamjap: deleteField(),
        approved: false,
        isAdmin: false,
        isSuperAdmin: false,
        password: deleteField(),
        img: deleteField(),
      };
      await updateDoc(memberDocRef, fieldsToClear);

      setPopupMessage("✅ Member details deleted successfully.");
      setPopupType("success");
      setMemberData(null);
      setSelectedRollNo("");
      fetchMembersFromFirebase();
    } catch (err) {
      console.error("Critical error during delete:", err);
      setPopupMessage("❌ Error deleting member details.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const maxRoll = getMaxRollNo();
  const addTabRolls = [...members.map((m) => Number(m.roll_no)), maxRoll + 1].sort((a, b) => a - b);
  const deleteTabRolls = members.map((m) => Number(m.roll_no)).sort((a, b) => a - b);
  const areInputsReadOnly = selectedTab === "delete";

  return (
    <div
      className="min-h-[calc(100vh-10rem)] rounded-xl m-4 shadow-lg p-6 sm:p-8 flex flex-col items-center"
      style={{ backgroundColor: theme.colors.neutralLight, fontFamily: theme.fonts.body }}
    >
      {isLoading && <Loader />}
      {popupMessage && (
        <CustomPopup message={popupMessage} type={popupType} onClose={() => setPopupMessage(null)} />
      )}

      <h2 className="text-3xl font-extrabold mb-8 text-center" style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.heading }}>
        Manage Members
      </h2>

      {/* Tab Switcher */}
      <div className="flex rounded-xl p-1 mb-8 shadow-sm w-full max-w-lg" style={{ backgroundColor: theme.colors.tertiaryLight }}>
        <button
          onClick={() => { setSelectedTab("add"); setSelectedRollNo(""); setMemberData(null); }}
          className="flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: selectedTab === "add" ? theme.colors.primary : "transparent",
            color: selectedTab === "add" ? theme.colors.neutralLight : theme.colors.primary,
          }}
          disabled={isLoading}
        >
          Add / Edit Member
        </button>
        <button
          onClick={() => { setSelectedTab("delete"); setSelectedRollNo(""); setMemberData(null); }}
          className="flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: selectedTab === "delete" ? theme.colors.danger : "transparent",
            color: selectedTab === "delete" ? theme.colors.neutralLight : theme.colors.primary,
          }}
          disabled={isLoading}
        >
          Delete Member
        </button>
      </div>

      {/* Roll Number Selection */}
      <div className="w-full max-w-lg mb-8 relative">
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Select Roll Number</label>
        <select
          value={selectedRollNo}
          onChange={(e) => handleRollChange(e.target.value)}
          className="block appearance-none w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white border shadow-sm"
          style={{ borderColor: theme.colors.primaryLight, color: theme.colors.primary }}
          disabled={isLoading}
        >
          <option value="">-- Select --</option>
          {(selectedTab === "add" ? addTabRolls : deleteTabRolls).map((roll) => (
            <option key={roll} value={roll}>{roll} {selectedTab === "add" && roll === maxRoll + 1 ? "(New)" : ""}</option>
          ))}
        </select>
      </div>

      {/* Member Form */}
      {memberData && (
        <div className="w-full max-w-lg rounded-xl shadow-md p-6 border" style={{ backgroundColor: theme.colors.neutralLight, borderColor: theme.colors.primaryLight }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>First Name</label>
              <input
                type="text"
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                readOnly={areInputsReadOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Last Name</label>
              <input
                type="text"
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                readOnly={areInputsReadOnly}
              />
            </div>

            {/* Post Field Added Here */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Post / Designation</label>
              <input
                type="text"
                placeholder="e.g. President, Secretary, Member"
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.post || ""}
                onChange={(e) => handleInputChange("post", e.target.value)}
                readOnly={areInputsReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Email</label>
              <input
                type="email"
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                readOnly={areInputsReadOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Phone</label>
              <input
                type="tel"
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                value={memberData.phone_no || ""}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                readOnly={areInputsReadOnly}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Address</label>
              <textarea
                className={`w-full py-3 px-4 rounded-lg border ${areInputsReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                rows="2"
                value={memberData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                readOnly={areInputsReadOnly}
              ></textarea>
            </div>
          </div>

          {selectedTab === "add" ? (
            <button
              onClick={handleSave}
              className="w-full py-3 font-semibold rounded-lg shadow-md transition text-white"
              style={{ backgroundColor: theme.colors.primary }}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Member"}
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="w-full py-3 font-semibold rounded-lg shadow-md transition text-white"
              style={{ backgroundColor: theme.colors.danger }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Member Details"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Managemember;