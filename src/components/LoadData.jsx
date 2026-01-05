import { useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const LoadData = () => {
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Get user from localStorage
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInMember'));
        const rollNo = loggedInUser?.roll_no;

        // 2. Update Firestore (Last Online)
        if (rollNo) {
          try {
            const userDocRef = doc(db, 'members', rollNo.toString());
            await updateDoc(userDocRef, {
              last_online: serverTimestamp() 
            });
          } catch (e) {
            console.error("Update failed:", e);
          }
        }

        // 3. Fetch Members
        const membersSnapshot = await getDocs(collection(db, 'members'));
        let membersData = [];

        membersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let formattedDate = null;

          // 🔥 Safer Date Formatting (Handles Seconds/Nanoseconds error)
          if (data.last_online) {
            let dateObj;
            if (typeof data.last_online.toDate === 'function') {
              dateObj = data.last_online.toDate();
            } else if (data.last_online.seconds) {
              dateObj = new Date(data.last_online.seconds * 1000);
            }

            if (dateObj) {
              formattedDate = dateObj.toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }) + " UTC+5:30";
            }
          }

          membersData.push({ 
            id: docSnap.id, 
            ...data, 
            last_online: formattedDate // String format mein save hoga
          });
        });

        // Sort members
        membersData.sort((a, b) => (parseInt(a.roll_no) || 0) - (parseInt(b.roll_no) || 0));

        // 4. Fetch Other Data (Expenses, Archived, Incharge)
        // ... (Baki logic same rahega) ...
        const expenseSnap = await getDoc(doc(db, 'expenses', '0uyGTdo1jZ3M9KzL6SXo'));
        const archivedSnap = await getDocs(collection(db, 'archivedDonations'));
        
        const archivedDonationsData = archivedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const inchargeData = {};
        for (const day of days) {
          const rollsSnap = await getDocs(collection(db, 'incharge', day, 'rolls'));
          inchargeData[day] = rollsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // 5. Final Save to LocalStorage
        localStorage.setItem('allMembers', JSON.stringify(membersData));
        localStorage.setItem('expenses', JSON.stringify(expenseSnap.exists() ? expenseSnap.data() : {}));
        localStorage.setItem('allArchivedDonations', JSON.stringify(archivedDonationsData));
        localStorage.setItem('incharge', JSON.stringify(inchargeData));

        console.log('✅ Data sync complete and formatted!');
      } catch (error) {
        console.error('🔥 Global Fetch Error:', error);
      }
    };

    fetchAllData();
  }, []);

  return null;
};

export default LoadData;