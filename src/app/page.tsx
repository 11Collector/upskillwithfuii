"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, ChevronRight, LogOut, Loader2, LayoutDashboard, Star, Flame, BrainCircuit, MessageSquareMore, Sparkles, ShieldCheck, Zap, Award, BookOpen, Download, HelpCircle, X, ArrowRight } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { AnimatePresence } from "framer-motion";
import { loadStripe } from '@stripe/stripe-js';
import { usePWAInstall } from "@/lib/pwa";

// ==========================================
// 1. Content (ภาษาไทย)
// ==========================================
const t = {
  heroTitle1: "การพัฒนาตัวเองที่สนุกกว่าที่คิด",
  heroTitle2: "ด้วย",
  heroSub: "เครื่องมือวิเคราะห์และอัพสกิล Level Up สู่เวอร์ชันที่เก่งกว่าเดิม",
  authWelcome: "สวัสดี, คุณ",
  authSub: "พร้อมที่จะขยับขีดจำกัดของตัวเองในวันนี้หรือยัง?",
  proMember: "Pro Member",
  dashboardBtn: "เข้าสู่ระบบ Dashboard",
  logout: "Logout",
  toolsHeader: "📌 เครื่องมือเฉพาะสำหรับคุณ",
  toolsDetailBtn: "รายละเอียด",
  pitchBeta: "Early Access (Free Beta)",
  pitchTitle1: "ปลดล็อก Dashboard",
  pitchTitle2: "เพื่อเก็บสถิติส่วนตัว",
  pitchList: [
    "Hub รวมทุกผลทดสอบตัวตนในที่เดียว",
    "สะสม XP อัพ Level ให้ตัวเอง",
    "Smart Insight เจาะลึกจุดอัพสกิล",
    "AI Mentor ช่วยวางแผนระดับโปร"
  ],
  loginGoogle: "เข้าสู่ระบบด้วย Google",
  loginRemark: "* เข้าร่วมฟรีในช่วง Beta พร้อมใช้ Dashboard สุด Exclusive",
  footer: "© 2026 อัพสกิลกับฟุ้ย",
  tools: {
    wheel: { name: "Wheel Of Life", desc: "เช็กสมดุลชีวิต 8 ด้าน พร้อม AI วางแผน 7 วัน", gimmick: "500K+ Views บน Social" },
    disc: { name: "Who Are You ?", desc: "ค้นหาตัวตนและการสื่อสารในที่ทำงานผ่าน DISC", gimmick: "ผู้ใช้งาน 120k+ คน" },
    money: { name: "Money Avatar", desc: "ถอดรหัสสไตล์การเงินของคุณ", gimmick: "วิเคราะห์เจาะลึกระดับ PRO" },
    quotes: { name: "คมสัดสัด", desc: "สร้างคำคมฮีลใจเฉพาะคุณ", gimmick: "Vibe ดี โดนใจ Gen Z" }
  }
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const PRICE_IDS = {
  monthly: "price_1TLp5jPpEmfCgSDJz9g1hugr", // ใส่รหัสจาก Stripe Dashboard
  yearly: "price_1TLpCUPpEmfCgSDJCYozJS15"    // ใส่รหัสจาก Stripe Dashboard
};

export default function Home() {
  const { deferredPrompt, isIOS, handleInstallClick } = usePWAInstall();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [billingPlan, setBillingPlan] = useState<'monthly' | 'yearly'>('monthly');

  // --- 🧭 App Guide State ---
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  const totalGuideSteps = 6;

  const handleUpgrade = async () => {
    if (!user) return alert("Please login first");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          priceId: PRICE_IDS[billingPlan]
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. เก็บสถานะ Auth ตามปกติ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 2. แยก Logic การ Scroll มาไว้ตรงนี้ (Watch เฉพาะตอน user เปลี่ยนจาก null เป็นมีค่า)
  useEffect(() => {
    if (user) {
      // ใช้ requestAnimationFrame เพื่อรอให้ DOM เรนเดอร์ Dashboard เสร็จก่อนค่อยเลื่อน
      // จะช่วยลดอาการหน้าจอกระตุกได้ครับ
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [user]); // ทำงานเฉพาะเมื่อตัวแปร user มีการเปลี่ยนแปลง

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

      // ✅ เพิ่มบรรทัดนี้ครับ: เพื่อให้หน้าเด้งกลับไปบนสุดแบบลื่นๆ
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed:", error);
      }
    }
  };
  const handleLogout = () => signOut(auth);

  // ==========================================
  // 2. จัดการข้อมูล Tools
  // ==========================================
  const getToolsData = () => [
    {
      id: "wheel", name: t.tools.wheel.name, desc: t.tools.wheel.desc, gimmick: t.tools.wheel.gimmick,
      icon: <PieChart size={28} className="text-red-600" />, path: "/tools/wheel-of-life", color: "bg-red-50 border-red-200",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm group-hover:bg-red-100 group-hover:text-red-900 transition-colors duration-300">
          <Flame size={12} className="text-red-500 group-hover:text-red-900 transition-colors animate-pulse" />
          <span>{t.tools.wheel.gimmick}</span>
        </div>
      )
    },
    {
      id: "disc", name: t.tools.disc.name, desc: t.tools.disc.desc, gimmick: t.tools.disc.gimmick,
      icon: <Users size={28} className="text-blue-600" />, path: "/tools/disc", color: "bg-blue-50 border-blue-200",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors duration-300">
          <Users size={12} className="text-blue-500 group-hover:text-blue-900 transition-colors" />
          <span>{t.tools.disc.gimmick}</span>
        </div>
      )
    },
    {
      id: "money", name: t.tools.money.name, desc: t.tools.money.desc, gimmick: t.tools.money.gimmick,
      icon: <Wallet size={28} className="text-amber-600" />, path: "/tools/money-avatar", color: "bg-amber-50 border-amber-200",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 shadow-sm group-hover:bg-amber-100 group-hover:text-amber-950 transition-colors duration-300">
          <BrainCircuit size={12} className="text-amber-500 group-hover:text-amber-950 transition-colors" />
          <span>{t.tools.money.gimmick}</span>
        </div>
      )
    },
    {
      id: "library-souls", name: "Library Of Souls", desc: "สไตล์การอ่านสะท้อนตัวตน 16 รูปแบบ", gimmick: "ค้นหา Reading Soul",
      icon: <BookOpen size={24} className="text-emerald-600" />,
      path: "/tools/library-of-souls", color: "bg-emerald-50/50 border-emerald-100",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors duration-300">
          <BookOpen size={12} className="text-emerald-500" />
          <span>ค้นหา Reading Soul</span>
        </div>
      )
    },
    {
      id: "quotes", name: t.tools.quotes.name, desc: t.tools.quotes.desc, gimmick: t.tools.quotes.gimmick,
      icon: <Quote size={28} className="text-purple-600" />, path: "/tools/khomsatsat", color: "bg-purple-50 border-purple-200",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest border border-purple-100 shadow-sm group-hover:bg-purple-100 group-hover:text-purple-900 transition-colors duration-300">
          <Sparkles size={12} className="text-purple-500 group-hover:text-purple-900 transition-colors" />
          <span>{t.tools.quotes.gimmick}</span>
        </div>
      )
    },
    {
      id: "ai-mentor", name: "AI MENTOR", desc: "ที่ปรึกษาพัฒนาตัวเองส่วนตัวระดับโปร", gimmick: "Personalized วิเคราะห์ตัวคุณ",
      icon: <MessageSquareMore size={28} className="text-slate-600" />, path: "/tools/ai-mentor", color: "bg-slate-100 border-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
      gimmickUI: (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-200 text-slate-700 rounded-full text-[10px] font-black tracking-widest border border-slate-300 shadow-sm group-hover:from-slate-300 group-hover:to-zinc-200 group-hover:text-slate-900 transition-all duration-300">
          <Zap size={12} className="text-slate-500 group-hover:text-slate-900 transition-colors animate-pulse" />
          <span>PRO MENTORSHIP</span>
        </div>
      )
    },

  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-800" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-6 font-sans">

      {/* --- 1. Hero Section --- */}
      {!user ? (
        <section className="relative py-10 sm:py-12 md:py-16 mb-10 px-6 lg:px-12 mt-2 sm:mt-4 z-0">
          {/* Box Background and Gradient contained via absolute inset */}
          <div className="absolute inset-0 bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden -z-10">
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">

            {/* Left side: Typography & CTA */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-20 w-full mb-0">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex w-24 h-24 sm:w-28 sm:h-28 p-5 bg-red-50 rounded-[2rem] shadow-inner border border-red-100 items-center justify-center relative mb-8"
              >
                <img
                  src="/logo-full.png"
                  alt="Idea Logo"
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex flex-col md:items-start items-center"
              >
                <div className="mb-4 flex flex-col md:items-start items-center gap-3">
                  <span className="text-red-700 font-extrabold bg-red-50/80 px-4 py-2 rounded-2xl relative inline-flex items-center gap-2 border border-red-100 shadow-sm text-sm sm:text-base tracking-widest uppercase">
                    UPSKILL EVERYDAY
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" style={{ transform: 'translate(40%, -40%)' }}></div>
                  </span>

                  {/* 📱 PWA Install Button (New Location) */}
                  {(deferredPrompt || isIOS) && (
                    <motion.button
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={isIOS ? undefined : handleInstallClick}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all group border border-white/10"
                    >
                      <Download size={12} className="text-blue-400 group-hover:translate-y-0.5 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {isIOS ? "App Download (Share > Home)" : "App Download"}
                      </span>
                    </motion.button>
                  )}
                </div>
                <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black mb-6 text-slate-900 leading-[1.2] md:leading-[1.15] tracking-tight">
                  <span className="whitespace-nowrap">การพัฒนาตัวเอง</span><br />
                  สนุกกว่าที่คิด
                </h1>
                <p className="text-slate-500 mb-0 md:mb-8 max-w-lg text-base sm:text-lg font-medium leading-relaxed px-2 md:px-0">
                  เครื่องมือวิเคราะห์และอัพสกิล<br />
                  Level Up สู่เวอร์ชันที่เก่งกว่าเดิม
                </p>
              </motion.div>
            </div>

            {/* Right side: Avatar image */}
            <div className="flex-1 flex flex-col justify-end items-center md:items-end relative w-full -mx-4 md:mx-0 md:-mr-6 lg:-mr-12 xl:-mr-16 -mt-10 -mb-4 sm:-mt-16 sm:-mb-6 md:-mt-8 md:-mb-2">

              <div className="relative w-full flex justify-center md:justify-end">

                <motion.img
                  initial={{ opacity: 0, scale: 0.85, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.1 }}
                  src="/avatar.png"
                  alt="Avatar Graphic"
                  className="relative z-10 w-[115%] sm:w-[450px] md:w-[400px] lg:w-[450px] xl:w-[500px] max-w-[130%] md:max-w-[150%] lg:max-w-[150%] h-auto object-cover object-bottom hover:-translate-y-2 hover:scale-105 transition-all duration-500 origin-bottom md:origin-bottom-right pointer-events-auto"
                />
              </div>

              {/* Login Remark under Avatar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative z-20 mt-1 md:mt-0 px-4 md:px-0 md:pr-10 lg:pr-20 xl:pr-24 text-center md:text-right w-full flex justify-center md:justify-end"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-left relative z-30">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-tight leading-snug">
                    เพื่อเก็บข้อมูลและสร้าง Avatar ของคุณ <br className="md:hidden" />
                    กรุณา <b>Login ด้วย Google</b> ก่อนเข้าใช้งาน
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </section>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col md:flex-row justify-between items-center bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 mb-12 gap-8 overflow-hidden group"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-red-500/10 transition-colors duration-700" />

          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 p-4 sm:p-2 text-slate-400 hover:text-red-600 active:text-red-500 transition-all text-[11px] font-black uppercase tracking-[0.2em] group/logout active:scale-95"
          >
            <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 z-10 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-500" />
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile"
                className="relative w-24 h-24 rounded-full border-[6px] border-white shadow-xl object-cover"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                  {t.proMember}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.authWelcome} <span className="text-red-800">{user.displayName?.split(' ')[0]}</span> 🚀
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {t.authSub}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-56 z-10 md:mt-6">
            <Link href="/dashboard" className="w-full group/btn">
              <button className="relative w-full overflow-hidden bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <LayoutDashboard size={20} className="group-hover/btn:rotate-12 transition-transform" />
                {t.dashboardBtn}
              </button>
            </Link>
          </div>

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

      {/* --- 2. Tools Grid --- */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          {t.toolsHeader}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getToolsData().map((tool) => (
            <Link key={tool.id} href={`${tool.path}/info`} className="block h-full group">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex items-center gap-4 cursor-pointer hover:-translate-y-1 h-full relative overflow-hidden">

                <div className={`p-4 rounded-2xl border ${tool.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shrink-0 self-start`}>
                  {tool.icon}
                </div>

                <div className="flex-1 flex flex-col h-full justify-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors">{tool.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed break-words text-pretty pr-2">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="mt-auto pt-3">
                    {tool.gimmickUI}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1 text-slate-300 group-hover:text-red-500 transition-colors shrink-0">
                  <span className="text-[10px] sm:text-[12px] font-bold group-hover:-translate-x-1 transition-transform duration-300">
                    {t.toolsDetailBtn}
                  </span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- 3. Pitch Section (สำหรับคนที่ยังไม่ Login) --- */}
      {!user && (
        <section className="mb-12 max-w-7xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[550px] flex items-center shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-80" />

          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-8 sm:p-20 items-center">

            <div className="max-w-md mx-auto md:mx-0 text-left">
              <span className="text-amber-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-4 block">
                {t.pitchBeta}
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-[1.1]">
                {t.pitchTitle1} <br />
                <span className="text-blue-400">{t.pitchTitle2}</span>
              </h2>

              <ul className="space-y-4 mb-10">
                {t.pitchList.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <div className="bg-amber-400/10 p-1.5 rounded-lg border border-amber-400/20 shrink-0">
                      <Star size={16} className="text-amber-400 fill-amber-400/20" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-start gap-4 w-full">
                <button onClick={handleLogin} className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group">
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  {t.loginGoogle}
                </button>

                <p className="text-[10px] text-slate-500 font-medium ml-2 mb-2">
                  {t.loginRemark}
                </p>

                <div className="w-full max-w-sm pt-5 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privacy & Security</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-bold tracking-tight">
                    Personalized insights only. Industry-standard security. <br className="hidden sm:block" />
                    <span className="text-slate-400">Zero individual data sharing. Anonymous aggregate trends only.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Decorative Mockup */}
            <div className="hidden md:flex justify-end relative h-full items-center">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-80 h-[520px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border border-white/10 p-4 shadow-2xl relative rotate-3 hover:rotate-1 transition-transform duration-500"
              >
                <div className="w-full h-full bg-slate-950/50 rounded-[2.5rem] p-6 flex flex-col gap-5 overflow-hidden border border-white/5 relative">
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

                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3 z-20"
                >
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Zap size={20} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">7-Day Plan</div>
                    <div className="text-[11px] text-white font-black">AI Ready! ⚡️</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs text-slate-400 font-medium">
        {t.footer}
      </p>

      {/* --- Upgrade Modal --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpgradeModal(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-[360px] bg-slate-900/90 border border-white/10 rounded-[2.5rem] p-1 shadow-[0_0_50px_-12px_rgba(245,158,11,0.25)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="relative p-7 text-center">
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full" />
                <div className="relative w-full h-full bg-slate-800 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Zap size={30} className="text-amber-400 fill-amber-400/20" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                PRO ACCESS
              </h2>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                Elevate Your Journey
              </p>

              <div className="flex bg-slate-950/50 p-1 rounded-2xl mb-8 border border-white/5">
                <button
                  onClick={() => setBillingPlan('monthly')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 ${billingPlan === 'monthly'
                    ? 'bg-slate-800 text-amber-400 shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  MONTHLY
                </button>
                <button
                  onClick={() => setBillingPlan('yearly')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 relative ${billingPlan === 'yearly'
                    ? 'bg-slate-800 text-amber-400 shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  YEARLY
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black border border-slate-900">
                    -18%
                  </div>
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-center gap-1 leading-none">
                  <span className="text-4xl font-black text-white">
                    {billingPlan === 'monthly' ? '$5' : '$49'}
                  </span>
                  <span className="text-slate-500 font-bold text-sm self-end pb-1">
                    {billingPlan === 'monthly' ? '/mo' : '/year'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
              >
                Unleash Pro Potential
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="mt-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Maybe Later
              </button>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-6">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Full Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={12} className="text-amber-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Pro Status</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>

    {/* --- 🧭 Floating App Guide Button (Top Right) --- */}
    {!user && (
      <div className="fixed top-24 right-4 sm:top-28 sm:right-6 z-[999]">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.5, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        onClick={() => {
          setGuideStep(1);
          setShowGuide(true);
        }}
        className="relative group flex items-center gap-3 bg-red-900/90 hover:bg-red-800 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-red-700/50 shadow-[0_10px_25px_-5px_rgba(153,27,27,0.4)] transition-all duration-300"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-red-200 uppercase tracking-widest leading-none mb-1">APP GUIDE</span>
          <span className="text-[12px] font-black text-white leading-none">วิธีเล่นแอป</span>
        </div>
        <div className="w-10 h-10 bg-red-950 rounded-xl flex items-center justify-center border border-red-700/30 group-hover:rotate-12 transition-transform">
          <HelpCircle size={20} className="text-red-400" />
        </div>
        
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-all -z-10" />
      </motion.button>
    </div>
    )}

    {/* --- 🎓 App Guide Modal (Fixed to Viewport) --- */}
    <AnimatePresence>
      {showGuide && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGuide(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[440px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header with Visual Icon */}
            <div className={`relative h-44 flex items-center justify-center transition-colors duration-1000 ${
              guideStep === 1 ? 'bg-red-500/10' : 
              guideStep === 2 ? 'bg-blue-500/10' : 
              guideStep === 3 ? 'bg-amber-500/10' : 
              guideStep === 4 ? 'bg-emerald-500/10' : 
              guideStep === 5 ? 'bg-purple-500/10' : 
              'bg-indigo-500/10'
            }`}>
              {/* Animated Background Shapes */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[100px] ${
                    guideStep === 1 ? 'bg-red-500' : guideStep === 2 ? 'bg-blue-500' : guideStep === 3 ? 'bg-amber-500' : guideStep === 4 ? 'bg-emerald-500' : guideStep === 5 ? 'bg-purple-500' : 'bg-indigo-500'
                  } opacity-20`}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
              
              {/* Floating Icon Container */}
              <div className="relative">
                <motion.div
                  key={guideStep}
                  initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-md transition-all duration-700 ${
                    guideStep === 1 ? 'bg-red-600 text-white' : 
                    guideStep === 2 ? 'bg-blue-600 text-white' : 
                    guideStep === 3 ? 'bg-amber-500 text-white' : 
                    guideStep === 4 ? 'bg-emerald-600 text-white' : 
                    guideStep === 5 ? 'bg-purple-600 text-white' : 
                    'bg-white text-slate-900'
                  }`}
                >
                  {guideStep === 1 && <PieChart size={40} strokeWidth={2.5} />}
                  {guideStep === 2 && <Users size={40} strokeWidth={2.5} />}
                  {guideStep === 3 && <Wallet size={40} strokeWidth={2.5} />}
                  {guideStep === 4 && <BookOpen size={40} strokeWidth={2.5} />}
                  {guideStep === 5 && <Quote size={40} strokeWidth={2.5} />}
                  {guideStep === 6 && <Star size={40} strokeWidth={2.5} className="fill-current" />}
                </motion.div>
              </div>

              {/* Close Button - Properly Positioned */}
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm z-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-10 pb-12 pt-2 text-center flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={guideStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  
                  <h3 className="text-3xl font-black text-white mb-5 leading-tight tracking-tight">
                    {guideStep === 1 && "Wheel of Life"}
                    {guideStep === 2 && "DISC (Who are you?)"}
                    {guideStep === 3 && "Money Avatar"}
                    {guideStep === 4 && "Library of Souls"}
                    {guideStep === 5 && "คมสัดสัด (Quotes)"}
                    {guideStep === 6 && "Master Your Growth"}
                  </h3>

                  <p className="text-slate-400 text-[15px] font-medium leading-relaxed mb-10 px-2 max-w-[340px] mx-auto">
                    {guideStep === 1 && "วิเคราะห์ความสมดุลชีวิต 8 ด้านของคุณ พร้อมรับ AI Action Plan 7 วันเพื่อพัฒนาตัวเองแบบก้าวกระโดด!"}
                    {guideStep === 2 && "ค้นหาตัวตนและสไตล์การสื่อสารของคุณผ่านแบบทดสอบ DISC เพื่อความสัมพันธ์และการทำงานที่ราบรื่น"}
                    {guideStep === 3 && "ถอดรหัสพฤติกรรมการใช้เงินของคุณผ่าน Avatar สัตว์ เพื่อวางแผนการเงินที่ฉลาดและเข้ากับไลฟ์สไตล์"}
                    {guideStep === 4 && "สไตล์การอ่านหนังสือสะท้อนตัวตน 16 รูปแบบ ค้นพบ Reading Soul ของคุณว่าตรงกับนักอ่านสายไหน"}
                    {guideStep === 5 && "สร้างคำคมฮีลใจหรือแคปชันสุด Vibe เฉพาะตัวคุณด้วย AI ที่เข้าใจอารมณ์ของคุณที่สุดในตอนนี้"}
                    {guideStep === 6 && "เก็บสถิติ XP, เลเวล, สะสมเหรียญความสำเร็จ และรับ AI Insight ส่วนตัวใน Dashboard สุดพรีเมียม!"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex gap-3 mb-10">
                {Array.from({ length: totalGuideSteps }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-700 ${
                      i + 1 === guideStep 
                        ? 'w-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                        : 'w-2 bg-white/10'
                    }`} 
                  />
                ))}
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  if (guideStep < totalGuideSteps) setGuideStep(prev => prev + 1);
                  else {
                    setShowGuide(false);
                    if (!user) handleLogin();
                  }
                }}
                className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl ${
                  guideStep === totalGuideSteps 
                    ? 'bg-white text-slate-900 hover:bg-slate-50' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-blue-900/20'
                }`}
              >
                {guideStep === totalGuideSteps ? (
                  <>
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        style={{ fill: "#4285F4" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        style={{ fill: "#34A853" }}
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        style={{ fill: "#FBBC05" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        style={{ fill: "#EA4335" }}
                      />
                    </svg>
                    เข้าสู่ระบบด้วย Google
                  </>
                ) : "ถัดไป"}
                <ArrowRight size={18} strokeWidth={3} />
              </button>

              <button 
                onClick={() => setShowGuide(false)}
                className="mt-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2 group"
              >
                <span className="w-8 h-[1px] bg-slate-800 group-hover:w-12 transition-all" />
                SKIP GUIDE
                <span className="w-8 h-[1px] bg-slate-800 group-hover:w-12 transition-all" />
              </button>
            </div>

            {/* Subtle Progress Bar (Bottom) */}
            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(guideStep / totalGuideSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}