import React, { useState } from "react";

const AddSuvichar = () => {
  const [suvichar, setSuvichar] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit suvichar logic here
    console.log("Suvichar submitted:", suvichar);
    setSuvichar("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded shadow">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">Add Suvichar</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          className="w-full p-3 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Write your suvichar here..."
          value={suvichar}
          onChange={(e) => setSuvichar(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full mt-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Submit Suvichar
        </button>
      </form>
    </div>
  );
};

export default AddSuvichar;
