"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Users,
  Wallet,
  Target,
  BrainCircuit,
  Award,
  ArrowRight,
  Sparkles,
  Shield,
  Swords,
  Gem,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prevWeekInfo: {
    id: string;
    label: string;
    range: string;
  } | null;
  prevWeekData: any;
  prevPrevWeekData?: any;
}

export const WeeklySummaryModal = ({
  isOpen,
  onClose,
  prevWeekInfo,
  prevWeekData,
  prevPrevWeekData
}: WeeklySummaryModalProps) => {
  
  // 1. คำนวณคะแนนรวมและอันดับ (Max 28 จาก 4 เควสระบบหลัก)
  const stats = useMemo(() => {
    if (!prevWeekData) return { totalScore: 0, wheel: 0, disc: 0, money: 0, challenge: 0, focusHours: 0 };
    return {
      totalScore: (prevWeekData.wheel || 0) + (prevWeekData.disc || 0) + (prevWeekData.money || 0) + (prevWeekData.challenge || 0),
      wheel: prevWeekData.wheel || 0,
      disc: prevWeekData.disc || 0,
      money: prevWeekData.money || 0,
      challenge: prevWeekData.challenge || 0,
      focusHours: Math.floor((prevWeekData.focusMinutes || 0) / 60)
    };
  }, [prevWeekData]);

  // คำนวณความแตกต่างของคะแนนเมื่อมีข้อมูลของสัปดาห์ก่อนหน้า (Week 2 เป็นต้นไป)
  const scoreDiffInfo = useMemo(() => {
    if (!prevPrevWeekData) return null;
    const prevPrevTotal = (prevPrevWeekData.wheel || 0) + (prevPrevWeekData.disc || 0) + (prevPrevWeekData.money || 0) + (prevPrevWeekData.challenge || 0);
    const diff = stats.totalScore - prevPrevTotal;
    
    let icon = <Minus className="w-3.5 h-3.5 text-slate-400" />;
    let text = "เท่าเดิม";
    let color = "text-slate-400";
    let bg = "bg-slate-900/60 border-slate-800";
    
    if (diff > 0) {
      icon = <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      text = `ดีขึ้น +${diff} คะแนน`;
      color = "text-emerald-400";
      bg = "bg-slate-900 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
    } else if (diff < 0) {
      icon = <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
      text = `ลดลง ${Math.abs(diff)} คะแนน`;
      color = "text-red-400";
      bg = "bg-slate-900 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.05)]";
    }
    
    return { diff, text, color, bg, icon };
  }, [prevPrevWeekData, stats.totalScore]);

  const rankInfo = useMemo(() => {
    const score = stats.totalScore;
    if (score <= 7) {
      return {
        name: "Survivor",
        icon: <Shield className="w-10 h-10 text-slate-400" strokeWidth={1.5} />,
        textColor: "from-slate-500 via-slate-400 to-slate-600 drop-shadow-[0_0_8px_rgba(148,163,184,0.15)]",
        glowColor: "from-slate-900 to-slate-950 border-slate-800 shadow-[0_0_20px_rgba(148,163,184,0.02)]",
        desc: "สัปดาห์ที่แล้วคุณเน้นประคองตัวให้รอดพ้นอุปสรรคชีวิต"
      };
    }
    if (score <= 14) {
      return {
        name: "Warrior",
        icon: <Swords className="w-10 h-10 text-amber-700" strokeWidth={1.5} />,
        textColor: "from-amber-700 via-orange-600 to-amber-900 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]",
        glowColor: "from-slate-900 to-slate-950 border-amber-900/30 shadow-[0_0_30px_rgba(245,158,11,0.06)]",
        desc: "คุณเริ่มบุกเอาชนะและจัดการระบบชีวิตได้ดีขึ้นมาก"
      };
    }
    if (score <= 22) {
      return {
        name: "Elite",
        icon: <Gem className="w-10 h-10 text-slate-200" strokeWidth={1.5} />,
        textColor: "from-slate-300 via-white to-zinc-400 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]",
        glowColor: "from-slate-900 to-slate-950 border-slate-800 shadow-[0_0_30px_rgba(255,255,255,0.08)]",
        desc: "ชีวิตของคุณมีความสมดุลและรักษาวินัยได้สูงมาก"
      };
    }
    return {
      name: "Legend",
      icon: <Crown className="w-10 h-10 text-yellow-400" strokeWidth={1.5} />,
      textColor: "from-yellow-400 via-amber-200 to-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]",
      glowColor: "from-slate-900 to-slate-950 border-yellow-500/20 shadow-[0_0_35px_rgba(234,179,8,0.15)]",
      desc: "คุณคือผู้จารึกตำนานแห่งความสม่ำเสมอและวินัยขั้นสุด!"
    };
  }, [stats.totalScore]);

  // 2. หาสิ่งที่ควรแนะนำให้ปรับปรุง (เฉพาะ 4 หมวดหลักเควสระบบที่มีคะแนนน้อยที่สุด)
  const growthAdvice = useMemo(() => {
    if (!prevWeekData) return null;

    const isAllPerfect = stats.wheel === 7 && stats.disc === 7 && stats.money === 7 && stats.challenge === 7;
    if (isAllPerfect) {
      return {
        key: "perfect",
        label: "Perfect Week",
        score: 7,
        icon: <Crown size={18} className="text-yellow-400" />,
        color: "text-yellow-400",
        borderColor: "border-yellow-500/20",
        bgColor: "bg-yellow-500/5",
        advice: "สุดยอดความสมบูรณ์แบบ! คุณทำเควสเสร็จครบทุกหมวดหมู่แล้วในสัปดาห์ที่ผ่านมา สัปดาห์นี้รักษามาตรฐานความเป็นเลิศและวินัยที่ยอดเยี่ยมนี้ต่อไปนะ! 🌟"
      };
    }

    const categories = [
      {
        key: "wheel",
        label: "Wheel of Life (สมดุลชีวิต)",
        score: stats.wheel,
        icon: <PieChart size={18} className="text-red-400" />,
        color: "text-red-400",
        borderColor: "border-red-500/20",
        bgColor: "bg-red-500/5",
        advice: "สัปดาห์นี้มาตั้งใจทำเควสหมวด Wheel of Life กันนะ"
      },
      {
        key: "disc",
        label: "Habit (พฤติกรรม)",
        score: stats.disc,
        icon: <Users size={18} className="text-blue-400" />,
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
        advice: "สัปดาห์นี้มาตั้งใจทำเควสหมวด Habit กันนะ"
      },
      {
        key: "money",
        label: "Money (การเงิน)",
        score: stats.money,
        icon: <Wallet size={18} className="text-amber-400" />,
        color: "text-amber-400",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/5",
        advice: "สัปดาห์นี้มาตั้งใจทำเควสหมวด Money กันนะ"
      },
      {
        key: "challenge",
        label: "Challenge (ความท้าทาย)",
        score: stats.challenge,
        icon: <Target size={18} className="text-purple-400" />,
        color: "text-purple-400",
        borderColor: "border-purple-500/20",
        bgColor: "bg-purple-500/5",
        advice: "สัปดาห์นี้มาตั้งใจทำเควสหมวด Challenge กันนะ"
      }
    ];

    const sorted = [...categories].sort((a, b) => a.score - b.score);
    return sorted[0];
  }, [prevWeekData, stats]);

  if (!isOpen || !prevWeekInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100005] flex items-center justify-center p-4">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Card (Diamond Holo Theme) */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md bg-slate-950 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden z-10 flex flex-col p-5 sm:p-6 max-h-[85vh]"
        >
          {/* Subtle Grid / Linear Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.015)_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

          {/* Diamond Holo Background Orbs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Scrollable Container to prevent overflow on mobile */}
          <div className="overflow-y-auto flex-1 pr-1 -mr-1 space-y-5 mb-4 scrollbar-thin select-none relative z-10">
            {/* Header */}
            <div className="text-center mt-1">
              <span className="text-[10px] font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-[0.25em] block mb-0.5 animate-pulse">
                Weekly Wrap-up
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                บทสรุป{prevWeekInfo.label}
              </h2>
              <p className="text-[11px] text-cyan-400/80 font-bold tracking-wide">
                ช่วงวันที่ {prevWeekInfo.range}
              </p>
            </div>

            {/* Diamond Holo Rank Showcase */}
            <div className={`flex flex-col items-center justify-center py-6 px-6 rounded-[2.2rem] bg-gradient-to-b ${rankInfo.glowColor} border backdrop-blur-md relative z-10 overflow-hidden`}>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2.5">
                {/* Multiple layer glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 to-indigo-400/30 blur-xl rounded-full animate-pulse" />
                {/* Thin spinning borders */}
                <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-1 border border-dashed border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                
                <div className="filter drop-shadow-[0_8px_16px_rgba(6,182,212,0.3)] select-none z-10 flex items-center justify-center">
                  {rankInfo.icon}
                </div>
              </div>
              
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                สัปดาห์นี้คุณได้อันดับ
              </span>
              <span className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${rankInfo.textColor} bg-clip-text text-transparent tracking-wide uppercase`}>
                {rankInfo.name}
              </span>
              <p className="text-[11px] font-bold text-slate-300 text-center mt-2 max-w-[280px] leading-relaxed">
                {rankInfo.desc}
              </p>

              {/* Comparison badge */}
              {scoreDiffInfo && (
                <div className={`mt-4 px-4 py-2 rounded-full border text-[10px] font-bold text-slate-200 flex items-center gap-2 ${scoreDiffInfo.bg}`}>
                  <span className="text-slate-400">เทียบกับสัปดาห์ก่อนหน้า:</span>
                  <div className="flex items-center gap-1.5">
                    {scoreDiffInfo.icon}
                    <span className={`${scoreDiffInfo.color} font-black`}>
                      {scoreDiffInfo.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Scores Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block px-1">
                คะแนนสะสมรายหมวด (เควสสำเร็จ)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Wheel of Life", val: stats.wheel, color: "text-red-400", gradColor: "from-red-500 to-rose-400", glow: "shadow-[0_0_8px_rgba(239,68,68,0.35)]" },
                  { label: "Habit", val: stats.disc, color: "text-blue-400", gradColor: "from-blue-500 to-cyan-400", glow: "shadow-[0_0_8px_rgba(59,130,246,0.35)]" },
                  { label: "Money", val: stats.money, color: "text-amber-400", gradColor: "from-amber-500 to-yellow-400", glow: "shadow-[0_0_8px_rgba(245,158,11,0.35)]" },
                  { label: "Challenge", val: stats.challenge, color: "text-purple-400", gradColor: "from-purple-500 to-fuchsia-400", glow: "shadow-[0_0_8px_rgba(168,85,247,0.35)]" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3.5 rounded-[1.5rem] bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-[11px] font-bold text-slate-300 truncate">{item.label}</span>
                      <span className={`text-[11px] font-black shrink-0 ${item.color} ml-1`}>{item.val}/7</span>
                    </div>
                    {/* Mini progress bar container */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-[0.5px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.val / 7) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className={`h-full bg-gradient-to-r ${item.gradColor} rounded-full ${item.glow}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total score & Focus line */}
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-[1.2rem] bg-slate-900/60 border border-slate-800 justify-center shadow-sm">
                  <BrainCircuit size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-bold">เวลาจดจ่อ:</span>
                  <span className="text-xs font-black text-emerald-400">{stats.focusHours} ชม.</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-[1.2rem] bg-slate-900/60 border border-slate-800 justify-center shadow-sm">
                  <Award size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-bold">คะแนนรวม:</span>
                  <span className="text-xs font-black text-cyan-400">{stats.totalScore} / 28</span>
                </div>
              </div>
            </div>

            {/* ยอดเงินออมมีสติประจำสัปดาห์ */}
            {prevWeekData?.weeklySavings !== undefined && prevWeekData.weeklySavings > 0 && (
              <div className="flex items-center justify-between p-4 rounded-[1.8rem] bg-amber-500/10 border border-amber-500/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="flex items-center gap-3 pl-1.5">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                    <Wallet size={16} className="text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">ยอดเงินออมมีสติสัปดาห์ที่แล้ว</span>
                </div>
                <span className="text-lg font-black text-white">฿{prevWeekData.weeklySavings.toLocaleString()}</span>
              </div>
            )}

            {/* Growth Recommendation Box (Diamond themed) */}
            {growthAdvice && (
              <div className={`p-4 rounded-[2rem] border border-slate-800 bg-slate-900/50 relative overflow-hidden shadow-sm`}>
                {/* Subtle side accent line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${
                  growthAdvice.key === 'wheel' ? 'from-red-500 to-rose-400' : 
                  growthAdvice.key === 'disc' ? 'from-blue-500 to-cyan-400' : 
                  growthAdvice.key === 'money' ? 'from-amber-500 to-yellow-400' : 
                  growthAdvice.key === 'perfect' ? 'from-yellow-400 via-amber-400 to-yellow-500' :
                  'from-purple-500 to-fuchsia-400'
                }`} />
                
                <div className="flex items-center gap-2 mb-2 pl-1.5">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                    {growthAdvice.icon}
                  </div>
                  <span className={`text-[10px] font-black ${growthAdvice.color} uppercase tracking-wider flex items-center gap-1`}>
                    <Sparkles size={11} className="animate-pulse" /> {growthAdvice.key === 'perfect' ? 'บันทึกความสำเร็จสัปดาห์นี้' : 'เควสท์แนะนำประจำสัปดาห์นี้'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-200 leading-relaxed pl-1.5">
                  {growthAdvice.advice}
                </p>
              </div>
            )}
          </div>

          {/* Action Button (Diamond Glowing Gradient) */}
          <div className="shrink-0 pt-2 border-t border-white/5 relative z-10">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-[1.5rem] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_10px_20px_rgba(6,182,212,0.25)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              เริ่มลุยสัปดาห์ใหม่กันเลย
              <ArrowRight size={14} className="shrink-0" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
