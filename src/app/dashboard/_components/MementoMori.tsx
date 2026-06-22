"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { Sparkles, MessageSquare, Coffee, Flame, Heart, Info, Clock, RotateCcw } from "lucide-react";

interface MementoMoriProps {
  userData: any;
}

// --- ⏳ Hourglass Dynamic Timeline Widget ---
export const HourglassWidget: React.FC<MementoMoriProps> = ({ userData }) => {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [currentMin, setCurrentMin] = useState<number>(new Date().getMinutes());
  const [choiceMade, setChoiceMade] = useState<string | null>(null);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMin(now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Time remaining until Midnight
  const timeRemaining = useMemo(() => {
    const hours = 23 - currentHour;
    const mins = 59 - currentMin;
    return { hours, mins };
  }, [currentHour, currentMin]);

  // Determine Time Slot
  // Morning: 06:00 - 11:59
  // Afternoon: 12:00 - 16:59
  // Evening: 17:00 - 23:59
  // Rebirth: 00:00 - 05:59
  const timeSlot = useMemo(() => {
    if (currentHour >= 6 && currentHour < 12) return "morning";
    if (currentHour >= 12 && currentHour < 17) return "afternoon";
    if (currentHour >= 17 && currentHour <= 23) return "evening";
    return "rebirth";
  }, [currentHour]);

  // Calculate Yesterday's Focus Minutes for Rebirth Legacy Reward
  const yesterdayLegacy = useMemo(() => {
    if (!userData || !userData.focusReflections) return "เมื่อวานคุณฝากทักษะการเรียนรู้ไว้บนโลกนี้สำเร็จ";

    const bangkokTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    const todayBangkok = new Date(bangkokTime);
    todayBangkok.setHours(0, 0, 0, 0);

    const yesterdayBangkok = new Date(todayBangkok);
    yesterdayBangkok.setDate(yesterdayBangkok.getDate() - 1);

    const yesterdayStr = yesterdayBangkok.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const yesterdayReflections = userData.focusReflections.filter((ref: any) => {
      if (!ref.date) return false;
      const refLocalDate = new Date(ref.date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
      return refLocalDate === yesterdayStr;
    });

    const totalMins = yesterdayReflections.reduce((sum: number, ref: any) => sum + (ref.duration || 0), 0);

    if (totalMins > 0) {
      const topics = yesterdayReflections.map((ref: any) => ref.text).filter(Boolean);
      const topicStr = topics.length > 0 ? `ทักษะ "${topics[0].substring(0, 20)}"` : "ทักษะการเรียนรู้";
      return `เมื่อวานคุณฝาก ${topicStr} ไว้บนโลกนี้เพิ่มขึ้น ${totalMins} นาที`;
    }

    return "เมื่อวานคุณเริ่มก้าวข้ามขีดจำกัดตัวเอง และจารึกก้าวแรกไว้บนโลกใบนี้";
  }, [userData]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#F7F7F7] border border-slate-200 text-[#1A1A1A] rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden h-full min-h-[350px] transition-all duration-500 hover:shadow-xl hover:border-slate-300 group"
    >
      {/* Dynamic Workspace Shadow Gradient Effect based on slot */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 opacity-20 z-0 ${
          timeSlot === "morning"
            ? "bg-gradient-to-tr from-amber-200/40 via-transparent to-transparent"
            : timeSlot === "afternoon"
            ? "bg-gradient-to-b from-transparent via-slate-300/30 to-transparent"
            : timeSlot === "evening"
            ? "bg-gradient-to-br from-transparent via-indigo-900/10 to-slate-900/25"
            : "bg-gradient-to-tr from-white via-amber-100/30 to-white"
        }`}
      />

      {/* Top Bar Indicators */}
      <div className="flex justify-between items-center relative z-10 w-full border-b border-slate-200/80 pb-4 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
          <Clock size={12} />
          {timeSlot === "rebirth" ? "The New Dawn" : "The Last 24 Hours"}
        </span>
        {timeSlot !== "rebirth" && (
          <span className="text-[10px] font-black text-[#1A1A1A] bg-slate-200/60 px-3 py-1 rounded-full whitespace-nowrap">
            เหลือเวลาอีก {timeRemaining.hours} ชม. {timeRemaining.mins} นาที
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center my-4">
        <AnimatePresence mode="wait">
          {timeSlot === "morning" && (
            <motion.div
              key="morning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              {/* Desk Shadow/Sun animation */}
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-3xl mb-6 shadow-inner animate-pulse">
                🌅
              </div>
              <p className="text-base md:text-lg font-bold leading-relaxed text-slate-800 px-2 max-w-[280px]">
                "แดดเช้าวันสุดท้ายมาแล้ว วันนี้จะก้าวข้ามขีดจำกัดตัวเอง หรือปล่อยผ่านไป? มาร่วมเริ่มบทเรียนแรกกัน"
              </p>
            </motion.div>
          )}

          {timeSlot === "afternoon" && (
            <motion.div
              key="afternoon"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              {/* Hourglass SVG with falling sand animation */}
              <div className="relative w-16 h-16 mb-6">
                <svg className="w-full h-full text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 2h14v2H5V2zM5 22h14v-2H5v2z" />
                  <path d="M19 4v3.5c0 2.2-1.8 4-4 4h-2M5 4v3.5c0 2.2 1.8 4 9 4h2" strokeLinecap="round" />
                  <path d="M19 20v-3.5c0-2.2-1.8-4-4-4h-2M5 20v-3.5c0-2.2 1.8-4 4-4h2" strokeLinecap="round" />
                  {/* Bottom Sand Pile */}
                  <path d="M7 19c2-1 6-1 8 0H7z" fill="currentColor" opacity="0.3" />
                </svg>
                {/* Dripping Sand Dot */}
                <div className="absolute top-[32px] left-[31px] w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce" />
              </div>

              <p className="text-[14px] md:text-[15px] font-bold leading-relaxed text-slate-800 mb-6 px-4">
                "ครึ่งวันสุดท้ายเริ่มต้นขึ้นแล้ว นาฬิกาทรายเหลือเวลาอีกแค่ 12 ชั่วโมงเท่านั้น คุณใช้ครึ่งเช้าคุ้มค่าหรือยัง? สะสมความรู้ตอนนี้เลยไหม?"
              </p>

              {/* Interactive choices */}
              {!choiceMade ? (
                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                  <button
                    onClick={() => setChoiceMade("fight")}
                    className="py-3 px-4 bg-[#1A1A1A] text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                  >
                    ฉันจะลุยต่อ!
                  </button>
                  <button
                    onClick={() => setChoiceMade("reflect")}
                    className="py-3 px-4 bg-white border border-slate-200 text-[#1A1A1A] text-xs font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    ขอนั่งทบทวนแป๊บนะ
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 font-bold max-w-[280px] shadow-sm flex items-center justify-between"
                >
                  <span>
                    {choiceMade === "fight"
                      ? "⚡ คุณเลือกที่จะลุยต่อ! ลุยบทเรียนถัดไปได้เลย"
                      : "🧘‍♂️ ถอยกลับมาทบทวนสิ่งสำคัญเงียบๆ ก่อนลุยต่อครับ"}
                  </span>
                  <button onClick={() => setChoiceMade(null)} className="text-slate-400 hover:text-slate-900 ml-2">
                    <RotateCcw size={14} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {timeSlot === "evening" && (
            <motion.div
              key="evening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mb-6 shadow-inner animate-pulse">
                🌌
              </div>
              <p className="text-base md:text-lg font-bold leading-relaxed text-slate-800 px-2 max-w-[280px]">
                "พระอาทิตย์ตกครั้งสุดท้ายผ่านไปแล้ว คอร์สที่นั่งฝึกฝนอยู่ตอนนี้ จะเป็นสิ่งที่คุณภูมิใจที่สุดก่อนนอนรึเปล่า? ลุยให้จบนะ"
              </p>
            </motion.div>
          )}

          {timeSlot === "rebirth" && (
            <motion.div
              key="rebirth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-amber-100 animate-bounce-slow">
                  ✨
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  ยินดีด้วย!
                </h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
                  คุณได้โอกาสใช้ชีวิตใหม่อีกครั้ง
                </p>
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm max-w-[260px] text-xs font-bold leading-relaxed text-slate-700">
                  🧬 <b>Legacy Reward:</b>
                  <p className="mt-1 text-slate-500 italic">
                    {yesterdayLegacy}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info link */}
      <div className="text-center mt-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Memento Mori · ทุกวินาทีมีความหมาย
        </p>
      </div>
    </motion.div>
  );
};

// --- 🌿 The Tree of Regrets Widget (Community ไร้ตัวตน) ---
interface RegretItem {
  id: string;
  text: string;
  reactions?: {
    coffee?: number;
    fire?: number;
  };
}

export const TreeOfRegrets: React.FC = () => {
  const [regrets, setRegrets] = useState<RegretItem[]>([]);
  const [newRegret, setNewRegret] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userReacted, setUserReacted] = useState<Record<string, string[]>>({}); // regretId -> list of reactions

  // Load reacted regrets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("memento_reacted_regrets");
      if (stored) {
        setUserReacted(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch recent regrets from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "regrets"),
      orderBy("createdAt", "desc"),
      limit(15)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RegretItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as RegretItem);
      });
      setRegrets(list);
    }, (error) => {
      console.error("Error reading regrets:", error);
    });

    return () => unsubscribe();
  }, []);

  // Submit new regret
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegret.trim() || newRegret.length > 100 || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "regrets"), {
        text: newRegret.trim(),
        createdAt: serverTimestamp(),
        reactions: {
          coffee: 0,
          fire: 0
        }
      });
      setNewRegret("");
    } catch (err) {
      console.error("Failed to add regret:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Reaction
  const handleReaction = async (regretId: string, type: "coffee" | "fire") => {
    const currentReactions = userReacted[regretId] || [];
    if (currentReactions.includes(type)) return; // Already reacted this type

    try {
      // Update Firestore count
      const docRef = doc(db, "regrets", regretId);
      await updateDoc(docRef, {
        [`reactions.${type}`]: increment(1)
      });

      // Save locally
      const updated = {
        ...userReacted,
        [regretId]: [...currentReactions, type]
      };
      setUserReacted(updated);
      localStorage.setItem("memento_reacted_regrets", JSON.stringify(updated));
    } catch (e) {
      console.error("Reaction update failed:", e);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#F7F7F7] border border-slate-200 text-[#1A1A1A] rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden h-full min-h-[350px] transition-all duration-500 hover:shadow-xl hover:border-slate-300 group"
    >
      {/* Ambient background light */}
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-slate-200/30 to-transparent blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Top Bar Header */}
      <div className="flex justify-between items-center relative z-10 w-full border-b border-slate-200/80 pb-4 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
          <MessageSquare size={12} />
          The Tree of Regrets
        </span>
        <span className="text-[9px] font-black text-slate-400 bg-slate-200/30 px-2 py-0.5 rounded uppercase tracking-wider">
          Anonymous
        </span>
      </div>

      {/* Content Columns: Left Tree Graphic, Right Feed & Form */}
      <div className="relative z-10 flex-1 flex flex-col md:grid md:grid-cols-[100px_1fr] gap-4 min-h-0">
        
        {/* Left Side: Minimalist Pixel Art Styled SVG Tree */}
        <div className="hidden md:flex flex-col items-center justify-center border-r border-slate-200/50 pr-4">
          <svg className="w-16 h-20 text-[#1A1A1A]" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Trunk */}
            <path d="M12 28v-12M10 28h4M9 22h6M11 16l-3-3M13 16l3-3M12 11V6" strokeLinecap="round" />
            {/* Leaves block / minimal circles */}
            <circle cx="12" cy="7" r="4" className="fill-[#E0E0E0] stroke-[#1A1A1A]" strokeWidth="1.5" />
            <circle cx="8" cy="11" r="3" className="fill-[#F7F7F7] stroke-[#1A1A1A]" strokeWidth="1.5" />
            <circle cx="16" cy="11" r="3" className="fill-[#FAFAFA] stroke-[#1A1A1A]" strokeWidth="1.5" />
            {/* Falling Leaf animation */}
            <path d="M8 20c-1 1-1 3 0 4s3 0 3-2" strokeWidth="1" className="animate-bounce" />
          </svg>
          <span className="text-[8px] font-black text-slate-400 uppercase mt-2 text-center">
            Tree of Regrets
          </span>
        </div>

        {/* Right Side: Feed & Text Box */}
        <div className="flex flex-col h-full min-h-0">
          
          {/* Recent Regrets Feed List */}
          <div className="flex-1 overflow-y-auto max-h-[140px] space-y-2 pr-1.5 mb-4 scrollbar-thin text-left">
            {regrets.length === 0 ? (
              <p className="text-[11px] font-bold text-slate-400 italic text-center py-6">
                ยังไม่มีการฝากความเสียใจ... มาร่วมระบายเพื่อก้าวข้ามไปด้วยกัน
              </p>
            ) : (
              regrets.map((regret) => {
                const reactedCoffee = userReacted[regret.id]?.includes("coffee");
                const reactedFire = userReacted[regret.id]?.includes("fire");
                return (
                  <div
                    key={regret.id}
                    className="p-3 bg-white border border-slate-100 rounded-2xl shadow-inner-sm text-[11px] font-medium leading-relaxed text-slate-700 flex flex-col justify-between gap-2 hover:border-slate-300 transition-colors"
                  >
                    <p className="break-words">"{regret.text}"</p>
                    
                    {/* Reactions Toolbar */}
                    <div className="flex items-center gap-3 mt-1 border-t border-slate-50 pt-1.5">
                      <button
                        onClick={() => handleReaction(regret.id, "coffee")}
                        disabled={reactedCoffee}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold transition-all ${
                          reactedCoffee
                            ? "bg-slate-100 border-transparent text-[#1A1A1A]"
                            : "bg-white border-slate-100 text-slate-400 hover:text-[#1A1A1A] hover:bg-slate-50"
                        }`}
                        title="ส่งกาแฟให้กำลังใจ"
                      >
                        <span>☕</span>
                        <span>{regret.reactions?.coffee || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => handleReaction(regret.id, "fire")}
                        disabled={reactedFire}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold transition-all ${
                          reactedFire
                            ? "bg-slate-100 border-transparent text-[#1A1A1A]"
                            : "bg-white border-slate-100 text-slate-400 hover:text-[#1A1A1A] hover:bg-slate-50"
                        }`}
                        title="ส่งกองไฟให้ความอบอุ่น"
                      >
                        <span>🪵</span>
                        <span>{regret.reactions?.fire || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="mt-auto border-t border-slate-200/60 pt-3 flex flex-col gap-2">
            <textarea
              value={newRegret}
              onChange={(e) => setNewRegret(e.target.value.substring(0, 100))}
              placeholder="ถ้าต้องจากไปวันนี้ เรื่องเรียน/เรื่องชีวิตไหนที่คุณเสียดายที่สุด? (ไม่เกิน 100 ตัวอักษร)"
              className="w-full h-12 p-2.5 text-[11px] font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none resize-none focus:border-[#1A1A1A] transition-colors placeholder:text-slate-400"
              maxLength={100}
            />
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400">
                {newRegret.length}/100 ตัวอักษร
              </span>
              <button
                type="submit"
                disabled={!newRegret.trim() || submitting}
                className="px-4 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-black rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
              >
                {submitting ? "กำลังส่ง..." : "ฝากใบไม้แห่งความเสียใจ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
