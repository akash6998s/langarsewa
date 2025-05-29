import React, { useEffect, useState } from "react";
import {
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import Loader from "./Loader";

const AllMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/members");
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 py-12 px-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-700 drop-shadow-sm">
        Our Members
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {members.map((member) => (
          <div
            key={member.roll_no}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100"
          >
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                src={`http://localhost:5000/images/${member.img}`}
                alt={`${member.name} ${member.last_name}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                {member.name.trim()} {member.last_name.trim()}
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-indigo-500" />
                  <span>Roll No: {member.roll_no}</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-green-500" />
                  <span>{member.phone_no}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-red-400" />
                  <span>{member.address}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMember;
