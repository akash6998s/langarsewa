import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const LoadData = () => {
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 🔹 Fetch all members
        const membersCol = collection(db, 'members');
        const membersSnapshot = await getDocs(membersCol);
        const membersData = [];

        membersSnapshot.forEach((doc) => {
          membersData.push({ id: doc.id, ...doc.data() });
        });

        // 🔹 Fetch expense data
        const expenseRef = doc(db, 'expenses', 'hPTZ3pkljqT2yuiKLDA3');
        const expenseSnap = await getDoc(expenseRef);
        const expenseData = expenseSnap.exists() ? expenseSnap.data() : {};

        // 🔹 Store in localStorage
        localStorage.setItem('allMembers', JSON.stringify(membersData));
        localStorage.setItem('expenses', JSON.stringify(expenseData));

        console.log('✅ Data stored as → allMembers, expenses');
      } catch (error) {
        console.error('🔥 Error loading Firestore data:', error);
      }
    };

    fetchAllData();
  }, []);

  return null; // ⛔ Don't render anything
};

export default LoadData;
