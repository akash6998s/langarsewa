import React from "react";
import { theme } from "../theme";

const Loader = () => {
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50"
      style={{ backgroundColor: theme.colors.background + "CC" }} // Slightly transparent background
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Spinner */}
        <div
          className="w-16 h-16 rounded-full border-8 border-solid border-t-transparent animate-spin"
          style={{
            borderColor: `${theme.colors.primary}33`,
            borderTopColor: theme.colors.primary,
          }}
        ></div>

        {/* Loading Text */}
        <div
          className="font-semibold text-2xl"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
          }}
        >
          Loading...
        </div>

      </div>
    </div>
  );
};

export default Loader;
