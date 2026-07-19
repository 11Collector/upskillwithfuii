"use client";

import React from "react";
import { Crown, Wallet, Briefcase, HeartPulse, Users, Brain, Sun, HeartHandshake, Compass, CheckCircle2, Lock, Award, Sparkles } from "lucide-react";

interface SkillBadgesShowcaseProps {
  completedTrackIds?: string[];
  activeTrackId?: string | null;
  trackCompletionCounts?: Record<string, number>;
}

const BADGES_3X3 = [
  { id: "money", title: "Wealth", icon: <Wallet size={20} />, sub: "การเงิน" },
  { id: "career", title: "Career", icon: <Briefcase size={20} />, sub: "การงาน" },
  { id: "health", title: "Vitality", icon: <HeartPulse size={20} />, sub: "สุขภาพ" },
  { id: "relationship", title: "Connection", icon: <Users size={20} />, sub: "ครอบครัว & เพื่อน" },
  { id: "grandmaster", title: "Grandmaster", icon: <Crown size={24} className="text-amber-400" />, sub: "พิชิตครบ 8 มิติ", isSpecial: true },
  { id: "mindset", title: "Mindset", icon: <Brain size={20} />, sub: "พัฒนาตนเอง" },
  { id: "innerpeace", title: "Inner Peace", icon: <Sun size={20} />, sub: "จิตใจ & สติ" },
  { id: "contribution", title: "Contribution", icon: <HeartHandshake size={20} />, sub: "ช่วยเหลือสังคม" },
  { id: "lifedesign", title: "Life Design", icon: <Compass size={20} />, sub: "ออกแบบระบบชีวิต" },
];

export default function SkillBadgesShowcase({
  completedTrackIds = [],
  activeTrackId,
  trackCompletionCounts = {}
}: SkillBadgesShowcaseProps) {
  const completedCount = completedTrackIds.length;
  const isGrandmasterUnlocked = completedCount >= 8;

  return (
    <div className="w-full my-6 p-5 sm:p-6 rounded-[2.5rem] bg-white border border-[#E6D9C5] shadow-xl relative overflow-hidden">
      {/* 🧡 Top Vibrant Orange Gradient Bar matching Daily Quests Header */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-t-[2.5rem]" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-5 pt-1 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-wide flex items-center gap-1.5">
              สะสมวิชาชีวิต <Sparkles size={14} className="text-orange-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              วิชาที่เรียนจบแล้ว ({completedCount}/8 วิชา)
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-[10px] font-black tracking-wider shadow-xs">
          {completedCount === 8 ? "GRANDMASTER" : `${8 - completedCount} วิชาที่เหลือ`}
        </div>
      </div>

      {/* 3x3 Bento Grid with Orange & Dark Accents */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 relative z-10">
        {BADGES_3X3.map((item) => {
          if (item.isSpecial) {
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all relative overflow-hidden ${
                  isGrandmasterUnlocked
                    ? "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-slate-900 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {!isGrandmasterUnlocked ? (
                  /* Bento Lock Center State with Blurred Mystery Text */
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shadow-inner mb-1.5">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <div className="filter blur-[4px] opacity-40 select-none pointer-events-none">
                      <h4 className="text-[11px] sm:text-xs font-black truncate text-amber-300">Grandmaster</h4>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 truncate mt-0.5">พิชิตครบ 8 วิชา</span>
                    </div>
                  </div>
                ) : (
                  /* Unlocked State */
                  <>
                    <div className="p-2 rounded-xl mb-1.5 bg-amber-400/20 text-amber-300 animate-pulse">
                      {item.icon}
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-black truncate text-amber-300">{item.title}</h4>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 truncate mt-0.5">{item.sub}</span>
                  </>
                )}
              </div>
            );
          }

          const isCompleted = completedTrackIds.includes(item.id);
          const isActive = activeTrackId === item.id;
          const count = trackCompletionCounts[item.id] || (isCompleted ? 1 : 0);

          return (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all relative ${
                isCompleted
                  ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-sm"
                  : isActive
                  ? "bg-slate-950 border-2 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                  : "bg-slate-950 border border-slate-800/90 text-slate-400"
              }`}
            >
              {count > 1 && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[8px] font-black tracking-wider">
                  x{count}
                </div>
              )}

              <div className={`p-2 rounded-xl mb-1.5 transition-colors ${isCompleted ? 'bg-amber-400/20 text-amber-300' : isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'}`}>
                {item.icon}
              </div>
              <h4 className={`text-[11px] sm:text-xs font-black truncate ${isCompleted ? 'text-amber-200' : isActive ? 'text-white' : 'text-slate-300'}`}>
                {item.title}
              </h4>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 truncate mt-0.5">
                {item.sub}
              </span>

              {/* Minimal Status Indicator */}
              <div className="absolute top-2 right-2">
                {isCompleted ? (
                  <CheckCircle2 size={12} className="text-amber-400" />
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400 animate-pulse" />
                ) : (
                  <Lock size={10} className="text-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
