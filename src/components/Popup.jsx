import React from "react";

const Popup = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <div className="font-semibold">
          {type === "success" ? "✅ Success:" : "❌ Error:"}
        </div>
        <div>{message}</div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Popup;
