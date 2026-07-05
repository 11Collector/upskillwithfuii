"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check, RefreshCcw, Quote, Download, Loader2, Crown, AlertTriangle } from "lucide-react";
import { Kanit } from "next/font/google";
import { domToPng } from 'modern-screenshot';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";

// 💡 1. อย่าลืม Import (ถ้ายังไม่มี)
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AssessmentResultCTA from '@/app/components/AssessmentResultCTA';


const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

// --- 1. DATA: Mood Check (10 อารมณ์) ---
const moodOptions = [
  { id: "happy", icon: "😊", title: "มีความสุข", theme: "border-yellow-400 bg-yellow-50 text-yellow-600" },
  { id: "sad", icon: "😢", title: "เศร้าหมอง", theme: "border-blue-400 bg-blue-50 text-blue-600" },
  { id: "angry", icon: "😡", title: "โกรธมาก", theme: "border-red-500 bg-red-50 text-red-600" },
  { id: "fear", icon: "😨", title: "หวาดกลัว", theme: "border-purple-500 bg-purple-50 text-purple-600" },
  { id: "love", icon: "❤️", title: "คลั่งรัก", theme: "border-pink-500 bg-pink-50 text-pink-600" },
  { id: "lonely", icon: "🍂", title: "โดดเดี่ยว", theme: "border-stone-500 bg-stone-50 text-stone-600" },
  { id: "hope", icon: "✨", title: "เปี่ยมหวัง", theme: "border-emerald-400 bg-emerald-50 text-emerald-600" },
  { id: "confused", icon: "🌀", title: "สับสน", theme: "border-indigo-400 bg-indigo-50 text-indigo-600" },
  { id: "apathetic", icon: "😐", title: "เฉยเมย", theme: "border-slate-400 bg-slate-50 text-slate-500" },
  { id: "exhausted", icon: "🫠", title: "เหนื่อยล้า", theme: "border-orange-400 bg-orange-50 text-orange-600" }
];

// --- 2. DATA: คำนามธรรม (30 คำต่อหมวด) ---
const abstractWords = {
  happy: [
    "รอยยิ้ม", "เสียงหัวเราะ", "เบิกบาน", "อบอุ่น", "แสงแดด", "ดอกไม้", "โบยบิน", "เปล่งประกาย", "สมหวัง", "หอมหวาน",
    "สว่างไสว", "สบายใจ", "ร่าเริง", "ของขวัญ", "ท้องฟ้า", "ปลอดโปร่ง", "รื่นรมย์", "ยินดี", "มหัศจรรย์", "ชื่นใจ",
    "เติมเต็ม", "โอบกอด", "วันใหม่", "ฤดูใบไม้ผลิ", "เสียงเพลง", "เต้นรำ", "อิสระ", "งดงาม", "สดใส", "ลงตัว"
  ],
  sad: [
    "น้ำตา", "ร่วงหล่น", "มืดมน", "แตกสลาย", "บาดแผล", "เงียบงัน", "ความทรงจำ", "สูญเสีย", "รอยร้าว", "เปราะบาง",
    "ฤดูหนาว", "ฝนพรำ", "จางหาย", "ว่างเปล่า", "ร้องไห้", "ทรมาน", "เจ็บปวด", "จมดิ่ง", "โหยหา", "แหลกสลาย",
    "ถอนหายใจ", "ลืมตา", "คราบน้ำตา", "อ่อนล้า", "ลาก่อน", "อ้างว้าง", "สะอื้น", "ทิ้งขว้าง", "โหดร้าย", "แผลเป็น"
  ],
  angry: [
    "เปลวไฟ", "เดือดดาล", "แผดเผา", "คลุ้มคลั่ง", "ระเบิด", "ทำลายล้าง", "เกรี้ยวกราด", "แหลกเหลว", "โมโห", "บดขยี้",
    "ขีดจำกัด", "ไม่ยอมแพ้", "แค้นเคือง", "ฟืนไฟ", "เดือดพล่าน", "พายุ", "ฉีกขาด", "โวยวาย", "เกลียดชัง", "รังเกียจ",
    "หงุดหงิด", "ทนไม่ไหว", "กดดัน", "ต่อต้าน", "ท้าทาย", "เลือดเย็น", "ฟาดฟัน", "แผดเสียง", "ตะโกน", "คุกรุ่น"
  ],
  fear: [
    "สั่นเทา", "หวาดระแวง", "หนี", "มืดมิด", "ซ่อนตัว", "เสียงสะท้อน", "ลี้ภัย", "ฝันร้าย", "กังวล", "เข่าทรุด",
    "เย็นเยียบ", "หายใจไม่ออก", "คุกเข่า", "มุมมืด", "หลงทาง", "สยดสยอง", "ปิดตา", "ทางตัน", "ขลาดเขลา", "ตื่นตระหนก",
    "เสียงฝีเท้า", "หวาดผวา", "เงา", "สะดุ้ง", "ระวังตัว", "ไม่ปลอดภัย", "ขอบเหว", "หลอกหลอน", "อันตราย", "ไร้ทางออก"
  ],
  love: [
    "ผูกพัน", "โอบกอด", "ดวงดาว", "นิรันดร์", "เต้นแรง", "อ่อนโยน", "ทะนุถนอม", "ห่วงใย", "พรหมลิขิต", "หลงใหล",
    "สายตา", "รอยจูบ", "จับมือ", "ลึกซึ้ง", "หวานใจ", "ดอกกุหลาบ", "เติมเต็ม", "คู่กัน", "ยอมทุกอย่าง", "เฝ้ารอ",
    "สัญญา", "เคียงข้าง", "ละมุน", "ละลาย", "ทรงจำสีจาง", "ซื่อสัตย์", "ลมหายใจ", "แสงสว่าง", "อุ่นใจ", "ล้ำค่า"
  ],
  lonely: [
    "เดียวดาย", "ลำพัง", "เงียบเหงา", "ไร้เงา", "เคว้งคว้าง", "หนาวเหน็บ", "แปลกหน้า", "อ้างว้าง", "ไม่มีใคร", "ลอยคอ",
    "ความว่างเปล่า", "ท่ามกลางผู้คน", "ห้องเดิมๆ", "รอคอย", "เข็มนาฬิกา", "ถอนใจ", "มองเหม่อ", "ปล่อยมือ", "โดดเดี่ยว", "เสียงลม",
    "จางหาย", "ไร้จุดหมาย", "ไม่รับรู้", "โลกใบนี้", "เงาตัวเอง", "จม", "หายไป", "วันที่ยาวนาน", "กอดตัวเอง", "ที่ของฉัน"
  ],
  hope: [
    "รุ่งอรุณ", "แสงแรก", "ก้าวเดิน", "ศรัทธา", "วันพรุ่งนี้", "เริ่มต้นใหม่", "ปีก", "ทะยาน", "ความฝัน", "โอกาส",
    "มุ่งมั่น", "ปลายทาง", "ดอกไม้บาน", "เชื่อมั่น", "ปาฏิหาริย์", "แสงสว่าง", "รอคอย", "ความจริง", "ก้าวผ่าน", "เติบโต",
    "วันที่ดีกว่า", "รอยยิ้มแรก", "ดินแดน", "เมล็ดพันธุ์", "อธิษฐาน", "เข็มทิศ", "สัญญาณ", "ไม่ยอมแพ้", "ก้าวต่อไป", "ชีวิต"
  ],
  confused: [
    "หมอกควัน", "ทางแยก", "วังวน", "วงกต", "ไม่เข้าใจ", "พร่ามัว", "หลงทิศ", "คำถาม", "ลังเล", "สองจิตสองใจ",
    "ปริศนา", "ซับซ้อน", "ยุ่งเหยิง", "พันกัน", "ค้นหา", "มืดมน", "ตัวเลือก", "ก้าวพลาด", "ภาพลวงตา", "เสียงรบกวน",
    "ว้าวุ่น", "ไม่แน่นอน", "เคลือบแคลง", "ระแวง", "หลับตาเดิน", "ไร้คำตอบ", "หมุนวน", "สะท้อน", "กลืนไม่เข้า", "เงื่อนงำ"
  ],
  apathetic: [
    "ไร้สีสัน", "ว่างเปล่า", "ผ่านไป", "ลมพัด", "นาฬิกาทราย", "ชินชา", "ปล่อยวาง", "ฝุ่นควัน", "ลอยตัว", "ชั่วคราว",
    "ความเงียบ", "ละเลย", "จืดจาง", "ไร้จุดหมาย", "เย็นชา", "มองข้าม", "นิ่งเฉย", "วันเดิมๆ", "เท่าเดิม", "ตามลม",
    "ไร้น้ำหนัก", "ไม่คาดหวัง", "รอยเท้า", "ละออง", "หลุดพ้น", "ลืมเลือน", "เพียงผ่าน", "ไม่ผูกพัน", "ชั่วครู่", "ธุลี"
  ],
  exhausted: [
    "หมดแรง", "แบกรับ", "ถอนหายใจ", "หนักอึ้ง", "ล้มตัว", "พักผ่อน", "รอยย่น", "ทิ้งตัว", "ภาระ", "พอแล้ว",
    "อ่อนล้า", "หลับตา", "เงาตะคุ่ม", "กัดฟัน", "ฝืนยิ้ม", "แบกโลก", "ลากขา", "ล้มลุก", "ร่วงหล่น", "ปล่อยมือ",
    "คลาน", "สะสม", "ตึงเครียด", "สุดทาง", "นาฬิกาปลุก", "แบตเตอรี่", "หมดไฟ", "ฝืนทน", "ปิดสวิตช์", "หยาดเหงื่อ"
  ]
};
// bubble 85px on mobile (half=42px), 110px on sm+ (half=55px); using 42px for calc keeps center bubbles safely inside on all screens
const safePositions = [
  // --- โซนบน 5 วง (เกาะขอบบน) ---
  "top-[6%] left-[5%]",
  "top-[4%] right-[8%]",
  "top-[16%] left-[calc(50%-42px)]",
  "top-[28%] left-[8%]",
  "top-[26%] right-[5%]",

  // --- โซนล่าง 5 วง ---
  "bottom-[34%] left-[6%]",
  "bottom-[32%] right-[8%]",
  "bottom-[22%] left-[calc(50%-42px)]",
  "bottom-[8%] left-[10%]",
  "bottom-[10%] right-[7%]"
];

