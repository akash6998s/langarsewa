import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import db from your firebase config
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your custom Popup component

const Members = () => {
  const [members, setMembers] = useState([]);
  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true); // Set to true initially to show loader on first load
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  // Function to fetch members from Firebase
  const fetchMembersFromFirebase = async () => {
    setIsLoading(true); // Start loading
    setPopupMessage(null); // Clear any previous messages
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const memberList = [];
      querySnapshot.forEach((docSnap) => {
        const memberData = docSnap.data();
        // Ensure roll_no is present and use doc.id as a fallback if needed
        const rollNo = memberData.roll_no || docSnap.id;

        // Construct image URL. Note: This URL points to a GitHub repository.
        // For a production application, consider using Firebase Storage for images.
        let imageUrl = '';
        if (memberData.img && typeof memberData.img === 'string') {
          // If member.img contains a full URL, use it directly
          if (memberData.img.startsWith('http')) {
            imageUrl = memberData.img;
          } else {
            // Otherwise, assume it's a filename and construct the URL
            let ext = 'png'; // Default extension
            const match = memberData.img.match(/\.(png|jpg|jpeg|webp|ico)$/);
            if (match) ext = match[1];
            imageUrl = `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${rollNo}.${ext}`;
          }
        } else {
          // Fallback if no specific image is provided
          imageUrl = `https://placehold.co/150x150/E0E7FF/4338CA?text=${rollNo}`; // Placeholder with roll number
        }


        memberList.push({ id: docSnap.id, ...memberData, roll_no: rollNo, img: imageUrl });
      });
      setMembers(memberList);
    } catch (err) {
      console.error("Error fetching members from Firebase:", err);
      setPopupMessage("Failed to load members. Please try again.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchMembersFromFirebase();
  }, []); // Fetch members on component mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8 font-sans">
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

      <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-sm">Our Members</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-center text-gray-600 text-xl font-medium">Loading members...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center">
          {members.map((member) => (
            <div
              key={member.id} // Use Firebase doc.id as the key
              className="bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border border-gray-100 transform motion-safe:hover:scale-105"
            >
              <div className="w-28 h-28 bg-blue-50 rounded-full mx-auto mb-5 flex items-center justify-center overflow-hidden border-4 border-blue-200 shadow-md">
                <img
                  src={member.img}
                  alt={`${member.name}'s profile`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Only change the src if it's not already the placeholder
                    if (e.target.src !== `https://placehold.co/150x150/E0E7FF/4338CA?text=${member.roll_no}`) {
                      e.target.src = `https://placehold.co/150x150/E0E7FF/4338CA?text=${member.roll_no}`;
                    }
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2 leading-tight truncate px-2">
                {member.name} {member.last_name}
              </h3>
              <p className="text-gray-700 text-base mb-1">
                <strong className="font-semibold text-gray-800">Roll No:</strong> {member.roll_no}
              </p>
              {member.email && (
                <p className="text-gray-700 text-sm mb-1 truncate px-2">
                  <strong className="font-semibold text-gray-800">Email:</strong> {member.email}
                </p>
              )}
              {member.phone_no && (
                <p className="text-gray-700 text-sm mb-1">
                  <strong className="font-semibold text-gray-800">Phone:</strong> {member.phone_no}
                </p>
              )}
              {member.address && (
                <p className="text-gray-700 text-sm leading-snug px-2">
                  <strong className="font-semibold text-gray-800">Address:</strong> {member.address}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-center text-gray-600 text-xl font-medium">No members found.</p>
        </div>
      )}
    </div>
  );
};

export default Members;