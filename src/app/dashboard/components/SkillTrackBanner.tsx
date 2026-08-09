"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Award, CheckCircle2, RotateCcw, X, BookOpen, Target, ShieldCheck, Wallet, Users, Brain, Briefcase, HeartPulse, Sun, HeartHandshake, Compass, Clock, ArrowRight } from "lucide-react";
import { SKILL_TRACKS, SkillTrack } from "@/data/skillTracks";

// Helper function to get clean Lucide vector icon per track
const getTrackIcon = (trackId: string, size = 20) => {
  switch (trackId) {
    case 'money': return <Wallet size={size} className="text-emerald-300" />;
    case 'relationship': return <Users size={size} className="text-amber-300" />;
    case 'mindset': return <Brain size={size} className="text-purple-300" />;
    case 'career': return <Briefcase size={size} className="text-blue-300" />;
    case 'health': return <HeartPulse size={size} className="text-rose-300" />;
    case 'innerpeace': return <Sun size={size} className="text-teal-300" />;
    case 'contribution': return <HeartHandshake size={size} className="text-pink-300" />;
    case 'lifedesign': return <Compass size={size} className="text-indigo-300" />;
    default: return <BookOpen size={size} className="text-amber-300" />;
  }
};

// Helper function to get subject theme styles per track matching the official design guide
const getTrackThemeStyles = (trackId: string) => {
  switch (trackId) {
    case 'money':
      return {
        cardBg: "bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/10",
        activeCardBg: "bg-emerald-500/20 border-emerald-400 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/50",
        avatarBorder: "border-emerald-400/70 group-hover:border-emerald-300",
        mentorName: "text-emerald-300",
        btnDefault: "bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-400 group-hover:text-slate-950",
        btnActive: "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30",
        btnQueued: "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-teal-500/30",
      };
    case 'career':
      return {
        cardBg: "bg-blue-950/40 border-blue-500/40 hover:border-blue-400 hover:shadow-blue-500/10",
        activeCardBg: "bg-blue-500/20 border-blue-400 shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/50",
        avatarBorder: "border-blue-400/70 group-hover:border-blue-300",
        mentorName: "text-blue-300",
        btnDefault: "bg-blue-500/20 text-blue-300 group-hover:bg-blue-400 group-hover:text-slate-950",
        btnActive: "bg-blue-400 text-slate-950 shadow-md shadow-blue-400/30",
        btnQueued: "bg-gradient-to-r from-blue-400 to-indigo-400 text-slate-950 shadow-md shadow-indigo-500/30",
      };
    case 'health':
      return {
        cardBg: "bg-rose-950/40 border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/10",
        activeCardBg: "bg-rose-500/20 border-rose-400 shadow-xl shadow-rose-500/30 ring-2 ring-rose-400/50",
        avatarBorder: "border-rose-400/70 group-hover:border-rose-300",
        mentorName: "text-rose-300",
        btnDefault: "bg-rose-500/20 text-rose-300 group-hover:bg-rose-400 group-hover:text-slate-950",
        btnActive: "bg-rose-400 text-slate-950 shadow-md shadow-rose-400/30",
        btnQueued: "bg-gradient-to-r from-rose-400 to-red-400 text-slate-950 shadow-md shadow-red-500/30",
      };
    case 'relationship':
      return {
        cardBg: "bg-amber-950/40 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10",
        activeCardBg: "bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50",
        avatarBorder: "border-amber-400/70 group-hover:border-amber-300",
        mentorName: "text-amber-300",
        btnDefault: "bg-amber-500/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950",
        btnActive: "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30",
        btnQueued: "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-500/30",
      };
    case 'lifedesign':
      return {
        cardBg: "bg-orange-950/40 border-orange-500/40 hover:border-orange-400 hover:shadow-orange-500/10",
        activeCardBg: "bg-orange-500/20 border-orange-400 shadow-xl shadow-orange-500/30 ring-2 ring-orange-400/50",
        avatarBorder: "border-orange-400/70 group-hover:border-orange-300",
        mentorName: "text-orange-300",
        btnDefault: "bg-orange-500/20 text-orange-300 group-hover:bg-orange-400 group-hover:text-slate-950",
        btnActive: "bg-orange-400 text-slate-950 shadow-md shadow-orange-400/30",
        btnQueued: "bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30",
      };
    case 'mindset':
      return {
        cardBg: "bg-purple-950/40 border-purple-500/40 hover:border-purple-400 hover:shadow-purple-500/10",
        activeCardBg: "bg-purple-500/20 border-purple-400 shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50",
        avatarBorder: "border-purple-400/70 group-hover:border-purple-300",
        mentorName: "text-purple-300",
        btnDefault: "bg-purple-500/20 text-purple-300 group-hover:bg-purple-400 group-hover:text-slate-950",
        btnActive: "bg-purple-400 text-slate-950 shadow-md shadow-purple-400/30",
        btnQueued: "bg-gradient-to-r from-purple-400 to-indigo-400 text-slate-950 shadow-md shadow-indigo-500/30",
      };
    case 'innerpeace':
      return {
        cardBg: "bg-teal-950/40 border-teal-500/40 hover:border-teal-400 hover:shadow-teal-500/10",
        activeCardBg: "bg-teal-500/20 border-teal-400 shadow-xl shadow-teal-500/30 ring-2 ring-teal-400/50",
        avatarBorder: "border-teal-400/70 group-hover:border-teal-300",
        mentorName: "text-teal-300",
        btnDefault: "bg-teal-500/20 text-teal-300 group-hover:bg-teal-400 group-hover:text-slate-950",
        btnActive: "bg-teal-400 text-slate-950 shadow-md shadow-teal-400/30",
        btnQueued: "bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30",
      };
    case 'contribution':
      return {
        cardBg: "bg-pink-950/40 border-pink-500/40 hover:border-pink-400 hover:shadow-pink-500/10",
        activeCardBg: "bg-pink-500/20 border-pink-400 shadow-xl shadow-pink-500/30 ring-2 ring-pink-400/50",
        avatarBorder: "border-pink-400/70 group-hover:border-pink-300",
        mentorName: "text-pink-300",
        btnDefault: "bg-pink-500/20 text-pink-300 group-hover:bg-pink-400 group-hover:text-slate-950",
        btnActive: "bg-pink-400 text-slate-950 shadow-md shadow-pink-400/30",
        btnQueued: "bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 shadow-md shadow-rose-500/30",
      };
    default:
      return {
        cardBg: "bg-slate-950/80 border-white/10 hover:border-amber-400/60 hover:shadow-amber-500/10",
        activeCardBg: "bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50",
        avatarBorder: "border-amber-400/70 group-hover:border-amber-300",
        mentorName: "text-amber-300",
        btnDefault: "bg-white/10 text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-950",
        btnActive: "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30",
        btnQueued: "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-500/30",
      };
  }
};