// 💡 เพิ่มการหมุน (rotate) เบาๆ และให้ duration แรนด้อมนิดหน่อยจะได้ไม่ลอยพร้อมกันหมด
const floatingAnimation = (delay: number, duration: number = 6): any => ({
  y: [-12, 12, -12],
  rotate: [-1.5, 1.5, -1.5], // เอียงซ้ายขวาเบาๆ
  transition: {
    duration: duration,
    ease: "easeInOut",
    repeat: Infinity,
    delay: delay
  }
});

const loadingPhrases = [
  "กำลังจับความรู้สึกของคุณตอนนี้...",
  "รอหน่อยนะ... กำลังหาคำที่ทัชใจให้ ✨",
  "ทุกความรู้สึกมีเหตุผลในแบบของมัน",
  "เตรียมแคปได้เลย ประโยคนี้เพื่อคุณ 📸"
];
// --- Helper Component สำหรับ Bubble ---
const Circle = ({ mood, pos, delay, index, onStart }: any) => {
  const getThemeColors = (id: string) => {
    const themes: Record<string, { border: string, shadow: string }> = {
      happy: { border: "#facc15", shadow: "rgba(250, 204, 21, 0.3)" },
      sad: { border: "#60a5fa", shadow: "rgba(96, 165, 250, 0.3)" },
      angry: { border: "#ef4444", shadow: "rgba(239, 68, 68, 0.3)" },
      fear: { border: "#a855f7", shadow: "rgba(168, 85, 247, 0.3)" },
      love: { border: "#ec4899", shadow: "rgba(236, 72, 153, 0.3)" },
      lonely: { border: "#78716c", shadow: "rgba(120, 113, 108, 0.2)" },
      hope: { border: "#34d399", shadow: "rgba(52, 211, 153, 0.3)" },
      confused: { border: "#818cf8", shadow: "rgba(129, 140, 248, 0.3)" },
      apathetic: { border: "#94a3b8", shadow: "rgba(148, 163, 184, 0.2)" },
      exhausted: { border: "#fb923c", shadow: "rgba(251, 146, 60, 0.3)" }
    };
    return themes[id] || { border: "#e5e7eb", shadow: "rgba(0,0,0,0.05)" };
  };

  const theme = getThemeColors(mood.id);
  const duration = 5 + ((index || 0) % 4);

  return (
    <motion.button
      animate={floatingAnimation(delay, duration)}
      onClick={() => onStart(mood)}
      className={`absolute ${pos} w-[85px] h-[85px] sm:w-[110px] sm:h-[110px] rounded-full border-[2.5px] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all bg-white/90 backdrop-blur-sm shrink-0 z-20 hover:scale-105`}
      style={{
        borderColor: theme.border,
        boxShadow: `0 10px 25px -5px ${theme.shadow}, 0 8px 10px -6px ${theme.shadow}`
      }}
    >
      <span className="text-3xl sm:text-5xl mb-0.5 drop-shadow-sm">{mood.icon}</span>
      <span className="font-extrabold text-[10px] sm:text-[13px] text-stone-700 tracking-tight text-center px-1 leading-none">{mood.title}</span>
    </motion.button>
  );
};

