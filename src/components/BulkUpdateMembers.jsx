import React, { useState } from 'react';
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  deleteField 
} from 'firebase/firestore';
import { db } from '../firebase'; 

const BulkUpdateMembers = () => {
  const [loading, setLoading] = useState(false);
  const targetKey = "naamjap"; 
  const defaultValue = ""; 

  // --- ADD KEY LOGIC ---
  const handleAddKey = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'members'));
      const batch = writeBatch(db);
      let count = 0;
      let alreadyPresent = 0;

      querySnapshot.forEach((document) => {
        const data = document.data();
        
        // Using 'in' operator to check for property existence
        if (data && targetKey in data) {
          alreadyPresent++;
        } else {
          const docRef = doc(db, 'members', document.id);
          batch.update(docRef, { [targetKey]: defaultValue });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`Success! '${targetKey}' added to ${count} members. (${alreadyPresent} already had it).`);
      } else {
        alert(`All documents already contain this key.`);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE KEY LOGIC ---
  const handleDeleteKey = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete '${targetKey}' from ALL members?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'members'));
      const batch = writeBatch(db);
      let count = 0;

      querySnapshot.forEach((document) => {
        const data = document.data();
        if (data && targetKey in data) {
          const docRef = doc(db, 'members', document.id);
          batch.update(docRef, { [targetKey]: deleteField() });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`Success! Removed '${targetKey}' from ${count} documents.`);
      } else {
        alert("Key not found in any documents.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Bulk Update Tool
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Target Field: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">"{targetKey}"</span>
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleAddKey} 
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition-all 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:transform active:scale-95'}`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Add Key to All"}
          </button>

          <button 
            onClick={handleDeleteKey} 
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 active:transform active:scale-95'}`}
          >
            Delete Key from All
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-medium">
            Firebase Operations
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateMembers;