import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, IdCard } from "lucide-react";
import Loader from "./Loader";
import { theme } from ".././theme";

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

        const foundUser = data.find(
          (member) => String(member.roll_no) === rollNumber
        );

        if (foundUser) {
          setUser({
            profilePic: foundUser.img
              ? `https://langarsewa-db.onrender.com/images/${foundUser.img}`
              : "",
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

  if (loading) return <Loader />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!user) return <div className="p-4">No user data available.</div>;

  return (
    <div
      className="bg-background flex items-center justify-center px-4 pt-16"
      style={{ fontFamily: theme.fonts.body }}
    >
      <div
        className="bg-surface rounded-xl shadow-xl max-w-3xl w-full p-8"
        style={{ color: theme.colors.neutralDark }}
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 mb-10">
          <img
            src={user.profilePic || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-primary object-cover"
          />
          <h1
            className="text-4xl font-bold"
            style={{
              fontFamily: theme.fonts.heading,
              color: theme.colors.primary,
            }}
          >
            {user.firstName} {user.lastName}
          </h1>
        </div>

        {/* Profile Details */}
        <div>
          <h2
            className="text-2xl font-semibold mb-6 border-b-2 border-primary pb-2"
            style={{
              fontFamily: theme.fonts.heading,
              color: theme.colors.primary,
            }}
          >
            Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Roll Number */}
            <div className="flex items-start gap-4 text-neutralDark">
              <IdCard className="text-primary flex-shrink-0" size={24} />
              <div className="min-w-0">
                <p className="font-semibold">Roll Number</p>
                <p className="text-sm break-words">{user.rollNumber}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 text-neutralDark">
              <Phone className="text-primary flex-shrink-0" size={24} />
              <div className="min-w-0">
                <p className="font-semibold">Phone</p>
                <p className="text-sm break-words">{user.phone}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 text-neutralDark">
              <Mail className="text-primary flex-shrink-0" size={24} />
              <div className="min-w-0">
                <p className="font-semibold">Email</p>
                <p className="text-sm break-words">{user.email}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 text-neutralDark">
              <MapPin className="text-primary flex-shrink-0" size={24} />
              <div className="min-w-0">
                <p className="font-semibold">Address</p>
                <p className="text-sm break-words">{user.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
