import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Loader from "../components/Loader"; // Import your Loader component
import CustomPopup from "../components/Popup"; // Import your CustomPopup component

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Renamed from 'loading' for consistency
  const [popupMessage, setPopupMessage] = useState(null); // Replaces 'error' state
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  const fetchUsers = async () => {
    setIsLoading(true);
    setPopupMessage(null); // Clear any previous popup messages
    setPopupType(null);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      // Filter out users that might already be approved or have incomplete data for display
      const pendingUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.email && user.roll_no && !user.approved); // Ensure basic data exists and not already approved
      setUsers(pendingUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setPopupMessage("Failed to load users for approval.");
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = async (user) => {
    // Basic validation before starting the process
    if (!user.roll_no || !user.email || !user.password) {
      setPopupMessage("❌ Missing email, password, or roll number for user approval.");
      setPopupType("error");
      return;
    }

    setIsLoading(true);
    setPopupMessage(null); // Clear any previous popup messages
    setPopupType(null);

    try {
      const rollNo = user.roll_no.toString();
      const memberRef = doc(db, "members", rollNo);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        setPopupMessage(`❌ Member profile with roll number ${rollNo} not found in 'members' collection. Please ensure a member profile exists for this roll number.`);
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      // Merge user data into the existing member profile
      const memberData = memberSnap.data();
      await setDoc(
        memberRef,
        {
          ...memberData,
          email: user.email,
          password: user.password, // IMPORTANT: Storing plain text password in Firestore is INSECURE and NOT recommended for production. Consider hashing or re-thinking your user data flow.
          approved: true,
          // You might also want to add isAdmin: false, isSuperAdmin: false by default here
          // unless your 'members' document already has these or they're handled elsewhere.
        },
        { merge: true } // Use merge to avoid overwriting other fields in the member document
      );

      // Delete the pending user request from the 'users' collection
      await deleteDoc(doc(db, "users", user.id));

      setPopupMessage(`✅ User with roll no ${rollNo} has been successfully approved!`);
      setPopupType("success");
      fetchUsers(); // Refresh the list of pending users
    } catch (err) {
      console.error("Error approving user:", err);
      setPopupMessage(`Failed to approve user: ${err.message}`);
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg p-6 sm:p-8 font-sans flex flex-col items-center max-w-2xl mx-auto">
      {/* Loader Component */}
      {isLoading && <Loader />}

      {/* Custom Popup Component */}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)} // Allow user to dismiss popup
        />
      )}

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Admin Approval Panel</h2>

      {/* No pending users message */}
      {!isLoading && users.length === 0 && !popupMessage && ( // Only show if not loading, no users, AND no active popup
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md mt-6 w-full max-w-md text-center">
          <p className="font-semibold text-lg">🎉 No pending user requests at the moment.</p>
          <p className="text-sm mt-1">Check back later for new signups.</p>
        </div>
      )}

      <div className="w-full max-w-md space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-200 ease-in-out hover:shadow-lg hover:border-blue-300"
          >
            <div className="flex-grow mb-3 sm:mb-0">
              <p className="text-gray-800 text-lg font-semibold">
                Email: <span className="font-normal text-blue-700 break-words">{user.email}</span>
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Roll No: <span className="font-medium text-gray-700">{user.roll_no}</span>
              </p>
            </div>
            <button
              onClick={() => approveUser(user)}
              className="bg-green-600 text-white font-medium py-2 px-5 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button during approval process
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;