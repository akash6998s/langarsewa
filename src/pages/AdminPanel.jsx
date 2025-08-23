import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Loader from "../components/Loader";
import { theme } from "../theme";
import LoadData from "../components/LoadData";

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const [isConfirming, setIsConfirming] = useState(false);
  const [userToConfirm, setUserToConfirm] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);

  // Consolidated function to fetch all data
  const fetchAllUsers = async () => {
    setIsLoading(true);
    setPopupMessage(null);
    try {
      // Fetch pending users
      const pendingQuery = query(collection(db, "users"));
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingList = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingUsers(pendingList);

      // Fetch approved users
      const approvedQuery = query(collection(db, "members"), where("approved", "==", true));
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedList = approvedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApprovedUsers(approvedList);

    } catch (err) {
      console.error("Error fetching all users:", err);
      setPopupMessage("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = (user) => {
    setIsConfirming(true);
    setConfirmationAction("approve");
    setUserToConfirm(user);
    setPopupMessage(
      `Are you sure you want to approve user with roll number ${user.roll_no}?`
    );
  };

  const handleRemovePendingUser = (user) => {
    setIsConfirming(true);
    setConfirmationAction("removePending");
    setUserToConfirm(user);
    setPopupMessage(
      `Are you sure you want to remove the pending request for user with roll number ${user.roll_no}?`
    );
  };

  const handleRemoveApprovedUser = (user) => {
    setIsConfirming(true);
    setConfirmationAction("removeApproved");
    setUserToConfirm(user);
    setPopupMessage(
      `Are you sure you want to remove the approved member with roll number ${user.roll_no}? This will remove their login access.`
    );
  };

  const approveUser = async (user) => {
    if (!user.roll_no || !user.email || !user.password) {
      setPopupMessage(
        "❌ Missing email, password, or roll number for user approval."
      );
      return;
    }
    setIsLoading(true);
    setPopupMessage(null);

    try {
      const rollNo = user.roll_no.toString();
      const memberRef = doc(db, "members", rollNo);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        setPopupMessage(
          `❌ Member profile with roll number ${rollNo} not found in 'members' collection.`
        );
        setIsLoading(false);
        return;
      }

      const memberData = memberSnap.data();
      await setDoc(
        memberRef,
        {
          ...memberData,
          email: user.email,
          password: user.password,
          approved: true,
        },
        { merge: true }
      );

      await deleteDoc(doc(db, "users", user.id));

      setPopupMessage(
        `✅ User with roll no ${rollNo} has been successfully approved!`
      );
      fetchAllUsers(); // Call the consolidated function to refresh both lists
    } catch (err) {
      console.error("Error approving user:", err);
      setPopupMessage(`Failed to approve user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removePendingUser = async (user) => {
    setIsLoading(true);
    setPopupMessage(null);

    try {
      await deleteDoc(doc(db, "users", user.id));
      setPopupMessage(
        `🗑️ User with roll no ${user.roll_no} has been successfully removed from pending requests.`
      );
      fetchAllUsers(); // Call the consolidated function to refresh both lists
    } catch (err) {
      console.error("Error removing user:", err);
      setPopupMessage(`Failed to remove user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeApprovedUser = async (user) => {
    setIsLoading(true);
    setPopupMessage(null);

    try {
      const memberRef = doc(db, "members", user.roll_no.toString());
      await updateDoc(memberRef, {
        email: null,
        password: null,
        approved: false,
      });

      setPopupMessage(
        `🗑️ Member with roll no ${user.roll_no} has been successfully removed from the approved list.`
      );
      fetchAllUsers(); // Call the consolidated function to refresh both lists
    } catch (err) {
      console.error("Error removing approved user:", err);
      setPopupMessage(`Failed to remove approved user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = (isConfirmed) => {
    if (isConfirmed && userToConfirm) {
      if (confirmationAction === "approve") {
        approveUser(userToConfirm);
      } else if (confirmationAction === "removePending") {
        removePendingUser(userToConfirm);
      } else if (confirmationAction === "removeApproved") {
        removeApprovedUser(userToConfirm);
      }
    }
    setIsConfirming(false);
    setUserToConfirm(null);
    setConfirmationAction(null);
    if (!isConfirmed) {
      setPopupMessage(null);
    }
  };

  const closePopup = () => {
    setPopupMessage(null);
    if (isConfirming) {
      setIsConfirming(false);
      setUserToConfirm(null);
      setConfirmationAction(null);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []); // Empty dependency array means this runs only once on mount

  // Now, the activeTab useEffect only controls the loading state
  // as the data is already available.
  useEffect(() => {
    // This part is no longer needed for data fetching as it's handled by fetchAllUsers()
  }, [activeTab]);

  return (
    <div
      className="min-h-[calc(100vh-10rem)] rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center max-w-2xl mx-auto"
      style={{
        backgroundColor: theme.colors.neutralLight,
        fontFamily: theme.fonts.body,
      }}
    >
      <LoadData />
      {isLoading && <Loader />}

      {/* Inline Popup JSX */}
      {popupMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div
            className="relative p-8 rounded-xl shadow-lg w-full max-w-sm"
            style={{ backgroundColor: theme.colors.neutralLight }}
          >
            <p
              className="text-lg font-medium text-center"
              style={{ color: theme.colors.neutralDark }}
            >
              {popupMessage}
            </p>
            {isConfirming ? (
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => handleConfirmation(false)}
                  className="py-2 px-6 rounded-lg font-medium shadow-md transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.danger,
                    color: theme.colors.neutralLight,
                  }}
                >
                  No
                </button>
                <button
                  onClick={() => handleConfirmation(true)}
                  className="py-2 px-6 rounded-lg font-medium shadow-md transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.success,
                    color: theme.colors.neutralLight,
                  }}
                >
                  Yes
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-6">
                <button
                  onClick={closePopup}
                  className="py-2 px-6 rounded-lg font-medium shadow-md transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.neutralLight,
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <h2
        className="text-3xl font-extrabold mb-8 text-center"
        style={{
          color: theme.colors.neutralDark,
          fontFamily: theme.fonts.heading,
        }}
      >
        Admin Approval Panel
      </h2>

      {/* Tab Buttons */}
      <div
        className="flex rounded-xl p-1 mb-8 shadow-sm"
        style={{ backgroundColor: theme.colors.tertiaryLight }}
      >
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 flex flex-col items-center justify-center px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "pending" ? theme.colors.primary : "transparent",
            color:
              activeTab === "pending"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "pending" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "pending") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "pending") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          <span>Pending</span>
          <span className="text-sm font-bold mt-1">
            ({pendingUsers.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`flex-1 flex flex-col items-center justify-center px-6 py-3 text-center font-semibold rounded-lg transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          style={{
            backgroundColor:
              activeTab === "approved" ? theme.colors.success : "transparent",
            color:
              activeTab === "approved"
                ? theme.colors.neutralLight
                : theme.colors.primary,
            boxShadow:
              activeTab === "approved"
                ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                : "none",
            "--tw-ring-color": theme.colors.successLight,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "approved") {
              e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
              e.currentTarget.style.color = theme.colors.neutralDark;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "approved") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
        >
          <span>Approved</span>
          <span className="text-sm font-bold mt-1">
            ({approvedUsers.length})
          </span>
        </button>
      </div>

      {activeTab === "pending" && (
        <>
          {!isLoading && pendingUsers.length === 0 && !popupMessage && (
            <div
              className="flex flex-col items-center justify-center p-8 text-center rounded-lg shadow-inner mt-6 w-full max-w-md"
              style={{
                backgroundColor: theme.colors.neutralLight,
                border: `1px solid ${theme.colors.primaryLight}`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4"
                style={{ color: theme.colors.primary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <h3
                className="text-xl font-bold"
                style={{ color: theme.colors.neutralDark }}
              >
                No Pending Requests
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: theme.colors.neutralDark }}
              >
                All user requests have been approved or removed.
              </p>
              <p
                className="text-sm"
                style={{ color: theme.colors.neutralDark }}
              >
                Check back later for new signups.
              </p>
            </div>
          )}
          <div className="w-full max-w-md space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg shadow-md p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-200 ease-in-out hover:shadow-lg"
                style={{
                  backgroundColor: theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = theme.colors.primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    theme.colors.primaryLight)
                }
              >
                <div className="flex-grow mb-3 sm:mb-0">
                  <p
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Roll No:{" "}
                    <span
                      className="font-medium break-words"
                      style={{ color: theme.colors.primary }}
                    >
                      {user.roll_no}
                    </span>
                  </p>
                  <p
                    className="text-sm font-bold mt-1"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Email:{" "}
                    <span
                      className="font-normal break-words"
                      style={{ color: theme.colors.primary }}
                    >
                      {user.email}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveUser(user)}
                    className="font-medium py-2 px-5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.colors.success,
                      color: theme.colors.neutralLight,
                      "--tw-ring-color": theme.colors.successLight,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme.colors.successLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme.colors.success)
                    }
                    disabled={isLoading || isConfirming}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRemovePendingUser(user)}
                    className="font-medium py-2 px-5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.colors.danger,
                      color: theme.colors.neutralLight,
                      "--tw-ring-color": theme.colors.dangerLight,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme.colors.dangerLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme.colors.danger)
                    }
                    disabled={isLoading || isConfirming}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "approved" && (
        <>
          {!isLoading && approvedUsers.length === 0 && !popupMessage && (
            <div
              className="border-l-4 p-4 rounded-lg shadow-md mt-6 w-full max-w-md text-center"
              style={{
                backgroundColor: theme.colors.primaryLight,
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
              }}
            >
              <p
                className="font-semibold text-lg"
                style={{ color: theme.colors.neutralDark }}
              >
                🤷‍♂️ No approved users found.
              </p>
              <p className="text-sm mt-1">
                Approved users will appear here after being added.
              </p>
            </div>
          )}
          <div className="w-full max-w-md space-y-4">
            {approvedUsers
              .sort((a, b) => Number(a.roll_no) - Number(b.roll_no))
              .map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg shadow-md px-2 py-2 flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg"
                  style={{
                    backgroundColor: theme.colors.neutralLight,
                    borderColor: theme.colors.success,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = theme.colors.success)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      theme.colors.successLight)
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: theme.colors.neutralDark }}
                    >
                      Roll No:{" "}
                      <span
                        className="font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {user.roll_no}
                      </span>
                    </p>
                    <button
                      onClick={() => handleRemoveApprovedUser(user)}
                      className="font-medium py-2 px-5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      style={{
                        backgroundColor: theme.colors.danger,
                        color: theme.colors.neutralLight,
                        "--tw-ring-color": theme.colors.dangerLight,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.dangerLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          theme.colors.danger)
                      }
                      disabled={isLoading || isConfirming}
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.neutralDark }}
                    >
                      Name:{" "}
                      <span
                        className="font-normal break-words"
                        style={{ color: theme.colors.primary }}
                      >
                        {user.name} {user.last_name || ""}
                      </span>
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: theme.colors.neutralDark }}
                    >
                      Email:{" "}
                      <span
                        className="font-normal break-words"
                        style={{ color: theme.colors.primary }}
                      >
                        {user.email}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;