import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, IdCard } from "lucide-react";
import Loader from "./Loader";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const rollNumber = localStorage.getItem("rollNumber");
        if (!rollNumber) {
          setError("Roll number not found in local storage.");
          setLoading(false);
          return;
        }

        const response = await fetch(`https://langarsewa-db.onrender.com/members`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Find the user with the matching rollNumber
        const foundUser = data.find(
          (member) => String(member.roll_no) === rollNumber
        );

        if (foundUser) {
          setUser({
            profilePic: foundUser.img
              ? `https://langarsewa-db.onrender.com/images/${foundUser.img}`
              : "", // Default profile pic if img is not available
            firstName: foundUser.name,
            lastName: foundUser.last_name,
            rollNumber: foundUser.roll_no,
            phone: foundUser.phone_no || "N/A",
            email: foundUser.email || "N/A",
            address: foundUser.address || "N/A",
          });
        } else {
          setError("User not found for the given roll number.");
        }
      } catch (e) {
        setError("Failed to fetch user data: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

 if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        No user data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left Side - Profile Picture & Name */}
          <div className="bg-gradient-to-tr from-yellow-600 to-orange-500 text-white flex flex-col items-center justify-center p-10">
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
            />
            <h2 className="text-3xl font-bold mt-4 font-serif">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-2 text-sm opacity-90 font-medium">
              Roll No: {user.rollNumber}
            </p>
          </div>

          {/* Right Side - Details */}
          <div className="md:col-span-2 p-10 bg-white">
            <h3 className="text-2xl font-semibold text-yellow-800 mb-6 border-b-2 border-yellow-300 pb-2 font-serif">
              Profile Details
            </h3>

            <div className="space-y-6 text-gray-700 text-lg font-sans">
              <div className="flex items-center gap-4">
                <IdCard className="text-yellow-600" />
                <span>
                  <strong>Roll Number:</strong> {user.rollNumber}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-yellow-600" />
                <span>
                  <strong>Phone:</strong> {user.phone}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-yellow-600" />
                <span>
                  <strong>Email:</strong> {user.email}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-yellow-600" />
                <span>
                  <strong>Address:</strong> {user.address}
                </span>
              </div>
            </div>

            {/* Optional Edit Button */}
            <div className="mt-10 text-right">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 font-medium">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;