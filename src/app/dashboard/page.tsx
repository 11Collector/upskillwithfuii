"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion"; // เพิ่ม AnimatePresence
import { PieChart, Quote, Users, Wallet, ChevronRight, Sparkles, ArrowRight, BookOpen ,RefreshCw, LogOut, BrainCircuit, Target, Star} from "lucide-react"; // เพิ่ม Icon ใหม่
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

// 💡 พจนานุกรมสำหรับแปลรหัสการเงิน (เอาไว้นอก Component เพื่อให้ Logic สังเคราะห์เรียกใช้ได้ง่าย)
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

export default function DashboardPage() {
const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [lastWheel, setLastWheel] = useState<any>(null);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [lastDisc, setLastDisc] = useState<any>(null);
  const [lastMoney, setLastMoney] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // 1-4️⃣ ดึงข้อมูลเดิม (เหมือนเดิมเป๊ะ)
          const wheelRef = collection(db, "users", currentUser.uid, "assessments");
          const wheelQ = query(wheelRef, orderBy("createdAt", "desc"), limit(1));
          const wheelSnap = await getDocs(wheelQ);
          if (!wheelSnap.empty) setLastWheel(wheelSnap.docs[0].data());

          const quoteRef = collection(db, "quotes");
          const quoteQ = query(quoteRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
          const quoteSnap = await getDocs(quoteQ);
          if (!quoteSnap.empty) setLastQuote(quoteSnap.docs[0].data());

          const discRef = collection(db, "discResults");
          const discQ = query(discRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
          const discSnap = await getDocs(discQ);
          if (!discSnap.empty) setLastDisc(discSnap.docs[0].data());

          const moneyRef = collection(db, "quiz_results"); 
          const moneyQ = query(moneyRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
          const moneySnap = await getDocs(moneyQ);
          if (!moneySnap.empty) setLastMoney(moneySnap.docs[0].data());

        } catch (error) { console.error("ดึงข้อมูลพลาด:", error); }
      } else { router.push("/"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try { await signOut(auth); router.push("/"); } catch (error) { console.error(error); }
  };

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
        
{/* --- 🧭 1. Premium Dark Header --- */}
<header className="mb-8 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
  {/* Abstract background décor */}
  <div className="absolute top-10 -right-20 opacity-10 rotate-12 hidden md:block">
     <BrainCircuit size={300} strokeWidth={1} />
  </div>

  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
      <div className="flex items-center gap-2.5 mb-3 bg-red-950/50 w-fit px-4 py-1.5 rounded-full border border-red-800/30">
        <Sparkles className="text-yellow-400" size={18} />
        {/* 💡 ปรับคำให้อบอุ่นขึ้น */}
        <span className="text-[11px] font-black text-red-200 uppercase tracking-[0.2em]">
        Upskill Insight
        </span>
      </div>
     <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mt-2 mb-2">
  ยินดีต้อนรับกลับมา, <br className="md:hidden" />
  <span className="text-red-400 font-extrabold">{user?.displayName?.split(' ')[0]}! 🚀</span>
</h1>
      <p className="text-slate-300 mt-3 font-medium max-w-lg">
        เช็กภาพรวมและอัปเดตเป้าหมายชีวิตของคุณ เพื่อการเติบโตในทุกๆ วัน
      </p>
    </div>

    {/* Profile Capsule (เหมือนเดิม) */}
    <div className="flex items-center gap-4 self-start md:self-center bg-white/5 p-3 pr-5 rounded-full border border-white/10 backdrop-blur-sm shadow-xl">
      <img src={user?.photoURL || "/default-avatar.png"} alt="Profile" className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-md" />
      <div>
        <p className="text-sm font-black text-white">{user?.displayName}</p>
        <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
      </div>
      <button onClick={handleLogout} className="ml-3 p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-950/50 rounded-full transition-all group">
        <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
    </div>
  </div>
</header>

{/* --- 🧠 2. Insight & Focus Section --- */}
{(lastWheel || lastDisc || lastMoney) && (
  <motion.section initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    
 {/* Insight Card (ตัวใหญ่) */}
<div className="md:col-span-3 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-xl transition-all hover:border-red-100">
   <BrainCircuit className="absolute -top-6 -right-6 text-slate-50 group-hover:text-red-50 transition-colors" size={140} />
   
   <div className="relative z-10">
      <div className="flex items-center gap-2 mb-6">
         <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
         <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            วิเคราะห์ทิศทางชีวิต
         </span>
      </div>
      
      {/* 💡 1. ปรับขนาดเป็น text-base md:text-lg, สีอ่อนลงเป็น text-slate-600 และเพิ่มระยะบรรทัด leading-[1.8] */}
      <div className="text-base md:text-lg text-slate-600 leading-[1.8] max-w-3xl">
         {(() => {
            const hasDisc = !!lastDisc;
            const hasMoney = !!lastMoney;
            const hasWheel = !!lastWheel && !!lastWheel.currentScores;

            if (!hasDisc && !hasMoney && !hasWheel) {
               return (
                 <span className="font-medium text-slate-700">
                   ข้อมูลคุณยังโล่งอยู่เลยครับ! <br className="hidden md:block"/>
                   ลองเริ่มเช็กสุขภาพใจด้วย <span className="text-red-500 font-bold">Wheel of Life</span> ด้านล่าง เพื่อให้ผมช่วยดูภาพรวมชีวิตให้นะครับ
                 </span>
               );
            }

            let synthesis = "";
            let strengths = [];

            if (hasDisc) {
               const style = lastDisc.finalResult || lastDisc.result;
               if (style.includes('D')) strengths.push("ความเด็ดขาดและการเป็นผู้นำ");
               else if (style.includes('I')) strengths.push("ทักษะการสื่อสารและการเข้าสังคม");
               else if (style.includes('S')) strengths.push("ความใจเย็นและการทำงานเป็นทีม");
               else if (style.includes('C')) strengths.push("ความละเอียดรอบคอบและมีเหตุผล");
            }

            if (hasMoney) {
               const risk = lastMoney.resultKey.split('_')[0];
               if (risk === 'HIGH') strengths.push("ความกล้ารับความเสี่ยงเพื่อโอกาสใหม่ๆ");
               else if (risk === 'MID') strengths.push("ความสมดุลและการวางแผนที่รัดกุม");
               else if (risk === 'LOW') strengths.push("ความมีวินัยและการจัดการที่ปลอดภัย");
            }

            if (strengths.length > 0) {
               // 💡 2. ลดความดำเข้มของจุดแข็งลง เปลี่ยนเป็น font-semibold สี slate-800
               synthesis += `จากประวัติของคุณ คุณมีจุดแข็งเรื่อง <span class="font-semibold text-slate-800">${strengths.join(" และ ")}</span> ถือเป็นต้นทุนที่ดีมากครับ `;
            }

            if (hasWheel) {
               const scores = lastWheel.currentScores;
               const minScore = Math.min(...scores);
               const minArea = categoryNames[scores.indexOf(minScore)];
               const avgScore = (scores.reduce((a:number, b:number) => a + b, 0) / scores.length).toFixed(1);

               // 💡 3. เอาพื้นหลังสีแดงออก เปลี่ยนเป็นตัวหนาพร้อมขีดเส้นใต้สีแดงอ่อนๆ (มินิมอลขึ้นมาก)
               synthesis += `<br/><br/>ถึงแม้ภาพรวมชีวิตตอนนี้จะอยู่ที่ ${avgScore}/10 แต่ช่วงนี้ <span class="font-bold text-red-500 underline decoration-red-200 decoration-2 underline-offset-4">"${minArea}"</span> ดูเหมือนจะดรอปลงไปนิดนึง (${minScore}/10) `;
               
               if (strengths.length > 0) {
                  synthesis += `ลองดึงจุดแข็งของคุณมาปรับใช้เพื่อดึงคะแนนหมวดนี้กลับมาดูนะครับ! 💪`;
               } else {
                  synthesis += `สัปดาห์นี้ลองหาเวลาดูแลตัวเองในด้านนี้เพิ่มขึ้นอีกนิดนะครับ 💪`;
               }
            } else {
               synthesis += "ลองประเมิน Wheel of Life เพิ่มเติม เพื่อดูว่าเราจะเอาความสามารถนี้ไปอัปเกรดชีวิตด้านไหนได้บ้างครับ";
            }

            return <span dangerouslySetInnerHTML={{ __html: synthesis }} />;
         })()}
      </div>
   </div>
</div>

    {/* Weekly Focus Card (ปรับให้เป็นข้อความสั้นๆ ไม่มีปุ่ม) */}
    {lastWheel && lastWheel.currentScores && (
       <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl hover:shadow-blue-900/20 transition-all flex flex-col justify-center">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-yellow-400">
             <Target size={150} />
          </div>
          <div className="relative z-10">
             <div className="inline-block px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black rounded-md mb-4 uppercase tracking-widest w-fit">
                จุดที่ควรเติมเต็ม
             </div>
             
             {(() => {
                const scores = lastWheel.currentScores;
                const minScore = Math.min(...scores);
                const minArea = categoryNames[scores.indexOf(minScore)];
                
                // 💡 สร้างข้อความแนะนำสั้นๆ (Actionable Advice) ตามหมวดที่ได้คะแนนต่ำ
                let advice = "ลองหาเวลาว่างสัก 15 นาที เพื่อทบทวนและวางแผนในเรื่องนี้ดูนะครับ";
                if (minArea === "สุขภาพ") advice = "พักผ่อนให้เพียงพอ ดื่มน้ำเยอะๆ และอย่าลืมขยับร่างกายบ้างนะครับ";
                else if (minArea === "การเงิน") advice = "ลองจดบันทึกรายรับรายจ่ายสัปดาห์นี้ดู จะช่วยให้เห็นภาพรวมชัดขึ้นครับ";
                else if (minArea === "ครอบครัว") advice = "สัปดาห์นี้หาเวลาโทรหาคนในครอบครัว หรือทานข้าวด้วยกันสักมื้อนะครับ";
                else if (minArea === "การงาน") advice = "จัดลำดับความสำคัญของงาน (Prioritize) จะช่วยลดความเครียดได้เยอะเลยครับ";

                return (
                   <>
                     <h3 className="text-3xl font-black tracking-tight text-white leading-tight mb-3">
                        {minArea} <span className="text-lg text-amber-400 font-bold ml-1">({minScore}/10)</span>
                     </h3>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed">
                       {advice}
                     </p>
                   </>
                );
             })()}
          </div>
       </div>
    )}
  </motion.section>
)}
        {/* --- 📦 3. Bento Grid (เครื่องมือเดิม แต่ปรับดีไซน์นิดหน่อยให้ดูสมดุล) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Wheel of Life Card (ตัวใหญ่) */}
<Link href="/tools/wheel-of-life" className="md:col-span-2 group block h-full">
  <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-xl hover:border-red-200">
    
    {/* 💡 1. เติม Gradient Accent สีแดงด้านบนให้เหมือนเพื่อนๆ */}
    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 group-hover:h-3 transition-all duration-300" />

    <div className="flex justify-between items-start relative z-10 pt-2"> {/* เติม pt-2 ดันคอนเทนต์ลงมานิดนึงไม่ให้ติดขอบสี */}
      <div className="flex-1">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors border border-red-100 shadow-sm group-hover:scale-110 duration-300">
            <PieChart size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Wheel of Life</h2>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">เป้าหมาย 1 ปีของคุณ:</p>
        <p className="text-lg font-bold text-slate-700 line-clamp-2 max-w-xl">
          {lastWheel?.goal || "ยังไม่ได้ตั้งเป้าหมาย ไปตั้งเป้าหมายแรกกันเถอะ!"}
        </p>
      </div>
      
      {/* ปุ่มมุมขวาบน (ปรับให้เข้าธีม) */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-wider group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-100 transition-all shadow-sm">
        <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        <span>{lastWheel ? "ประเมินใหม่" : "เริ่มประเมิน"}</span>
      </div>
    </div>

    {/* คะแนน Wheel of Life ด้านล่าง */}
    {lastWheel?.currentScores && (
      <div className="mt-10 flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative z-10">
        {lastWheel.currentScores.map((score: number, idx: number) => (
          <div key={idx} className="flex-1 min-w-[60px] bg-slate-50 rounded-2xl flex flex-col items-center py-4 border border-slate-100 group-hover:border-red-100 group-hover:bg-white transition-colors duration-300">
            <span className="text-[10px] text-slate-400 font-bold mb-1.5 truncate w-full text-center px-1"> 
              {categoryNames[idx]} 
            </span>
            {/* ดึงสีแดงมาใช้ตรงตัวเลขคะแนนตอน hover */}
            <span className="text-2xl font-black text-slate-800 group-hover:text-red-600 transition-colors">
              {score}
            </span>
          </div>
        ))}
      </div>
    )}
  </motion.div>
</Link>

          {/* คมสัดสัด Card */}
          <Link href="/tools/khomsatsat" className="group block h-full">
       {/* เปลี่ยนจาก bg-slate-900 เป็นโทนสว่าง */}
<motion.div whileHover={{ y: -6 }} className="h-full bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-indigo-100 relative overflow-hidden flex flex-col justify-between group">
  <Quote className="absolute -top-6 -right-6 text-indigo-100/50 rotate-12" size={140} />
  <div className="relative z-10">
    <div className="flex items-center justify-between mb-6">
      <div className="p-3 bg-white text-indigo-500 rounded-xl border border-indigo-100 shadow-sm">
        <Quote size={24} />
      </div>
      {/* ปุ่มสุ่มใหม่สีกลืนกับพื้นหลัง */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 text-indigo-600 text-[10px] font-black uppercase tracking-wider group-hover:bg-indigo-100 transition-colors border border-indigo-100">
        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
        <span>สุ่มใหม่</span>
      </div>
    </div>
    <h2 className="text-lg font-bold text-slate-400 mb-6">คำคมที่ทัชใจล่าสุด</h2>
    <div className="h-28 flex items-center">
       {/* เปลี่ยนสีตัวหนังสือเป็นสีเข้ม */}
       <p className="text-lg font-medium leading-relaxed italic text-slate-700 line-clamp-4">
         "{lastQuote?.quote || "ยังไม่มีคำคมสะสมไว้ ลองไปเล่น 'คมสัดสัด' ดูสิ!"}"
       </p>
    </div>
  </div>
</motion.div>
          </Link>

        {/* DISC Card */}
<Link href="/tools/disc" className="group block h-full">
  <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-blue-200 hover:shadow-xl relative overflow-hidden">
    
    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 group-hover:h-3 transition-all duration-300" />
{/* แก้ตรง div วงกลมของ DISC */}
<div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-5 flex items-center justify-center aspect-square w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100 shadow-sm group-hover:scale-110 duration-300">
  <Users size={24} />
</div>

    {lastDisc ? (
      <>
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1.5"> สไตล์การสื่อสารของคุณ </h3>
        <h2 className="text-2xl font-black text-slate-800 mb-1.5 leading-tight"> {lastDisc.title || "จอมวางแผน"} </h2>

        <div className="flex items-center gap-2 mb-6 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-inner group-hover:border-blue-300 transition-colors">
          <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform"> {lastDisc.finalResult || lastDisc.result} </span>
          <span className="text-sm font-bold text-blue-700 italic">Style</span>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100 shadow-sm">
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>ประเมินใหม่</span>
        </div>
      </>
    ) : (
      <>
        <h3 className="font-black text-xl text-slate-800">สำรวจตัวตน DISC</h3>
        <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">ค้นหาสไตล์การทำงานแบบคุณ</p>
        <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
          เริ่มทดสอบ <ChevronRight size={16} />
        </span>
      </>
    )}
  </motion.div>
</Link>

      {/* Money Avatar Card */}
<Link href="/tools/money-avatar" className="group block h-full">
  <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-amber-200 hover:shadow-xl relative overflow-hidden">
    
    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 group-hover:h-3 transition-all duration-300" />

 {/* แก้ตรง div วงกลมของ Money Avatar */}
<div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-5 flex items-center justify-center aspect-square w-fit group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-100 shadow-sm group-hover:scale-110 duration-300">
  <Wallet size={24} />
</div>
 {lastMoney ? (
  <>
    {(() => {
      const details = MONEY_MAP[lastMoney.resultKey] || { title: lastMoney.avatarType || "นักวางแผนการเงิน", concept: "ค้นหาตัวตนทางการเงินของคุณ" };
      return (
        <>
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1.5"> สไตล์การเงินของคุณ </h3>
          <h2 className="text-2xl font-black text-slate-800 mb-1 leading-tight"> {details.title} </h2>
          
          {/* 💡 ผลลัพธ์: ขนาดเท่าการ์ด Library, ตัวตรง, และเน้นตัวหนา */}
          <p className="text-sm text-slate-500 font-bold mt-2 mb-6 px-2"> 
            "{details.concept}" 
          </p>
        </>
      );
    })()}

    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-wider group-hover:bg-amber-50 group-hover:text-amber-700 transition-all border border-transparent group-hover:border-amber-100 shadow-sm">
      <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
      <span>ประเมินใหม่</span>
    </div>
  </>
) : (
// ... (ส่วนที่เหลือเหมือนเดิมครับ)
      <>
        <h3 className="font-black text-xl text-slate-800">Money Avatar</h3>
        <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">ถอดรหัสสไตล์การเงินของคุณ</p>
        <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
          เช็กอาการ <ChevronRight size={16} />
        </span>
      </>
    )}
  </motion.div>
</Link>
{/* Library Card */}
<Link href="/library" className="group block h-full">
  <motion.div whileHover={{ y: -6 }} className="h-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-emerald-200 hover:shadow-xl relative overflow-hidden">
    
    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 group-hover:h-3 transition-all duration-300" />

    {/* แก้ตรง div วงกลมของ Library */}
<div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-5 flex items-center justify-center aspect-square w-fit group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-emerald-100 shadow-sm group-hover:scale-110 duration-300">
  <BookOpen size={24} />
</div>
    <h3 className="font-black text-xl text-slate-800">คลังสมองอัปสกิล</h3>
    <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">สรุปหนังสือและบทความดีๆ ที่คัดมาแล้ว</p>
    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
      เปิดอ่านเลย <ChevronRight size={16} />
    </span>
  </motion.div>
</Link>
          
        </div>

        {/* --- 🚀 4. Mobile Logout & Footer --- */}
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