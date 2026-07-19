"use client";

import React from "react";
import { Crown, Wallet, Briefcase, HeartPulse, Users, Brain, Target, Handshake, Compass, CheckCircle2, Lock, Award } from "lucide-react";

interface SkillBadgesShowcaseProps {
  completedTrackIds?: string[];
  activeTrackId?: string | null;
  trackCompletionCounts?: Record<string, number>;
}

const BADGES_3X3 = [
  { id: "money", title: "Wealth", icon: <Wallet size={20} />, sub: "อิสรภาพการเงิน" },
  { id: "career", title: "Output", icon: <Briefcase size={20} />, sub: "การงาน & Output" },
  { id: "health", title: "Vitality", icon: <HeartPulse size={20} />, sub: "สุขภาพ & พลังงาน" },
  { id: "relationship", title: "Connection", icon: <Users size={20} />, sub: "ความสัมพันธ์" },
  { id: "grandmaster", title: "Grandmaster", icon: <Crown size={24} className="text-amber-400" />, sub: "พิชิตครบ 8 วิชา", isSpecial: true },
  { id: "mindset", title: "Mindset", icon: <Brain size={20} />, sub: "กรองความคิด" },
  { id: "focus", title: "Deep Focus", icon: <Target size={20} />, sub: "ไร้สิ่งรบกวน" },
  { id: "influence", title: "Influence", icon: <Handshake size={20} />, sub: "ศิลปะการจูงใจ" },
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
    <div className="w-full my-6 p-4 sm:p-5 rounded-[2rem] bg-slate-950 border border-slate-800/80 text-white shadow-xl">
      {/* Sleek Minimalist Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase flex items-center gap-2">
            <Award size={15} className="text-amber-400" /> สะสมวิชาชีวิต
          </h3>
          <p className="text-[10px] text-slate-500 font-bold">
            สถิติตัวตน ({completedCount}/8 สำเร็จแล้ว)
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-black tracking-wider">
          {completedCount === 8 ? "GRANDMASTER" : `${8 - completedCount} วิชาที่เหลือ`}
        </div>
      </div>

      {/* 3x3 Minimalist Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {BADGES_3X3.map((item) => {
          if (item.isSpecial) {
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border text-center transition-all relative overflow-hidden ${
                  isGrandmasterUnlocked
                    ? "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-slate-900 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : "bg-slate-900/40 border-slate-800/60 text-slate-500"
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
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border text-center transition-all relative ${
                isCompleted
                  ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-sm"
                  : isActive
                  ? "bg-slate-900 border-amber-400/40 text-white shadow-sm ring-1 ring-amber-400/30"
                  : "bg-slate-900/40 border-white/5 text-slate-500"
              }`}
            >
              {count > 1 && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[8px] font-black tracking-wider">
                  x{count}
                </div>
              )}

              <div className={`p-2 rounded-xl mb-1.5 transition-colors ${isCompleted ? 'bg-amber-400/20 text-amber-300' : isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-600'}`}>
                {item.icon}
              </div>
              <h4 className={`text-[11px] sm:text-xs font-black truncate ${isCompleted ? 'text-amber-200' : 'text-slate-300'}`}>
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
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
