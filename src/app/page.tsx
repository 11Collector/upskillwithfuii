"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, BookOpen, ChevronRight, LogIn, LogOut, Loader2, LayoutDashboard, Star, Lock,Flame,BrainCircuit,Sparkles } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

export default function Home() {
  
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
            อัพเกรดชีวิตและทักษะ <br />
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
           📌 เครื่องมือสำหรับคุณ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => {
            let gimmick = null;
            
            // 💡 1. DISC (ขิงด้วยจำนวนคนเล่น)
            if (tool.name.toLowerCase().includes("disc")) {
              gimmick = (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Users size={12} className="text-blue-500 group-hover:text-white transition-colors" />
                  <span>ผู้ใช้งาน 100K+</span>
                </div>
              );
            } 
            // 💡 2. Wheel of Life (ขิงด้วยกระแสโซเชียล)
            else if (tool.name.toLowerCase().includes("wheel")) {
              gimmick = (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <Flame size={12} className="text-red-500 group-hover:text-white transition-colors animate-pulse" />
                  <span>290K+ Views บน Social</span>
                </div>
              );
            }
            // 💡 3. Money Avatar (เน้นความพรีเมียมและความละเอียดของการวิเคราะห์)
            else if (tool.name.toLowerCase().includes("money")) {
              gimmick = (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                  <BrainCircuit size={12} className="text-amber-500 group-hover:text-white transition-colors" />
                  <span>วิเคราะห์เจาะลึกระดับ PRO</span>
                </div>
              );
            }
            // 💡 4. คมสัดสัด (ดึงดูด Gen Z ด้วยศัพท์ Vibe)
            else if (tool.name.includes("คมสัด")) {
              gimmick = (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest border border-purple-100 shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                  <Sparkles size={12} className="text-purple-500 group-hover:text-white transition-colors" />
                  <span>Vibe ดี โดนใจ Gen Z ✨</span>
                </div>
              );
            }

            return (
              <Link key={tool.name} href={tool.path}>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 group flex items-start gap-4 cursor-pointer hover:-translate-y-1 h-full relative overflow-hidden">
                  
                  {/* ไอคอนหลัก */}
                  <div className={`p-4 rounded-2xl border ${tool.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shrink-0`}>
                    {tool.icon}
                  </div>
                  
                  {/* เนื้อหาข้อความ */}
                  <div className="flex-1 flex flex-col h-full justify-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors">{tool.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tool.desc}</p>
                    </div>
                    
                    {/* ป้าย Gimmick */}
                    {gimmick && (
                      <div className="mt-auto pt-2">
                        {gimmick}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={20} className="text-slate-200 group-hover:text-red-500 self-center shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- 3. Preview Dashboard Section (ขายของจูงใจให้ Login) --- */}
      {!user && (
        <section className="mb-12 bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-md">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Early Access (Free Beta)</span>
         <h2 className="text-3xl md:text-4xl font-black mb-4 text-white leading-tight">
  ปลดล็อก Dashboard <br />
  <span className="text-blue-400">เพื่อเก็บสถิติส่วนตัว</span>
</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300 text-sm"><Star size={16} className="text-amber-400" /> บันทึกผลทดสอบของทุก App</li>
              <li className="flex items-center gap-2 text-slate-300 text-sm"><Star size={16} className="text-amber-400" /> สะสม XP พัฒนา Level การเรียนรู้ของคุณ</li>
              <li className="flex items-center gap-2 text-slate-300 text-sm"><Star size={16} className="text-amber-400" /> วิเคราะห์จุดที่ควรโฟกัสในการอัพสกิล</li>
            </ul>
            <button onClick={handleLogin} className="bg-white text-slate-900 px-8 py-3 rounded-full font-black text-sm hover:bg-amber-50 transition-colors">
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
          <div className="absolute top-10 -right-20 opacity-20 rotate-12 hidden md:block">
             <div className="w-80 h-96 bg-white/10 rounded-3xl border border-white/20 p-6">
                <div className="h-4 w-32 bg-white/20 rounded mb-4" />
                <div className="h-20 w-full bg-white/10 rounded-2xl mb-4" />
                <div className="h-20 w-full bg-white/10 rounded-2xl" />
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