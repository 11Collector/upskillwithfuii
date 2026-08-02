"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Award, CheckCircle2, RotateCcw, X, BookOpen, Target, ShieldCheck, Wallet, Users, Brain, Briefcase, HeartPulse, Sun, HeartHandshake, Compass, Clock } from "lucide-react";
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
  isBadgeUnlocked
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
        /* 🏆 Active Skill Track Banner - Clean Minimal Mobile Friendly Layout */
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
            ) : nextTrackId && nextTrackId !== activeTrackId && SKILL_TRACKS[nextTrackId] ? (
              <div className="mt-3 p-3 rounded-2xl bg-amber-950/90 border border-amber-400/50 text-amber-100 text-xs font-medium flex items-center justify-between shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0 border border-amber-400/40 text-amber-300 shadow-inner">
                    <Sparkles size={14} />
                  </div>
                  <span className="truncate">ต่อคิววิชาถัดไป: <strong className="text-white font-black">{SKILL_TRACKS[nextTrackId].title}</strong></span>
                </div>
                <span className="text-[10px] text-amber-200 font-black px-2.5 py-1 bg-amber-400/25 rounded-full border border-amber-400/40 shrink-0 ml-2 shadow-sm">เริ่มวันพรุ่งนี้ 00:00 น.</span>
              </div>
            ) : null}
          </div>
        </motion.div>
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-24 sm:pb-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/10 rounded-[2rem] p-4 sm:p-5 max-w-lg w-full max-h-[75vh] sm:max-h-[80vh] flex flex-col text-white shadow-2xl relative my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-400" /> เลือกวิชาชีวิต 7 วัน
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    เลือก 1 วิชาเพื่อฝึกฝนเข้มข้นสัปดาห์นี้
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

              {/* Sleek 1-Column List of 8 Skill Tracks - 100% Readable */}
              <div className="overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                {Object.values(SKILL_TRACKS).map((track) => {
                  const isRecommended = track.id === recommendedTrackKey;
                  const isCurrentActive = track.id === activeTrackId;
                  const isQueuedNext = nextTrackId && track.id === nextTrackId && nextTrackId !== activeTrackId;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        onSelectTrack(track.id);
                        setIsModalOpen(false);
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                        isCurrentActive
                          ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20"
                          : isQueuedNext
                          ? "bg-orange-500/20 border-orange-400 shadow-md shadow-orange-500/20"
                          : "bg-slate-950/60 border-white/10 hover:border-amber-400/50 hover:bg-slate-950/90"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          {getTrackIcon(track.id, 20)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-white">
                              {track.title}
                            </h4>
                            {isRecommended && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-400/30 flex items-center gap-1">
                                <Sparkles size={10} /> แนะนำสำหรับคุณ
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-amber-300 font-bold mt-0.5">
                            {track.subtitle}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                          isCurrentActive
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                            : isQueuedNext
                            ? "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-500/30"
                            : "bg-white/10 text-slate-200 group-hover:bg-amber-400 group-hover:text-slate-950"
                        }`}>
                          {isCurrentActive ? "วิชาปัจจุบัน" : isQueuedNext ? "✨ ต่อคิวแล้ว (เริ่มพรุ่งนี้)" : "เลือกวิชานี้"}
                        </span>
                      </div>
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
