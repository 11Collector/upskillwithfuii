"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PieChart,
  Users,
  Wallet,
  Quote,
  ChevronRight,
  LogOut,
  Loader2,
  LayoutDashboard,
  Star,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
  Flame,
  BrainCircuit,
  BookOpen,
  MessageSquareMore,
  Download,
} from "lucide-react";
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { usePWAInstall } from "@/lib/pwa";

import OnePercentSection from "@/components/home/OnePercentSection";
import JourneySection from "@/components/home/JourneySection";
import PitchSection from "@/components/home/PitchSection";
import Footer from "@/components/home/Footer";
import UpgradeModal, { ProPlan } from "@/components/home/UpgradeModal";
import StoryModal from "@/components/home/StoryModal";
import IOSInstallGuideModal from "@/components/home/IOSInstallGuideModal";
import VinylPlayer from "@/components/home/VinylPlayer";

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
  dashboardBtn: "เข้าสู่ Personal Growth OS",
  logout: "Logout",
  toolsHeader: "📌 เครื่องมือเฉพาะสำหรับคุณ",
  toolsDetailBtn: "รายละเอียด",
  pitchBeta: "YOUR PERSONAL GROWTH OS",
  pitchTitle1: "ระบบปฏิบัติการ",
  pitchTitle2: "พัฒนาชีวิตส่วนตัวของคุณ",
  pitchList: [
    "Identity OS — ถอดรหัสตัวตนและเป้าหมายชีวิต",
    "XP & Quests — เควสต์รายวัน อัปเลเวลตัวตน",
    "Upskill Brain — คลังสมองอ่านสรุปและจดบันทึก",
    "AI Mentor — ปรึกษา Mindset กับพี่ฟุ้ย 24 ชม."
  ],
  loginGoogle: "เริ่มต้นใช้งาน",
  loginRemark: "สมัครฟรีใน 5 วินาที · ข้อมูลส่วนตัวปลอดภัย 100%",
  footer: "© 2026 อัพสกิลกับฟุ้ย",
  tools: {
    wheel: { name: "Wheel Of Life", desc: "เช็กสมดุลชีวิต 8 ด้าน พร้อม AI วางแผน 7 วัน", gimmick: "500K+ Views บน Social" },
    disc: { name: "Who Are You ?", desc: "ค้นหาตัวตนและการสื่อสารในที่ทำงานผ่าน DISC", gimmick: "ผู้ใช้งาน 120k+ คน" },
    money: { name: "Money Avatar", desc: "ถอดรหัสสไตล์การเงินของคุณ", gimmick: "วิเคราะห์เจาะลึกระดับ PRO" },
    quotes: { name: "คมสัดสัด", desc: "สร้างคำคมฮีลใจเฉพาะคุณ", gimmick: "Vibe ดี โดนใจ Gen Z" }
  }
};

