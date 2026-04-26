"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, MessageSquareMore, Zap, ShieldCheck, Sparkles, 
  MessageSquare, Target, ArrowRight, Lightbulb, TrendingUp, 
  Layers, Lock, UserCheck, Bot,
  PieChart, Users, Wallet, BookOpen, Quote
} from "lucide-react";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export default function AiMentorInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
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
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* --- Navbar --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* --- 1. Hero Section --- */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-slate-200 blur-2xl rounded-full scale-150 opacity-50" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-zinc-300 text-slate-600 rounded-[2.5rem] rotate-3 shadow-2xl border border-white">
              <MessageSquareMore size={48} className="drop-shadow-sm" />
            </div>
            <div className="absolute -top-2 -right-2 bg-slate-900 text-white p-2 rounded-full shadow-lg border border-white/20 animate-bounce">
              <Sparkles size={16} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            AI MENTOR <br/>
            <span className="text-slate-400 bg-clip-text text-transparent bg-gradient-to-r from-slate-600 via-zinc-500 to-slate-400">
              Personalized Growth Companion
            </span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            ปลดล็อกศักยภาพสูงสุดของคุณด้วย "ที่ปรึกษาส่วนตัว" <br className="hidden md:block"/>
            ที่วิเคราะห์คุณจากทุกมิติ เพื่อการเติบโตที่ไม่มีขีดจำกัด
          </p>
          
          {authLoading ? (
            <div className="h-[72px] w-[260px] bg-slate-100 animate-pulse rounded-[2rem] mx-auto" />
          ) : user ? (
            <Link href="/tools/ai-mentor">
              <button className="group relative bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Bot size={24} className="text-slate-400" /> 
                เข้าพบ AI Mentor
                <ArrowRight size={24} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="group relative bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto overflow-hidden border border-slate-200"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าใช้งานด้วย Google"}
            </button>
          )}
          <p className="text-slate-400 text-[11px] mt-5 font-black uppercase tracking-[0.3em]">
            {!authLoading && (user ? "พร้อมวิเคราะห์ข้อมูลของคุณแล้ว" : "กรุณาเข้าสู่ระบบเพื่อใช้งาน AI Mentor ส่วนตัว")}
          </p>
        </header>

        {/* --- 2. Advanced Analysis Grid --- */}
        <section className="mb-12">
          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 blur-3xl rounded-full -mr-32 -mt-32" />
            
            <h2 className="text-2xl font-black text-slate-800 mb-10 border-l-4 border-slate-400 pl-4">3 มิติการวิเคราะห์ระดับโปร</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-300 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Layers size={24} className="text-slate-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Data Synergy</h3>
                <p className="text-sm text-slate-500 leading-relaxed">เชื่อมโยงผลจาก DISC, Wheel of Life, Money Avatar, Library of Souls และ คมสัดสัด เพื่อเห็นภาพคุณแบบ 360 องศา</p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-300 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Target size={24} className="text-slate-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Actionable Plan</h3>
                <p className="text-sm text-slate-500 leading-relaxed">ไม่ได้บอกแค่จุดแข็ง-จุดอ่อน แต่ช่วยวางแผน "สิ่งที่ต้องทำ" ใน 7 วันหรือ 30 วัน ข้างหน้าให้คุณได้ด้วย</p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-300 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} className="text-slate-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Real-time Coaching</h3>
                <p className="text-sm text-slate-500 leading-relaxed">ปรึกษาได้ทุกเรื่อง ตั้งแต่การสื่อสารในที่ทำงาน ไปจนถึงการจัดการอารมณ์ส่วนตัว</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. Feature Showcase (Silver Theme Card) --- */}
        <section className="bg-slate-900 text-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">
                <Lock size={12} className="text-slate-400" /> Privacy First
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">ความปลอดภัย <br/><span className="text-slate-400">คือหัวใจสำคัญ</span></h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                    <UserCheck size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">ข้อมูลส่วนตัว 100%</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">บทสนทนาและข้อมูลการวิเคราะห์จะถูกเก็บเป็นความลับเฉพาะคุณเท่านั้น</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                    <ShieldCheck size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">No Data Sharing</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">เราไม่มีนโยบายแชร์ข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สามอย่างแน่นอน</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-[3rem] border border-white/10 shadow-inner relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <MessageSquareMore size={300} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="h-2 w-20 bg-slate-700 rounded-full" />
                  <div className="h-4 w-full bg-slate-800 rounded-xl" />
                  <div className="h-4 w-4/5 bg-slate-800 rounded-xl" />
                  <div className="h-4 w-2/3 bg-slate-800 rounded-xl" />
                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700" />
                      <div className="w-8 h-8 rounded-full bg-slate-700" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-900 shadow-lg">
                      <Zap size={20} className="fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. Value Proposition Grid --- */}
        <section className="mb-20">
          <h2 className="text-2xl font-black text-slate-800 mb-8 text-center uppercase tracking-widest">Why AI Mentor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold">Insight Driven</h3>
              <p className="text-slate-500 leading-relaxed text-sm">เข้าถึงข้อมูลที่ลึกซึ้งกว่าที่เคย ด้วยระบบที่เทรนมาเพื่อวิเคราะห์จิตวิทยาและการพัฒนาตัวเองโดยเฉพาะ</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold">Growth Oriented</h3>
              <p className="text-slate-500 leading-relaxed text-sm">เน้นผลลัพธ์ที่จับต้องได้และการขยับ Level ของคุณในทุกๆ วัน</p>
            </div>
          </div>
        </section>

        {/* --- 2.5 Unified Apps Visual --- */}
        <section className="mb-20 animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="bg-gradient-to-br from-slate-100 to-zinc-200 p-8 md:p-12 rounded-[3.5rem] border border-white shadow-xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 pointer-events-none" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-10 relative z-10">Integrated Ecosystem</h3>
            <div className="flex flex-col gap-6 md:gap-10 relative z-10">
              {/* บรรทัดแรก 3 อัน */}
              <div className="flex justify-center gap-6 md:gap-10">
                {[
                  { icon: <PieChart size={28} />, name: "Wheel of Life", color: "text-red-500" },
                  { icon: <Users size={28} />, name: "DISC", color: "text-blue-500" },
                  { icon: <Wallet size={28} />, name: "Money Avatar", color: "text-amber-500" },
                ].map((app, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center shadow-lg border border-white group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 group-hover:shadow-2xl">
                      <div className={app.color}>{app.icon}</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 tracking-tighter transition-colors uppercase">{app.name}</span>
                  </div>
                ))}
              </div>
              {/* บรรทัดที่สอง 2 อัน */}
              <div className="flex justify-center gap-6 md:gap-10">
                {[
                  { icon: <BookOpen size={28} />, name: "Library of Souls", color: "text-emerald-500" },
                  { icon: <Quote size={28} />, name: "คมสัดสัด", color: "text-purple-500" },
                ].map((app, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center shadow-lg border border-white group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 group-hover:shadow-2xl">
                      <div className={app.color}>{app.icon}</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 tracking-tighter transition-colors uppercase">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-slate-300/50 relative z-10">
              <p className="text-base text-slate-600 font-bold max-w-lg mx-auto leading-relaxed">
                <span className="text-slate-900 bg-white px-2 py-0.5 rounded-lg shadow-sm">AI Mentor</span> จะรวบรวมจิ๊กซอว์จากทุกแอป <br className="md:hidden" /> 
                มาประมวลผลเป็น <span className="text-slate-900 underline decoration-slate-400 underline-offset-4">Insight เดียวที่แม่นยำที่สุด</span> สำหรับคุณ
              </p>
            </div>
          </div>
        </section>

        {/* --- 5. Final CTA --- */}
        <div className="text-center pb-20">
          {!authLoading && user && (
            <Link href="/tools/ai-mentor">
              <button className="bg-slate-900 text-white px-12 py-5 rounded-full font-black text-[22px] hover:bg-black transition-all hover:scale-110 shadow-2xl flex items-center gap-4 mx-auto border border-slate-800 group">
                คุยกับ Mentor เดี๋ยวนี้
                <ArrowRight size={28} className="text-slate-500 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          )}
          
          <p className="text-slate-400 text-sm mt-8 font-bold italic max-w-md mx-auto">
            "เพราะการมี Mentor ที่ดี คือทางลัดที่สั้นที่สุดสู่ความสำเร็จ"
          </p>
          
          <Link href={user ? "/dashboard" : "/"} className="inline-block mt-12 text-slate-500 hover:text-slate-800 font-bold text-base transition-colors underline underline-offset-8 decoration-slate-200">
            {user ? "กลับสู่หน้าหลัก Dashboard" : "กลับสู่หน้าหลัก"}
          </Link>


        </div>

      </main>
    </div>
  );
}
