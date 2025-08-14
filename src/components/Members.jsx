import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import CustomPopup from './Popup';
import { theme } from '../theme';
import LoadData from './LoadData';
import Topbar from './Topbar';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to check if an image URL is valid
  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok; // Returns true if the image exists and is accessible
    } catch (error) {
      console.log(error)
      return false; // Returns false on network error or other issues
    }
  };

  const fetchMembersFromLocalStorage = async () => {
    setIsLoading(true);
    setPopupMessage(null);

    const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const storedMembers = localStorage.getItem("allMembers");
      let memberList = [];

      if (storedMembers) {
        try {
          memberList = JSON.parse(storedMembers);
          if (!Array.isArray(memberList)) {
            console.warn("Data from 'allMembers' in localStorage is not an array. Resetting.");
            memberList = [];
          }
        } catch (parseError) {
          console.error("Error parsing members from localStorage:", parseError);
          setPopupMessage("Failed to parse member data from local storage.");
          setPopupType("error");
          memberList = [];
        }
      }

      const processedMembers = await Promise.all(memberList.map(async (member) => {
        const rollNo = member.roll_no || member.id;
        const baseImageUrl = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${rollNo}`;
        const possibleExtensions = ['png', 'jpg', 'jpeg'];
        let finalImageUrl = null;

        // Check for existing 'img' field first
        if (member.img && member.img.length > 0) {
          finalImageUrl = member.img;
        } else {
          // If no 'img' field, try to find a valid image URL with different extensions
          for (const ext of possibleExtensions) {
            const testUrl = `${baseImageUrl}.${ext}`;
            if (await checkImageExists(testUrl)) {
              finalImageUrl = testUrl;
              break; // Stop checking once a valid image is found
            }
          }
        }

        return {
          ...member,
          roll_no: rollNo,
          img: finalImageUrl, // Use the found image URL or null if none found
        };
      }));

      const sortedMembers = processedMembers.sort((a, b) => {
        const rollA = parseInt(a.roll_no, 10);
        const rollB = parseInt(b.roll_no, 10);
        if (isNaN(rollA) && isNaN(rollB)) return 0;
        if (isNaN(rollA)) return 1;
        if (isNaN(rollB)) return -1;
        return rollA - rollB;
      });

      setMembers(sortedMembers);

      if (sortedMembers.length === 0 && !popupMessage) {
        setPopupMessage("No members available.");
        setPopupType("info");
      }

    } catch (err) {
      console.error("Error fetching members from localStorage:", err);
      setPopupMessage("An unexpected error occurred while loading members.");
      setPopupType("error");
    } finally {
      await minLoadPromise;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersFromLocalStorage();
  }, []);

  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    const rollNo = String(member.roll_no || '').toLowerCase();
    const name = String(member.name || '').toLowerCase();
    const lastName = String(member.last_name || '').toLowerCase();

    return (
      rollNo.includes(query) ||
      name.includes(query) ||
      lastName.includes(query)
    );
  });

  return (
    <div
      className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 font-[Inter,sans-serif]"
      style={{ background: theme.colors.background }}
    >
      <Topbar />
      <LoadData/>
      {isLoading && <Loader />}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}

      {!isLoading && (
        <>

          <div className="my-6 flex justify-center">
            <input
              type="text"
              placeholder="Search by roll no, name, or last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: "1px",
                borderStyle: "solid",
                backgroundColor: theme.colors.backgroundVariant,
                '--tw-ring-color': theme.colors.primaryLight,
              }}
            />
          </div>

          {filteredMembers.length > 0 ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
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
                    {member.img ? (
                      <img
                        src={member.img}
                        alt={`${member.name}'s profile`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
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
                No members found matching your search.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Members;