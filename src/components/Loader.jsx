import React from "react";
import { theme } from "../theme";

const { colors, fonts } = theme;

const Loader = () => {
  return (
    <div
      className="fixed inset-0 flex flex-col justify-center items-center z-[10000]"
      style={{
        backdropFilter: "blur(6px)",
        // neutralLight (White) ko thoda transparent kiya hai taaki blur effect dikhe
        backgroundColor: `${colors.neutralLight}B3`, 
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Spinner */}
        <div
          className="w-16 h-16 rounded-full border-8 border-solid animate-spin"
          style={{
            // 1. Top border ko 'Primary' (Dark Slate) rakha hai (Yeh ghumta hua dikhega)
            borderTopColor: colors.primary, 
            
            // 2. Baaki 3 sides ko 'PrimaryLight' (Light Grayish) rakha hai
            borderRightColor: colors.primaryLight,
            borderBottomColor: colors.primaryLight,
            borderLeftColor: colors.primaryLight,
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