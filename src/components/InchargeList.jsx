import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Loader from "./Loader";
import { theme } from "../theme";
import Topbar from "./Topbar";

const { colors, fonts } = theme;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const ASSIGNMENTS_STORAGE_KEY = "memberAssignmentsByDay";
// Define the new storage key for the logged-in user
const LOGGED_IN_MEMBER_STORAGE_KEY = "loggedInMember";

const MemberImage = ({ rollNo, name, isLarge = false }) => {
  const baseImageUrl = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${rollNo}`;
  const possibleExtensions = ["png", "jpg", "jpeg"];

  const [extensionIndex, setExtensionIndex] = useState(0);

  const currentImageUrl = `${baseImageUrl}.${possibleExtensions[extensionIndex]}`;

  const handleImageError = () => {
    if (extensionIndex < possibleExtensions.length - 1) {
      setExtensionIndex((prevIndex) => prevIndex + 1);
    } else {
      setExtensionIndex(possibleExtensions.length);
    }
  };

  const sizeClass = isLarge ? "h-12 w-12 text-xl" : "h-10 w-10 text-lg";
  const fallbackBgColor = isLarge ? colors.tertiary : colors.primary;

  if (extensionIndex < possibleExtensions.length) {
    return (
      <img
        src={currentImageUrl}
        alt={`${name} profile`}
        onError={handleImageError}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 mr-4`}
      />
    );
  } else {
    const initials = name ? name.charAt(0).toUpperCase() : "M";
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0`}
        style={{ backgroundColor: fallbackBgColor }}
      >
        {initials}
      </div>
    );
  }
};

function InchargeList() {
  const [allMembers, setAllMembers] = useState([]);
  const [dailyAssignments, setDailyAssignments] = useState(null);
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin check
  const [status, setStatus] = useState({
    loading: true,
    message: "Initializing data...",
    error: false,
  });

  const fetchAssignmentsFromFirestore = useCallback(async () => {
    const fetchedAssignments = {};
    let success = true;

    for (const day of DAYS) {
      try {
        const collectionPath = `incharge/${day.toLowerCase()}/rolls`;
        const rollsCollectionRef = collection(db, collectionPath);

        const querySnapshot = await getDocs(rollsCollectionRef);

        fetchedAssignments[day] = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            rollId: docSnap.id,
            star: !!data.star,
          };
        });
      } catch (error) {
        console.error(`Error fetching assignments for ${day}:`, error);
        setStatus({
          loading: false,
          message: `Failed to load assignments from Firebase.`,
          error: true,
        });
        success = false;
        break;
      }
    }
    if (success) {
      return fetchedAssignments;
    }
    return null;
  }, []);

  const saveAssignmentsLocally = (newAssignments) => {
    setDailyAssignments(newAssignments);
    localStorage.setItem(
      ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(newAssignments)
    );
  };

  useEffect(() => {
    const initializeData = async () => {
      // 1. Check Admin Status
      try {
        const loggedInMemberString = localStorage.getItem(
          LOGGED_IN_MEMBER_STORAGE_KEY
        );
        if (loggedInMemberString) {
          const memberData = JSON.parse(loggedInMemberString);
          // Set isAdmin to true if the stored data has isAdmin: true
          setIsAdmin(!!memberData.isAdmin);
        }
      } catch (e) {
        console.error("Error loading logged-in member from local storage.", e);
        setIsAdmin(false); // Default to false on error
      }

      // 2. Load all members
      try {
        const membersString = localStorage.getItem("allMembers");
        if (membersString) {
          const parsedMembers = JSON.parse(membersString);
          if (Array.isArray(parsedMembers)) {
            setAllMembers(parsedMembers);
          }
        }
      } catch (e) {
        console.error("Error loading all members from local storage.", e);
      }

      // 3. Load/Fetch assignments
      const assignmentsString = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      let initialAssignments;

      if (assignmentsString) {
        initialAssignments = JSON.parse(assignmentsString);
        // Suppressing success message for local storage load
        setStatus((prev) => ({ ...prev, loading: false, message: "" }));
      } else {
        setStatus((prev) => ({
          ...prev,
          message: "Fetching assignments from Firebase...",
        }));

        const firestoreAssignments = await fetchAssignmentsFromFirestore();

        if (firestoreAssignments) {
          initialAssignments = firestoreAssignments;
          localStorage.setItem(
            ASSIGNMENTS_STORAGE_KEY,
            JSON.stringify(firestoreAssignments)
          );
          // Suppressing success message for Firestore load
          setStatus({ loading: false, message: "", error: false });
        } else {
          initialAssignments = DAYS.reduce(
            (acc, day) => ({ ...acc, [day]: [] }),
            {}
          );
          if (!status.error) {
            setStatus({
              loading: false,
              message: "No assignments found/initialized.",
              error: false,
            });
          }
        }
      }

      setDailyAssignments(initialAssignments);
    };

    initializeData();
  }, [fetchAssignmentsFromFirestore]);

  const handleSaveAssignments = async (newAssignmentsArray) => {
    if (!dailyAssignments) return;

    const dayKey = activeDay.toLowerCase();
    const collectionPath = `incharge/${dayKey}/rolls`;

    const updatedAssignments = {
      ...dailyAssignments,
      [activeDay]: newAssignmentsArray,
    };
    saveAssignmentsLocally(updatedAssignments);
    setIsModalOpen(false);

    setStatus({
      loading: true,
      message: `Saving ${activeDay} assignments to Firebase...`,
      error: false,
    });

    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, collectionPath);

      // Fetch current documents to delete
      const snapshot = await getDocs(collectionRef);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(doc(collectionRef, docSnap.id));
      });

      // Set new documents
      newAssignmentsArray.forEach((assignment) => {
        batch.set(doc(collectionRef, assignment.rollId), {
          rollNumber: Number(assignment.rollId),
          star: assignment.star,
        });
      });

      await batch.commit();

      // Suppressing success message for saving
      setStatus({ loading: false, message: "", error: false });
    } catch (error) {
      console.error("Error updating assignments in Firestore:", error);
      setStatus({
        loading: false,
        message: `Failed to save ${activeDay} to Firebase. Check console/security rules.`,
        error: true,
      });
    }
  };

  const membersForActiveDay = allMembers
    .filter(
      (member) =>
        dailyAssignments &&
        dailyAssignments[activeDay]?.some(
          (assignment) => assignment.rollId === String(member.id)
        )
    )
    .map((member) => {
      const assignment = dailyAssignments[activeDay].find(
        (a) => a.rollId === String(member.id)
      );
      return {
        ...member,
        star: assignment ? assignment.star : false,
      };
    })
    .sort((a, b) => {
      if (a.star && !b.star) return -1;
      if (!a.star && b.star) return 1;
      return 0;
    });

  const AddMemberModal = ({ isOpen, onClose, currentAssignments, onSave }) => {
    // ... (Modal logic remains the same)
    const [modalAssignments, setModalAssignments] = useState(() => {
      const initialMap = allMembers.reduce((acc, member) => {
        const memberId = String(member.id);
        const current = currentAssignments.find((a) => a.rollId === memberId);
        acc[memberId] = {
          isAssigned: !!current,
          star: current ? current.star : false,
        };
        return acc;
      }, {});
      return initialMap;
    });

    useEffect(() => {
      setModalAssignments(
        allMembers.reduce((acc, member) => {
          const memberId = String(member.id);
          const current = currentAssignments.find((a) => a.rollId === memberId);
          acc[memberId] = {
            isAssigned: !!current,
            star: current ? current.star : false,
          };
          return acc;
        }, {})
      );
    }, [currentAssignments, allMembers]);

    if (!isOpen) return null;

    const handleCheckboxChange = (memberId) => {
      setModalAssignments((prev) => {
        const idString = String(memberId);
        const newState = !prev[idString].isAssigned;

        return {
          ...prev,
          [idString]: {
            ...prev[idString],
            isAssigned: newState,
            star: newState ? prev[idString].star : false,
          },
        };
      });
    };

    const handleStarToggle = (memberId) => {
      setModalAssignments((prev) => {
        const idString = String(memberId);
        return {
          ...prev,
          [idString]: {
            ...prev[idString],
            star: !prev[idString].star,
          },
        };
      });
    };

    const handleSave = () => {
      const finalAssignments = Object.entries(modalAssignments)
        .filter(([, assignment]) => assignment.isAssigned)
        .map(([rollId, assignment]) => ({
          rollId: rollId,
          star: assignment.star,
        }));

      onSave(finalAssignments);
    };

    return (
      <div
        className="fixed inset-0 flex justify-center items-center z-50  px-6  gap-4"
        style={{ backgroundColor: "rgba(59, 76, 122, 0.5)" }}
      >
        <div
          className="rounded-xl shadow-2xl w-full max-w-lg max-h-[75vh] overflow-y-auto transform transition-all duration-300"
          style={{ backgroundColor: colors.neutralLight }}
        >
          <div
            className="sticky top-0 p-6 border-b z-10"
            style={{ backgroundColor: colors.neutralLight }}
          >
            <h3
              className="text-2xl font-bold"
              style={{ color: colors.primary, fontFamily: fonts.heading }}
            >
              Assign Members for {activeDay}
            </h3>
          </div>

          <div className="p-6">
            {allMembers.length === 0 ? (
              <p className="text-gray-500">No members available to assign.</p>
            ) : (
              <div className="space-y-3">
                {allMembers.map((member) => {
                  const idString = String(member.id);
                  const assignment = modalAssignments[idString];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg transition duration-150"
                      style={{ backgroundColor: colors.primaryLight + "10" }}
                    >
                      <label className="flex items-center space-x-4 cursor-pointer flex-grow">
                        <input
                          type="checkbox"
                          checked={assignment.isAssigned}
                          onChange={() => handleCheckboxChange(member.id)}
                          className="form-checkbox h-5 w-5 rounded-md focus:ring-indigo-500"
                          style={{ color: colors.primary }}
                        />
                        <span
                          className="text-base font-medium"
                          style={{
                            color: colors.neutralDark,
                            fontFamily: fonts.body,
                          }}
                        >
                          {member.name} {member.last_name}
                          <span className="text-sm text-gray-500 ml-2">
                            (Roll No: {member.roll_no})
                          </span>
                        </span>
                      </label>

                      {assignment.isAssigned && (
                        <button
                          onClick={() => handleStarToggle(member.id)}
                          className="p-2 rounded-full transition duration-200"
                          style={{
                            color: assignment.star
                              ? colors.tertiary
                              : colors.primaryLight,
                          }}
                          aria-label={
                            assignment.star
                              ? "Unmark as Incharge"
                              : "Mark as Incharge"
                          }
                        >
                          <svg
                            className="w-6 h-6 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.858 6.908-1.004 3.085-6.248 3.085 6.248 6.908 1.004-4.993 4.858 1.179 6.873z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="sticky bottom-0 p-4 border-t flex justify-end space-x-3 shadow-top z-10"
            style={{ backgroundColor: colors.neutralLight }}
          >
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-gray-200 transition duration-150"
              style={{
                backgroundColor: colors.primaryLight + "30",
                color: colors.neutralDark,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white rounded-lg shadow-md hover:opacity-90 transition duration-150 disabled:opacity-50"
              style={{
                backgroundColor: colors.primary,
                fontFamily: fonts.body,
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (dailyAssignments === null || status.loading) {
    return <Loader />;
  }

  const incharges = membersForActiveDay.filter((member) => member.star);
  const teamMembers = membersForActiveDay.filter((member) => !member.star);

  return (
    <>
    <Topbar/>
      <div
        className="px-4 pt-16"
        style={{ backgroundColor: "#F0F0F0", fontFamily: fonts.body }}
      >
        <header
          className="shadow-md rounded-xl p-4 mb-4"
          style={{ backgroundColor: colors.neutralLight }}
        >
          <h1
            className="text-2xl font-extrabold pb-2"
            style={{
              color: colors.neutralDark,
              borderBottom: `2px solid ${colors.primary}`,
              fontFamily: fonts.heading,
            }}
          >
            Incharge List
          </h1>
        </header>

        {/* Status/Error Message - Only renders if message is NOT empty (i.e., only for errors or initial loading hints) */}
        {status.message && !status.loading && (
          <div
            className="p-3 rounded-lg relative mb-4 shadow-sm"
            style={{
              backgroundColor: status.error
                ? colors.dangerLight
                : colors.successLight,
              border: `1px solid ${
                status.error ? colors.danger : colors.success
              }`,
              color: status.error ? colors.danger : colors.success,
            }}
          >
            {status.error ? "🚨 Error: " : "✅ Success: "} {status.message}
          </div>
        )}

        <div
          className="flex overflow-x-auto border-b border-gray-300 rounded-t-xl shadow-md"
          style={{ backgroundColor: colors.neutralLight }}
        >
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`py-3 px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none`}
              style={{
                color: activeDay === day ? colors.primary : colors.neutralDark,
                borderBottom:
                  activeDay === day ? `4px solid ${colors.primary}` : "none",
                backgroundColor:
                  activeDay === day
                    ? colors.primaryLight + "20"
                    : colors.neutralLight,
              }}
              disabled={status.loading}
            >
              {day}
              {dailyAssignments[day]?.length > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white rounded-full"
                  style={{ backgroundColor: colors.danger }}
                >
                  {dailyAssignments[day].length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          className="mt-3 px-4 py-8 mb-6 rounded-b-xl shadow-lg"
          style={{ backgroundColor: colors.neutralLight }}
        >
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2
              className="text-xl font-bold"
              style={{ color: colors.neutralDark, fontFamily: fonts.heading }}
            >
              {activeDay}
            </h2>

            {/* CONDITIONAL RENDERING: Only show Edit button if isAdmin is true */}
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 text-white font-medium rounded-lg shadow-md hover:opacity-90 transition duration-150 disabled:opacity-50 text-sm"
                style={{ backgroundColor: colors.primary }}
                disabled={status.loading}
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Edit
              </button>
            )}
          </div>

          {membersForActiveDay.length === 0 ? (
            <div className="text-center py-10">
              <p
                className="text-lg mb-4"
                style={{ color: colors.primaryLight }}
              >
                No members are currently assigned for {activeDay}.
              </p>
              {isAdmin && (
                <p style={{ color: colors.primaryLight }}>
                  Tap "Edit" to assign a team.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {incharges.length > 0 && (
                <section>
                  <h3
                    className="text-lg font-bold mb-3 pl-2"
                    style={{
                      color: colors.neutralDark,
                      borderLeft: `4px solid ${colors.tertiary}`,
                      fontFamily: fonts.heading,
                    }}
                  >
                    INCHARGE ({incharges.length})
                  </h3>
                  <div className="space-y-3">
                    {incharges.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-xl shadow-lg flex items-center transition transform hover:scale-[1.01]"
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          border: `1px solid ${colors.tertiary}`,
                        }}
                      >
                        <MemberImage
                          rollNo={member.roll_no}
                          name={member.name}
                          isLarge={true}
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-lg font-extrabold truncate flex items-center"
                            style={{ color: colors.neutralDark }}
                          >
                            {member.name} {member.last_name}
                          </p>
                          <p
                            className="text-sm mt-0.5"
                            style={{ color: colors.primary }}
                          >
                            Roll No: {member.roll_no}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {teamMembers.length > 0 && (
                <section>
                  <h3
                    className="text-lg font-bold mb-3 pl-2"
                    style={{
                      color: colors.neutralDark,
                      borderLeft: `4px solid ${colors.primary}`,
                      fontFamily: fonts.heading,
                    }}
                  >
                    Team Members ({teamMembers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 rounded-lg shadow-sm flex items-center transition hover:shadow-md"
                        style={{
                          backgroundColor: colors.primaryLight + "20",
                          border: `1px solid ${colors.primaryLight}`,
                        }}
                      >
                        <MemberImage
                          rollNo={member.roll_no}
                          name={member.name}
                          isLarge={false}
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-base font-semibold truncate"
                            style={{ color: colors.neutralDark }}
                          >
                            {member.name} {member.last_name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.primary }}
                          >
                            Roll No: {member.roll_no}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* CONDITIONAL RENDERING: Only render the modal if isAdmin is true AND we have assignments data */}
        {isAdmin && dailyAssignments && (
          <AddMemberModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            currentAssignments={dailyAssignments[activeDay] || []}
            onSave={handleSaveAssignments}
          />
        )}
      </div>
    </>
  );
}

export default InchargeList;
