import { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const DownloadBackupFiles = () => {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to get current date and time in DD-MM-YYYY_H:MM_am/pm format
  const getFormattedDateTime = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = today.getFullYear();

    let hours = today.getHours();
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    hours = String(hours).padStart(2, '0'); // Ensure two digits for hour

    return `${day}-${month}-${year}_${hours}:${minutes}_${ampm}`;
  };

  const handleDownloadAllData = async () => {
    setDownloading(true);
    setMessage('Fetching and preparing data for download...');

    try {
      const zip = new JSZip();

      // --- 1. Fetch Members Data ---
      const membersCol = collection(db, 'members');
      const membersSnapshot = await getDocs(membersCol);
      let membersData = [];
      membersSnapshot.forEach((d) => {
        membersData.push({ id: d.id, ...d.data() });
      });

      // Sort membersData
      membersData.sort((a, b) => {
        const aRollNumberRaw = a.roll_no;
        const bRollNumberRaw = b.roll_no;
        const rollA = parseInt(aRollNumberRaw, 10);
        const rollB = parseInt(bRollNumberRaw, 10);

        if (isNaN(rollA) && isNaN(rollB)) return 0;
        if (isNaN(rollA)) return 1;
        if (isNaN(rollB)) return -1;
        return rollA - rollB;
      });

      if (membersData.length > 0) {
        zip.file('allMembers.json', JSON.stringify(membersData, null, 2));
        console.log("Added allMembers.json to zip.");
      } else {
        console.warn("No members data fetched.");
      }

      // --- 2. Fetch Expenses Data ---
      // This is the line that has been updated with your document ID.
      const expenseRef = doc(db, 'expenses', '0uyGTdo1jZ3M9KzL6SXo');
      const expenseSnap = await getDoc(expenseRef);
      const expenseData = expenseSnap.exists() ? expenseSnap.data() : {};

      if (Object.keys(expenseData).length > 0) {
        zip.file('expenses.json', JSON.stringify(expenseData, null, 2));
        console.log("Added expenses.json to zip.");
      } else {
        console.warn("No expense data fetched.");
      }

      // --- 3. Fetch Archived Donations Data ---
      const archivedDonationsCol = collection(db, 'archivedDonations');
      const archivedDonationsSnapshot = await getDocs(archivedDonationsCol);
      const archivedDonationsData = [];
      archivedDonationsSnapshot.forEach((d) => {
        archivedDonationsData.push({ id: d.id, ...d.data() });
      });

      if (archivedDonationsData.length > 0) {
        zip.file('allArchivedDonations.json', JSON.stringify(archivedDonationsData, null, 2));
        console.log("Added allArchivedDonations.json to zip.");
      } else {
        console.warn("No archived donations data fetched.");
      }

      // --- Generate and Download ZIP ---
      const dateTimeString = getFormattedDateTime();
      const zipFileName = `Firestore_Backup_${dateTimeString}.zip`;

      setMessage('Generating ZIP file...');
      zip.generateAsync({ type: 'blob' })
        .then((content) => {
          saveAs(content, zipFileName);
          setMessage('ZIP file downloaded successfully!');
          console.log(`ZIP file "${zipFileName}" created and downloaded.`);
        })
        .catch((err) => {
          setMessage(`Error generating ZIP: ${err.message}`);
          console.error("Error generating ZIP:", err);
        });

    } catch (error) {
      console.error('🔥 Error fetching Firestore data:', error);
      setMessage(`Error fetching data: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Firestore Data Backup</h2>
      <p style={styles.description}>Click the button below to download all your Firestore data as a single ZIP archive, named with today's date and time.</p>
      <button
        onClick={handleDownloadAllData}
        disabled={downloading}
        style={styles.button}
      >
        {downloading ? 'Preparing Download...' : 'Download All Data as ZIP'}
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

// Basic Inline Styles (for demonstration)
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '600px',
    margin: '50px auto',
    padding: '30px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '10px',
    textAlign: 'center',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
  },
  title: {
    color: '#333',
    marginBottom: '15px',
  },
  description: {
    color: '#555',
    fontSize: '1em',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1em',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    outline: 'none',
  },
  buttonHover: {
    backgroundColor: '#45a049',
    transform: 'scale(1.02)',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '20px',
    color: '#666',
    fontSize: '0.9em',
  },
};

export default DownloadBackupFiles;