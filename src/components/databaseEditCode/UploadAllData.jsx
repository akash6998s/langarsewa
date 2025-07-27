import React from "react";
import members from "../../data/members.json";
import attendanceRaw from "../../data/attendance.json";
import donationsRaw from "../../data/donations.json";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

const buildAttendanceMap = () => {
  const map = {};
  const year = "2025";

  attendanceRaw.forEach((yearData) => {
    const y = Object.keys(yearData)[0];
    if (y !== year) return;

    const months = yearData[y];

    Object.entries(months).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, rollMap]) => {
        Object.keys(rollMap).forEach((rollStr) => {
          const roll = parseInt(rollStr);
          if (!map[roll]) map[roll] = {};
          if (!map[roll][month]) map[roll][month] = [];
          if (!map[roll][month].includes(parseInt(day))) {
            map[roll][month].push(parseInt(day));
          }
        });
      });
    });
  });

  // Nest under the year
  const finalMap = {};
  for (const roll in map) {
    finalMap[roll] = {
      [year]: map[roll]
    };
  }

  return finalMap;
};

const buildDonationMap = () => {
  const map = {};
  const year = "2025";

  if (!donationsRaw[year]) return map;

  Object.entries(donationsRaw[year]).forEach(([month, rollDonations]) => {
    Object.entries(rollDonations).forEach(([rollStr, amount]) => {
      const roll = parseInt(rollStr);
      if (!map[roll]) map[roll] = {};
      map[roll][month] = amount;
    });
  });

  const finalMap = {};
  for (const roll in map) {
    finalMap[roll] = {
      [year]: map[roll]
    };
  }

  return finalMap;
};

const UploadAllData = () => {
  const handleUpload = async () => {
    const attendanceMap = buildAttendanceMap();
    const donationMap = buildDonationMap();

    for (const member of members) {
      const roll_no = parseInt(member.roll_no);
      const finalData = {
        ...member,
        roll_no,
        attendance: attendanceMap[roll_no] || {},  // nested under 2025 only if present
        donation: donationMap[roll_no] || {}
      };

      try {
        await setDoc(doc(db, "members", roll_no.toString()), finalData);
        console.log(`✅ Uploaded roll_no ${roll_no}`);
      } catch (error) {
        console.error(`❌ Error uploading roll_no ${roll_no}:`, error);
      }
    }

    alert("✅ All members uploaded to Firebase in the new format!");
  };

  return (
    <div className="p-4">
      <button
        onClick={handleUpload}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Upload All Member Data to Firebase
      </button>
    </div>
  );
};

export default UploadAllData;
