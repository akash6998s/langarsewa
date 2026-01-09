import React, { useState, useEffect } from "react";

const NaamJap = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const autoSyncData = () => {
    const todayStr = getTodayDate();
    const savedData = localStorage.getItem('naamJapData');
    
    let data = { 
      today: todayStr, 
      yesterday: "", 
      todayCount: 0, 
      yesterdayCount: 0 
    };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        data = { ...data, ...parsed };
      } catch (e) { console.error("Storage Error", e); }
    }

    if (data.today !== todayStr) {
      data.yesterday = data.today;
      data.yesterdayCount = data.todayCount;
      data.today = todayStr;
      data.todayCount = 0;
      localStorage.setItem('naamJapData', JSON.stringify(data));
      setTodayCount(0);
      setYesterdayCount(data.yesterdayCount);
    } else {
      setTodayCount(data.todayCount);
      setYesterdayCount(data.yesterdayCount);
    }
    return data;
  };

  useEffect(() => {
    autoSyncData();
    const interval = setInterval(autoSyncData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleJap = () => {
    const data = autoSyncData();
    const updatedCount = data.todayCount + 1;
    data.todayCount = updatedCount;
    localStorage.setItem('naamJapData', JSON.stringify(data));
    setTodayCount(updatedCount);

    if (navigator.vibrate) {
      updatedCount % 108 === 0 ? navigator.vibrate([100, 50, 100]) : navigator.vibrate(40);
    }
  };

  const resetCount = () => {
    if (window.confirm("आज की गिनती शून्य करें?")) {
      const savedData = JSON.parse(localStorage.getItem('naamJapData') || "{}");
      savedData.todayCount = 0;
      localStorage.setItem('naamJapData', JSON.stringify(savedData));
      setTodayCount(0);
    }
  };

  const todayMalas = Math.floor(todayCount / 108);
  const todayProgress = todayCount % 108;
  const yesterdayMalas = Math.floor(yesterdayCount / 108);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#FFF5E4] via-[#FFEAD1] to-[#FBD2A8] flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Safe Area */}
      <div className="pt-4 sm:pt-6 pb-2 sm:pb-3 px-3 sm:px-4 flex justify-between items-center shrink-0">
        <div />
        <button 
          onClick={resetCount} 
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center active:rotate-180 transition-all duration-300 border hover:shadow-lg"
        >
          🔄
        </button>
      </div>

      {/* Responsive Stats */}
      <div className="px-3 sm:px-6 pb-4 sm:pb-6 flex items-center justify-center flex-shrink-0">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm">
          {/* Yesterday */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 sm:p-5 text-center border border-white shadow-sm hover:shadow-md">
            <p className="text-xs sm:text-[11px] text-gray-400 font-bold uppercase mb-2">कल</p>
            <p className="text-xl sm:text-2xl font-black text-orange-600 leading-tight">
              {yesterdayMalas} <span className="text-xs font-medium">माला</span>
            </p>
            <p className="text-xs sm:text-[10px] text-orange-800/50 font-bold mt-1">{yesterdayCount.toLocaleString()}</p>
          </div>
          
          {/* Today */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 text-center shadow-xl border border-orange-100 hover:shadow-2xl">
            <p className="text-xs sm:text-[11px] text-orange-400 font-bold uppercase mb-2">आज</p>
            <p className="text-xl sm:text-2xl font-black text-orange-700 leading-tight">
              {todayMalas} <span className="text-xs font-medium">माला</span>
            </p>
            <p className="text-xs sm:text-[10px] text-orange-900/60 font-bold mt-1">{todayCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Counter - Adaptive */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 sm:pb-12">
        <button
          onClick={handleJap}
          className="relative w-full h-full max-w-[320px] max-h-[320px] rounded-full bg-white border-8 sm:border-[14px] border-orange-50 shadow-2xl sm:shadow-[0_30px_70px_-10px_rgba(234,88,12,0.3)] active:scale-95 transition-all duration-300 overflow-hidden hover:shadow-3xl"
          style={{ 
            width: 'min(85vw, 320px)', 
            height: 'min(85vw, 320px)',
            aspectRatio: '1/1'
          }}
        >
          <div 
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-200/90 via-orange-100/90 transition-all duration-700 ease-out hover:from-orange-300/90" 
            style={{ height: `${(todayProgress / 108) * 100}%` }} 
          />
          <div className="relative z-10 flex items-center justify-center h-full p-4 sm:p-6">
            <span className="text-5xl sm:text-[75px] lg:text-[85px] font-black text-gray-800 tabular-nums leading-none tracking-tight">
              {todayCount.toLocaleString()}
            </span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 sm:pb-6 text-center shrink-0">
        <p className="text-sm sm:text-base italic text-orange-900/40 font-medium">"हर स्पर्श एक स्मरण है।"</p>
      </div>
      
    </div>
  );
};

export default NaamJap;
