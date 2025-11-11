import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import Loader from "./Loader";
import { theme } from "../theme";
import Topbar from "./Topbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
const LOGGED_IN_MEMBER_STORAGE_KEY = "loggedInMember";

// --- MemberImage Component (Retained and slightly adjusted for larger shadow) ---
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

  // Increased size slightly for better mobile appearance
  const sizeClass = isLarge ? "h-14 w-14 text-2xl shadow-md" : "h-12 w-12 text-xl shadow-sm";
  const fallbackBgColor = isLarge ? colors.tertiary : colors.primary;

  if (extensionIndex < possibleExtensions.length) {
    return (
      <img
        src={currentImageUrl}
        alt={`${name} profile`}
        onError={handleImageError}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 mr-4 border-2 border-white`}
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
// ---------------------------------------------------------------------------------

function InchargeList() {
  const [allMembers, setAllMembers] = useState([]);
  const [dailyAssignments, setDailyAssignments] = useState(null);
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState({
    loading: true,
    message: "Initializing data...",
    error: false,
  });

  const fetchAssignmentsFromFirestore = useCallback(async () => {
    // ... (Firestore fetch logic remains the same)
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
          setIsAdmin(!!memberData.isAdmin);
        }
      } catch (e) {
        console.error("Error loading logged-in member from local storage.", e);
        setIsAdmin(false);
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
    // ... (Firestore save logic remains the same)
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

      const snapshot = await getDocs(collectionRef);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(doc(collectionRef, docSnap.id));
      });

      newAssignmentsArray.forEach((assignment) => {
        batch.set(doc(collectionRef, assignment.rollId), {
          rollNumber: Number(assignment.rollId),
          star: assignment.star,
        });
      });

      await batch.commit();

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

  const handleDownloadPDF = async () => {
    // ... (PDF download logic remains the same - focusing on the component for now)
    setStatus({
        loading: true,
        message: `Generating PDF for ${activeDay}...`,
        error: false,
    });

    const pdfContent = document.createElement('div');
    pdfContent.style.width = '210mm'; 
    pdfContent.style.padding = '10mm';

    const header = document.createElement('h1');
    header.style.color = colors.primary;
    header.style.fontSize = '24px';
    header.style.marginBottom = '20px';
    header.textContent = `${activeDay} Incharge List`;
    pdfContent.appendChild(header);

    if (incharges.length > 0) {
        const inchargeHeader = document.createElement('h2');
        inchargeHeader.style.color = colors.tertiary;
        inchargeHeader.style.fontSize = '18px';
        inchargeHeader.style.borderLeft = `4px solid ${colors.tertiary}`;
        inchargeHeader.style.paddingLeft = '10px';
        inchargeHeader.style.marginBottom = '10px';
        inchargeHeader.textContent = `INCHARGE (${incharges.length})`;
        pdfContent.appendChild(inchargeHeader);

        incharges.forEach((member) => {
            const memberDiv = document.createElement('p');
            memberDiv.style.margin = '5px 0';
            memberDiv.style.paddingLeft = '10px';
            memberDiv.textContent = `⭐ ${member.name} ${member.last_name} (Roll No: ${member.roll_no})`;
            pdfContent.appendChild(memberDiv);
        });
        pdfContent.appendChild(document.createElement('hr'));
    }

    if (teamMembers.length > 0) {
        const teamHeader = document.createElement('h2');
        teamHeader.style.color = colors.primary;
        teamHeader.style.fontSize = '18px';
        teamHeader.style.borderLeft = `4px solid ${colors.primary}`;
        teamHeader.style.paddingLeft = '10px';
        teamHeader.style.marginBottom = '10px';
        teamHeader.style.marginTop = '20px';
        teamHeader.textContent = `Team Members (${teamMembers.length})`;
        pdfContent.appendChild(teamHeader);

        teamMembers.forEach((member) => {
            const memberDiv = document.createElement('p');
            memberDiv.style.margin = '5px 0';
            memberDiv.style.paddingLeft = '10px';
            memberDiv.textContent = `• ${member.name} ${member.last_name} (Roll No: ${member.roll_no})`;
            pdfContent.appendChild(memberDiv);
        });
    }

    document.body.appendChild(pdfContent);

    try {
        const canvas = await html2canvas(pdfContent, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 200; 
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const fileName = `${activeDay.toLowerCase()}-incharge-list-seconds.pdf`;
        pdf.save(fileName);

        setStatus({ loading: false, message: "PDF generated successfully.", error: false });

    } catch (error) {
        console.error("Error generating PDF:", error);
        setStatus({
            loading: false,
            message: `Failed to generate PDF.`,
            error: true,
        });
    } finally {
        document.body.removeChild(pdfContent);
        if (!status.error) {
            setTimeout(() => setStatus({ loading: false, message: "", error: false }), 3000);
        }
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

  const incharges = membersForActiveDay.filter((member) => member.star);
  const teamMembers = membersForActiveDay.filter((member) => !member.star);

  const AddMemberModal = ({ isOpen, onClose, currentAssignments, onSave }) => {
    // ... (Modal logic remains the same, adjusted styling slightly)
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
        className="fixed inset-0 flex justify-center items-center z-50 	px-6 	gap-4"
        style={{ backgroundColor: "rgba(59, 76, 122, 0.7)" }} // Darker overlay
      >
        <div
          className="rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto transform transition-all duration-300 animate-slide-in-up" // Rounded corners and animation
          style={{ backgroundColor: colors.neutralLight }}
        >
          <div
            className="sticky top-0 p-6 border-b z-10 rounded-t-3xl"
            style={{ backgroundColor: colors.neutralLight }}
          >
            <h3
              className="text-2xl font-extrabold"
              style={{ color: colors.primary, fontFamily: fonts.heading }}
            >
              Assign Team for {activeDay}
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
                      className={`flex items-center justify-between p-3 border border-gray-200 rounded-xl transition duration-150 ${assignment.isAssigned ? 'shadow-inner' : 'hover:bg-gray-50'}`} // Subtle shadow on selected
                      style={{ backgroundColor: assignment.isAssigned ? colors.primaryLight + "30" : colors.neutralLight }}
                    >
                      <label className="flex items-center space-x-4 cursor-pointer flex-grow">
                        <input
                          type="checkbox"
                          checked={assignment.isAssigned}
                          onChange={() => handleCheckboxChange(member.id)}
                          className="form-checkbox h-6 w-6 rounded-full focus:ring-0" // Rounded checkbox
                          style={{ color: colors.primary, accentColor: colors.primary }}
                        />
                        <span
                          className="text-base font-medium"
                          style={{
                            color: colors.neutralDark,
                            fontFamily: fonts.body,
                          }}
                        >
                          {member.name} {member.last_name}
                          <span className="text-xs text-gray-500 block">
                            Roll No: {member.roll_no}
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
            className="sticky bottom-0 p-4 border-t flex justify-end space-x-3 shadow-top z-10 rounded-b-3xl"
            style={{ backgroundColor: colors.neutralLight }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2 text-base font-medium rounded-full hover:bg-gray-200 transition duration-150"
              style={{
                backgroundColor: colors.primaryLight + "30",
                color: colors.neutralDark,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-base font-bold text-white rounded-full shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-50"
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

  return (
    <>
      <Topbar />
      <div
        className="min-h-screen pb-20" // Ensure min-height and padding for mobile
        style={{ backgroundColor: "#F0F0F0", fontFamily: fonts.body }}
      >
        <header
          className="shadow-xl rounded-b-3xl p-4 pt-20 mb-6" // Larger shadow, rounded bottom
          style={{ backgroundColor: colors.primary }}
        >
          <h1
            className="text-3xl font-extrabold text-white"
            style={{ fontFamily: fonts.heading }}
          >
            Team Roster
          </h1>
          <p className="text-white opacity-90 mt-1">Daily Incharge & Seva Assignments</p>
        </header>

        {/* Status/Error Message - Styled as an app notification/banner */}
        {status.message && !status.loading && (
          <div className="mx-4">
            <div
              className={`p-3 rounded-xl relative mb-4 shadow-md transition duration-300`}
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
              <span className="font-semibold">{status.error ? "🚨 Error: " : "✅ Success: "}</span> {status.message}
            </div>
          </div>
        )}
        
        {/* Day Selection Tabs - Social Media Style Pills */}
        <div className="px-4 mb-6">
          <div 
            className="flex overflow-x-auto p-1 space-x-2 rounded-full shadow-lg"
            style={{ backgroundColor: colors.neutralLight }}
          >
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`py-2 px-4 text-base font-semibold whitespace-nowrap rounded-full transition-all duration-300 ease-in-out focus:outline-none`}
                style={{
                  color: activeDay === day ? colors.neutralLight : colors.primary,
                  backgroundColor: activeDay === day ? colors.primary : "transparent",
                }}
                disabled={status.loading}
              >
                {day}
                {dailyAssignments[day]?.length > 0 && (
                  <span
                    className="ml-2 inline-flex items-center justify-center px-2 text-xs font-bold leading-none text-white rounded-full"
                    style={{ backgroundColor: colors.danger }}
                  >
                    {dailyAssignments[day].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mx-4 p-5 mb-6 rounded-3xl shadow-2xl transition transform duration-500" // Elevated card look
          style={{ backgroundColor: colors.neutralLight }}
        >
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h2
              className="text-2xl font-extrabold"
              style={{ color: colors.neutralDark, fontFamily: fonts.heading }}
            >
              {activeDay} Team
            </h2>

            {/* Admin Buttons Container - Grouped and styled as action buttons */}
            <div className="flex space-x-3"> 
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center p-2 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-50 text-sm"
                    style={{ backgroundColor: colors.secondary }}
                    disabled={status.loading || membersForActiveDay.length === 0}
                    aria-label="Download Roster PDF"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                </button>
            
                {isAdmin && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center p-2 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-50 text-sm"
                    style={{ backgroundColor: colors.primary }}
                    disabled={status.loading}
                    aria-label="Edit Roster"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                )}
            </div>
          </div>

          {membersForActiveDay.length === 0 ? (
            <div className="text-center py-10">
              <p
                className="text-lg font-medium mb-4"
                style={{ color: colors.primaryLight }}
              >
                No members are currently assigned for **{activeDay}**.
              </p>
              {isAdmin && (
                <p style={{ color: colors.primaryLight }}>
                  Tap the **Edit** button to assign a team.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {incharges.length > 0 && (
                <section>
                  <h3
                    className="text-xl font-extrabold mb-3 text-left tracking-wider" // Emphasis on section header
                    style={{
                      color: colors.tertiary,
                      fontFamily: fonts.heading,
                    }}
                  >
                    ⭐ INCHARGE ({incharges.length})
                  </h3>
                  <div className="space-y-4">
                    {incharges.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-2xl shadow-xl flex items-center transition transform hover:scale-[1.02] duration-300 border-2" // Prominent Incharge card
                        style={{
                          backgroundColor: colors.tertiaryLight,
                          borderColor: colors.tertiary,
                        }}
                      >
                        <MemberImage
                          rollNo={member.roll_no}
                          name={member.name}
                          isLarge={true}
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xl font-bold truncate flex items-center"
                            style={{ color: colors.neutralDark }}
                          >
                            {member.name} {member.last_name}
                          </p>
                          <p
                            className="text-sm mt-0.5 font-medium"
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
                    className="text-xl font-extrabold mb-3 text-left tracking-wider" // Emphasis on section header
                    style={{
                      color: colors.primary,
                      fontFamily: fonts.heading,
                      marginTop: incharges.length > 0 ? '30px' : '0'
                    }}
                  >
                    👥 Team Members ({teamMembers.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 rounded-xl shadow-md flex items-center transition hover:shadow-lg duration-200"
                        style={{
                          backgroundColor: colors.primaryLight + "15",
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