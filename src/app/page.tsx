"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PieChart, Users, Wallet, Quote, ChevronRight, LogOut, Loader2, LayoutDashboard, Star, Flame, BrainCircuit, MessageSquareMore, Sparkles, ShieldCheck, Zap, Award, BookOpen, Download, X, ArrowRight, HelpCircle } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
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
    "คุยกับพี่ฟุ้ย ช่วยวางแผนพัฒนาตัวเอง"
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

type ProPlan = "monthly" | "yearly" | "founding_monthly" | "founding_yearly" | "lifetime";

export default function Home() {
  const { deferredPrompt, isIOS, handleInstallClick } = usePWAInstall();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isProLoaded, setIsProLoaded] = useState(false);
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
  const [billingPlan, setBillingPlan] = useState<ProPlan>('monthly');

  const [guideStep, setGuideStep] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const totalGuideSteps = 4;

  const handleUpgrade = async (plan: ProPlan = billingPlan) => {
    if (!user) return alert("Please login first");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถเปิดหน้าชำระเงินได้"));
      }
    } catch (err) {
      console.error(err);
      alert("ระบบชำระเงินขัดข้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  // 1. เก็บสถานะ Auth ตามปกติ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsProLoaded(false);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() || {};
            const subscriptionStatus = data.subscriptionStatus || data.subscription_status || "";
            const subscriptionTier = data.subscriptionTier || data.subscription_tier || "";
            const isPremium =
              data.role === "premium" ||
              subscriptionTier === "pro" ||
              ["active", "trialing"].includes(subscriptionStatus) ||
              Boolean(data.isLifetimeMember);
            setIsPro(isPremium);
          } else {
            setIsPro(false);
          }
        } catch (e) {
          console.error(e);
          setIsPro(false);
        }
        setIsProLoaded(true);
      } else {
        setIsPro(false);
        setIsProLoaded(true);
      }
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
      setIsProLoaded(false);
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      const userRef = doc(db, "users", loggedInUser.uid);
      
      // ✅ บันทึกเวลา Login ล่าสุดเสมอ
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      const userSnap = await getDoc(userRef);

      let isPremium = false;
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          subscription_tier: "free",
          createdAt: serverTimestamp(),
        });
      } else {
        const data = userSnap.data() || {};
        const subscriptionStatus = data.subscriptionStatus || data.subscription_status || "";
        const subscriptionTier = data.subscriptionTier || data.subscription_tier || "";
        isPremium =
          data.role === "premium" ||
          subscriptionTier === "pro" ||
          ["active", "trialing"].includes(subscriptionStatus) ||
          Boolean(data.isLifetimeMember);
      }
      setIsPro(isPremium);
      setIsProLoaded(true);

      // ✅ เพิ่มบรรทัดนี้ครับ: เพื่อให้หน้าเด้งกลับไปบนสุดแบบลื่นๆ
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      setIsProLoaded(true);
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
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm group-hover:bg-red-100 group-hover:text-red-900 transition-colors duration-300">
          <Flame size={12} className="text-red-500 group-hover:text-red-900 transition-colors animate-pulse" />
          <span>{t.tools.wheel.gimmick}</span>
        </div>
      )
    },
    {
      id: "disc", name: t.tools.disc.name, desc: t.tools.disc.desc, gimmick: t.tools.disc.gimmick,
      icon: <Users size={28} className="text-blue-600" />, path: "/tools/disc", color: "bg-blue-50 border-blue-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors duration-300">
          <Users size={12} className="text-blue-500 group-hover:text-blue-900 transition-colors" />
          <span>{t.tools.disc.gimmick}</span>
        </div>
      )
    },
    {
      id: "money", name: t.tools.money.name, desc: t.tools.money.desc, gimmick: t.tools.money.gimmick,
      icon: <Wallet size={28} className="text-amber-600" />, path: "/tools/money-avatar", color: "bg-amber-50 border-amber-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 shadow-sm group-hover:bg-amber-100 group-hover:text-amber-950 transition-colors duration-300">
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
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors duration-300">
          <BookOpen size={12} className="text-emerald-500" />
          <span>ค้นหา Reading Soul</span>
        </div>
      )
    },
    {
      id: "quotes", name: t.tools.quotes.name, desc: t.tools.quotes.desc, gimmick: t.tools.quotes.gimmick,
      icon: <Quote size={28} className="text-purple-600" />, path: "/tools/khomsatsat", color: "bg-purple-50 border-purple-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest border border-purple-100 shadow-sm group-hover:bg-purple-100 group-hover:text-purple-900 transition-colors duration-300">
          <Sparkles size={12} className="text-purple-500 group-hover:text-purple-900 transition-colors" />
          <span>{t.tools.quotes.gimmick}</span>
        </div>
      )
    },
    {
      id: "ai-mentor", name: "คุยกับพี่ฟุ้ย", desc: "ที่ปรึกษาพัฒนาตัวเองส่วนตัวระดับโปร", gimmick: "Personalized วิเคราะห์ตัวคุณ",
      icon: <MessageSquareMore size={28} className="text-slate-600" />, path: "/tools/ai-mentor", color: "bg-slate-100 border-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-200 text-slate-700 rounded-full text-[10px] font-black tracking-widest border border-slate-300 shadow-sm group-hover:from-slate-300 group-hover:to-zinc-200 group-hover:text-slate-900 transition-all duration-300">
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
    <div className="w-full font-sans">

      {/* --- 1. Hero Section --- */}
      {!user ? (
        <section className="relative mb-10 min-h-[720px] w-full overflow-hidden bg-amber-50 md:mb-14 md:min-h-[720px]">
          <picture className="absolute inset-0 block h-full w-full">
            <source media="(max-width: 767px)" srcSet="/WallpaperMobile.png" />
            <img
              src="/Wallpaper.png"
              alt="Upskill Everyday"
              className="absolute inset-0 h-full w-full object-cover object-center md:inset-x-0 md:-top-14 md:h-[calc(100%+3.5rem)] md:object-[33%_top] lg:inset-0 lg:h-full lg:object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/28" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_76%,rgba(15,23,42,0.22),transparent_42%)]" />

          {(deferredPrompt || isIOS) && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={isIOS ? undefined : handleInstallClick}
              className="absolute right-4 top-4 z-30 flex items-center gap-2.5 rounded-full border border-white/55 bg-slate-950/94 px-4 py-2.5 text-white shadow-[0_18px_42px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl ring-1 ring-slate-950/10 transition-all hover:-translate-y-0.5 hover:bg-slate-900 md:right-7 md:top-7 md:px-5 md:py-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/14 text-sky-200 ring-1 ring-sky-200/20">
                <Download size={14} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] md:text-[11px] md:tracking-[0.22em]">
                {isIOS ? "APP DOWNLOAD" : "APP DOWNLOAD"}
              </span>
            </motion.button>
          )}

          <div className="relative z-20 flex min-h-[720px] w-full items-end px-4 pb-6 pt-20 md:min-h-[720px] md:px-12 md:pb-12 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative w-full max-w-[640px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/76 via-orange-50/62 to-amber-100/54 px-5 py-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.20)] backdrop-blur-[38px] sm:px-8 sm:py-8 md:ml-[4vw] md:max-w-[680px] md:rounded-[2.35rem] md:px-10 md:py-9 lg:max-w-[680px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.52),transparent_42%,rgba(255,255,255,0.22)_70%)]" />
              <h1 className="relative max-w-[680px] text-[2.55rem] font-black leading-[0.98] tracking-tight text-[#8b1a0f] drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)] sm:text-6xl md:text-[4rem] lg:text-[4.1rem]">
                การพัฒนาตัวเอง<br />
                <span className="text-amber-50 drop-shadow-[0_3px_14px_rgba(92,46,11,0.42)]">สนุกกว่าที่คิด</span>
              </h1>
              <p className="relative mt-5 max-w-[620px] text-[13px] sm:text-xl font-black leading-relaxed text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.36)]">
                Personal Growth OS ที่พาคุณสำรวจตัวเอง<br />
                สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิม
              </p>

              <div className="relative mt-6 flex overflow-x-auto flex-nowrap gap-1.5 sm:gap-2 no-scrollbar scrollbar-none pb-1 select-none">
                {[
                  { icon: <BrainCircuit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, label: "PERSONALIZED", textClass: "text-[#4c1d95]", accent: "bg-[#8b5cf6]/10 text-[#6d28d9] ring-[#8b5cf6]/20" },
                  { icon: <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, label: "ACTIONABLE", textClass: "text-[#78350f]", accent: "bg-[#f59e0b]/10 text-[#b45309] ring-[#f59e0b]/20" },
                  { icon: <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, label: "XP & LEVEL", textClass: "text-[#0c4a6e]", accent: "bg-[#0ea5e9]/10 text-[#0369a1] ring-[#0ea5e9]/20" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className={`inline-flex h-8 sm:h-10 shrink-0 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/60 bg-white/20 px-3 sm:px-4 text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider sm:tracking-[0.16em] ${badge.textClass} shadow-sm backdrop-blur-md`}
                  >
                    <span className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full ring-1 ${badge.accent}`}>
                      {badge.icon}
                    </span>
                    <span className="whitespace-nowrap">{badge.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-4 mt-6 mb-12 flex max-w-5xl flex-col items-center justify-between gap-8 overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group md:mx-auto md:flex-row md:p-10"
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
                {!isProLoaded ? (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">
                    Loading...
                  </span>
                ) : isPro ? (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                    Pro Member
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                    Starter Member
                  </span>
                )}
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
          <section className="relative mx-4 mb-12 max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-10 md:mx-auto">
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
      <section className="mx-auto mb-12 w-[calc(100%-2rem)] max-w-6xl rounded-[2.5rem] border border-slate-100/80 bg-white/70 px-4 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:w-[calc(100%-4rem)] md:px-7 md:py-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Growth OS Apps</span>
            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-900 md:text-3xl">
              เครื่องมือเฉพาะสำหรับคุณ
            </h2>
          </div>
          <p className="max-w-md text-sm font-bold leading-relaxed text-slate-500 md:text-right">
            เลือกเครื่องมือที่อยากใช้ เพื่ออัพสกิลของคุณ
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {getToolsData().map((tool, index) => (
            <Link key={tool.id} href={`${tool.path}/info`} className="block h-full group">
              <div className="relative flex h-full min-h-[210px] cursor-pointer flex-col overflow-hidden rounded-[1.65rem] border border-white bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] sm:min-h-[230px] sm:rounded-[2rem] sm:p-6 [&_.tool-gimmick]:mt-2 [&_.tool-gimmick]:max-w-full [&_.tool-gimmick]:px-2 [&_.tool-gimmick]:py-1 [&_.tool-gimmick]:text-[8px] [&_.tool-gimmick_span]:whitespace-nowrap sm:[&_.tool-gimmick]:mt-3 sm:[&_.tool-gimmick]:px-3 sm:[&_.tool-gimmick]:py-1.5 sm:[&_.tool-gimmick]:text-[10px]">
                <div className={`absolute inset-0 opacity-70 ${
                  index % 6 === 0 ? "bg-gradient-to-br from-red-50 via-white to-rose-50" :
                  index % 6 === 1 ? "bg-gradient-to-br from-blue-50 via-white to-sky-50" :
                  index % 6 === 2 ? "bg-gradient-to-br from-amber-50 via-white to-orange-50" :
                  index % 6 === 3 ? "bg-gradient-to-br from-emerald-50 via-white to-teal-50" :
                  index % 6 === 4 ? "bg-gradient-to-br from-purple-50 via-white to-fuchsia-50" :
                  "bg-gradient-to-br from-slate-100 via-white to-sky-50"
                }`} />

                <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
                  <div className={`rounded-[1.1rem] border p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] ${tool.color} transition-all duration-300 group-hover:rotate-6 group-hover:scale-105 sm:rounded-[1.35rem] sm:p-4 [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7`}>
                    {tool.icon}
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-300 shadow-sm transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white sm:h-11 sm:w-11">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300 sm:h-5 sm:w-5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto pt-6 sm:pt-8">
                  <h3 className="text-[16px] font-black leading-tight text-slate-950 transition-colors group-hover:text-slate-800 sm:text-xl">{tool.name}</h3>
                  <p className="mt-2 min-h-[44px] text-[11px] font-bold leading-relaxed text-slate-500 sm:min-h-[48px] sm:text-sm">
                    {tool.desc}
                  </p>
                  <div className="mt-3 min-h-[28px] overflow-hidden sm:mt-5 sm:min-h-[36px]">
                    <div className="inline-flex max-w-full">
                      {tool.gimmickUI}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- 3. Pitch Section (สำหรับคนที่ยังไม่ Login) --- */}
      {!user && (
        <section className="mx-auto mb-12 flex min-h-[550px] w-[calc(100%-2rem)] max-w-6xl items-center overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900 shadow-2xl sm:w-[calc(100%-4rem)] md:rounded-[3rem] relative">
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

      <footer className="mx-auto mt-12 flex max-w-5xl flex-col items-center pb-12 sm:pb-16">
        <div className="mb-5 flex items-center justify-center gap-7 text-slate-500 sm:gap-8">
          <Link
            href="https://x.com/FuiiThanawat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:shadow-xl"
          >
            <svg viewBox="0 0 1200 1227" className="h-6 w-6" aria-hidden="true">
              <path
                fill="currentColor"
                d="M714.16 519.28 1160.89 0h-105.86L667.14 450.89 357.33 0H0l468.49 681.82L0 1226.37h105.87l409.62-476.15 327.18 476.15H1200L714.16 519.28Zm-144.99 168.55-47.47-67.9L144.01 79.69h162.6l304.8 435.99 47.47 67.9 396.2 566.72h-162.6L569.17 687.83Z"
              />
            </svg>
          </Link>

          <Link
            href="https://www.instagram.com/upskillwithfuii/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-fuchsia-500 hover:via-rose-500 hover:to-amber-400 hover:text-white hover:shadow-xl"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"
              />
              <path fill="currentColor" d="M17.5 6.5h.01" />
            </svg>
          </Link>

          <Link
            href="https://www.tiktok.com/@upskillwithfuii"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-xl"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
              <path
                fill="currentColor"
                d="M16.6 3c.35 2.03 1.55 3.45 3.4 3.64v3.12a7.3 7.3 0 0 1-3.34-.9v5.86c0 3.1-2.3 5.28-5.32 5.28C8.56 20 6 18.08 6 15.18c0-3.28 2.88-5.36 6.15-4.78v3.17c-1.3-.42-2.73.2-2.73 1.6 0 .98.82 1.62 1.85 1.62 1.12 0 1.9-.72 1.9-2.1V3h3.43Z"
              />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setShowStoryModal(true)}
          className="cursor-pointer text-center text-xs font-bold tracking-wide text-slate-400 transition-colors hover:text-indigo-600"
        >
          {t.footer}
        </button>
      </footer>

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
                เลือกแผนที่เหมาะกับคุณ
              </h2>
              <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-6">
                ค่าสมาชิกช่วยจ่ายต้นทุน AI และเซิร์ฟเวอร์จริง เพื่อให้ฟุ้ยพัฒนา Upskill Everyday ต่อได้ทุกเดือนครับ
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { id: "monthly" as ProPlan, label: "PRO รายเดือน", price: "฿149", sub: "ช่วยค่า AI รายเดือน" },
                  { id: "yearly" as ProPlan, label: "PRO รายปี", price: "฿990", sub: "BEST VALUE" },
                  { id: "lifetime" as ProPlan, label: "LIFETIME", price: "฿2,490", sub: "จ่ายครั้งเดียวจบ" },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setBillingPlan(plan.id)}
                    className={`rounded-2xl border p-3 text-left transition-all duration-300 ${billingPlan === plan.id
                      ? "border-amber-300 bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-[0_18px_30px_-16px_rgba(245,158,11,0.8)]"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                    } ${plan.id === "lifetime" ? "col-span-2" : ""}`}
                  >
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-80">{plan.label}</span>
                    <span className="mt-1 block text-2xl font-black tracking-tight">{plan.price}</span>
                    <span className="block text-[10px] font-bold opacity-70">{plan.sub}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300 mb-3">
                  {billingPlan === "yearly" ? "รายปีคุ้มที่สุด" : billingPlan === "lifetime" ? "ปลดล็อกถาวร" : "พร้อมใช้ตอนนี้"}
                </p>
                <ul className="space-y-2 text-xs font-bold text-slate-200">
                  {billingPlan === "monthly" && (
                    <>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> ช่วยค่า AI รายเดือน ปลดล็อกพลังเต็มรูปแบบ</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> เข้า Focus Room Lounge ห้องโฟกัสรวมสำหรับ PRO</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> หักอัตโนมัติผ่านบัตร หรือเติมวันใช้งาน 30 วันผ่าน PromptPay</li>
                    </>
                  )}
                  {billingPlan === "yearly" && (
                    <>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> เฉลี่ยเพียง ฿82.50 / เดือน ประหยัดทันที 50%</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> เข้า Focus Room Lounge ห้องโฟกัสรวมสำหรับ PRO</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> ฟรี Ebook “สร้างก่อนพร้อม” + Badge ยุคบุกเบิก</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> คลังออมมีสติ, Book Shelf และล็อกราคานี้ตลอดชีพ</li>
                    </>
                  )}
                  {billingPlan === "lifetime" && (
                    <>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> สนับสนุนเต็มสูบ ปลดล็อกถาวรตลอดชีพ</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> เข้า Focus Room Lounge ห้องโฟกัสรวมสำหรับ PRO</li>
                      <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> ได้รับสิทธิ์และโบนัสพิเศษทั้งหมดเหมือนแพ็กเกจรายปี</li>
                    </>
                  )}
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade()}
                className="w-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_18px_40px_-18px_rgba(245,158,11,0.9)] active:scale-95 flex items-center justify-center gap-2 group"
              >
                สนับสนุนและไปต่อ
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="mt-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                ใช้ Free ต่อ
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
    {false && !user && (
      <div className="fixed top-24 right-4 sm:top-28 sm:right-6 z-[999] group/floating">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={() => {
            setGuideStep(1);
            setShowGuide(true);
          }}
          className="relative flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/75 px-2 py-2 pr-4 shadow-[0_14px_34px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all hover:bg-slate-950/85"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white shadow-inner">
            <HelpCircle size={15} strokeWidth={3} />
          </div>
          <span className="relative z-10 text-[10px] font-black text-white tracking-[0.14em]">
            คู่มือเริ่มต้น
          </span>
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
            className={`relative w-full ${guideStep === 2 ? "max-w-[460px]" : "max-w-[400px]"} bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col`}
          >
            {/* --- Dynamic Glowing Header --- */}
            <div className={`relative ${guideStep === 2 ? "h-56" : "h-44"} flex items-center justify-center overflow-hidden`}>
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
                  <div className="rounded-[2rem] border border-white/15 bg-white/10 px-7 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                    <Image
                      src="/logo-full.png"
                      alt="Upskill Everyday"
                      width={220}
                      height={80}
                      className="h-auto w-[190px] drop-shadow-2xl"
                      priority
                    />
                  </div>
                ) : guideStep === 2 ? (
                  <div className="grid w-[420px] max-w-[calc(100vw-2.5rem)] grid-cols-3 gap-3">
                    {[
                      { src: "/Phase1.png", label: "Phase 1", title: "ค้นหาตัวตน", position: "object-[center_82%] sm:object-[center_58%]" },
                      { src: "/Phase2.png", label: "Phase 2", title: "สุขระหว่างทาง", position: "object-[center_84%] sm:object-[center_60%]" },
                      { src: "/Phase3.png", label: "Phase 3", title: "ระลึกความตาย", position: "object-[center_84%] sm:object-[center_60%]" },
                    ].map((phase) => (
                      <div key={phase.label} className="relative h-48 overflow-hidden rounded-[1.65rem] border border-white/25 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
                        <Image
                          src={phase.src}
                          alt={phase.label}
                          fill
                          sizes="140px"
                          className={`scale-100 object-cover sm:scale-[1.12] ${phase.position}`}
                        />
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent sm:h-10 sm:from-slate-950/60 sm:via-slate-950/18" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/10 to-white/5" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="inline-flex rounded-full bg-white/90 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-slate-900 hidden sm:inline-flex">
                            {phase.label}
                          </div>
                          <p className="mt-1 text-[9px] font-black leading-tight text-white drop-shadow">
                            {phase.title}
                          </p>
                        </div>
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
                    {guideStep === 1 && "ยินดีต้อนรับสู่ Upskill Everyday"}
                    {guideStep === 2 && "เส้นทาง 3 Phase ของคุณ"}
                    {guideStep === 3 && "ปลดล็อกทีละขั้น"}
                    {guideStep === 4 && "เริ่มที่ Phase 1"}
                  </h3>

                  {guideStep === 1 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      พื้นที่ส่วนตัวสำหรับสำรวจตัวเอง สะสม XP และค่อยๆ เติบโตในแบบของคุณ
                    </p>
                  )}
                  {guideStep === 2 && (
                    <div className="w-full max-w-[300px] mx-auto space-y-2.5 text-left mt-1">
                      {[
                        { color: "from-orange-500 to-rose-500", name: "Phase 1 ค้นหาตัวตน", desc: "สำรวจชีวิต ความคิด การเงิน และสไตล์ตัวเอง" },
                        { color: "from-pink-500 to-violet-500", name: "Phase 2 สุขระหว่างทาง", desc: "เข้าใจอารมณ์ ความกลัว ความสุข และเติบโตกับพี่ฟุ้ย" },
                        { color: "from-amber-400 to-emerald-400", name: "Phase 3 ระลึกความตาย", desc: "ฝึกโฟกัส ทบทวนชีวิต และเลือกสิ่งที่สำคัญจริงๆ" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-[11px] font-black text-white shadow-lg`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-white">{item.name}</p>
                            <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {guideStep === 3 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      แอพต่างๆ จะค่อยๆ เปิดตามเส้นทางที่คุณทำสำเร็จ
                      <span className="text-white font-semibold"> ไม่ต้องรีบ ไม่ต้องงง</span>{" "}
                      แค่ทำทีละขั้นแล้วระบบจะพาไปต่อเอง
                    </p>
                  )}
                  {guideStep === 4 && (
                    <p className="text-slate-400 text-[13px] leading-relaxed max-w-[260px] mx-auto">
                      <span className="text-white font-semibold">Login ฟรีด้วย Google</span>{" "}
                      แล้วเริ่มจาก Wheel of Life ใน Phase 1 เพื่อให้โปรไฟล์และ Avatar ของคุณ
                      <span className="text-white font-semibold"> ค่อยๆ เติบโตไปพร้อมกัน</span>
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
