import React from "react";

const Loader = () => (
  <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm flex flex-col justify-center items-center z-50">
    <div className="flex flex-col items-center space-y-6">
      {/* Spinner with a soft color */}
      <div className="w-16 h-16 border-8 border-solid border-transparent border-t-orange-600 rounded-full animate-spin"></div>

      {/* Spiritual Text with 'Jai Gurudev' */}
      <div className="text-orange-700 font-semibold text-2xl">Loading...</div>
    </div>
  </div>
);

export default Loader;
