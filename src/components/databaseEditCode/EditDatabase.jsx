import { useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

function EditDatabase() {
  useEffect(() => {
    const updateMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const snapshot = await getDocs(membersRef);

        const updates = snapshot.docs.map(async (docSnap) => {
          const ref = doc(db, "members", docSnap.id);
          await updateDoc(ref, {
            isAdmin: false,
            isSuperAdmin: false,
          });
        });

        await Promise.all(updates);
        alert("✅ All members updated successfully!");
      } catch (error) {
        console.error("❌ Error updating members:", error);
        alert("Error updating members: " + error.message);
      }
    };

    updateMembers();
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Updating Members...</h1>
      <p>This page will automatically update all members with admin flags.</p>
    </div>
  );
}

export default EditDatabase;
