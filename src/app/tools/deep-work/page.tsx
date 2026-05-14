"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, Zap, ArrowLeft, X, Play, Pause,
  RotateCcw, Trophy, BookOpen, Volume2, VolumeX
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, increment, arrayUnion, getDoc, updateDoc, collection, query, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { getStartOfMonday, getCalendarWeekId } from "@/utils/dashboardHelpers";

import { Inter, Geist_Mono } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
const geist_mono = Geist_Mono({ subsets: ["latin"], weight: ["900"] });

export default function DeepWorkPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedTime, setSelectedTime] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // ดึงค่าเวลาเริ่มต้นทันทีที่ Client-side โหลด เพื่อลดอาการกะพริบ (Flicker)
  useEffect(() => {
    const dur = localStorage.getItem("deepWork_duration");
    const saved = localStorage.getItem("deepWork_selectedTime");
    const autoStart = localStorage.getItem("deepWork_autoStart");

    if (dur) {
      const mins = parseInt(dur);
      setSelectedTime(mins);
      setTimeLeft(mins * 60);
    } else if (autoStart !== "true" && saved) {
      const mins = parseInt(saved);
      setSelectedTime(mins);
      // ถ้านำไปคำนวณเหลือเวลาจริงใน useEffect ถัดไป ตัวเลขนี้จะถูกเขียนทับเอง
      setTimeLeft(mins * 60);
    }
  }, []);
  const [isFinished, setIsFinished] = useState(false);
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [characterTier, setCharacterTier] = useState("rookie");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [soundMode, setSoundMode] = useState<"focus" | "reading" | "creative">("reading");
  const [xpReward, setXpReward] = useState(10);
  const isSoundEnabledRef = useRef(false);
  const soundModeRef = useRef<"focus" | "reading" | "creative">("reading");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  
  // Web Audio API for Pink Noise Lo-fi
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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

            // Calculate weekly focus time (Calendar Week - Monday Start)
            const currentWeekId = getCalendarWeekId();
            const startOfWeek = getStartOfMonday(new Date());
            const reflections = userData.focusReflections || [];
            
            // 🔄 [Sync Logic] ตรวจสอบว่าข้อมูลในฟิลด์ weeklyFocusMinutes ตรงกับรายการ reflections หรือไม่
            const calculatedWeeklyTotal = reflections.reduce((acc: number, ref: any) => {
              const refDate = new Date(ref.date);
              if (refDate >= startOfWeek) {
                return acc + (ref.duration || 0);
              }
              return acc;
            }, 0);

            let displayWeeklyMinutes = calculatedWeeklyTotal;

            // ถ้าข้อมูลใน Firestore ไม่ตรง หรือยังไม่มี ให้ Update เพื่อให้ Leaderboard ตรงกัน
            if (userData.lastFocusWeek !== currentWeekId || userData.weeklyFocusMinutes !== calculatedWeeklyTotal) {
              const userRef = doc(db, "users", currentUser.uid);
              updateDoc(userRef, {
                weeklyFocusMinutes: calculatedWeeklyTotal,
                lastFocusWeek: currentWeekId
              }).catch(console.error);
            }

            setWeeklyMinutes(displayWeeklyMinutes);

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

        const autoStartFlag = localStorage.getItem("deepWork_autoStart");
        const savedEndTime = localStorage.getItem("deepWork_endTime");
        const savedSelectedTime = localStorage.getItem("deepWork_selectedTime");

        // ถ้ามีธง autoStart (คำท้า/Lounge) ห้ามโหลดเวลาเก่ามาทับเด็ดขาด
        if (autoStartFlag !== "true" && savedEndTime && savedSelectedTime) {
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

        // Load sound preference
        const savedSound = localStorage.getItem("deepWork_soundEnabled");
        if (savedSound !== null) {
          const isEnabled = savedSound === "true";
          setIsSoundEnabled(isEnabled);
          isSoundEnabledRef.current = isEnabled;
        }

        const savedMode = localStorage.getItem("deepWork_soundMode") as any;
        if (savedMode) {
          setSoundMode(savedMode);
          soundModeRef.current = savedMode;
        }

        // Load mode for XP reward
        const mode = localStorage.getItem("deepWork_mode");
        if (mode === "lounge") {
          setXpReward(15);
        } else {
          setXpReward(10);
        }

        // เช็คเวลาที่ท้ามาทันทีเพื่อลดการกะพริบ (Flicker)
        const savedDuration = localStorage.getItem("deepWork_duration");
        if (savedDuration) {
          const mins = parseInt(savedDuration);
          setSelectedTime(mins);
          setTimeLeft(mins * 60);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Heartbeat System: Update lastActive every 60 seconds
  useEffect(() => {
    if (!user?.uid) return;

    const heartbeat = setInterval(async () => {
      try {
        const sessionRef = doc(db, "active_sessions", user.uid);
        // เช็คว่ามี session อยู่จริงก่อนอัปเดต
        const docSnap = await getDoc(sessionRef);
        if (docSnap.exists()) {
          await updateDoc(sessionRef, { lastActive: serverTimestamp() });
        }
      } catch (e) {
        // Silent error to not disturb focus
      }
    }, 60000);

    return () => clearInterval(heartbeat);
  }, [user]);

  // เมื่อออกจากหน้า Deep Work ไม่ว่าจะกรณีใดก็ตาม ให้รีเซ็ตสถานะเป็น idle ใน Lobby
  useEffect(() => {
    return () => {
      if (user?.uid) {
        const sessionRef = doc(db, "active_sessions", user.uid);
        updateDoc(sessionRef, { status: "idle", endTime: null }).catch(() => { });
      }
    };
  }, [user]);

  // Auto-start logic for Lounge/Challenge
  useEffect(() => {
    if (!isCheckingStatus && user) {
      const autoStart = localStorage.getItem("deepWork_autoStart");
      if (autoStart === "true") {
        localStorage.removeItem("deepWork_autoStart");

        // เริ่มงานทันทีแบบแทบไม่ต้องรอ
        const timer = setTimeout(() => {
          const savedDuration = localStorage.getItem("deepWork_duration");
          const defaultMins = savedDuration ? parseInt(savedDuration) : selectedTime;
          localStorage.removeItem("deepWork_duration"); // เคลียร์ทิ้งหลังใช้

          const targetTime = Date.now() + defaultMins * 60 * 1000;

          endTimeRef.current = targetTime;
          localStorage.setItem("deepWork_endTime", targetTime.toString());
          localStorage.setItem("deepWork_selectedTime", defaultMins.toString());

          setSelectedTime(defaultMins);
          setTimeLeft(defaultMins * 60);
          setIsActive(true);

          playNatureSound();
          requestWakeLock();
          updateSessionStatus("focusing", targetTime);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isCheckingStatus, user, isActive]);

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

  const updateSessionStatus = async (status: "idle" | "focusing", targetEndTime?: number | null) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, "active_sessions", user.uid);
      const docSnap = await getDoc(sessionRef);
      if (docSnap.exists()) {
        await updateDoc(sessionRef, { status, endTime: targetEndTime || null });
      }
    } catch (e) {
      console.error("Failed to update session status:", e);
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
      updateSessionStatus("focusing", targetTime);
    } else {
      setIsActive(false);
      stopNatureSound();
      localStorage.removeItem("deepWork_endTime");
      if (timerRef.current) clearInterval(timerRef.current);
      await releaseWakeLock();
      // นำออก: แม้จะ Pause แต่ผู้ใช้คนอื่นในห้องรวมจะยังเห็นว่าเรา "กำลังโฟกัส" อยู่จนกว่าจะออกหน้าจอ
      // updateSessionStatus("idle");
    }
  };

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    isSoundEnabledRef.current = newState;
    localStorage.setItem("deepWork_soundEnabled", newState.toString());

    if (isActive) {
      if (newState) {
        playNatureSound();
      } else {
        stopNatureSound();
      }
    }
  };

  const createNoiseBuffer = (ctx: AudioContext, mode: "focus" | "reading" | "creative") => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (mode === "focus") {
      // Brown Noise (Deep & Heavy)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const out = (lastOut + (0.02 * white)) / 1.02;
        lastOut = out;
        output[i] = out * 3.5; // volume compensation
      }
    } else if (mode === "reading") {
      // Pink Noise (Balanced & Natural - Voss-McCartney)
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Creative: White Noise with subtle modulation (Breeze)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }
    return buffer;
  };

  const playNatureSound = async () => {
    if (!isSoundEnabledRef.current) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      // Stop previous if exists
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch(e) {}
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }

      const ctx = audioCtxRef.current;
      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, soundModeRef.current);
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      
      // Filter frequency based on mode
      if (soundModeRef.current === "focus") filter.frequency.value = 400; // Deep Brown
      else if (soundModeRef.current === "reading") filter.frequency.value = 1000; // Warm Pink
      else filter.frequency.value = 2500; // Bright Creative

      filter.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      noiseSourceRef.current = source;
      gainNodeRef.current = gain;
    } catch (err) {
      console.error("Web Audio failed:", err);
    }
  };

  const stopNatureSound = () => {
    const sourceToStop = noiseSourceRef.current;
    const gainToStop = gainNodeRef.current;

    // Clear refs immediately so new playNatureSound calls don't see them
    noiseSourceRef.current = null;
    gainNodeRef.current = null;

    if (sourceToStop) {
      try {
        if (gainToStop && audioCtxRef.current) {
          const ctx = audioCtxRef.current;
          // Fade out smoothly
          gainToStop.gain.setValueAtTime(gainToStop.gain.value, ctx.currentTime);
          gainToStop.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          
          setTimeout(() => {
            try { sourceToStop.stop(); } catch(e) {}
            sourceToStop.disconnect();
          }, 350);
        } else {
          try { sourceToStop.stop(); } catch(e) {}
          sourceToStop.disconnect();
        }
      } catch (e) {
        console.error("Stop sound failed:", e);
      }
    }
  };

  const playAlarm = () => {
    stopNatureSound();
    if (!isSoundEnabledRef.current) return;
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
    updateSessionStatus("idle");
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
            updateSessionStatus("idle");
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
      const currentWeekId = getCalendarWeekId();
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data() || {};
      
      const payload: any = {
        totalFocusMinutes: increment(selectedTime),
        totalXP: increment(xpReward),
        lastFocusDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }),
        lastFocusWeek: currentWeekId,
        focusReflections: arrayUnion({
          date: new Date().toISOString(),
          duration: selectedTime,
          text: reflection.trim() || ""
        })
      };

      // Reset weeklyFocusMinutes if it's a new week
      if (userData.lastFocusWeek !== currentWeekId) {
        payload.weeklyFocusMinutes = selectedTime;
      } else {
        payload.weeklyFocusMinutes = increment(selectedTime);
      }

      // 📊 Sync to weekly_stats collection for Dashboard consistency
      const { calculateRelativeWeek } = await import("@/utils/dashboardHelpers");
      const joinDate = userData.joinDate ? new Date(userData.joinDate) : new Date();
      const relWeek = calculateRelativeWeek(joinDate);
      const weeklyStatsRef = doc(db, "users", user.uid, "weekly_stats", relWeek.id);
      
      await setDoc(userDocRef, payload, { merge: true });
      await setDoc(weeklyStatsRef, { focusMinutes: increment(selectedTime) }, { merge: true });

      await updateSessionStatus("idle"); // รีเซ็ตสถานะเป็น idle เมื่อเคลมแต้มเสร็จ
      router.push("/dashboard?tab=resources");
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
        <button
          onClick={async () => {
            await updateSessionStatus("idle");
            router.push("/tools/focus-room");
          }}
          className="flex items-center gap-2 text-zinc-400 hover:text-black transition-all group"
        >
          <div className={`p-2 rounded-full shadow-sm border transition-all ${isActive ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white' : 'bg-white border-zinc-200 group-hover:border-zinc-400'}`}>
            <ArrowLeft size={16} />
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="timer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            className={`w-full max-w-lg p-8 sm:p-10 md:p-16 rounded-[4rem] shadow-2xl border transition-all duration-1000 flex flex-col items-center relative overflow-hidden group ${isActive ? 'bg-zinc-900 border-zinc-800 shadow-black/50' : 'bg-white border-white shadow-zinc-200'}`}
          >
            {/* Status Badge - Top Right of Card */}
            <motion.div
              animate={isActive ? { y: [0, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg z-20 border transition-colors duration-1000 ${isActive ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-900 text-white border-zinc-700'}`}
            >
              <Zap size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest">{`+${xpReward} XP READY`}</span>
            </motion.div>

            <div className={`absolute top-0 left-0 w-full h-2 opacity-90 transition-colors duration-1000 ${isActive ? 'bg-blue-500' : 'bg-zinc-900'}`} />

            <div className="flex flex-col items-center mb-6 sm:mb-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-inner border transition-all duration-1000 ${isActive ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100 group-hover:rotate-12'}`}>
                <BrainCircuit size={26} className={isActive ? 'text-zinc-500' : 'text-zinc-900'} />
              </div>
              <h1 className={`text-sm font-black tracking-[0.4em] uppercase mb-1 transition-colors duration-1000 ${isActive ? 'text-zinc-600' : 'text-zinc-400'}`}>Deep Work Engine</h1>
              <div className={`h-px w-12 transition-colors duration-1000 ${isActive ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

              <AnimatePresence>
                {isActive && (
                  <div className="flex flex-col items-center gap-4 mt-6">
                    <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-full border border-zinc-700/50">
                      {[
                        { id: 'focus', label: 'Deep', icon: '🎯' },
                        { id: 'reading', label: 'Study', icon: '📖' },
                        { id: 'creative', label: 'Flow', icon: '✨' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            const m = mode.id as any;
                            setSoundMode(m);
                            soundModeRef.current = m;
                            localStorage.setItem("deepWork_soundMode", m);
                            if (isSoundEnabled) playNatureSound();
                          }}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase transition-all ${
                            soundMode === mode.id 
                            ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                            : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="mr-1">{mode.icon}</span> {mode.label}
                        </button>
                      ))}
                    </div>
                    
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={toggleSound}
                      className={`p-2 rounded-full transition-all duration-300 ${isSoundEnabled ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isSoundEnabled ? 'on' : 'off'}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {!isActive && (
              <div className="flex flex-col items-center gap-6 mb-10 w-full">
                <div className="flex bg-zinc-50 p-1.5 rounded-full border border-zinc-200 w-full max-w-[280px] shadow-inner">
                  {[15, 30].map((mins) => (
                    <button
                      key={mins} onClick={() => handleSelectTime(mins)}
                      className={`flex-1 py-3 rounded-full text-[11px] font-black tracking-widest transition-all ${selectedTime === mins ? 'bg-white text-black shadow-md border border-zinc-100' : 'text-zinc-400 hover:text-zinc-600'
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

            <motion.p
              key={selectedTime}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[9px] font-bold text-center max-w-[250px] leading-relaxed italic mt-4 mb-8 transition-colors duration-1000 ${isActive ? 'text-zinc-500' : 'text-zinc-400'}`}
            >
              {getGuideText()}
            </motion.p>

            {/* Control Buttons */}
            <div className="flex items-center gap-12">
              <button onClick={handleReset} className={`transition-all hover:-rotate-45 p-2 ${isActive ? 'text-zinc-700 hover:text-zinc-500' : 'text-zinc-300 hover:text-black'}`}><RotateCcw size={22} /></button>
              <button
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 border-4 ${isActive ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-900 text-white border-white hover:bg-black'}`}
              >
                {isActive ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
              </button>
              <button
                onClick={async () => {
                  await updateSessionStatus("idle");
                  router.push("/tools/focus-room");
                }}
                className={`transition-all p-2 ${isActive ? 'text-zinc-700 hover:text-red-500' : 'text-zinc-300 hover:text-red-500'}`}
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-12 flex flex-col items-center opacity-20">
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-500">Build Your Legacy</span>
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
              <Zap size={12} className="fill-emerald-400 text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {`+${xpReward} XP ${xpReward === 15 ? 'LOUNGE' : 'SOLO'} REWARD READY`}
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
                xpReward === 15 
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20' 
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {isSaving ? "Syncing..." : `Claim +${xpReward} XP & Finish`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}