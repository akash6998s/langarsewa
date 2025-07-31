import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const LoadData = () => {
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const membersCol = collection(db, 'members');
        const membersSnapshot = await getDocs(membersCol);
        let membersData = [];

        membersSnapshot.forEach((doc) => {
          membersData.push({ id: doc.id, ...doc.data() });
        });

        membersData.sort((a, b) => {
          const aRollNumberRaw = a.roll_no;
          const bRollNumberRaw = b.roll_no;

          const rollA = parseInt(aRollNumberRaw, 10);
          const rollB = parseInt(bRollNumberRaw, 10);

          if (isNaN(rollA) && isNaN(rollB)) {
            return 0;
          }
          if (isNaN(rollA)) {
            return 1;
          }
          if (isNaN(rollB)) {
            return -1;
          }

          return rollA - rollB;
        });

        // *** CHANGE THE DOCUMENT ID HERE ***
        const expenseRef = doc(db, 'expenses', '0uyGTdo1jZ3M9KzL6SXo'); // Changed to match your URL
        const expenseSnap = await getDoc(expenseRef);
        const expenseData = expenseSnap.exists() ? expenseSnap.data() : {};

        const archivedDonationsCol = collection(db, 'archivedDonations');
        const archivedDonationsSnapshot = await getDocs(archivedDonationsCol);
        const archivedDonationsData = [];

        archivedDonationsSnapshot.forEach((doc) => {
          archivedDonationsData.push({ id: doc.id, ...doc.data() });
        });

        localStorage.setItem('allMembers', JSON.stringify(membersData));
        localStorage.setItem('expenses', JSON.stringify(expenseData));
        localStorage.setItem('allArchivedDonations', JSON.stringify(archivedDonationsData));

      } catch (error) {
        console.error('🔥 Error loading Firestore data:', error);
      }
    };

    fetchAllData();
  }, []);

  return null;
};

export default LoadData;