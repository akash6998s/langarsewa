import React, { useState } from "react";
import Suvichar from "./Suvichar";

const notices = [
  {
    id: 1,
    title: "Scheduled Maintenance on May 30",
    date: "2025-05-29",
    description:
      "Our system will be down for maintenance from 12 AM to 4 AM. Please save your work. We apologize for any inconvenience caused and appreciate your understanding.",
  },
  {
    id: 2,
    title: "New Feature Release: Dark Mode",
    date: "2025-05-25",
    description:
      "We are excited to launch Dark Mode to reduce eye strain during night use. You can enable it from your profile settings to enjoy a more comfortable viewing experience in low-light environments.",
  },
  {
    id: 3,
    title: "Upcoming Webinar on React 18",
    date: "2025-06-05",
    description:
      "Join us for a free webinar on the new features in React 18, scheduled for June 10. Our experts will walk you through concurrent features, automatic batching, and much more. Don't miss out!",
  },
];

const Notice = () => {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 mb-20">
      <h2 className="text-3xl font-bold text-center text-yellow-700 mb-8">
        📢 Latest Notices
      </h2>
      <Suvichar />

      <div className="space-y-6 mt-10">
        {notices.map(({ id, title, date, description }) => {
          const isExpanded = expandedIds.includes(id);
          const shortText =
            description.length > 120
              ? description.slice(0, 120) + "..."
              : description;

          return (
            <div
              key={id}
              className="bg-white border border-yellow-200 rounded-xl shadow-md p-5 hover:shadow-lg transition duration-300"
            >
              <div className="mb-3 relative">
                <time className="absolute right-0 top-0 text-sm text-gray-500">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
                <h3 className="text-lg mt-7 font-semibold text-yellow-700">
                  {title}
                </h3>

              <p className="text-gray-700 leading-relaxed font-serif">
                {isExpanded ? description : shortText}
              </p>
              {description.length > 120 && (
                <button
                  onClick={() => toggleExpand(id)}
                  className="mt-3 inline-block text-sm text-yellow-600 font-semibold hover:underline transition"
                >
                  {isExpanded ? "See Less" : "See More"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notice;
