import React from "react";
import { Sparkles } from "lucide-react";
import { theme } from ".././theme";

const suvichar = {
  quote: `सेवा से बड़ा कोई धर्म नहीं होता,\nऔर गुरु की सेवा सबसे ऊँची सेवा है।`,
  author: "— श्री गुरुदेव",
  postedBy: "Akash Singh",
};

const Suvichar = () => {
  return (
    <div
      className="max-w-xl mx-auto p-6 rounded-lg shadow-md"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles
          className="text-primary"
          size={28}
          strokeWidth={1.5}
          style={{ color: theme.colors.primary }}
        />
        <h3
          className="text-2xl font-bold"
          style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary }}
        >
          आज का सुविचार
        </h3>
      </div>

      <p
        className="text-lg leading-relaxed mb-4"
        style={{ whiteSpace: "pre-line", fontFamily: "serif" }}
      >
        “{suvichar.quote}”
      </p>

      <p
        className="text-base font-semibold mb-1"
        style={{ fontFamily: theme.fonts.heading, color: theme.colors.secondary }}
      >
        {suvichar.author}
      </p>

      <p className="text-sm text-tertiary" style={{ color: theme.colors.tertiary }}>
        Posted by: {suvichar.postedBy}
      </p>
    </div>
  );
};

export default Suvichar;
