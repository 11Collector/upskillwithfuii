"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Award, CheckCircle2, RotateCcw, X, BookOpen, Target, ShieldCheck, Wallet, Users, Brain, Briefcase, HeartPulse, Sun, HeartHandshake, Compass } from "lucide-react";
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
  onOpenInfo?: () => void;
  onAdvanceDevDay?: () => void;
  nextTrackId?: string | null;
}

export default function SkillTrackBanner({
  activeTrackId,
  currentDay,
  completedDays,
  lowestWheelCategory,
  userGoal,
  onSelectTrack,
  onResetTrack,
  onOpenInfo,
  onAdvanceDevDay,
  nextTrackId
}: SkillTrackBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackForChoice, setSelectedTrackForChoice] = useState<string | null>(null);
  const activeTrack = activeTrackId ? SKILL_TRACKS[activeTrackId] : null;

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
          className="relative overflow-hidden rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 shadow-2xl"
        >
          {/* Background Glow Flare */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none -mr-16 -mt-16" />

          {/* Header Row: Icon + Track Name + Status/Action */}
          <div className="flex items-center justify-between gap-2.5 relative z-10 mb-3.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                {getTrackIcon(activeTrack.id, 20)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] sm:text-xs font-black text-amber-400 tracking-wider">
                    Day {currentDay}/7
                  </span>
                  <button 
                    onClick={onOpenInfo}
                    className="w-4 h-4 rounded-full bg-orange-400/20 hover:bg-orange-400/40 text-orange-300 text-[10px] inline-flex items-center justify-center font-black cursor-pointer transition-colors border border-orange-400/30"
                    title="ดูคำแนะนำวิชา"
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
              {completedDays.length < 5 ? (
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
                  <Sparkles size={12} /> สลับวิชา
                </button>
              )}
            </div>
          </div>

          {/* 7-Day Sprint Progress Grid */}
          <div className="pt-3 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Target size={13} className="text-orange-400" />
                ความคืบหน้า 7 วัน
              </span>
              <span className="text-orange-400 font-black">
                {Math.round((completedDays.length / 7) * 100)}% สำเร็จ
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isCompleted = completedDays.includes(dayNum);
                const isCurrent = dayNum === currentDay;

                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20 border-orange-400 text-orange-200 shadow-md shadow-orange-500/20"
                        : isCurrent
                        ? "bg-slate-900 border-amber-400/90 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50"
                        : "bg-white/5 border-white/5 text-slate-500"
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-orange-300' : 'text-slate-500'}`}>D{dayNum}</span>
                    {isCompleted ? (
                      <CheckCircle2 size={13} className="text-orange-400 mt-0.5" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                      </div>
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-slate-700 bg-transparent mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
            {nextTrackId && nextTrackId !== activeTrackId && SKILL_TRACKS[nextTrackId] && (
              <div className="mt-3 px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span className="truncate">วิชาถัดไป: <strong className="text-white font-black">{SKILL_TRACKS[nextTrackId].title}</strong></span>
                </div>
                <span className="text-[10px] text-amber-400 font-black px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/20 shrink-0 ml-2">เริ่มวันพรุ่งนี้ 00:00 น.</span>
              </div>
            )}
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
                  const isSelected = track.id === activeTrackId;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        onSelectTrack(track.id);
                        setIsModalOpen(false);
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20"
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
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                            : "bg-white/10 text-slate-200 group-hover:bg-amber-400 group-hover:text-slate-950"
                        }`}>
                          {isSelected ? "วิชาปัจจุบัน" : "เลือกวิชานี้"}
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
