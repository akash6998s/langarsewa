import React from "react";
import { Mail, Phone, MapPin, IdCard } from "lucide-react";

const user = {
  profilePic: "https://i.pravatar.cc/300?img=68",
  firstName: "Akash",
  lastName: "Singh",
  rollNumber: "20251007",
  phone: "+91 98765 43210",
  email: "akash@example.com",
  address: "123 Guru Marg, Amritsar, Punjab, India",
};

const Profile = () => {
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
            <p className="mt-2 text-sm opacity-90 font-medium">Roll No: {user.rollNumber}</p>
          </div>

          {/* Right Side - Details */}
          <div className="md:col-span-2 p-10 bg-white">
            <h3 className="text-2xl font-semibold text-yellow-800 mb-6 border-b-2 border-yellow-300 pb-2 font-serif">
              Profile Details
            </h3>

            <div className="space-y-6 text-gray-700 text-lg font-sans">
              <div className="flex items-center gap-4">
                <IdCard className="text-yellow-600" />
                <span><strong>Roll Number:</strong> {user.rollNumber}</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-yellow-600" />
                <span><strong>Phone:</strong> {user.phone}</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-yellow-600" />
                <span><strong>Email:</strong> {user.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-yellow-600" />
                <span><strong>Address:</strong> {user.address}</span>
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
