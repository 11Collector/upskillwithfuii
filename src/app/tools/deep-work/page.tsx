"use client";

import { useState, useEffect, useRef } from "react"; // เพิ่ม useRef
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, Zap, ArrowLeft, X, Play, Pause, 
  RotateCcw, Trophy, BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// --- Fonts ---
import { Inter, Geist_Mono } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
const geist_mono = Geist_Mono({ subsets: ["latin"], weight: ["900"] });

export default function DeepWorkPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [selectedTime, setSelectedTime] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  // --- Refs สำหรับจัดการ Timer และ Wake Lock ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const todayStr = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'});
          if (userDoc.data().lastFocusDate === todayStr) {
            setHasClaimedToday(true);
          }
        }
      } else router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  // --- ฟังก์ชันป้องกันหน้าจอดับ ---
  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // --- ปรับปรุง Logic การเริ่ม/หยุด Timer ---
  const toggleTimer = async () => {
    if (!isActive) {
      // กด Start: คำนวณเวลาสิ้นสุด ณ ตอนนี้
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
      await requestWakeLock();
    } else {
      // กด Pause: เคลียร์ค่า และหยุด Wake Lock
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      await releaseWakeLock();
    }
  };

  const handleReset = async () => {
    setIsActive(false);
    setTimeLeft(selectedTime * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    await releaseWakeLock();
  };

  useEffect(() => {
    if (isActive && !isFinished) {
      timerRef.current = setInterval(() => {
        if (endTimeRef.current) {
          const now = Date.now();
          const remaining = Math.round((endTimeRef.current - now) / 1000);

          if (remaining <= 0) {
            setTimeLeft(0);
            setIsActive(false);
            setIsFinished(true);
            releaseWakeLock();
            if (timerRef.current) clearInterval(timerRef.current);
          } else {
            setTimeLeft(remaining);
          }
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished]);

  const handleSelectTime = (mins: number) => {
    if (isActive) return;
    setSelectedTime(mins);
    setTimeLeft(mins * 60);
  };

  const handleClaimXP = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const payload: any = {
        totalFocusMinutes: increment(selectedTime),
        lastFocusDate: new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'})
      };
      if (!hasClaimedToday) payload.totalXP = increment(20);
      if (reflection.trim() !== "") {
        payload.focusReflections = arrayUnion({
          date: new Date().toISOString(),
          duration: selectedTime,
          text: reflection.trim()
        });
      }
      await setDoc(doc(db, "users", user.uid), payload, { merge: true });
      router.push("/dashboard");
    } catch (e) { 
      console.error(e); 
      setIsSaving(false); 
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getGuideText = () => {
    if (selectedTime === 15) return "เหมาะสำหรับ: สรุปความรู้สั้นๆ, จัดระเบียบความคิด หรือ Digital Detox";
    return "เหมาะสำหรับ: อ่านหนังสือจริงจัง, เขียนแผนงาน หรือทำ Deep Work โปรเจกต์หลัก";
  };

  return (
    <div className={`min-h-[100dvh] bg-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden ${inter.className}`}>
      
      <div className="absolute top-8 left-8 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-black transition-all group">
          <div className="p-2 bg-white rounded-full shadow-sm border border-zinc-200 group-hover:border-zinc-400">
            <ArrowLeft size={16} />
          </div>
          <span className="font-black text-[9px] uppercase tracking-[0.3em]">Exit System</span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key="timer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg bg-white p-10 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-white flex flex-col items-center relative overflow-hidden group"
          >
            <motion.div 
              animate={isActive ? { y: [0, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute top-10 right-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg z-20 border ${hasClaimedToday ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-zinc-900 text-white border-zinc-700'}`}
            >
              <Zap size={10} className={hasClaimedToday ? 'fill-zinc-300' : 'fill-yellow-400 text-yellow-400'} />
              <span className="text-[9px] font-black tracking-widest">{hasClaimedToday ? 'DAILY LIMIT' : '+20 XP READY'}</span>
            </motion.div>

            <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900 opacity-90" />
            
            <div className="flex flex-col items-center mb-10">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-zinc-100 group-hover:rotate-12 transition-transform duration-500">
                <BrainCircuit size={26} className="text-zinc-900" />
              </div>
              <h1 className="text-sm font-black text-zinc-400 tracking-[0.4em] uppercase mb-1">Deep Work Engine</h1>
              <div className="h-px w-12 bg-zinc-200" />
            </div>

            {!isActive && (
              <div className="flex bg-zinc-50 p-1 rounded-[1.5rem] border border-zinc-200 mb-10 w-full max-w-[240px] shadow-inner">
                {[15, 30].map((mins) => (
                  <button
                    key={mins} onClick={() => handleSelectTime(mins)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                      selectedTime === mins ? 'bg-white text-black shadow-md border border-zinc-100' : 'text-zinc-400'
                    }`}
                  >
                    {mins} MIN
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center justify-center mb-12">
              <div className="absolute inset-0 bg-zinc-100 blur-[80px] opacity-50 rounded-full" />
              <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90 relative z-10">
                <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-100 fill-none" strokeWidth="1" strokeDasharray="1 12" />
                <motion.circle 
                  cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none shadow-2xl" strokeWidth="4" strokeLinecap="round"
                  style={{ strokeDasharray: circumference, strokeDashoffset: (timeLeft / (selectedTime * 60)) * circumference }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center z-20">
                <motion.span 
                  key={timeLeft}
                  className={`${geist_mono.className} text-6xl sm:text-[5.5rem] font-black text-black tabular-nums tracking-[0.05em] leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]`}
                  style={{ background: "linear-gradient(to bottom, #000 60%, #444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {formatTime(timeLeft)}
                </motion.span>
                <div className={`mt-6 flex flex-col items-center gap-2 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                   <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.5em] ml-1">Focusing Now</span>
                   <div className="h-1 w-1 rounded-full bg-black animate-ping" />
                </div>
              </div>
            </div>

            <div className="mb-12 text-center px-6">
              <p className="text-[10px] font-bold text-zinc-500 leading-relaxed max-w-[260px] mx-auto italic">"{getGuideText()}"</p>
            </div>

            <div className="flex items-center gap-12">
              <button onClick={handleReset} className="text-zinc-300 hover:text-black transition-all hover:-rotate-45"><RotateCcw size={22}/></button>
              <button 
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 border-4 border-white ${isActive ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-white hover:bg-black'}`}
              >
                {isActive ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => router.push("/dashboard")} className="text-zinc-300 hover:text-red-500 transition-all"><X size={22}/></button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-900 p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-black text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-700">
              <Trophy size={32} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Mission Success</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-10">You've mastered {selectedTime} minutes</p>
            <div className="flex items-center gap-1.5 mb-10 bg-black/50 px-4 py-2 rounded-full border border-zinc-700/50 backdrop-blur-md">
              <Zap size={12} className={hasClaimedToday ? "fill-zinc-600 text-zinc-600" : "fill-emerald-400 text-emerald-400"} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${hasClaimedToday ? 'text-zinc-500' : 'text-emerald-400'}`}>
                {hasClaimedToday ? `+${selectedTime} MINS SAVED` : "+20 XP EARNED"}
              </p>
            </div>
            <div className="w-full bg-black/40 rounded-[2.5rem] p-8 mb-10 text-left border border-zinc-800 shadow-inner group">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Reflection Journal</span>
              </div>
              <textarea 
                placeholder="สรุปบทเรียนสั้นๆ ของวันนี้..."
                className="w-full bg-transparent outline-none text-sm text-zinc-200 font-bold min-h-[100px] resize-none placeholder:text-zinc-700 leading-relaxed"
                value={reflection} onChange={(e) => setReflection(e.target.value)}
              />
            </div>
            <button 
              onClick={handleClaimXP} 
              disabled={isSaving} 
              className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${
                hasClaimedToday 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {isSaving ? "Syncing..." : hasClaimedToday ? "Save Focus Time" : "Claim +20 XP & Finish"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 flex items-center gap-4 opacity-10 grayscale">
         <div className="h-px w-16 bg-black" />
         <p className="text-[9px] font-black text-black uppercase tracking-[0.5em]">Build Your Legacy</p>
         <div className="h-px w-16 bg-black" />
      </div>
    </div>
  );
}