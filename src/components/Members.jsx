import React, { useEffect, useState } from 'react';
import LoadData from './LoadData';

const Members = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const storedMembers = localStorage.getItem('allMembers');
    if (storedMembers) {
      try {
        const parsedMembers = JSON.parse(storedMembers);

        const updatedMembers = parsedMembers.map((member) => {
          // Try using the img field to extract extension, else fallback to .png
          let ext = 'png';
          if (member.img && typeof member.img === 'string') {
            const match = member.img.match(/\.(png|jpg|jpeg|webp|ico)$/);
            if (match) ext = match[1];
          }

          return {
            ...member,
            img: `https://raw.githubusercontent.com/akash6998s/Langar-App/main/src/assets/uploads/${member.roll_no}.${ext}`,
          };
        });

        setMembers(updatedMembers);
      } catch (error) {
        console.error('Error parsing allMembers from local storage:', error);
        setMembers([]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <LoadData />
      <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-sm">Our Members</h2>

      {members.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border border-gray-100 transform motion-safe:hover:scale-105"
            >
              <div className="w-28 h-28 bg-blue-50 rounded-full mx-auto mb-5 flex items-center justify-center overflow-hidden border-4 border-blue-200 shadow-md">
                <img
                  src={member.img}
                  alt={`${member.name}'s profile`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Only change the src if it's not already the placeholder
                    if (e.target.src !== 'https://via.placeholder.com/150?text=No+Image') {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2 leading-tight truncate px-2">
                {member.name} {member.last_name}
              </h3>
              <p className="text-gray-700 text-base mb-1">
                <strong className="font-semibold text-gray-800">Roll No:</strong> {member.roll_no}
              </p>
              {member.email && (
                <p className="text-gray-700 text-sm mb-1 truncate px-2">
                  <strong className="font-semibold text-gray-800">Email:</strong> {member.email}
                </p>
              )}
              {member.phone_no && (
                <p className="text-gray-700 text-sm mb-1">
                  <strong className="font-semibold text-gray-800">Phone:</strong> {member.phone_no}
                </p>
              )}
              {member.address && (
                <p className="text-gray-700 text-sm leading-snug px-2">
                  <strong className="font-semibold text-gray-800">Address:</strong> {member.address}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-center text-gray-600 text-xl font-medium">No members found in local storage.</p>
        </div>
      )}
    </div>
  );
};

export default Members;