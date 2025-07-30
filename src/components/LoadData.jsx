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

        console.log('Original membersData (before sort):', membersData);

        membersData.sort((a, b) => {
          // *** THE CHANGE IS HERE: Use the correct field name from your Firestore documents ***
          // Assuming the field name is 'roll_no'. If it's something else (e.g., 'rollNo'),
          // replace 'a.roll_no' with 'a.rollNo' etc.
          const aRollNumberRaw = a.roll_no; // <-- Changed from a.roll_number
          const bRollNumberRaw = b.roll_no; // <-- Changed from b.roll_number

          const rollA = parseInt(aRollNumberRaw, 10);
          const rollB = parseInt(bRollNumberRaw, 10);

          console.log(`Comparing roll_number: ${aRollNumberRaw} (${rollA}) vs ${bRollNumberRaw} (${rollB}) -> Result: ${rollA - rollB}`);

          // Handle NaN values to put them at the end or beginning
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

        console.log('Sorted membersData (after sort):', membersData);

        const expenseRef = doc(db, 'expenses', 'XR807MiRlgOmffPbCosQ');
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

        console.log('✅ Data stored as → allMembers, expenses, allArchivedDonations');
      } catch (error) {
        console.error('🔥 Error loading Firestore data:', error);
      }
    };

    fetchAllData();
  }, []);

  return null;
};

export default LoadData;