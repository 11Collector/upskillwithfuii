"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, ChevronRight, LogOut, Loader2, LayoutDashboard, Star, Flame, BrainCircuit, MessageSquareMore, Sparkles, ShieldCheck, Zap, Award, BookOpen, Download, X, ArrowRight, HelpCircle } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
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
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
};

export default function Home() {
  const { deferredPrompt, isIOS, handleInstallClick } = usePWAInstall();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [onePercentDay, setOnePercentDay] = useState(365);

  useEffect(() => {
    const ua = navigator.userAgent;
    const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|BytedanceWebview|musical_ly|Twitter/i.test(ua);
    setIsInAppBrowser(inApp);
  }, []);

  useEffect(() => {
    document.body.classList.add("bg-polkadot-white");
    return () => {
      document.body.classList.remove("bg-polkadot-white");
    };
  }, []);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [billingPlan, setBillingPlan] = useState<'monthly' | 'yearly'>('monthly');

  const [guideStep, setGuideStep] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const totalGuideSteps = 4;

  const handleUpgrade = async () => {
    if (!user) return alert("Please login first");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
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
      
      // ✅ บันทึกเวลา Login ล่าสุดเสมอ
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-sans">

      {/* --- 1. Hero Section --- */}
      {!user ? (
        <section className="relative py-10 sm:py-12 md:py-16 mb-10 px-6 lg:px-12 mt-2 sm:mt-4 bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] z-0">

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">

            {/* Left side: Typography & CTA */}
            <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left z-20 w-full mb-0">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex w-24 h-24 sm:w-28 sm:h-28 p-5 bg-red-50 rounded-[2rem] shadow-inner border border-red-100 items-center justify-center relative mb-8"
              >
                <Image
                  src="/logo-full.png"
                  alt="Idea Logo"
                  width={112}
                  height={112}
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex flex-col md:items-start items-center w-full min-w-0"
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
                <p className="text-slate-500 mb-0 md:mb-8 max-w-2xl text-sm sm:text-base font-medium leading-relaxed px-4 md:px-0">
                  Personal Growth OS<br className="sm:hidden" /> แพลตฟอร์มพัฒนาตัวเอง<span className="whitespace-nowrap">เฉพาะคุณ</span><br />
                  Level Up สู่เวอร์ชันที่เก่งกว่าเดิม
                </p>

                {/* 3 Value Badges (Unified responsive layout: wrapped in 2 rows on mobile, row on desktop) */}
                <div className="flex flex-row flex-wrap md:flex-nowrap justify-center md:justify-start gap-2.5 mt-6 w-full px-4 md:px-0">
                  {/* Badge 1: Personal Growth Personalized */}
                  <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100/80 rounded-2xl px-2.5 py-1.5 shadow-sm shrink-0 hover:scale-[1.02] transition-transform duration-300">
                    <div className="bg-indigo-500 text-white p-1 rounded-lg shrink-0">
                      <BrainCircuit size={13} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9.5px] font-black uppercase text-indigo-900 tracking-wider">Personalized</span>
                      <span className="text-[8px] font-bold text-indigo-600/80 mt-0.5">วิเคราะห์เจาะลึกเฉพาะตัว</span>
                    </div>
                  </div>

                  {/* Badge 2: Actionable */}
                  <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-100/80 rounded-2xl px-2.5 py-1.5 shadow-sm shrink-0 hover:scale-[1.02] transition-transform duration-300">
                    <div className="bg-amber-500 text-white p-1 rounded-lg shrink-0">
                      <Zap size={13} className="fill-current text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9.5px] font-black uppercase text-amber-950 tracking-wider">Actionable</span>
                      <span className="text-[8px] font-bold text-amber-700 mt-0.5">แผนทำจริงได้ใน 1 วัน</span>
                    </div>
                  </div>

                  {/* Badge 3: Fun */}
                  <div className="flex items-center gap-2 bg-rose-50/70 border border-rose-100/80 rounded-2xl px-2.5 py-1.5 shadow-sm shrink-0 hover:scale-[1.02] transition-transform duration-300">
                    <div className="bg-rose-500 text-white p-1 rounded-lg shrink-0">
                      <Flame size={13} className="fill-current text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9.5px] font-black uppercase text-rose-950 tracking-wider">Fun</span>
                      <span className="text-[8px] font-bold text-rose-600/80 mt-0.5">สะสม XP อัพเลเวล</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side: Avatar image */}
            <div className="flex-1 flex flex-col justify-end items-center md:items-end relative w-full md:mx-0 md:-mr-6 lg:-mr-12 xl:-mr-16 -mt-10 -mb-4 sm:-mt-16 sm:-mb-6 md:-mt-8 md:-mb-2">

              <div className="relative w-full flex justify-center md:justify-end">

                <motion.img
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.1 }}
                  src="/avatar.png"
                  alt="Avatar Graphic"
                  className="relative z-10 w-full max-w-[340px] sm:w-[450px] md:w-[400px] lg:w-[450px] xl:w-[500px] sm:max-w-none h-auto object-cover object-bottom hover:-translate-y-2 hover:scale-105 transition-all duration-500 origin-bottom md:origin-bottom-right pointer-events-auto"
                />
              </div>

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
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile"
                width={96}
                height={96}
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

      {/* --- 1.5. Interactive 1% Everyday Section --- */}
      {!user && (() => {
        const improveVal = Math.pow(1.01, onePercentDay);
        const declineVal = Math.pow(0.99, onePercentDay);
        const generatePath = (base: number) => {
          const points = [];
          for (let d = 0; d <= 365; d += 10) {
            const val = Math.pow(base, d);
            const clampedVal = Math.min(val, 40);
            const x = 30 + (d / 365) * 280;
            const y = 185 - (clampedVal / 40) * 165;
            points.push(`${x},${y}`);
          }
          return `M ${points.join(" L ")}`;
        };

        return (
          <section className="mb-12 relative overflow-hidden bg-slate-900 text-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Glow Effects */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.25em] bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    THE 1% RULE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2.5">
                    พลังของการเก่งขึ้นวันละ 1%
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
                    การพัฒนาตัวเองแค่วันละนิด สะสมกันไปเรื่อยๆ จะสร้างผลลัพธ์มหาศาล
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 px-4 py-2 rounded-2xl self-stretch md:self-auto justify-center shadow-inner">
                  <span className="text-xs text-slate-400 font-bold">เป้าหมาย:</span>
                  <span className="text-sm text-amber-400 font-black">{onePercentDay} วัน</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Column: Slider and Metrics */}
                <div className="md:col-span-6 space-y-6 order-2 md:order-1">
                  {/* Interactive Slider */}
                  <div className="space-y-3 bg-slate-950/40 border border-slate-800/50 rounded-3xl p-5">
                    <div className="flex justify-between text-[10px] text-slate-500 font-black tracking-wider">
                      <span>เริ่มต้น</span>
                      <span>ครึ่งปี (180 วัน)</span>
                      <span>ครบปี (365 วัน)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="365"
                      value={onePercentDay}
                      onChange={(e) => setOnePercentDay(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
                    />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-500 font-bold">เลื่อนเพื่อสลับวันและเห็นผลคูณสะสม</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setOnePercentDay(30)} 
                          className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${onePercentDay === 30 ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800'}`}
                        >
                          30 วัน
                        </button>
                        <button 
                          onClick={() => setOnePercentDay(180)} 
                          className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${onePercentDay === 180 ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800'}`}
                        >
                          180 วัน
                        </button>
                        <button 
                          onClick={() => setOnePercentDay(365)} 
                          className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${onePercentDay === 365 ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800'}`}
                        >
                          365 วัน
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Path Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Improvement Card */}
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">เก่งขึ้นวันละ 1%</span>
                        <span className="text-[9px] text-slate-500 font-mono">1.01^{onePercentDay}</span>
                      </div>
                      <div className="my-1.5">
                        <span className="text-3xl font-black text-emerald-400 tracking-tight">
                          {improveVal.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 font-bold ml-1">เท่า</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 mt-1">
                        {improveVal >= 37.0 
                          ? "ศักยภาพก้าวกระโดดมหาศาล! 🚀" 
                          : improveVal >= 5.0 
                            ? "ศักยภาพงอกเงยอย่างเห็นได้ชัด" 
                            : improveVal >= 1.5 
                              ? "เริ่มเห็นพัฒนาการเป็นรูปธรรม" 
                              : "เห็นพัฒนาการก้าวสั้นๆ"}
                      </p>
                    </div>

                    {/* Decline Card */}
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase text-rose-400 tracking-wider">ถดถอยวันละ 1%</span>
                        <span className="text-[9px] text-slate-500 font-mono">0.99^{onePercentDay}</span>
                      </div>
                      <div className="my-1.5">
                        <span className="text-3xl font-black text-rose-400 tracking-tight">
                          {declineVal.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 font-bold ml-1">เท่า</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 mt-1">
                        {declineVal <= 0.03 
                          ? "ศักยภาพดิ่งลงเกือบศูนย์ 🥀" 
                          : declineVal <= 0.25 
                            ? "ศักยภาพถดถอยอย่างมีนัยสำคัญ" 
                            : declineVal <= 0.75 
                              ? "ทักษะเดิมเริ่มจางหายไปเยอะ" 
                              : "แทบไม่เห็นความแตกต่าง"}
                      </p>
                    </div>
                  </div>

                  {/* Multiplier Comparison Banner */}
                  <div className="bg-gradient-to-r from-red-600/10 via-purple-600/10 to-indigo-600/10 border border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">แก๊ปความแตกต่าง</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-200">
                        สองทางเลือก ห่างกันมหาศาลถึง
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                        {(improveVal / Math.max(declineVal, 0.001)).toFixed(0)}
                      </span>
                      <span className="text-sm font-black text-amber-400 ml-1">เท่า!</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Custom SVG Graph */}
                <div className="md:col-span-6 flex flex-col justify-center items-center order-1 md:order-2">
                  <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-inner">
                    {/* SVG Graph */}
                    <svg viewBox="0 0 320 220" className="w-full h-auto overflow-visible">
                      {/* Grid Lines */}
                      <line x1="30" y1="20" x2="310" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="30" y1="61.25" x2="310" y2="61.25" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="30" y1="102.5" x2="310" y2="102.5" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="30" y1="143.75" x2="310" y2="143.75" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                      
                      {/* Y-Axis Labels */}
                      <text x="24" y="23" fill="#475569" textAnchor="end" className="text-[8px] font-mono font-semibold">40</text>
                      <text x="24" y="64" fill="#475569" textAnchor="end" className="text-[8px] font-mono font-semibold">30</text>
                      <text x="24" y="105" fill="#475569" textAnchor="end" className="text-[8px] font-mono font-semibold">20</text>
                      <text x="24" y="146" fill="#475569" textAnchor="end" className="text-[8px] font-mono font-semibold">10</text>
                      <text x="24" y="183" fill="#475569" textAnchor="end" className="text-[8px] font-mono font-semibold">1</text>
                      
                      {/* Baseline (1.0) */}
                      <line 
                        x1="30" 
                        y1="180.875" 
                        x2="310" 
                        y2="180.875" 
                        stroke="#475569" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                        opacity="0.8"
                      />

                      {/* Decline Path (0.99) */}
                      <path 
                        d={generatePath(0.99)} 
                        fill="none" 
                        stroke="url(#declineGradient)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />

                      {/* Improvement Path (1.01) */}
                      <path 
                        d={generatePath(1.01)} 
                        fill="none" 
                        stroke="url(#improveGradient)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />

                      {/* Time vertical indicator line */}
                      <line
                        x1={30 + (onePercentDay / 365) * 280}
                        y1="20"
                        x2={30 + (onePercentDay / 365) * 280}
                        y2="185"
                        stroke="#475569"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.8"
                      />

                      {/* Glow/Ping circle around current position of Improvement path */}
                      <circle
                        cx={30 + (onePercentDay / 365) * 280}
                        cy={185 - (Math.min(improveVal, 40) / 40) * 165}
                        r="6"
                        className="fill-emerald-400/30 stroke-emerald-400 stroke-1 animate-pulse"
                      />
                      <circle
                        cx={30 + (onePercentDay / 365) * 280}
                        cy={185 - (Math.min(improveVal, 40) / 40) * 165}
                        r="3"
                        className="fill-emerald-400"
                      />

                      {/* Circle around current position of Decline path */}
                      <circle
                        cx={30 + (onePercentDay / 365) * 280}
                        cy={185 - (Math.min(declineVal, 40) / 40) * 165}
                        r="5"
                        className="fill-rose-500/30 stroke-rose-500 stroke-1"
                      />
                      <circle
                        cx={30 + (onePercentDay / 365) * 280}
                        cy={185 - (Math.min(declineVal, 40) / 40) * 165}
                        r="2.5"
                        className="fill-rose-500"
                      />

                      {/* Active Day moving label at the top of vertical line */}
                      <text
                        x={30 + (onePercentDay / 365) * 280}
                        y="12"
                        fill="#fbbf24"
                        stroke="#020617"
                        strokeWidth="3"
                        paintOrder="stroke"
                        strokeLinejoin="round"
                        textAnchor="middle"
                        className="text-[9px] font-black font-mono"
                      >
                        วันที่ {onePercentDay}
                      </text>

                      {/* Axis Ticks */}
                      <line x1="30" y1="185" x2="30" y2="190" stroke="#475569" strokeWidth="1" />
                      <line x1="310" y1="185" x2="310" y2="190" stroke="#475569" strokeWidth="1" />

                      {/* X-Axis Labels inside SVG */}
                      <text x="30" y="212" fill="#64748b" textAnchor="middle" className="text-[8px] font-mono font-bold">Day 0</text>
                      <text x="310" y="212" fill="#64748b" textAnchor="middle" className="text-[8px] font-mono font-bold">Day 365</text>

                      {/* Gradients definitions */}
                      <defs>
                        <linearGradient id="improveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <linearGradient id="declineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

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
                {isInAppBrowser ? (
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 flex flex-col gap-2">
                    <p className="text-amber-400 text-sm font-black">⚠️ เปิดในเบราว์เซอร์ก่อนนะครับ</p>
                    <p className="text-slate-400 text-xs leading-relaxed">Google ไม่อนุญาตให้ Login ผ่าน in-app browser (Messenger, LINE ฯลฯ)<br />กรุณากด <strong className="text-white">เปิดใน Chrome หรือ Safari</strong> ก่อนแล้วค่อย Login ครับ</p>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group">
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    {t.loginGoogle}
                  </button>
                )}

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
                  transition={{ delay: 2.2, duration: 0.6, type: "spring", bounce: 0.6 }}
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

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-12 bg-white/10 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 z-30"
                >
                  <Zap size={18} className="text-amber-400 fill-current" />
                  <span className="text-white font-black text-sm">+150 XP</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <p onClick={() => setShowStoryModal(true)} className="mt-12 text-center text-xs text-slate-400 hover:text-indigo-600 cursor-pointer font-bold tracking-wide transition-colors">
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
      <div className="fixed top-24 right-4 sm:top-28 sm:right-6 z-[999] group/floating">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 rounded-full blur-md opacity-40 group-hover/floating:opacity-100 group-hover/floating:scale-110 transition-all duration-700 animate-pulse" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={() => {
            setGuideStep(1);
            setShowGuide(true);
          }}
          className="relative flex items-center gap-3 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xl px-2 py-2 pr-5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all overflow-hidden group"
        >
          {/* Animated Glass Shine */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-inner group-hover:rotate-180 transition-transform duration-700">
            <Sparkles size={16} className="text-white drop-shadow-md" />
          </div>
          <div className="flex flex-col items-start pr-1">
            <span className="text-[8px] sm:text-[9px] font-black bg-gradient-to-r from-pink-300 to-violet-300 bg-clip-text text-transparent uppercase tracking-[0.3em] leading-none mb-1">
              NEW HERE?
            </span>
            <span className="text-[11px] sm:text-[12px] font-black text-white leading-none tracking-wide">
              คู่มือเริ่มต้น 🚀
            </span>
          </div>
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
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            className="relative w-full max-w-[400px] bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* --- Dynamic Glowing Header --- */}
            <div className="relative h-44 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-slate-950/40 z-10" />
              
              {/* Background Gradients per Step */}
              <motion.div
                className="absolute inset-0 z-0 opacity-90"
                animate={{
                  background: guideStep === 1 ? 'radial-gradient(120% 120% at 50% 0%, #9f1239 0%, #4c0519 100%)' :
                              guideStep === 2 ? 'radial-gradient(120% 120% at 50% 0%, #1d4ed8 0%, #0f172a 100%)' :
                              guideStep === 3 ? 'radial-gradient(120% 120% at 50% 0%, #6b21a8 0%, #2e1065 100%)' :
                              'radial-gradient(120% 120% at 50% 0%, #3f3f46 0%, #09090b 100%)'
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0" />

              {/* Floating Icon Container */}
              <motion.div
                key={`icon-${guideStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative z-20"
              >
                {guideStep === 1 ? (
                  <Image
                    src="/avatars/rookie-static.png"
                    alt="Rookie Avatar"
                    width={140}
                    height={140}
                    className="drop-shadow-2xl"
                  />
                ) : guideStep === 2 ? (
                  <div className="flex gap-2.5 items-center">
                    {[
                      { icon: <PieChart size={20} className="text-red-400" />, label: "Wheel" },
                      { icon: <Users size={20} className="text-blue-400" />, label: "DISC" },
                      { icon: <Wallet size={20} className="text-amber-400" />, label: "Money" },
                      { icon: <BookOpen size={20} className="text-emerald-400" />, label: "Library" },
                      { icon: <Quote size={20} className="text-purple-400" />, label: "คมสัดสัด" },
                    ].map((t, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                          {t.icon}
                        </div>
                        <span className="text-[8px] font-bold text-white/50 tracking-tight">{t.label}</span>
                      </div>
                    ))}
                  </div>
                ) : guideStep === 3 ? (
                  <div className="relative w-44 h-36">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 110 90" preserveAspectRatio="none">
                      {[
                        { path: "M 55 10 L 55 45", color: "#ef4444", dur: "2s" },
                        { path: "M 100 25 L 55 45", color: "#3b82f6", dur: "2.5s" },
                        { path: "M 90 80 L 55 45", color: "#f59e0b", dur: "3s" },
                        { path: "M 20 80 L 55 45", color: "#10b981", dur: "2.2s" },
                        { path: "M 10 25 L 55 45", color: "#a855f7", dur: "2.8s" },
                      ].map((p, i) => (
                        <g key={i}>
                          <path d={p.path} stroke="#475569" strokeWidth="0.5" strokeDasharray="1 2" fill="none" />
                          <path d={p.path} stroke={p.color} strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6">
                            <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite" />
                          </path>
                          <circle r="1.8" fill={p.color}>
                            <animateMotion dur={p.dur} repeatCount="indefinite" path={p.path} />
                            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur={p.dur} repeatCount="indefinite" />
                          </circle>
                        </g>
                      ))}
                    </svg>
                    {/* Center AI node */}
                    <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-zinc-300 rounded-xl rotate-3 flex items-center justify-center shadow-lg border border-white">
                          <MessageSquareMore size={20} className="text-slate-700" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-slate-900 text-white p-[3px] rounded-full shadow-md border border-white/20 animate-bounce">
                          <Sparkles size={8} />
                        </div>
                      </div>
                    </div>
                    {/* Tool nodes — inset จากขอบเพื่อไม่ให้ถูกตัด */}
                    {[
                      { cls: "top-[0%] left-1/2 -translate-x-1/2", icon: <PieChart size={11} className="text-red-500" /> },
                      { cls: "top-[18%] right-[2%]",                icon: <Users size={11} className="text-blue-500" /> },
                      { cls: "bottom-[2%] right-[12%]",             icon: <Wallet size={11} className="text-amber-500" /> },
                      { cls: "bottom-[2%] left-[12%]",              icon: <BookOpen size={11} className="text-emerald-500" /> },
                      { cls: "top-[18%] left-[2%]",                 icon: <Quote size={11} className="text-purple-500" /> },
                    ].map((n, i) => (
                      <div key={i} className={`absolute z-10 ${n.cls}`}>
                        <div className="w-7 h-7 bg-white/15 border border-white/25 rounded-lg flex items-center justify-center">
                          {n.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <Star size={44} strokeWidth={2} className="fill-amber-300 text-amber-300" />
                  </div>
                )}
              </motion.div>

              {/* Close Button */}
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-6 right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 hover:scale-105 active:scale-95 transition-all backdrop-blur-md z-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-7 pb-7 pt-6 text-center flex flex-col items-center relative z-20 flex-1">

              {/* Middle: title + description — flex-1 vertically centered */}
              <div className="flex-1 flex flex-col items-center justify-center w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={guideStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <h3 className="text-[22px] font-black text-white mb-2.5 leading-tight tracking-tight">
                    {guideStep === 1 && "แพลตฟอร์มวิเคราะห์ตัวตนที่ เข้าใจคุณ"}
                    {guideStep === 2 && "แบบประเมินของเรา"}
                    {guideStep === 3 && "ให้ AI รู้จักคุณมากที่สุด"}
                    {guideStep === 4 && "พร้อมเริ่มต้นแล้ว?"}
                  </h3>

                  {guideStep === 1 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      ผ่านแบบประเมินที่ออกแบบมาเพื่อคุณโดยเฉพาะ
                    </p>
                  )}
                  {guideStep === 2 && (
                    <div className="w-full max-w-[280px] mx-auto space-y-2 text-left mt-1">
                      {[
                        { color: "bg-red-500",     name: "Wheel of Life",    desc: "สมดุลชีวิต 8 ด้าน + AI แผน 7 วัน" },
                        { color: "bg-blue-500",    name: "DISC",             desc: "ค้นหาตัวตนและสไตล์การสื่อสาร" },
                        { color: "bg-amber-500",   name: "Money Avatar",     desc: "ถอดรหัสพฤติกรรมการเงินของคุณ" },
                        { color: "bg-emerald-500", name: "Library of Souls", desc: "สไตล์การอ่าน สะท้อนตัวตน 16 แบบ" },
                        { color: "bg-purple-500",  name: "คมสัดสัด",         desc: "สร้างคำคมฮีลใจเฉพาะตัวด้วย AI" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                          <span className="text-white font-bold text-[12px] shrink-0">{item.name}</span>
                          <span className="text-slate-500 text-[11px] truncate">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {guideStep === 3 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      ยิ่งทำแบบประเมิน<span className="text-white font-semibold">ครบมากเท่าไหร่</span>{" "}
                      AI Mentor ยิ่งรู้จักนิสัยและเป้าหมายของคุณ{" "}
                      เพื่อให้คำแนะนำที่<span className="text-white font-semibold">แม่นที่สุด</span>
                    </p>
                  )}
                  {guideStep === 4 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      <span className="text-white font-semibold">Login ฟรีด้วย Google</span>{" "}
                      บันทึกผลประเมิน สะสม XP อัพ Level และให้ AI ดูแลการพัฒนาตัวเองของคุณ
                      <span className="text-white font-semibold"> แบบส่วนตัวทุกวัน</span>
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              </div>

              {/* Bottom: dots + button */}
              <div className="w-full flex flex-col items-center mt-5">
              {/* Progress Dots */}
              <div className="flex gap-2 mb-3 items-center justify-center">
                {Array.from({ length: totalGuideSteps }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-full transition-all duration-500 ${
                      i + 1 === guideStep 
                        ? 'h-2.5 w-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                        : 'h-2 w-2 bg-white/20'
                    }`} 
                  />
                ))}
              </div>

              {/* Action Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (guideStep < totalGuideSteps) {
                    setGuideStep(prev => prev + 1);
                  } else {
                    setShowGuide(false);
                    if (!user) handleLogin();
                  }
                }}
                className={`relative w-full py-3.5 rounded-full font-black text-xs tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-3 shadow-xl overflow-hidden group/btn ${
                  guideStep === totalGuideSteps 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
                
                <span className="relative z-10 flex items-center gap-2">
                  {guideStep === totalGuideSteps ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 48 48" className="mr-1 drop-shadow-sm">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-black">
                        เข้าสู่ระบบฟรี
                      </span>
                    </>
                  ) : guideStep === 3 ? "เข้าใจแล้ว ต่อไปเลย" : "ถัดไป"}
                </span>
                
                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${guideStep === totalGuideSteps ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  <ArrowRight size={14} strokeWidth={4} />
                </div>
              </motion.button>

              <button
                onClick={() => setShowGuide(false)}
                className="mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
              >
                SKIP
              </button>
              </div>
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

      {/* 💡 Modal: Brand Story (อัพสกิลกับฟุ้ย) */}
      {showStoryModal && (
        <motion.div
          key="story-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto"
          onClick={() => setShowStoryModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative max-w-md w-full max-h-[85vh] flex flex-col bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-red-700/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-red-800/10 blur-[40px] rounded-full pointer-events-none" />

            {/* Scrollable body content area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-3 text-center scrollbar-thin">
              <div className="flex justify-center pt-2">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[2.2rem] overflow-hidden border-2 border-red-500/30 p-1 bg-slate-950/50 shadow-lg shadow-red-500/20 flex items-center justify-center">
                  <img
                    src="/fuii-profile.png"
                    alt="Fuii"
                    className="w-full h-full object-cover rounded-[1.8rem]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLDivElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl" style={{ display: 'none' }}>
                    💡
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  จุดเริ่มต้นของ "อัพสกิลกับฟุ้ย"
                </h3>
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mt-1.5">
                  1% Better Everyday
                </p>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed space-y-4 text-left font-medium bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                <p>
                  ผมเชื่อในการ<span className="text-red-400 font-black">พัฒนาตัวเอง</span> และเชื่อว่าทุกๆ คนเก่งขึ้นได้
                </p>
                <p>
                  เลยทำคอนเทนต์ ทั้งใน <span className="text-white font-semibold">IG, TikTok, X</span> เพื่อส่งต่อเรื่องราวเหล่านี้ผ่านความชอบที่ผมมี ทั้งการเขียน, ธุรกิจ, การพัฒนาตัวเอง และเกม ในชื่อของ <span className="text-red-400 font-bold">"อัพสกิลกับฟุ้ย"</span>
                </p>
                <p>
                  และพอเทคโนโลยี AI เกิดขึ้น เลยได้นำเอา Logic และสกิลที่เรียนจบด้าน <span className="text-white font-semibold">วิศวะคอมฯ</span> มาใช้พัฒนาแอปนี้ขึ้นมา
                </p>
                
                <div className="border-t border-slate-800/80 my-3" />
                
                <p>
                  จนเกิดเป็น <span className="text-red-400 font-black">Upskill Everyday</span> แพลตฟอร์ม <span className="text-white font-bold">Personal Growth OS เฉพาะบุคคล</span> ที่จะช่วยให้พวกเราเก่งขึ้นได้ในทุกๆ วัน ⚡
                </p>
                <p>
                  หวังว่าแอปนี้จะเป็นประโยชน์กับทุกคนนะครับ
                </p>
                <p className="text-slate-400 italic text-center font-bold border-t border-slate-800/80 pt-4 mt-2">
                  "ขอบคุณทุกคนที่มาร่วมอัพสกิลไปด้วยกันนะครับ 🙏"
                  <span className="block text-[11px] text-red-500 uppercase tracking-widest mt-1.5 font-black">— ฟุ้ย</span>
                </p>
              </div>
            </div>

            {/* Action button fixed at the bottom */}
            <button
              onClick={() => setShowStoryModal(false)}
              className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 text-white font-black rounded-2xl shadow-xl hover:from-red-600 hover:to-red-800 transition-all active:scale-95 text-sm uppercase tracking-wider shrink-0 mt-2"
            >
              เติบโตไปด้วยกัน 🌱
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}