"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion } from "framer-motion";
import { PieChart, Quote, Users, Wallet, ChevronRight, Sparkles, ArrowRight, BookOpen ,RefreshCw, LogOut} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";


export default function DashboardPage() {
const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

// 2. ฟังก์ชัน Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // ออกแล้วกลับหน้าแรก
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // 💡 State สำหรับรับค่าทั้ง 4 แอป
  const [lastWheel, setLastWheel] = useState<any>(null);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [lastDisc, setLastDisc] = useState<any>(null);
  const [lastMoney, setLastMoney] = useState<any>(null);


  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // 1️⃣ ดึง Wheel of Life ล่าสุด
          const wheelRef = collection(db, "users", currentUser.uid, "assessments");
          const wheelQ = query(wheelRef, orderBy("createdAt", "desc"), limit(1));
          const wheelSnap = await getDocs(wheelQ);
          if (!wheelSnap.empty) setLastWheel(wheelSnap.docs[0].data());

          // 2️⃣ ดึงคำคมล่าสุด (คมสัดสัด)
          const quoteRef = collection(db, "quotes");
          const quoteQ = query(quoteRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
          const quoteSnap = await getDocs(quoteQ);
          if (!quoteSnap.empty) setLastQuote(quoteSnap.docs[0].data());

          // 3️⃣ ดึง DISC ล่าสุด
          const discRef = collection(db, "discResults");
          const discQ = query(discRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
          const discSnap = await getDocs(discQ);
          if (!discSnap.empty) setLastDisc(discSnap.docs[0].data());

// 4️⃣ ดึง Money Avatar ล่าสุด (เปลี่ยนจาก moneyAvatarResults เป็น quiz_results)
const moneyRef = collection(db, "quiz_results"); 
const moneyQ = query(moneyRef, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
const moneySnap = await getDocs(moneyQ);
if (!moneySnap.empty) setLastMoney(moneySnap.docs[0].data());

        } catch (error) {
          console.error("ดึงข้อมูล Dashboard พลาด:", error);
        }
      } else {
        router.push("/"); 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">กำลังโหลดแผงควบคุมพลังชีวิต...</p>
      </div>
    );
  }

  // ตัวแปรหมวดหมู่สำหรับแปลง Index เป็นชื่อ (เอาไว้โชว์คะแนน Wheel of Life)
  const categoryNames = ["สุขภาพ", "การเงิน", "การงาน", "ครอบครัว", "เพื่อนฝูง", "พัฒนาตนเอง", "จิตใจ", "ช่วยเหลือสังคม"];
return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section (ปรับปรุงเพื่อใส่ปุ่ม Log Out) */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-yellow-500" size={20} />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upskill Hub Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              ยินดีต้อนรับกลับมา, <br className="md:hidden" />
              <span className="text-red-800">{user?.displayName?.split(' ')[0] || "เพื่อนรัก"}! 🚀</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Info */}
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100">
              <img 
                src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Fuii"} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-slate-50 shadow-sm"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-black text-slate-800 leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{user?.email}</p>
              </div>
              
              {/* 🚪 ปุ่ม Logout แบบ Minimal */}
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all group"
                title="ออกจากระบบ"
              >
                <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
      {/* 1. Wheel of Life Card (ตัวใหญ่) */}
          <Link href="/tools/wheel-of-life" className="md:col-span-2 group block">
            <motion.div whileHover={{ y: -4 }} className="h-full bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-xl hover:border-red-100">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-red-50 text-red-700 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-colors">
                      <PieChart size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Wheel of Life</h2>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">เป้าหมาย 1 ปีของคุณ:</p>
                  <p className="text-lg font-bold text-slate-700 line-clamp-2">
                    {lastWheel?.goal || "ยังไม่ได้ตั้งเป้าหมาย ไปตั้งเป้าหมายกันเถอะ!"}
                  </p>
                </div>
                
                {/* 💡 ปุ่มกดประเมินใหม่ (มุมขวาบน) */}
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider group-hover:bg-red-50 group-hover:text-red-700 group-hover:border-red-100 transition-all">
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>{lastWheel ? "ประเมินใหม่" : "เริ่มประเมิน"}</span>
                </div>
              </div>

              {/* โชว์คะแนนแบบย่อๆ ด้านล่าง */}
              {lastWheel?.currentScores && (
                <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {lastWheel.currentScores.map((score: number, idx: number) => (
                    <div key={idx} className="flex-1 min-w-[50px] bg-slate-50 rounded-2xl flex flex-col items-center py-3 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold mb-1 truncate w-full text-center px-1">
                        {categoryNames[idx]}
                      </span>
                      <span className="text-xl font-black text-slate-800">{score}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </Link>

          {/* 2. คมสัดสัด Card */}
          <Link href="/tools/khomsatsat" className="group block">
            <motion.div whileHover={{ y: -4 }} className="h-full bg-slate-900 p-8 rounded-[2rem] shadow-lg text-white relative overflow-hidden hover:shadow-blue-900/20 transition-all">
              <Quote className="absolute -top-4 -right-4 text-slate-800/50 rotate-12" size={120} />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-slate-800 text-blue-400 rounded-xl">
                    <Quote size={20} />
                  </div>
                  {/* 💡 ปุ่มกดสุ่มใหม่ (มุมขวาบน) */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>สุ่มคำคมใหม่</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-300 mb-4">คำคมที่ทัชใจล่าสุด</h2>
                <div className="flex-1 flex items-center">
                  <p className="text-base font-medium leading-relaxed italic text-white/90">
                    "{lastQuote?.quote || "ยังไม่มีคำคมสะสมไว้ ลองไปเล่น 'คมสัดสัด' ดูสิ!"}"
                  </p>
                </div>
                {lastQuote?.mood && (
                  <div className="mt-6 inline-flex text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full w-fit">
                    #{lastQuote.mood}
                  </div>
                )}
              </div>
            </motion.div>
          </Link>

         {/* 3. DISC Card */}
{/* 3. DISC Card */}
<Link href="/tools/disc" className="group block">
  <motion.div whileHover={{ y: -4 }} className="h-full bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-blue-200 hover:shadow-md">
    
    <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
      <Users size={32} />
    </div>

    {lastDisc ? (
      <>
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">
          สไตล์การสื่อสารของคุณ
        </h3>
        
        {/* แสดงชื่อฉายาเท่ๆ (title) */}
        <h2 className="text-xl font-black text-slate-800 mb-1">
          {lastDisc.title || "จอมวางแผน"} 
        </h2>

        {/* แสดงตัวอักษร D I S C ในวงกลมเล็กๆ ให้ดูมีดีไซน์ */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
            {lastDisc.finalResult || lastDisc.result}
          </span>
          <span className="text-sm font-bold text-blue-600/80 italic">Style</span>
        </div>

        {/* ปุ่มประเมินใหม่ */}
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>ประเมินใหม่อีกครั้ง</span>
        </div>
      </>
    ) : (
      <>
        <h3 className="font-black text-lg text-slate-800">สำรวจตัวตน DISC</h3>
        <p className="text-slate-400 text-sm mt-2 mb-5">ค้นหาสไตล์การทำงานแบบคุณ</p>
        <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          เริ่มทดสอบ <ChevronRight size={14} />
        </span>
      </>
    )}
  </motion.div>
</Link>



{/* 4. Money Avatar Card - เวอร์ชันอัปเกรด ดึงข้อมูลครบเซต */}
<Link href="/tools/money-avatar" className="group block">
  <motion.div whileHover={{ y: -4 }} className="h-full bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-amber-200 hover:shadow-md">
    
    <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
      <Wallet size={32} />
    </div>

    {lastMoney ? (
      <>
        {/* 💡 Logic ดึงข้อมูลจากรหัสผลลัพธ์ */}
        {(() => {
          // พจนานุกรมสำหรับแปลรหัสเป็นภาษาไทยและคำโปรย
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

          // ดึงข้อมูลตามรหัสที่เซฟไว้ (resultKey หรือ avatarType)
          const details = MONEY_MAP[lastMoney.resultKey] || { 
            title: lastMoney.avatarType || "นักวางแผนการเงิน", 
            concept: "ค้นหาตัวตนทางการเงินของคุณ" 
          };

          return (
            <>
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">
                สไตล์การเงินของคุณ
              </h3>
              
              {/* ชื่อฉายา เช่น เซียนระบบสุดตึง */}
              <h2 className="text-xl font-black text-slate-800 mb-1 leading-tight">
                {details.title}
              </h2>

              {/* คำโปรยสั้นๆ ดึงมาจาก Description */}
              <p className="text-[11px] text-slate-500 mb-5 font-medium italic px-2">
                "{details.concept}"
              </p>
            </>
          );
        })()}

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider group-hover:bg-amber-50 group-hover:text-amber-700 transition-all border border-transparent group-hover:border-amber-100">
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>ประเมินใหม่อีกครั้ง</span>
        </div>
      </>
    ) : (
      <>
        <h3 className="font-black text-lg text-slate-800">Money Avatar</h3>
        <p className="text-slate-400 text-sm mt-2 mb-5">ถอดรหัสสไตล์การเงินของคุณ</p>
        <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          เช็กอาการ <ChevronRight size={14} />
        </span>
      </>
    )}
  </motion.div>
</Link>

         {/* 5. Library Card - เปลี่ยนเป็นสี Emerald (สีเขียวเหนี่ยวความรู้) */}
          <Link href="/library" className="group block md:col-span-1">
            <motion.div whileHover={{ y: -4 }} className="h-full bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center transition-all hover:border-emerald-200 hover:shadow-md">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h3 className="font-black text-lg text-slate-800">คลังสมองอัปสกิล</h3>
              <p className="text-slate-400 text-sm mt-2 mb-4">สรุปหนังสือและบทความดีๆ</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                เปิดอ่านเลย <ChevronRight size={14} />
              </span>
            </motion.div>
          </Link>
          
        </div>

        {/* 🚀 Mobile Logout Button (แถมให้เผื่อกดบนมือถือยาก) */}
        <div className="mt-12 md:hidden flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 font-bold text-sm py-2 px-4 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}