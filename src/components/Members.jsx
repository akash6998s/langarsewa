import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { theme } from "../theme"; // Theme variables use ho rahe hain
import LoadData from "./LoadData";
import Topbar from "./Topbar";
import { FiSearch, FiClock, FiBarChart2, FiPhone, FiMail, FiMapPin, FiFilter } from "react-icons/fi";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByOnline, setSortByOnline] = useState(false);

  const getStatusColor = (dateString) => {
    if (!dateString) return "#ef4444";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "#ef4444";
      const now = new Date();
      const diffInMs = now - lastSeen;
      if (diffInMs < 24 * 60 * 60 * 1000) return "#10b981";
      if (diffInMs < 7 * 24 * 60 * 60 * 1000) return "#f59e0b";
      return "#ef4444";
    } catch { return "#ef4444"; }
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return "No recent activity";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return dateString;
      const now = new Date();
      const diffInSeconds = Math.floor((now - lastSeen) / 1000);
      if (diffInSeconds < 60) return "Just now";
      const minutes = Math.floor(diffInSeconds / 60);
      if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } catch { return dateString; }
  };

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch { return false; }
  };

  const fetchMembersFromLocalStorage = async () => {
    setIsLoading(true);
    try {
      const storedMembers = localStorage.getItem("allMembers");
      let memberList = storedMembers ? JSON.parse(storedMembers) : [];
      const processedMembers = await Promise.all(
        memberList.map(async (member) => {
          const rollNo = member.roll_no || member.id;
          const baseImageUrl = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${rollNo}`;
          let finalImageUrl = member.img || null;
          if (!finalImageUrl) {
            for (const ext of ["png", "jpg", "jpeg"]) {
              const testUrl = `${baseImageUrl}.${ext}`;
              if (await checkImageExists(testUrl)) { finalImageUrl = testUrl; break; }
            }
          }
          return { ...member, roll_no: rollNo, img: finalImageUrl };
        })
      );
      setMembers(processedMembers);
    } catch (error) { console.log(error); } 
    finally { setTimeout(() => setIsLoading(false), 800); }
  };

  useEffect(() => { fetchMembersFromLocalStorage(); }, []);

  const displayedMembers = members
    .filter((m) => [m.roll_no, m.name, m.last_name].some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortByOnline) {
        const parse = (ds) => ds ? new Date(ds.replace(/\bat\b/i, "").split("UTC")[0].trim()).getTime() : 0;
        return parse(b.last_online) - parse(a.last_online);
      }
      return parseInt(a.roll_no) - parseInt(b.roll_no);
    });

  return (
    <>
      <Topbar />
      <div className="pb-24 pt-15 px-4 min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        <LoadData />
        {isLoading && <Loader />}

        {!isLoading && (
          <div className="max-w-7xl mx-auto">
            
            {/* Top Controls */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-end">
                <label className="flex items-center gap-2 px-4 py-2 bg-white rounded border border-slate-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={sortByOnline}
                    onChange={(e) => setSortByOnline(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 transition-colors"
                    style={{ color: theme.colors.primary }}
                  />
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase ">
                     Sort by Activity
                  </span>
                </label>
              </div>

              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border border-slate-200 bg-white shadow-sm"
                  style={{ focusBorderColor: theme.colors.primary }}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col animate-fadeIn">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-400">
                      {member.roll_no}
                    </div>
                    <FiBarChart2 size={18} style={{ color: getStatusColor(member.last_online) }} />
                  </div>

                  {/* Profile Image */}
                  <div className="mx-auto mb-4">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-md">
                      {member.img ? (
                        <img src={member.img} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: theme.colors.primary }}>
                          {member.name?.[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="text-center flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{member.name} {member.last_name}</h3>

                    <div className="space-y-2 text-left mb-6">
                      {member.phone_no && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] p-2.5 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiPhone size={14} className="text-slate-400 shrink-0" />
                          <span className="font-medium">{member.phone_no}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] p-2.5 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiMail size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] p-2.5 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiMapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{member.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FiClock size={12} />
                      {formatLastSeen(member.last_online)}
                    </div>
                    <a 
                      href={`tel:${member.phone_no}`} 
                      className="p-2 rounded-xl transition-colors text-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <FiPhone size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default Members;