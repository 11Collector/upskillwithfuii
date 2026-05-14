"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, ArrowLeft, Bot, User as UserIcon,
  MessageSquare, History, Zap, BrainCircuit, Lightbulb, Target, TrendingUp,
  AlertCircle, Lock, Battery
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit, setDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          let baseData = userDoc.exists() ? userDoc.data() : {};

          const [discSnap, moneySnap, librarySoulSnap, wheelSnap, quoteSnap] = await Promise.all([
            getDocs(query(collection(db, "discResults"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1))),
            getDocs(query(collection(db, "quiz_results"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1))),
            getDocs(query(collection(db, "users", currentUser.uid, "library_souls"), orderBy("createdAt", "desc"), limit(1))),
            getDocs(query(collection(db, "users", currentUser.uid, "assessments"), orderBy("createdAt", "desc"), limit(1))),
            getDocs(query(collection(db, "quotes"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)))
          ]);

          let wheelDetails = null;
          if (!wheelSnap.empty) {
            const wheelData = wheelSnap.docs[0].data();
            wheelDetails = {
              scores: wheelData.currentScores || wheelData.scores,
              targetScores: wheelData.targetScores,
              goal: wheelData.goal || wheelData.futureGoal,
              analysis: wheelData.analysis,
              focusAreas: wheelData.selectedFocusAreas
            };
          }

          const lastMood = !quoteSnap.empty ? quoteSnap.docs[0].data().mood : null;
          const level = Math.floor((baseData.totalXP || 0) / 100) + 1;

          // 🔥 Logic: Quota Management (Level 11+ is Unlimited)
          const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
          let usedToday = baseData.chatUsageDate === today ? (baseData.dailyChatCount || 0) : 0;
          let totalQuota = (currentUser.email === 'emotion.tuii@gmail.com' || level > 10) ? Infinity : level;

          setChatQuota({ used: usedToday, total: totalQuota });

          const fullUserData = {
            ...baseData,
            level,
            lastDisc: !discSnap.empty ? discSnap.docs[0].data() : baseData.lastDisc,
            lastMoney: !moneySnap.empty ? moneySnap.docs[0].data() : baseData.lastMoney,
            lastLibrarySoul: !librarySoulSnap.empty ? librarySoulSnap.docs[0].data() : baseData.lastLibrarySoul,
            lastWheel: wheelDetails,
            lastMood: lastMood
          };

          // 🔥 Load Chat History (Long-term Memory)
          const historySnap = await getDocs(query(
            collection(db, "users", currentUser.uid, "chat_history"),
            orderBy("createdAt", "asc"),
            limit(20)
          ));

          if (!historySnap.empty) {
            const historyMessages = historySnap.docs.map(doc => ({
              role: doc.data().role as "user" | "assistant",
              content: doc.data().content
            }));
            setMessages(historyMessages);
          } else {
            // Default greeting if no history
            setMessages([
              {
                role: "assistant",
                content: `สวัสดีครับคุณ **${fullUserData.displayName || 'นักเดินทาง'}** ผมคือ **AI Personal Mentor** ของคุณ วันนี้มีเรื่องอะไรที่อยากปรึกษา หรืออยากให้ผมช่วยวิเคราะห์แนวทางการพัฒนาตัวเองดีครับ?`
              }
            ]);
          }

          setUserData(fullUserData);
          generateDynamicButtons(fullUserData);

        } catch (error) {
          console.error("Error loading full user data:", error);
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const generateDynamicButtons = (data: any) => {
    const buttons = [];
    if (data.lastMood) buttons.push(`คุยเรื่องความรู้สึกตอนนี้`);
    if (data.lastWheel?.goal) buttons.push(`สรุปเป้าหมาย`);
    const discType = data.lastDisc?.finalResult || data.lastDisc?.result || "";
    if (discType.includes("D")) buttons.push("สรุปสั้นๆ ตรงประเด็น");
    if (buttons.length < 3) buttons.push("วางแผนพัฒนาตัวเองให้ผมที");
    setDynamicButtons(buttons.slice(0, 3));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    // 🔥 Quota Validation
    if (chatQuota.total !== Infinity && chatQuota.used >= chatQuota.total) {
      alert(`โควตาคำถามวันนี้หมดแล้วครับ (LV.${chatQuota.total} ได้ ${chatQuota.total} คำถาม/วัน) \n\nมาอัปเลเวลถึง LV.11 เพื่อคุยแบบไม่จำกัดนะ! 🚀`);
      return;
    }

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
            totalFocusMinutes: userData?.totalFocusMinutes,
            characterTier: getCharacterTier(userData?.totalXP || 0),
            level: userData?.level,
            dailyChatCount: chatQuota.used
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

        // 🔥 Update Usage in Firebase
        const now = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        if (!user) return;
        const userRef = doc(db, "users", user.uid);

        await setDoc(userRef, {
          dailyChatCount: userData.chatUsageDate === now ? increment(1) : 1,
          chatUsageDate: now
        }, { merge: true });

        // 🔥 Sync Local State to prevent stale data
        setChatQuota(prev => ({ ...prev, used: prev.used + 1 }));
        setUserData((prev: any) => ({
          ...prev,
          dailyChatCount: prev.chatUsageDate === now ? (prev.dailyChatCount || 0) + 1 : 1,
          chatUsageDate: now
        }));

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
    if (level >= 15) return "Architect";
    if (level >= 7) return "Master";
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

      {/* Header */}
      <header className="w-full max-w-4xl px-6 py-8 flex items-center justify-between z-20 sticky top-0 bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
        <Link href="/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-zinc-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isTyping ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
            <h1 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-200">AI Personal Mentor</h1>
          </div>

          {/* 🔥 Quota Indicator */}
          <div className="flex items-center gap-2 mt-1">
            <Battery size={10} className={`${chatQuota.total !== Infinity && chatQuota.used >= chatQuota.total ? 'text-red-500' : 'text-zinc-500'}`} />
            <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase">
              Energy: {chatQuota.total === Infinity ? 'Unlimited ∞' : `${chatQuota.total - chatQuota.used}/${chatQuota.total}`}
            </span>
          </div>
        </div>

        <motion.div
          animate={isTyping ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl"
        >
          {userData ? (
            <img src={getAvatarPath()} alt="User Avatar" className="w-full h-full object-cover scale-125 translate-y-1" />
          ) : (
            <UserIcon size={20} className="text-zinc-600" />
          )}
        </motion.div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 w-full max-w-3xl flex flex-col gap-6 p-6 z-10 overflow-y-auto pb-60 scroll-smooth no-scrollbar">
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
            {!isLoading && dynamicButtons.length > 0 && (chatQuota.total === Infinity || chatQuota.used < chatQuota.total) && (
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

          {chatQuota.total !== Infinity && chatQuota.used >= chatQuota.total ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center mb-4"
            >
              <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                <AlertCircle size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Energy Depleted</span>
              </div>
              <p className="text-[10px] text-zinc-400">วันนี้ Mentor ใช้พลังงานไปครบ {chatQuota.total} ครั้งแล้วครับ</p>
              <p className="text-[10px] text-zinc-500 font-bold mt-1">พักผ่อนให้เต็มที่ แล้วมาคุยกันใหม่พรุ่งนี้นะครับ! 🌙</p>
              <p className="text-[9px] text-indigo-400/60 mt-2 italic">(หรืออัปเลเวลเพิ่มโควตาได้จากการอ่านหนังสือนะ! 🚀)</p>
            </motion.div>
          ) : (
            <div className="w-full relative">
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-[2.5rem] p-1.5 pl-6 shadow-2xl backdrop-blur-xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="คุยกับ Mentor..."
                  className="flex-1 bg-transparent outline-none text-sm text-zinc-300 placeholder:text-zinc-600"
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
          )}
        </div>
      </div>

    </div>
  );
}
