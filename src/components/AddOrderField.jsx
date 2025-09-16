import React, { useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const AddOrderField = () => {
  useEffect(() => {
    const addOrder = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "images"));
        let index = 0;

        for (const docSnap of querySnapshot.docs) {
          const docRef = doc(db, "images", docSnap.id);

          // If order already exists, skip
          if (docSnap.data().order !== undefined) continue;

          await updateDoc(docRef, { order: index });
          console.log(`Updated ${docSnap.id} with order: ${index}`);
          index++;
        }

        alert("Order field added successfully ✅");
      } catch (error) {
        console.error("Error adding order field:", error);
      }
    };

    addOrder();
  }, []);

  return <div className="p-4">Updating Firestore with order field...</div>;
};

export default AddOrderField;
