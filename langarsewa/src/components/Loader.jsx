import React from "react";
import { theme } from "../theme";

const { colors, fonts } = theme;

const Loader = () => {
  return (
    <div
      className="fixed inset-0 flex flex-col justify-center items-center z-50"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: `${colors.neutralLight}`, // semi-transparent light background
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Spinner */}
        <div
          className="w-16 h-16 rounded-full border-8 border-solid animate-spin"
          style={{
            borderColor: `${colors.primaryLight}66`,
            borderTopColor: colors.primary,
            borderBottomColor: `${colors.primaryLight}33`,
            borderLeftColor: `${colors.primaryLight}33`,
            borderRightColor: `${colors.primaryLight}33`,
          }}
        ></div>

        {/* Loading Text */}
        <div
          className="text-2xl font-semibold"
          style={{
            color: colors.primary,
            fontFamily: fonts.body,
          }}
        >
          Loading...
        </div>
      </div>
    </div>
  );
};

export default Loader;
