import React from "react";
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../firebase"; // adjust the path to your firebase config

const RemoveImgFromMembers = () => {
  const handleRemoveImg = async () => {
    try {
      const membersRef = collection(db, "members");
      const snapshot = await getDocs(membersRef);

      const updatePromises = snapshot.docs.map((memberDoc) => {
        const docRef = doc(db, "members", memberDoc.id);
        return updateDoc(docRef, {
          img: deleteField(),
        });
      });

      await Promise.all(updatePromises);
      alert("Successfully removed 'img' field from all members.");
    } catch (error) {
      console.error("Error removing 'img' fields:", error);
      alert("Something went wrong while removing 'img' fields.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleRemoveImg}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Remove 'img' from All Members
      </button>
    </div>
  );
};

export default RemoveImgFromMembers;
