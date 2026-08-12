"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Trophy, RefreshCcw, Camera, Zap, ShieldAlert, ArrowLeft, ArrowRight, Loader2, AlertTriangle, Info, X, PieChart, Wallet, LayoutDashboard
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import { Kanit } from "next/font/google";
import AssessmentResultCTA from '@/app/components/AssessmentResultCTA';
import Link from 'next/link';
import { scenarios, ChatScenario } from "@/data/discScenarios";

import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, setDoc, increment, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"]
});

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const resultData = {
  D: {
    rpgTitle: "เดอะแบกสายบวก", discTitle: "มนุษย์กลุ่ม D (Dominance)", color: "bg-red-600", barColor: "bg-red-500", emoji: "🚀",
    titleColor: "text-red-600",
    desc: "คุณคือเครื่องจักรปั่นงาน! ชอบความท้าทาย ตัดสินใจไว เด็ดขาด มั่นใจสูง งานด่วนงานไฟไหม้ขอให้บอก พร้อมบวกเสมอไม่ว่าหน้าไหน!",
    warning: "ระวังหัวร้อนจนเผลอวีน หรือเร่งงานเพื่อนในทีมจนหายใจไม่ทัน ใจร่มๆ บ้างนะลูกพี่!",
    bestPartner: { type: "C", name: "Type C - มนุษย์ Checklist 🧐", desc: "เพื่อนซี้สายซัพ! C จะช่วยอุดรูรั่วหลังบ้าน ให้คุณพุ่งชนเป้าหมายได้เต็มที่" },
    kryptonite: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "เสือสองตัวอยู่ถ้ำเดียวกันไม่ได้! พร้อมบวกแย่งกันเป็นผู้นำตลอดเวลา" }
  },
  I: {
    rpgTitle: "รมต. เอนเตอร์เทน", discTitle: "มนุษย์กลุ่ม I (Influence)", color: "bg-orange-500", barColor: "bg-orange-400", emoji: "💃",
    titleColor: "text-orange-500",
    desc: "คุณคือสีสันของแผนก! มนุษย์โลกสวย ชอบเข้าสังคม สร้างบรรยากาศดีๆ ใครอยู่ใกล้ก็อารมณ์ดี เรื่องงานอาจจะชิว แต่เรื่องปาร์ตี้เราจริงจัง!",
    warning: "รับปากเก่งจนงานล้นมือ ดีเทลตกหล่นบ่อยเพราะมัวแต่เมาท์เพลิน โฟกัสหน่อยนะคุณน้า!",
    bestPartner: { type: "S", name: "Type S - กาวใจประจำออฟฟิศ 🛡️", desc: "ผู้ฟังที่ดี! S จะคอยซัพพอร์ตไอเดียฟุ้งๆ และฟังเรื่องเมาท์ของคุณได้ทั้งวัน" },
    kryptonite: { type: "C", name: "Type C - มนุษย์ Checklist 🧐", desc: "คู่ปรับสายเป๊ะ! C ถามหาแต่ตัวเลขและแผนงาน ซึ่งคุณเกลียดงานเอกสารสุดๆ" }
  },
  S: {
    rpgTitle: "กาวใจประจำออฟฟิศ", discTitle: "มนุษย์กลุ่ม S (Steadiness)", color: "bg-emerald-600", barColor: "bg-emerald-500", emoji: "🛡️",
    titleColor: "text-emerald-600",
    desc: "คุณคือเซฟโซนของทุกคน! ใจเย็น เป็นผู้ฟังที่ดี ใครมีปัญหาอะไรก็ชอบมาปรึกษา เน้นประนีประนอม รักสงบ เกลียดการเปลี่ยนแปลงกะทันหันสุดๆ",
    warning: "ขี้เกรงใจเกินร้อย ยอมแบกงานคนอื่นไว้เองหมดจนตัวเองหลังหัก หัดเซย์โนบ้างนะ!",
    bestPartner: { type: "I", name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "คนเติมไฟ! I จะช่วยดึงคุณออกจากเซฟโซนมาสนุกกับชีวิตออฟฟิศมากขึ้น" },
    kryptonite: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "ตัวทำลายความสงบ! D ชอบสั่งงานด่วนๆ แรงๆ ขัดกับสไตล์คุณที่ชอบทำเป็นสเต็ป" }
  },
  C: {
    rpgTitle: "มนุษย์ Checklist", discTitle: "มนุษย์กลุ่ม C (Compliance)", color: "bg-blue-600", barColor: "bg-blue-500", emoji: "🧐",
    titleColor: "text-blue-600",
    desc: "คุณคือเครื่องจับผิด! สายวิเคราะห์ รอบคอบ มีแผนเสมอ ทุกอย่างต้องมี Reference ผิดมิลลิเมตรเดียวก็ไม่ได้ เจ้าระเบียบยืนหนึ่ง!",
    warning: "ยึดติดความเป๊ะจนลืมดูเวลา มัวแต่จัดหน้ากระดาษและแก้ฟอนต์จนเกือบตกเดดไลน์!",
    bestPartner: { type: "D", name: "Type D - เดอะแบกสายบวก 🚀", desc: "คู่หูทำยอด! คุณวางแผนเป๊ะๆ ให้ ส่วน D จะเป็นคนฟาดฟันเอาผลลัพธ์มาเอง" },
    kryptonite: { type: "I", name: "Type I - รมต. เอนเตอร์เทน 💃", desc: "น่ารำคาญใจ! I ทำงานปุบปับ ไร้แบบแผน เปลี่ยนใจบ่อยจนแผนคุณพังหมด" }
  },
};

