"use client";


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, BookOpen, ChevronRight, LogIn, LogOut, Loader2, LayoutDashboard, Star, Lock,Flame,BrainCircuit,Sparkles,Info,Image,ShieldCheck,Zap } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

export default function Home() {
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
      // ถ้ามี user (เพิ่ง Login สำเร็จ) ให้ดีดขึ้นบนสุดทันที
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    });
    return () => unsubscribe();
  }, []);

   useEffect(() => {
    if (user) {
      // ถ้ามี user (เพิ่ง Login สำเร็จ) ให้ดีดขึ้นบนสุดทันที
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [user]);

const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      const userRef = doc(db, "users", loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          subscription_tier: "free",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error: any) {
      // ✨ เพิ่มการดักจับ Error ตรงนี้ ✨
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("ปิดหน้าต่าง Login ไปก่อน (ไม่ใช่บั๊กนะ ปลอดภัยดี!)");
      } else {
        console.error("Login failed:", error);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  const tools = [
        { name: "Wheel of Life", desc: "เช็กสมดุลชีวิต 8 ด้าน พร้อม AI วางแผน 7 วัน", icon: <PieChart size={28} className="text-red-600" />, path: "/tools/wheel-of-life", color: "bg-red-50 border-red-200" },
    { name: "วิเคราะห์ DISC", desc: "ค้นหาตัวตนและการสื่อสารในที่ทำงาน", icon: <Users size={28} className="text-blue-600" />, path: "/tools/disc", color: "bg-blue-50 border-blue-200" },
    { name: "Money Avatar", desc: "ถอดรหัสสไตล์การเงินของคุณ", icon: <Wallet size={28} className="text-amber-600" />, path: "/tools/money-avatar", color: "bg-amber-50 border-amber-200" },
    { name: "คมสัดสัด", desc: "สร้างคำคมฮีลใจเฉพาะคุณ", icon: <Quote size={28} className="text-purple-600" />, path: "/tools/khomsatsat", color: "bg-purple-50 border-purple-200" }
  ];


  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-800" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans">
      
      {/* --- 1. Hero Section (ปรับตามสถานะ Login) --- */}
      {!user ? (
        <section className="text-center py-16 mb-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
    <div className="inline-flex w-24 h-24 sm:w-32 sm:h-32 p-4 sm:p-5 bg-red-50 rounded-3xl mb-8 shadow-inner items-center justify-center">
            <img 
              src="/logo-full.png" 
              alt="Idea Logo" 
              className="w-full h-full object-contain drop-shadow-sm opacity-90 transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 leading-tight tracking-tight">
            การพัฒนาตัวเองที่สนุกกว่าที่คิด <br />
            ด้วย <span className="text-red-800"> UPSKILL EVERYDAY</span>
          </h1>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto text-base sm:text-lg font-medium">
            เครื่องมือวิเคราะห์ตนเอง เพื่อให้คุณเป็นคนสำเร็จในเวอร์ชันที่ดีกว่าเดิม
          </p>
        </section>
      ) : (
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-10 gap-6 overflow-hidden">
          <button onClick={handleLogout} className="absolute top-5 right-6 flex items-center gap-1.5 text-slate-300 hover:text-red-800 transition-colors text-[10px] font-bold uppercase tracking-widest z-10">
            <LogOut size={14} /> ออกจากระบบ
          </button>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 z-10 text-center sm:text-left">
            <img src={user.photoURL || "/default-avatar.png"} alt="Profile" className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-sm" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">สวัสดี, คุณ {user.displayName?.split(' ')[0]} 🚀</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">ยินดีต้อนรับสู่การอัพสกิลแบบ Professional</p>
            </div>
          </div>
          <Link href="/dashboard" className="w-full md:w-auto z-10">
            <button className="w-full flex items-center justify-center gap-2.5 bg-red-800 text-white px-8 py-4 rounded-full font-black hover:bg-red-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <LayoutDashboard size={20} /> ไปที่ Dashboard
            </button>
          </Link>
        </div>
      )}

{/* --- 2. Tools Grid (เปิดให้ทุกคนเห็นเพื่อสร้าง Trust) --- */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
           📌 เครื่องมือเฉพาะสำหรับคุณ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => {
            let gimmick = null;
            
           // 💡 1. DISC
if (tool.name.toLowerCase().includes("disc")) {
  gimmick = (
    // เปลี่ยน group-hover:text-white เป็น group-hover:text-blue-900
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors duration-300">
      <Users size={12} className="text-blue-500 group-hover:text-blue-900 transition-colors" />
      <span>ผู้ใช้งาน 100K+</span>
    </div>
  );
} 
// 💡 2. Wheel of Life
else if (tool.name.toLowerCase().includes("wheel")) {
  gimmick = (
    // เปลี่ยน group-hover:text-white เป็น group-hover:text-red-900
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm group-hover:bg-red-100 group-hover:text-red-900 transition-colors duration-300">
      <Flame size={12} className="text-red-500 group-hover:text-red-900 transition-colors animate-pulse" />
      <span>290K+ Views บน Social</span>
    </div>
  );
}
// 💡 3. Money Avatar (จุดที่มีปัญหาในรูป)
else if (tool.name.toLowerCase().includes("money")) {
  gimmick = (
    // เปลี่ยน group-hover:text-white เป็น group-hover:text-amber-950
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 shadow-sm group-hover:bg-amber-100 group-hover:text-amber-950 transition-colors duration-300">
      <BrainCircuit size={12} className="text-amber-500 group-hover:text-amber-950 transition-colors" />
      <span>วิเคราะห์เจาะลึกระดับ PRO</span>
    </div>
  );
}
// 💡 4. คมสัดสัด
else if (tool.name.includes("คมสัด")) {
  gimmick = (
    // เปลี่ยน group-hover:text-white เป็น group-hover:text-purple-900
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest border border-purple-100 shadow-sm group-hover:bg-purple-100 group-hover:text-purple-900 transition-colors duration-300">
      <Sparkles size={12} className="text-purple-500 group-hover:text-purple-900 transition-colors" />
      <span>Vibe ดี โดนใจ Gen Z</span>
    </div>
  );
}

          return (
            // 💡 1. ให้ทั้งการ์ดกดลิงก์ไปที่หน้า /info ก่อนเสมอ
            <Link key={tool.name} href={`${tool.path}/info`} className="block h-full group">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex items-center gap-4 cursor-pointer hover:-translate-y-1 h-full relative overflow-hidden">
                
                {/* ไอคอนหลัก */}
                <div className={`p-4 rounded-2xl border ${tool.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shrink-0 self-start`}>
                  {tool.icon}
                </div>
                
                {/* เนื้อหาข้อความ (เอา pr-8 ออก เพราะไม่มีปุ่ม i แล้ว) */}
                <div className="flex-1 flex flex-col h-full justify-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors">{tool.name}</h3>
<p className="text-sm text-slate-500 mt-1 leading-relaxed break-words text-pretty pr-2">
  {tool.desc}
</p>
                  </div>
                  
                  {/* ป้าย Gimmick */}
                  {gimmick && (
                    <div className="mt-auto pt-3">
                      {gimmick}
                    </div>
                  )}
                </div>

                {/* 💡 2. ส่วนชี้เป้าด้านขวา (อัปเดตใหม่ให้มีคำว่า "รายละเอียด") */}
                <div className="flex flex-col sm:flex-row items-center gap-1 text-slate-300 group-hover:text-red-500 transition-colors shrink-0">
                  <span className="text-[10px] sm:text-[12px] font-bold group-hover:-translate-x-1 transition-transform duration-300">
                    รายละเอียด
                  </span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>

              </div>
            </Link>
          );
        })}
        </div>
      </section>
{!user && (
        <section className="mb-12 max-w-7xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[550px] flex items-center shadow-2xl">
          
          {/* 🛡️ PDPA Trust Badge - มุมขวาบน (Security Seal Style) */}
          <div className="absolute top-8 right-10 z-30 flex flex-col items-end opacity-50 hover:opacity-100 transition-all duration-500 group/pdpa">
             <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/pdpa:text-blue-400 transition-colors">
                  PDPA Compliant
                </span>
                <ShieldCheck size={14} className="text-emerald-500" />
             </div>
             {/* Tooltip เล็กๆ ที่จะชัดขึ้นตอน Hover */}
             <div className="mt-2 text-right hidden md:block">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-tight">
                  Encrypted & Secured <br/> No Data Selling
                </p>
             </div>
          </div>

          {/* ✨ Ambient Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-80" />

          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-8 sm:p-20 items-center">
            
            {/* Left Side: Pitch Content */}
            <div className="max-w-md mx-auto md:mx-0 text-left">
              <span className="text-amber-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-4 block">
                Early Access (Free Beta)
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-[1.1]">
                ปลดล็อก Dashboard <br />
                <span className="text-blue-400">เพื่อเก็บสถิติส่วนตัว</span>
              </h2>
              
              <ul className="space-y-4 mb-10">
                {[
                  "บันทึกผลทดสอบของทุก App ในที่เดียว",
                  "สะสม XP พัฒนา Level การเรียนรู้ของคุณ",
                  "Personalized Insight วิเคราะห์จุดอัพสกิล"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <div className="bg-amber-400/10 p-1.5 rounded-lg border border-amber-400/20">
                      <Star size={16} className="text-amber-400 fill-amber-400/20" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-start gap-4">
                <button onClick={handleLogin} className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group">
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  เข้าสู่ระบบด้วย Google
                </button>
                <p className="text-[10px] text-slate-500 font-medium ml-2">
                  * เข้าร่วมฟรีในช่วง Beta Test พร้อมใช้ Dashboard สุด Exclusive
                </p>
              </div>
            </div>

            {/* Right Side: Decorative Mockup */}
     <div className="hidden md:flex justify-end relative">
  {/* ตัวมือถือ Mockup */}
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.3 }}
    className="w-72 h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border border-white/10 p-4 shadow-2xl relative rotate-6 hover:rotate-3 transition-transform duration-500"
  >
    <div className="w-full h-full bg-slate-950/50 rounded-[2.5rem] p-5 flex flex-col gap-4 overflow-hidden">
      {/* Header ในมือถือ */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-amber-400/20 border border-amber-400/30" />
      </div>

      {/* กราฟจำลอง */}
      <div className="h-32 w-full bg-blue-500/10 rounded-2xl border border-blue-500/20 p-4 flex items-end gap-1">
        {[40, 70, 45, 90, 65].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 1 + (i * 0.1), duration: 0.5 }}
            className="flex-1 bg-blue-500/40 rounded-t-sm" 
          />
        ))}
      </div>

      {/* List รายการ */}
      <div className="space-y-3 mt-2">
        <div className="h-16 w-full bg-slate-800/50 rounded-2xl border border-white/5" />
        <div className="h-16 w-full bg-slate-800/50 rounded-2xl border border-white/5" />
        <div className="h-16 w-full bg-slate-800/50 rounded-2xl border border-white/5" />
      </div>
    </div>

    {/* ✨ Floating XP Badge เพื่อความตึง */}
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-6 -left-12 bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2"
    >
      <div className="bg-amber-400 p-1 rounded-lg">
        <Zap size={16} className="text-slate-900 fill-current" />
      </div>
      <span className="text-white font-black text-xs">+150 XP</span>
    </motion.div>

    {/* ✨ Floating Level */}
    <motion.div 
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className="absolute bottom-20 -right-10 bg-blue-500/20 backdrop-blur-lg px-4 py-2 rounded-full border border-blue-400/30 shadow-xl text-[10px] font-black text-blue-300 uppercase tracking-widest"
    >
      Level 12 reached
    </motion.div>
  </motion.div>
</div>

          </div>
        </section>
      )}
      

      <p className="mt-12 text-center text-xs text-slate-400 font-medium">
        © 2026 อัพสกิลกับฟุ้ย
      </p>
    </div>
  );
}