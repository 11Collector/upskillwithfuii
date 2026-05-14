"use client";

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, increment } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion"; 
import { PieChart, Quote, Users, Wallet, ChevronRight, Sparkles, BookOpen ,RefreshCw, LogOut, BrainCircuit, Target, AlertCircle, CheckCircle2, Circle, Trophy, Flame, Info, Lock, Unlock } from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

// --- 💡 Dictionaries ---
const MONEY_MAP: Record<string, { title: string, concept: string }> = {
  HIGH_RISK_HIGH_DISC: { title: "เซียนระบบสุดตึง", concept: "มองเงินเป็น Code ที่ต้องดีบัก" },
  MID_RISK_HIGH_DISC: { title: "นักปั้นพอร์ตมือฉมัง", concept: "มองเงินเป็นเมล็ดพันธุ์บ่มเพาะ" },
  LOW_RISK_HIGH_DISC: { title: "ผู้พิทักษ์เงินต้น", concept: "มองเงินเป็นปราสาทที่ต้องรักษา" },
  HIGH_RISK_MID_DISC: { title: "ล่าเทรนด์(ติดดอย)", concept: "มองเงินเป็นคลื่นต้องรีบขี่" },
  MID_RISK_MID_DISC: { title: "มนุษย์สุดสมดุล", concept: "มองเงินเป็นจิ๊กซอว์ของชีวิต" },
  LOW_RISK_MID_DISC: { title: "สายโคตรเซฟโซน", concept: "มองเงินเป็นชูชีพยามฉุกเฉิน" },
  HIGH_RISK_LOW_DISC: { title: "ดมกาวสุดกราฟ", concept: "มองเงินเป็นตั๋วเปลี่ยนชีวิต" },
  MID_RISK_LOW_DISC: { title: "ตัวตึงสายเปย์", concept: "มองเงินเป็นรางวัลการใช้ชีวิต" },
  LOW_RISK_LOW_DISC: { title: "ผู้ประสบภัยวัยกลางคน", concept: "มองเงินเป็นเกราะประคองชีวิต" },
};

const categoryNames = ["สุขภาพ", "การเงิน", "การงาน", "ครอบครัว", "เพื่อนฝูง", "พัฒนาตนเอง", "จิตใจ", "ช่วยเหลือสังคม"];

