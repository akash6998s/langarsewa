// Loader.jsx
import React from "react";

const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex flex-col justify-center items-center z-50">
    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
    <span className="mt-5 text-white text-2xl font-medium tracking-wide select-none">
      Loading...
    </span>
  </div>
);

export default Loader;
