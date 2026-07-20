"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Flame,
  Download,
  Share2,
  RotateCcw,
  Coffee,
  ArrowRight,
  Check,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  BarChart2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  PERSONALITY_ZERO_DATA,
  TraitKey,
  TraitScores,
  calculatePersonalityResult,
  LOADING_SLOGANS,
  PROGRESS_MICRO_COPY,
  PersonaResult,
} from "@/data/personalityZeroData";
import { PersonalityZeroShareCard } from "./_components/PersonalityZeroShareCard";
import { TipJarModal } from "./_components/TipJarModal";
import { PersonalityZeroComments } from "./_components/PersonalityZeroComments";

type ScreenState = "LANDING" | "QUIZ" | "CALCULATING" | "RESULT";

const INITIAL_SCORES: TraitScores = {
  MONK: 0,
  FUCK: 0,
  ZZZZ: 0,
  WORK: 0,
  NPC: 0,
  HELL: 0,
};

export default function PersonalityZeroPage() {
  const [screen, setScreen] = useState<ScreenState>("LANDING");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<TraitScores>(INITIAL_SCORES);
  const [winningTrait, setWinningTrait] = useState<TraitKey | null>(null);

  // Global Stats state (Real DB counts)
  const [totalPlays, setTotalPlays] = useState<number>(0);
  const [traitCounts, setTraitCounts] = useState<Record<string, number>>({
    MONK: 0,
    FUCK: 0,
    ZZZZ: 0,
    WORK: 0,
    NPC: 0,
    HELL: 0,
  });
  const [traitPercentages, setTraitPercentages] = useState<Record<string, number>>({
    MONK: 0,
    FUCK: 0,
    ZZZZ: 0,
    WORK: 0,
    NPC: 0,
    HELL: 0,
  });

  // Loading Screen Interval Slogan
  const [sloganIndex, setSloganIndex] = useState(0);

  // Modals & UI helpers
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isTipJarOpen, setIsTipJarOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Share Card Ref for html-to-image
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Fetch initial global stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/personalityzero/stats", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        if (typeof data.totalPlays === "number") setTotalPlays(data.totalPlays);
        if (data.traits) setTraitCounts(data.traits);
        if (data.percentages) setTraitPercentages(data.percentages);
      }
    } catch (e) {
      console.error("Failed to fetch PersonalityZero stats:", e);
    }
  };

  // Rotating slogans on calculating screen
  useEffect(() => {
    if (screen !== "CALCULATING") return;

    const sloganTimer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % LOADING_SLOGANS.length);
    }, 600);

    const finishTimer = setTimeout(() => {
      const result = calculatePersonalityResult(scores);
      setWinningTrait(result);
      setScreen("RESULT");

      // Record result to stats in background
      fetch("/api/personalityzero/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trait: result }),
      }).then(() => fetchStats()).catch(() => {});
    }, 2600);

    return () => {
      clearInterval(sloganTimer);
      clearTimeout(finishTimer);
    };
  }, [screen, scores]);

  const handleStartQuiz = () => {
    setScores(INITIAL_SCORES);
    setCurrentQuestionIndex(0);
    setWinningTrait(null);
    setScreen("QUIZ");
  };

  const handleResetToLanding = () => {
    setScores(INITIAL_SCORES);
    setCurrentQuestionIndex(0);
    setWinningTrait(null);
    setScreen("LANDING");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOption = (trait: TraitKey) => {
    setScores((prev) => ({
      ...prev,
      [trait]: (prev[trait] || 0) + 1,
    }));

    if (currentQuestionIndex + 1 < PERSONALITY_ZERO_DATA.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setScreen("CALCULATING");
    }
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `personalityzero-${winningTrait || "result"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("ไม่สามารถดาวน์โหลดรูปภาพได้ในขณะนี้ กรุณาลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://upskilleveryday.com/personalityzero";
    const shareData = {
      title: "PersonalityZero — แบบประเมินจิต (หลุด)",
      text: `ฉันได้สายพันธุ์ "${winningTrait ? PERSONALITY_ZERO_DATA.results[winningTrait].title : ""}"! มาลองวัดความไร้สาระกัน 🤪`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {}
    }

    // Fallback to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const activeQuestion = PERSONALITY_ZERO_DATA.questions[currentQuestionIndex];
  const persona: PersonaResult | null = winningTrait
    ? PERSONALITY_ZERO_DATA.results[winningTrait]
    : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-center selection:bg-red-600 selection:text-white relative overflow-hidden py-4 sm:py-6">
      {/* Background Glows & Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-red-100/50 via-neutral-50/30 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red-50 blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Body Flow */}
      <main className="relative z-10 max-w-md mx-auto w-full px-5 py-4 flex-1 flex flex-col justify-center">
        {/* ===================================================
            SCREEN 1: LANDING PAGE
           =================================================== */}
        {screen === "LANDING" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center py-4 space-y-6"
          >
            {/* Giant Hero Logo Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-80 sm:w-[420px] max-w-[380px] sm:max-w-[440px] h-auto mx-auto drop-shadow-[0_15px_35px_rgba(220,38,38,0.25)]"
            >
              <img
                src="/assets/personalityzero/logozero.png"
                alt="PersonalityZero Logo"
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            {/* Tagline Badge & Short Title */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black tracking-wide">
                <Sparkles size={14} className="animate-spin-slow text-red-600" />
                <span>อย่าคาดหวังสาระ เพราะคนทำก็ไม่มี</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                ทำไปทำไม?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-neutral-700 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                งานกองเต็มโต๊ะไม่ยอมทำ แอบหนีงานมาใช่มั้ย ทำๆไปเหอะ <br />
                ไม่บอกหรอกว่าทำไปทำไม เพราะคนสร้างก็ยังไม่รู้เลย <br />
                <span className="text-red-600 font-black">แบบประเมินที่แม่นที่สุด ที่ไม่ต้องมีใครรับรอง</span>
              </p>
            </div>

            {/* Primary CTA */}
            <div className="pt-1 space-y-2.5">
              <button
                onClick={handleStartQuiz}
                className="max-w-[240px] sm:max-w-[280px] w-full py-2.5 sm:py-3 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md shadow-red-600/25 transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                <span>ทำไปทำไม ?</span>
                <ArrowRight size={16} />
              </button>
              <div className="max-w-[280px] sm:max-w-[320px] mx-auto py-1.5 px-3 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-700 font-bold flex items-center justify-center gap-1 shadow-sm">
                <ShieldCheck size={13} className="text-red-600 shrink-0" />
                <span>ไม่เก็บข้อมูลส่วนตัว เพราะไม่อยากรู้เรื่องของคุณ</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            SCREEN 2: QUIZ PAGE
           =================================================== */}
        {screen === "QUIZ" && activeQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-4 space-y-5"
          >
            {/* Progress Bar & Dynamic Micro-copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-red-600">
                  ข้อ {currentQuestionIndex + 1} / {PERSONALITY_ZERO_DATA.questions.length}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium italic">
                  {PROGRESS_MICRO_COPY[currentQuestionIndex + 1] || "กำลังประเมิน..."}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestionIndex + 1) / PERSONALITY_ZERO_DATA.questions.length) * 100}%`,
                  }}
                  className="h-full bg-red-600 rounded-full shadow-sm"
                />
              </div>
            </div>

            {/* Question Card - Centered */}
            <div className="bg-neutral-950 text-white border border-neutral-900 rounded-3xl p-5 sm:p-6 shadow-xl text-center space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 block">
                Question {currentQuestionIndex + 1}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-relaxed tracking-tight">
                {activeQuestion.question}
              </h3>
            </div>

            {/* 2x2 Floating Choice Tiles (2 Top, 2 Bottom) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
              {activeQuestion.options.map((option, idx) => {
                const letters = ["A", "B", "C", "D"];
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectOption(option.trait)}
                    className="relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-red-600 shadow-md hover:shadow-xl transition-all cursor-pointer group text-left min-h-[110px] sm:min-h-[125px] overflow-hidden"
                  >
                    {/* Choice Letter Pill */}
                    <div className="flex items-center justify-between w-full mb-1.5 relative z-10">
                      <span className="w-6 h-6 rounded-lg bg-red-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                        {letters[idx]}
                      </span>
                      <Sparkles size={12} className="text-neutral-400 group-hover:text-red-600 transition-colors" />
                    </div>

                    {/* Option Text */}
                    <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-neutral-950 leading-relaxed relative z-10 break-words">
                      {option.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===================================================
            SCREEN 3: CALCULATING SCREEN
           =================================================== */}
        {screen === "CALCULATING" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 space-y-6"
          >
            {/* Loading Spinner */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
              <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                🤪
              </div>
            </div>

            {/* Interval Satire Slogan */}
            <div className="space-y-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={sloganIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-base font-black text-red-600 tracking-wide"
                >
                  {LOADING_SLOGANS[sloganIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-neutral-500 font-medium">
                กรุณารอสักครู่ ระบบกำลังมั่วข้อมูลอย่างพิถีพิถัน...
              </p>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            SCREEN 4: RESULT PAGE
           =================================================== */}
        {screen === "RESULT" && persona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-6"
          >
            {/* Persona Result Card Component */}
            <div className="flex justify-center">
              <PersonalityZeroShareCard
                ref={shareCardRef}
                persona={persona}
                percentage={traitPercentages[persona.code] || 14.2}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="py-3 px-4 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download size={15} className="text-red-500" />
                <span>{isDownloading ? "กำลังบันทึก..." : "Save Image"}</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/30"
              >
                <Share2 size={15} />
                <span>{copiedToast ? "คัดลอกลิงก์แล้ว!" : "Share Result"}</span>
              </button>
            </div>

            {/* Retake, Donation & Live Stats Row */}
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-neutral-600 pt-1 flex-wrap">
              <button
                onClick={handleResetToLanding}
                className="hover:text-neutral-950 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw size={13} /> ทำอีกรอบ
              </button>
              <span>•</span>
              <button
                onClick={() => setIsStatsModalOpen(true)}
                className="text-neutral-700 hover:text-neutral-950 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <BarChart2 size={13} className="text-red-600" /> ดูสถิติ Real-time
              </button>
              <span>•</span>
              <button
                onClick={() => setIsTipJarOpen(true)}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Coffee size={13} /> เลี้ยงกาแฟ
              </button>
            </div>

            {/* Anonymous Comments Live Feed & Input */}
            <PersonalityZeroComments persona={persona} allowPost={true} />



            {/* ===================================================
                💡 BRIDGE CTA CARD TO MAIN PLATFORM (UPSKILL EVERYDAY)
               =================================================== */}
            <div className="relative overflow-hidden rounded-[2.2rem] bg-white border-2 border-neutral-900 p-6 text-center shadow-xl space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
                  พักขำแล้ว...
                </span>
                <h3 className="text-base sm:text-lg font-black text-neutral-950 leading-snug">
                  อยากเริ่มลงมือเปลี่ยน 99% <br />
                  ที่เหลือของคุณจริงๆ รึยัง?
                </h3>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-xs mx-auto">
                  มาอัปเกรดชีวิตและพัฒนาสกิลต่อแบบไม่ปั่น ได้ที่นี่เลย!
                </p>
              </div>

              <Link
                href="https://upskilleveryday.com"
                className="max-w-[260px] sm:max-w-xs w-full py-2.5 sm:py-3 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-600/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 mx-auto"
              >
                <span>เข้าสู่ Upskill Everyday</span>
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 max-w-md mx-auto w-full px-5 pt-2 pb-3 text-center text-[10px] text-neutral-400 font-medium">
        <p>© 2026 PersonalityZero by อัพสกิลกับฟุ้ย</p>
      </footer>

      {/* Tip Jar Modal */}
      <TipJarModal isOpen={isTipJarOpen} onClose={() => setIsTipJarOpen(false)} />

      {/* Live Stats Breakdown Modal */}
      <AnimatePresence>
        {isStatsModalOpen && (
          <div className="fixed inset-0 z-[100020] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full bg-white border-2 border-neutral-900 rounded-[2.2rem] p-5 shadow-2xl overflow-hidden text-left text-neutral-900 select-none space-y-4"
            >
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                <BarChart2 size={18} className="text-red-600" />
                <div>
                  <h3 className="text-sm font-black text-neutral-950">สถิติความหลุดประชากร</h3>
                  <p className="text-[10px] text-neutral-500 font-mono">ที่ว่างมาทำไปทำไม: {totalPlays.toLocaleString()} คน</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.keys(PERSONALITY_ZERO_DATA.results).map((key) => {
                  const traitKey = key as TraitKey;
                  const res = PERSONALITY_ZERO_DATA.results[traitKey];
                  const pct = traitPercentages[traitKey] || 14.2;
                  const count = traitCounts[traitKey] || 0;
                  return (
                    <div
                      key={traitKey}
                      className="bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-black shrink-0">
                        {res.code}
                      </span>
                      <div className="flex flex-col items-end shrink-0 ml-1">
                        <span className="text-[11px] font-mono font-black text-white">{pct}%</span>
                        <span className="text-[9px] font-mono font-medium text-neutral-400">{count.toLocaleString()} คน</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
