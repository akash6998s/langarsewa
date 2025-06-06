import React, { useEffect, useState } from "react";
import {
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import Loader from "./Loader";
import { theme } from ".././theme";

const AllMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("https://langarsewa-db.onrender.com/members");
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
      className="min-h-screen mt-8 px-2"
      style={{ backgroundColor: theme.colors.background, fontFamily: theme.fonts.body }}
    >
      <h1
        className="text-4xl font-bold mb-10 text-center drop-shadow-sm"
        style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
      >
        Our Members
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {members.map((member) => (
          <div
            key={member.roll_no}
            className="rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.secondary + "33", // slight transparency for border
            }}
          >
            <div className="w-full aspect-w-1 aspect-h-1">
              <img
                src={`https://langarsewa-db.onrender.com/images/${member.img}`}
                alt={`${member.name} ${member.last_name}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h2
                className="text-xl font-semibold mb-2 text-center"
                style={{ color: theme.colors.neutralDark }}
              >
                {member.name.trim()} {member.last_name.trim()}
              </h2>
              <div className="text-sm space-y-2" style={{ color: theme.colors.neutralDark }}>
                <p className="flex items-center gap-2">
                  <IdentificationIcon
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: theme.colors.primary }}
                  />
                  <span>Roll No: {member.roll_no}</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: theme.colors.secondary }}
                  />
                  <span>{member.phone_no}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: theme.colors.accent }}
                  />
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
