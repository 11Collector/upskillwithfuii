"use client";


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, BookOpen, ChevronRight, LogIn, LogOut, Loader2, LayoutDashboard, Star, Lock,Flame,BrainCircuit,Sparkles,Info,Image,ShieldCheck,Zap,Award,Target } from "lucide-react";
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
        { name: "Wheel Of Life", desc: "เช็กสมดุลชีวิต 8 ด้าน พร้อม AI วางแผน 7 วัน", icon: <PieChart size={28} className="text-red-600" />, path: "/tools/wheel-of-life", color: "bg-red-50 border-red-200" },
    { name: "Who Are You ?", desc: "ค้นหาตัวตนและการสื่อสารในที่ทำงานผ่าน DISC", icon: <Users size={28} className="text-blue-600" />, path: "/tools/disc", color: "bg-blue-50 border-blue-200" },
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
     <motion.div 
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative flex flex-col md:flex-row justify-between items-center bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 mb-12 gap-8 overflow-hidden group"
>
  {/* ✨ Ambient Decor: แสงสีแดงจางๆ มุมขวาบน */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-red-500/10 transition-colors duration-700" />
  
{/* 🚪 Logout Button: ปรับพื้นที่สัมผัสให้กว้างขึ้นแต่ยังดู Minimal เหมือนเดิม */}
<button 
  onClick={handleLogout} 
  className="absolute top-4 right-4 z-50 flex items-center gap-2 
             /* เพิ่ม Padding เพื่อขยายพื้นที่กด (สำคัญมาก!) */
             p-4 sm:p-2 
             text-slate-400 hover:text-red-600 active:text-red-500
             transition-all text-[11px] font-black uppercase tracking-[0.2em] 
             group/logout active:scale-95 /* เพิ่ม Feedback ตอนกด */"
>
  <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" /> 
  <span className="hidden sm:inline">Logout</span> {/* บนมือถือโชว์แค่ไอคอนก็ได้ ถ้าอยากให้คลีนสุดๆ */}
</button>

  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 z-10 w-full md:w-auto">
    {/* 👤 Profile Image & Level Badge */}
    <div className="relative shrink-0">
      <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-500" />
      <img 
        src={user.photoURL || "/default-avatar.png"} 
        alt="Profile" 
        className="relative w-24 h-24 rounded-full border-[6px] border-white shadow-xl object-cover" 
      />
    </div>

    {/* 👋 Welcome Text */}
    <div className="text-center sm:text-left space-y-1">
      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">
          Pro Member
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        สวัสดี, คุณ <span className="text-red-800">{user.displayName?.split(' ')[0]}</span> 🚀
      </h1>
      <p className="text-slate-500 text-sm font-medium">
        พร้อมที่จะขยับขีดจำกัดของตัวเองในวันนี้หรือยัง?
      </p>
      
     
    </div>
  </div>

  {/* 🎯 Dashboard Button: ปรับให้ดูเป็นปุ่ม High-End */}
  <Link href="/dashboard" className="w-full md:w-auto z-10 group/btn">
    <button className="relative w-full overflow-hidden bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
      
      <LayoutDashboard size={18} className="group-hover/btn:rotate-12 transition-transform" />
      เข้าสู่ระบบ Dashboard
    </button>
  </Link>

  {/* Background Progress Line (เส้นวิ่งจางๆ ด้านล่างสุดของ Card) */}
  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-50">
    <motion.div 
      initial={{ x: "-100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="h-full w-full bg-gradient-to-r from-red-800 via-amber-500 to-transparent opacity-30" 
    />
  </div>
  
</motion.div>


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
if (tool.name.toLowerCase().includes("who")) {
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
      <span>500K+ Views บน Social</span>
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
  <section className="mb-12 max-w-7xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[550px] flex items-center shadow-2xl border border-white/5">
    
    {/* ✨ Ambient Background */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-80" />

    {/* บรรทัดที่มีปัญหา - เช็กแล้วว่าเปิดตรงนี้ และปิดท้าย Grid */}
    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-8 sm:p-20 items-center">
      
      {/* --- Left Side: Pitch Content --- */}
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

        <div className="flex flex-col items-start gap-4 w-full">
          <button onClick={handleLogin} className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group">
            {/* Google Icon SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
          
          <p className="text-[10px] text-slate-500 font-medium ml-2 mb-2">
            * เข้าร่วมฟรีในช่วง Beta พร้อมใช้ Dashboard สุด Exclusive
          </p>

          <div className="w-full max-w-sm pt-5 border-t border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privacy & Security</span>
             </div>
             <p className="text-[10.5px] text-slate-500 leading-relaxed font-bold tracking-tight">
               Personalized insights only. Industry-standard security. <br className="hidden sm:block"/>
               <span className="text-slate-400">Zero individual data sharing. Anonymous aggregate trends only.</span>
             </p>
          </div>
        </div>
      </div>

      {/* --- Right Side: Decorative Mockup --- */}
      <div className="hidden md:flex justify-end relative h-full items-center">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-80 h-[520px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border border-white/10 p-4 shadow-2xl relative rotate-3 hover:rotate-1 transition-transform duration-500"
        >
          {/* Dashboard Content */}
          <div className="w-full h-full bg-slate-950/50 rounded-[2.5rem] p-6 flex flex-col gap-5 overflow-hidden border border-white/5 relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-16 bg-white/20 rounded-full" />
                  <div className="h-1.5 w-10 bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="h-7 px-3 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center gap-1.5">
                <Flame size={12} className="text-amber-400 fill-amber-400" /> 7 Days
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800/40 rounded-3xl border border-white/5 p-5 flex items-center gap-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                  <motion.circle
                    cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray="263.9" strokeDashoffset={263.9}
                    animate={{ strokeDashoffset: 66 }} 
                    transition={{ duration: 1.5, delay: 1 }} 
                    className="text-blue-500" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-xl">75%</span>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="h-2 w-16 bg-white/10 rounded-full" />
                <div className="h-2 w-24 bg-white/5 rounded-full" />
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div className="bg-slate-800/30 rounded-2xl border border-white/5 p-4 space-y-2">
                <div className="h-2 w-20 bg-white/10 rounded-full" />
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 1.5 }} className="h-full bg-emerald-500" />
                </div>
              </div>
              <div className="bg-slate-800/30 rounded-2xl border border-white/5 p-4 space-y-2">
                <div className="h-2 w-16 bg-white/10 rounded-full" />
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 1.7 }} className="h-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>

    {/* 🌟 Level Up Badge (Fixed Spring Animation) */}
<motion.div
  initial={{ opacity: 0, scale: 0, rotate: -20 }}
  animate={{ 
    opacity: 1, 
    scale: 1,      // 👈 แก้เป็นเลข 1 ตัวเดียว
    rotate: 0 
  }}
  transition={{ 
    delay: 2.2, 
    duration: 0.6, 
    type: "spring", 
    bounce: 0.6    // 👈 ใส่ bounce แทน มันจะเด้งเกินให้เองแบบไม่งอแง
  }}
  className="absolute -top-12 -right-8 z-50"
>
  <motion.div 
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    className="bg-blue-600 px-6 py-4 rounded-[2rem] border-4 border-slate-900 shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center gap-3"
  >
    <div className="bg-white p-2 rounded-full shadow-lg">
      <Award size={22} className="text-blue-600 fill-current" />
    </div>
    <div className="flex flex-col pr-2">
      <span className="text-blue-100 font-bold text-[9px] uppercase tracking-widest leading-tight">New Status</span>
      <span className="text-white font-black text-lg leading-tight">LEVEL UP!</span>
    </div>
    
    <motion.div 
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute -top-2 -right-2 text-amber-300"
    >
      <Star size={20} className="fill-current" />
    </motion.div>
  </motion.div>
</motion.div>

          {/* ⚡ XP Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute -bottom-6 -left-12 bg-white/10 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 z-30"
          >
            <Zap size={18} className="text-amber-400 fill-current" />
            <span className="text-white font-black text-sm">+150 XP</span>
          </motion.div>

        </motion.div>
      </div> {/* ปิด Right Side */}
      
    </div> {/* ปิด Grid Container (บรรทัดที่มีปัญหา) */}
  </section>
)} 
      

      <p className="mt-12 text-center text-xs text-slate-400 font-medium">
        © 2026 อัพสกิลกับฟุ้ย
      </p>
    </div>
  );
}