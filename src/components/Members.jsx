import React, { useEffect, useState } from 'react';
// No Firebase imports needed
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your custom Popup component
import { theme } from '../theme'; // Import the theme
import LoadData from './LoadData';

const Members = () => {
  const [members, setMembers] = useState([]);
  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(true); // Set to true initially to show loader on first load
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  // Function to fetch members from Local Storage
  const fetchMembersFromLocalStorage = async () => {
    setIsLoading(true); // Start loading
    setPopupMessage(null); // Clear any previous messages
    try {
      const storedMembers = localStorage.getItem("allMembers");
      let memberList = [];

      if (storedMembers) {
        try {
          memberList = JSON.parse(storedMembers);
          // Ensure memberList is an array, if not, treat as empty
          if (!Array.isArray(memberList)) {
            console.warn("Data from 'allMembers' in localStorage is not an array. Resetting.");
            memberList = [];
          }
        } catch (parseError) {
          console.error("Error parsing members from localStorage:", parseError);
          setPopupMessage("Failed to parse member data from local storage.");
          setPopupType("error");
          memberList = []; // Ensure it's an empty array on parse error
        }
      } else {
        console.log("No 'allMembers' found in localStorage.");
        setPopupMessage("No member data found in local storage.");
        setPopupType("error");
      }

      // Process each member from the local storage data
      const processedMembers = memberList.map((member) => {
        // Ensure roll_no is present and use a fallback or default if needed
        const rollNo = member.roll_no || member.id; // Use id if roll_no is missing

        // Construct the image URL.
        // Assuming .png extension as per previous context.
        // This path is static and doesn't rely on data from localStorage beyond roll_no.
        const imageUrl = `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${rollNo}.png`;

        return {
          ...member,
          roll_no: rollNo, // Ensure roll_no is set
          img: member.img || imageUrl, // Use existing img if available, otherwise default to generated URL
        };
      }).sort((a, b) => { // Sort members by roll_no
        const rollA = parseInt(a.roll_no, 10);
        const rollB = parseInt(b.roll_no, 10);
        if (isNaN(rollA) && isNaN(rollB)) return 0;
        if (isNaN(rollA)) return 1; // Put members with invalid roll_no at the end
        if (isNaN(rollB)) return -1; // Put members with invalid roll_no at the end
        return rollA - rollB;
      });

      setMembers(processedMembers);

      if (processedMembers.length === 0 && !popupMessage) {
        setPopupMessage("No members available.");
        setPopupType("info"); // Use 'info' type for no members found
      }

    } catch (err) {
      console.error("Error fetching members from localStorage:", err);
      setPopupMessage("An unexpected error occurred while loading members.");
      setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchMembersFromLocalStorage();
  }, []); // Fetch members on component mount

  return (
    // Main container with themed background and body font
    <div
      className="pb-24 pt-6 px-4 sm:px-6 lg:px-8 font-[Inter,sans-serif]"
      style={{ background: theme.colors.background }}
    >
      <LoadData/>
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

      {/* Page Title with themed heading font and color */}
      <h2
        className="text-4xl font-extrabold text-center mb-12 drop-shadow-sm font-[EB_Garamond,serif]"
        style={{ color: theme.colors.neutralDark }}
      >
        Our Members
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p
            className="text-center text-xl font-medium"
            style={{ color: theme.colors.primary }}
          >
            Loading members...
          </p>
        </div>
      ) : members.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center">
          {members.map((member) => (
            <div
              key={member.id} // Use member.id as the key
              className="rounded-xl shadow-lg p-6 text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border transform motion-safe:hover:scale-105"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <div
                className="w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center overflow-hidden border-4 shadow-md"
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary,
                }}
              >
                {/* Image will always attempt to load from the constructed URL, or use existing img if provided */}
                {member.img ? (
                  <img
                    src={member.img}
                    alt={`${member.name}'s profile`}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // If the image fails to load, replace with a default background/icon or hide
                      e.target.style.display = 'none'; // Hide the broken image
                      // Optionally, you could replace with a default image or initials
                      // e.target.parentNode.style.backgroundColor = theme.colors.primaryLight;
                      // e.target.parentNode.innerHTML = `<span class="text-white text-3xl font-bold">${(member.name || 'N/A').charAt(0)}</span>`;
                    }}
                  />
                ) : (
                  // Fallback for members without an 'img' field or if 'img' is an empty string
                  <span className="text-white text-3xl font-bold">
                    {(member.name || 'N/A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3
                className="text-2xl font-bold mb-2 leading-tight truncate px-2"
                style={{ color: theme.colors.primary }}
              >
                {member.name} {member.last_name}
              </h3>
              <p
                className="text-base mb-1"
                style={{ color: theme.colors.primary }}
              >
                <strong
                  className="font-semibold"
                  style={{ color: theme.colors.neutralDark }}
                >
                  Roll No:
                </strong>{" "}
                {member.roll_no}
              </p>
              {member.email && (
                <p
                  className="text-sm mb-1 truncate px-2"
                  style={{ color: theme.colors.primary }}
                >
                  <strong
                    className="font-semibold"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Email:
                  </strong>{" "}
                  {member.email}
                </p>
              )}
              {member.phone_no && (
                <p
                  className="text-sm mb-1"
                  style={{ color: theme.colors.primary }}
                >
                  <strong
                    className="font-semibold"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Phone:
                  </strong>{" "}
                  {member.phone_no}
                </p>
              )}
              {member.address && (
                <p
                  className="text-sm leading-snug px-2"
                  style={{ color: theme.colors.primary }}
                >
                  <strong
                    className="font-semibold"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Address:
                  </strong>{" "}
                  {member.address}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p
            className="text-center text-xl font-medium"
            style={{ color: theme.colors.primary }}
          >
            No members found.
          </p>
        </div>
      )}
    </div>
  );
};

export default Members;