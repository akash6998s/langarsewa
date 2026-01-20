import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import CustomPopup from "./Popup";
import LoadData from "./LoadData";
import Activity from "./Activity";
import WorkspaceButtons from "./WorkspaceButtons";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Shield,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Power,
  Zap,
  MoreHorizontal,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);

  const supportedExtensions = ["png", "jpg", "jpeg", "webp", "ico"];

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const storedMember = localStorage.getItem("loggedInMember");
        if (storedMember) {
          const parsedMember = JSON.parse(storedMember);
          setMember(parsedMember);

          let foundImageUrl = null;
          if (parsedMember.roll_no) {
            for (let ext of supportedExtensions) {
              const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${parsedMember.roll_no}.${ext}`;
              const exists = await checkImageExists(url);
              if (exists) {
                foundImageUrl = url;
                break;
              }
            }
          }
          setImageUrl(foundImageUrl);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadProfileData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  const totalAttendance = member?.attendance
    ? Object.values(member.attendance).reduce((yearSum, year) => {
        return (
          yearSum +
          Object.values(year).reduce((monthSum, month) => {
            return monthSum + Object.values(month).filter(Boolean).length;
          }, 0)
        );
      }, 0)
    : 0;

  const totalDonation = Object.values(
    member?.donation?.["2025"] || {}
  ).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-slate-900">
      <LoadData />

      <div className="max-w-md mx-auto px-6 pt-8">
        {/* ---------- PROFILE HEADER ---------- */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 ring-4 ring-white shadow-sm">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
            {member?.isAdmin && (
              <div className="absolute bottom-1 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                <Shield className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              {member?.name} {member?.last_name}
            </h1>
            <p className="text-slate-500 text-[13px] flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              {member?.roll_no || "---"}
            </p>
            <div className="mt-3 inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold">
              {member?.post}
            </div>
          </div>
        </div>

        {/* ---------- WORKSPACE BUTTONS ---------- */}
        <div className="mb-10">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">
            Workspace
          </h3>

          <WorkspaceButtons
            show={["createpost", "gallery", "naamjap", "members"]}
          />
        </div>

        {/* ---------- STATS ---------- */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <MetricBox
            label="Naamjap"
            value={member?.naamjap?.toLocaleString() || 0}
            icon={<Zap className="text-amber-500" />}
          />
          <MetricBox
            label="Attendance"
            value={`${totalAttendance} Days`}
            icon={<BarChart3 className="text-blue-500" />}
          />
          <div className="col-span-2">
            <MetricBox
              label="Total Donation"
              value={`₹${totalDonation.toLocaleString()}`}
              icon={<TrendingUp className="text-emerald-500" />}
              horizontal
            />
          </div>
        </div>

        {/* ---------- DETAILS ---------- */}
        <div className="bg-white rounded-3xl border border-slate-100 mb-8">
          <div className="px-6 py-5 border-b border-slate-50">
            <h3 className="text-sm font-bold">Account Information</h3>
          </div>
          <div className="p-2">
            <DetailRow icon={<Mail />} label="Email Address" value={member?.email} />
            <DetailRow icon={<Phone />} label="Contact Number" value={member?.phone_no} />
            <DetailRow icon={<MapPin />} label="Address" value={member?.address || "India"} />
          </div>
        </div>

        {/* ---------- ACTIVITY ---------- */}
        <div className="mb-8">
          <h3 className="text-sm font-bold px-1 mb-3">Your Activity</h3>
          <div className="rounded-3xl border border-slate-100">
            <Activity />
          </div>
        </div>

        {/* ---------- LOGOUT ---------- */}
        <button
          onClick={() => {
            localStorage.removeItem("loggedInMember");
            navigate("/");
          }}
          className="w-full flex items-center justify-between p-4 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-[13px] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Power className="w-4 h-4" />
            Sign Out
          </div>
          <ChevronRight className="w-4 h-4 opacity-30" />
        </button>
      </div>

      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}
    </div>
  );
};

/* ---------- SUB COMPONENTS ---------- */

const MetricBox = ({ label, value, icon, horizontal = false }) => (
  <div
    className={`bg-white p-5 rounded-2xl border border-slate-100 flex ${
      horizontal ? "items-center justify-between" : "flex-col gap-3"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      {!horizontal && <MoreHorizontal className="w-4 h-4 text-slate-200" />}
    </div>

    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    </div>

    {horizontal && <ChevronRight className="w-5 h-5 text-slate-200" />}
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
      {React.cloneElement(icon, { className: "w-4 h-4" })}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
        {label}
      </p>
      <p className="text-[13px] font-bold truncate">{value || "---"}</p>
    </div>
  </div>
);

export default Profile;
