"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Hourglass, Sparkles, CheckCircle2, Zap } from "lucide-react";

interface MementoMoriBentoProps {
  userData: any;
  onOpenModal: () => void;
}

export const MementoMoriBento: React.FC<MementoMoriBentoProps> = ({ userData, onOpenModal }) => {
  const [weeksRemaining, setWeeksRemaining] = useState<number | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [percentLived, setPercentLived] = useState<number | null>(null);
  const [hasReflectedThisWeek, setHasReflectedThisWeek] = useState(false);

  useEffect(() => {
    if (!userData?.birthdate) return;

    const birthDate = new Date(userData.birthdate);
    const expectedAge = userData.expectedAge || 80;
    const now = new Date();

    // Calculate target date of death
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(birthDate.getFullYear() + expectedAge);

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const diffWeeks = Math.max(0, Math.floor(diffDays / 7));

    const totalDays = expectedAge * 365.25;
    const daysLived = Math.max(0, (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const calculatedPercent = Math.min(100, Math.max(0, (daysLived / totalDays) * 100));

    setDaysRemaining(diffDays);
    setWeeksRemaining(diffWeeks);
    setPercentLived(calculatedPercent);

    // Check if reflected this week (within last 7 days)
    if (userData.mementoReflections && userData.mementoReflections.length > 0) {
      const sorted = [...userData.mementoReflections].sort(
        (a: any, b: any) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
      );
      const lastAnswer = new Date(sorted[0].answeredAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      setHasReflectedThisWeek(lastAnswer.getTime() > oneWeekAgo.getTime());
    } else {
      setHasReflectedThisWeek(false);
    }
  }, [userData]);

  const hasSetup = !!userData?.birthdate;

  return (
    <div className="group block h-full relative cursor-pointer" onClick={onOpenModal}>
      <motion.div
        whileHover={{ y: -6 }}
        className="h-full bg-[#F4ECE1] p-8 rounded-[3rem] shadow-sm border border-[#E6D9C5] flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-[#8B5A2B]/40 relative overflow-hidden"
      >
        {/* Ambient Light & Brown Top Bar */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#8B5A2B]/10 to-[#D2B48C]/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-[#8B5A2B]/15 transition-colors duration-700 z-0" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#8B5A2B] opacity-90 transition-all duration-500 group-hover:h-2" />

        <div className="relative z-10 flex flex-col items-center h-full w-full">
          {/* Logo / Progress Ring Container */}
          <div className="relative mb-6 mt-2">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-amber-200" />
            
            {hasSetup ? (
              /* Circular Progress Gauge matching 24x24 box */
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="#EADFCF"
                    strokeWidth="5"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="#8B5A2B"
                    strokeWidth="7"
                    strokeDasharray="251.32"
                    initial={{ strokeDashoffset: 251.32 }}
                    animate={{ strokeDashoffset: 251.32 - ((percentLived || 0) / 100) * 251.32 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-lg font-black text-[#3E2723] leading-none block">
                    {percentLived !== null ? percentLived.toFixed(1) : "0.0"}%
                  </span>
                  <span className="text-[7px] font-black text-[#8C7A6B] uppercase tracking-widest block mt-0.5">Lived</span>
                </div>
              </div>
            ) : (
              /* Default Hourglass Container matching the Focus Room🧘‍♂️ container but in Stoic cream */
              <div className="relative w-24 h-24 rounded-full bg-[#FCFAF7] shadow-[0_12px_40px_rgba(139,90,43,0.06)] border border-[#EADFCF] flex items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110">
                ⏳
              </div>
            )}
          </div>

          <h3 className="font-bold text-[#8B5A2B]/85 text-[10px] uppercase tracking-[0.3em] mb-2.5"> Memento Mori </h3>
          <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight text-[#3E2723] group-hover:text-[#8B5A2B] transition-colors">
            เวลาชีวิตของคุณ
          </h2>

          {hasSetup ? (
            <>
              {/* Description & XP Badge */}
              <div className="flex flex-col items-center mb-8 px-6 max-w-[280px]">
                <p className="text-[14px] font-medium text-[#5C4033]/90 leading-relaxed mb-3">
                  เหลือ <span className="text-[#8B5A2B] font-extrabold">{daysRemaining?.toLocaleString() || 0} วัน</span> <br />
                  ({weeksRemaining?.toLocaleString()} สัปดาห์)
                </p>
                
                {hasReflectedThisWeek ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/60 text-emerald-800 rounded-full border border-emerald-300/40 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={11} className="fill-emerald-600 text-white" />
                    ทบทวนสัปดาห์นี้แล้ว (+15 XP)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EADFCF] text-[#5C4033] rounded-full border border-[#D2B48C]/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <Sparkles size={11} className="text-[#8B5A2B]" />
                    แตะเพื่อตอบทบทวน (+15 XP)
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="w-full px-4 mt-auto">
                <div className="group/btn-memento relative">
                  <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#8B5A2B] hover:bg-[#724a23] text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(139,90,43,0.3)] group-hover/btn-memento:scale-[1.02] active:scale-95">
                    <Hourglass size={16} className="text-white/80 animate-spin" style={{ animationDuration: "5s" }} />
                    <span>เขียนบันทึกความตาย</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Description & XP Badge */}
              <div className="flex flex-col items-center mb-8 px-6 max-w-[280px]">
                <p className="text-[14px] font-medium text-[#5C4033]/90 leading-relaxed mb-3">
                  ระลึกความตายสม่ำเสมอ <br /> เพื่อใช้ชีวิตวันนี้ให้มีความหมาย
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EADFCF] text-[#5C4033] rounded-full border border-[#D2B48C]/40 text-[10px] font-black uppercase tracking-wider">
                  <Zap size={11} className="fill-[#8B5A2B] text-[#8B5A2B]" />
                  เริ่มต้นตั้งค่า (+15 XP)
                </span>
              </div>

              {/* Action Button */}
              <div className="w-full px-4 mt-auto">
                <div className="group/btn-memento relative">
                  <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#8B5A2B] hover:bg-[#724a23] text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(139,90,43,0.3)] group-hover/btn-memento:scale-[1.02] active:scale-95">
                    <Sparkles size={16} className="text-white/80" />
                    <span>ตั้งค่าเวลาชีวิต</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