interface SkillTrackBannerProps {
  activeTrackId: string | null;
  currentDay: number;
  completedDays: number[];
  lowestWheelCategory?: string;
  userGoal?: string;
  onSelectTrack: (trackId: string, keepWheelProgress?: boolean) => void;
  onResetTrack?: () => void;
  onRestartTrack?: () => void;
  onOpenInfo?: () => void;
  onAdvanceDevDay?: () => void;
  nextTrackId?: string | null;
  isBadgeUnlocked?: boolean;
  isQueuedForTomorrow?: boolean;
}

export default function SkillTrackBanner({
  activeTrackId,
  currentDay,
  completedDays,
  lowestWheelCategory,
  userGoal,
  onSelectTrack,
  onResetTrack,
  onRestartTrack,
  onOpenInfo,
  onAdvanceDevDay,
  nextTrackId,
  isBadgeUnlocked,
  isQueuedForTomorrow
}: SkillTrackBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackForChoice, setSelectedTrackForChoice] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const activeTrack = activeTrackId ? SKILL_TRACKS[activeTrackId] : null;

  useEffect(() => {
    const updateTimer = () => {
      try {
        const now = new Date();
        const bgkTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        const bgkNow = new Date(bgkTimeString);
        const bgkMidnight = new Date(bgkNow);
        bgkMidnight.setHours(24, 0, 0, 0);
        const diffMs = bgkMidnight.getTime() - bgkNow.getTime();

        if (diffMs <= 0) {
          setTimeLeftStr("00ชม. 00น.");
          return;
        }

        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const pad = (n: number) => String(n).padStart(2, "0");
        setTimeLeftStr(`${hrs}ชม. ${pad(mins)}น.`);
      } catch {
        setTimeLeftStr("");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🧠 Fail-Fast Sprint Evaluator & Completed Days Sync:
  // If badge is unlocked, merge actual completedDays with 5-day fallback so newly completed days (e.g. D7) immediately render checked
  const effectiveCompletedDays = isBadgeUnlocked
    ? Array.from(new Set([...completedDays, ...(completedDays.length < 5 ? [1, 2, 3, 4, 5] : [])]))
    : completedDays;

  const isTodayCompleted = effectiveCompletedDays.includes(currentDay);
  const remainingDaysCount = isTodayCompleted ? Math.max(0, 7 - currentDay) : Math.max(0, 7 - currentDay + 1);
  const maxPossibleCompleted = effectiveCompletedDays.length + remainingDaysCount;
  const isFailedSprint = !isBadgeUnlocked && effectiveCompletedDays.length < 5 && maxPossibleCompleted < 5;

  // 🧠 Smart Track Recommendation Evaluator:
  // Priority #1: User's explicit 1-Year Goal text typed in Wheel of Life
  // Priority #2: Quantitative lowest score category evaluated from Wheel of Life
  const getRecommendedTrackKey = (): string => {
    if (userGoal && userGoal.trim()) {
      const g = userGoal.toLowerCase();
      
      // 1. Content & High Output Systems
      if (g.includes("content") || g.includes("คอนเทนต์") || g.includes("ทำช่อง") || g.includes("โพสต์")) return "career";
      
      // 2. Team Building, Leadership & Relationships
      if (g.includes("ทีม") || g.includes("ลูกทีม") || g.includes("ลุยไปด้วยกัน") || g.includes("ความสัมพันธ์") || g.includes("ครอบครัว") || g.includes("แฟน") || g.includes("เพื่อน")) return "relationship";
      
      // 3. Reading, Habit & Continuous Learning
      if (g.includes("หนังสือ") || g.includes("อ่าน") || g.includes("เรียน") || g.includes("พัฒนาตนเอง") || g.includes("ฝึกวินัย")) return "mindset";
      
      // 4. Career, Business & Work Output
      if (g.includes("งาน") || g.includes("อาชีพ") || g.includes("ธุรกิจ") || g.includes("ตำแหน่ง") || g.includes("ระบบ")) return "career";
      
      // 5. Health & Energy
      if (g.includes("สุขภาพ") || g.includes("ออกกำลัง") || g.includes("น้ำหนัก") || g.includes("นอน") || g.includes("หุ่น")) return "health";
      
      // 6. Inner Peace & Mindfulness
      if (g.includes("จิตใจ") || g.includes("สติ") || g.includes("สงบ") || g.includes("สมาธิ") || g.includes("ปล่อยวาง")) return "innerpeace";
      
      // 7. Contribution & Giving Back
      if (g.includes("สังคม") || g.includes("ช่วยเหลือ") || g.includes("แบ่งปัน") || g.includes("ส่งต่อ") || g.includes("บริจาค")) return "contribution";
      
      // 8. Wealth & Asset Management
      if (g.includes("เก็บเงิน") || g.includes("ออม") || g.includes("ปลดหนี้") || g.includes("พอร์ต") || g.includes("ลงทุน") || g.includes("เงิน")) return "money";
    }

    if (lowestWheelCategory) {
      const catMap: Record<string, string> = {
        finance: "money", money: "money", "การเงิน": "money",
        career: "career", work: "career", "การงาน": "career",
        health: "health", "สุขภาพ": "health",
        relationship: "relationship", family: "relationship", "ครอบครัว": "relationship", "เพื่อนฝูง": "relationship", "ความสัมพันธ์": "relationship",
        mind: "mindset", growth: "mindset", "พัฒนาตนเอง": "mindset",
        spirit: "innerpeace", peace: "innerpeace", "จิตใจ": "innerpeace",
        society: "contribution", social: "contribution", "ช่วยเหลือสังคม": "contribution",
        lifedesign: "lifedesign", "ออกแบบชีวิต": "lifedesign"
      };
      const key = catMap[lowestWheelCategory.toLowerCase()];
      if (key) return key;
    }

    return "career";
  };

  const recommendedTrackKey = getRecommendedTrackKey();

  return (
    <div className="w-full mb-6">
      {activeTrack ? (
        isQueuedForTomorrow ? (
          /* ⏳ Queued Skill Track Banner (Starts Tomorrow 00:00) */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 shadow-2xl"
          >
            {/* Background Glow Flare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none -mr-16 -mt-16" />

            {/* Header Row: Icon + Track Name + Status Badge */}
            <div className="flex items-center justify-between gap-2.5 relative z-10 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  {getTrackIcon(activeTrack.id, 20)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-amber-400 tracking-wider flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" /> ต่อคิวเริ่มบทเรียนแรก
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                    {activeTrack.title}
                  </h3>
                </div>
              </div>

              {/* Right Action Button */}
              <button
                onClick={() => {
                  setSelectedTrackForChoice(null);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[11px] transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 border border-white/10"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>เปลี่ยนวิชา</span>
              </button>
            </div>

            {/* Queued Info Box */}
            <div className="pt-3 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>เนื่องจากวันนี้ทำภารกิจไปแล้ว! <strong>Day 1</strong> จะเริ่มวันพรุ่งนี้ 00:00 น.</span>
              </div>
              {timeLeftStr && (
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-black text-[11px]">
                  เปิดในอีก {timeLeftStr}
                </span>
              )}
            </div>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-[2rem] border ${isFailedSprint ? 'border-rose-500/40 bg-gradient-to-br from-slate-950 via-rose-950/20 to-slate-950' : 'border-orange-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'} text-white p-4 sm:p-5 shadow-2xl`}
        >
          {/* Background Glow Flare */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${isFailedSprint ? 'bg-rose-500/10' : 'bg-orange-500/10'} blur-3xl rounded-full pointer-events-none -mr-16 -mt-16`} />

          {/* Header Row: Icon + Track Name + Status/Action */}
          <div className="flex items-center justify-between gap-2.5 relative z-10 mb-3.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                {getTrackIcon(activeTrack.id, 20)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] sm:text-xs font-black ${isFailedSprint ? 'text-rose-400' : 'text-amber-400'} tracking-wider`}>
                    Day {currentDay}/7
                  </span>
                  <button 
                    onClick={onOpenInfo}
                    className="w-4 h-4 rounded-full bg-orange-400/20 hover:bg-orange-400/40 text-orange-300 text-[10px] inline-flex items-center justify-center font-black cursor-pointer transition-colors border border-orange-400/30"
                    title="ดูคำแนะนำวิชาและเวลาตัดรอบ"
                  >
                    i
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  {activeTrack.title}
                </h3>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isFailedSprint ? (
                <div className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[10px] font-black tracking-wider flex items-center gap-1 shrink-0">
                  <RotateCcw size={12} className="text-rose-400" />
                  <span>ไม่ผ่านรอบนี้</span>
                </div>
              ) : effectiveCompletedDays.length < 5 && !isBadgeUnlocked ? (
                <div className="px-2.5 py-1 rounded-xl bg-orange-500/15 border border-orange-400/30 text-orange-300 text-[10px] font-black tracking-wider flex items-center gap-1 shrink-0">
                  <ShieldCheck size={12} className="text-orange-400" />
                  <span className="hidden sm:inline">โฟกัส 7 วัน</span>
                  <span className="sm:hidden">7 วัน</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedTrackForChoice(null);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-[11px] transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-orange-500/20"
                >
                  <Sparkles size={12} />
                  <span>{nextTrackId && nextTrackId !== activeTrackId ? "เปลี่ยนวิชาที่ต่อคิว" : "สลับวิชา"}</span>
                </button>
              )}
            </div>
          </div>

          {/* 7-Day Sprint Progress Grid */}
          <div className="pt-3 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Target size={13} className={isFailedSprint ? 'text-rose-400' : 'text-orange-400'} />
                ความคืบหน้า 7 วัน
              </span>
              <span className={isFailedSprint ? 'text-rose-400 font-black' : 'text-orange-400 font-black'}>
                {Math.round((effectiveCompletedDays.length / 7) * 100)}% สำเร็จ
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isCompleted = effectiveCompletedDays.includes(dayNum);
                const isCurrent = dayNum === currentDay;

                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-gradient-to-br from-amber-500/30 via-orange-500/25 to-amber-600/20 border-amber-400 text-amber-100 shadow-md shadow-amber-500/20"
                        : isCurrent
                        ? isFailedSprint
                          ? "bg-slate-950 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/70"
                          : "bg-slate-900 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.4)] ring-1 ring-amber-400/70"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <span className={`text-[9.5px] font-black uppercase tracking-tight ${isCurrent ? (isFailedSprint ? 'text-rose-200 font-bold' : 'text-amber-200 font-bold') : isCompleted ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>D{dayNum}</span>
                    {isCompleted ? (
                      <CheckCircle2 size={14} className="text-amber-300 mt-0.5 drop-shadow-sm" />
                    ) : isCurrent ? (
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${isFailedSprint ? 'border-rose-400 bg-rose-400/30' : 'border-amber-400 bg-amber-400/30'} flex items-center justify-center mt-0.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isFailedSprint ? 'bg-rose-300' : 'bg-amber-300'} animate-ping`} />
                      </div>
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-slate-600 bg-transparent mt-0.5 opacity-60" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 🛑 Fail-Fast Sprint Warning Banner */}
            {isFailedSprint ? (
              <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/30 flex items-center justify-center shrink-0 border border-rose-400/50 text-rose-200 font-black shadow-inner text-sm">
                    ✕
                  </div>
                  <div>
                    <span className="font-black text-rose-100 block text-xs sm:text-sm tracking-wide">ไม่ผ่านรอบนี้ (สะสมได้ไม่ถึง 5/7 วัน)</span>
                    <span className="text-[11px] text-rose-200 block mt-0.5 leading-snug">ข้ามเควสต์เกิน 2 วัน ทำให้สะสมไม่ครบ 5 วันในรอบนี้ ไม่เป็นไรครับ! สามารถเลือกสลับวิชาใหม่ได้เลย</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setSelectedTrackForChoice(null);
                      setIsModalOpen(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 border ${
                      nextTrackId && nextTrackId !== activeTrackId
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-amber-300/60 shadow-amber-900/40"
                        : "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-400 hover:to-red-400 border-rose-400/40 shadow-rose-900/40"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>{nextTrackId && nextTrackId !== activeTrackId ? "ต่อคิววิชาพรุ่งนี้แล้ว" : "สลับวิชา"}</span>
                  </button>
                </div>
              </div>
            ) : nextTrackId && nextTrackId !== activeTrack.id && SKILL_TRACKS[nextTrackId] ? (
              <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-200 text-xs font-medium flex items-center justify-between gap-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">
                    ต่อคิววิชาถัดไป: <strong className="text-white font-bold">{SKILL_TRACKS[nextTrackId].title}</strong>
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-amber-300/80 font-bold shrink-0">เริ่มพรุ่งนี้ 00:00 น.</span>
              </div>
            ) : null}
          </div>
        </motion.div>
        )
      ) : (
        /* 🚀 Initial Track Selection Prompt - Minimal Responsive Card */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-amber-400/30 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 text-white p-4 sm:p-5 shadow-xl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-xl rounded-full pointer-events-none -mr-8 -mt-8" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center shrink-0 shadow-inner">
                <BookOpen size={18} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                  7-DAY MASTERY SPRINT
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white leading-snug mt-0.5">
                  เลือกวิชาชีวิตประจำสัปดาห์นี้
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedTrackForChoice(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>เลือกวิชา</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 🎓 Skill Track Selector Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100005] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-4 sm:p-6 max-w-4xl w-full max-h-[88vh] flex flex-col text-white shadow-2xl relative my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-400" /> เลือกอาจารย์ & วิชาชีวิต 7 วัน
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    เลือก 1 วิชาเพื่อรับคำแนะนำจาก Mentor และฝึกฝนภารกิจประจำสัปดาห์นี้
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTrackForChoice(null);
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 🎨 Responsive Grid Layout (2 Cols Mobile / 4 Cols Desktop) */}
              <div className="overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 custom-scrollbar">
                {Object.values(SKILL_TRACKS).map((track) => {
                  const isRecommended = track.id === recommendedTrackKey;
                  const isCurrentActive = track.id === activeTrackId;
                  const isQueuedNext = nextTrackId && track.id === nextTrackId && nextTrackId !== activeTrackId;
                  const theme = getTrackThemeStyles(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        onSelectTrack(track.id);
                        setIsModalOpen(false);
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col items-center text-center justify-between gap-2.5 ${
                        isCurrentActive
                          ? theme.activeCardBg
                          : isQueuedNext
                          ? "bg-orange-500/20 border-orange-400 shadow-xl ring-2 ring-orange-400/50"
                          : theme.cardBg
                      }`}
                    >
                      {/* Top Badge: Recommended */}
                      {isRecommended && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-lg">
                            <Sparkles size={9} /> แนะนำ
                          </span>
                        </div>
                      )}

                      {/* Mentor Big Avatar / Track Icon Frame */}
                      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 ${theme.avatarBorder} bg-slate-900 shadow-lg group-hover:scale-105 transition-all shrink-0 mt-1`}>
                        {track.mentor?.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={track.mentor.image} alt={track.mentor.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            {getTrackIcon(track.id, 32)}
                          </div>
                        )}
                      </div>

                      {/* Track & Mentor Labels */}
                      <div className="min-w-0 flex-1 w-full text-center">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {track.title}
                        </h4>
                        <p className={`text-[10px] sm:text-[11px] ${theme.mentorName} font-bold truncate mt-0.5`}>
                          {track.mentor?.name || track.subtitle}
                        </p>
                        <p className="text-[9.5px] sm:text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                          {track.mentor?.quote ? `"${track.mentor.quote}"` : track.description}
                        </p>
                      </div>

                      {/* Action Button Badge */}
                      <button className={`w-full py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 ${
                        isCurrentActive
                          ? theme.btnActive
                          : isQueuedNext
                          ? theme.btnQueued
                          : theme.btnDefault
                      }`}>
                        {isCurrentActive ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>เรียนอยู่วันนี้</span>
                          </>
                        ) : isQueuedNext ? (
                          <>
                            <Clock size={12} />
                            <span>ต่อคิวพรุ่งนี้</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight size={12} />
                            <span>เลือกเรียน</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
