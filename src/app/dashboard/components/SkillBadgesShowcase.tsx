"use client";

import React from "react";
import { Crown, Wallet, Briefcase, HeartPulse, Users, Brain, Sun, HeartHandshake, Compass, CheckCircle2, Lock, Award, Sparkles } from "lucide-react";

interface SkillBadgesShowcaseProps {
  completedTrackIds?: string[];
  activeTrackId?: string | null;
  trackCompletionCounts?: Record<string, number>;
}

interface BadgeItem {
  id: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
  isSpecial?: boolean;
  defaultBg: string;
  defaultBorder: string;
  iconBg: string;
  titleColor: string;
  subColor: string;
  activeBorder: string;
  activeDot: string;
  completedBg: string;
}

const BADGES_3X3: BadgeItem[] = [
  {
    id: "money",
    title: "Wealth",
    sub: "การเงิน",
    icon: <Wallet size={20} />,
    defaultBg: "bg-[#06291C]",
    defaultBorder: "border-emerald-600/40",
    iconBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
    titleColor: "text-emerald-100",
    subColor: "text-emerald-400/80",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20 scale-[1.02]",
    activeDot: "bg-emerald-400 shadow-emerald-400",
    completedBg: "bg-emerald-600/25 border-emerald-400 shadow-md shadow-emerald-500/10"
  },
  {
    id: "career",
    title: "Career",
    sub: "การงาน",
    icon: <Briefcase size={20} />,
    defaultBg: "bg-[#0B1E3D]",
    defaultBorder: "border-blue-600/40",
    iconBg: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
    titleColor: "text-blue-100",
    subColor: "text-blue-400/80",
    activeBorder: "border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20 scale-[1.02]",
    activeDot: "bg-blue-400 shadow-blue-400",
    completedBg: "bg-blue-600/25 border-blue-400 shadow-md shadow-blue-500/10"
  },
  {
    id: "health",
    title: "Vitality",
    sub: "สุขภาพ",
    icon: <HeartPulse size={20} />,
    defaultBg: "bg-[#330F17]",
    defaultBorder: "border-rose-600/40",
    iconBg: "bg-rose-500/20 text-rose-300 border border-rose-400/30",
    titleColor: "text-rose-100",
    subColor: "text-rose-400/80",
    activeBorder: "border-rose-400 ring-2 ring-rose-400/50 shadow-lg shadow-rose-500/20 scale-[1.02]",
    activeDot: "bg-rose-400 shadow-rose-400",
    completedBg: "bg-rose-600/25 border-rose-400 shadow-md shadow-rose-500/10"
  },
  {
    id: "relationship",
    title: "Connection",
    sub: "ครอบครัว & เพื่อน",
    icon: <Users size={20} />,
    defaultBg: "bg-[#301B05]",
    defaultBorder: "border-amber-600/40",
    iconBg: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
    titleColor: "text-amber-100",
    subColor: "text-amber-400/80",
    activeBorder: "border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-[1.02]",
    activeDot: "bg-amber-400 shadow-amber-400",
    completedBg: "bg-amber-600/25 border-amber-400 shadow-md shadow-amber-500/10"
  },
  {
    id: "grandmaster",
    title: "Grandmaster",
    sub: "พิชิตครบ 8 มิติ",
    icon: <Crown size={24} className="text-amber-400" />,
    isSpecial: true,
    defaultBg: "bg-[#181102]",
    defaultBorder: "border-amber-500/40",
    iconBg: "bg-amber-400/20 text-amber-300",
    titleColor: "text-amber-300",
    subColor: "text-amber-400/70",
    activeBorder: "border-amber-400",
    activeDot: "bg-amber-400",
    completedBg: "bg-amber-500/25 border-amber-400",
  },
  {
    id: "mindset",
    title: "Mindset",
    sub: "พัฒนาตนเอง",
    icon: <Brain size={20} />,
    defaultBg: "bg-[#210D38]",
    defaultBorder: "border-purple-600/40",
    iconBg: "bg-purple-500/20 text-purple-300 border border-purple-400/30",
    titleColor: "text-purple-100",
    subColor: "text-purple-400/80",
    activeBorder: "border-purple-400 ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/20 scale-[1.02]",
    activeDot: "bg-purple-400 shadow-purple-400",
    completedBg: "bg-purple-600/25 border-purple-400 shadow-md shadow-purple-500/10"
  },
  {
    id: "innerpeace",
    title: "Inner Peace",
    sub: "จิตใจ & สติ",
    icon: <Sun size={20} />,
    defaultBg: "bg-[#05292B]",
    defaultBorder: "border-teal-600/40",
    iconBg: "bg-teal-500/20 text-teal-300 border border-teal-400/30",
    titleColor: "text-teal-100",
    subColor: "text-teal-400/80",
    activeBorder: "border-teal-400 ring-2 ring-teal-400/50 shadow-lg shadow-teal-500/20 scale-[1.02]",
    activeDot: "bg-teal-400 shadow-teal-400",
    completedBg: "bg-teal-600/25 border-teal-400 shadow-md shadow-teal-500/10"
  },
  {
    id: "contribution",
    title: "Contribution",
    sub: "ช่วยเหลือสังคม",
    icon: <HeartHandshake size={20} />,
    defaultBg: "bg-[#330A24]",
    defaultBorder: "border-pink-600/40",
    iconBg: "bg-pink-500/20 text-pink-300 border border-pink-400/30",
    titleColor: "text-pink-100",
    subColor: "text-pink-400/80",
    activeBorder: "border-pink-400 ring-2 ring-pink-400/50 shadow-lg shadow-pink-500/20 scale-[1.02]",
    activeDot: "bg-pink-400 shadow-pink-400",
    completedBg: "bg-pink-600/25 border-pink-400 shadow-md shadow-pink-500/10"
  },
  {
    id: "lifedesign",
    title: "Life Design",
    sub: "ออกแบบระบบชีวิต",
    icon: <Compass size={20} />,
    defaultBg: "bg-[#11133B]",
    defaultBorder: "border-indigo-600/40",
    iconBg: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30",
    titleColor: "text-indigo-100",
    subColor: "text-indigo-400/80",
    activeBorder: "border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20 scale-[1.02]",
    activeDot: "bg-indigo-400 shadow-indigo-400",
    completedBg: "bg-indigo-600/25 border-indigo-400 shadow-md shadow-indigo-500/10"
  }
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

      {/* 3x3 Colorful Bento Grid with Tailored Accents */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 relative z-10">
        {BADGES_3X3.map((item) => {
          if (item.isSpecial) {
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all relative overflow-hidden ${
                  isGrandmasterUnlocked
                    ? "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-slate-900 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : `${item.defaultBg} ${item.defaultBorder} text-slate-500`
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
                isActive
                  ? `${item.defaultBg} ${item.activeBorder} text-white`
                  : `${item.defaultBg} ${item.defaultBorder} text-slate-300 hover:brightness-125`
              }`}
            >
              {count > 1 && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[8px] font-black tracking-wider">
                  x{count}
                </div>
              )}

              {/* Icon Container with Colorful Accent */}
              <div
                className={`p-2 rounded-xl mb-1.5 transition-all duration-300 ${item.iconBg}`}
              >
                {item.icon}
              </div>

              <h4 className={`text-[11px] sm:text-xs font-black truncate ${item.titleColor}`}>
                {item.title}
              </h4>
              <span className={`text-[8px] sm:text-[9px] font-bold truncate mt-0.5 ${item.subColor}`}>
                {item.sub}
              </span>

              {/* Minimal Status Indicator */}
              <div className="absolute top-2 right-2">
                {isCompleted ? (
                  <CheckCircle2 size={15} className="text-emerald-400 drop-shadow-sm" />
                ) : isActive ? (
                  <div className={`w-2.5 h-2.5 rounded-full ${item.activeDot} shadow-sm animate-pulse`} />
                ) : (
                  <Lock size={10} className="text-slate-500/80" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
