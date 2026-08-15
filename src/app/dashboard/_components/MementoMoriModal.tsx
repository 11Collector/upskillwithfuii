"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, Send, CheckCircle2 } from "lucide-react";

interface Reflection {
  id: string;
  question: string;
  answer: string;
  answeredAt: string;
}

interface MementoMoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onSaveSetup: (birthdate: string, expectedAge: number) => Promise<void>;
  onAddReflection: (question: string, answer: string, xpReward: number) => Promise<void>;
}

import { STOIC_PROMPTS, STOIC_QUOTES, getDailyStoicQuote } from "@/data/stoicWisdom";

export const MementoMoriModal: React.FC<MementoMoriModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSaveSetup,
  onAddReflection
}) => {
  const [activeTab, setActiveTab] = useState<"countdown" | "reflect" | "history">("countdown");
  
  // Setup fields
  const [birthdate, setBirthdate] = useState("");
  const [expectedAge, setExpectedAge] = useState(80);
  const [isSavingSetup, setIsSavingSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Reflection fields
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [hasReflectedThisWeek, setHasReflectedThisWeek] = useState(false);

  // Time metrics
  const [daysLived, setDaysLived] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [weeksLived, setWeeksLived] = useState<number>(0);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(0);
  const [percentLived, setPercentLived] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Set initial fields from userData
      if (userData?.birthdate) {
        setBirthdate(userData.birthdate);
        setExpectedAge(userData.expectedAge || 80);
        setShowSettings(false);
      } else {
        setBirthdate("");
        setExpectedAge(80);
        setShowSettings(true);
      }

      // Select random prompt on open
      const randomIdx = Math.floor(Math.random() * STOIC_PROMPTS.length);
      setCurrentPromptIndex(randomIdx);
      setReflectionAnswer("");

      // Default tab based on setup state
      setActiveTab("countdown");
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (!birthdate) return;

    const birth = new Date(birthdate);
    const now = new Date();
    
    const target = new Date(birth);
    target.setFullYear(birth.getFullYear() + expectedAge);

    const timeLivedMs = now.getTime() - birth.getTime();
    const timeRemainingMs = target.getTime() - now.getTime();

    const livedDays = Math.max(0, Math.floor(timeLivedMs / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24)));
    
    setDaysLived(livedDays);
    setDaysRemaining(remainingDays);
    setWeeksLived(Math.floor(livedDays / 7));
    setWeeksRemaining(Math.max(0, Math.floor(remainingDays / 7)));

    const totalDays = expectedAge * 365.25;
    setPercentLived(Math.min(100, Math.max(0, (livedDays / totalDays) * 100)));

    // Check if reflected this week
    if (userData?.mementoReflections && userData.mementoReflections.length > 0) {
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
  }, [birthdate, expectedAge, userData]);

  if (!isOpen) return null;

  const handleSaveSetupClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdate) {
      alert("กรุณาเลือกวันเกิดของคุณ");
      return;
    }
    setIsSavingSetup(true);
    try {
      await onSaveSetup(birthdate, expectedAge);
      setShowSettings(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSetup(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionAnswer.trim()) {
      alert("กรุณาเขียนบันทึกความรู้สึกของคุณ");
      return;
    }
    setIsSavingReflection(true);
    try {
      const xpReward = hasReflectedThisWeek ? 0 : 15;
      await onAddReflection(STOIC_PROMPTS[currentPromptIndex], reflectionAnswer, xpReward);
      setReflectionAnswer("");
      setActiveTab("history");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingReflection(false);
    }
  };

  const cyclePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % STOIC_PROMPTS.length);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#F5EFEB] border border-[#E0D5C3] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.35)] overflow-hidden text-left"
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#8B5A2B]/8 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#D2B48C]/8 blur-[60px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-6 md:p-8 pb-4 flex justify-between items-center border-b border-[#E3D9CC]/80">
          <div>
            <h3 className="text-xl font-black text-[#3E2723] flex items-center gap-2">
              <Clock className="text-[#8B5A2B]" size={20} />
              ตกตะกอนความคิด
            </h3>
            <p className="text-xs font-semibold text-[#6F5B4E] mt-1">ระลึกเวลาจำกัด เพื่อโฟกัสสิ่งสำคัญที่สุดของวัน</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full text-[#8C7A6B] hover:text-[#3E2723] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        {userData?.birthdate && (
          <div className="relative z-10 px-6 md:px-8 pt-4 flex gap-2 border-b border-[#E3D9CC]/60 bg-[#F5EFEB]/60 backdrop-blur-md">
            <button
              onClick={() => { setActiveTab("countdown"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "countdown" && !showSettings
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              นาฬิกาทราย
            </button>
            <button
              onClick={() => { setActiveTab("reflect"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reflect"
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              ทบทวนชีวิต
              {!hasReflectedThisWeek && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-ping" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("history"); setShowSettings(false); }}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "text-[#8B5A2B] border-[#8B5A2B]"
                  : "text-[#8C7A6B] border-transparent hover:text-[#3E2723]"
              }`}
            >
              ประวัติ ({userData.mementoReflections?.length || 0})
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`ml-auto pb-3 text-xs font-bold transition-all cursor-pointer ${
                showSettings ? "text-[#8B5A2B]" : "text-[#8C7A6B] hover:text-[#5C4033]"
              }`}
            >
              ⚙️ ตั้งค่าวันเกิด
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-6 md:p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          
          {/* Settings / Setup View */}
          {showSettings && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveSetupClick}
              className="space-y-6"
            >
              <div className="bg-[#FCFAF7] border border-[#E3D9CC] rounded-3xl p-5 md:p-6 space-y-4">
                <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                  <Calendar size={16} className="text-[#8B5A2B]" />
                  ระบุข้อมูลเพื่อคำนวณเวลาชีวิต
                </h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#6F5B4E] uppercase tracking-wider">วันเดือนปีเกิด (ค.ศ.)</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-4 py-3 text-sm text-[#3E2723] focus:outline-none focus:border-[#8B5A2B] transition-colors w-full cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-[#6F5B4E] uppercase tracking-wider">
                        เป้าหมายอายุขัย (ปี)
                      </label>
                      <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E0D5C3] rounded-lg px-2 py-1">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={expectedAge}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setExpectedAge(val);
                          }}
                          className="w-10 bg-transparent text-right font-black text-xs text-[#8B5A2B] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] font-black text-[#8C7A6B]">ปี</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="120"
                      value={expectedAge > 120 ? 120 : (expectedAge < 50 ? 50 : expectedAge)}
                      onChange={(e) => setExpectedAge(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B5A2B]"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-[#8C7A6B] px-0.5">
                      <span>50 ปี</span>
                      <span>80 ปี (เฉลี่ย)</span>
                      <span>120 ปี</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {userData?.birthdate && (
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-3.5 text-xs font-black text-[#5C4033] bg-[#FCFAF7] hover:bg-[#FAF4EC] rounded-full transition-all text-center border border-[#E0D5C3] cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingSetup}
                  className="flex-1 py-3.5 text-xs font-black text-white bg-gradient-to-r from-[#8B5A2B] to-[#A0522D] hover:from-[#724a23] hover:to-[#8b4513] rounded-full transition-all text-center disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  <span>บันทึกข้อมูลตั้งค่า {!userData?.birthdate && "(+15 XP)"}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Active Tab Content */}
          {!showSettings && (
            <AnimatePresence mode="wait">
              {activeTab === "countdown" && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Lifespan Stats Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl text-left">
                      <span className="text-[9px] font-black text-[#6F5B4E] uppercase tracking-widest block mb-1">เวลาที่คุณใช้ไปแล้ว</span>
                      <p className="text-2xl font-black text-[#3E2723] mt-1 leading-none">{daysLived.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-[#6F5B4E] mt-1.5 block">วัน ({weeksLived.toLocaleString()} สัปดาห์)</span>
                    </div>
                    
                    <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl text-left">
                      <span className="text-[9px] font-black text-[#6F5B4E] uppercase tracking-widest block mb-1">เวลาที่เหลืออยู่โดยเฉลี่ย</span>
                      <p className="text-2xl font-black text-[#8B5A2B] mt-1 leading-none">{daysRemaining.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-[#6F5B4E] mt-1.5 block">วัน ({weeksRemaining.toLocaleString()} สัปดาห์)</span>
                    </div>
                  </div>

                  {/* Visual Progress ring and countdown */}
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-[#FAF6F0] border border-[#E5DEC9] p-6 rounded-[2rem]">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="transparent"
                          stroke="#EADFCF"
                          strokeWidth="6"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="transparent"
                          stroke="url(#modal-memento-grad-brown)"
                          strokeWidth="8"
                          strokeDasharray="339.29"
                          strokeDashoffset={339.29 - (percentLived / 100) * 339.29}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="modal-memento-grad-brown" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5A2B" />
                            <stop offset="100%" stopColor="#D2B48C" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-center">
                        <span className="text-2xl font-black text-[#3E2723] leading-none block">{percentLived.toFixed(1)}%</span>
                        <span className="text-[8px] font-black text-[#8C7A6B] uppercase tracking-widest block mt-1">Lived</span>
                      </div>
                    </div>

                    <div className="text-left space-y-2">
                      <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                        <Clock size={16} className="text-[#8B5A2B]" />
                        ความเร็วชีวิตของคุณ
                      </h4>
                      <p className="text-xs text-[#5C4033] font-medium leading-relaxed">
                        คุณใช้ชีวิตไปแล้วประมาณ <span className="text-[#8B5A2B] font-extrabold">{percentLived.toFixed(1)}%</span> ของอายุขัยคาดหวัง ({expectedAge} ปี) หากคิดเป็นสัปดาห์ คุณเหลือเวลาประมาณ <span className="text-[#8B5A2B] font-extrabold">{weeksRemaining.toLocaleString()} สัปดาห์</span> ในการสร้างสรรค์ ทำสิ่งที่ดีงาม และมีความสุขกับผู้คนรอบข้าง
                      </p>
                    </div>
                  </div>

                  {/* ฤดูกาลของชีวิต (Seasons of Life) */}
                  <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-5 rounded-3xl space-y-4 text-left">
                    <h4 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
                      <Calendar size={16} className="text-[#8B5A2B]" />
                      ฤดูกาลชีวิตของคุณ
                    </h4>
                    
                    {(() => {
                      const age = daysLived / 365.25;
                      const seasons = [
                        {
                          name: "ฤดูใบไม้ผลิ",
                          label: "0-20 ปี: เรียนรู้และเติบโต",
                          icon: "🌱",
                          range: [0, 20],
                          activeBg: "bg-gradient-to-tr from-emerald-500/15 via-emerald-400/5 to-teal-500/10 border-emerald-600/50 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.25)]",
                          badgeBg: "bg-emerald-600 text-white",
                          titleColor: "text-emerald-950"
                        },
                        {
                          name: "ฤดูร้อน",
                          label: "20-40 ปี: สร้างตัวและลุยชีวิต",
                          icon: "☀️",
                          range: [20, 40],
                          activeBg: "bg-gradient-to-tr from-amber-500/15 via-orange-400/5 to-yellow-500/10 border-amber-600/50 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.25)]",
                          badgeBg: "bg-amber-600 text-white",
                          titleColor: "text-amber-950"
                        },
                        {
                          name: "ฤดูใบไม้ร่วง",
                          label: "40-60 ปี: มั่นคงและตกตะกอน",
                          icon: "🍂",
                          range: [40, 60],
                          activeBg: "bg-gradient-to-tr from-orange-500/15 via-amber-600/5 to-rose-500/10 border-orange-600/50 shadow-[0_4px_16px_-4px_rgba(249,115,22,0.25)]",
                          badgeBg: "bg-orange-600 text-white",
                          titleColor: "text-orange-950"
                        },
                        {
                          name: "ฤดูหนาว",
                          label: "60 ปีขึ้นไป: สงบและส่งมรดกชีวิต",
                          icon: "❄️",
                          range: [60, 150],
                          activeBg: "bg-gradient-to-tr from-sky-500/15 via-blue-400/5 to-indigo-500/10 border-sky-600/50 shadow-[0_4px_16px_-4px_rgba(14,165,233,0.25)]",
                          badgeBg: "bg-sky-600 text-white",
                          titleColor: "text-sky-950"
                        }
                      ];

                      return (
                        <div className="grid grid-cols-2 gap-2.5">
                          {seasons.map((season, idx) => {
                            const isActive = age >= season.range[0] && age < season.range[1];
                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
                                  isActive
                                    ? `${season.activeBg} scale-[1.02] relative z-10`
                                    : "bg-[#FAF7F2]/60 border-[#E3D9CC]/60 opacity-40 hover:opacity-75"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 justify-between">
                                  <span className={`text-xs font-black ${isActive ? season.titleColor : "text-[#3E2723]"}`}>
                                    {season.name}
                                  </span>
                                  <span className="text-sm">{season.icon}</span>
                                </div>
                                <span className="text-[9px] font-bold text-[#6F5B4E] mt-2 block leading-snug">
                                  {season.label}
                                </span>
                                {isActive && (
                                  <span className={`inline-block self-start mt-2 px-1.5 py-0.5 ${season.badgeBg} text-white text-[7px] font-black uppercase tracking-wider rounded-md shadow-2xs`}>
                                    ช่วงอายุของคุณ
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stoic Quote of the Day */}
                  {(() => {
                    const today = new Date();
                    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                    const quote = STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length];

                    return (
                      <div className="relative overflow-hidden bg-gradient-to-tr from-[#FAF5ED] to-[#FCFAF7] border border-[#E5DEC9] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[8px] font-black text-[#8B5A2B]/70 tracking-widest uppercase block mb-2">ข้อเตือนใจของวัน (Stoic Wisdom)</span>
                        <p className="text-xs font-semibold text-[#5C4033] leading-relaxed italic">
                          "{quote.text}"
                        </p>
                        <p className="text-[9px] font-black text-[#8B5A2B] mt-2 text-right">
                          — {quote.author}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Action Banner for Reflections */}
                  {!hasReflectedThisWeek && (
                    <div 
                      onClick={() => setActiveTab("reflect")}
                      className="bg-gradient-to-r from-[#FAF2E6] to-[#FCFAF7] border border-[#EADFCF] p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#8B5A2B]/40 transition-all animate-pulse"
                    >
                      <div className="p-2 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full shrink-0">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-black text-[#8B5A2B]">เขียนบันทึกทบทวนชีวิตประจำสัปดาห์ของคุณ</p>
                        <p className="text-[10px] text-[#7A5B3D]/80 font-bold mt-0.5">รับรางวัล +15 XP เพื่อสะสมการตกตะกอนความคิด</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "reflect" && (
                <motion.div
                  key="reflect"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-[#FCFAF7] border border-[#E3D9CC] rounded-3xl p-5 md:p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#6F5B4E]">คำถามชวนคิดเพื่อคุณ</span>
                      <button
                        onClick={cyclePrompt}
                        className="text-[10px] font-black text-[#8B5A2B] hover:text-[#734A22] transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        🔄 เปลี่ยนคำถาม
                      </button>
                    </div>

                    <p className="text-base font-black text-[#3E2723] leading-relaxed">
                      "{STOIC_PROMPTS[currentPromptIndex]}"
                    </p>
                    
                    <textarea
                      value={reflectionAnswer}
                      onChange={(e) => setReflectionAnswer(e.target.value)}
                      placeholder="เขียนบันทึกความรู้สึกลึกๆ ความคิด หรือสิ่งที่คุณตระหนักได้ตรงนี้..."
                      className="w-full h-32 bg-[#FAF7F2] border border-[#E0D5C3] rounded-2xl p-4 text-xs font-bold text-[#3E2723] placeholder-[#A09080] focus:outline-none focus:border-[#8B5A2B] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleSaveReflection}
                    disabled={isSavingReflection || !reflectionAnswer.trim()}
                    className="w-full py-4 text-xs font-black text-white bg-gradient-to-r from-[#8B5A2B] to-[#A0522D] hover:from-[#724a23] hover:to-[#8b4513] rounded-full transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Send size={14} />
                    <span>
                      {hasReflectedThisWeek 
                        ? "บันทึกคำตอบลง Timeline" 
                        : "บันทึกและรับ 15 XP ✨"
                      }
                    </span>
                  </button>

                  {hasReflectedThisWeek && (
                    <p className="text-[10px] text-[#8C7A6B] font-bold text-center">
                      * คุณได้รับ XP ในสัปดาห์นี้ไปแล้ว แต่สามารถเขียนบันทึกเพิ่มเติมเพื่อเก็บสติได้ตลอดเวลา
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 text-left"
                >
                  {userData.mementoReflections && userData.mementoReflections.length > 0 ? (
                    <div className="space-y-6 relative pl-4 border-l-2 border-[#E5DEC9] ml-2 py-2">
                      {userData.mementoReflections.map((ref: Reflection, idx: number) => (
                        <div key={ref.id || idx} className="relative space-y-2 group">
                          {/* Dot marker on timeline */}
                          <div className="absolute -left-[25px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#FAF6F0] border-2 border-[#8B5A2B] shadow-md group-hover:bg-[#8B5A2B] transition-colors" />
                          
                          <div className="flex justify-between items-baseline gap-4">
                            <span className="text-[9px] font-black text-[#5C4033] bg-[#EADFCF] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                              {new Date(ref.answeredAt).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>

                          <div className="bg-[#FCFAF7] border border-[#E3D9CC] p-4 rounded-2xl">
                            <p className="text-[11px] font-black text-[#8B5A2B] leading-relaxed mb-2">Q: {ref.question}</p>
                            <p className="text-xs font-bold text-[#3E2723] leading-relaxed whitespace-pre-line">"{ref.answer}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-14 h-14 bg-[#FCFAF7] border border-[#E5DEC9] rounded-full flex items-center justify-center text-[#8C7A6B] mx-auto shadow-inner">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#3E2723]">ยังไม่มีบันทึกการทบทวน</h4>
                        <p className="text-xs text-[#6F5B4E] mt-1">เริ่มต้นบันทึกความรู้สึกในการระลึกถึงเวลาจำกัด เพื่อเก็บบันทึกของคุณ</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </motion.div>
    </div>
  );
};
