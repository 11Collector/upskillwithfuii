"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Swords, Play, ArrowLeft, Zap, User as UserIcon, Globe, Sparkles, HelpCircle, Info, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, collection, query, serverTimestamp, deleteDoc, updateDoc, deleteField, increment } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { Inter, Geist_Mono } from "next/font/google";
import { getCalendarWeekId, getStartOfMonday } from "@/utils/dashboardHelpers";
const inter = Inter({ subsets: ["latin"] });
const geist_mono = Geist_Mono({ subsets: ["latin"], weight: ["900"] });

type ActiveUser = {
  uid: string;
  displayName: string;
  characterTier: string;
  gender: string;
  status: "idle" | "focusing";
  taskMessage: string;
  duration?: number;
  endTime?: number;
  challengeRequest?: { fromUid: string; fromName: string; fromTask: string; duration: number };
  challengeAccepted?: boolean;
};

export default function FocusRoomPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [taskMessage, setTaskMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingChallenge, setIncomingChallenge] = useState<{ fromUid: string, fromName: string, fromTask: string, duration: number } | null>(null);
  const [showSentToast, setShowSentToast] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [leaderboardMode, setLeaderboardMode] = useState<"weekly" | "allTime">("weekly");

  const [viewMode, setViewMode] = useState<"selection" | "lounge">("selection");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update currentTime every second for UI purposes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat System: Update lastActive every 60 seconds if joined
  useEffect(() => {
    if (!user || !isJoined) return;
    
    const heartbeat = setInterval(async () => {
      try {
        const sessionRef = doc(db, "active_sessions", user.uid);
        await updateDoc(sessionRef, { lastActive: serverTimestamp() });
      } catch (e) {
        // Silent error
      }
    }, 60000);

    return () => clearInterval(heartbeat);
  }, [user, isJoined]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setTaskMessage(data.lastFocusTask || "กำลังจะเริ่มอ่านหนังสือ...");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "active_sessions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: ActiveUser[] = [];
      let currentUserInSession = false;
      const threeMinutesAgo = Date.now() - (3 * 60 * 1000);

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as any;
        // แปลง Firebase Timestamp เป็น Milliseconds
        const lastActiveTime = data.lastActive?.toMillis?.() || Date.now();
        
        // กรองเฉพาะคนที่ Active ภายใน 3 นาทีล่าสุด
        if (lastActiveTime >= threeMinutesAgo) {
          users.push(data as ActiveUser);
        }

        if (data.uid === user.uid) {
          currentUserInSession = true;
          if (data.challengeRequest) {
            setIncomingChallenge(data.challengeRequest);
          } else {
            setIncomingChallenge(null);
          }
        }
      });

      setActiveUsers(users);
      setIsJoined(currentUserInSession);
    });

    return () => unsubscribe();
  }, [user]);
  
  // 3. Fetch Leaderboard Data
  useEffect(() => {
    if (showLeaderboard) {
      const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
          const { collection, query, orderBy, limit, getDocs, where } = await import("firebase/firestore");
          const usersRef = collection(db, "users");
          
          let q;
          if (leaderboardMode === "weekly") {
            const currentWeekId = getCalendarWeekId();
            q = query(
              usersRef,
              where("lastFocusWeek", "==", currentWeekId),
              where("weeklyFocusMinutes", ">", 0),
              orderBy("weeklyFocusMinutes", "desc"),
              limit(10)
            );
          } else {
            q = query(
              usersRef, 
              where("totalFocusMinutes", ">", 0), 
              orderBy("totalFocusMinutes", "desc"), 
              limit(10)
            );
          }

          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setLeaderboardData(data);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        } finally {
          setLoadingLeaderboard(false);
        }
      };
      fetchLeaderboard();
    }
  }, [showLeaderboard, leaderboardMode]);



  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && isJoined) {
        navigator.sendBeacon(`/api/leave-session?uid=${user.uid}`);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, isJoined]);

  const handleJoinLounge = async () => {
    if (!user || !userData) return;
    try {
      const sessionRef = doc(db, "active_sessions", user.uid);
      await setDoc(sessionRef, {
        uid: user.uid,
        displayName: userData.displayName || "Unknown User",
        characterTier: getTierFromXP(userData.totalXP || 0),
        gender: userData.gender || "male",
        status: "idle",
        taskMessage: taskMessage,
        duration: selectedDuration,
        lastActive: serverTimestamp(),
      });
      setIsJoined(true);
      setViewMode("lounge");
    } catch (error) {
      console.error("Error joining lobby:", error);
    }
  };

  const handleLeaveLounge = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "active_sessions", user.uid));
      setIsJoined(false);
      setViewMode("selection");
    } catch (error) {
      console.error("Error leaving lobby:", error);
    }
  };

  const handleStartSolo = async () => {
    // ถ้าเคยอยู่ในห้องรวม ให้ทำการ Leave Lounge ก่อนเข้าโหมด Solo ครับ
    if (isJoined) await handleLeaveLounge();
    
    // ล้างข้อมูลเวลาเก่าทิ้งให้เกลี้ยงก่อนไปหน้าใหม่ เพื่อให้เริ่มแบบสะอาดๆ
    localStorage.removeItem("deepWork_endTime");
    localStorage.removeItem("deepWork_selectedTime");
    
    localStorage.setItem("deepWork_mode", "solo");
    // ไม่เซ็ต autoStart เพื่อให้ผู้ใช้ไปเลือกเวลาเองในหน้าจับเวลา
    router.push("/tools/deep-work");
  };

  const handleStartLoungeFocus = async () => {
    if (!isJoined) {
      await handleJoinLounge();
    } else {
      // อัปเดตเป้าหมายล่าสุดก่อนเริ่มจริง
      await updateDoc(doc(db, "active_sessions", user!.uid), { 
        taskMessage,
        duration: selectedDuration 
      });
    }
    
    // ล้างข้อมูลเวลาเก่าทิ้งให้เกลี้ยง
    localStorage.removeItem("deepWork_endTime");
    localStorage.removeItem("deepWork_selectedTime");
    
    localStorage.setItem("deepWork_mode", "lounge");
    localStorage.setItem("deepWork_autoStart", "true");
    localStorage.setItem("deepWork_duration", selectedDuration.toString());
    router.push("/tools/deep-work");
  };

  const handleSendChallenge = async (targetUid: string) => {
    if (!user || !userData || !isJoined) return;
    try {
      await updateDoc(doc(db, "active_sessions", targetUid), {
        challengeRequest: {
          fromUid: user.uid,
          fromName: userData.displayName || "Unknown User",
          fromTask: taskMessage || "ตั้งใจทำงาน",
          duration: selectedDuration
        }
      });
      setShowSentToast(true);
      setTimeout(() => setShowSentToast(false), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!user || !incomingChallenge) return;
    try {
      await updateDoc(doc(db, "active_sessions", user.uid), {
        challengeRequest: deleteField()
      });
      setIncomingChallenge(null);
      
      // ล้างข้อมูลเวลาเก่าทิ้งให้เกลี้ยง
      localStorage.removeItem("deepWork_endTime");
      localStorage.removeItem("deepWork_selectedTime");

      localStorage.setItem("deepWork_mode", "lounge");
      localStorage.setItem("deepWork_autoStart", "true");
      localStorage.setItem("deepWork_duration", incomingChallenge.duration.toString());
      router.push("/tools/deep-work");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineChallenge = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "active_sessions", user.uid), {
        challengeRequest: deleteField()
      });
      setIncomingChallenge(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendNudge = async (targetUid: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "active_sessions", targetUid), {
        nudges: increment(1)
      });
      setShowSentToast(true);
      setTimeout(() => setShowSentToast(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getTierFromXP = (xp: number) => {
    const level = Math.floor(xp / 100) + 1;
    if (level >= 30) return "legacy";
    if (level >= 20) return "architect";
    if (level >= 10) return "master";
    return "rookie";
  };

  const getAvatarPath = (tier: string, gender: string) => {
    const suffix = gender === 'female' ? '-w' : '';
    return `/avatars/${tier}-meditation${suffix}.png`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#020813] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin z-10" />
      </div>
    );
  }

  const focusingCount = activeUsers.filter(u => u.status === 'focusing').length;
  const idleCount = activeUsers.filter(u => u.status === 'idle').length;

  return (
    <div className={`min-h-[100dvh] bg-[#020813] text-blue-50 p-4 sm:p-8 pb-20 sm:pb-8 relative overflow-hidden flex flex-col ${inter.className}`}>

      {/* Futuristic Blue Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <header className="relative z-20 flex items-center justify-between mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => viewMode === "lounge" ? setViewMode("selection") : router.push("/dashboard?tab=resources")}
            className="p-3 rounded-full bg-blue-900/20 backdrop-blur-md border border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-800/40 transition-all shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-400">
              ระบบห้องสมาธิ
            </h1>
            <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest">เลือกรูปแบบการฝึกฝน</p>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="p-3 rounded-full bg-blue-900/20 backdrop-blur-md border border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-800/40 transition-all shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-3 rounded-full bg-blue-900/20 backdrop-blur-md border border-amber-500/20 text-amber-400 hover:text-white hover:bg-amber-800/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <Trophy size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === "selection" ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center relative z-10"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">วันนี้คุณอยากโฟกัสแบบไหน?</h2>
              <p className="text-blue-200/80 font-medium">เลือกสภาพแวดล้อมที่เหมาะกับเป้าหมายของคุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

              {/* Solo Mode Card */}
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={handleStartSolo}
                className="group cursor-pointer relative rounded-[2rem] bg-blue-950/20 backdrop-blur-xl border border-blue-500/10 p-8 sm:p-10 overflow-hidden flex flex-col items-center text-center transition-all hover:bg-blue-900/30 hover:border-blue-400/30 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020813]/80 pointer-events-none" />
                <div className="w-20 h-20 rounded-full bg-blue-900/40 border border-blue-700/50 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <UserIcon size={32} className="text-blue-300" />
                </div>

                <h3 className="text-2xl font-black mb-2 relative z-10 tracking-wide uppercase text-blue-50">ฝึกสมาธิส่วนตัว (Solo)</h3>
                <p className="text-sm text-blue-200/60 leading-relaxed mb-8 relative z-10">
                  จดจ่อกับเป้าหมายของคุณคนเดียว ตัดสิ่งรบกวนภายนอก ให้อยู่ในภวังค์ของคุณ
                </p>

                <div className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/50 border border-blue-900/50 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <Zap size={12} className="text-blue-400 fill-blue-500/20" />
                  <span className="text-blue-300">รับรางวัล: +10 XP</span>
                </div>
              </motion.div>

              {/* Lounge Mode Card */}
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={() => setViewMode("lounge")}
                className="group cursor-pointer relative rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-cyan-500/5 backdrop-blur-xl border border-blue-400/30 p-8 sm:p-10 overflow-hidden flex flex-col items-center text-center transition-all hover:from-blue-600/20 hover:to-cyan-400/10 hover:border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-400/30 transition-colors duration-700" />

                {/* Online Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-blue-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/20 z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-[9px] font-bold text-cyan-300 tracking-widest uppercase">ออนไลน์ {activeUsers.length} คน</span>
                </div>

                <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  <Globe size={32} className="text-cyan-300" />
                </div>

                <h3 className="text-2xl font-black mb-2 relative z-10 tracking-wide uppercase text-cyan-50">ห้องทำงานรวม (Lounge)</h3>
                <p className="text-sm text-cyan-100/70 leading-relaxed mb-8 relative z-10">
                  เข้าห้องรวมเพื่อดูเป้าหมายเพื่อนๆ ท้าทายกัน และสร้างวินัยไปพร้อมกัน
                </p>

                <div className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <Sparkles size={12} className="text-cyan-300" />
                  <span className="text-cyan-200">โบนัสห้องรวม: +15 XP</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

        ) : (

          /* Lounge View */
          <motion.div
            key="lounge"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10 mt-4"
          >
            {/* --- ⚡ Focus Synergy Background Effect --- */}
            <AnimatePresence>
              {focusingCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-blue-600/5 to-purple-500/10 animate-pulse duration-[4000ms]" />
                  
                  {/* Floating Synergy Particles (Simulated with Blur Orbs) */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        scale: 0,
                        opacity: 0 
                      }}
                      animate={{ 
                        y: [null, "-20%", "120%"],
                        scale: [0, 1.5, 0],
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{ 
                        duration: 8 + Math.random() * 10,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: "linear"
                      }}
                      className="absolute w-64 h-64 bg-cyan-400/10 blur-[100px] rounded-full"
                    />
                  ))}

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-cyan-500/5 rounded-full scale-[1.5] animate-[spin_60s_linear_infinite]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left Side: My Status (Glassmorphism) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <div className="bg-blue-950/30 backdrop-blur-2xl border border-blue-500/20 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80" />

                <h2 className="text-xs font-black text-blue-300/50 uppercase tracking-widest mb-8 text-center">ข้อมูลตัวตนของคุณ</h2>

                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
                    <img
                      src={getAvatarPath(getTierFromXP(userData?.totalXP || 0), userData?.gender || 'male')}
                      alt="My Avatar"
                      className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[9px] font-bold text-blue-200/50 uppercase tracking-widest mb-3 block">เป้าหมายในวันนี้</label>
                  <input
                    type="text"
                    value={taskMessage}
                    onChange={(e) => setTaskMessage(e.target.value)}
                    onBlur={() => {
                      if (isJoined && user) {
                        updateDoc(doc(db, "active_sessions", user.uid), { taskMessage });
                      }
                    }}
                    placeholder="เช่น อ่านหนังสือแนวพัฒนาตัวเองกัน"
                    className="w-full bg-[#020813]/60 backdrop-blur-md border border-blue-800/50 rounded-2xl px-5 py-4 text-sm text-blue-50 focus:outline-none focus:border-cyan-500/50 focus:bg-blue-900/20 transition-all shadow-inner placeholder:text-blue-200/30"
                  />
                </div>

                <div className="mb-8">
                  <label className="text-[9px] font-bold text-blue-200/50 uppercase tracking-widest mb-3 block">เลือกระยะเวลา</label>
                  <div className="flex gap-2">
                    {[15, 25, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setSelectedDuration(mins);
                          if (isJoined && user) {
                            updateDoc(doc(db, "active_sessions", user.uid), { duration: mins });
                          }
                        }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all border ${selectedDuration === mins
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-blue-900/20 text-blue-300 border-blue-500/20 hover:border-blue-400/50'
                          }`}
                      >
                        {mins} MIN
                      </button>
                    ))}
                  </div>
                </div>

                {!isJoined ? (
                  <button
                    onClick={handleJoinLounge}
                    className="w-full bg-blue-100 text-blue-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    <Globe size={16} /> เข้าสู่ห้องทำงานรวม
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleStartLoungeFocus}
                      disabled={activeUsers.length < 2}
                      className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeUsers.length >= 2
                        ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                        : "bg-blue-900/30 text-blue-400/40 border border-blue-800/30 cursor-not-allowed"
                        }`}
                    >
                      {activeUsers.length >= 2 ? (
                        <><Play size={16} fill="currentColor" /> เริ่มจับเวลาโฟกัส</>
                      ) : (
                        <><Users size={16} /> รอเพื่อนเข้าห้องอย่างน้อย 1 คน</>
                      )}
                    </button>
                    <button
                      onClick={handleLeaveLounge}
                      className="w-full bg-blue-900/20 text-blue-300/60 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800/40 hover:text-blue-100 transition-all border border-blue-500/10"
                    >
                      ออกจากห้อง
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Lounge Area (Glassmorphism Grid) */}
            <div className="w-full lg:w-2/3 flex flex-col">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xs font-black text-blue-300/60 uppercase tracking-widest">สถานะเครือข่าย</h2>
                <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase">
                  <span className="text-cyan-400 flex items-center gap-1.5"><Zap size={10} className="fill-cyan-400/50" /> กำลังโฟกัส {focusingCount}</span>
                  <span className="text-blue-400 flex items-center gap-1.5"><Globe size={10} /> อยู่ในห้อง {idleCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                <AnimatePresence>
                  {activeUsers.map((u) => (
                    <motion.div
                      key={u.uid}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`relative backdrop-blur-xl rounded-[2rem] p-5 flex flex-col items-center text-center transition-all overflow-hidden ${u.status === 'focusing'
                        ? 'bg-cyan-900/10 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                        : 'bg-blue-900/10 border border-blue-500/10 hover:bg-blue-800/20 hover:border-blue-400/20'
                        }`}
                    >
                      {/* Aura effect for focusing users */}
                      {u.status === 'focusing' && (
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
                      )}

                      {/* Duration Badge - Top Right (Clock Style) */}
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/30 z-20 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <span className="text-[11px] font-black text-blue-50 leading-none">
                          {u.duration || 25}
                        </span>
                        <span className="text-[6px] font-bold text-blue-400 uppercase tracking-tighter mt-0.5">
                          MIN
                        </span>
                      </div>

                      <div className="relative mb-4 mt-2">
                        {u.status === 'focusing' && (
                          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                        )}
                        <img
                          src={getAvatarPath(u.characterTier, u.gender)}
                          alt={u.displayName}
                          className={`w-20 h-20 object-contain relative z-10 transition-all duration-500 ${u.status === 'idle' ? 'opacity-70 drop-shadow-none' : 'drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110'}`}
                        />
                      </div>

                      <h3 className="text-xs font-black text-blue-50 mb-1 truncate w-full tracking-wide">{u.displayName}</h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 truncate w-full ${u.status === 'focusing' ? 'text-cyan-400' : 'text-blue-300/50'}`}>
                        {u.status === 'focusing' ? 'กำลังโฟกัส' : 'รอในห้อง'}
                      </p>

                      {/* User's Goal */}
                      <div className="w-full flex flex-col gap-1.5 mb-4">
                        <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                          <p className="text-[10px] text-blue-200/60 leading-tight line-clamp-2">
                            "{u.taskMessage || 'ตั้งใจโฟกัส'}"
                          </p>
                        </div>
                      </div>

                      {u.uid !== user?.uid && (
                        <button
                          onClick={() => handleSendChallenge(u.uid)}
                          disabled={u.status === 'focusing' || !isJoined}
                          className={`w-full mt-auto py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all group border ${u.status === 'focusing'
                            ? 'bg-cyan-500/5 border-cyan-500/10 text-cyan-500/40 cursor-not-allowed'
                            : !isJoined
                              ? 'bg-blue-950/20 border-blue-500/10 text-blue-500/40 cursor-not-allowed'
                              : 'bg-blue-950/50 border-blue-500/20 text-blue-300/70 hover:bg-blue-800/50 hover:text-blue-100'
                            }`}>
                          <Swords size={12} className={u.status === 'focusing' || !isJoined ? 'text-cyan-500/40' : 'group-hover:text-yellow-400 transition-colors'} />
                          {u.status === 'focusing' ? 'กำลังโฟกัส' : 'ท้าทาย'}
                        </button>
                      )}
                      {u.uid === user?.uid && (
                        <div className="w-full mt-auto py-2.5 text-blue-200/30 text-[9px] font-black uppercase tracking-widest bg-blue-950/30 rounded-xl border border-blue-500/10">
                          คุณ
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {activeUsers.length === 0 && (
                    <div className="col-span-full py-24 text-center flex flex-col items-center bg-blue-900/10 backdrop-blur-md rounded-[2rem] border border-blue-500/10">
                      <div className="w-16 h-16 rounded-full bg-blue-800/20 flex items-center justify-center mb-4">
                        <Globe size={24} className="text-blue-400/30" />
                      </div>
                      <p className="text-sm font-black text-blue-200/60 uppercase tracking-widest">ยังไม่มีใครอยู่ในห้อง</p>
                      <p className="text-[10px] text-blue-300/40 mt-2 tracking-widest uppercase">เป็นคนแรกที่เข้าสู่ห้องทำงานรวม</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Popup */}
      <AnimatePresence>
        {incomingChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[6.5rem] md:bottom-8 right-4 md:right-8 z-[10001] bg-[#020813]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-5 shadow-2xl w-[calc(100%-2rem)] md:w-80"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-[13px]">{incomingChallenge.fromName} <span className="text-white/40 font-normal">กำลังเชิญคุณ</span></h4>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Focus Challenge</p>
                </div>
                <div className="absolute top-5 right-5 flex items-center gap-2 bg-[#020813] border border-white/5 rounded-2xl px-3 py-2 shadow-xl">
                  <Clock size={14} className="text-cyan-400" />
                  <span className="text-[12px] font-black text-white">{incomingChallenge.duration} นาที</span>
                </div>
              </div>

              <div className="px-1">
                <p className="text-[13px] text-white/90 leading-relaxed font-medium">"{incomingChallenge.fromTask}"</p>
              </div>


              <div className="flex items-center gap-2 mt-1">
                <button onClick={handleDeclineChallenge} className="flex-1 py-3 rounded-2xl text-[10px] font-bold text-white/50 hover:bg-white/5 hover:text-white transition-all">
                  ไว้คราวหน้า
                </button>
                <button onClick={handleAcceptChallenge} className="flex-1 bg-white text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  เริ่มจับเวลา
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showSentToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[7rem] md:bottom-10 left-1/2 -translate-x-1/2 z-[10002] bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-100 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-xs font-black tracking-widest uppercase">ส่งคำท้าเรียบร้อย!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[#020813]/80 backdrop-blur-xl" onClick={() => setShowRules(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-blue-950/40 border border-blue-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                  <Info size={24} className="text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">กติกาการโฟกัส</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Focus Room Guidelines</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/10 text-blue-300">01</div>
                  <div>
                    <h4 className="text-sm font-black text-blue-100 mb-1">เลือกโหมดที่ต้องการ</h4>
                    <p className="text-xs text-blue-300/60 leading-relaxed">Solo เพื่อฝึกคนเดียว (+10 XP) หรือ Lounge เพื่อรวมกลุ่มกับเพื่อน (+15 XP)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/10 text-blue-300">02</div>
                  <div>
                    <h4 className="text-sm font-black text-blue-100 mb-1">ตั้งเป้าหมาย & เข้าห้อง</h4>
                    <p className="text-xs text-blue-300/60 leading-relaxed">พิมพ์เป้าหมายของคุณแล้วกด "เข้าสู่ห้องทำงานรวม" เพื่อให้เพื่อนๆ เห็นสถานะของคุณ</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/10 text-blue-300">03</div>
                  <div>
                    <h4 className="text-sm font-black text-blue-100 mb-1">ท้าทายเพื่อน (Challenge)</h4>
                    <p className="text-xs text-blue-300/60 leading-relaxed">กดท้าทายเพื่อนที่ "รอในห้อง" เพื่อสะกิดให้เริ่มโฟกัสไปพร้อมกัน</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-white/10 text-blue-300">04</div>
                  <div>
                    <h4 className="text-sm font-black text-blue-100 mb-1">รับรางวัล XP</h4>
                    <p className="text-xs text-blue-300/60 leading-relaxed">ต้องโฟกัสจนจบนาฬิกาเท่านั้นถึงจะได้รับแต้ม หากกดออกก่อนจะไม่ได้ XP ในรอบนั้น</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full mt-10 bg-white text-blue-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                เข้าใจแล้ว
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[#020813]/90 backdrop-blur-2xl" onClick={() => setShowLeaderboard(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-blue-950/40 border border-blue-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-cyan-400" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                    <Trophy size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">หอเกียรติยศแห่งการโฟกัส</h3>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Focus Hall of Fame</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-blue-500/10 mb-6 shadow-inner">
                <button
                  onClick={() => setLeaderboardMode("weekly")}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${leaderboardMode === "weekly" ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400/50 hover:text-blue-300'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setLeaderboardMode("allTime")}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${leaderboardMode === "allTime" ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400/50 hover:text-blue-300'}`}
                >
                  All Time
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 px-4 py-2.5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <Info size={14} className="text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-300/70 font-bold uppercase tracking-wider leading-relaxed">
                  {leaderboardMode === 'weekly' 
                    ? `อันดับประจำสัปดาห์ (${(() => {
                        const start = getStartOfMonday(new Date());
                        const end = new Date(start);
                        end.setDate(start.getDate() + 6);
                        const options = { month: 'short', day: 'numeric' } as const;
                        return `${start.toLocaleDateString('th-TH', options)} - ${end.toLocaleDateString('th-TH', options)}`;
                      })()})` 
                    : "อันดับคำนวณจากเวลาโฟกัสรวมทั้งหมดตั้งแต่เริ่มต้น"}
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar min-h-[200px] flex flex-col justify-start">
                {loadingLeaderboard ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">กำลังดึงข้อมูลระดับตำนาน...</p>
                  </div>
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((item, idx) => {
                    const rank = idx + 1;
                    const tier = getTierFromXP(item.totalXP || 0);
                    const focusValue = leaderboardMode === 'weekly' ? (item.weeklyFocusMinutes || 0) : (item.totalFocusMinutes || 0);
                    const hours = Math.floor(focusValue / 60);
                    const mins = focusValue % 60;
                    
                    return (
                      <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${rank === 1 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-900/10 border-blue-500/10'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                          rank === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                          rank === 2 ? 'bg-slate-300 text-black' :
                          rank === 3 ? 'bg-amber-800 text-white' : 'text-blue-400 border border-blue-500/20'
                        }`}>
                          {rank}
                        </div>
                        
                        <img 
                          src={getAvatarPath(tier, item.gender || 'male')} 
                          alt="" 
                          className={`w-10 h-10 object-contain drop-shadow-sm ${rank === 1 ? 'scale-125' : ''}`}
                        />
    
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{item.displayName || "Unknown Spirit"}</h4>
                          <p className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold">{tier}</p>
                        </div>
    
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-blue-50">{hours}h {mins}m</div>
                          <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">LV. {Math.floor((item.totalXP || 0) / 100) + 1}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-50">
                    <Trophy size={48} className="text-blue-900 mb-4" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">ยังไม่มีข้อมูลอันดับในขณะนี้</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full mt-8 bg-white text-blue-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