export default function HomeClient() {
  const { deferredPrompt, isIOS, handleInstallClick } = usePWAInstall();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isProLoaded, setIsProLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [onePercentDay, setOnePercentDay] = useState(365);

  useEffect(() => {
    const ua = navigator.userAgent;
    const inApp = /FBAN|FBAV|FB_IAB|Instagram|Threads|Line\/|MicroMessenger|BytedanceWebview|musical_ly|Twitter|Snapchat|GSA\/|Gmail/i.test(ua);
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
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

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

  useEffect(() => {
    if (user) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      const userRef = doc(db, "users", loggedInUser.uid);
      
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

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      setIsProLoaded(true);
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed:", error);
      }
    }
  };
  const handleLogout = () => signOut(auth);

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
      icon: <MessageSquareMore size={28} className="text-slate-600" />, path: "/tools/soul-guide", color: "bg-slate-100 border-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
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
      {!user ? (
        <section className="relative mb-10 min-h-[720px] w-full overflow-hidden bg-amber-50 bg-noise md:mb-14 md:min-h-[720px]">
          <picture className="absolute inset-0 block h-full w-full">
            <source media="(max-width: 767px)" srcSet="/WallpaperMobile.png" />
            <img
              src="/Wallpaper.png"
              alt="Upskill Everyday"
              className="absolute -top-28 left-0 right-0 h-[calc(100%+7rem)] w-full object-cover object-[center_top] md:-top-14 md:inset-x-0 md:h-[calc(100%+3.5rem)] md:object-[33%_top] lg:inset-0 lg:h-full lg:object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/96 via-amber-50/70 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/28" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_76%,rgba(15,23,42,0.22),transparent_42%)]" />

          {(deferredPrompt || isIOS) && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={isIOS ? () => setShowIOSInstallGuide(true) : handleInstallClick}
              className="absolute right-4 top-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-black bg-black text-white hover:bg-zinc-900 font-black text-[10px] md:text-[11px] tracking-[0.16em] shadow-[2.5px_2.5px_0px_#2D231E] md:right-7 md:top-7 md:px-5 md:py-3 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D231E]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shrink-0">
                <Download size={12} strokeWidth={3} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white md:text-[11px]">
                {isIOS ? "INSTALL APP" : "INSTALL APP"}
              </span>
            </motion.button>
          )}

          <div className="relative z-20 flex min-h-[720px] w-full items-end px-4 pb-6 pt-20 md:min-h-[720px] md:px-12 md:pb-12 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative w-full max-w-[640px] px-4 py-6 sm:px-8 sm:py-8 md:ml-[4vw] md:max-w-[680px] md:px-10 md:py-9 lg:max-w-[680px]"
            >
              <h1 className="relative max-w-[680px] text-[2.55rem] font-black leading-[1.02] tracking-tight select-none sm:text-6xl md:text-[4rem] lg:text-[4.1rem]">
                <span className="block text-[#8b1a0f] drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)]" style={{ textShadow: "0px 1px 4px rgba(255, 255, 255, 0.5)" }}>
                  การพัฒนาตัวเอง
                </span>
                <span className="block text-amber-50 mt-2" style={{ textShadow: "0px 2px 10px rgba(45, 35, 30, 0.42), 0px 1px 2px rgba(45, 35, 30, 0.3)" }}>
                  สนุกกว่าที่คิด
                </span>
              </h1>

              <div className="relative my-6 flex items-center justify-center select-none">
                <svg className="w-full h-3 text-[#2D231E]/20" fill="none" viewBox="0 0 400 12" preserveAspectRatio="none">
                  <path d="M 0 6 Q 25 1, 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6 T 350 6 T 400 6" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
                <div className="absolute bg-[#FAF6F0] border-2 border-[#2D231E] rounded-lg p-1 px-1.5 rotate-12 shadow-[2px_2px_0px_#2D231E]">
                  <Star className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
                </div>
              </div>

              <p className="relative max-w-[620px] text-[13px] sm:text-xl font-black leading-relaxed text-white mb-2" style={{ textShadow: "0px 2px 12px rgba(45, 35, 30, 0.5), 0px 1px 3px rgba(45, 35, 30, 0.3)" }}>
                Personal Growth OS ที่พาคุณสำรวจตัวเอง<br />
                สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิม
              </p>

              <div className="relative mt-8 flex flex-nowrap w-full gap-1.5 [@media(min-width:375px)]:gap-2 [@media(min-width:430px)]:gap-3 pb-1 select-none">
                {[
                  { 
                    icon: <BrainCircuit className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />, 
                    label: "PERSONALIZED", 
                    bgClass: "bg-[#EDE9FE]", 
                    textClass: "text-[#5B21B6]",
                    borderClass: "border-[#2D231E]",
                    rotate: "-rotate-1"
                  },
                  { 
                    icon: <Zap className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />, 
                    label: "ACTIONABLE", 
                    bgClass: "bg-[#FEF3C7]", 
                    textClass: "text-[#B45309]",
                    borderClass: "border-[#2D231E]",
                    rotate: "rotate-2"
                  },
                  { 
                    icon: <Flame className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />, 
                    label: "XP & LEVEL", 
                    bgClass: "bg-[#DBEAFE]", 
                    textClass: "text-[#1E40AF]",
                    borderClass: "border-[#2D231E]",
                    rotate: "-rotate-2"
                  },
                ].map((badge) => (
                  <motion.div
                    key={badge.label}
                    whileHover={{ scale: 1.06, rotate: parseFloat(badge.rotate) > 0 ? 0 : 2, y: -2 }}
                    whileTap={{ scale: 0.96, rotate: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className={`inline-flex items-center gap-1 [@media(min-width:375px)]:gap-1.5 [@media(min-width:430px)]:gap-2 px-2 py-1.5 [@media(min-width:375px)]:px-2.5 [@media(min-width:375px)]:py-2 [@media(min-width:430px)]:px-4 [@media(min-width:430px)]:py-2.5 rounded-2xl border-2 ${badge.borderClass} ${badge.bgClass} ${badge.textClass} ${badge.rotate} font-black text-[8.5px] [@media(min-width:375px)]:text-[9.5px] [@media(min-width:430px)]:text-[10px] md:text-[11px] tracking-tighter [@media(min-width:375px)]:tracking-tight [@media(min-width:430px)]:tracking-wide shadow-[2.5px_2.5px_0px_#2D231E] [@media(min-width:375px)]:shadow-[3px_3px_0px_#2D231E] [@media(min-width:430px)]:shadow-[4px_4px_0px_#2D231E] cursor-default whitespace-nowrap`}
                  >
                    <span className="shrink-0">
                      {badge.icon}
                    </span>
                    <span>{badge.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] mx-auto mt-6 mb-12 flex max-w-5xl flex-col items-center justify-between gap-8 overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group md:flex-row md:p-10"
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
      {!user && (
        <OnePercentSection
          onePercentDay={onePercentDay}
          setOnePercentDay={setOnePercentDay}
        />
      )}

      {/* --- 1.8. The Journey Section --- */}
      {!user && <JourneySection />}

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

      {/* --- 3. Pitch / Features Section --- */}
      {!user && (
        <PitchSection
          pitchBeta={t.pitchBeta}
          pitchTitle1={t.pitchTitle1}
          pitchTitle2={t.pitchTitle2}
          pitchList={t.pitchList}
          loginGoogle={t.loginGoogle}
          loginRemark={t.loginRemark}
          isInAppBrowser={isInAppBrowser}
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
        />
      )}

      {/* --- Footer --- */}
      <Footer
        footerText={t.footer}
        onOpenStory={() => setShowStoryModal(true)}
      />

      {/* --- Upgrade Modal --- */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        billingPlan={billingPlan}
        setBillingPlan={setBillingPlan}
        onUpgrade={handleUpgrade}
      />

      {/* --- 📖 Story Modal --- */}
      <StoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />

      {/* --- 📱 iOS Install Guide Modal --- */}
      <IOSInstallGuideModal
        isOpen={showIOSInstallGuide}
        onClose={() => setShowIOSInstallGuide(false)}
      />
    </div>

    {/* 💿 Clean Maroon Vinyl Button with Auto-Fade Toast (BEGINS - FU11) */}
    <VinylPlayer
      hide={showUpgradeModal || showStoryModal || showIOSInstallGuide || showGuide}
    />
    </>
  );
}
