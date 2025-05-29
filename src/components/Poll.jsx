import React, { useState } from 'react';

const pollData = {
  question: "गुरु की सेवा का सबसे बड़ा लाभ क्या है?",
  options: [
    "आत्मिक शांति",
    "सच्चे मार्ग की पहचान",
    "अहंकार का विनाश",
    "परम कृपा की प्राप्ति"
  ],
};

const Poll = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption) {
      setSubmitted(true);
      // Here you can send selectedOption to backend
      console.log("Voted for:", selectedOption);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg border border-yellow-200">
      <h2 className="text-xl font-semibold text-yellow-800 mb-4">{pollData.question}</h2>
      
      {pollData.options.map((option, index) => (
        <label
          key={index}
          className={`block px-4 py-2 border rounded-md cursor-pointer mb-2 transition ${
            selectedOption === option
              ? 'bg-yellow-100 border-yellow-400 text-yellow-800 font-semibold'
              : 'bg-gray-50 hover:bg-yellow-50'
          }`}
        >
          <input
            type="radio"
            name="poll"
            value={option}
            className="mr-2"
            checked={selectedOption === option}
            onChange={() => setSelectedOption(option)}
            disabled={submitted}
          />
          {option}
        </label>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-4 px-5 py-2 bg-yellow-500 text-white font-medium rounded hover:bg-yellow-600 transition"
          disabled={!selectedOption}
        >
          Submit Vote
        </button>
      ) : (
        <p className="mt-4 text-green-600 font-medium">धन्यवाद! आपने मतदान कर दिया है।</p>
      )}
    </div>
  );
};

export default Poll;
