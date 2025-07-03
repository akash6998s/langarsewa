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
    <div
      className="fixed inset-0 flex items-center justify-center z-[999] backdrop-blur-sm bg-black/30"
    >
      <div
        className="flex flex-col gap-2 p-6 rounded-2xl shadow-2xl border relative"
        style={{
          backgroundColor: bgColor,
          color: theme.colors.surface,
          borderColor: `${theme.colors.surface}33`,
          fontFamily: theme.fonts.body,
          minWidth: "300px",
          maxWidth: "90%",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold hover:opacity-80"
          style={{ color: theme.colors.surface }}
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
