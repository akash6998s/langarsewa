import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import { theme } from "../theme";
import LoadData from "./LoadData";
import Topbar from "./Topbar";
import { FiClock, FiBarChart2, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Profile = () => {
  const [member, setMember] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const supportedExtensions = ["png", "jpg", "jpeg", "webp", "ico"];

  const getStatusColor = (dateString) => {
    if (!dateString || dateString === "N/A") return "#ef4444";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "#ef4444";
      const diffInMs = new Date() - lastSeen;
      const oneDay = 24 * 60 * 60 * 1000;
      if (diffInMs < oneDay) return "#10b981"; // Active Green
      if (diffInMs < 7 * oneDay) return "#f59e0b"; // Away Yellow
      return "#ef4444"; // Offline Red
    } catch { return "#ef4444"; }
  };

  const formatLastSeen = (dateString) => {
    if (!dateString || dateString === "N/A") return "Never Online";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "Offline";
      const diffInSec = Math.floor((new Date() - lastSeen) / 1000);
      if (diffInSec < 60) return "Active now";
      if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
      if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
      return lastSeen.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch { return "Offline"; }
  };

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch { return false; }
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
            const latest = allMembers.find(m => String(m.roll_no) === String(loggedIn.roll_no));
            if (latest) finalData = latest;
          }

          setMember(finalData);

          let foundImageUrl = null;
          if (finalData.roll_no) {
            for (let ext of supportedExtensions) {
              const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${finalData.roll_no}.${ext}`;
              if (await checkImageExists(url)) {
                foundImageUrl = url;
                break;
              }
            }
          }
          setImageUrl(foundImageUrl || null);
        }
      } catch (error) {
        setPopupMessage("Session error. Please login again.");
        setPopupType(error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    loadProfileData();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}><Loader /></div>;

  return (
    <>
      <Topbar />
      <div className="min-h-screen py-24 px-4 bg-slate-50/50">
        <LoadData />
        {popupMessage && <CustomPopup message={popupMessage} type={popupType} onClose={() => setPopupMessage(null)} />}

        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fadeIn">
            
            {/* Elegant Header Area */}
            <div className="relative pt-16 pb-10 px-6 flex flex-col items-center bg-gradient-to-b from-slate-50 to-white">
              
              {/* Profile Graph Icon */}
              <div className="absolute top-8 right-8 p-2.5 rounded-2xl bg-white shadow-sm border border-slate-50">
                <FiBarChart2 size={24} style={{ color: getStatusColor(member?.last_online) }} />
              </div>

              {/* Avatar with Status Ring */}
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-[6px] border-white shadow-2xl">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white" style={{ background: theme.colors.primary }}>
                      {member?.name?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg animate-pulse" 
                     style={{ backgroundColor: getStatusColor(member?.last_online) }}></div>
              </div>

              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{member?.name} {member?.last_name}</h2>
              <span className="mt-2 px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold tracking-widest uppercase">
                Roll No: {member?.roll_no}
              </span>
            </div>

            {/* Information Grid */}
            <div className="px-10 pb-12 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                
                <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50/50 border border-slate-50 transition-all hover:border-indigo-100">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-indigo-500"><FiMail size={20}/></div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Email</p>
                    <p className="text-slate-700 font-bold truncate">{member?.email || "No email added"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50/50 border border-slate-50 transition-all hover:border-emerald-100">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-emerald-500"><FiPhone size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-slate-700 font-bold">{member?.phone_no || "No phone added"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50/50 border border-slate-50 transition-all hover:border-amber-100">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-amber-500"><FiMapPin size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residential Address</p>
                    <p className="text-slate-700 font-bold">{member?.address || "No address added"}</p>
                  </div>
                </div>

              </div>

              {/* Modern Footer Activity Bar */}
              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><FiClock size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">{formatLastSeen(member?.last_online)}</p>
                  </div>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default Profile;
 