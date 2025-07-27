import React, { useEffect, useState } from 'react';
import Loader from './Loader'; // Import your Loader component
import CustomPopup from './Popup'; // Import your CustomPopup component

const Profile = () => {
    const [member, setMember] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // New loading state
    const [popupMessage, setPopupMessage] = useState(null); // New popup message state
    const [popupType, setPopupType] = useState(null); // 'success' or 'error'

    const supportedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico'];

    useEffect(() => {
        const loadProfileData = async () => {
            setIsLoading(true); // Start loading
            setPopupMessage(null); // Clear any previous messages
            setImgError(false); // Reset image error

            const storedMember = localStorage.getItem('loggedInMember');

            if (storedMember) {
                try {
                    const parsedMember = JSON.parse(storedMember);
                    setMember(parsedMember);

                    // Try all extensions until one image loads
                    let imageFound = false;
                    for (let ext of supportedExtensions) {
                        const url = `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;

                        const img = new Image();
                        img.src = url;

                        const loaded = await new Promise((resolve) => {
                            img.onload = () => resolve(true);
                            img.onerror = () => resolve(false);
                        });

                        if (loaded) {
                            setImageUrl(url);
                            imageFound = true;
                            break; // Found an image, no need to try further
                        }
                    }

                    if (!imageFound) {
                        setImgError(true);
                        setPopupMessage("Profile image not found. Displaying placeholder.");
                        setPopupType("error"); // Or 'info' depending on how critical this is
                    }

                } catch (error) {
                    console.error("Error parsing member data from localStorage:", error);
                    setPopupMessage("Failed to load profile data. Please try logging in again.");
                    setPopupType("error");
                    setMember(null); // Clear member data on parse error
                }
            } else {
                setPopupMessage("No profile data found. Please log in.");
                setPopupType("error");
                setMember(null); // Ensure member is null if not found
            }
            setIsLoading(false); // End loading
        };

        loadProfileData();
    }, []); // Empty dependency array means this effect runs once on mount

    // Display loader or error message while data is being fetched or if no member is found after loading
    if (isLoading) {
        return <Loader />;
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
                {popupMessage && (
                    <CustomPopup
                        message={popupMessage}
                        type={popupType}
                        onClose={() => setPopupMessage(null)}
                    />
                )}
                <p className="text-gray-600 text-xl font-medium mt-4">No profile data found. Please log in.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-sans">
            {/* Custom Popup for messages */}
            {popupMessage && (
                <CustomPopup
                    message={popupMessage}
                    type={popupType}
                    onClose={() => setPopupMessage(null)}
                />
            )}

            <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl border border-gray-200">
                <div className="flex flex-col items-center mb-8">
                    {/* Profile Image */}
                    {imgError || !imageUrl ? (
                        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 border-4 border-blue-300 shadow-inner">
                            IMG
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-300 shadow-md transform transition-transform duration-300 hover:scale-105"
                        />
                    )}

                    {/* Roll Number */}
                    <p className="text-base text-gray-600 font-medium">
                        Roll No: <span className="text-gray-900 font-semibold">{member.roll_no}</span>
                    </p>
                </div>

                {/* User Details */}
                <div className="space-y-5">
                    <div className="border-b pb-3 border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm block mb-1">Name:</span>
                        <p className="text-gray-900 text-lg font-medium">{member.name} {member.last_name}</p>
                    </div>

                    <div className="border-b pb-3 border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm block mb-1">Email:</span>
                        <p className="text-gray-900 text-lg font-medium">{member.email}</p>
                    </div>

                    <div className="border-b pb-3 border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm block mb-1">Phone:</span>
                        <p className="text-gray-900 text-lg font-medium">{member.phone_no}</p>
                    </div>

                    <div> {/* No bottom border for the last item */}
                        <span className="font-semibold text-gray-700 text-sm block mb-1">Address:</span>
                        <p className="text-gray-900 text-lg font-medium">{member.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;