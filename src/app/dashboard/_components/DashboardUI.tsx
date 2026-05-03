import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Users, Wallet, BookOpen, Target, Sparkles, CheckCircle2, Circle } from "lucide-react";

// --- 🌟 Floating Premium XP Component ---
interface FloatingPremiumXPProps {
  isScrolled: boolean;
  showFloatingXP: boolean;
  setShowFloatingXP: (val: boolean) => void;
  currentLevel: number;
  currentLevelXP: number;
}

export const FloatingPremiumXP = ({
  isScrolled,
  showFloatingXP,
  setShowFloatingXP,
  currentLevel,
  currentLevelXP
}: FloatingPremiumXPProps) => {
  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
          className="fixed top-20 right-4 md:right-8 z-[90] pointer-events-auto"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFloatingXP(!showFloatingXP);
            }}
            className="relative flex flex-col items-center justify-center w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full cursor-pointer group hover:scale-105 active:scale-95 transition-transform duration-300 focus:outline-none"
          >

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
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
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
            <div className="relative z-10 flex flex-col items-center justify-center pt-0.5 drop-shadow-sm pointer-events-none">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-[2px]">LV</span>
              <span className="text-[18px] md:text-[22px] font-black bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 bg-clip-text text-transparent leading-none">{currentLevel}</span>
            </div>

            {/* Tooltip on Tap/Hover (Premium Style) */}
            <div
              className={`absolute top-[calc(100%+12px)] right-[-8px] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[11px] font-bold transition-all duration-300 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.2)] pointer-events-none border border-white/10 origin-top-right z-50
              ${showFloatingXP ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span>อีก <span className="text-orange-400 font-black">{100 - currentLevelXP}</span> XP อัปเลเวล!</span>
              </div>
              {/* สามเหลี่ยมชี้ขึ้น */}
              <div className="absolute -top-[5px] right-[30px] md:right-[34px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-900/90" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- 🎮 Quest Item Component ---
interface Quest {
  id: number;
  type: string;
  title: string;
  xp: number;
}

interface QuestItemProps {
  quest: Quest;
  isDone: boolean;
  toggleQuest: (id: number, xp: number) => void;
  setShowWheelRulesModal: (show: boolean) => void;
}

export const QuestItem = ({ quest, isDone, toggleQuest, setShowWheelRulesModal }: QuestItemProps) => {
  const isNotice = quest.xp === 0; // 🚩 เช็กว่าเป็นประกาศแจ้งเตือนหรือไม่

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'WHEEL': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: <PieChart size={18} /> };
      case 'DISC': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Users size={18} /> };
      case 'MONEY': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Wallet size={18} /> };
      case 'LIBRARY': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <BookOpen size={18} /> };
      case 'CHALLENGE': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: <Target size={18} /> };
      default: return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <Sparkles size={18} /> };
    }
  };
  const styles = getTypeStyles(quest.type);

  return (
    <motion.div
      key={quest.id}
      whileHover={(!isDone && !isNotice) ? { y: -3, scale: 1.01 } : {}}
      className={`group/card relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-[1.8rem] border-2 transition-all duration-300 
        ${isDone ? 'bg-green-50 border-green-200 shadow-sm' :
          isNotice
            ? 'bg-amber-50/40 border-amber-100 cursor-default opacity-95'
            : 'bg-white border-slate-50 hover:border-orange-200 cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-lg'}
      `}
      onClick={() => !isNotice && toggleQuest(quest.id, quest.xp)}
    >
      <div className="shrink-0 relative">
        {isDone ? (
          <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg shadow-green-200">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>
        ) : isNotice ? (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
            <Sparkles size={20} className="fill-current animate-pulse" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white group-hover/card:border-orange-400 transition-colors">
            <Circle size={18} className="text-slate-100 group-hover/card:text-orange-100" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider 
            ${isDone ? 'bg-green-100 text-green-600' : isNotice ? 'bg-amber-500 text-white shadow-sm' : `${styles.bg} ${styles.text}`}`}>
            {isNotice ? 'Action Required' : quest.type}
          </span>

          {quest.title.includes('|') && !isNotice && (
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-slate-300' : 'text-slate-400'}`}>
              {quest.title.split('|')[0].trim()}
            </span>
          )}
        </div>

        <p className={`text-[13px] sm:text-[15px] font-bold leading-snug 
          ${isDone ? 'line-through text-slate-400' : isNotice || quest.title.includes('สรุปผล') ? 'text-amber-900' : 'text-slate-700'}`}>
          {quest.title.includes('|') ? quest.title.split('|')[1].trim() : quest.title}
        </p>
        {quest.id === 1 && !quest.title.includes('สรุปผล') && (
          <div
            className="flex items-center gap-1.5 mt-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity w-fit bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50"
            onClick={(e) => { e.stopPropagation(); setShowWheelRulesModal(true); }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold text-[9px]">i</div>
            <span className="text-[10px] text-amber-800 font-bold underline decoration-amber-300 decoration-dashed underline-offset-2">กติกาแผน 7 วัน & โบนัส XP</span>
          </div>
        )}
      </div>

      <div className="shrink-0 text-right flex flex-col items-end gap-2">
        {isNotice || quest.title.includes('สรุปผล') ? (
          <span className="text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 uppercase tracking-widest cursor-pointer">
            {quest.title.includes('สรุปผล') ? 'Claim Bonus' : (quest.title.includes('พักกายพักใจ') || quest.title.includes('พักผ่อน')) ? 'พักผ่อน 💤' : 'INFO'}
          </span>
        ) : (
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm transition-all ${isDone ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-orange-100 text-orange-500 group-hover/card:bg-gradient-to-r group-hover/card:from-orange-400 group-hover/card:to-red-500 group-hover/card:text-white group-hover/card:border-transparent group-hover/card:shadow-[0_5px_15px_rgba(249,115,22,0.3)]'}`}>
              +{quest.xp} XP
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
