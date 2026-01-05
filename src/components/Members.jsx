import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { theme } from "../theme";
import LoadData from "./LoadData";
import Topbar from "./Topbar";
import { FiSearch, FiClock, FiBarChart2, FiPhone, FiMail, FiMapPin } from "react-icons/fi";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (dateString) => {
    if (!dateString) return "#ef4444";
    try {
      let cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const lastSeen = new Date(cleanDate);
      if (isNaN(lastSeen.getTime())) return "#ef4444";

      const now = new Date();
      const diffInMs = now - lastSeen;
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const sevenDaysInMs = 7 * oneDayInMs;

      if (diffInMs < oneDayInMs) return "#10b981";
      if (diffInMs < sevenDaysInMs) return "#f59e0b";
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
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return lastSeen.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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
    const minLoadPromise = new Promise((resolve) => setTimeout(resolve, 1000));
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
      setMembers(processedMembers.sort((a, b) => parseInt(a.roll_no) - parseInt(b.roll_no)));
    } catch (error) {
      console.log(error)
    } finally {
      await minLoadPromise;
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMembersFromLocalStorage(); }, []);

  const filteredMembers = members.filter((m) =>
    [m.roll_no, m.name, m.last_name].some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Topbar />
      <div className="pb-24 pt-20 px-4 min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.colors.background} 0%, #f8fafc 100%)` }}>
        <LoadData />
        {isLoading && <Loader />}

        {!isLoading && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 flex justify-center">
              <div className="relative w-full max-w-lg">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl shadow-sm focus:outline-none border border-slate-200 focus:border-blue-400 transition-all bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 animate-fadeIn">

                  {/* Top Left Badge (Only Number) */}
                  <div className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500">
                    {member.roll_no}
                  </div>

                  {/* Top Right Status Graph */}
                  <div className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white shadow-sm border border-slate-50">
                    <FiBarChart2 size={18} style={{ color: getStatusColor(member.last_online) }} />
                  </div>

                  <div className="text-center">
                    <div className="relative inline-block mt-4 mb-4">
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden  mx-auto transform group-hover:scale-105 transition-transform duration-300">
                        {member.img ? (
                          <img src={member.img} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: theme.colors.primary }}>
                            {member.name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-4">{member.name} {member.last_name}</h3>

                    {/* Contact Details */}
                    <div className="space-y-2.5 mb-6 text-left">
                      {member.email && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiMail size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone_no && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiPhone size={14} className="text-slate-400 shrink-0" />
                          <span>{member.phone_no}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-center gap-3 text-slate-600 text-[13px] px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-50">
                          <FiMapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="break-words">{member.address}</span>
                        </div>
                      )}

                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider">
                        <FiClock size={12} />
                        <span>{formatLastSeen(member.last_online)}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <a href={`tel:${member.phone_no}`} className="p-2 rounded-lg hover:bg-green-50 hover:text-green-500 transition-colors">
                          <FiPhone size={16} />
                        </a>
                      </div>
                    </div>
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