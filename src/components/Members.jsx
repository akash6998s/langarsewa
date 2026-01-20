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

  const formatLastSeen = (dateString) => {
    if (!dateString) return "No activity";
    return dateString.split("at")[0].trim(); 
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
    <div className="min-h-screen bg-white">
      <LoadData />
      {isLoading && <Loader />}

      {!isLoading && (
        <>
          {/* PROFESSIONAL HEADER */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 ">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">Sevadar Directory</h1>
              <p className="text-sm text-gray-500 font-medium">Complete member directory with contact details</p>
              
              <div className="flex gap-3 mt-8">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                  />
                </div>
                <button 
                  onClick={() => setSortByOnline(!sortByOnline)}
                  className={`flex items-center justify-center w-14 h-14 border rounded-xl transition-all duration-200 font-medium ${
                    sortByOnline 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm hover:shadow-md hover:bg-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <FiFilter size={18} />
                </button>
              </div>
              
              {sortByOnline && (
                <div className="flex items-center gap-2 mt-3 text-xs font-medium text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Sorted by recent activity
                </div>
              )}
            </div>
          </div>

          {/* MEMBERS GRID */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="grid gap-6">
              {displayedMembers.map((member) => (
                <div 
                  key={member.id}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* HEADER SECTION */}
                  <div className="p-8 pb-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-md group-hover:shadow-lg transition-shadow">
                          {member.img ? (
                            <img 
                              src={member.img} 
                              alt={`${member.name} ${member.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <FiUser className="text-gray-500" size={32} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-800 uppercase tracking-wide">
                          {member.roll_no}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {member.name} {member.last_name}
                      </h2>
                      <div className="flex items-center text-sm font-semibold text-gray-700">
                        <FiBriefcase className="mr-2 text-gray-500" size={16} />
                        {member.post || "Registered Sevadar"}
                      </div>
                    </div>
                  </div>

                  {/* CONTACT INFO */}
                  <div className="px-8 py-6 space-y-4">
                    <DetailLine icon={<FiMail className="text-blue-600" size={16} />} label="Email" value={member.email} />
                    <DetailLine icon={<FiPhone className="text-green-600" size={16} />} label="Phone" value={member.phone_no} />
                    <DetailLine icon={<FiMapPin className="text-purple-600" size={16} />} label="Address" value={member.address} />
                    <DetailLine icon={<FiClock className="text-gray-600" size={16} />} label="Last Active" value={formatLastSeen(member.last_online)} />
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="px-8 pb-8 pt-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-3">
                      <a 
                        href={`tel:${member.phone_no}`}
                        className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 px-6 py-3.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FiPhone size={18} />
                        Call
                      </a>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EMPTY STATE */}
            {displayedMembers.length === 0 && (
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <FiSearch className="text-gray-400" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-500 font-medium text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const DetailLine = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center mt-0.5 text-gray-500 rounded-lg bg-gray-100 mr-4">
      {React.cloneElement(icon)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-semibold text-gray-900 truncate">{value || "Not provided"}</div>
    </div>
  </div>
);

export default Members;
