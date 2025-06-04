import React, { useState } from "react";
import Suvichar from "./Suvichar";
import { theme } from ".././theme";

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
    <div
      className="max-w-3xl mx-auto p-6 rounded-md shadow-md"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <h2
        className="text-3xl font-bold mb-6 flex items-center gap-2"
        style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary }}
      >
        📢 Latest Notices
      </h2>

      <div className="mb-8">
        <Suvichar />
      </div>

      <div className="space-y-6">
        {notices.map(({ id, title, date, description }) => {
          const isExpanded = expandedIds.includes(id);
          const shortText =
            description.length > 120
              ? description.slice(0, 120) + "..."
              : description;

          return (
            <div
              key={id}
              className="p-5 rounded-lg border border-neutralLight shadow-sm bg-surface transition-shadow hover:shadow-lg"
            >
              <time
                className="text-sm text-tertiary"
                style={{ color: theme.colors.tertiary }}
                dateTime={date}
              >
                {new Date(date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </time>

              <h3
                className="text-xl font-semibold mt-1 mb-3"
                style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary }}
              >
                {title}
              </h3>

              <p className="text-base leading-relaxed mb-3">
                {isExpanded ? description : shortText}
              </p>

              {description.length > 120 && (
                <button
                  onClick={() => toggleExpand(id)}
                  className="text-sm font-semibold px-3 py-1 rounded-md border border-primary text-primary hover:bg-primary hover:text-surface transition-colors"
                  type="button"
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
