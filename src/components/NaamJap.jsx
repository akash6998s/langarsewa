import React, { useState, useEffect, useCallback } from "react";
import Topbar from "./Topbar";
import { db } from "../firebase"; // Apna firebase config path check kar lein
import { doc, updateDoc, increment, onSnapshot } from "firebase/firestore";

const NaamJap = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [liquidHeight, setLiquidHeight] = useState('0%');
  const [rollNo, setRollNo] = useState(null);
  const [totalMala, setTotalMala] = useState(0);

  // 1. Local Storage se Roll No aur Firebase se Real-time Data
  useEffect(() => {
    const memberData = localStorage.getItem('loggedInMember');
    if (memberData) {
      try {
        const parsed = JSON.parse(memberData);
        const rNo = parsed.roll_no.toString();
        setRollNo(rNo);

        const unsub = onSnapshot(doc(db, "members", rNo), (docSnap) => {
          if (docSnap.exists()) {
            setTotalMala(docSnap.data().naamjap || 0);
          }
        });
        return () => unsub();
      } catch (e) {
        console.error("Initialization Error", e);
      }
    }
  }, []);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getLiquidProgress = (count) => {
    const progressInCycle = count % 108;
    return progressInCycle === 0 && count > 0 ? 1 : progressInCycle / 108;
  };

  const saveToStorage = useCallback((count) => {
    const todayStr = getTodayDate();
    const savedData = localStorage.getItem('naamJapData');
    let data;
    
    try {
      data = savedData ? JSON.parse(savedData) : { today: todayStr, yesterday: "", todayCount: 0, yesterdayCount: 0 };
      if (data.today !== todayStr) {
        data.yesterday = data.today;
        data.yesterdayCount = data.todayCount;
        data.today = todayStr;
        data.todayCount = 0;
      }
      data.todayCount = count;
      localStorage.setItem('naamJapData', JSON.stringify(data));
    } catch (e) {
      console.error("Save Error", e);
    }
  }, []);

  const updateFirebaseMala = async () => {
    if (!rollNo) return;
    try {
      await updateDoc(doc(db, "members", rollNo), {
        naamjap: increment(1)
      });
    } catch (error) {
      console.error("Firebase Sync Error:", error);
    }
  };

  const loadFromStorage = useCallback(() => {
    const todayStr = getTodayDate();
    const savedData = localStorage.getItem('naamJapData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.today !== todayStr) {
          setTodayCount(0);
          setYesterdayCount(data.todayCount);
          setLiquidHeight('0%');
          saveToStorage(0);
        } else {
          setTodayCount(data.todayCount);
          setYesterdayCount(data.yesterdayCount);
          setLiquidHeight(`${getLiquidProgress(data.todayCount) * 100}%`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [saveToStorage]);

  useEffect(() => {
    loadFromStorage();
    const interval = setInterval(loadFromStorage, 10000);
    return () => clearInterval(interval);
  }, [loadFromStorage]);

  const handleJap = () => {
    const newCount = todayCount + 1;
    setTodayCount(newCount);
    setLiquidHeight(`${getLiquidProgress(newCount) * 100}%`);
    saveToStorage(newCount);

    if (newCount % 108 === 0) {
      updateFirebaseMala();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  const todayMalas = Math.floor(todayCount / 108);
  const todayProgressInMala = (todayCount % 108 === 0 && todayCount > 0) ? 108 : todayCount % 108;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FFF5E4] to-[#FBD2A8] flex flex-col font-sans select-none overflow-hidden">
      <Topbar />
      
      {/* Stats Section - Optimized for all screens */}
      <div className="w-full px-4 pt-24 pb-4">
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {/* Yesterday */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl py-3 flex flex-col items-center border border-white/40 shadow-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">कल</span>
            <span className="text-xl font-black text-orange-600 leading-none my-1">{Math.floor(yesterdayCount / 108)}</span>
            <span className="text-[9px] font-bold text-orange-800/40">MALA</span>
          </div>
          
          {/* Today */}
          <div className="bg-white shadow-lg rounded-2xl py-3 flex flex-col items-center border border-orange-100 ring-2 ring-orange-400/10">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">आज</span>
            <span className="text-xl font-black text-orange-700 leading-none my-1">{todayMalas}</span>
            <span className="text-[9px] font-bold text-orange-900/60">{todayProgressInMala}/108</span>
          </div>

          {/* Lifetime (Firebase) */}
          <div className="bg-orange-500/10 backdrop-blur-md rounded-2xl py-3 flex flex-col items-center border border-orange-200">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-tighter">कुल</span>
            <span className="text-xl font-black text-orange-900 leading-none my-1">{totalMala}</span>
            <span className="text-[9px] font-bold text-orange-900/40">TOTAL</span>
          </div>
        </div>
      </div>

      {/* Main Jap Button Section - Centered */}
      <div className="flex items-center justify-center p-6 mb-10">
        <button
          onClick={handleJap}
          className="relative group transition-all duration-300 active:scale-90 touch-none"
          style={{ 
            width: 'min(80vw, 320px)', 
            height: 'min(80vw, 320px)' 
          }}
        >
          {/* Outer Ring Decoration */}
          <div className="absolute -inset-4 border-2 border-dashed border-orange-300/30 rounded-full animate-spin-slow" />
          
          <div className="relative w-full h-full rounded-full bg-white border-[10px] border-orange-50 shadow-[0_20px_50px_rgba(251,146,60,0.3)] overflow-hidden">
            {/* Liquid Fill */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-500 via-orange-400 to-orange-300 transition-all duration-500 ease-out"
              style={{ height: liquidHeight }}
            />
            
            {/* Animated Wave Overlay */}
            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_0%,white_50%,transparent_100%)] animate-wave" style={{ backgroundSize: '200% 100%' }} />
            
            {/* Count Text */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <span className="text-6xl sm:text-7xl font-black text-gray-800 tabular-nums drop-shadow-md">
                {todayCount.toLocaleString()}
              </span>
            </div>
          </div>
        </button>
      </div>
      
      <style jsx>{`
        @keyframes wave {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-wave { animation: wave 4s linear infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default NaamJap;