import React, { useEffect, useState } from 'react';
// Removed Firebase imports: db, collection, getDocs
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your CustomPopup component
import { theme } from '../theme'; // Import the theme
import LoadData from './LoadData';

const Profile = () => {
    const [member, setMember] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [popupMessage, setPopupMessage] = useState(null);
    const [popupType, setPopupType] = useState(null);

    // Supported image extensions for the profile picture URL
    const supportedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico'];

    useEffect(() => {
        const loadProfileData = async () => {
            setIsLoading(true); // Start loading state
            setPopupMessage(null); // Clear any previous popup messages
            setImgError(false); // Reset image error state

            const storedMember = localStorage.getItem('loggedInMember'); // Get data from localStorage

            if (storedMember) {
                try {
                    const parsedMember = JSON.parse(storedMember); // Parse the JSON string
                    setMember(parsedMember); // Set the member state

                    // Attempt to load the profile image using the roll_no
                    // This iterates through supported extensions until an image is found
                    let imageFound = false;
                    if (parsedMember.roll_no) { // Ensure roll_no exists before trying to load image
                        for (let ext of supportedExtensions) {
                            const url = `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;

                            const img = new Image(); // Create a new Image object to check if URL is valid
                            img.src = url;

                            const loaded = await new Promise((resolve) => {
                                img.onload = () => resolve(true); // Resolve true if image loads successfully
                                img.onerror = () => resolve(false); // Resolve false if image fails to load
                            });

                            if (loaded) {
                                setImageUrl(url); // Set the URL if image is found
                                imageFound = true;
                                break; // Stop checking once an image is found
                            }
                        }
                    }

                    if (!imageFound) {
                        setImgError(true); // Set image error if no image was found
                        setPopupMessage("Profile image not found. Displaying placeholder.");
                        setPopupType("info"); // Informational popup for missing image
                    }

                } catch (error) {
                    // Handle errors during JSON parsing from localStorage
                    console.error("Error parsing member data from localStorage:", error);
                    setPopupMessage("Failed to load profile data. Please try logging in again.");
                    setPopupType("error");
                    setMember(null); // Clear member data on parse error
                }
            } else {
                // If no 'loggedInMember' data is found in localStorage
                setPopupMessage("No profile data found. Please log in.");
                setPopupType("error");
                setMember(null); // Ensure member is null if not found
            }
            setIsLoading(false); // End loading state regardless of success or failure
        };

        loadProfileData();
    }, []); // Empty dependency array means this effect runs once on component mount

    // --- Conditional Rendering based on Loading and Member Data ---

    // Show Loader while data is being fetched
    if (isLoading) {
        return <Loader />;
    }

    // Show an error message if no member data is found after loading
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
                    className="text-xl font-medium mt-4"
                    style={{ color: theme.colors.primary }}
                >
                    No profile data found. Please log in.
                </p>
            </div>
        );
    }

    // --- Render Profile Details if member data is available ---
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 font-[Inter,sans-serif]"
            style={{ background: theme.colors.background }}
        >
            <LoadData/>
            {/* Custom Popup for messages */}
            {popupMessage && (
                <CustomPopup
                    message={popupMessage}
                    type={popupType}
                    onClose={() => setPopupMessage(null)}
                />
            )}

            <div
                className="max-w-md w-full shadow-2xl rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl border"
                style={{
                    backgroundColor: theme.colors.neutralLight,
                    borderColor: theme.colors.primaryLight,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                }}
            >
                <div className="flex flex-col items-center mb-8">
                    {/* Profile Image or Placeholder */}
                    {imgError || !imageUrl ? (
                        <div
                            className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-4 shadow-inner"
                            style={{
                                backgroundColor: theme.colors.primaryLight,
                                color: theme.colors.primary,
                                borderColor: theme.colors.primary,
                            }}
                        >
                            IMG
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover mb-4 border-4 shadow-md transform transition-transform duration-300 hover:scale-105"
                            style={{ borderColor: theme.colors.primary }}
                        />
                    )}

                    {/* Roll Number */}
                    <p
                        className="text-base font-medium"
                        style={{ color: theme.colors.primary }}
                    >
                        Roll No:{" "}
                        <span
                            className="font-semibold"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            {member.roll_no}
                        </span>
                    </p>
                </div>

                {/* User Details */}
                <div className="space-y-5">
                    <div
                        className="border-b pb-3"
                        style={{ borderColor: theme.colors.primaryLight }}
                    >
                        <span
                            className="font-semibold text-sm block mb-1"
                            style={{ color: theme.colors.primary }}
                        >
                            Name:
                        </span>
                        <p
                            className="text-lg font-medium"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            {member.name} {member.last_name}
                        </p>
                    </div>

                    <div
                        className="border-b pb-3"
                        style={{ borderColor: theme.colors.primaryLight }}
                    >
                        <span
                            className="font-semibold text-sm block mb-1"
                            style={{ color: theme.colors.primary }}
                        >
                            Email:
                        </span>
                        <p
                            className="text-lg font-medium"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            {member.email}
                        </p>
                    </div>

                    <div
                        className="border-b pb-3"
                        style={{ borderColor: theme.colors.primaryLight }}
                    >
                        <span
                            className="font-semibold text-sm block mb-1"
                            style={{ color: theme.colors.primary }}
                        >
                            Phone:
                        </span>
                        <p
                            className="text-lg font-medium"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            {member.phone_no}
                        </p>
                    </div>

                    <div>
                        {/* No bottom border for the last item */}
                        <span
                            className="font-semibold text-sm block mb-1"
                            style={{ color: theme.colors.primary }}
                        >
                            Address:
                        </span>
                        <p
                            className="text-lg font-medium"
                            style={{ color: theme.colors.neutralDark }}
                        >
                            {member.address}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;