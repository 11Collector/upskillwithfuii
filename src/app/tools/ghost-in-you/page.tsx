"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCcw, Share2, Sparkles, LayoutDashboard, ChevronRight, Skull, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { domToPng } from "modern-screenshot";
import Image from "next/image";

import Link from 'next/link';
import { ghostQuestions, type GhostId } from "@/data/ghostScenarios";
import { ghostResults } from "@/data/ghostResults";
import { auth, db, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, increment, getDoc, updateDoc } from "firebase/firestore";

// ─── calc ───
function calcResult(answers: Record<number, number>): { primary: GhostId; secondary: GhostId; scores: Record<GhostId, number> } {
  const scores: Record<string, number> = {
    kaonashi: 0, vampire: 0, mummy: 0, kasa: 0,
    kongkoi: 0, headless: 0, pixel: 0, guardian: 0,
  };
  ghostQuestions.forEach((q) => {
    const choiceIdx = answers[q.id];
    if (choiceIdx === undefined) return;
    const choice = q.choices[choiceIdx];
    Object.entries(choice.scores).forEach(([id, pts]) => { scores[id] = (scores[id] || 0) + pts; });
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0] as GhostId, secondary: sorted[1][0] as GhostId, scores: scores as Record<GhostId, number> };
}

const GHOST_IDS: GhostId[] = ["kaonashi","vampire","mummy","kasa","kongkoi","headless","pixel","guardian"];

