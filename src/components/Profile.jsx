import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, IdCard } from "lucide-react";
import Loader from "./Loader";
import { theme } from "../theme";

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

        const response = await fetch(
          `https://langar-backend.onrender.com/api/members/${rollNumber}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.member) {
          setUser({
            profilePic: data.member.Photo
              ? `https://langar-backend.onrender.com/uploads/${data.member.Photo}`
              : "",
            firstName: data.member.Name,
            lastName: data.member.LastName,
            rollNumber: data.RollNumber,
            phone: data.member.PhoneNumber || "N/A",
            email: data.member.Email || "N/A",
            address: data.member.Address || "N/A",
          });
        } else {
          setError("User data not found.");
        }
      } catch (e) {
        setError("Failed to fetch user data: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <Loader />
      </div>
    );

  if (error)
    return (
      <div
        className="flex justify-center items-center min-h-screen px-4"
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <p
          className="text-lg font-semibold text-center max-w-md"
          style={{ color: theme.colors.danger, fontFamily: theme.fonts.body }}
        >
          Error: {error}
        </p>
      </div>
    );

  if (!user)
    return (
      <div
        className="flex justify-center items-center px-4"
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <p
          className="text-lg font-semibold text-center"
          style={{ color: theme.colors.neutralDark, fontFamily: theme.fonts.body }}
        >
          No user data available.
        </p>
      </div>
    );

  return (
    <div
      className="flex items-center justify-center px-2"
      style={{
        fontFamily: theme.fonts.body,
      }}
    >
      <div
        className="w-full max-w-3xl p-8 "
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.secondaryLight,
          color: theme.colors.neutralDark,
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 mb-10">
          <div
            className="w-36 h-36 rounded-full border-4 shadow-md overflow-hidden"
            style={{ borderColor: theme.colors.primary }}
          >
            <img
              src={
                user.profilePic || "https://via.placeholder.com/150?text=No+Image"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className="text-4xl font-bold"
            style={{
              color: theme.colors.primary,
              fontFamily: theme.fonts.body,
            }}
          >
            {user.firstName} {user.lastName}
          </h1>
        </div>

        {/* Profile Details */}
        <div>
          <h2
            className="text-2xl font-semibold mb-6 border-b-2 pb-2"
            style={{
              color: theme.colors.primary,
              borderColor: theme.colors.primary,
              fontFamily: theme.fonts.body,
            }}
          >
            Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roll Number */}
            <ProfileItem
              icon={<IdCard color={theme.colors.primary} />}
              label="Roll Number"
              value={user.rollNumber}
            />

            {/* Phone */}
            <ProfileItem
              icon={<Phone color={theme.colors.primary} />}
              label="Phone"
              value={user.phone}
            />

            {/* Email */}
            <ProfileItem
              icon={<Mail color={theme.colors.primary} />}
              label="Email"
              value={user.email}
            />

            {/* Address */}
            <ProfileItem
              icon={<MapPin color={theme.colors.primary} />}
              label="Address"
              value={user.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Profile Detail Item
const ProfileItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm break-words">{value}</p>
      </div>
    </div>
  );
};

export default Profile;
