import React from "react";
import { Link } from "react-router-dom";

const ALL_BUTTONS = [
  {
    id: "createpost",
    title: "Create Post",
    icon: "✍️",
    path: "/createpost",
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "gallery",
    title: "Gallery",
    icon: "🖼️",
    path: "/gallery",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "members",
    title: "Members",
    icon: "👥",
    path: "/members",
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "naamjap",
    title: "Naam Jap",
    icon: "🙏",
    path: "/naamjap",
    color: "from-rose-400 to-pink-600",
  },
];

function WorkspaceButtons({ show = [] }) {
  const buttons =
    show.length === 0
      ? ALL_BUTTONS
      : ALL_BUTTONS.filter((btn) => show.includes(btn.id));

  return (
    <div className="grid grid-cols-4 gap-3">
      {buttons.map((option) => (
        <Link
          key={option.id}
          to={option.path}
          className="active:scale-95 transition-all duration-200"
        >
          <div className="bg-white py-4 rounded-2xl border border-gray-100 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.12)] flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center shadow-md mb-2`}
            >
              <span className="text-lg text-white">{option.icon}</span>
            </div>
            <h4 className="font-bold text-[11px] text-gray-800 leading-tight">
              {option.title}
            </h4>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default WorkspaceButtons;