// ─── shared bg decor ───
function SpookyBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* blood red glow blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-red-900/25 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-950/30 blur-[120px] rounded-full" />
      <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] bg-red-900/15 blur-[100px] rounded-full" />
      {/* noise grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
    </div>
  );
}

// ─── fetch community stats ───
async function loadCommunityStats(): Promise<Record<string, number> | null> {
  try {
    const snap = await getDoc(doc(db, "stats", "ghost_results"));
    return snap.exists() ? (snap.data() as Record<string, number>) : null;
  } catch { return null; }
}

// ─── page ───
export default function GhostInYouPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "quiz" | "loading" | "result">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ primary: GhostId; secondary: GhostId; scores: Record<GhostId, number> } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [fromPage, setFromPage] = useState<"home" | "dashboard" | null>(null);
  const [saving, setSaving] = useState(false);
  const [googleSaving, setGoogleSaving] = useState(false);
  const [communityStats, setCommunityStats] = useState<Record<string, number> | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    loadCommunityStats().then(setCommunityStats);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "home" || from === "dashboard") {
        setFromPage(from as any);
      }
    }
    return () => unsub();
  }, []);

  const question = ghostQuestions[currentIdx];
  const progress = ((currentIdx + 1) / ghostQuestions.length) * 100;
  const primaryData = result ? ghostResults[result.primary] : null;
  const secondaryData = result ? ghostResults[result.secondary] : null;

  const handleAnswer = async (choiceIdx: number) => {
    const newAnswers = { ...answers, [question.id]: choiceIdx };
    setAnswers(newAnswers);
    if (currentIdx < ghostQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setPhase("loading");
      await new Promise((r) => setTimeout(r, 2500));
      const calc = calcResult(newAnswers);
      setResult(calc);
      // increment community counter (ทุกคนที่เล่น ไม่ว่า login หรือไม่)
      await incrementCommunityStats(calc.primary);
      await fetchCommunityStats();
      if (user) {
        try {
          setSaving(true);
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          const hasXP = snap.exists() && snap.data()?.hasGhostXP;
          
          let updateData: any = {
            lastGhostResult: calc.primary,
            lastGhostResultFull: calc,
            updatedAt: serverTimestamp(),
          };

          if (!hasXP) {
            const oldXP = (snap.exists() ? snap.data()?.totalXP : 0) || 0;
            const newXP = oldXP + 50;
            const oldLevel = Math.floor(oldXP / 100) + 1;
            const newLevel = Math.floor(newXP / 100) + 1;

            updateData.totalXP = increment(50);
            updateData.hasGhostXP = true;

            if (newLevel > oldLevel) {
              sessionStorage.setItem('pendingLevelUp', String(newLevel));
            }
          }

          await setDoc(userRef, updateData, { merge: true });
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
      }
      setPhase("result");
    }
  };

  const handleShare = async () => {
    if (!resultCardRef.current) return;
    try {
      await new Promise(r => requestAnimationFrame(r));
      const dataUrl = await domToPng(resultCardRef.current, {
        quality: 1,
        scale: 3,
        features: { removeControlCharacter: true },
        style: { transform: "none" },
      });
      
      let shared = false;
      
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `ghost-in-you-${result?.primary}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "ผลลัพธ์ Ghost in You ของฉัน",
              text: "ดูผลลัพธ์ Ghost in You ของฉันบน Upskill with Fuii!"
            });
            shared = true;
          }
        } catch (shareErr) {
          console.error("Web Share failed, fallback to modal/download:", shareErr);
        }
      }

      if (!shared) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          setCapturedImage(dataUrl);
        } else {
          const link = document.createElement("a");
          link.download = `ghost-in-you-${result?.primary}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (e) { console.error(e); }
  };

  const incrementCommunityStats = async (primaryId: GhostId) => {
    try {
      const statsRef = doc(db, "stats", "ghost_results");
      await setDoc(statsRef, {
        [primaryId]: increment(1),
        total: increment(1),
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const fetchCommunityStats = async () => {
    const data = await loadCommunityStats();
    if (data) setCommunityStats(data);
  };

  const restart = () => { setPhase("intro"); setCurrentIdx(0); setAnswers({}); setResult(null); setCommunityStats(null); };

  const handleGoogleSave = async () => {
    if (!result) return;
    try {
      setGoogleSaving(true);
      const credential = await signInWithPopup(auth, googleProvider);
      const u = credential.user;
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      const hasXP = snap.exists() && snap.data()?.hasGhostXP;
      
      let updateData: any = {
        lastGhostResult: result.primary,
        lastGhostResultFull: result,
        updatedAt: serverTimestamp(),
      };

      if (!hasXP) {
        const oldXP = (snap.exists() ? snap.data()?.totalXP : 0) || 0;
        const newXP = oldXP + 50;
        const oldLevel = Math.floor(oldXP / 100) + 1;
        const newLevel = Math.floor(newXP / 100) + 1;

        updateData.totalXP = increment(50);
        updateData.hasGhostXP = true;

        if (newLevel > oldLevel) {
          sessionStorage.setItem('pendingLevelUp', String(newLevel));
        }
      }

      await setDoc(userRef, updateData, { merge: true });
      setUser(u);
    } catch (e) { console.error(e); }
    finally { setGoogleSaving(false); }
  };

  // ══════════════════════════════════════════════════════
  //  INTRO
  // ══════════════════════════════════════════════════════
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5 py-12 overflow-hidden relative">
        {/* Back button link removed as request */}
        <SpookyBg />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-md w-full text-center relative z-10"
        >

          {/* ── LOGO (ใหญ่มาก) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto mb-2"
            style={{ width: "100%", maxWidth: 340, height: 200 }}
          >
            <Image
              src="/ghost-in-you-logo.png"
              alt="Ghost in You"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(220,38,38,0.6)]"
              priority
            />
          </motion.div>

          {/* ── ghost parade ── */}
          <div className="flex justify-center gap-1.5 mb-8">
            {GHOST_IDS.map((id, i) => (
              <motion.div
                key={id}
                animate={{ y: [0, -10, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              >
                <img
                  src={`/ghosts/${id}.png`}
                  alt={id}
                  style={{ width: 36, height: 36, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(220,38,38,0.7))" }}
                />
              </motion.div>
            ))}
          </div>

          {/* ── tagline ── */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-900/20 text-red-400 rounded-full text-[10px] font-black mb-5 border border-red-800/40 uppercase tracking-[0.25em]">
            <Skull size={11} /> สมาคมผีคิดมากนานาชาติ
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
            ผีอะไร<br />
            <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">สิงคุณอยู่?</span>
          </h1>

          <p className="text-zinc-300 text-sm font-bold mb-1">
            สำรวจเงาในใจ · ค้นพบประเภทความกลัวที่ขับเคลื่อนชีวิตคุณ
          </p>

          <p className="text-zinc-500 text-xs leading-relaxed mb-2">
            จากแก๊งผี 8 ตัวนานาชาติ แต่ละตัวแทนความกลัวที่ซ่อนอยู่ในใจคนเรา<br />
            ตอบ 12 สถานการณ์จริงๆ แล้วดูว่าผีตัวไหนสิงคุณอยู่
          </p>
          <div className="mb-10 space-y-1">
            <p className="text-zinc-600 text-xs font-medium">ใช้เวลาประมาณ 3-5 นาที</p>
            <p className="text-red-500/70 text-xs font-semibold tracking-wide">ตอบตามสัญชาตญาณแรก ไม่ต้องคิดนาน</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 50px rgba(220,38,38,0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPhase("quiz")}
            className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black text-base rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.35)] transition-all uppercase tracking-widest border border-red-500/30"
          >
            เข้าร่วมสมาคมผี 💀
          </motion.button>

          <button
            onClick={() => setShowStatsModal(true)}
            className="mt-4 text-zinc-600 text-xs font-semibold hover:text-red-400 transition-colors"
          >
            ดูสถิติสมาคมผี →
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-3 text-zinc-700 text-xs font-medium hover:text-zinc-400 transition-colors"
          >
            ← กลับ Dashboard
          </button>
        </motion.div>

        {/* ── Stats Modal ── */}
        <AnimatePresence>
          {showStatsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              onClick={() => setShowStatsModal(false)}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-md bg-zinc-950 border border-red-900/40 rounded-[2.5rem] p-7 max-h-[75vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900 rounded-t-[2.5rem]" />
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Skull size={16} className="text-red-500" /> สถิติสมาคมผี
                  </h3>
                  <button onClick={() => setShowStatsModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 mb-5">
                  จากคนที่ลองทั้งหมด {(communityStats?.total ?? 0).toLocaleString()} คน
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[...GHOST_IDS]
                    .sort((a, b) => (communityStats?.[b] ?? 0) - (communityStats?.[a] ?? 0))
                    .map((id, i) => {
                      const g = ghostResults[id];
                      const count = communityStats?.[id] ?? 0;
                      const total = communityStats?.total ?? 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={id} className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center gap-1">
                          <img src={`/ghosts/${id}.png`} alt={g.name} className="w-12 h-12 object-contain" />
                          <span className="text-[10px] font-black text-zinc-300 leading-tight truncate w-full">{g.name}</span>
                          <span className="text-lg font-black text-red-500">{pct}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  //  LOADING
  // ══════════════════════════════════════════════════════
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <SpookyBg />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.08, 0.94, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="relative mx-auto mb-8"
            style={{ width: 160, height: 100 }}
          >
            <Image src="/ghost-in-you-logo.png" alt="Ghost in You" fill className="object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]" />
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">กำลังเรียกสมาคมผี...</h2>
          <p className="text-zinc-600 text-sm">วิเคราะห์ความกลัวที่ซ่อนอยู่ในใจคุณ</p>

          <div className="mt-10 flex gap-3 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -10, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  //  QUIZ
  // ══════════════════════════════════════════════════════
  if (phase === "quiz") {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-8 flex flex-col">
        <SpookyBg />
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col relative z-10">

          {/* header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => currentIdx === 0 ? setPhase("intro") : setCurrentIdx(currentIdx - 1)}
              className="p-2 rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            {/* progress counter */}
            <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
              {currentIdx + 1} <span className="text-red-800">/</span> {ghostQuestions.length}
            </span>

            {/* mini logo */}
            <div className="w-10 h-7 relative opacity-60">
              <Image src="/ghost-in-you-logo.png" alt="" fill className="object-contain" />
            </div>
          </div>

          {/* blood progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col"
            >
              {/* dimension */}
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.25em] mb-4">
                💀 {question.dimension}
              </span>

              {/* situation box */}
              <div className="bg-zinc-950 border border-red-900/40 rounded-2xl p-6 mb-7 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                  {question.situation}
                </p>
              </div>

              {/* choices */}
              <div className="flex flex-col gap-3">
                {question.choices.map((choice, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    className="text-left p-5 bg-zinc-950 border border-white/6 rounded-2xl text-zinc-400 text-sm font-medium leading-relaxed hover:border-red-700/50 hover:bg-red-950/20 hover:text-white transition-all duration-200 group"
                  >
                    {choice.text}
                    <ChevronRight size={13} className="inline ml-1 opacity-0 group-hover:opacity-40 transition-opacity text-red-500" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  //  RESULT
  // ══════════════════════════════════════════════════════
  if (phase === "result" && primaryData && secondaryData && result) {
    const communityTotal = communityStats?.total ?? 0;

    return (
      <div className="min-h-screen bg-black text-white px-4 py-10 overflow-x-hidden">
        <SpookyBg />

        {/* ghost-tinted glow behind result card */}
        <div className="fixed top-0 left-0 right-0 h-[50%] bg-red-900/10 blur-[100px] pointer-events-none z-0" />

        <div className="max-w-lg mx-auto relative z-10">

          {/* ─── Shareable Card ─── */}
          <div ref={resultCardRef} className="bg-zinc-950 rounded-[2.5rem] border border-red-900/40 overflow-hidden mb-5 shadow-[0_0_60px_rgba(220,38,38,0.15)]">

            {/* blood stripe top */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-900 via-red-500 to-red-900" />

            <div className="p-7">

              {/* logo in card */}
              <div className="flex justify-between items-center mb-7">
                <div style={{ width: 120, height: 40 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ghost-in-you-logo.png" alt="Ghost in You" style={{ width: 120, height: 40, objectFit: "contain", opacity: 0.8 }} />
                </div>
                <div className="px-3 py-1 bg-red-900/20 border border-red-800/30 rounded-full text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">
                  สมาคมผีคิดมาก
                </div>
              </div>

              {/* main ghost */}
              <div className="text-center mb-8">
                <div className="relative mx-auto mb-5" style={{ width: 160, height: 160 }}>
                  {/* red glow ring */}
                  <div className="absolute inset-0 rounded-full bg-red-600/15 blur-2xl scale-110" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/ghosts/${primaryData.id}.png`}
                    alt={primaryData.name}
                    style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 0 30px rgba(220,38,38,0.6))", position: "relative", zIndex: 10 }}
                  />
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 text-red-500">
                  {primaryData.fearLabel}
                </div>
                <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                  {primaryData.name}
                </h1>
                <p className="text-sm font-bold italic text-red-400 mb-5">
                  "{primaryData.tagline}"
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  {primaryData.story}
                </p>
              </div>

              {/* dominant traits — ค่า value ต่ำคือจุดที่ขาด ไม่ใช่พฤติกรรมเด่น จึงไม่แสดง */}
              <div className="mb-6">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2.5">พฤติกรรมเด่นที่ผีตัวนี้สิง</div>
                <div className="flex flex-wrap gap-2">
                  {primaryData.stats.filter((s) => s.value >= 50).map((s) => (
                    <span
                      key={s.label}
                      className="text-[11px] font-bold text-red-400 bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-full"
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* thai stat */}
              <div className="p-4 bg-red-950/30 border border-red-900/30 rounded-2xl mb-6">
                <p className="text-xs font-bold text-red-400">💀 {primaryData.thaiStat}</p>
              </div>

              {/* secondary ghost */}
              <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/6 rounded-2xl">
                <div className="w-14 h-14 flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/ghosts/${secondaryData.id}.png`} alt={secondaryData.name} style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(220,38,38,0.4))" }} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">ผีรองที่แอบสิงด้วย</p>
                  <p className="text-sm font-bold text-white">{secondaryData.name}</p>
                  <p className="text-xs text-zinc-600">{secondaryData.fearLabel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Heal Section ─── */}
          <div className="bg-zinc-950 rounded-[2.5rem] border border-red-900/30 p-7 mb-5">
            <h2 className="text-base font-black text-white mb-5 flex items-center gap-2">
              <span className="text-red-500">🩸</span> {primaryData.heal.title}
            </h2>
            <div className="space-y-4">
              {primaryData.heal.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex gap-3"
                >
                  <span className="flex-none w-6 h-6 rounded-full bg-red-900/30 text-red-500 border border-red-800/40 flex items-center justify-center text-[10px] font-black">
                    {i + 1}
                  </span>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
              <p className="text-sm font-bold text-red-400 italic">
                🕯️ "{primaryData.affirmation}"
              </p>
            </div>
          </div>

          {/* ─── Score breakdown ─── */}
          <div className="bg-zinc-950 rounded-[2.5rem] border border-red-900/30 p-7 mb-5">
            <h2 className="text-sm font-black text-white mb-1 flex items-center gap-2">
              <span className="text-red-500">💀</span> ผลสำรวจสมาคมผีทั้งหมด
            </h2>
            <p className="text-[10px] text-zinc-600 mb-5">จากคนที่ลองทั้งหมด {communityTotal.toLocaleString()} คน</p>
            <div className="grid grid-cols-2 gap-3">
              {[...GHOST_IDS]
                .sort((a, b) => (communityStats?.[b] ?? 0) - (communityStats?.[a] ?? 0))
                .map((id) => {
                  const g = ghostResults[id];
                  if (!g) return null;
                  const count = communityStats?.[id] ?? 0;
                  const pct = communityTotal > 0 ? Math.round((count / communityTotal) * 100) : 0;
                  const isPrimary = id === result.primary;
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        isPrimary
                          ? "bg-red-950/30 border-red-700/40 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                          : "bg-black/40 border-white/5"
                      }`}
                    >
                      <div className="w-9 h-9 relative flex-none">
                        <Image src={`/ghosts/${id}.png`} alt={id} fill className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black truncate ${isPrimary ? "text-red-400" : "text-zinc-500"}`}>
                          {g.name.replace(/^ผี/, "").trim() || g.name}
                        </p>
                        <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${isPrimary ? "bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.6)]" : "bg-zinc-700"}`}
                          />
                        </div>
                      </div>
                      <span className={`text-[10px] font-black ${isPrimary ? "text-red-500" : "text-zinc-700"}`}>{pct}%</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ─── XP ─── */}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4 mb-5 flex items-center gap-3"
            >
              <Sparkles className="text-amber-500" size={20} />
              <div>
                <p className="text-amber-400 font-black text-sm">+50 XP ได้รับแล้ว!</p>
                <p className="text-amber-700 text-xs">เสร็จสิ้นการประเมิน Ghost in You</p>
              </div>
            </motion.div>
          )}

          {/* ─── action buttons ─── */}
          <div className="flex flex-col gap-3">

            {/* บันทึกด้วย Google — โชว์เฉพาะตอน guest */}
            {!user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSave}
                disabled={googleSaving}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm bg-white hover:bg-zinc-100 text-zinc-900 border border-white/20 transition-all disabled:opacity-60"
              >
                {googleSaving ? (
                  <span className="animate-spin text-base">👻</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                {googleSaving ? "กำลังบันทึก..." : "บันทึกผลด้วย Google"}
              </motion.button>
            )}

            {/* saved badge */}
            {user && (
              <div className="flex items-center justify-center gap-2 py-3 rounded-2xl text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20">
                ✓ บันทึกผลลัพธ์เข้าโปรไฟล์แล้ว
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(220,38,38,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white border border-red-500/30 transition-all"
            >
              <Share2 size={16} /> บันทึกรูปผลลัพธ์
            </motion.button>
            <button
              onClick={restart}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-zinc-950 border border-white/8 text-zinc-400 hover:border-red-800/40 hover:text-white transition-all"
            >
              <RefreshCcw size={16} /> ทำใหม่
            </button>
            <button
              onClick={() => router.push(user ? "/dashboard" : "/")}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-zinc-950 border border-white/8 text-zinc-400 hover:border-red-800/40 hover:text-white transition-all"
            >
              <LayoutDashboard size={16} /> {user ? "กลับ Dashboard" : "กลับหน้าแรก"}
            </button>
          </div>

          <p className="text-center text-zinc-800 text-[10px] mt-8 leading-relaxed">
            ผลนี้เป็นเพียงการสำรวจแนวโน้มทางจิตวิทยาเพื่อการพัฒนาตัวเอง ไม่ใช่การวินิจฉัยทางการแพทย์
          </p>
          <AnimatePresence>
            {capturedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                onClick={() => setCapturedImage(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white p-5 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100 flex flex-col items-center gap-4 relative text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-all shadow-md cursor-pointer z-10"
                  >
                    <X size={16} className="text-white" />
                  </button>

                  <div>
                    <h3 className="text-base font-black text-slate-800 mb-1">✨ บันทึกรูปภาพของคุณ</h3>
                    <p className="text-[11px] text-slate-500 font-bold leading-normal">
                      กดค้างที่รูปภาพด้านล่างเพื่อ <span className="text-blue-600">"บันทึกไปยังแอพรูปภาพ"</span><br />
                      หรือแคปหน้าจอเพื่อขิงลง Story ได้เลยครับ!
                    </p>
                  </div>

                  <div className="relative w-full max-h-[50vh] overflow-y-auto rounded-2xl border border-slate-200 shadow-inner bg-slate-50">
                    <img
                      src={capturedImage}
                      alt="Ghost in You Result"
                      className="w-full h-auto object-contain rounded-2xl"
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.download = `ghost-in-you-${result?.primary}.png`;
                        link.href = capturedImage;
                        link.click();
                      }}
                      className="flex-1 bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 transition-all text-[12px] active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                    >
                      ดาวน์โหลดตรงอีกครั้ง
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return null;
}