export default function SwipeQuoteApp() {

  // 💡 2. ใส่ State และ useEffect ไว้ตรงแถวๆ บนสุดของฟังก์ชันหลัก (เช่น ใต้พวก useState อื่นๆ)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [fromPage, setFromPage] = useState<"home" | "dashboard" | null>(null);
  const [isProMember, setIsProMember] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }

        const userRef = doc(db, "users", user.uid);
        unsubSnapshot = onSnapshot(userRef, (snap) => {
          try {
            if (snap.exists()) {
              const data = snap.data();
              setUserData(data);
              const subscriptionStatus = data?.subscriptionStatus || data?.subscription_status || "";
              const subscriptionTier = data?.subscriptionTier || data?.subscription_tier || "";
              setIsProMember(
                data?.role === "premium" ||
                subscriptionTier === "pro" ||
                ["active", "trialing"].includes(subscriptionStatus) ||
                Boolean(data?.isLifetimeMember)
              );
            }
          } catch (error) {
            console.error("Error listening to user data in khomsatsat:", error);
          }
        });
      } else {
        setUserData(null);
        setIsProMember(false);
      }
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "home" || from === "dashboard") {
        setFromPage(from as any);
      }
    }

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);


  const [gameState, setGameState] = useState<"start" | "swiping" | "generating" | "result">("start");
  const [playerMood, setPlayerMood] = useState<{ id: string, title: string } | null>(null);
  const [deck, setDeck] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [finalQuote, setFinalQuote] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [randomizedMoods, setRandomizedMoods] = useState<any[]>([]);

  const quoteCardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasSavedQuote = useRef(false);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // บันทึก quoteData + XP ย้อนหลังเมื่อ user login ตอนอยู่หน้า result
  useEffect(() => {
    if (!currentUser || gameState !== "result" || !finalQuote || hasSavedQuote.current) return;
    hasSavedQuote.current = true;

    const saveOnLogin = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, addDoc, doc, getDoc, setDoc, increment, serverTimestamp } = await import('firebase/firestore');
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

        let shouldGiveXP = true;
        if (userSnap.exists() && userSnap.data().lastQuoteDate === todayStr) shouldGiveXP = false;

        // เพิ่มลง quotes collection เพื่อให้ dashboardService อ่านได้
        await addDoc(collection(db, "quotes"), {
          userId: currentUser.uid,
          mood: playerMood?.title,
          quote: finalQuote,
          createdAt: serverTimestamp(),
        });

        const updateData: any = {};
        if (shouldGiveXP) {
          const oldXP = (userSnap.exists() ? userSnap.data()?.totalXP : 0) || 0;
          const newXP = oldXP + 10;
          const oldLevel = Math.floor(oldXP / 100) + 1;
          const newLevel = Math.floor(newXP / 100) + 1;

          updateData.totalXP = increment(10);
          updateData.lastQuoteDate = todayStr;

          if (newLevel > oldLevel) {
            sessionStorage.setItem('pendingLevelUp', String(newLevel));
          }
        }
        if (Object.keys(updateData).length > 0) {
          await setDoc(userRef, updateData, { merge: true });
        }
      } catch (e) {
        console.error("Post-login quote save:", e);
        hasSavedQuote.current = false;
      }
    };
    saveOnLogin();
  }, [currentUser]);

  useEffect(() => {
    const shuffled = [...moodOptions].sort(() => Math.random() - 0.5);
    setRandomizedMoods(shuffled);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let interval: any;
    if (gameState === "generating") {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);

  const handleSaveImage = async () => {
    const element = quoteCardRef.current;
    if (!element) return;

    setIsSaving(true);
    try {
      // 💡 1. เตรียมความพร้อมของ Font และรูปภาพ
      await document.fonts.ready;

      // 💡 2. ปรับ Style ชั่วคราวเพื่อให้ Capture ได้ครบถ้วน (ลดโอกาสภาพขาดในมือถือ)
      const originalStyle = {
        height: element.style.height,
        overflow: element.style.overflow,
      };

      element.style.height = 'auto';
      element.style.overflow = 'visible';

      await new Promise(r => setTimeout(r, 500)); // รอให้ Browser Re-render แป๊บนึง

      const dataUrl = await domToPng(element, {
        quality: 1,
        scale: 4, // เพิ่มความชัดเป็น 4 เท่าให้สะใจ
        backgroundColor: "#020617",
        features: {
          removeControlCharacter: true,
        }
      });

      // คืนค่าเดิม
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;

      if (!dataUrl) throw new Error("Failed to generate image data URL");

      const link = document.createElement("a");
      link.download = `khomsatsat-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error("Save image failed", err);
      alert("ไม่สามารถบันทึกรูปภาพได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือใช้วิธีการแคปหน้าจอแทนนะครับ");
    } finally {
      setIsSaving(false);
    }
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacityNope = useTransform(x, [-100, -20], [1, 0]);
  const opacityLike = useTransform(x, [20, 100], [0, 1]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) handleSwipeRight();
    else if (info.offset.x < -swipeThreshold) handleSwipeLeft();
  };

  const handleSwipeRight = () => {
    const word = deck[currentCardIndex];
    const newCollected = [...collectedWords, word];
    setCollectedWords(newCollected);

    if (newCollected.length === 3) {
      processAIGeneration(newCollected);
    } else {
      nextCard();
    }
  };

  const handleSwipeLeft = () => {
    nextCard();
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => (prev < deck.length - 1 ? prev + 1 : 0));
  };

  const startGame = (mood: { id: string, title: string }) => {
    if (isOutOfQuota) {
      setShowQuotaModal(true);
      return;
    }
    setPlayerMood(mood);
    const moodKey = mood.id as keyof typeof abstractWords;
    const words = abstractWords[moodKey].sort(() => Math.random() - 0.5);
    setDeck(words);
    setGameState("swiping");
  };

  const processAIGeneration = async (wordsToUse: string[]) => {
    setGameState("generating");
    setApiError(null);

    const promptText = `
    คุณคือนักคิดและนักเขียนแนวปรัชญาการใช้ชีวิต สไตล์การตกผลึกความคิดแบบ "Naval Ravikant" (Minimalist Wisdom) ถนัดการเขียนประโยคที่สั้น กระชับ คมคาย เป็นเหตุเป็นผล และเปลี่ยนมุมมองชีวิตให้ผู้อ่านตื่นรู้ (Paradoxical Truth) โดยไม่มีความน้ำเน่าหรือเพ้อฝัน
    
    ผู้ใช้กำลังรู้สึก: ${playerMood?.title}
    และคำศัพท์บังคับที่ต้องนำมาร้อยเรียงคือ: ${wordsToUse.join(', ')}

    [กระบวนการคิดเบื้องหลัง: หากคำศัพท์ดูขัดแย้งกัน หรือมีคำเชิงชู้สาว/ความรัก ให้ตีความหมายใหม่แบบปรัชญาสัจธรรม (เช่น เปลี่ยนความรักหวานแหวว เป็นความรักตัวเอง หรือการเคารพความจริง) และร้อยเรียงคำทั้งหมดให้เป็น 1 แกนความคิดที่เฉียบขาด ทรงพลัง ไม่เยิ่นเย้อ]

    จงแต่งคำคม 1 บท เพื่อนำไปจัดวางบนภาพ (Typography Art) ให้ดูสวยงาม ทรงพลัง
    
    🚨 เงื่อนไขสำคัญ (Algorithm การตัดคำและจัดทรง Text Block):
    1. **กฎจำนวนบรรทัด (ULTRA STRICT):** บังคับให้มี "3 ถึง 5 บรรทัด" เท่านั้น (ห้ามขาด ห้ามเกิน)
       - การขึ้นบรรทัดใหม่ (\n) ต้องมีเพียง 2-4 ครั้งเท่านั้นเพื่อให้ได้ 3-5 บรรทัด
       - หากผลลัพธ์มี 6 หรือ 7 บรรทัด ถือว่าผิดกฎร้ายแรง
    2. **กฎความยาวต่อบรรทัด:** หนึ่งบรรทัดควรมี 10-20 ตัวอักษร (ห้ามสั้นเกินไปจนทำให้จำนวนบรรทัดเยอะ)
    3. **กฎการจัดวรรค:** 1 บรรทัดต้องจบความหมายในตัว ไม่ทิ้งคำเชื่อมไว้ท้ายบรรทัด
    4. **ห้ามพิมพ์คำอธิบาย:** พิมพ์แค่ตัวข้อความคำคมเพียวๆ เท่านั้น
    
    [คำเตือนสุดท้าย: ตรวจสอบจำนวนบรรทัดให้ดี ห้ามเกิน 5 บรรทัดเด็ดขาด]
  `;

    try {
      // ใส่ AbortController เผื่อ API ค้างนานเกิน 15 วินาทีให้ตัดจบ
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const idToken = currentUser ? await currentUser.getIdToken() : null;
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ prompt: promptText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      // เช็ก Error จาก API (รวมถึงกรณี DeepSeek High Demand)
      if (data.error) {
        const errorMsg = data.error.toLowerCase();
        if (errorMsg.includes("high demand") || errorMsg.includes("quota") || errorMsg.includes("busy")) {
          setFinalQuote("ขออภัยครับ ตอนนี้ AI กำลังพักดื่มน้ำ (คนใช้เยอะมาก) ☕\nลองกดสุ่มใหม่อีกครั้งในอีก 10 วินาทีนี้นะ!");
          setGameState("result");
          return;
        }
        throw new Error(data.error);
      }

      // 2. ดึงคำคม (รองรับทั้ง format ใหม่ของ DeepSeek และ format เก่าเผื่อสลับกลับไป Gemini)
      let generatedQuote = data.quote || data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!generatedQuote) throw new Error("AI ส่งข้อมูลมาว่างเปล่า");

      setFinalQuote(generatedQuote);
      setGameState("result");

      // 3. เซฟลง Firebase และ จัดการ XP (ส่วนนี้ logic เดิมดีอยู่แล้วครับ)
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, addDoc, doc, getDoc, setDoc, increment, serverTimestamp } = await import('firebase/firestore');

        // ก. บันทึกลงคลัง
        await addDoc(collection(db, "quotes"), {
          userId: currentUser?.uid || "guest",
          mood: playerMood?.title,
          words: wordsToUse,
          quote: generatedQuote,
          createdAt: serverTimestamp()
        });

        // ข. บันทึก quoteData + แจก XP (ถ้า Login)
        if (currentUser) {
          hasSavedQuote.current = true; // ป้องกัน post-login useEffect save ซ้ำ
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

          let shouldGiveXP = true;
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.lastQuoteDate === todayStr) shouldGiveXP = false;
          }

          const updateData: any = {
            quoteData: {
              quote: generatedQuote,
              mood: playerMood?.title,
              createdAt: serverTimestamp()
            }
          };

          if (shouldGiveXP) {
            const oldXP = (userSnap.exists() ? userSnap.data()?.totalXP : 0) || 0;
            const newXP = oldXP + 10;
            const oldLevel = Math.floor(oldXP / 100) + 1;
            const newLevel = Math.floor(newXP / 100) + 1;

            updateData.totalXP = increment(10);
            updateData.lastQuoteDate = todayStr;

            if (newLevel > oldLevel) {
              sessionStorage.setItem('pendingLevelUp', String(newLevel));
            }
            console.log("🎉 +10 XP Success!");
          }

          await setDoc(userRef, updateData, { merge: true });
        }
      } catch (dbError) {
        console.error("❌ Firebase Error:", dbError);
      }

    } catch (error: any) {
      console.error("🚨 API Error:", error);
      const isTimeout = error?.name === "AbortError";
      setApiError(isTimeout
        ? "AI ตอบช้าไปหน่อย (timeout) ลองใหม่ได้เลย"
        : "เชื่อมต่อไม่ได้ในตอนนี้ ลองใหม่สักครั้งนะ"
      );
      setGameState("result");
    }
  };

  const resetApp = () => {
    setGameState("start"); setPlayerMood(null);
    setCurrentCardIndex(0); setCollectedWords([]);
    setApiError(null); setFinalQuote("");
    setRandomizedMoods([...moodOptions].sort(() => Math.random() - 0.5));
  };

  const getActiveThemeClasses = () => {
    if (!playerMood) return "border-stone-500 text-stone-400";
    const currentMoodInfo = moodOptions.find(m => m.id === playerMood.id);
    if (!currentMoodInfo) return "border-stone-500 text-stone-400";
    const classes = currentMoodInfo.theme.split(" ");
    return `${classes[0]} ${classes[2]}`;
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const currentDay = userData?.quoteDailyDate || "";
  const currentCount = currentDay === todayStr ? Number(userData?.quoteDailyCount || 0) : 0;
  const FREE_DAILY_QUOTE_LIMIT = 1;
  const isOutOfQuota = !isProMember && currentUser && currentCount >= FREE_DAILY_QUOTE_LIMIT;
  const remainingQuota = isProMember ? Infinity : Math.max(0, FREE_DAILY_QUOTE_LIMIT - currentCount);

  const timestamp = new Date().toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    // 💡 กลับมาใช้ min-h-[100dvh] และ overflow-hidden เพื่อความสวยงามนิ่งๆ แบบแอป
    <div className={`min-h-[100dvh] bg-stone-100 flex flex-col items-center justify-center sm:p-4 ${kanit.className} overflow-hidden`}>
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl bg-white shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] lg:h-[900px] flex flex-col relative sm:rounded-[2.5rem] sm:border-[4px] sm:border-stone-900">
        {(gameState === "start" || gameState === "result") && (
          <Link
            href={fromPage === "home" ? "/" : fromPage === "dashboard" ? "/dashboard" : (currentUser ? "/dashboard" : "/")}
            className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs font-black text-stone-700 shadow-sm backdrop-blur-md transition-all hover:bg-stone-50 active:scale-95 z-50 cursor-pointer"
          >
            <ChevronLeft size={13} className="text-stone-600" />
            <span>{fromPage === "home" ? "หน้าหลัก" : fromPage === "dashboard" ? "แดชบอร์ด" : (currentUser ? "แดชบอร์ด" : "หน้าหลัก")}</span>
          </Link>
        )}
        {/* === 1. START SCREEN === */}
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center relative bg-stone-50 h-full w-full overflow-hidden">

            <Link
              href="/gallery"
              className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 bg-stone-900 text-white rounded-full text-[13px] font-bold tracking-wide shadow-lg hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              แกลเลอรีคำคม <ChevronRight size={14} />
            </Link>

            {/* ลายจุด Polkadot ฉากหลัง */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

            {/* กลุ่มวงกลมอารมณ์ */}
            <div className="absolute inset-0 w-full h-full z-10" style={{ opacity: isMounted ? 1 : 0 }}>
              {isMounted && randomizedMoods.map((mood, idx) => (
                <Circle
                  key={mood.id}
                  mood={mood}
                  pos={safePositions[idx]}
                  delay={idx * 0.4}
                  index={idx}
                  onStart={startGame}
                />
              ))}
            </div>

            <div className="relative z-30 flex flex-col items-center -translate-y-8 pointer-events-none">

              {/* กล่องโลโก้แบบ "ขอบจางหาย" */}
              <div className="relative pointer-events-none p-12 flex flex-col items-center justify-center w-[350px] h-[220px]">

                <div className="absolute inset-0 bg-white/95 blur-3xl rounded-full"></div>

                <div className="relative z-10 flex flex-col items-center">

                  {/* 💡 ส่วนที่แก้ไข: เปลี่ยนจากตัวหนังสือ h1 เป็นรูปภาพโลโก้ */}
                  <img
                    src="/logo-khomsatsat.png" /* เช็คชื่อไฟล์ให้ตรงกับที่อยู่ในโฟลเดอร์ public ด้วยนะครับ */
                    alt="โลโก้คมสัดสัด"
                    className="w-[280px] sm:w-[320px] h-auto mb-3 object-contain drop-shadow-md"
                  />

                  <p className="text-stone-500 text-[13px] font-medium tracking-wide px-1 drop-shadow-sm text-center leading-relaxed">
                    เลือกสิ่งที่ &quot;ทัช&quot; ในใจ<br />ให้เป็นคำคมเฉพาะคุณ
                  </p>

                  {currentUser && (
                    <div className="mt-4 pointer-events-auto select-none scale-[0.95] sm:scale-100 transition-all duration-300">
                      {isProMember ? (
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.05em] sm:tracking-[0.15em] bg-cyan-500/10 text-cyan-600 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-cyan-500/25 flex items-center gap-1 sm:gap-1.5 justify-center shadow-[0_0_15px_rgba(6,182,212,0.08)]">
                          <Crown size={11} className="text-cyan-500 animate-pulse" /> PRO MEMBER (สร้างได้ไม่จำกัด)
                        </span>
                      ) : (
                        <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.05em] sm:tracking-[0.15em] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border flex items-center gap-1 sm:gap-1.5 justify-center ${
                          remainingQuota > 0 
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/25" 
                            : "bg-red-500/10 text-red-600 border-red-500/25"
                        }`}>
                          {remainingQuota > 0 ? (
                            <>โควตาวันนี้: เหลือ {remainingQuota}/{FREE_DAILY_QUOTE_LIMIT} ครั้ง</>
                          ) : (
                            <>โควตาวันนี้: หมดแล้ว (0/{FREE_DAILY_QUOTE_LIMIT})</>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            <p className="absolute bottom-6 text-[9px] text-stone-400 font-black uppercase tracking-[0.2em] z-30 bg-white/50 px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
              Created By <span className="text-blue-500 mx-1">×</span> อัพสกิลกับฟุ้ย
            </p>
          </motion.div>
        )}

        {/* === 2. SWIPING SCREEN (อัปเกรดสไตล์ Gen Z & Glassmorphism ✨) === */}
        {gameState === "swiping" && deck.length > 0 && (
          <div className="flex-1 flex flex-col bg-stone-50 relative overflow-hidden h-full">

            {/* 💡 1. ฉากหลัง Polkadot และแสง Glow ตามอารมณ์ */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
            <div
              className="absolute inset-0 opacity-30 blur-[100px] pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle at center 40%, ${playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6"} 0%, transparent 60%)`
              }}
            ></div>

            {/* 💡 2. ส่วนหัวสะสมคำ (ปรับเป็น Glassmorphism) */}
            <div className="pt-10 pb-5 px-6 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm flex flex-col items-center justify-center z-10 relative">
              <button onClick={resetApp} className="absolute left-6 top-10 p-2.5 bg-white rounded-full hover:bg-stone-100 text-stone-600 transition-colors shadow-sm border border-stone-100">
                <ChevronLeft size={20} />
              </button>

              <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3">สะสมคำที่ทัชใจ</h2>

              {/* ช่องใส่คำที่เลือก */}
              <div className="flex gap-3">
                {[0, 1, 2].map(slot => {
                  const hasWord = !!collectedWords[slot];
                  const activeColor = playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6";

                  return (
                    <div
                      key={slot}
                      className={`w-20 h-10 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${hasWord
                        ? 'text-white shadow-lg border-2'
                        : 'bg-white/50 border-2 border-dashed border-stone-300 text-transparent'
                        }`}
                      style={hasWord ? { backgroundColor: activeColor, borderColor: activeColor, boxShadow: `0 8px 15px -3px ${activeColor}60` } : {}}
                    >
                      {collectedWords[slot] || "?"}
                    </div>
                  );
                })}
              </div>

              {/* Tag คำแนะนำการปัด */}
              <div className="mt-4 flex items-center justify-center gap-3 text-[10px] font-extrabold text-stone-400 bg-white/80 px-4 py-1.5 rounded-full border border-stone-100 shadow-sm">
                <span className="flex items-center gap-1 uppercase tracking-wider"><ChevronLeft size={12} className="text-stone-300" /> ปัดซ้ายทิ้ง</span>
                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                <span className="flex items-center gap-1 uppercase tracking-wider">ปัดขวาเลือก <ChevronRight size={12} className="text-stone-300" /></span>
              </div>
            </div>

            {/* 💡 3. พื้นที่การปัดคำ (การ์ดกระจกมีมิติ) */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full px-4 overflow-hidden">
              <AnimatePresence>
                <motion.div
                  key={currentCardIndex}
                  style={{ x, rotate, scale: cardScale }}
                  drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
                  initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.15 } }}
                  // ปรับการ์ดหลักให้เป็นกระจกใส และขอบหนา
                  className="absolute w-[75vw] max-w-[280px] aspect-square bg-white/80 backdrop-blur-xl rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-[8px] border-white flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing z-20"
                >
                  {/* แสตมป์ "ข้าม" */}
                  <motion.div
                    style={{ opacity: opacityNope }}
                    className="absolute top-8 right-0 border-[4px] border-stone-300 text-stone-400 font-black text-xl px-4 py-1.5 rounded-2xl rotate-[20deg] pointer-events-none z-30 uppercase bg-white/90 backdrop-blur-md shadow-sm"
                  >
                    ข้าม
                  </motion.div>

                  {/* แสตมป์ "เอาคำนี้" (สีเปลี่ยนตามอารมณ์) */}
                  <motion.div
                    style={{
                      opacity: opacityLike,
                      borderColor: playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6",
                      color: playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6"
                    }}
                    className="absolute top-8 left-0 border-[4px] font-black text-xl px-4 py-1.5 rounded-2xl -rotate-[20deg] pointer-events-none z-30 uppercase bg-white/90 backdrop-blur-md shadow-sm"
                  >
                    เอาคำนี้
                  </motion.div>

                  {/* ตัวคำ (จัด Font ให้เท่ขึ้น และแก้ปัญหาคำฉีก) */}
                  <h3
                    className={`font-black text-stone-900 text-center leading-tight tracking-tighter drop-shadow-sm px-2 whitespace-nowrap transition-all duration-300 ${deck[currentCardIndex]?.length > 10
                      ? 'text-[24px] sm:text-[30px]' // ปรับให้เล็กลงตามที่แจ้ง
                      : deck[currentCardIndex]?.length > 7
                        ? 'text-[28px] sm:text-[36px]'
                        : 'text-[34px] sm:text-[42px]'
                      }`}
                  >
                    {deck[currentCardIndex]}
                  </h3>
                </motion.div>
              </AnimatePresence>

              {/* การ์ดซ้อนหลัง (เอฟเฟกต์มิติ Glassmorphism) */}
              <div className="absolute w-[75vw] max-w-[280px] aspect-square bg-white/40 backdrop-blur-md rounded-full border-[4px] border-white/60 -z-10 scale-[0.90] translate-y-8 shadow-sm"></div>
            </div>

            {/* 💡 4. ส่วนท้ายที่เป็นไอคอนการปัด (ลอยตัวขึ้นนิดหน่อย) */}
            <div className="pb-10 pt-4 flex justify-between items-center w-full px-14 sm:px-20 relative z-20">
              <button onClick={handleSwipeLeft} className="flex flex-col items-center gap-2 group transition-all active:scale-95">
                <span className="p-4 bg-white border border-stone-100 rounded-full shadow-md text-stone-400 group-hover:bg-stone-50 group-hover:text-stone-600 transition-all">
                  <X size={26} strokeWidth={3} />
                </span>
                <span className="text-[12px] font-black tracking-widest text-stone-400 uppercase">ไม่รู้สึก</span>
              </button>

              <button onClick={handleSwipeRight} className="flex flex-col items-center gap-2 group transition-all active:scale-95">
                <span
                  className="p-4 rounded-full shadow-lg border-2 transition-all group-hover:scale-105"
                  style={{
                    // 💡 เติม : "#dbeafe" ปิดท้ายเงื่อนไขเรียบร้อย
                    backgroundColor: playerMood ? ({ happy: "#fef08a", sad: "#dbeafe", angry: "#fee2e2", fear: "#f3e8ff", love: "#fce7f3", lonely: "#f5f5f4", hope: "#d1fae5", confused: "#e0e7ff", apathetic: "#f1f5f9", exhausted: "#ffedd5" })[playerMood.id] || "#dbeafe" : "#dbeafe",
                    borderColor: playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6",
                    color: playerMood ? ({ happy: "#eab308", sad: "#3b82f6", angry: "#ef4444", fear: "#9333ea", love: "#db2777", lonely: "#57534e", hope: "#10b981", confused: "#6366f1", apathetic: "#64748b", exhausted: "#f97316" })[playerMood.id] || "#3b82f6" : "#3b82f6"
                  }}
                >
                  <Check size={26} strokeWidth={3} />
                </span>
                <span
                  className="text-[12px] font-black tracking-widest uppercase"
                  style={{ color: playerMood ? ({ happy: "#eab308", sad: "#3b82f6", angry: "#ef4444", fear: "#9333ea", love: "#db2777", lonely: "#57534e", hope: "#10b981", confused: "#6366f1", apathetic: "#64748b", exhausted: "#f97316" })[playerMood.id] || "#3b82f6" : "#3b82f6" }}
                >
                  ทัชใจ
                </span>
              </button>
            </div>

          </div>
        )}

        {/* === 3. GENERATING (อัปเกรดให้ดูเท่ๆ สดใสแบบ Genz & Colorful) === */}
        {gameState === "generating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-950 relative overflow-hidden"
          >
            {/* 💡 1. แสงออร่าพื้นหลังแบบ Iridescent Multi-Color (เคลื่อนไหวและสีสันสดใส) */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 5, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/50 via-cyan-500/30 to-stone-950 pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-magenta-500/30 via-transparent to-stone-950 pointer-events-none blur-3xl"
            />

            {/* 💡 2. ตัวโหลดข้อมูลซ้อน Layer (เปลี่ยนจาก Concentric Rings เป็น Energetic Sphere Cluster) */}
            <div className="relative mb-14 z-10 flex items-center justify-center w-36 h-36">

              {/* วงแหวนและแสงเรืองรองกลางวง (Center Glow & Rings) */}
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 border border-white/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute w-20 h-20 border-2 border-dashed border-white/30 rounded-full"
              />

              {/* กลุ่ม Spheres เคลื่อนไหว (Spherical Orbit Loader) */}
              {[
                { color: "cyan", size: 10, offset: "-2.5rem" },
                { color: "magenta", size: 14, offset: "2rem" },
                { color: "purple", size: 8, offset: "1.5rem", y: "2rem" },
                { color: "yellow", size: 11, offset: "-1.5rem", y: "-2.5rem" },
                { color: "blue", size: 10, offset: "0rem", y: "0rem" }
              ].map((s, idx) => (
                <motion.div
                  key={idx}
                  className={`absolute rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]`}
                  style={{
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    backgroundColor: s.color === "cyan" ? "#22d3ee" : s.color === "magenta" ? "#ec4899" : s.color === "purple" ? "#a855f7" : s.color === "yellow" ? "#facc15" : "#3b82f6",
                    translateX: s.offset,
                    translateY: s.y || "0rem",
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                    translateX: [s.offset, idx % 2 === 0 ? "3rem" : "-3rem", s.offset],
                    translateY: [s.y || "0rem", idx % 2 === 0 ? "-2rem" : "2rem", s.y || "0rem"],
                  }}
                  transition={{
                    duration: 4 + idx * 0.5,
                    repeat: Infinity,
                    delay: idx * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}

            </div>

            {/* 💡 3. ข้อความบิ๊วอารมณ์ (เปลี่ยนสีและเพิ่มสีสันที่ Text Transition) */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={loadingTextIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-[19px] sm:text-[22px] font-bold mb-4 relative z-10 h-16 flex items-center justify-center drop-shadow-md tracking-wide text-white"
                style={{
                  textShadow: '0 0 10px rgba(34, 211, 236, 0.6), 0 0 20px rgba(236, 72, 153, 0.6)'
                }}
              >
                {loadingPhrases[loadingTextIndex]}
              </motion.h2>
            </AnimatePresence>

            {/* 💡 4. แท็กคำศัพท์ที่ค่อยๆ เด้งขึ้นมาทีละคำ (เปลี่ยนสีและเพิ่มขอบ/สีสัน) */}
            <div className="flex gap-2.5 justify-center mt-6 relative z-10">
              {[{ text: collectedWords[0], color: "cyan" }, { text: collectedWords[1], color: "magenta" }, { text: collectedWords[2], color: "yellow" }].map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5, type: "spring" }}
                  className={`text-[12px] font-extrabold px-5 py-2 rounded-full border shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors`}
                  style={{
                    borderColor: w.color === "cyan" ? "rgba(34, 211, 236, 0.4)" : w.color === "magenta" ? "rgba(236, 72, 153, 0.4)" : "rgba(250, 204, 21, 0.4)",
                    color: w.color === "cyan" ? "#22d3ee" : w.color === "magenta" ? "#ec4899" : "#facc15",
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    boxShadow: `0 0 15px -3px ${w.color === "cyan" ? "rgba(34, 211, 236, 0.2)" : w.color === "magenta" ? "rgba(236, 72, 153, 0.2)" : "rgba(250, 204, 21, 0.2)"}`
                  }}
                >
                  {w.text}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
        {/* === 4. RESULT SCREEN (เวอร์ชันสวยล็อกจอ + เลื่อนเฉพาะเนื้อหา) === */}
        {gameState === "result" && (
          <div className="flex-1 flex flex-col bg-slate-950 relative h-full overflow-hidden">

            {/* Error state — show retry instead of quote */}
            {apiError && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
                <div className="text-5xl">😵</div>
                <div>
                  <p className="text-white font-bold text-lg mb-1">อุ๊ปส์!</p>
                  <p className="text-slate-400 text-sm">{apiError}</p>
                </div>
                <button
                  onClick={() => processAIGeneration(collectedWords)}
                  className="flex items-center gap-2 bg-white text-black font-black px-8 py-3.5 rounded-full text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
                >
                  <RefreshCcw size={16} /> ลองใหม่อีกครั้ง
                </button>
                <button onClick={resetApp} className="text-slate-500 text-xs font-bold hover:text-slate-300 transition-colors">
                  เริ่มใหม่ตั้งแต่ต้น
                </button>
              </div>
            )}

            {/* Normal result — only show when no error */}
            {!apiError && (
            <>{/* 💡 ส่วนที่ 1: พื้นที่แสดงการ์ด (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-4 custom-scrollbar">
              <div
                ref={quoteCardRef}
                className="flex flex-col items-center justify-center text-center p-4 sm:p-6 relative min-h-full"
                style={{ backgroundColor: '#020617' }}
              >
                {/* ลายจุด Polkadot */}
                <div
                  className="absolute inset-0 z-0 opacity-40"
                  style={{
                    backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                ></div>

                {/* Dynamic Background Glow */}
                <div
                  className="absolute inset-0 opacity-40 blur-[80px] pointer-events-none transition-all duration-1000"
                  style={{
                    background: `radial-gradient(circle at center, ${playerMood ? ({ happy: "#facc15", sad: "#60a5fa", angry: "#ef4444", fear: "#a855f7", love: "#ec4899", lonely: "#78716c", hope: "#34d399", confused: "#818cf8", apathetic: "#94a3b8", exhausted: "#fb923c" })[playerMood.id] || "#3b82f6" : "#3b82f6"} 0%, transparent 60%)`
                  }}
                ></div>

                {/* 💳 การ์ดคำคม */}
                <div
                  className="relative z-10 w-full max-w-[95%] bg-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.8)] pt-12 pb-6 sm:pt-14 sm:pb-8 px-8 sm:px-10 flex flex-col items-center gap-8"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <div className="absolute -top-5 left-8 bg-white p-3 rounded-full shadow-2xl border-[2px] border-slate-200 rotate-[-10deg]">
                    <Quote size={28} className="text-blue-600" />
                  </div>

                  <div className="w-full flex flex-col items-center gap-1.5 mt-2 px-1">
                    {(() => {
                      const quoteLines = (finalQuote || "").replace(/\\n/g, '\n').split('\n').filter(l => l.trim() !== "");
                      const longestLine = Math.max(...quoteLines.map(l => l.trim().length), 0);
                      // 💡 ปรับขนาดฟอนต์ให้พอดี (ไม่ใหญ่ไปตามที่แจ้ง)
                      let fontSizeClass = "text-[clamp(1.2rem,5vw,2.2rem)]";
                      if (longestLine > 25) fontSizeClass = "text-[clamp(0.9rem,3.5vw,1.6rem)]";
                      else if (longestLine > 20) fontSizeClass = "text-[clamp(1.1rem,4vw,1.9rem)]";

                      return quoteLines.map((line, idx) => {
                        return (
                          <div key={idx} className="mb-2.5 flex justify-center w-full px-4">
                            <span
                              className={`${fontSizeClass} font-black leading-[1.6] text-white tracking-wide text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-full`}
                              style={{
                                display: 'inline',
                                backgroundColor: 'transparent',
                                padding: '0 4px',
                              }}
                            >
                              {line.trim()}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-2.5">
                    {collectedWords.map((w, i) => (
                      <span
                        key={i}
                        className={`text-[12px] font-extrabold px-4 py-1.5 rounded-full border bg-slate-800/90 shadow-sm whitespace-nowrap ${playerMood ? moodOptions.find(m => m.id === playerMood.id)?.theme.split(" ").filter((c: string) => c.includes('text') || c.includes('border')).join(' ') : 'text-blue-300 border-blue-500/30'}`}
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
                      >
                        #{w}
                      </span>
                    ))}
                  </div>

                  {/* ✍️ Premium Signature Section */}
                  {currentUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center gap-2 mb-6"
                    >
                      {/* Name/Signature */}
                      <div className="flex flex-col items-center px-2 w-full max-w-[280px]">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 opacity-80">Insight By</span>
                        <span className={`font-black text-white tracking-tighter drop-shadow-md text-center leading-tight break-words w-full ${(currentUser?.displayName || "").length > 25 ? "text-[10px]" :
                            (currentUser?.displayName || "").length > 15 ? "text-[12px]" :
                              "text-[16px]"
                          }`}>
                          {currentUser?.displayName}
                        </span>
                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-1" />
                      </div>
                    </motion.div>
                  )}

                  <div className="relative flex flex-col items-center gap-2 w-full">
                    <div
                      className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase drop-shadow-sm bg-slate-800/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 whitespace-nowrap"
                      style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
                    >
                      <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                      CREATED BY <span className="text-blue-400 mx-0.5">×</span> อัพสกิลกับฟุ้ย
                    </div>
                    <div className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase opacity-60">
                      {timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 💡 ส่วนที่ 2: แผงปุ่มด้านล่าง (Fixed Bottom Area) */}
            {/* เพิ่ม pb-24 เพื่อดันปุ่มขึ้นมาเหนือเมนูของเว็บ และใส่ Backdrop Blur ให้ดูพรีเมียม */}
            <div className="px-6 pt-5 pb-24 sm:pb-10 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-3 shrink-0 relative z-20 shadow-[0_-15px_30px_rgba(0,0,0,0.6)]">

              <AssessmentResultCTA
                currentUser={currentUser}
                xpAmount={10}
                variant="dark"
                secondaryActions={
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleSaveImage}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-800 text-slate-300 rounded-2xl font-bold text-[13px] hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      {isSaving ? "กำลังบันทึก..." : "เซฟคำคม"}
                    </button>
                    <button
                      onClick={resetApp}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-800 text-slate-300 rounded-2xl font-bold text-[13px] hover:bg-slate-700 active:scale-95 transition-all border border-slate-700"
                    >
                      <RefreshCcw size={14} /> สร้างใหม่
                    </button>
                  </div>
                }
              />
            </div>
            </>)}
          </div>
        )}
      </div>

      {/* === QUOTA LIMIT MODAL === */}
      <AnimatePresence>
        {showQuotaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center relative shadow-2xl"
            >
              <button
                onClick={() => setShowQuotaModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-amber-400">
                <Crown size={28} />
              </div>

              <h3 className="text-xl font-black text-white mb-2">ใช้โควตาวันนี้ครบแล้ว</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                คุณสุ่มสร้างคำคมครบ 1 ครั้งของวันนี้แล้วครับ อัปเกรดเป็น PRO เพื่อสุ่มคำคมได้ไม่จำกัด และปลดล็อกห้องทำงานสมาธิ (Lounge) พร้อมรับสิทธิพิเศษอื่นๆ
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard?membership=1"
                  onClick={() => setShowQuotaModal(false)}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg hover:shadow-purple-500/20 transition-all text-center block"
                >
                  อัปเกรดเป็น PRO
                </Link>
                <button
                  onClick={() => setShowQuotaModal(false)}
                  className="w-full py-3.5 rounded-full border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/5 transition-all"
                  type="button"
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}