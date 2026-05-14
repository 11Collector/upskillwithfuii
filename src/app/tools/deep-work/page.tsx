"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [characterTier, setCharacterTier] = useState("rookie");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const natureAudioRef = useRef<HTMLAudioElement | null>(null);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

    const cachedDate = localStorage.getItem("lastFocusDate_cache");
    if (cachedDate === todayStr) {
      setHasClaimedToday(true);
      setIsCheckingStatus(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const dbLastFocusDate = userData.lastFocusDate;
            const isClaimedInDB = dbLastFocusDate === todayStr;

            setHasClaimedToday(isClaimedInDB);
            setGender(userData.gender || "male");
            
            if (dbLastFocusDate) {
              localStorage.setItem("lastFocusDate_cache", dbLastFocusDate);
            }

            // Calculate weekly focus time
            const reflections = userData.focusReflections || [];
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
            startOfWeek.setHours(0, 0, 0, 0);

            const weeklyTotal = reflections.reduce((acc: number, ref: any) => {
              const refDate = new Date(ref.date);
              if (refDate >= startOfWeek) {
                return acc + (ref.duration || 0);
              }
              return acc;
            }, 0);
            setWeeklyMinutes(weeklyTotal);

            // Determine character tier based on XP
            const xp = userData.totalXP || 0;
            const level = Math.floor(xp / 100) + 1;
            let tier = "rookie";
            if (level >= 30) tier = "legacy";
            else if (level >= 20) tier = "architect";
            else if (level >= 10) tier = "master";
            setCharacterTier(tier);
          }
        } catch (error) {
          console.error("Error fetching user progress:", error);
        } finally {
          setIsCheckingStatus(false);
        }

        const savedEndTime = localStorage.getItem("deepWork_endTime");
        const savedSelectedTime = localStorage.getItem("deepWork_selectedTime");
        if (savedEndTime && savedSelectedTime) {
          const now = Date.now();
          const target = parseInt(savedEndTime);
          const remaining = Math.round((target - now) / 1000);
          if (remaining > 0) {
            endTimeRef.current = target;
            setSelectedTime(parseInt(savedSelectedTime));
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            localStorage.removeItem("deepWork_endTime");
          }
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const syncOnFocus = () => {
      if (document.visibilityState === "visible" && isActive && endTimeRef.current) {
        const now = Date.now();
        const target = endTimeRef.current;
        const remaining = Math.round((target - now) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          setIsFinished(true);
          playAlarm();
          localStorage.removeItem("deepWork_endTime");
        } else {
          setTimeLeft(remaining);
        }
      }
    };
    document.addEventListener("visibilitychange", syncOnFocus);
    window.addEventListener("focus", syncOnFocus);
    return () => {
      document.removeEventListener("visibilitychange", syncOnFocus);
      window.removeEventListener("focus", syncOnFocus);
    };
  }, [isActive]);

  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try { wakeLockRef.current = await (navigator as any).wakeLock.request("screen"); } 
      catch (err) { console.error("Wake Lock error:", err); }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const toggleTimer = async () => {
    if (!isActive) {
      const targetTime = Date.now() + timeLeft * 1000;
      endTimeRef.current = targetTime;
      localStorage.setItem("deepWork_endTime", targetTime.toString());
      localStorage.setItem("deepWork_selectedTime", selectedTime.toString());
      setIsActive(true);
      playNatureSound();
      await requestWakeLock();
    } else {
      setIsActive(false);
      stopNatureSound();
      localStorage.removeItem("deepWork_endTime"); 
      if (timerRef.current) clearInterval(timerRef.current);
      await releaseWakeLock();
    }
  };

  const playNatureSound = () => {
    if (!natureAudioRef.current) {
      const audio = new Audio("/sounds/nature.mp3");
      audio.volume = 0.2;
      
      audio.addEventListener('timeupdate', function() {
        const buffer = 0.4;
        if (this.currentTime > this.duration - buffer) {
          this.currentTime = 0;
          this.play();
        }
      });

      audio.loop = true; 
      natureAudioRef.current = audio;
    }
    natureAudioRef.current.play().catch(err => console.error("Nature sound failed:", err));
  };

  const stopNatureSound = () => {
    if (natureAudioRef.current) {
      natureAudioRef.current.pause();
      natureAudioRef.current.currentTime = 0;
    }
  };

  const playAlarm = () => {
    stopNatureSound();
    const audio = new Audio("/sounds/alarm.mp3");
    audio.play().catch(err => console.error("Audio playback failed:", err));
  };

  const handleReset = async () => {
    setIsActive(false);
    stopNatureSound();
    setTimeLeft(selectedTime * 60);
    localStorage.removeItem("deepWork_endTime");
    localStorage.removeItem("deepWork_selectedTime");
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
            playAlarm();
            releaseWakeLock();
            if (timerRef.current) clearInterval(timerRef.current);
          } else {
            setTimeLeft(remaining);
          }
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
        lastFocusDate: new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'}),
        // บันทึกทุก Session ลงใน focusReflections เสมอ (แม้ text จะว่าง) เพื่อใช้คำนวณ Weekly Stats
        focusReflections: arrayUnion({
          date: new Date().toISOString(),
          duration: selectedTime,
          text: reflection.trim() || "" // บันทึกค่าว่างถ้าไม่มีการพิมพ์
        })
      };
      
      // ให้ XP เฉพาะครั้งแรกของวัน
      if (!hasClaimedToday) payload.totalXP = increment(20);
      
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

  const formatWeeklyTime = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0) return `${h} HRS ${m} MIN`;
    return `${m} MIN`;
  };

  const getGuideText = () => {
    if (selectedTime === 15) return "เหมาะสำหรับ: สรุปความรู้สั้นๆ, จัดระเบียบความคิด หรือ Digital Detox";
    return "เหมาะสำหรับ: อ่านหนังสือจริงจัง, เขียนแผนงาน หรือทำ Deep Work โปรเจกต์หลัก";
  };

  const getAvatarPath = () => {
    const suffix = gender === 'female' ? '-w' : '';
    return `/avatars/${characterTier}-meditation${suffix}.png`;
  };

  return (
    <div className={`min-h-[100dvh] transition-colors duration-1000 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden ${inter.className} ${isActive ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      
      {/* Background Focus Glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-8 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-black transition-all group">
          <div className={`p-2 rounded-full shadow-sm border transition-all ${isActive ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white' : 'bg-white border-zinc-200 group-hover:border-zinc-400'}`}>
            <ArrowLeft size={16} />
          </div>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key="timer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            className={`w-full max-w-lg p-8 sm:p-10 md:p-16 rounded-[4rem] shadow-2xl border transition-all duration-1000 flex flex-col items-center relative overflow-hidden group ${isActive ? 'bg-zinc-900 border-zinc-800 shadow-black/50' : 'bg-white border-white shadow-zinc-200'}`}
          >
            {/* Status Badge */}
            <motion.div 
              animate={isActive ? { y: [0, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg z-20 border transition-colors duration-1000 ${isActive ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : (hasClaimedToday ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-zinc-900 text-white border-zinc-700')}`}
            >
              <Zap size={10} className={hasClaimedToday ? 'fill-zinc-300' : 'fill-yellow-400 text-yellow-400'} />
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest">{hasClaimedToday ? 'DAILY LIMIT' : '+20 XP READY'}</span>
            </motion.div>

            <div className={`absolute top-0 left-0 w-full h-2 opacity-90 transition-colors duration-1000 ${isActive ? 'bg-blue-500' : 'bg-zinc-900'}`} />
            
            <div className="flex flex-col items-center mb-6 sm:mb-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-inner border transition-all duration-1000 ${isActive ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100 group-hover:rotate-12'}`}>
                <BrainCircuit size={26} className={isActive ? 'text-zinc-500' : 'text-zinc-900'} />
              </div>
              <h1 className={`text-sm font-black tracking-[0.4em] uppercase mb-1 transition-colors duration-1000 ${isActive ? 'text-zinc-600' : 'text-zinc-400'}`}>Deep Work Engine</h1>
              <div className={`h-px w-12 transition-colors duration-1000 ${isActive ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            </div>

            {!isActive && (
              <div className="flex flex-col items-center gap-6 mb-10 w-full">
                <div className="flex bg-zinc-50 p-1.5 rounded-full border border-zinc-200 w-full max-w-[280px] shadow-inner">
                  {[15, 30].map((mins) => (
                    <button
                      key={mins} onClick={() => handleSelectTime(mins)}
                      className={`flex-1 py-3 rounded-full text-[11px] font-black tracking-widest transition-all ${
                        selectedTime === mins ? 'bg-white text-black shadow-md border border-zinc-100' : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      {mins} MIN
                    </button>
                  ))}
                </div>

                {/* Weekly Summary Positioned Below Selector */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm"
                >
                  <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Trophy size={14} className="text-yellow-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Weekly Focus Total</span>
                    <span className="text-xs font-black text-black leading-none">{formatWeeklyTime(weeklyMinutes)}</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* SVG Timer with Avatar */}
            <div className="relative flex items-center justify-center mb-12 w-72 h-72 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px]">
              <div className={`absolute inset-0 blur-[80px] opacity-50 rounded-full transition-colors duration-1000 ${isActive ? 'bg-blue-500/20' : 'bg-zinc-100'}`} />
              
              {/* Avatar Container */}
              <motion.div 
                animate={isActive ? {
                  scale: [1, 1.02, 1],
                  filter: ["drop-shadow(0 0 0px rgba(59, 130, 246, 0))", "drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))", "drop-shadow(0 0 0px rgba(59, 130, 246, 0))"]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                {!isCheckingStatus ? (
                  <img 
                    key={getAvatarPath()}
                    src={getAvatarPath()} 
                    alt="Meditation Avatar" 
                    className={`w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 object-contain transition-all duration-1000 ${isActive ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}
                  />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>

              <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-20 pointer-events-none">
                <circle cx="50%" cy="50%" r={radius} className={`fill-none transition-colors duration-1000 ${isActive ? 'stroke-zinc-800' : 'stroke-zinc-100'}`} strokeWidth="1" strokeDasharray="1 12" />
                <motion.circle 
                  cx="50%" cy="50%" r={radius} className={`fill-none shadow-2xl transition-colors duration-1000 ${isActive ? 'stroke-blue-500' : 'stroke-zinc-900'}`} strokeWidth="4" strokeLinecap="round"
                  style={{ strokeDasharray: circumference, strokeDashoffset: (timeLeft / (selectedTime * 60)) * circumference }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </svg>

              {/* Time Text - Larger & Better Spacing */}
              <div className="absolute -bottom-8 flex flex-col items-center z-30">
                <motion.span 
                  key={timeLeft}
                  className={`${geist_mono.className} text-6xl sm:text-7xl lg:text-8xl font-black tabular-nums tracking-[0.05em] leading-none transition-colors duration-1000 ${isActive ? 'text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'text-black'}`}
                >
                  {formatTime(timeLeft)}
                </motion.span>
              </div>
            </div>

            <div className="mb-12 text-center px-6">
              <p className={`text-[10px] font-bold leading-relaxed max-w-[260px] mx-auto italic transition-colors duration-1000 ${isActive ? 'text-zinc-500' : 'text-zinc-500'}`}>"{getGuideText()}"</p>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-12">
              <button onClick={handleReset} className={`transition-all hover:-rotate-45 p-2 ${isActive ? 'text-zinc-700 hover:text-zinc-500' : 'text-zinc-300 hover:text-black'}`}><RotateCcw size={22}/></button>
              <button 
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 border-4 ${isActive ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-900 text-white border-white hover:bg-black'}`}
              >
                {isActive ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => router.push("/dashboard")} className={`transition-all p-2 ${isActive ? 'text-zinc-700 hover:text-red-500' : 'text-zinc-300 hover:text-red-500'}`}><X size={22}/></button>
            </div>

            <div className={`mt-12 flex items-center gap-4 opacity-20 transition-all duration-1000 ${isActive ? 'grayscale-0 text-blue-500' : 'grayscale text-black'}`}>
              <div className="h-px w-8 bg-current" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em]">Build Your Legacy</p>
              <div className={`h-px w-8 bg-current ${isActive ? 'bg-blue-500' : 'bg-black'}`} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-900 p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-black text-white rounded-full flex items-center justify-center mb-8 shadow-2xl border border-zinc-700">
              <Trophy size={32} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Mission Success</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-10">You've mastered {selectedTime} minutes</p>
            
            <div className="flex items-center gap-1.5 mb-10 bg-black/50 px-5 py-2.5 rounded-full border border-zinc-700/50 backdrop-blur-md">
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
              className={`w-full py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${
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
    </div>
  );
}