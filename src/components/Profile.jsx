import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from "../theme";
import LoadData from "./LoadData";
import Topbar from "./Topbar";
import {
  FiClock,
  FiBarChart2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

const Profile = () => {
  const [member, setMember] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const supportedExtensions = ["png", "jpg", "jpeg", "webp", "ico"];

  const getStatusColor = (dateString) => {
    if (!dateString || dateString === "N/A") return "#cbd5e1"; 
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "#cbd5e1";

      const diff = new Date() - lastSeen;
      const oneDay = 24 * 60 * 60 * 1000;

      if (diff < oneDay) return "#10b981"; // Green
      if (diff < 7 * oneDay) return "#f59e0b"; // Yellow
      return "#ef4444"; // Red
    } catch {
      return "#cbd5e1";
    }
  };

  const formatLastSeen = (dateString) => {
    if (!dateString || dateString === "N/A") return "No recent activity";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "Offline";

      const diff = Math.floor((new Date() - lastSeen) / 1000);

      if (diff < 60) return "Active now";
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

      return lastSeen.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Offline";
    }
  };

  const checkImageExists = async (url) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const storedLogin = localStorage.getItem("loggedInMember");
        const allMembersData = localStorage.getItem("allMembers");

        if (storedLogin) {
          const loggedIn = JSON.parse(storedLogin);
          let finalData = loggedIn;

          if (allMembersData) {
            const allMembers = JSON.parse(allMembersData);
            const latest = allMembers.find(
              (m) => String(m.roll_no) === String(loggedIn.roll_no)
            );
            if (latest) finalData = latest;
          }

          setMember(finalData);

          let foundImage = null;
          if (finalData.roll_no) {
            for (let ext of supportedExtensions) {
              const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${finalData.roll_no}.${ext}`;
              if (await checkImageExists(url)) {
                foundImage = url;
                break;
              }
            }
          }
          setImageUrl(foundImage);
        }
      } catch (err) {
        setPopupMessage("Session expired. Please login again.");
        setPopupType(err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadProfileData();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.background }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Topbar />

      <div className="min-h-screen py-24 px-4 bg-slate-50/50">
        <LoadData />

        {popupMessage && (
          <CustomPopup
            message={popupMessage}
            type={popupType}
            onClose={() => setPopupMessage(null)}
          />
        )}

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden animate-fadeIn">
            
            {/* Professional Header */}
            <div className="relative pt-16 pb-10 px-8 flex flex-col items-center border-b border-slate-50">
              <div className="absolute top-10 right-10 flex items-center gap-2">
                <FiBarChart2 size={22} style={{ color: getStatusColor(member?.last_online) }} />
              </div>

              {/* Avatar without any dots */}
              <div className="mb-6">
                <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-[6px] border-white shadow-xl bg-slate-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl font-light text-slate-300"
                    >
                      <FiUser />
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900" style={{ color: theme.colors.neutralDark }}>
                {member?.name} {member?.last_name}
              </h2>

              <p className="mt-2 px-4 py-1.5 bg-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                Roll Number: {member?.roll_no}
              </p>
            </div>

            {/* Clean Information Layout */}
            <div className="px-10 py-8 space-y-6">
              <InfoRow
                icon={<FiMail size={20} />}
                label="Registered Email"
                value={member?.email}
              />

              <InfoRow
                icon={<FiPhone size={20} />}
                label="Contact Number"
                value={member?.phone_no}
              />

              <InfoRow
                icon={<FiMapPin size={20} />}
                label="Location"
                value={member?.address}
              />

              {/* Activity Footer */}
              <div className="pt-10 mt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-3">
                  <FiClock size={18} className="text-slate-300" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-1">Last Online Activity</p>
                    <p className="text-sm font-semibold text-slate-600">
                      {formatLastSeen(member?.last_online)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        `}
      </style>
    </>
  );
};

const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-6 p-5 rounded-3xl bg-slate-50/30 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-300 group">
      <div className="mt-1 text-slate-300 group-hover:text-slate-600 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-slate-700 font-semibold text-lg leading-snug">
          {value || "Not Available"}
        </p>
      </div>
    </div>
  );
};

export default Profile;