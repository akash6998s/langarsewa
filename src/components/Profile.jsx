import React, { useEffect, useState } from 'react';
import LoadData from './LoadData';

const Profile = () => {
  const [member, setMember] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imgError, setImgError] = useState(false);

  const supportedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico'];

  useEffect(() => {
    const storedMember = localStorage.getItem('loggedInMember');
    if (storedMember) {
      const parsedMember = JSON.parse(storedMember);
      setMember(parsedMember);

      // Try all extensions until one image loads
      const tryImageExtensions = async () => {
        for (let ext of supportedExtensions) {
          const url = `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;

          // Test image by creating it and checking when it loads
          const img = new Image();
          img.src = url;

          const loaded = await new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });

          if (loaded) {
            setImageUrl(url);
            return;
          }
        }

        // If none work, show fallback
        setImgError(true);
      };

      tryImageExtensions();
    }
  }, []);

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <p className="text-gray-600 text-xl font-medium">No profile data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-sans">
      <LoadData /> {/* Assuming LoadData displays a global loading state */}
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