const QUEST_POOL = {
  WHEEL: {
    "สุขภาพ": ["ดื่มน้ำเปล่าให้ครบ 2 ลิตร", "เดินหรือขยับร่างกายอย่างน้อย 15 นาที", "เข้านอนก่อนเที่ยงคืนคืนนี้", "งดน้ำหวานหรือขนมกรุบกรอบ 1 วัน", "ยืดเหยียดร่างกายแก้ Office Syndrome"],
    "การเงิน": ["บันทึกรายจ่ายทั้งหมดของวันนี้", "งดซื้อของออนไลน์ (F ของ) 1 วัน", "หยอดกระปุกหรือโอนเก็บ 50 บาท", "อ่านทบทวนเป้าหมายการเงินตัวเอง", "จัดระเบียบสลิปและแอปธนาคาร"],
    "การงาน": ["เคลียร์ Inbox ให้โล่งที่สุด", "เขียน 3 Priority ที่ต้องทำพรุ่งนี้", "จัดโต๊ะทำงานให้สะอาดน่านั่ง", "พักสายตาจากจอ 5 นาทีทุกชั่วโมง", "สรุปงานที่ทำสำเร็จวันนี้ 1 อย่าง"],
    "ครอบครัว": ["ทักแชทหรือโทรหาคนในครอบครัว", "ทานข้าวพร้อมหน้าหรือวิดีโอคอล", "บอกรักหรือขอบคุณคนในบ้าน", "ช่วยทำงานบ้าน 1 อย่าง", "วางแผนทริปหรือมื้อพิเศษล่วงหน้า"],
    "เพื่อนฝูง": ["ทักทายเพื่อนที่ไม่ได้คุยด้วยนานแล้ว", "แชร์บทความหรือมีมตลกๆ ให้เพื่อน", "คอมเมนต์ทักทายเพื่อนในโซเชียล", "นัดกินข้าวหรือจิบกาแฟกับเพื่อน", "ชวนเพื่อนคุยเรื่องสัพเพเหระ 10 นาที"],
    "พัฒนาตนเอง": ["ฟัง Podcast สาระดีๆ 1 ตอน", "อ่านหนังสืออย่างน้อย 15 นาที", "เรียนรู้คำศัพท์หรือทักษะใหม่ 1 อย่าง", "จดบันทึก 1 สิ่งที่ได้เรียนรู้วันนี้", "ดูคลิปสอนเรื่องเทคโนโลยี/AI 1 คลิป"],
    "จิตใจ": ["นั่งสมาธิหรืออยู่เงียบๆ 5 นาที", "เขียน 3 สิ่งที่รู้สึกขอบคุณวันนี้", "งดเสพโซเชียล 30 นาทีก่อนนอน", "ฟังเพลงบรรเลงผ่อนคลายสมอง", "ให้อภัยตัวเองในเรื่องที่ผิดพลาดวันนี้"],
    "ช่วยเหลือสังคม": ["โอนเงินทำบุญ/บริจาคเล็กๆ น้อยๆ", "ช่วยเหลือเพื่อนร่วมงาน 1 อย่าง", "แยกขยะก่อนนำไปทิ้ง", "กล่าวชื่นชมคนแปลกหน้าหรือแม่ค้า", "แชร์โพสต์ที่เป็นประโยชน์ต่อสังคม"]
  },
  DISC: {
    "D": ["กล่าวคำชื่นชมเพื่อนร่วมงาน 1 คน", "ฟังคนอื่นพูดจนจบโดยไม่พูดแทรก", "มอบหมายงานให้คนอื่นทำแทน 1 อย่าง", "ถามความเห็นทีมก่อนตัดสินใจ", "ยิ้มทักทายคนอื่นก่อนเริ่มงาน"],
    "I": ["ทำงานเงียบๆ โฟกัส 25 นาทีรวด", "จดลิสต์สิ่งที่ต้องทำก่อนเริ่มพูดคุย", "ตรวจทานงานอย่างละเอียด 1 รอบก่อนส่ง", "ปฏิเสธคำชวนที่ไม่จำเป็น 1 อย่าง", "จัดระเบียบไฟล์งานบนหน้าจอ"],
    "S": ["เสนอไอเดียของตัวเอง 1 อย่างในวันนี้", "กล้าปฏิเสธสิ่งที่ตัวเองทำไม่ไหว", "ตัดสินใจเรื่องเล็กๆ ด้วยตัวเองทันที", "ลองทำอะไรนอกรูทีนเดิมๆ 1 อย่าง", "เป็นผู้นำบทสนทนาในวงกินข้าว"],
    "C": ["ปล่อยผ่านเรื่องเล็กๆ ที่ไม่ได้ดั่งใจ 1 เรื่อง", "ส่งงานแบบ 'เสร็จดีกว่าสมบูรณ์แบบ' 1 ชิ้น", "ชวนเพื่อนร่วมงานคุยเรื่องสบายๆ 5 นาที", "ลดการจับผิดหรือตำหนิตัวเอง 1 วัน", "แชร์ความรู้สึกของตัวเองให้คนอื่นฟัง"]
  },
  MONEY: {
    "HIGH": ["พักของในตะกร้าช้อปปิ้งไว้ก่อน 24 ชม.", "ทบทวนจุดตัดขาดทุน (Stop Loss) ในพอร์ต", "อ่านบทความบริหารความเสี่ยง 10 นาที", "แบ่งกำไรนิดหน่อยไปซื้อความสุขให้ตัวเอง", "งดเช็กพอร์ตหุ้น/คริปโต 1 วันเต็มๆ"],
    "MID": ["เช็กยอดเงินคงเหลือและเป้าหมายระยะสั้น", "อัปเดตสถานะพอร์ตการเงินรายสัปดาห์", "หาอ่านไอเดียการลงทุนแนวใหม่ๆ", "จดบันทึกอารมณ์ก่อนตัดสินใจซื้อของชิ้นใหญ่", "จัดสรรเงินออมอัตโนมัติ (DCA) เพิ่ม 1%"],
    "LOW": ["หาไอเดียเพิ่มรายได้ช่องทางที่ 2 (15 นาที)", "อ่านบทความเรื่องการเอาชนะเงินเฟ้อ", "ลองศึกษาการลงทุนความเสี่ยงต่ำแบบใหม่", "ให้รางวัลตัวเองด้วยของอร่อย 1 อย่าง (ฝึกเปย์)", "เช็กดอกเบี้ยเงินฝากธนาคารว่าคุ้มไหม"]
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [lastWheel, setLastWheel] = useState<any>(null);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [lastDisc, setLastDisc] = useState<any>(null);
  const [lastMoney, setLastMoney] = useState<any>(null);

  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [showLevelInfo, setShowLevelInfo] = useState(false);

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // 💡 1. ดึงข้อมูล Wheel of Life (หาจากกล่อง users ก่อน ถ้าไม่เจอไปหาที่ user_reports)
          let wheelData = null;

          const authWheelRef = collection(db, "users", currentUser.uid, "assessments");
          const authWheelSnap = await getDocs(query(authWheelRef, orderBy("createdAt", "desc"), limit(1)));
          
          if (!authWheelSnap.empty) {
            wheelData = authWheelSnap.docs[0].data();
          } else {
            // ถ้าไม่เจอ! แปลว่าอาจจะเป็น Guest ลองไปหากล่อง user_reports แทน
            const guestWheelRef = collection(db, "user_reports");
            const guestWheelQ = query(guestWheelRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
            const guestWheelSnap = await getDocs(guestWheelQ);
            
            if (!guestWheelSnap.empty) {
              wheelData = guestWheelSnap.docs[0].data();
            }
          }
          
          setLastWheel(wheelData);

          // 💡 2. ดึงข้อมูลส่วนอื่นๆ (เหมือนเดิม)
          const quoteRef = collection(db, "quotes");
          const quoteSnap = await getDocs(query(quoteRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
          if (!quoteSnap.empty) setLastQuote(quoteSnap.docs[0].data());

          const discRef = collection(db, "discResults");
          const discSnap = await getDocs(query(discRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
          if (!discSnap.empty) setLastDisc(discSnap.docs[0].data());

          const moneyRef = collection(db, "quiz_results"); 
          const moneySnap = await getDocs(query(moneyRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1)));
          if (!moneySnap.empty) setLastMoney(moneySnap.docs[0].data());

          // 💡 3. ดึงข้อมูล XP และ Quest
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          const todayStr = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'});
          
          if (userDocSnap.exists()) {
             const userData = userDocSnap.data();
             setTotalXP(userData.totalXP || 0);
             if (userData.lastQuestDate === todayStr) {
                setCompletedQuests(userData.completedQuestIds || []);
             } else {
                setCompletedQuests([]);
             }
          }
        } catch (error) { console.error("ดึงข้อมูลพลาด:", error); }
      } else { router.push("/"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try { await signOut(auth); router.push("/"); } catch (error) { console.error(error); }
  };

  const focusAreas = useMemo(() => {
    const areas = [];
    if (lastWheel?.currentScores) {
      const scoresWithLabels = lastWheel.currentScores.map((score: number, i: number) => ({ score, label: categoryNames[i] }));
      const lowestThree = scoresWithLabels.sort((a: any, b: any) => a.score - b.score).slice(0, 3);
      const labelsWithScores = lowestThree.map((item: any) => `${item.label} (${item.score}/10)`).join(", ");
      areas.push({ type: 'wheel', title: 'Wheel of Life', desc: `ช่วงนี้ลองจัดเวลาโฟกัสและดูแลด้าน ${labelsWithScores} เพิ่มขึ้นอีกนิดนะครับ`, color: 'bg-red-500', textColor: 'text-red-400' });
    }

    if (lastDisc) {
      let discWarning = lastDisc?.resultData?.warning || lastDisc?.warning;
      if (!discWarning) {
        const type = lastDisc.finalResult || lastDisc.result || "";
        if (type.includes("D")) discWarning = "ระวังการตัดสินใจที่รวดเร็วเกินไป จนอาจมองข้ามรายละเอียดหรือความรู้สึกของทีม";
        else if (type.includes("I")) discWarning = "ระวังการมองข้ามรายละเอียดเล็กๆ น้อยๆ และการบริหารเวลาที่อาจหลุดโฟกัสได้ง่าย";
        else if (type.includes("S")) discWarning = "ระวังการโอนอ่อนตามคนอื่นมากเกินไป จนลืมใส่ใจความต้องการและเป้าหมายของตัวเอง";
        else if (type.includes("C")) discWarning = "ระวังความยึดติดความสมบูรณ์แบบ (Perfectionist) ที่อาจทำให้งานล่าช้ากว่ากำหนด";
        else discWarning = "ลองเปิดรับมุมมองใหม่ๆ เพื่อพัฒนาการสื่อสารให้ยืดหยุ่นขึ้นในสถานการณ์ที่แตกต่างกันครับ";
      }
      areas.push({ type: 'disc', title: 'จุดระวัง (DISC)', desc: discWarning, color: 'bg-blue-500', textColor: 'text-blue-400' });
    }

    if (lastMoney) {
      let moneyKryptonite = lastMoney?.resultData?.kryptonite || lastMoney?.kryptonite;
      if (!moneyKryptonite) {
        const risk = lastMoney.resultKey?.split('_')[0] || "";
        if (risk === "HIGH") moneyKryptonite = "ระวังความมั่นใจและความกล้าเสี่ยงที่มากเกินไป อาจทำให้พลาดจุดตัดขาดทุนได้ง่าย";
        else if (risk === "MID") moneyKryptonite = "ระวังการรอคอยจังหวะที่สมบูรณ์แบบมากเกินไป อาจทำให้พลาดโอกาสดีๆ ในช่วงเวลาสั้นๆ";
        else if (risk === "LOW") moneyKryptonite = "ระวังความกลัวความเสี่ยงที่มากเกินไป จะทำให้ผลตอบแทนระยะยาวโตไม่ทันเงินเฟ้อ";
        else moneyKryptonite = "ระวังการใช้จ่ายตามอารมณ์ ควรจัดสรรเงินสำรองฉุกเฉินให้เพียงพอเสมอ";
      }
      areas.push({ type: 'money', title: 'หลุมพรางการเงิน', desc: moneyKryptonite, color: 'bg-amber-500', textColor: 'text-amber-400' });
    }
    return areas;
  }, [lastWheel, lastDisc, lastMoney]);

  const dailyQuests = useMemo(() => {
    const dayIndex = new Date().getDate(); 
    let q1 = { id: 1, title: "ดื่มน้ำเปล่าให้ครบ 2 ลิตร", xp: 15 };
    let q2 = { id: 2, title: "ลิสต์ 3 สิ่งที่ต้องทำก่อนเริ่มงาน", xp: 15 };
    let q3 = { id: 3, title: "หยอดกระปุกหรือออมเงิน 50 บาท", xp: 20 };

    if (lastWheel?.currentScores) {
      const minScoreIdx = lastWheel.currentScores.indexOf(Math.min(...lastWheel.currentScores));
      const area = categoryNames[minScoreIdx] as keyof typeof QUEST_POOL.WHEEL;
      if (QUEST_POOL.WHEEL[area]) {
        const questList = QUEST_POOL.WHEEL[area];
        q1.title = questList[dayIndex % questList.length];
      }
    }

    if (lastDisc) {
      const typeStr = lastDisc.finalResult || lastDisc.result || "C";
      const mainType = typeStr.charAt(0) as keyof typeof QUEST_POOL.DISC; 
      if (QUEST_POOL.DISC[mainType]) {
        const questList = QUEST_POOL.DISC[mainType];
        q2.title = questList[dayIndex % questList.length];
      }
    }

    if (lastMoney) {
      const risk = (lastMoney.resultKey?.split('_')[0] || "MID") as keyof typeof QUEST_POOL.MONEY;
      if (QUEST_POOL.MONEY[risk]) {
        const questList = QUEST_POOL.MONEY[risk];
        q3.title = questList[dayIndex % questList.length];
      }
    }

    return [q1, q2, q3];
  }, [lastWheel, lastDisc, lastMoney]);

  const dailyXPGained = completedQuests.reduce((sum, id) => {
    const quest = dailyQuests.find(q => q.id === id);
    return sum + (quest?.xp || 0);
  }, 0);

  const currentLevel = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  
  const getLevelTitle = (level: number) => {
    if (level < 10) return "Rookie Upskiller (ผู้เริ่มต้น)";
    if (level < 20) return "Habit Master (เซียนสร้างนิสัย)";
    return "Life Architect (สถาปนิกออกแบบชีวิต)";
  };

  const toggleQuest = async (id: number, xp: number) => {
    if (!user) return;
    const isDone = completedQuests.includes(id);
    const todayStr = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Bangkok'});
    const userRef = doc(db, "users", user.uid);

    let newCompleted = [];
    let xpChange = 0;

    if (isDone) {
      newCompleted = completedQuests.filter(qId => qId !== id);
      xpChange = -xp;
    } else {
      newCompleted = [...completedQuests, id];
      xpChange = xp;
    }

    setCompletedQuests(newCompleted);
    setTotalXP(prev => prev + xpChange);

    try {
      await setDoc(userRef, {
        totalXP: increment(xpChange),
        completedQuestIds: newCompleted,
        lastQuestDate: todayStr
      }, { merge: true });
    } catch (error) {
      console.error("Error updating quest:", error);
    }
  };

  const renderRadarChart = (scores: number[]) => {
    const size = 280; 
    const center = size / 2;
    const radius = size / 2 - 40; 
    const getCoordinates = (val: number, index: number) => {
      const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
      const r = radius * (val / 10);
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };
    const points = scores.map((s, i) => `${getCoordinates(s, i).x},${getCoordinates(s, i).y}`).join(" ");

    return (
      <div className="relative w-full max-w-[340px] aspect-square mx-auto flex items-center justify-center pt-4 md:pt-0">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {[2, 4, 6, 8, 10].map(l => <circle key={l} cx={center} cy={center} r={radius * (l / 10)} fill="none" stroke="#f1f5f9" strokeWidth="1" />)}
          {scores.map((_, i) => <line key={i} x1={center} y1={center} x2={getCoordinates(10, i).x} y2={getCoordinates(10, i).y} stroke="#f1f5f9" strokeWidth="1" />)}
          {scores.map((_, i) => {
             const { x, y } = getCoordinates(13.5, i); 
             return <text key={`label-${i}`} x={x} y={y} fontSize="11" fill="#94a3b8" textAnchor="middle" dominantBaseline="middle" className="font-bold">{categoryNames[i]}</text>
          })}
          <polygon points={points} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" className="transition-all duration-500" />
          {scores.map((s, i) => {
             const pos = getCoordinates(s, i);
             const labelPos = getCoordinates(s + 2.5, i); 
             return (
               <g key={`point-${i}`}>
                 <circle cx={pos.x} cy={pos.y} r="5" fill="#ef4444" className="hover:r-7 transition-all" />
                 <text x={labelPos.x} y={labelPos.y} fontSize="12" fill="#dc2626" textAnchor="middle" dominantBaseline="middle" className="font-black drop-shadow-sm">{s}</text>
               </g>
             )
          })}
        </svg>
      </div>
    );
  };

  const getDiscColors = (type: string = "C") => {
    if (type.includes("D")) return { main: "bg-red-600", light: "bg-red-50", border: "border-red-100", text: "text-red-700", hover: "group-hover:border-red-300" };
    if (type.includes("I")) return { main: "bg-amber-500", light: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", hover: "group-hover:border-amber-300" };
    if (type.includes("S")) return { main: "bg-green-500", light: "bg-green-50", border: "border-green-100", text: "text-green-700", hover: "group-hover:border-green-300" };
    return { main: "bg-blue-600", light: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", hover: "group-hover:border-blue-300" }; 
  };
  const currentDiscType = lastDisc?.finalResult || lastDisc?.result || "C";
  const discColors = getDiscColors(currentDiscType);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-sm">กำลังโหลด Dashboard ของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- 🧭 1. Top Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <header className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
              <div className="absolute top-10 -right-20 opacity-10 rotate-12 hidden md:block">
                <BrainCircuit size={300} strokeWidth={1} />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-6 bg-red-950/50 w-fit px-4 py-1.5 rounded-full border border-red-800/30">
                <Sparkles className="text-yellow-400" size={18} />
                <span className="text-[11px] font-black text-red-200 uppercase tracking-[0.2em]">Upskill Insight</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                ยินดีต้อนรับกลับมา, <br className="md:hidden" />
                <span className="text-red-400 font-extrabold">{user?.displayName?.split(' ')[0]}! 🚀</span>
              </h1>
              <p className="text-slate-300 font-medium max-w-lg">เช็กภาพรวมและอัปเดตเป้าหมายชีวิตของคุณ เพื่อการเติบโตในทุกๆ วัน</p>
            </div>

            {/* 💡 อัปเดตโครงสร้าง 2 กล่องให้กว้างเท่ากันเป๊ะด้วย Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-20 w-full max-w-2xl">
              
              {/* Profile Card */}
              <div className="flex items-center justify-between bg-white/5 p-3 px-4 rounded-full border border-white/10 backdrop-blur-sm shadow-xl w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={user?.photoURL || "/default-avatar.png"} alt="Profile" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-md shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-black text-white truncate">{user?.displayName}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="ml-2 p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-950/50 rounded-full transition-all group shrink-0">
                  <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Level Card */}
              <div className="flex items-center gap-4 bg-slate-800/80 p-3 px-5 rounded-full border border-slate-700 backdrop-blur-sm shadow-xl relative w-full">
                <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.2)] shrink-0">
                  <Trophy size={20} className="fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white">LV.{currentLevel}</span>
                    <button onClick={() => setShowLevelInfo(!showLevelInfo)} className="text-slate-400 hover:text-yellow-400 transition-colors shrink-0">
                      <Info size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-1 truncate">{getLevelTitle(currentLevel)}</p>
                  
                  {/* หลอด XP ยืดให้เต็มความกว้างที่เหลือ */}
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden flex items-center relative group">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${currentLevelXP}%` }} />
                    <span className="absolute right-0 top-3 text-[9px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentLevelXP}/100 XP
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {showLevelInfo && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 md:left-auto md:right-0 mt-4 w-72 bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-2xl z-[100] text-left"
                    >
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-400"/> ระบบ Level การเรียนรู้
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">ทุกๆ 100 XP ที่สะสมจากการทำภารกิจรายวัน จะถูกนำมาอัป Level การเรียนรู้ของคุณ!</p>
                      <ul className="text-[11px] font-medium space-y-2.5 text-slate-300">
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-sm"/> LV 1-9 : Rookie Upskiller</li>
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"/> LV 10-19 : Habit Master</li>
                        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"/> LV 20+ : Life Architect</li>
                      </ul>
                      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Total XP สะสม</span>
                        <span className="text-sm font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">{totalXP} XP</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <div className="lg:col-span-1 bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center border border-slate-700">
            <div className="absolute -right-10 -bottom-10 opacity-5 text-red-400">
              <Target size={180} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">จุดที่ควรโฟกัส</h2>
              </div>

              {focusAreas.length > 0 ? (
                <ul className="space-y-5">
                  {focusAreas.map((area, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${area.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                      <div>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${area.textColor}`}>{area.title}</span>
                        <p className="text-sm font-medium text-slate-300 mt-1 leading-relaxed">{area.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed font-medium">ทำแบบทดสอบด้านล่างเพื่อให้ระบบวิเคราะห์จุดที่ควรโฟกัสให้นะครับ 🎯</p>
              )}
            </div>
          </div>

        </div>

        {/* --- 🎮 2. Daily Quests Section --- */}
        <div className="mb-8 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
                <Flame size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Daily Quests 🎯</h2>
                <p className="text-sm text-slate-500 font-medium">Small Win วันนี้ที่จัดมาให้ตรงกับสไตล์คุณ (รีเซ็ตทุกเที่ยงคืน)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-fit">
              <Trophy className="text-yellow-500" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">XP ที่ได้วันนี้</span>
                <span className="text-lg font-black text-slate-800 leading-none">+{dailyXPGained} <span className="text-xs font-bold text-slate-400">XP</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyQuests.map((quest) => {
              const isDone = completedQuests.includes(quest.id);
              return (
                <div 
                  key={quest.id} 
                  onClick={() => toggleQuest(quest.id, quest.xp)}
                  className={`relative cursor-pointer flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${isDone ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-orange-200'}`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={26} className="text-green-500" />
                      </motion.div>
                    ) : (
                      <Circle size={26} className="text-slate-300 group-hover:text-orange-300 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-all duration-300 ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {quest.title}
                    </p>
                    <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      +{quest.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- 📦 3. Bento Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/tools/wheel-of-life" className="md:col-span-2 group block h-full">
            <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-xl hover:border-red-200 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 group-hover:h-3 transition-all duration-300" />
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10 pt-2 h-full">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-red-50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors border border-red-100 shadow-sm group-hover:scale-110 duration-300">
                        <PieChart size={28} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">Wheel of Life</h2>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500 mb-2">เป้าหมาย 1 ปีของคุณ:</p>
                    <p className="text-lg font-bold text-slate-700 line-clamp-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {lastWheel?.goal || "ยังไม่ได้ตั้งเป้าหมาย ไปตั้งเป้าหมายแรกกันเถอะ!"}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[12px] font-black uppercase tracking-wider group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-100 transition-all shadow-sm">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>{lastWheel ? "ประเมินใหม่" : "เริ่มประเมิน"}</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center items-center rounded-[3rem] p-2 aspect-square md:aspect-auto">
                  {lastWheel?.currentScores ? renderRadarChart(lastWheel.currentScores) : (
                    <div className="text-center p-8"><PieChart size={48} className="mx-auto text-slate-200 mb-3" /><p className="text-sm font-bold text-slate-400">ยังไม่มีข้อมูลกราฟ</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/tools/khomsatsat" className="group block h-full">
            <motion.div whileHover={{ y: -6 }} className="h-full bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-indigo-100 relative overflow-hidden flex flex-col justify-between group">
              <Quote className="absolute -top-6 -right-6 text-indigo-100/50 rotate-12" size={140} />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white text-indigo-500 rounded-xl border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Quote size={24} />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-400 mb-4">คำคมที่ทัชใจล่าสุด</h2>
                <div className="h-24 flex items-center mb-6">
                  <p className="text-lg font-medium leading-relaxed italic text-slate-700 line-clamp-4">
                    "{lastQuote?.quote || "ยังไม่มีคำคมสะสมไว้ ลองไปเล่น 'คมสัดสัด' ดูสิ!"}"
                  </p>
                </div>
                
                <div className="mt-auto flex items-center gap-1.5 px-4 py-2 w-fit rounded-full bg-white/50 text-indigo-600 text-[11px] font-black uppercase tracking-wider group-hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>สุ่มใหม่</span>
                </div>

              </div>
            </motion.div>
          </Link>

          <Link href="/tools/disc" className="group block h-full">
            <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl relative overflow-hidden group-hover:border-blue-200">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 group-hover:h-3 transition-all duration-300" />
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-5 flex items-center justify-center aspect-square w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100 shadow-sm group-hover:scale-110 duration-300">
                <Users size={24} />
              </div>

              {lastDisc ? (
                <>
                  <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1.5"> สไตล์การสื่อสารของคุณ </h3>
                  <h2 className="text-2xl font-black text-slate-800 mb-1.5 leading-tight"> {lastDisc.title || "จอมวางแผน"} </h2>
                  <div className={`flex items-center gap-2 mb-6 px-3 py-1 rounded-full border shadow-inner transition-colors ${discColors.light} ${discColors.border} ${discColors.hover}`}>
                    <span className={`w-9 h-9 rounded-full ${discColors.main} text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform`}> {currentDiscType} </span>
                    <span className={`text-sm font-bold italic ${discColors.text}`}>Style</span>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100 shadow-sm">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>ประเมินใหม่</span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-black text-xl text-slate-800 mt-auto">สำรวจตัวตน DISC</h3>
                  <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">ค้นหาสไตล์การทำงานแบบคุณ</p>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-auto">เริ่มทดสอบ <ChevronRight size={16} /></span>
                </>
              )}
            </motion.div>
          </Link>

          <Link href="/tools/money-avatar" className="group block h-full">
            <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:border-amber-200 hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 group-hover:h-3 transition-all duration-300" />
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-5 flex items-center justify-center aspect-square w-fit group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-100 shadow-sm group-hover:scale-110 duration-300">
                <Wallet size={24} />
              </div>

              {lastMoney ? (
                <>
                  <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1.5"> สไตล์การเงินของคุณ </h3>
                  <h2 className="text-2xl font-black text-slate-800 mb-1 leading-tight"> {MONEY_MAP[lastMoney.resultKey]?.title || "นักวางแผน"} </h2>
                  <p className="text-sm text-slate-500 font-bold mt-2 mb-6 px-2"> "{MONEY_MAP[lastMoney.resultKey]?.concept}" </p>
                  
                  <div className="mt-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-wider group-hover:bg-amber-50 group-hover:text-amber-700 transition-all border border-transparent group-hover:border-amber-100 shadow-sm">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>ประเมินใหม่</span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-black text-xl text-slate-800 mt-auto">Money Avatar</h3>
                  <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">ถอดรหัสสไตล์การเงินของคุณ</p>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-auto">เช็กอาการ <ChevronRight size={16} /></span>
                </>
              )}
            </motion.div>
          </Link>

          <Link href={currentLevel >= 5 ? "/library" : "#"} className="group block h-full cursor-pointer">
            <motion.div whileHover={currentLevel >= 5 ? { y: -6 } : {}} className={`h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all relative overflow-hidden ${currentLevel >= 5 ? 'hover:border-emerald-200 hover:shadow-xl' : 'opacity-90 grayscale-[0.2]'}`}>
              <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-300 ${currentLevel >= 5 ? 'bg-emerald-500 group-hover:h-3' : 'bg-slate-300'}`} />
              
              {currentLevel >= 5 ? (
                <div className="absolute top-5 right-5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm">
                  <Unlock size={12} /> PREMIUM UNLOCKED
                </div>
              ) : (
                <div className="absolute top-5 right-5 bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1 shadow-sm">
                  <Lock size={12} /> UNLOCK AT LV.5
                </div>
              )}

              <div className={`p-3 rounded-full mb-5 flex items-center justify-center aspect-square w-fit transition-colors border shadow-sm duration-300 ${currentLevel >= 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                <BookOpen size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-800">คลังสมองอัปสกิล</h3>
              <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">สรุปหนังสือและบทความดีๆ ที่คัดมาแล้ว</p>
              
              {currentLevel >= 5 ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-auto">เปิดอ่านเลย <ChevronRight size={16} /></span>
              ) : (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 mt-auto">ต้องการ LV.5 เพื่อปลดล็อก</span>
              )}
            </motion.div>
          </Link>
          
        </div>

        <div className="mt-16 text-center py-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold mb-5 tracking-wide">© 2026 อัพสกิลกับฟุ้ย</p>
          <div className="md:hidden flex justify-center">
             <button onClick={handleLogout} className="flex items-center gap-2 bg-white text-slate-500 font-black text-sm py-3 px-6 rounded-full shadow-sm hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-100 active:scale-95">
               <LogOut size={16} /> ออกจากระบบ
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}