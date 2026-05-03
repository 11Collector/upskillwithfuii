import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, CheckCircle2, LogOut, Info, X, Camera, Flame, Zap, Star, BookOpen, BrainCircuit, PieChart, Users, Wallet, Target } from 'lucide-react';
import { AvatarDisplay } from '@/utils/dashboardHelpers';
import { DISC_DATA, MONEY_DATA, PET_DATA } from '@/data/constants';

interface OverviewTabProps {
  user: any;
  isEditingName: boolean;
  newName: string;
  setIsEditingName: (val: boolean) => void;
  setNewName: (val: string) => void;
  handleUpdateName: (val: string) => void;
  handleLogout: () => void;
  currentLevel: number;
  currentLevelXP: number;
  showLevelInfo: boolean;
  setShowLevelInfo: (val: boolean) => void;
  getLevelTitle: (level: number) => string;
  totalXP: number;
  handleGenderChange: (gender: string) => void;
  gender: string;
  setShowShareModal: (val: boolean) => void;
  streakCount: number;
  perfectWeeks: number;
  lastDisc: any;
  lastMoney: any;
  lastLibrarySoul: any;
  totalWeeklyScore: number;
  rankInfo: any;
  relativeWeekInfo: any;
  weeklyData: any;
}

export const DashboardOverviewTab: React.FC<OverviewTabProps> = ({
  user,
  isEditingName,
  newName,
  setIsEditingName,
  setNewName,
  handleUpdateName,
  handleLogout,
  currentLevel,
  currentLevelXP,
  showLevelInfo,
  setShowLevelInfo,
  getLevelTitle,
  totalXP,
  handleGenderChange,
  gender,
  setShowShareModal,
  streakCount,
  perfectWeeks,
  lastDisc,
  lastMoney,
  lastLibrarySoul,
  totalWeeklyScore,
  rankInfo,
  relativeWeekInfo,
  weeklyData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

      <header className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex flex-col group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] border border-slate-800 hover:border-slate-700 overflow-hidden">

        {/* 💡 ฉากหลังและเอฟเฟกต์แสง */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 group-hover:h-3 transition-all duration-300" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 blur-[80px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-10 -right-20 opacity-10 rotate-12 hidden md:block transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110">
            <BrainCircuit size={300} strokeWidth={1} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full w-full">

          {/* 📊 1. Top Navbar (🌟 แสดงเฉพาะบน Desktop เท่านั้น - hidden sm:flex) */}
          <div className="hidden sm:flex relative z-[999] flex-row justify-between items-center gap-4 w-full mb-8">

            {/* Desktop: Profile Box */}
            <div className="flex items-center justify-between bg-white/5 p-1.5 pl-2 pr-4 rounded-full border border-white/10 backdrop-blur-sm shadow-xl w-auto min-w-[220px] hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 min-w-0 text-left flex-1">
                <img
                  src={user?.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border-2 border-slate-50 shadow-md shrink-0"
                />

                {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      id="desktopNameInput"
                      autoFocus
                      defaultValue={newName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateName((e.target as HTMLInputElement).value);
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      className="bg-slate-800 border border-blue-500/50 rounded-md px-2 py-0.5 text-[11px] text-white outline-none w-full shadow-inner focus:border-blue-500 transition-all"
                    />
                    <button
                      onClick={() => {
                        const val = (document.getElementById('desktopNameInput') as HTMLInputElement)?.value;
                        handleUpdateName(val);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 p-0.5"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="truncate pr-2 cursor-pointer group/name flex-1 min-w-0"
                    onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}
                    title="คลิกเพื่อเปลี่ยนชื่อ"
                  >
                    <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      {user?.displayName}
                      {/* ✨ ไอคอนวิ้งๆ บอกใบ้ว่ากดแก้ได้ */}
                      <Sparkles size={10} className="text-slate-500 group-hover/name:text-yellow-400 transition-colors" />
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium truncate">{user?.email}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all group/btn shrink-0 ml-1"
              >
                <LogOut size={14} className="group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 📊 1.2 Level Box (Desktop) */}
            <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-auto min-w-[220px] hover:border-yellow-500/50 transition-colors">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                <Trophy size={14} className="fill-current" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white">LV.{currentLevel}</span>
                  <button onClick={() => setShowLevelInfo(!showLevelInfo)} className="text-slate-400 hover:text-yellow-400 transition-colors shrink-0">
                    <Info size={12} />
                  </button>
                </div>
                <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-0.5 truncate">
                  {getLevelTitle(currentLevel)}
                </p>
                <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden flex items-center relative">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 relative" style={{ width: `${currentLevelXP}%` }} />
                </div>
              </div>

              {/* 🎯 Level Info Modal: เด้งกลางจอแบบ Premium */}
              <AnimatePresence>
                {showLevelInfo && (
                  /* 1. Backdrop: ฉากหลังดำจางๆ และเบลอ */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
                    onClick={() => setShowLevelInfo(false)} // คลิกข้างนอกเพื่อปิด
                  >
/* 2. Modal Content: เด้งขึ้นมาจากด้านล่างนิดๆ */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-sm bg-slate-800 border border-slate-600 p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-left overflow-hidden"
                      onClick={(e) => e.stopPropagation()} // กันบั๊ก: คลิกข้างในไม่ต้องปิด
                    >
                      {/* ✨ ตกแต่งด้วยแสงฟุ้งมุมขวาบนเหมือนหน้าบอร์ด */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-black text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-yellow-400" />
                            ระบบ Level การเรียนรู้
                          </h4>
                          <button
                            onClick={() => setShowLevelInfo(false)}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                          ทุกๆ <span className="text-yellow-400 font-bold">100 XP</span> ที่สะสมจากการทำภารกิจ จะถูกนำมาอัป Level เพื่อปลดล็อกสิทธิพิเศษต่างๆ!
                        </p>

                        <ul className="space-y-4 text-[13px] font-bold text-slate-300 mb-8">
                          <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-slate-500 transition-all">
                            <span className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]" />
                            <span>LV 1-9 : Rookie Upskiller</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-yellow-500 transition-all">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            <span>LV 10-19 : Master</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-orange-500 transition-all">
                            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            <span>LV 20-29 : Life Architect</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-red-500 transition-all">
                            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <span>LV 30+ : Legacy</span>
                          </li>
                        </ul>

                        {/* ✨ แถบสรุป XP ด้านล่าง (ไฮไลต์ให้เด่น) */}
                        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-5 rounded-3xl border border-slate-500 flex justify-between items-center shadow-inner">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progress</span>
                            <span className="text-sm font-bold text-white">แต้มสะสมทั้งหมด</span>
                          </div>
                          <div className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                            {totalXP} <span className="text-xs">XP</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 🎯 2. Hero Section (จัดข้อความซ้าย อวตาร+Badge ขวา) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-6 mb-6 relative z-30">

            {/* ⬅️ ฝั่งซ้าย: ข้อความและปุ่มจัดการ */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight mb-3 mt-4 sm:mt-0">
                ยินดีต้อนรับกลับมา <br className="hidden sm:block lg:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-extrabold">{user?.displayName?.split(' ')[0]} 🚀</span>
              </h1>
              <p className="text-slate-300 text-sm xl:text-base font-medium max-w-md mx-auto lg:mx-0 mb-5">เช็กภาพรวมและอัพเดตเป้าหมายชีวิตของคุณ เพื่อการเติบโตในทุกๆ วัน</p>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                {/* Toggle เพศ */}
                <div className="flex items-center bg-white/5 rounded-full p-0.5 backdrop-blur-md border border-white/10 shadow-inner w-fit">
                  <button onClick={() => handleGenderChange("male")} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all duration-300 ${gender === "male" ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                    <span className="text-[10px]">👨🏻</span> ชาย
                  </button>
                  <button onClick={() => handleGenderChange("female")} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all duration-300 ${gender === "female" ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-[0_0_8px_rgba(236,72,153,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                    <span className="text-[10px]">👩🏻</span> หญิง
                  </button>
                </div>

                {/* ปุ่ม Get Player Card */}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-500/50 rounded-full transition-all duration-300 group/share">
                  <Camera size={12} className="text-slate-400 group-hover/share:text-yellow-400 group-hover/share:rotate-12 transition-all" />
                  <span className="text-[9px] font-black text-slate-500 group-hover/share:text-yellow-400 uppercase tracking-[0.2em] mt-0.5">Player Card</span>
                </motion.button>
              </div>

              {/* 📱 Mobile Only: Level & Logout Row (🌟 แสดงเฉพาะบนมือถือ) */}
              <div className="flex sm:hidden items-center justify-center gap-2 w-full mt-6 relative z-[999]">

                {/* 🎯 Mobile: Level Box & Edit Name */}
                <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-full max-w-[250px] hover:border-yellow-500/50 transition-colors">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shrink-0">
                    <Trophy size={14} className="fill-current" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">

                    {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                    {isEditingName ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          defaultValue={newName}
                          onBlur={(e) => {
                            // Do not update automatically on blur to avoid conflict, just close
                            setIsEditingName(false);
                          }}
                          className="bg-slate-700 border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-full"
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                        />
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white truncate flex items-center gap-1">
                            {user?.displayName} <Sparkles size={10} className="text-yellow-400" />
                          </span>
                          {/* ปุ่ม Info สำหรับเปิด Modal กลางจอ */}
                          <button onClick={(e) => { e.stopPropagation(); setShowLevelInfo(true); }} className="text-slate-400 p-1">
                            <Info size={14} />
                          </button>
                        </div>
                        <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-0.5">
                          {/* ✅ แก้ไขจุดนี้: เปลี่ยนจาก .split(' ')[0] เป็น .split(' (')[0] เพื่อให้ได้ชื่อเต็มภาษาอังกฤษ */}
                          LV.{currentLevel} {getLevelTitle(currentLevel).split(' (')[0]}
                        </p>
                      </div>
                    )}

                    <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${currentLevelXP}%` }} />
                    </div>
                  </div>
                </div>

                {/* Mobile: Logout Button */}
                <button onClick={handleLogout} className="p-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full shadow-lg transition-all shrink-0">
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            {/* ➡️ ฝั่งขวา: Avatar + Pet + Badge (รวมร่างกันสมบูรณ์!) */}
            <div className="flex-shrink-0 relative w-full lg:w-auto flex flex-col items-center mt-4 lg:mt-0 lg:ml-8">
              {/* 🏗️ Container หลัก: เพิ่ม -translate-x-8 (หรือตามใจชอบ) เพื่อดึงทั้งกลุ่มไปทางซ้าย */}
              <div className="relative mb-6 flex justify-center items-end scale-95 sm:scale-100 origin-bottom -translate-x-2 sm:-translate-x-10">

                {/* 1. รูป Avatar หลัก */}
                <div className="relative z-10 translate-y-[2px]">
                  <AvatarDisplay currentLevel={currentLevel} gender={gender} streak={streakCount} />
                </div>

                {/* 🐾 สัตว์เลี้ยง (หน้า Dashboard) - โชว์ทันที ไม่มี Fade-in */}
                {lastMoney?.resultKey && (
                  <div className="absolute bottom-0 left-1/2 translate-x-[-15%] sm:translate-x-[0%] z-20 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none">
                    <img
                      src={PET_DATA[lastMoney.resultKey]?.img || PET_DATA.DEFAULT.img}
                      alt={PET_DATA[lastMoney.resultKey]?.name}
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain object-bottom animate-bounce-slow drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}
              </div>

              {/* ✨ แถบ Badge ทั้ง 3 (พอดี 1 บรรทัดบนมือถือ) */}
              <div className="flex flex-col items-center gap-2.5 w-full px-2">
                {/* Row 1: Streak & Perfect Week */}
                <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 w-full">
                  {/* Streak Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                    <Flame size={12} className="text-orange-500 fill-current shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-black text-orange-400 uppercase tracking-wide whitespace-nowrap">
                      {streakCount} Days
                    </span>
                  </div>

                  {/* Perfect Week Badge */}
                  {perfectWeeks > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-amber-400/20">
                      <Trophy size={12} className="text-amber-400 shrink-0" />
                      <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wide whitespace-nowrap">
                        {perfectWeeks} Perfect
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 2: DISC, Money, Library of Souls, Perfect Week */}
                {(lastDisc || lastMoney || lastLibrarySoul || perfectWeeks > 0) && (
                  <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 w-full flex-wrap">
                    {/* DISC Badge */}
                    {lastDisc && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                        <Zap size={12} className="text-blue-400 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-black text-blue-300 tracking-wide whitespace-nowrap">
                          {DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle}
                        </span>
                      </div>
                    )}

                    {/* Money Badge */}
                    {lastMoney && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                        <Star size={12} className="text-amber-400 fill-current shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wide whitespace-nowrap">
                          {MONEY_DATA[lastMoney.resultKey]?.title}
                        </span>
                      </div>
                    )}

                    {/* Library of Souls Badge */}
                    {lastLibrarySoul && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-emerald-500/20">
                        <BookOpen size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-wide whitespace-nowrap">
                          {lastLibrarySoul.type}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🌟 3. Bottom Bar */}
          <div className="w-full mt-auto pt-4 border-t border-white/5 flex flex-col items-center relative z-20">

            <div className="relative flex items-center justify-between w-full max-w-[380px] mb-4 h-8 px-2">
              {/* 1. เส้นพื้นหลัง (เทาอ่อน) */}
              <div className="absolute left-2 right-2 h-[1px] bg-white/10 top-1/2 -translate-y-1/2" />

              {/* 🌟 2. [FIX] กล่องใสรองรับเส้นส้ม */}
              <div className="absolute left-2 right-2 h-[1px] top-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${streakCount === 0 ? 0 : ((streakCount % 7 === 0 && streakCount > 0 ? 7 : streakCount % 7) - 1) / 6 * 100}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 origin-left shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                />
              </div>

              {/* 3. จุดวงกลมทั้ง 7 วัน */}
              {[1, 2, 3, 4, 5, 6, 7].map((dot) => {
                const currentProgress = streakCount % 7 === 0 && streakCount > 0 ? 7 : streakCount % 7;
                const isFilled = dot <= currentProgress;
                const isLastDot = dot === 7;
                return (
                  <div key={dot} className="relative z-10">
                    <div className={`w-2 h-2 rounded-full transition-all duration-1000 border ${isFilled ? 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)] scale-125' : 'bg-slate-900 border-white/20'}`} />
                    {isLastDot && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center group/reward">
                        <span className={`text-[8px] font-black tracking-tighter transition-colors ${isFilled ? 'text-yellow-400' : 'text-slate-500 hover:text-orange-400'}`}>{isFilled ? 'DONE' : '+100XP'}</span>
                        <div className={`w-[1px] h-2 ${isFilled ? 'bg-yellow-400' : 'bg-slate-800'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 opacity-60">Complete Daily Quest 7 days for +100 XP Bonus</p>
          </div>

        </div>
      </header>

      <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden group transition-all duration-500 hover:border-slate-700">
        {/* ✨ แสงฟุ้งพื้นหลัง (Premium Glow) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 blur-[80px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-[60px] rounded-full pointer-events-none z-0" />

        {/* เส้นขอบสีด้านบน */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 opacity-80" />

        {/* 🏆 Absolute Badges (Top Right) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex flex-col items-end gap-1.5"
        >
          <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center gap-2 ${rankInfo.bg} ${rankInfo.border} ${rankInfo.color} border-white/10`}>
            <span className="text-white/40 font-bold tracking-tight">TOTAL</span>
            <span className="text-white">{totalWeeklyScore} / 42</span>
          </div>
          <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 ${rankInfo.bg} ${rankInfo.border} ${rankInfo.color} border-white/10 whitespace-nowrap`}>
            <span className="shrink-0">{rankInfo.emoji}</span>
            <span className="text-white shrink-0">{rankInfo.name}</span>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-col h-full">

          <div className="mb-8 pr-28 sm:pr-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                <Zap className="text-yellow-400 fill-current" size={18} />
                {relativeWeekInfo.label}
              </h2>
              <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.1em] mt-1">
                ช่วงวันที่ {relativeWeekInfo.range}
              </p>
            </div>
          </div>

          {/* 2. Core Identity (4 วงกลมหลัก - สื่อถึงความสมดุล) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Wheel", val: weeklyData.wheel, color: "text-red-500", icon: <PieChart size={14} /> },
              { label: "DISC", val: weeklyData.disc, color: "text-blue-400", icon: <Users size={14} /> },
              { label: "Money", val: weeklyData.money, color: "text-amber-400", icon: <Wallet size={14} /> },
              { label: "Library", val: weeklyData.library, color: "text-teal-400", icon: <BookOpen size={14} /> }
            ].map((item, i) => {
              const radius = 20;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (circumference * Math.min(item.val, 7)) / 7;

              return (
                <div key={i} className="bg-white/5 rounded-[2rem] p-3 border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="24" cy="24" r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
                      <motion.circle
                        cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        className={item.color}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                      />
                    </svg>
                    <div className="absolute opacity-40">{item.icon}</div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{item.label}</span>
                  <span className="text-xs font-bold text-slate-200">{item.val}/7</span>
                </div>
              );
            })}
          </div>

          {/* 3. Combined Momentum Section (หลอดพลังงานรวม Wild + Challenge) */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group/momentum">
              {/* Background Sparkle Effect */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/momentum:opacity-20 transition-opacity">
                <Flame size={40} className="text-orange-400" />
              </div>

              <div className="flex justify-between items-end mb-3 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] block mb-1">Daily Momentum</span>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles size={14} className="text-yellow-400" />
                    พลังขับเคลื่อนชีวิต
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">
                    {(Number(weeklyData.wildcard) || 0) + (Number(weeklyData.challenge) || 0)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 ml-1">/ 14</span>
                </div>
              </div>

              <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/50 shadow-inner relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((weeklyData.wildcard + weeklyData.challenge) / 14) * 100}%` }}
                  transition={{ duration: 1.5, delay: 0.8, type: "spring" }}
                  className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] relative"
                >
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-white/20 w-full h-[40%] top-0" />
                </motion.div>
              </div>

              <p className="text-[10px] text-slate-500 font-medium mt-3 leading-relaxed">
                รวมการจัดการสิ่งจุกจิก (Wildcard) และความท้าทายใหม่ (Challenge)
              </p>
            </div>
          </div>

          {/* 4. Motivational Footer (เวอร์ชันรองรับ First Week) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="space-y-2">
              {/* Table Header (Grid 3 Columns) */}
              <div className="grid grid-cols-[4rem_1fr_2fr] gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-800/50 px-1">
                <span>คะแนน</span>
                <span className="text-center sm:text-left">Rank Name</span>
                <span className="text-right sm:text-left">คำอธิบาย</span>
              </div>

              {[
                { score: "0 - 10", emoji: "🛡️", name: "Survivor", desc: "เน้นประคองตัวให้รอดสัปดาห์นี้" },
                { score: "11 - 20", emoji: "⚔️", name: "Warrior", desc: "เริ่มบุกและจัดการชีวิตได้ดีขึ้น" },
                { score: "21 - 32", emoji: "💎", name: "Elite", desc: "ชีวิตสมดุลและมีวินัยสูงมาก" },
                { score: "33 - 42", emoji: "👑", name: "Legend", desc: "ผู้จารึกตำนานวินัยที่แท้จริง" },
              ].map((rank, idx) => {
                const isActive = totalWeeklyScore >= parseInt(rank.score.split(' - ')[0]) && totalWeeklyScore <= parseInt(rank.score.split(' - ')[1]);

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-[4rem_1fr_2fr] gap-2 items-center py-1.5 px-1 transition-opacity duration-300 ${isActive ? 'text-white opacity-100' : 'text-slate-500 opacity-40'}`}
                  >
                    <span className="text-[11px] font-black tracking-tight">{rank.score}</span>
                    <span className="text-[11px] font-bold truncate pr-1 text-center sm:text-left">{rank.emoji} {rank.name}</span>
                    <span className="text-[10px] font-medium italic text-right sm:text-left leading-tight break-words">{rank.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
