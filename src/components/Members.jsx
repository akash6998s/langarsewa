import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import LoadData from "./LoadData";
import { 
  FiSearch, FiClock, FiPhone, FiMail, FiMapPin, 
  FiFilter, FiUser, FiBriefcase, FiHash
} from "react-icons/fi";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByOnline, setSortByOnline] = useState(false);

  // Helper: Relative Time Formatter
  const getRelativeTime = (dateString) => {
    if (!dateString) return "No activity";
    try {
      const cleanDate = dateString.replace(/\bat\b/i, "").split("UTC")[0].trim();
      const date = new Date(cleanDate);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "just now";
      const minutes = Math.floor(diffInSeconds / 60);
      if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
      const weeks = Math.floor(days / 7);
      if (days < 30) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch (e) {
      console.log(e)
      return dateString;
    }
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
    } catch (error) { console.error(error); } 
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
    <div className="min-h-screen bg-gray-50">
      <LoadData />
      {isLoading && <Loader />}

      {!isLoading && (
        <>
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Sevadar Directory</h1>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm"
                  />
                </div>
                <button 
                  onClick={() => setSortByOnline(!sortByOnline)}
                  className={`px-4 rounded-2xl transition-all border-2 ${
                    sortByOnline ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  <FiFilter size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid gap-8">
              {displayedMembers.map((member) => (
                <div 
                  key={member.id}
                  className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-50 transition-all duration-500 overflow-hidden"
                >
                  {/* CARD HEADER */}
                  <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      {/* PROFILE IMAGE */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2.2rem] overflow-hidden bg-gray-100 ring-4 ring-gray-50 shadow-inner">
                          {member.img ? (
                            <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              <FiUser size={40} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NAME & CONDITIONAL POST */}
                      <div className="flex flex-col justify-center">
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">
                          {member.name} {member.last_name}
                        </h2>
                        
                        {/* Only show if member.post is NOT empty */}
                        {member.post && member.post.trim() !== "" && (
                          <div className="flex items-center mt-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                            <FiBriefcase className="mr-2" size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {member.post}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LARGE ROLL NUMBER BADGE */}
                    <div className="flex-shrink-0 text-center">
                      <div className="bg-gradient-to-br from-gray-800 to-black text-white min-w-[70px] h-[70px] md:min-w-[80px] md:h-[80px] rounded-3xl flex flex-col items-center justify-center shadow-xl border-4 border-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none">
                          {member.roll_no}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="px-8 py-6 bg-gray-50/30 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50">
                    <DetailLine icon={<FiMail size={16} />} label="Email Address" value={member.email} />
                    <DetailLine icon={<FiPhone size={16} />} label="Contact Number" value={member.phone_no} />
                    <DetailLine icon={<FiMapPin size={16} />} label="Primary Location" value={member.address} />
                    <DetailLine 
                      icon={<FiClock size={16} />} 
                      label="Recent Activity" 
                      value={getRelativeTime(member.last_online)} 
                      highlight 
                    />
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="px-8 pb-8 pt-2">
                    <a 
                      href={`tel:${member.phone_no}`}
                      className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-100"
                    >
                      <FiPhone size={18} />
                      Call Now
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* EMPTY STATE */}
            {displayedMembers.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiSearch className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-black text-lg">No Results Found</p>
                <p className="text-gray-400 text-sm">Try searching for a different name or roll number.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const DetailLine = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-4 group/line">
    <div className={`mt-1 p-2.5 rounded-xl transition-colors ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm font-bold truncate ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>
        {value && value !== "" ? value : "Not Provided"}
      </p>
    </div>
  </div>
);

export default Members;