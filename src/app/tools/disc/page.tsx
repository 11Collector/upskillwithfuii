"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Trophy, RefreshCcw, Star, Camera, Zap, ShieldAlert, ArrowLeft, ArrowRight, Loader2, AlertTriangle, Info, X, PieChart, Users, Wallet ,LayoutDashboard
} from "lucide-react"; 
import { toPng } from "html-to-image"; 
import { Kanit } from "next/font/google";
import { scenarios, ChatScenario } from "@/data/discScenarios"; 

import { db ,auth} from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp,getDoc,setDoc,increment,doc} from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Link from "next/link";

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

// ✨ 1. เพิ่ม properties `type` และ `titleColor` เข้าไปใน bestPartner และ kryptonite 
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

// ✨ 2. สร้างชุดสีอ้างอิงให้แต่ละ Type
const themeColors: Record<string, { bg: string, border: string, title: string, name: string, desc: string }> = {
  D: { bg: "bg-red-50", border: "border-red-200", title: "text-red-700", name: "text-red-900", desc: "text-red-800" },
  I: { bg: "bg-orange-50", border: "border-orange-200", title: "text-orange-700", name: "text-orange-900", desc: "text-orange-800" },
  S: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-700", name: "text-emerald-900", desc: "text-emerald-800" },
  C: { bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-700", name: "text-blue-900", desc: "text-blue-800" },
};

type GenderType = "หนุ่ม" | "สาว" | "ตัวมัม" | "ชาว";

export default function Home() {
// 💡 1. สร้างที่เก็บข้อมูล User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 💡 2. สั่งให้เริ่มจับสัญญาณว่าใคร Login
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
      console.log("จับสัญญาณ User ได้แล้ว:", user.uid);

      if (user.displayName && !nickname) {
        setNickname(user.displayName.split(" ")[0]); 
      }
    }
  });
  return () => unsubscribe();
}, []); 

  const [gameState, setGameState] = useState<"start" | "playing" | "loading" | "result">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<("D" | "I" | "S" | "C")[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<ChatScenario[]>([]);
  const [gender, setGender] = useState<GenderType | null>(null);
  const [nickname, setNickname] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDiscInfo, setShowDiscInfo] = useState(false);
  const [selectedDiscType, setSelectedDiscType] = useState<"D" | "I" | "S" | "C" | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
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
    setHasSavedData(true);
    const finalResult = getFinalResult();
    const percentages = getPercentages();
    
    // 1. เตรียมข้อมูลพื้นฐาน
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
      await setDoc(doc(db, "discResults", currentUser.uid), resultPayload, { merge: true });
      console.log("✅ อัปเดตผลลัพธ์ DISC ล่าสุดให้เรียบร้อย!");
    } else {
      await addDoc(collection(db, "discResults"), resultPayload);
      console.log("✅ บันทึกข้อมูล Guest เรียบร้อย!");
    }

    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (!userData.hasDiscXP) {
          await setDoc(userRef, {
            totalXP: increment(50),
            hasDiscXP: true 
          }, { merge: true });
          console.log("🎉 ได้รับ 50 XP ครั้งแรกเรียบร้อย!");
        }
      }
    }

  } catch (error) {
    console.error("เกิดข้อผิดพลาด: ", error);
    setHasSavedData(false);
  }
};
  useEffect(() => {
    if (gameState === "result") {
      saveResultToFirebase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const restartGame = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setGender(null);
    setNickname("");
    setHasSavedData(false);
    setGameState("start");
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#F8FAFC" });
      const link = document.createElement("a");
      link.download = `DISC-Office-Result.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image Capture Error:", err);
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
    <div className={`h-full w-full bg-slate-900 flex flex-col items-center justify-center sm:p-4 ${kanit.className}`}>
      
      {/* 💡 กรอบนอกสุด ใส่ overflow-hidden ให้มุมโค้งสวยงาม และ h-full ให้พอดีจอ */}
      <div className={`w-full max-w-md sm:rounded-[2.5rem] shadow-2xl overflow-hidden h-full sm:h-[850px] flex flex-col relative sm:border-[6px] sm:border-slate-700 ${gameState === 'playing' ? 'bg-slate-900' : 'bg-white'}`}>
        
        {/* ================= 1. หน้าจอเริ่มต้น ================= */}
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
                    กดเลือก <span className="font-bold bg-blue-100 text-blue-800 px-1 rounded">"คำตอบแรกที่แวบขึ้นมาในหัว"</span> ทันทีโดยไม่ต้องคิดเยอะ เพื่อหาธาตุแท้ของคุณ!
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
                      className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all duration-300 ${
                        gender === opt.id 
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
                  disabled={!gender || !nickname.trim()}
                  className={`bg-blue-600 text-white font-bold text-[16px] py-3 px-10 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 w-[85%] border-b-[3px] border-blue-800 ${!gender || !nickname.trim() ? "opacity-50 grayscale cursor-not-allowed" : "hover:bg-blue-700"}`}
                >
                  ตอกบัตรเข้างาน ⏱️
                </button>
                <span className="text-slate-400 text-[11px] font-medium tracking-wide">⏳ ใช้เวลา 1-2 นาที ({TOTAL_QUESTIONS} คำถาม)</span>
              </div>

              <div className="text-slate-400 text-[10px] font-medium mt-3 tracking-wide text-center">
                Created by <span className="font-bold text-slate-400">อัพสกิลกับฟุ้ย</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 2. หน้าจอตอนเล่น (Chat Simulator) ================= */}
 {/* ================= 2. หน้าจอตอนเล่น (Chat Simulator) ================= */}
        {gameState === "playing" && activeScenarios.length > 0 && (
          // 💡 แก้ไขตรงนี้: เปลี่ยน h-full เป็น flex-1 และบังคับ min-h ให้ยืดเต็มจอ (หัก Navbar บน 64px และ Bottom Nav ล่าง 72px)
          <div className="flex flex-col flex-1 min-h-[calc(100dvh-136px)] bg-[#E2E8F0] overflow-hidden w-full">
             
            <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-md z-10 shrink-0">
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                {currentIndex > 0 && (
                  <button onClick={handleBack} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full transition-all active:scale-90 shrink-0" aria-label="ย้อนกลับ">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div className="text-[15px] bg-slate-800 p-1.5 rounded-full w-8 h-8 flex items-center justify-center shrink-0 border border-slate-700">
                  {activeScenarios[currentIndex].avatar}
                </div>
                <div className="flex flex-col justify-center overflow-hidden flex-1">
                  <h2 className="text-white font-bold text-[13px] leading-tight truncate w-full">{activeScenarios[currentIndex].npcName}</h2>
                  <p className="text-[10px] text-blue-300 leading-tight truncate w-full">{activeScenarios[currentIndex].role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-slate-800 text-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 shrink-0">
                  {currentIndex + 1} / {activeScenarios.length}
                </div>
                {currentIndex < answers.length && (
                  <button onClick={handleNext} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full transition-all active:scale-90" aria-label="ไปข้างหน้า">
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* 💡 แชทเลื่อนได้ */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenarios[currentIndex].id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] self-start border border-slate-200 relative break-words mt-4 ml-2"
                >
                  <svg className="absolute top-0 -left-[9px] w-[10px] h-[14px] text-white drop-shadow-sm" viewBox="0 0 10 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0H0C4.5 0 8.5 4.5 10 10V0Z" />
                  </svg>
                  <p className="text-[14px] leading-relaxed font-medium">{activeScenarios[currentIndex].message}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 💡 กรอบตัวเลือก กำหนดความสูงสูงสุด (max-h) และให้เลื่อนได้ */}
            <div className="bg-slate-100 p-4 pt-4 border-t border-slate-200 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.06)] shrink-0 z-20 flex flex-col max-h-[50vh]">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 shrink-0"></div>
              <p className="text-[11px] font-bold text-slate-500 text-center mb-3 tracking-wide shrink-0">เลือกคำตอบสไตล์คุณ</p>
              
              <div className="space-y-3 overflow-y-auto pr-1 pb-2">
                {activeScenarios[currentIndex].choices.map((choice, index) => {
                  const isSelected = answers[currentIndex] === choice.type;

                  return (
                    <button
                      key={`${activeScenarios[currentIndex].id}-${index}`}
                      disabled={isTransitioning && !isSelected} 
                      onClick={(e) => {
                        e.currentTarget.blur();
                        handleChoice(choice.type);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl text-[13px] font-medium transition-all duration-200 border-2 active:scale-[0.98] leading-snug break-words shrink-0
                        ${isSelected 
                          ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm" 
                          : "bg-white hover:bg-blue-50 text-slate-700 border-slate-100 hover:border-blue-300 shadow-sm" 
                        }
                        ${isTransitioning && !isSelected ? "opacity-40" : "opacity-100"}
                      `}
                    >
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. หน้าจอ Loading ================= */}
        {gameState === "loading" && (
        <motion.div 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }} 
  className="flex-1 flex flex-col min-h-[calc(100dvh-136px)] w-full items-center justify-center p-8 bg-slate-900"
>
            <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2 text-center">กำลังประมวลผลความตึง...</h2>
            <p className="text-slate-400 text-sm text-center">แอบส่องพฤติกรรมคุณในออฟฟิศอยู่ แป๊บนึงนะ 🕵️‍♂️</p>
          </motion.div>
        )}

        {/* ================= 4. หน้าจอสรุปผล ================= */}
        {gameState === "result" && (
          // 💡 ใช้ Flex จัดโครงสร้าง หน้าจอเลื่อนได้ ส่วนปุ่มติดขอบล่าง
          <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            
            {/* 💡 พื้นที่แสดงผลลัพธ์ (เลื่อนขึ้นลงได้) */}
            <div className="flex-1 overflow-y-auto w-full pb-8"> 
              <div ref={printRef} className="flex flex-col bg-slate-50 w-full relative">
                
                <div className={`${resultData[getFinalResult()].color} text-white p-6 pb-16 text-center flex flex-col items-center relative shadow-md shrink-0`}>
                  <Trophy size={28} className="text-white/80 mb-2 mt-2" />
                  <p className="text-white/90 text-[11px] font-bold tracking-wider mb-2">
                    ผลลัพธ์จากแบบทดสอบ {TOTAL_QUESTIONS} ข้อ
                  </p>
                  <p className="text-white/90 text-[10px] bg-black/20 px-3 py-1.5 rounded-full">{resultData[getFinalResult()].discTitle}</p>
                </div>

                <div className="p-5 pt-12 flex flex-col relative bg-slate-50">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-5xl w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-[6px] border-slate-50 z-10">
                    {resultData[getFinalResult()].emoji}
                  </div>

               <div className="text-center mt-2 mb-4">
                    <p className="text-slate-500 text-[11px] font-bold tracking-wider mb-1">ฉายาของคุณคือ</p>
                    <h1 className="text-2xl font-black text-slate-800 leading-tight px-2 mb-1">{nickname}</h1>
                    <p className={`text-lg font-black leading-tight px-2 ${resultData[getFinalResult()].titleColor}`}>
                      {getDynamicTitle()}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-3 text-center">
                    <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{resultData[getFinalResult()].desc}</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-200 mb-4 text-center">
                    <p className="text-[12px] font-bold text-amber-700 mb-1.5 flex items-center justify-center gap-1.5">
                      <AlertTriangle size={15} /> ข้อควรระวัง (จุดอ่อนของคุณ)
                    </p>
                    <p className="text-[12px] text-amber-900 leading-relaxed font-medium">
                      {resultData[getFinalResult()].warning}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm border-b pb-2 flex items-center gap-2">
                      <span className="text-[16px]">📊</span> ส่วนผสมความตึงของคุณ (DISC)
                      <button onClick={() => setShowDiscInfo(true)} className="ml-auto p-0.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100" title="ความหมายของ D/I/S/C">
                        <Info size={16} />
                      </button>
                    </h3>
                    
                    <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden mb-4 shadow-inner">
                      {["D", "I", "S", "C"].map((type) => {
                        const percent = getPercentages()[type as keyof typeof resultData];
                        const data = resultData[type as keyof typeof resultData];
                        if (percent === 0) return null; 
                        return (
                          <motion.div 
                            key={type}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className={`h-full ${data.barColor} border-r border-white/20 last:border-0`} 
                          />
                        );
                      })}
                    </div>

                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-3 px-2">
                      {["D", "I", "S", "C"].map((type) => {
                        const percent = getPercentages()[type as keyof typeof resultData];
                        const data = resultData[type as keyof typeof resultData];
                        return (
                          <div key={type} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-full ${data.barColor} shadow-sm`}></span>
                            <span className="text-[11px] font-bold text-slate-700">
                              {type} <span className="text-slate-500 font-medium">{percent}%</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm border-b pb-2 flex items-center gap-2">
                      <span className="text-[16px]">🤝</span> ทำงานกับใครเวิร์คสุด?
                    </h3>
                    
                    <div className={`${themeColors[resultData[getFinalResult()].bestPartner.type].bg} border ${themeColors[resultData[getFinalResult()].bestPartner.type].border} p-3 rounded-xl mb-2 transition-colors`}>
                      <p className={`text-[11px] font-bold ${themeColors[resultData[getFinalResult()].bestPartner.type].title} mb-1 flex items-center gap-1`}>
                        <Zap size={14}/> คู่หูแบกงาน (Best Partner)
                      </p>
                      <p className={`font-bold ${themeColors[resultData[getFinalResult()].bestPartner.type].name} text-[13px] mb-0.5`}>
                        {resultData[getFinalResult()].bestPartner.name}
                      </p>
                      <p className={`text-[11px] ${themeColors[resultData[getFinalResult()].bestPartner.type].desc} leading-tight`}>
                        {resultData[getFinalResult()].bestPartner.desc}
                      </p>
                    </div>

                    <div className={`${themeColors[resultData[getFinalResult()].kryptonite.type].bg} border ${themeColors[resultData[getFinalResult()].kryptonite.type].border} p-3 rounded-xl transition-colors`}>
                      <p className={`text-[11px] font-bold ${themeColors[resultData[getFinalResult()].kryptonite.type].title} mb-1 flex items-center gap-1`}>
                        <ShieldAlert size={14}/> คู่กรรมทำปวดหัว (Kryptonite)
                      </p>
                      <p className={`font-bold ${themeColors[resultData[getFinalResult()].kryptonite.type].name} text-[13px] mb-0.5`}>
                        {resultData[getFinalResult()].kryptonite.name}
                      </p>
                      <p className={`text-[11px] ${themeColors[resultData[getFinalResult()].kryptonite.type].desc} leading-tight`}>
                        {resultData[getFinalResult()].kryptonite.desc}
                      </p>
                    </div>
                  </div>
            
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                    <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-black/10 rounded-full blur-lg"></div>

           <div className="mb-6 mt-4">
  <div className="flex items-center justify-center gap-3 mb-4">
    <div className="h-[1px] bg-slate-100 flex-1"></div>
    <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase">เครื่องมืออัปสกิลอื่นๆ</p>
    <div className="h-[1px] bg-slate-100 flex-1"></div>
  </div>

  <div className="flex flex-col gap-3">
    <div className="grid grid-cols-2 gap-3">
      <a 
        href="/tools/wheel-of-life" 
        target="_blank" 
        rel="noreferrer"
        className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 py-4 rounded-2xl shadow-sm hover:border-orange-200 hover:bg-orange-50/50 transition-all active:scale-95 group"
      >
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
          <PieChart size={18} className="text-orange-500" />
        </div>
        <span className="text-[13px] font-bold text-slate-700">เช็กสมดุลชีวิต</span>
      </a>

      <a 
        href="/tools/money-avatar" 
        target="_blank" 
        rel="noreferrer"
        className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 py-4 rounded-2xl shadow-sm hover:border-amber-200 hover:bg-amber-50/50 transition-all active:scale-95 group"
      >
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
          <Wallet size={18} className="text-amber-500" />
        </div>
        <span className="text-[13px] font-bold text-slate-700">สไตล์การเงิน</span>
      </a>
    </div>

    <a 
      href={currentUser ? "/dashboard" : "/"} 
      className="relative flex w-full items-center justify-between bg-slate-900 p-1 rounded-2xl shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] group overflow-hidden"
    >
      <div className="flex items-center gap-3 pl-4 py-3">
        {currentUser ? (
          <>
            <div className="bg-blue-500/20 p-2 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <LayoutDashboard size={20} className="text-blue-400" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[14px] font-black text-white tracking-wide">ไปที่ Dashboard หลัก</span>
              <span className="text-[10px] text-slate-400 font-medium">รวมทุกสกิลของคุณไว้ที่เดียว</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-700 p-2 rounded-xl group-hover:bg-slate-600 transition-colors">
              <ArrowLeft size={20} className="text-slate-300" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[14px] font-black text-white tracking-wide">กลับสู่หน้าแรก</span>
              <span className="text-[10px] text-slate-400 font-medium">ไปทำความรู้จักกันก่อนนะ</span>
            </div>
          </>
        )}
      </div>

      <div className="pr-4">
        {currentUser ? (
          <ArrowRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        ) : (
          <RefreshCcw size={16} className="text-slate-500 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
        )}
      </div>

      {currentUser && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full"></div>
      )}
    </a>
  </div>
</div>

                  <div className="mt-2 text-center text-slate-400 text-[10px] font-bold pb-4">
                    Created by อัพสกิลกับฟุ้ย
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedDiscType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                  onClick={() => setSelectedDiscType(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white p-6 rounded-3xl shadow-2xl max-w-[320px] w-full border border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[12px] font-bold text-slate-500 mb-1">รายละเอียด</p>
                        <h3 className="text-[18px] font-black text-slate-800">{selectedDiscType} - {resultData[selectedDiscType].discTitle}</h3>
                      </div>
                      <button onClick={() => setSelectedDiscType(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[13px] text-slate-600 mb-4 leading-relaxed font-medium">
                      {resultData[selectedDiscType].desc}
                    </p>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4">
                      <p className="text-[11px] font-bold text-amber-700 mb-2">⚠️ ข้อควรระวัง</p>
                      <p className="text-[11px] text-amber-800 leading-tight">{resultData[selectedDiscType].warning}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDiscType(null)}
                      className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 active:scale-95 transition-all text-[13px] shadow-md"
                    >
                      เข้าใจละ!
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          <div className="shrink-0 w-full bg-white/95 backdrop-blur-md p-4 pb-8 sm:pb-4 border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex gap-2 z-20">
  {/* ปุ่มเซฟรูป */}
  <button 
    onClick={handleDownloadImage}
    disabled={isCapturing}
    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all text-[12px] sm:text-[14px] shadow-md disabled:bg-slate-400 active:scale-95"
  >
    <Camera size={18} /> {isCapturing ? "รอแป๊บ..." : "เซฟรูปขิงใน Story"}
  </button>
  
  {/* ปุ่ม LINE OA */}
  <a 
    href="https://lin.ee/rQawKUM" 
    target="_blank" 
    rel="noreferrer" 
    className="flex-1 bg-[#00c300] text-white font-bold py-3.5 rounded-xl text-center text-[12px] sm:text-[14px] flex items-center justify-center gap-1.5 hover:bg-[#00aa00] transition-all shadow-sm active:scale-95"
  >
    <MessageSquare size={16} /> ติดตาม LINE OA
  </a>
</div>

          </div>
        )}
      </div>

      <div className="text-slate-400 text-[11px] font-medium mt-6 tracking-wide sm:block hidden">
        Created by <span className="font-bold text-slate-300">อัพสกิลกับฟุ้ย</span>
      </div>

      <AnimatePresence>
        {showDiscInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDiscInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-6 rounded-3xl shadow-2xl max-w-[320px] w-full border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[16px] font-black text-slate-800">DISC คืออะไร? 🧠</h3>
                <button onClick={() => setShowDiscInfo(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-[12px] text-slate-600 mb-5 leading-relaxed font-medium">
                ทฤษฎีจิตวิทยาที่แบ่งสไตล์คนทำงานเป็น 4 แบบหลักๆ รู้ไว้ช่วยให้เราเอาตัวรอดจากเพื่อนร่วมงานได้!
              </p>
              
              <div className="space-y-2.5 mb-6">
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🚀</span>
                  <div>
                    <p className="text-[12px] font-bold text-red-800">D (Dominance)</p>
                    <p className="text-[10px] text-red-600 leading-tight">สายลุย มุ่งเป้าหมาย ตัดสินใจไว เด็ดขาด</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100 flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">💃</span>
                  <div>
                    <p className="text-[12px] font-bold text-orange-800">I (Influence)</p>
                    <p className="text-[10px] text-orange-600 leading-tight">สายปาร์ตี้ ช่างพูดคุย ไอเดียฟุ้งกระจาย</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🛡️</span>
                  <div>
                    <p className="text-[12px] font-bold text-emerald-800">S (Steadiness)</p>
                    <p className="text-[10px] text-emerald-600 leading-tight">สายซัพพอร์ต ใจเย็น เป็นผู้ฟังที่ดี รักสงบ</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">🧐</span>
                  <div>
                    <p className="text-[12px] font-bold text-blue-800">C (Compliance)</p>
                    <p className="text-[10px] text-blue-600 leading-tight">สายเป๊ะ เจ้าระเบียบ ข้อมูลและแผนต้องแน่น</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowDiscInfo(false)}
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 active:scale-95 transition-all text-[13px] shadow-md"
              >
                อ๋อออ เข้าใจละ!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}