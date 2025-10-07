import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const LoadData = () => {
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // ======== MEMBERS ========
        const membersCol = collection(db, 'members');
        const membersSnapshot = await getDocs(membersCol);
        let membersData = [];

        membersSnapshot.forEach((docSnap) => {
          membersData.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Sort by roll number
        membersData.sort((a, b) => {
          const rollA = parseInt(a.roll_no, 10);
          const rollB = parseInt(b.roll_no, 10);
          if (isNaN(rollA) && isNaN(rollB)) return 0;
          if (isNaN(rollA)) return 1;
          if (isNaN(rollB)) return -1;
          return rollA - rollB;
        });

        // ======== EXPENSES ========
        const expenseRef = doc(db, 'expenses', '0uyGTdo1jZ3M9KzL6SXo');
        const expenseSnap = await getDoc(expenseRef);
        const expenseData = expenseSnap.exists() ? expenseSnap.data() : {};

        // ======== ARCHIVED DONATIONS ========
        const archivedDonationsCol = collection(db, 'archivedDonations');
        const archivedDonationsSnapshot = await getDocs(archivedDonationsCol);
        const archivedDonationsData = [];
        archivedDonationsSnapshot.forEach((docSnap) => {
          archivedDonationsData.push({ id: docSnap.id, ...docSnap.data() });
        });

        // ======== INCHARGE (monday → sunday → rolls) ========
        const days = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ];

        const inchargeData = {};

        for (const day of days) {
          const rollsCol = collection(db, 'incharge', day, 'rolls');
          const rollsSnapshot = await getDocs(rollsCol);
          const rolls = rollsSnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          inchargeData[day] = rolls;
        }

        // ======== SAVE TO LOCALSTORAGE ========
        localStorage.setItem('allMembers', JSON.stringify(membersData));
        localStorage.setItem('expenses', JSON.stringify(expenseData));
        localStorage.setItem('allArchivedDonations', JSON.stringify(archivedDonationsData));
        localStorage.setItem('incharge', JSON.stringify(inchargeData));

        console.log('✅ All Firestore data saved to localStorage successfully!');
      } catch (error) {
        console.error('🔥 Error loading Firestore data:', error);
      }
    };

    fetchAllData();
  }, []);

  return null;
};

export default LoadData;
