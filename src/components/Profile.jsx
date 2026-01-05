import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from "../theme";
import LoadData from "./LoadData";
import Topbar from "./Topbar";

const Profile = () => {
  const [member, setMember] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const supportedExtensions = ["png", "jpg", "jpeg", "webp", "ico"];

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setPopupMessage(null);

      const minLoadPromise = new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      try {
        const storedMember = localStorage.getItem("loggedInMember");

        if (storedMember) {
          const parsedMember = JSON.parse(storedMember);
          setMember(parsedMember);

          let foundImageUrl = null;
          if (parsedMember.roll_no) {
            for (let ext of supportedExtensions) {
              const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;
              if (await checkImageExists(url)) {
                foundImageUrl = url;
                break;
              }
            }
          }
          setImageUrl(foundImageUrl || null);

          if (!foundImageUrl) {
            setPopupMessage("Profile image not found. Displaying placeholder.");
            setPopupType("info");
          }
        } else {
          setPopupMessage("No profile data found. Please log in.");
          setPopupType("error");
        }
      } catch (error) {
        console.error("Error parsing member data:", error);
        setPopupMessage("Failed to load profile data. Please log in again.");
        setPopupType("error");
      } finally {
        await minLoadPromise;
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.background }}
      >
        <Loader />
      </div>
    );
  }

  if (!member) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 font-[Inter,sans-serif]"
        style={{ background: theme.colors.background }}
      >
        {popupMessage && (
          <CustomPopup
            message={popupMessage}
            type={popupType}
            onClose={() => setPopupMessage(null)}
          />
        )}
        <p
          className="text-xl font-semibold mt-4"
          style={{ color: theme.colors.primary }}
        >
          No profile data found. Please log in.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div
        className="min-h-screen font-[Inter,sans-serif] py-20 px-4 md:px-8"
        style={{ background: theme.colors.background }}
      >
        <LoadData />

        {popupMessage && (
          <CustomPopup
            message={popupMessage}
            type={popupType}
            onClose={() => setPopupMessage(null)}
          />
        )}

        <div className="flex justify-center">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-lg border animate-fadeIn"
            style={{ borderColor: theme.colors.primaryLight }}
          >
            {/* Profile Header */}
            <div className="flex flex-col items-center py-10 px-6 border-b"
              style={{ borderColor: theme.colors.primaryLight }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 shadow-md transition-transform duration-300 hover:scale-105"
                  style={{ borderColor: theme.colors.primary }}
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-inner text-white text-3xl font-bold"
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                  }}
                >
                  {(member.name || "N/A").charAt(0).toUpperCase()}
                </div>
              )}
              <h2
                className="mt-4 text-2xl font-bold"
                style={{ color: theme.colors.neutralDark }}
              >
                {member.name} {member.last_name}
              </h2>
              <p
                className="text-sm font-medium mt-1"
                style={{ color: theme.colors.primary }}
              >
                Roll No:{" "}
                <span className="font-semibold">{member.roll_no}</span>
              </p>
            </div>

            {/* Profile Details */}
            <div className="px-8 py-6 space-y-5">
              {[
                { label: "Email", value: member.email },
                { label: "Phone", value: member.phone_no },
                { label: "Address", value: member.address },
              ].map((item, idx, arr) => (
                <div
                  key={item.label}
                  className={idx !== arr.length - 1 ? "pb-4 border-b" : ""}
                  style={{ borderColor: theme.colors.primaryLight }}
                >
                  <span
                    className="block text-sm font-semibold mb-1"
                    style={{ color: theme.colors.primary }}
                  >
                    {item.label}
                  </span>
                  <p
                    className="text-lg font-medium"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade In Animation */}
        <style>
          {`
@keyframes fadeIn {
 from { opacity: 0; transform: translateY(20px); }
 to { opacity: 1; transform: translateY(0); }
 }
 .animate-fadeIn {
animation: fadeIn 0.6s ease-out;
 }
`}
        </style>
      </div>
    </>
  );
};

export default Profile;