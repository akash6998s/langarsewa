import React, { useEffect, useState } from "react";
import {
  db
} from "../firebase";
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
import {
  theme
} from "../theme";

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
          setMemberData({ ...member
          });
        } else {
          setMemberData(null);
          setPopupMessage("❌ Member not found for this roll number.");
          setPopupType("error");
        }
      }
    } else if (selectedTab === "delete") {
      const member = members.find((m) => Number(m.roll_no) === numRollNo);
      if (member) {
        setMemberData({ ...member
        });
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

      await setDoc(ref, dataToSave, {
        merge: true
      });

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

    console.log("Attempting to delete member with ID:", memberToDelete.id);

    try {
      const memberDocRef = doc(db, "members", memberToDelete.id);
      const memberDocSnap = await getDoc(memberDocRef);

      let totalDonation = 0;
      let memberDataFromDb = null;

      if (memberDocSnap.exists()) {
        memberDataFromDb = memberDocSnap.data();
        console.log("Member document data fetched:", memberDataFromDb);

        if (
          memberDataFromDb.donation &&
          typeof memberDataFromDb.donation === "object"
        ) {
          for (const yearKey in memberDataFromDb.donation) {
            if (Object.prototype.hasOwnProperty.call(memberDataFromDb.donation, yearKey)) {
              const yearDonations = memberDataFromDb.donation[yearKey];

              if (typeof yearDonations === 'object' && yearDonations !== null) {
                for (const monthKey in yearDonations) {
                  if (Object.prototype.hasOwnProperty.call(yearDonations, monthKey)) {
                    const monthlyAmount = yearDonations[monthKey];
                    const numAmount = Number(monthlyAmount);

                    if (!isNaN(numAmount)) {
                      totalDonation += numAmount;
                    } else {
                      console.warn(
                        `Non-numeric donation amount found for ${monthKey} in ${yearKey}:`,
                        monthlyAmount
                      );
                    }
                  }
                }
              } else {
                console.warn(`Unexpected structure for year ${yearKey} in donation:`, yearDonations);
              }
            }
          }
          console.log("Calculated total donation:", totalDonation);
        } else {
          console.log(
            "Donation field is missing or not an object:",
            memberDataFromDb.donation
          );
        }
      } else {
        console.warn("Member document does not exist for ID:", memberToDelete.id);
      }

      if (totalDonation > 0) {
        const archivedDonationsRef = collection(db, "archivedDonations");
        const archivedDocRef = doc(archivedDonationsRef, memberToDelete.id);

        console.log("Attempting to archive donation for:", memberToDelete.id);
        console.log("Data to archive:", {
          roll_no: Number(memberToDelete.roll_no),
          name: memberToDelete.name,
          last_name: memberToDelete.last_name,
          total_donation: totalDonation,
          deletion_date: new Date(),
        });

        await setDoc(archivedDocRef, {
          roll_no: Number(memberToDelete.roll_no),
          name: memberToDelete.name,
          last_name: memberToDelete.last_name,
          total_donation: totalDonation,
          deletion_date: new Date(),
        });
        console.log("Donation successfully archived!");
        setPopupMessage("✅ Member's total donation archived and details deleted.");
      } else {
        console.log("No positive total donation found, skipping archive.");
        setPopupMessage("🗑️ Member details deleted (no donation archived).");
      }

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
      await updateDoc(memberDocRef, fieldsToClear);
      console.log("Member details successfully deleted (fields cleared).");

      setPopupType("success");
      setMemberData(null);
      setSelectedRollNo("");
      fetchMembersFromFirebase();
    } catch (err) {
      console.error("Critical error during delete/archive process:", err);
      setPopupMessage(
        "❌ Error deleting member details or archiving donation. Please check console for details."
      );
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const maxRoll = getMaxRollNo();
  const addTabRolls = [...members.map((m) => Number(m.roll_no)), maxRoll + 1].sort(
    (a, b) => a - b
  );
  const deleteTabRolls = members.map((m) => Number(m.roll_no)).sort((a, b) => a - b);

  const areInputsReadOnly = selectedTab === "delete";


  return (
    <div
      className="min-h-[calc(100vh-10rem)] rounded-xl m-4 shadow-lg p-6 sm:p-8 flex flex-col items-center"
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

      <h2
        className="text-3xl font-extrabold mb-8 text-center"
        style={{
          color: theme.colors.neutralDark,
          fontFamily: theme.fonts.heading
        }}
      >
        Manage Members
      </h2>

      <div
        className="flex rounded-xl p-1 mb-8 shadow-sm w-full max-w-lg"
        style={{
          backgroundColor: theme.colors.tertiaryLight
        }}
      >
        <button
          onClick={() => {
            setSelectedTab("add");
            setSelectedRollNo("");
            setMemberData(null);
            setPopupMessage(null);
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              selectedTab === "add" ? theme.colors.primary : "transparent",
            color:
              selectedTab === "add" ?
              theme.colors.neutralLight :
              theme.colors.primary,
            boxShadow:
              selectedTab === "add" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== "add") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== "add") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading}
        >
          Add Member
        </button>
        <button
          onClick={() => {
            setSelectedTab("delete");
            setSelectedRollNo("");
            setMemberData(null);
            setPopupMessage(null);
          }}
          className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              selectedTab === "delete" ? theme.colors.danger : "transparent",
            color:
              selectedTab === "delete" ?
              theme.colors.neutralLight :
              theme.colors.primary,
            boxShadow:
              selectedTab === "delete" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.dangerLight,
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== "delete") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== "delete") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          disabled={isLoading}
        >
          Delete Member
        </button>
      </div>

      <div className="w-full max-w-lg mb-8 relative">
        <label
          htmlFor="member-roll-select"
          className="block text-sm font-medium mb-1"
          style={{
            color: theme.colors.primary
          }}
        >
          Select Roll Number
        </label>
        <select
          id="member-roll-select"
          value={selectedRollNo}
          onChange={(e) => handleRollChange(e.target.value)}
          className="block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            color: theme.colors.primary,
            borderWidth: "1px",
            borderStyle: "solid",
            outlineColor: theme.colors.primary,
          }}
          disabled={isLoading}
        >
          <option value="">-- Select --</option>
          {(selectedTab === "add" ? addTabRolls : deleteTabRolls).map((roll) => (
            <option key={roll} value={roll}>
              {roll} {selectedTab === "add" && roll === maxRoll + 1 ? "(New)" : ""}
            </option>
          ))}
        </select>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-6"
          style={{
            color: theme.colors.primary
          }}
        >
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {memberData && (
        <div
          className="w-full max-w-lg rounded-xl shadow-md p-6 border"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="name-input"
                className="block text-sm font-medium mb-1"
                style={{
                  color: theme.colors.primary
                }}
              >
                First Name
              </label>
              <input
                id="name-input"
                type="text"
                className={`w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out ${
                  areInputsReadOnly ? "cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: areInputsReadOnly ?
                    theme.colors.tertiaryLight :
                    theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  outlineColor: theme.colors.primary,
                }}
                value={memberData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                readOnly={areInputsReadOnly}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="last-name-input"
                className="block text-sm font-medium mb-1"
                style={{
                  color: theme.colors.primary
                }}
              >
                Last Name
              </label>
              <input
                id="last-name-input"
                type="text"
                className={`w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out ${
                  areInputsReadOnly ? "cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: areInputsReadOnly ?
                    theme.colors.tertiaryLight :
                    theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  outlineColor: theme.colors.primary,
                }}
                value={memberData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                readOnly={areInputsReadOnly}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-medium mb-1"
                style={{
                  color: theme.colors.primary
                }}
              >
                Email
              </label>
              <input
                id="email-input"
                type="email"
                className={`w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out ${
                  areInputsReadOnly ? "cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: areInputsReadOnly ?
                    theme.colors.tertiaryLight :
                    theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  outlineColor: theme.colors.primary,
                }}
                value={memberData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                readOnly={areInputsReadOnly}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="phone-input"
                className="block text-sm font-medium mb-1"
                style={{
                  color: theme.colors.primary
                }}
              >
                Phone
              </label>
              <input
                id="phone-input"
                type="tel"
                className={`w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out ${
                  areInputsReadOnly ? "cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: areInputsReadOnly ?
                    theme.colors.tertiaryLight :
                    theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  outlineColor: theme.colors.primary,
                }}
                value={memberData.phone_no || ""}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                readOnly={areInputsReadOnly}
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address-input"
                className="block text-sm font-medium mb-1"
                style={{
                  color: theme.colors.primary
                }}
              >
                Address
              </label>
              <textarea
                id="address-input"
                className={`w-full py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white shadow-sm transition duration-150 ease-in-out ${
                  areInputsReadOnly ? "cursor-not-allowed" : ""
                }`}
                rows="3"
                style={{
                  backgroundColor: areInputsReadOnly ?
                    theme.colors.tertiaryLight :
                    theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  outlineColor: theme.colors.primary,
                }}
                value={memberData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                readOnly={areInputsReadOnly}
                disabled={isLoading}
              ></textarea>
            </div>
          </div>

          {selectedTab === "add" && (
            <button
              onClick={handleSave}
              className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.neutralLight,
                "--tw-ring-color": theme.colors.primaryLight,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.colors.primaryLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.colors.primary)
              }
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Member"}
            </button>
          )}

          {selectedTab === "delete" && (
            <button
              onClick={handleDelete}
              className="w-full py-3 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75"
              style={{
                backgroundColor: theme.colors.danger,
                color: theme.colors.neutralLight,
                "--tw-ring-color": theme.colors.dangerLight,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.colors.dangerLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.colors.danger)
              }
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