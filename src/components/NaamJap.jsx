import React, { useState, useEffect, useCallback } from "react";
import Topbar from "./Topbar";

const NaamJap = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [liquidHeight, setLiquidHeight] = useState('0%');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getLiquidProgress = (count) => {
    const progressInCycle = count % 108;
    return progressInCycle === 0 ? 1 : progressInCycle / 108;
  };

  const getTodayProgressDisplay = (count) => {
    if (count === 0) return 0;
    const progressInCycle = count % 108;
    return progressInCycle === 0 ? 108 : progressInCycle;
  };

  const saveToStorage = useCallback((count) => {
    const todayStr = getTodayDate();
    const savedData = localStorage.getItem('naamJapData');
    let data;
    
    if (savedData) {
      try {
        data = JSON.parse(savedData);
      } catch (e) {
        console.log(e)
        data = { today: todayStr, yesterday: "", todayCount: 0, yesterdayCount: 0 };
      }
    } else {
      data = { today: todayStr, yesterday: "", todayCount: 0, yesterdayCount: 0 };
    }

    if (data.today !== todayStr) {
      data.yesterday = data.today;
      data.yesterdayCount = data.todayCount;
      data.today = todayStr;
      data.todayCount = 0;
    }
    
    data.todayCount = count;
    localStorage.setItem('naamJapData', JSON.stringify(data));
  }, []);

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
        console.error("Storage Error", e);
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

    if (navigator.vibrate) {
      newCount % 108 === 0 ? navigator.vibrate([100, 50, 100]) : navigator.vibrate(40);
    }
  };

  const resetCount = () => {
    if (window.confirm("आज की गिनती शून्य करें?")) {
      setTodayCount(0);
      setLiquidHeight('0%');
      saveToStorage(0);
    }
  };

  const todayMalas = Math.floor(todayCount / 108);
  const todayProgressInMala = getTodayProgressDisplay(todayCount);
  const yesterdayMalas = Math.floor(yesterdayCount / 108);

  return (

    <>
    <Topbar />
    
    
    <div className="w-screen bg-gradient-to-b from-[#FFF5E4] via-[#FFEAD1] to-[#FBD2A8] flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Stats Cards + Reset Button on Top Center */}
      <div className="px-3 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 flex flex-col items-center flex-shrink-0">
        {/* Reset Button - दोनों boxes के top-center में */}
        <div className="mb-4">
          <button 
            onClick={resetCount} 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center active:rotate-180 transition-all duration-300 border-2 border-orange-200 hover:shadow-2xl hover:bg-white hover:scale-105 z-10"
          >
            🔄
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 sm:p-5 text-center border border-white shadow-sm hover:shadow-md">
            <p className="text-xs sm:text-[11px] text-gray-400 font-bold uppercase mb-2">कल</p>
            <p className="text-xl sm:text-2xl font-black text-orange-600 leading-tight">
              {yesterdayMalas} <span className="text-xs font-medium">माला</span>
            </p>
            <p className="text-xs sm:text-[10px] text-orange-800/50 font-bold mt-1">
              {yesterdayCount.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 text-center shadow-xl border border-orange-100 hover:shadow-2xl">
            <p className="text-xs sm:text-[11px] text-orange-400 font-bold uppercase mb-2">आज</p>
            <p className="text-xl sm:text-2xl font-black text-orange-700 leading-tight">
              {todayMalas} <span className="text-xs font-medium">माला</span>
            </p>
            <p className="text-xs sm:text-[10px] text-orange-900/60 font-bold mt-1">
              {todayProgressInMala}/108
            </p>
          </div>
        </div>
      </div>

      {/* Main Button */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 sm:pb-12">
        <button
          onClick={handleJap}
          className="liquid-btn relative w-full h-full max-w-[320px] max-h-[320px] rounded-full bg-white border-8 sm:border-[14px] border-orange-50 shadow-2xl overflow-hidden hover:shadow-3xl active:scale-95 transition-all duration-300"
          style={{ 
            width: 'min(85vw, 320px)', 
            height: 'min(85vw, 320px)',
            aspectRatio: '1/1'
          }}
        >
          <div 
            className="liquid-fill absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-400 via-orange-300 to-orange-200 shadow-lg transition-all duration-300 ease-out"
            style={{ height: liquidHeight }}
          />
          
          <div 
            className="wave-overlay absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(251,146,60,0.4)_25%,rgba(245,158,11,0.6)_50%,rgba(251,146,60,0.4)_75%,transparent_100%)] animate-wave-slow"
          />
          
          <div className="relative z-10 flex items-center justify-center h-full p-4 sm:p-6">
            <span className="text-5xl sm:text-[75px] lg:text-[85px] font-black text-gray-800 tabular-nums leading-none tracking-tight drop-shadow-2xl">
              {todayCount.toLocaleString()}
            </span>
          </div>
        </button>
      </div>
      
      <style jsx>{`
        @keyframes wave-slow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        .animate-wave-slow {
          animation: wave-slow 4s linear infinite;
          background-size: 200% 100%;
        }
        .liquid-fill {
          animation: liquid-rise 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes liquid-rise {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
    </>
  );
};

export default NaamJap;
