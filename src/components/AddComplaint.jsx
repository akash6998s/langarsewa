import React, { useState } from "react";

const AddComplaint = () => {
  const [name, setName] = useState("");
  const [complaint, setComplaint] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit complaint logic here
    console.log("Complaint submitted:", { name, complaint });
    setName("");
    setComplaint("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded shadow">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">Add Complaint</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full mb-4 p-3 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          rows="5"
          className="w-full p-3 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Write your complaint here..."
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full mt-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default AddComplaint;
