import React, { useState } from "react";

const AddMessage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit message logic here
    console.log("Message submitted:", message);
    setMessage("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded shadow">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">Add Message</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          className="w-full p-3 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full mt-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Submit Message
        </button>
      </form>
    </div>
  );
};

export default AddMessage;