const themeColors: Record<string, { bg: string, border: string, title: string, name: string, desc: string }> = {
  D: { bg: "bg-red-50", border: "border-red-200", title: "text-red-700", name: "text-red-900", desc: "text-red-800" },
  I: { bg: "bg-orange-50", border: "border-orange-200", title: "text-orange-700", name: "text-orange-900", desc: "text-orange-800" },
  S: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-700", name: "text-emerald-900", desc: "text-emerald-800" },
  C: { bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-700", name: "text-blue-900", desc: "text-blue-800" },
};

import { useAssessmentMode } from "@/context/AssessmentContext";

type GenderType = "หนุ่ม" | "สาว" | "ตัวมัม" | "ชาว";

export default function DiscClient() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fromPage, setFromPage] = useState<"home" | "dashboard" | null>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "loading" | "result">("start");

  const isAssessing = gameState === "playing" || gameState === "loading";
  useAssessmentMode(isAssessing);

  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.displayName && !nickname) {
          setNickname(user.displayName.split(" ")[0]);
        }
      }
    });
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "home" || from === "dashboard") {
        setFromPage(from as any);
      }
    }
    return () => unsubscribe();
  }, [nickname]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<("D" | "I" | "S" | "C")[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<ChatScenario[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDiscInfo, setShowDiscInfo] = useState(false);
  const [selectedDiscType, setSelectedDiscType] = useState<"D" | "I" | "S" | "C" | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const hasMemberSaved = useRef(false);
  const TOTAL_QUESTIONS = 15;

  const handleStart = () => {
    if (!gender) { alert("เลือกสไตล์พนักงานของคุณก่อนนะ!"); return; }
    if (!nickname.trim()) { alert("กรอกชื่อเล่นของคุณก่อนนะ!"); return; }

    const randomScenarios = shuffleArray(scenarios).slice(0, TOTAL_QUESTIONS).map(scenario => ({
      ...scenario,
      choices: shuffleArray(scenario.choices)
    }));

    setActiveScenarios(randomScenarios);
    setAnswers([]);
    setCurrentIndex(0);
    setHasSavedData(false);
    hasMemberSaved.current = false;
    setGameState("playing");
  };

  const handleChoice = (type: "D" | "I" | "S" | "C") => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = type;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < activeScenarios.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      } else {
        setGameState("loading");
        setTimeout(() => {
          setGameState("result");
          setIsTransitioning(false);
        }, 2000);
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentIndex > 0 && !isTransitioning) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < answers.length && !isTransitioning) setCurrentIndex((prev) => prev + 1);
  };

  const getScores = () => {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((ans) => { if (ans) scores[ans]++; });
    return scores;
  };

  const getFinalResult = () => {
    const scores = getScores();
    let maxType = "D";
    let maxScore = scores.D;
    (["I", "S", "C"] as const).forEach((type) => {
      if (scores[type] > maxScore) { maxScore = scores[type]; maxType = type; }
    });
    return maxType as "D" | "I" | "S" | "C";
  };

  const getPercentages = () => {
    const scores = getScores();
    const total = answers.length || 1;
    return {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100),
    };
  };

  const getDynamicTitle = () => {
    const finalResult = getFinalResult();
    const baseTitle = resultData[finalResult].rpgTitle;
    const emoji = resultData[finalResult].emoji;

    if (gender === "หนุ่ม") return `หนุ่มออฟฟิศ${baseTitle} ${emoji}`;
    if (gender === "สาว") return `สาวออฟฟิศ${baseTitle} ${emoji}`;
    if (gender === "ตัวมัม") return `ตัวมัม${baseTitle} ${emoji}`;
    return `ชาวออฟฟิศ${baseTitle} ${emoji}`;
  };

  const saveResultToFirebase = async () => {
    if (hasSavedData) return;
    try {
      const finalResult = getFinalResult();
      const percentages = getPercentages();

      const finalUserId = currentUser ? currentUser.uid : "GUEST_" + Date.now();
      const finalUserName = currentUser ? currentUser.displayName : "Guest User";

      const resultPayload = {
        userId: finalUserId,
        userName: finalUserName,
        result: finalResult,
        nickname: nickname,
        gender: gender,
        finalResult: finalResult,
        percentages: percentages,
        title: getDynamicTitle(),
        answers: answers,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      if (currentUser) {
        hasMemberSaved.current = true;
        setHasSavedData(true);
        await setDoc(doc(db, "discResults", currentUser.uid), resultPayload, { merge: true });

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (!userData.hasDiscXP) {
            const oldXP = userData.totalXP || 0;
            const newXP = oldXP + 50;
            const oldLevel = Math.floor(oldXP / 100) + 1;
            const newLevel = Math.floor(newXP / 100) + 1;
            await setDoc(userRef, {
              totalXP: increment(50),
              hasDiscXP: true
            }, { merge: true });
            if (newLevel > oldLevel) {
              sessionStorage.setItem('pendingLevelUp', String(newLevel));
            }
          }
        }
      } else {
        setHasSavedData(true);
        await addDoc(collection(db, "discResults"), resultPayload);
      }

    } catch (error) {
      console.error("Firebase Error: ", error);
      setHasSavedData(false);
    }
  };

  useEffect(() => {
    if (gameState === "result") {
      saveResultToFirebase();
    }
  }, [gameState]);

  useEffect(() => {
    if (!currentUser || gameState !== "result" || hasMemberSaved.current) return;

    const grantXPOnLogin = async () => {
      hasMemberSaved.current = true;
      try {
        const finalResult = getFinalResult();
        const percentages = getPercentages();
        const resultPayload = {
          userId: currentUser.uid,
          userName: currentUser.displayName,
          result: finalResult,
          nickname: nickname,
          gender: gender,
          finalResult: finalResult,
          percentages: percentages,
          title: getDynamicTitle(),
          answers: answers,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "discResults", currentUser.uid), resultPayload, { merge: true });

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (!userData.hasDiscXP) {
            const oldXP = userData.totalXP || 0;
            const oldLevel = Math.floor(oldXP / 100) + 1;
            const newLevel = Math.floor((oldXP + 50) / 100) + 1;
            await setDoc(userRef, { totalXP: increment(50), hasDiscXP: true }, { merge: true });
            if (newLevel > oldLevel) {
              sessionStorage.setItem('pendingLevelUp', String(newLevel));
            }
          }
        }
      } catch (error) {
        console.error("Firebase Error (login grant): ", error);
        hasMemberSaved.current = false;
      }
    };

    grantXPOnLogin();
  }, [currentUser]);

  const restartGame = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setGender(null);
    setNickname("");
    setHasSavedData(false);
    hasMemberSaved.current = false;
    setGameState("start");
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await domToPng(printRef.current, { quality: 1, scale: 2, backgroundColor: "#F8FAFC" });
      
      let shared = false;
      
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "DISC-Office-Result.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "ผลลัพธ์ DISC ของฉัน",
              text: "ดูผลลัพธ์ DISC ของฉันบน Upskill with Fuii!"
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
          link.download = `DISC-Office-Result.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      console.error("Capture Error:", err);
      alert("เกิดข้อผิดพลาดในการเซฟรูป ลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

  const genderOptions: { id: GenderType; label: string; emoji: string }[] = [
    { id: "หนุ่ม", label: "หนุ่ม", emoji: "👨" },
    { id: "สาว", label: "สาว", emoji: "👩" },
    { id: "ตัวมัม", label: "ตัวมัม", emoji: "🏳️‍🌈" },
    { id: "ชาว", label: "ไม่ระบุ", emoji: "👤" },
  ];

  return (
    <div className={`min-h-[100dvh] w-full bg-slate-900 flex flex-col items-center justify-center sm:p-4 ${kanit.className}`}>

      <div className={`w-full max-w-md sm:rounded-[2.5rem] shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] sm:max-h-[90vh] flex flex-col relative sm:border-[6px] sm:border-slate-700 ${gameState === 'playing' ? 'bg-slate-900' : 'bg-white'}`}>

        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 w-full flex flex-col p-5 sm:p-8 bg-gradient-to-b from-slate-50 to-blue-50 overflow-y-auto">
            <div className="flex flex-col items-center justify-center shrink-0 w-full pt-2">
              <div className="text-center mb-5">
                <Image src="/office-personality.png" alt="แกเป็นคนยังไง ใน Office" width={400} height={200} className="mx-auto mb-4 w-full max-w-[280px] sm:max-w-[360px] h-auto object-contain" priority />
                <button onClick={() => setShowDiscInfo(true)} className="inline-flex items-center justify-center gap-1.5 text-blue-700 font-bold bg-blue-100/70 hover:bg-blue-200 py-1.5 px-4 rounded-full text-[13px] shadow-sm transition-all active:scale-95 cursor-pointer mx-auto whitespace-nowrap">
                  <Info size={14} /> (DISC ของคนรุ่นใหม่)
                </button>
              </div>

              <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-3">
                <span className="text-2xl mt-1">💡</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">กติกาการเอาตัวรอด</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    กดเลือก <span className="font-bold bg-blue-100 text-blue-800 px-1 rounded">&quot;คำตอบแรกที่แวบขึ้นมาในหัว&quot;</span> ทันทีโดยไม่ต้องคิดเยอะ เพื่อหาธาตุแท้ของคุณ!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[24px]"></div>

            <div className="w-full shrink-0 flex flex-col items-center pb-2">
              <div className="w-full mb-4">
                <label className="block text-sm font-bold text-slate-800 mb-2 text-center">ชื่อเล่นของคุณ?</label>

                <input
                  type="text"
                  placeholder={currentUser ? "ชื่อเล่นของคุณ..." : "เช่น มายด์, ฝน, บอย"}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 text-center rounded-xl border-2 border-blue-300 focus:border-blue-600 focus:outline-none font-bold text-slate-800 text-[13px] transition-colors mb-4"
                />
              </div>

              <div className="w-full mb-6">
                <label className="block text-sm font-bold text-slate-800 mb-3 text-center">คุณคือใครใน Office?</label>
                <div className="grid grid-cols-4 gap-2">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGender(opt.id)}
                      className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all duration-300 ${gender === opt.id
                          ? "bg-slate-800 text-white shadow-md border-transparent scale-105 -translate-y-1"
                          : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                        }`}
                    >
                      <span className="text-[22px] mb-0.5">{opt.emoji}</span>
                      <span className="text-[10px] leading-tight text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full flex flex-col items-center gap-2 mb-2">
                <button
                  onClick={handleStart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  🚀 เริ่มเล่นเกม (15 ข้อสั้นๆ)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && activeScenarios.length > 0 && (
          <div className="flex-1 w-full flex flex-col bg-slate-900 overflow-hidden relative">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-white font-bold text-xs tracking-wide">OFFICE SURVIVAL CHAT</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                <span className="text-blue-400 font-bold text-xs">{currentIndex + 1}</span>
                <span className="text-slate-500 text-[10px]">/</span>
                <span className="text-slate-400 font-bold text-xs">{activeScenarios.length}</span>
              </div>
            </div>

            <div className="w-full bg-slate-800/50 h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentIndex + 1) / activeScenarios.length) * 100}%` }}
              ></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-start">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-slate-600 shrink-0">
                  🤖
                </div>
                <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 max-w-[85%] shadow-sm">
                  <p className="text-xs font-bold text-blue-400 mb-1">หัวหน้า / สถานการณ์ในออฟฟิศ</p>
                  <p className="text-sm font-medium leading-relaxed">{activeScenarios[currentIndex].message}</p>
                </div>
              </div>

              {answers[currentIndex] && (
                <div className="flex items-end justify-end gap-2.5 mt-2">
                  <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-br-none max-w-[85%] shadow-md">
                    <p className="text-xs font-bold text-blue-200 mb-1">คุณ ({nickname})</p>
                    <p className="text-sm font-medium leading-relaxed">
                      {activeScenarios[currentIndex].choices.find(c => c.type === answers[currentIndex])?.text}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 p-4 border-t border-slate-700 flex flex-col gap-2 shrink-0">
              <p className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>เลือกการตอบกลับของคุณ:</span>
                <span className="text-slate-500 font-normal">แตะคำตอบเพื่อไปต่อ</span>
              </p>

              <div className="grid grid-cols-1 gap-2">
                {activeScenarios[currentIndex].choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.type)}
                    disabled={isTransitioning}
                    className={`p-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border flex items-center justify-between gap-2 active:scale-[0.98] ${
                      answers[currentIndex] === choice.type
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-slate-700/70 hover:bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <span className="leading-relaxed flex-1">{choice.text}</span>
                    <span className="text-slate-400 text-xs shrink-0">➔</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0 || isTransitioning}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    currentIndex === 0 ? "opacity-30 cursor-not-allowed text-slate-500" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <ArrowLeft size={14} /> ข้อก่อนหน้า
                </button>

                {answers[currentIndex] && currentIndex < activeScenarios.length - 1 && (
                  <button
                    onClick={handleNext}
                    disabled={isTransitioning}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white flex items-center gap-1 hover:bg-blue-500 transition-all"
                  >
                    ข้ามไปข้อถัดไป <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {gameState === "loading" && (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">กำลังประมวลผลธาตุแท้ของคุณ...</h3>
            <p className="text-slate-400 text-sm">วิเคราะห์พฤติกรรม 15 สถานการณ์ในออฟฟิศ</p>
          </div>
        )}

        {gameState === "result" && (
          <div className="flex-1 w-full flex flex-col bg-slate-50 overflow-y-auto">
            <div ref={printRef} className="p-5 sm:p-6 bg-slate-50 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
                    UE
                  </div>
                  <span className="font-extrabold text-slate-800 text-sm tracking-wide">UPSKILL EVERYDAY</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">OFFICE DISC</span>
              </div>

              <div className="w-full text-center mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                  {getDynamicTitle()}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                  {nickname} คือ &quot;{resultData[getFinalResult()].rpgTitle}&quot;
                </h2>
                <p className={`text-xs font-bold ${resultData[getFinalResult()].titleColor}`}>
                  {resultData[getFinalResult()].discTitle} {resultData[getFinalResult()].emoji}
                </p>
              </div>

              <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                  {resultData[getFinalResult()].desc}
                </p>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-amber-800 leading-normal font-medium">
                    {resultData[getFinalResult()].warning}
                  </p>
                </div>
              </div>

              <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <PieChart size={14} className="text-blue-600" /> สัดส่วนบุคลิกภาพ DISC ของคุณ
                </h4>
                <div className="space-y-2">
                  {(["D", "I", "S", "C"] as const).map((type) => {
                    const pct = getPercentages()[type];
                    return (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <span className="font-bold w-4 text-slate-700">{type}</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${resultData[type].barColor} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="font-bold w-9 text-right text-slate-600 text-[11px]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mb-4">
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                    💚 คู่หูทำงานดีที่สุด
                  </p>
                  <p className="text-xs font-bold text-slate-800 mb-0.5">{resultData[getFinalResult()].bestPartner.name}</p>
                  <p className="text-[10px] text-slate-600 leading-normal">{resultData[getFinalResult()].bestPartner.desc}</p>
                </div>

                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <p className="text-[10px] font-bold text-rose-700 mb-1 flex items-center gap-1">
                    ⚡ คู่ปรับที่ต้องระวัง
                  </p>
                  <p className="text-xs font-bold text-slate-800 mb-0.5">{resultData[getFinalResult()].kryptonite.name}</p>
                  <p className="text-[10px] text-slate-600 leading-normal">{resultData[getFinalResult()].kryptonite.desc}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3 shrink-0">
              <button
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                {isCapturing ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />} บันทึกรูปภาพผลลัพธ์
              </button>

              <button
                onClick={restartGame}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCcw size={14} /> ทำแบบทดสอบอีกครั้ง
              </button>

              <div className="mt-2 pt-2 border-t border-slate-100">
                <AssessmentResultCTA currentUser={currentUser} completedType="disc" />
              </div>
            </div>
          </div>
        )}

      </div>

      <AnimatePresence>
        {showDiscInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => { setShowDiscInfo(false); setSelectedDiscType(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                ℹ️ DISC Personality คืออะไร?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                ทฤษฎีวิเคราะห์บุคลิกภาพที่ได้รับความนิยมระดับโลก แบ่งสไตล์การทำงานของมนุษย์ออกเป็น 4 กลุ่มหลัก:
              </p>

              <div className="space-y-2 mb-4">
                {(["D", "I", "S", "C"] as const).map((type) => (
                  <div
                    key={type}
                    onClick={() => setSelectedDiscType(selectedDiscType === type ? null : type)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      themeColors[type].bg
                    } ${themeColors[type].border}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${themeColors[type].title}`}>
                        {type} - {resultData[type].discTitle.split("(")[1]?.replace(")", "")} {resultData[type].emoji}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {selectedDiscType === type ? "▲" : "▼"}
                      </span>
                    </div>
                    {selectedDiscType === type && (
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed pt-2 border-t border-slate-200/50">
                        {resultData[type].desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowDiscInfo(false); setSelectedDiscType(null); }}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-slate-800 transition-all"
              >
                เข้าใจแล้ว! ปิดหน้านี้
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col items-center relative"
            >
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 z-10"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-3 pr-6">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                  📸 บันทึกรูปภาพผลลัพธ์
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  กดค้างที่รูปภาพด้านล่างเพื่อ <span className="text-blue-600 font-bold">&quot;บันทึกไปยังแอพรูปภาพ&quot;</span>
                </p>
              </div>

              <div className="relative w-full max-h-[50vh] overflow-y-auto rounded-2xl border border-slate-200 shadow-inner bg-slate-50 mb-3">
                <img
                  src={capturedImage}
                  alt="DISC Result"
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </div>

              <div className="w-full flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `DISC-Office-Result.png`;
                    link.href = capturedImage;
                    link.click();
                  }}
                  className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all text-xs active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  ดาวน์โหลดตรงอีกครั้ง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
