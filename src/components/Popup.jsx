import React from "react";
import { theme } from "../theme";

const Popup = ({ message, type, onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";

  const bgColor = isSuccess
    ? theme.colors.success
    : theme.colors.accent;

  const title = isSuccess ? "✅ Success:" : "❌ Error:";

  return (
    <div className="fixed top-5 right-5 z-[999]">
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl border"
        style={{
          backgroundColor: bgColor,
          color: theme.colors.surface,
          borderColor: `${theme.colors.surface}33`,
          fontFamily: theme.fonts.body,
          minWidth: "250px",
        }}
      >
        <div className="font-semibold">{title}</div>
        <div className="flex-grow break-words">{message}</div>
        <button
          onClick={onClose}
          className="ml-2 text-xl leading-none"
          style={{
            color: theme.colors.surface,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Popup;
