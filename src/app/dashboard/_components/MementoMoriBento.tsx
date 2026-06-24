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
      {/* Dynamic styling for sand drip animation */}
      <style>{`
        @keyframes sandDrip {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-sand-drip {
          animation: sandDrip 1.2s linear infinite;
        }
      `}</style>

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
            <div className="absolute inset-0 blur-3xl opacity-20 bg-amber-250" />
            
            {hasSetup ? (
              /* Circular Progress Gauge with Holographic Hourglass Inside */
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

                {/* Holographic Glossy Inner Circle for Hourglass Logo */}
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#ffb3ba] via-[#ffdfba] via-[#ffffba] via-[#baffc9] via-[#bae1ff] to-[#e8cbf5] flex items-center justify-center shadow-inner overflow-hidden border border-white/40">
                  {/* Gloss Specularity Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-70 pointer-events-none" />
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/20 rounded-full blur-sm" />
                  
                  {/* Custom Hourglass SVG representing the draining sand */}
                  <svg className="w-8 h-8 text-[#5C4033] relative z-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="hourglass-sand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                    </defs>
                    {/* Hourglass Frame Outline */}
                    <path d="M18 10H46M18 54H46" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <path d="M20 10C20 22 29 28 32 30C35 28 44 22 44 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 54C20 42 29 36 32 34C35 36 44 42 44 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Top Bulb Sand (Decreasing) */}
                    <g style={{ transform: `scaleY(${Math.max(0, 1 - (percentLived || 0) / 100)})`, transformOrigin: '32px 30px' }}>
                      <path d="M22 14C24 23 29 27 32 29C35 27 40 23 42 14H22Z" fill="url(#hourglass-sand-grad)" />
                    </g>
                    
                    {/* Bottom Bulb Sand (Increasing) */}
                    <g style={{ transform: `scaleY(${Math.min(1, (percentLived || 0) / 100)})`, transformOrigin: '32px 54px' }}>
                      <path d="M21 53C21 44 29 38 32 35C35 38 43 44 43 53H21Z" fill="url(#hourglass-sand-grad)" />
                    </g>
                    
                    {/* Drip Stream Line */}
                    <line x1="32" y1="30" x2="32" y2="53" stroke="url(#hourglass-sand-grad)" strokeWidth="2" strokeDasharray="3 3" className="animate-sand-drip" />
                  </svg>
                </div>
              </div>
            ) : (
              /* Holographic Empty State Hourglass Logo Container */
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#ffb3ba] via-[#ffdfba] via-[#ffffba] via-[#baffc9] via-[#bae1ff] to-[#e8cbf5] shadow-[0_12px_40px_rgba(236,72,153,0.15)] border border-white/40 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 overflow-hidden">
                {/* Gloss Specularity Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-70 pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/20 rounded-full blur-md" />
                
                {/* Custom Hourglass SVG showing full sand in top bulb */}
                <svg className="w-12 h-12 text-[#5C4033] relative z-10 animate-pulse" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="hourglass-sand-grad-empty" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                  <path d="M18 10H46M18 54H46" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M20 10C20 22 29 28 32 30C35 28 44 22 44 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 54C20 42 29 36 32 34C35 36 44 42 44 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 14C24 23 29 27 32 29C35 27 40 23 42 14H22Z" fill="url(#hourglass-sand-grad-empty)" />
                </svg>
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
                {/* Lived percentage pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5ED] text-[#5C4033] rounded-full border border-[#D2B48C]/40 text-[11px] font-black mb-3 shadow-sm">
                  ผ่านไปแล้ว {percentLived !== null ? percentLived.toFixed(1) : "0.0"}% ของชีวิต
                </span>
                
                <p className="text-[14px] font-medium text-[#5C4033]/90 leading-relaxed mb-3">
                  เหลือ <span className="text-[#8B5A2B] font-extrabold">{daysRemaining?.toLocaleString() || 0} วัน</span> <br />
                  ({weeksRemaining?.toLocaleString()} สัปดาห์)
                </p>
                
                {hasReflectedThisWeek ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5ED] text-[#8B5A2B] rounded-full border border-[#D2B48C]/60 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={11} className="fill-[#8B5A2B] text-white" />
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
                    <span>เขียนบันทึกเวลาชีวิต</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Description & XP Badge */}
              <div className="flex flex-col items-center mb-8 px-6 max-w-[280px]">
                <p className="text-[14px] font-medium text-[#5C4033]/90 leading-relaxed mb-3">
                  ระลึกเวลาจำกัดอย่างสม่ำเสมอ <br /> เพื่อใช้ชีวิตวันนี้ให้มีความหมาย
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
