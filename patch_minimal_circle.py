import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Update the Floating XP Pill to a Minimal Circle
old_pill = """      {/* 🚀 Floating XP Pill */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-[5rem] md:top-[5.5rem] left-1/2 -translate-x-1/2 z-[90] pointer-events-none w-[90%] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_10px_20px_rgba(0,0,0,0.1)] px-5 py-2.5 rounded-full flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-black text-sm shadow-inner shadow-white/20 shrink-0">
                  {currentLevel}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lv.{currentLevel}</span>
                    <span className="text-[11px] font-black text-orange-500">{totalXP.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${currentLevelXP}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>"""

new_pill = """      {/* 🚀 Floating Minimal Circular XP */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            className="fixed top-20 right-4 md:right-8 z-[90] pointer-events-auto"
          >
            <div className="relative flex flex-col items-center justify-center w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-50 cursor-pointer group hover:scale-105 active:scale-95 transition-transform">
              {/* SVG Circular Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-orange-500 transition-all duration-1000 ease-out" strokeDasharray={`${currentLevelXP}, 100`} strokeLinecap="round" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ filter: "drop-shadow(0 2px 4px rgba(249,115,22,0.4))" }} />
              </svg>
              
              {/* Center Content */}
              <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-[2px]">LV</span>
                <span className="text-[16px] md:text-[20px] font-black bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent leading-none">{currentLevel}</span>
              </div>
              
              {/* Tooltip on Tap/Hover */}
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl pointer-events-none border border-slate-700 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-orange-400">{totalXP.toLocaleString()}</span> XP
                <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-700" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>"""

content = content.replace(old_pill, new_pill)

# 2. Fix the Modal Z-Index so it covers BottomNavigation (which has z-[10000])
old_modal_z = 'className="fixed inset-0 z-[999] flex items-center justify-center p-4"'
new_modal_z = 'className="fixed inset-0 z-[99999] flex items-center justify-center p-4"'
content = content.replace(old_modal_z, new_modal_z)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
