"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, ArrowLeft, Bot, User as UserIcon,
  MessageSquare, History, Zap, BrainCircuit, Lightbulb, Target, TrendingUp,
  AlertCircle, Lock, Battery, Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit, setDoc, increment, addDoc, serverTimestamp, onSnapshot, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SoulGuidePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dynamicButtons, setDynamicButtons] = useState<string[]>([]);
  const [chatQuota, setChatQuota] = useState({ used: 0, total: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false); // 👈 เพิ่มสถานะ Modal ยืนยันล้างแชท
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userName = currentUser.displayName || 'นักเดินทาง';

        // 1. Listen to User Base Data
        const userRef = doc(db, "users", currentUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const baseData = docSnap.data();
            const level = Math.floor((baseData.totalXP || 0) / 100) + 1;
            // ✅ [NO ENERGY LIMIT] ทุกคนใช้ได้ไม่จำกัด
            setChatQuota({ used: 0, total: Infinity });
            setUserData((prev: any) => ({ ...prev, ...baseData, level }));
          }
        });
        unsubs.push(unsubUser);

        // 2. Listen to DISC
        const unsubDisc = onSnapshot(query(collection(db, "discResults"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)), (snap) => {
          if (!snap.empty) setUserData((prev: any) => ({ ...prev, lastDisc: snap.docs[0].data() }));
        });
        unsubs.push(unsubDisc);

        // 3. Listen to Money Avatar
        const unsubMoney = onSnapshot(query(collection(db, "quiz_results"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)), (snap) => {
          if (!snap.empty) setUserData((prev: any) => ({ ...prev, lastMoney: snap.docs[0].data() }));
        });
        unsubs.push(unsubMoney);

        // 4. Listen to Library Souls
        const unsubSoul = onSnapshot(query(collection(db, "users", currentUser.uid, "library_souls"), orderBy("createdAt", "desc"), limit(1)), (snap) => {
          if (!snap.empty) setUserData((prev: any) => ({ ...prev, lastLibrarySoul: snap.docs[0].data() }));
        });
        unsubs.push(unsubSoul);

        // 5. Listen to Wheel of Life
        const unsubWheel = onSnapshot(query(collection(db, "users", currentUser.uid, "assessments"), orderBy("createdAt", "desc"), limit(1)), (snap) => {
          if (!snap.empty) {
            const wheelData = snap.docs[0].data();
            const wheelDetails = {
              scores: wheelData.currentScores || wheelData.scores,
              targetScores: wheelData.targetScores,
              goal: wheelData.goal || wheelData.futureGoal,
              analysis: wheelData.analysis,
              focusAreas: wheelData.selectedFocusAreas
            };
            setUserData((prev: any) => ({ ...prev, lastWheel: wheelDetails }));
          }
        });
        unsubs.push(unsubWheel);

        // 6. Listen to Khomsatsat (Mood)
        const unsubQuote = onSnapshot(query(collection(db, "quotes"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)), (snap) => {
          if (!snap.empty) {
            const q = snap.docs[0].data();
            setUserData((prev: any) => ({
              ...prev,
              lastMood: q.mood,
              lastQuote: q.quote,
              lastQuoteWords: q.words,
              lastQuoteTime: q.createdAt?.toMillis() || Date.now()
            }));
          }
        });
        unsubs.push(unsubQuote);

        // 7. Listen to Chat History
        const unsubChat = onSnapshot(query(collection(db, "users", currentUser.uid, "chat_history"), orderBy("createdAt", "desc"), limit(50)), (snapshot) => {
          const history = snapshot.docs.map(doc => ({
            role: doc.data().role as "user" | "assistant",
            content: doc.data().content,
            createdAt: doc.data().createdAt
          })).filter(msg => msg.content).reverse();

          if (history.length > 0) {
            setMessages(history);
          } else {
            const name = userName;
            setMessages([{
              role: "assistant",
              content: `ยินดีที่ได้พบกันครับคุณ **${name}** ✨ ผมพร้อมที่จะเป็นที่ปรึกษาและร่วมเดินทางไปกับการพัฒนาตัวเองของคุณแล้ววันนี้\n\nมีเรื่องไหนที่ติดขัด หรือมีเป้าหมายอะไรที่อยากให้ผมช่วยวิเคราะห์เป็นพิเศษมั้ยครับ? บอกผมได้ทุกเรื่องเลยนะ`
            }]);
          }
        });
        unsubs.push(unsubChat);

      } else {
        router.push("/");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, [router]);
  
  const wheelArea = useMemo(() => {
    if (userData?.lastWheel?.scores && userData?.lastWheel?.targetScores) {
      const gaps = userData.lastWheel.scores.map((current: number, i: number) => ({
        index: i,
        gap: (userData.lastWheel.targetScores[i] || 0) - current,
        label: ["สุขภาพ", "การเงิน", "การงาน", "ครอบครัว", "เพื่อนฝูง", "พัฒนาตนเอง", "จิตใจ", "ช่วยเหลือสังคม"][i]
      }));
      const top3Gaps = [...gaps].sort((a, b) => b.gap - a.gap).slice(0, 3);
      if (todayDateStr && top3Gaps.length > 0) {
        const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
        return top3Gaps[seed % top3Gaps.length].label;
      }
      return top3Gaps[0]?.label || "การงาน";
    }
    return "การงาน";
  }, [userData?.lastWheel, todayDateStr]);

  // 🛡️ [UI Control]: ซ่อน Bottom Navigation เมื่อมี Modal ยืนยัน
  useEffect(() => {
    if (showResetConfirm) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [showResetConfirm]);

  const isFirstScroll = useRef(true);

  useEffect(() => {
    // เลื่อนลงล่างสุดทุกครั้งที่มีการตอบโต้
    if (messages.length > 1) {
      const scrollBehavior = isFirstScroll.current ? "auto" : "smooth";

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: scrollBehavior as any });
        if (isFirstScroll.current) {
          isFirstScroll.current = false;
        }
      }, isFirstScroll.current ? 0 : 100);
    } else if (messages.length === 1) {
      // สำหรับแชทแรก (คำทักทาย) ให้เด้งขึ้นบนสุดเสมอ
      setTimeout(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: isFirstScroll.current ? 'auto' : 'smooth' });
        window.scrollTo({ top: 0, behavior: isFirstScroll.current ? 'auto' : 'smooth' });
        if (isFirstScroll.current && messages[0].role === "assistant") {
          // ถ้ามีแค่ข้อความทักทาย และเป็นครั้งแรก ไม่ต้องปิด flag เพราะอาจจะมีประวัติโหลดมาทีหลัง
          // แต่ปกติประวัติจะโหลดมาทีเดียวใน onSnapshot
        }
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (userData) {
      generateDynamicButtons(userData);
    }
  }, [userData]);

  const generateDynamicButtons = (data: any) => {
    const buttons = [];
    if (data.lastMood) buttons.push(`คุยเรื่องความรู้สึกตอนนี้`);
    if (data.lastWheel?.goal) buttons.push(`สรุปเป้าหมาย`);
    const discType = data.lastDisc?.finalResult || data.lastDisc?.result || "";
    if (discType.includes("D")) buttons.push("สรุปสั้นๆ ตรงประเด็น");
    if (buttons.length < 3) buttons.push("วางแผนพัฒนาตัวเองให้ที");
    setDynamicButtons(buttons.slice(0, 3));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleResetChat = async () => {
    if (!user) return;

    setShowResetConfirm(false);
    setIsLoading(true);
    try {
      const chatHistoryRef = collection(db, "users", user.uid, "chat_history");
      const historySnap = await getDocs(chatHistoryRef);

      const deletePromises = historySnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setTimeout(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error resetting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    // 🚫 ลบการเช็กโควตา Energy ออกเพื่อให้ใช้ได้ Unlimited

    const userMessage: Message = { role: "user", content: messageText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      if (!user) return;
      const chatHistoryRef = collection(db, "users", user.uid, "chat_history");

      // 1. Save User Message
      await addDoc(chatHistoryRef, {
        role: "user",
        content: userMessage.content,
        createdAt: serverTimestamp()
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userData: {
            displayName: userData?.displayName,
            lastDisc: userData?.lastDisc,
            lastMoney: userData?.lastMoney,
            lastLibrarySoul: userData?.lastLibrarySoul,
            lastWheel: userData?.lastWheel,
            lastMood: userData?.lastMood,
            lastQuote: userData?.lastQuote,
            lastQuoteWords: userData?.lastQuoteWords,
            totalFocusMinutes: userData?.totalFocusMinutes,
            characterTier: getCharacterTier(userData?.totalXP || 0),
            level: userData?.level,
            // 🚫 ไม่ต้องบันทึก dailyChatCount แล้ว
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

        // 2. Save Assistant Reply
        await addDoc(chatHistoryRef, {
          role: "assistant",
          content: data.reply,
          createdAt: serverTimestamp()
        });

        // 🚫 [NO USAGE TRACKING]

      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "ขออภัยครับ ระบบเชื่อมต่อขัดข้องนิดหน่อย ลองใหม่อีกครั้งนะครับ" }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const getCharacterTier = (xp: number) => {
    const level = Math.floor(xp / 100) + 1;
    if (level >= 30) return "Legacy";
    if (level >= 20) return "Architect";
    if (level >= 10) return "Master";
    return "Rookie";
  };

  const getAvatarPath = () => {
    const tier = getCharacterTier(userData?.totalXP || 0).toLowerCase();
    const suffix = userData?.gender === 'female' ? '-w' : '';
    return `/avatars/${tier}-static${suffix}.png`;
  };

  return (
    <div className={`min-h-[100dvh] bg-zinc-950 text-white flex flex-col items-center relative overflow-hidden ${inter.className}`}>

      {/* 🌈 Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: isTyping ? [1, 1.2, 1] : 1,
            opacity: isTyping ? [0.1, 0.15, 0.1] : 0.05
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            scale: isTyping ? [1, 1.3, 1] : 1,
            opacity: isTyping ? [0.1, 0.2, 0.1] : 0.05
          }}
          transition={{ repeat: Infinity, duration: 5, delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 blur-[150px] rounded-full"
        />
      </div>


      {/* Header - ซ่อนเมื่อมี Modal ยืนยันล้างแชท */}
      {!showResetConfirm && (
        <header className="w-full max-w-4xl px-6 py-8 flex items-center justify-between z-20 sticky top-0 bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
          <Link href="/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-zinc-400 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isTyping ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
              <h1 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-200">AI MENTOR</h1>
            </div>

            {/* 🏷️ [AI ACTIVE] Status Badge */}
            <div className="flex items-center gap-2 mt-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 uppercase tracking-[0.2em]"
              >
                <Zap size={10} className="fill-blue-400" /> AI ACTIVE
              </motion.div>
            </div>
          </div>

          <motion.div
            animate={isTyping ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl"
          >
            {userData ? (
              <img loading="lazy" decoding="async" src={getAvatarPath()} alt="User Avatar" className="w-full h-full object-cover scale-125 translate-y-1" />
            ) : (
              <UserIcon size={20} className="text-zinc-600" />
            )}
          </motion.div>
        </header>
      )}

      {/* Chat Container */}
      <main ref={mainRef} className="flex-1 w-full max-w-3xl flex flex-col gap-6 p-6 z-10 overflow-y-auto pb-60 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-6 py-4 rounded-[2rem] border relative transition-all duration-300 ${msg.role === "user"
                  ? "bg-zinc-800 border-white/10 rounded-tr-none text-zinc-200"
                  : "bg-white/5 border-white/5 rounded-tl-none text-zinc-300 backdrop-blur-xl"
                  }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-[2rem] rounded-tl-none backdrop-blur-xl flex gap-1.5 items-center">
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full pb-32 pt-6 px-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-50">
        <div className="max-w-3xl mx-auto flex flex-col items-center">

          <AnimatePresence>
            {!isLoading && dynamicButtons.length > 0 && (
              <div className="flex overflow-x-auto gap-3 mb-5 w-full no-scrollbar pb-2">
                {dynamicButtons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleSendMessage(btn)}
                    className="whitespace-nowrap flex-shrink-0 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all uppercase tracking-wider shadow-lg text-center active:scale-95"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* 🚫 [UNLIMITED] แสดงช่อง Input เสมอ */}
          <div className="w-full relative">
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-[2.5rem] p-1.5 pl-2 shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"
                title="เริ่มบทสนทนาใหม่"
              >
                <Plus size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="คุยกับ Mentor..."
                className="flex-1 bg-transparent outline-none text-sm text-zinc-300 placeholder:text-zinc-600 ml-2"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 bg-zinc-200 text-black rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition-all disabled:opacity-20"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🗑️ Modal: ยืนยันการล้างประวัติแชท (Luxury Style) */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: { type: "spring", damping: 20, stiffness: 300 }
              }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="text-blue-400" size={28} />
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wider">ล้างประวัติการสนทนา?</h3>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">บทสนทนาทั้งหมดจะถูกลบออกถาวร และคุณจะเริ่มการเดินทางครั้งใหม่กับ Mentor ครับ</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResetChat}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-95"
                >
                  ยืนยันและเริ่มใหม่
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-4 bg-white/5 text-zinc-400 rounded-2xl font-black text-sm hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
