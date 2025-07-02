import React, { useEffect, useState } from "react";
import {
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import Loader from "./Loader";
import { theme } from "../theme";

const AllMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(
          "https://langar-backend.onrender.com/api/members"
        );
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setError("Failed to load members data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Loader />
      </div>
    );

  if (error)
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: theme.colors.background }}
      >
        <p
          className="text-center max-w-md text-lg font-semibold"
          style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
        >
          {error}
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen mt-8 pb-24 px-2"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      <h1
        className="text-4xl font-bold mb-10 text-center drop-shadow-sm"
        style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
      >
        Our Members
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <div
            key={member.RollNumber}
            className="rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border flex flex-col items-center"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.secondary + "33",
            }}
          >
            {/* Image */}
            <div className="mt-6 mb-4">
              <div
                className="w-32 h-32 rounded-full bg-white border shadow flex items-center justify-center overflow-hidden"
                style={{ borderColor: theme.colors.secondary }}
              >
                <img
                  src={`https://langar-backend.onrender.com/uploads/${member.Photo}`}
                  alt={`${member.Name} ${member.LastName}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Info */}
            <div className="px-5 pb-5 w-full">
              <h2
                className="text-xl font-semibold mb-3 text-center"
                style={{ color: theme.colors.neutralDark }}
              >
                {member.Name.trim()} {member.LastName.trim()}
              </h2>
              <div
                className="text-sm space-y-3"
                style={{ color: theme.colors.neutralDark }}
              >
                <p className="flex items-center gap-2">
                  <IdentificationIcon
                    className="h-5 w-5"
                    style={{ color: theme.colors.primary }}
                  />
                  <span className="truncate">
                    Roll No: {member.RollNumber}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon
                    className="h-5 w-5"
                    style={{ color: theme.colors.secondary }}
                  />
                  <span className="truncate">{member.PhoneNumber}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon
                    className="h-5 w-5"
                    style={{ color: theme.colors.accent }}
                  />
                  <span className="truncate">{member.Address}</span>
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
