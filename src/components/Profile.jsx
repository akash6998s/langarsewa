import React, { useEffect, useState } from 'react';
// No Firebase imports needed
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your custom Popup component
import { theme } from '../theme'; // Import the theme
import LoadData from './LoadData';

const Profile = () => {
    const [member, setMember] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [popupMessage, setPopupMessage] = useState(null);
    const [popupType, setPopupType] = useState(null);

    // Supported image extensions for the profile picture URL
    const supportedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico'];
    
    // Asynchronous function to check if an image URL is valid and accessible.
    // Uses a HEAD request, which is faster than a GET as it doesn't download the body.
    const checkImageExists = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok; // Returns true if the image exists and is accessible
        } catch (error) {
            console.error(`Error checking image URL ${url}:`, error);
            return false; // Returns false on network error or other issues
        }
    };

    useEffect(() => {
        const loadProfileData = async () => {
            setIsLoading(true); // Start loading state
            setPopupMessage(null); // Clear any previous popup messages
            
            // Create a promise that resolves after a minimum delay to show the loader
            const minLoadPromise = new Promise(resolve => setTimeout(resolve, 3000));

            try {
                const storedMember = localStorage.getItem('loggedInMember');

                if (storedMember) {
                    try {
                        const parsedMember = JSON.parse(storedMember);
                        setMember(parsedMember);

                        // If member data exists, attempt to find their profile picture
                        let foundImageUrl = null;
                        if (parsedMember.roll_no) {
                            // Iterate through the supported extensions and check for a valid image
                            for (let ext of supportedExtensions) {
                                const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;
                                if (await checkImageExists(url)) {
                                    foundImageUrl = url; // Set the URL once a valid image is found
                                    break; // Stop checking
                                }
                            }
                        }

                        // Update the imageUrl state based on whether an image was found
                        if (foundImageUrl) {
                            setImageUrl(foundImageUrl);
                        } else {
                            setImageUrl(null); // No valid image found
                            setPopupMessage("Profile image not found. Displaying placeholder.");
                            setPopupType("info");
                        }

                    } catch (error) {
                        console.error("Error parsing member data from localStorage:", error);
                        setPopupMessage("Failed to load profile data. Please try logging in again.");
                        setPopupType("error");
                        setMember(null);
                        setImageUrl(null); // Ensure no image is shown on error
                    }
                } else {
                    // No 'loggedInMember' data is found in localStorage
                    setPopupMessage("No profile data found. Please log in.");
                    setPopupType("error");
                    setMember(null);
                    setImageUrl(null);
                }
            } finally {
                // Ensure the loader stays for the minimum delay before hiding
                await minLoadPromise;
                setIsLoading(false);
            }
        };

        loadProfileData();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // --- Conditional Rendering based on Loading and Member Data ---
    
    // Show Loader while data is being fetched
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
                <Loader />
            </div>
        );
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
                    {!imageUrl ? (
                        <div
                            className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-4 shadow-inner"
                            style={{
                                backgroundColor: theme.colors.primaryLight,
                                color: theme.colors.primary,
                                borderColor: theme.colors.primary,
                            }}
                        >
                            <span className="text-white text-3xl font-bold">
                                {(member.name || 'N/A').charAt(0).toUpperCase()}
                            </span>
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