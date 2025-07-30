import React from "react";
import { theme } from "../theme";

const Popup = ({ message, type, onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";

  // Use theme colors for background based on type
  const bgColor = isSuccess
    ? theme.colors.success
    : theme.colors.danger; // Using danger for error/accent as per theme.js

  const title = isSuccess ? "✅ Success:" : "❌ Error:";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[999] backdrop-blur-sm bg-black/30"
    >
      <div
        className="flex flex-col gap-2 p-6 rounded-2xl shadow-2xl border relative"
        style={{
          backgroundColor: bgColor,
          color: theme.colors.neutralLight, // Text color from theme
          borderColor: `${theme.colors.neutralLight}33`, // Border color from theme with transparency
          fontFamily: theme.fonts.body, // Font family from theme
          minWidth: "300px",
          maxWidth: "90%",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold hover:opacity-80"
          style={{ color: theme.colors.neutralLight }} // Close button color from theme
        >
          ×
        </button>
        <div className="font-semibold text-lg">{title}</div>
        <div className="break-words">{message}</div>
      </div>
    </div>
  );
};

export default Popup;
