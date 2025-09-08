import React, { useState } from "react";
import { theme } from "../theme";

const LastUpdate = () => {
  const [showPopup, setShowPopup] = useState(true);

  const handleUpdate = () => {
    window.location.reload(); // reload the page
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] backdrop-blur-sm bg-black/40">
          <div
            className="flex flex-col gap-6 p-8 rounded-2xl shadow-2xl text-center relative animate-fadeIn"
            style={{
              background: theme.colors.success,
              color: theme.colors.neutralLight,
              fontFamily: theme.fonts.body,
              minWidth: "320px",
              maxWidth: "90%",
            }}
          >
            {/* Heading */}
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: theme.fonts.heading,
              }}
            >
              🚀 New Update Available
            </h2>

            {/* Description */}
            <p className="text-base leading-relaxed">
              A new version of the app is ready. <br />
              Please update now to enjoy the latest features and improvements.
            </p>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              className="px-6 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105"
              style={{
                background: theme.colors.primary,
                color: theme.colors.neutralLight,
                fontFamily: theme.fonts.body,
              }}
            >
              Update Now
            </button>

            {/* Optional Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-4 text-2xl font-bold hover:opacity-80"
              style={{
                color: theme.colors.neutralLight,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LastUpdate;
