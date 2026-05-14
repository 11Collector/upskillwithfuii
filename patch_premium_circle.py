import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_pill = """      {/* 🚀 Floating Minimal Circular XP */}
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
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
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

new_pill = """      {/* 🚀 Floating Premium Circular XP */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            className="fixed top-20 right-4 md:right-8 z-[90] pointer-events-auto"
          >
            <div className="relative flex flex-col items-center justify-center w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full cursor-pointer group hover:scale-105 active:scale-95 transition-transform duration-300">
              
              {/* Premium Glass Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/80" />
              <div className="absolute inset-1 bg-gradient-to-tl from-slate-100/50 to-transparent rounded-full pointer-events-none" />
              
              {/* SVG Circular Progress */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Track */}
                <path className="text-slate-200/60" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                
                {/* Progress Bar */}
                <path 
                  className="transition-all duration-1000 ease-out" 
                  strokeDasharray={`${currentLevelXP}, 100`} 
                  strokeLinecap="round" 
                  strokeWidth="2.5" 
                  stroke="url(#xp-gradient)" 
                  fill="none" 
                  filter="url(#glow)"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              
              {/* Center Content */}
              <div className="relative z-10 flex flex-col items-center justify-center pt-0.5 drop-shadow-sm">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-[2px]">LV</span>
                <span className="text-[18px] md:text-[22px] font-black bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 bg-clip-text text-transparent leading-none">{currentLevel}</span>
              </div>
              
              {/* Tooltip on Tap/Hover (Premium Style) */}
              <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.2)] pointer-events-none border border-white/10 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span><span className="text-orange-400 font-black">{totalXP.toLocaleString()}</span> XP</span>
                </div>
                <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-900/90" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>"""

content = content.replace(old_pill, new_pill)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
