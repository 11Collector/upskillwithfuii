"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "firebase/auth";
import {
  Download,
  Star,
  BrainCircuit,
  Zap,
  Flame,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface HeroSectionProps {
  user: User | null;
  isPro: boolean;
  isProLoaded: boolean;
  deferredPrompt: any;
  isIOS: boolean;
  handleInstallClick: () => void;
  onOpenIOSInstallGuide: () => void;
  handleLogout: () => void;
  t: {
    authWelcome: string;
    authSub: string;
    logout: string;
    dashboardBtn: string;
  };
}

export default function HeroSection({
  user,
  isPro,
  isProLoaded,
  deferredPrompt,
  isIOS,
  handleInstallClick,
  onOpenIOSInstallGuide,
  handleLogout,
  t,
}: HeroSectionProps) {
  if (user) {
    return (
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
              {t.authWelcome} <span className="text-red-800">{user.displayName?.split(" ")[0]}</span> 🚀
            </h1>
            <p className="text-slate-500 text-sm font-medium">{t.authSub}</p>
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
    );
  }

  return (
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
          onClick={isIOS ? onOpenIOSInstallGuide : handleInstallClick}
          className="absolute right-4 top-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-black bg-black text-white hover:bg-zinc-900 font-black text-[10px] md:text-[11px] tracking-[0.16em] shadow-[2.5px_2.5px_0px_#2D231E] md:right-7 md:top-7 md:px-5 md:py-3 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D231E]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shrink-0">
            <Download size={12} strokeWidth={3} />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white md:text-[11px]">
            INSTALL APP
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
            <span
              className="block text-[#8b1a0f] drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)]"
              style={{ textShadow: "0px 1px 4px rgba(255, 255, 255, 0.5)" }}
            >
              การพัฒนาตัวเอง
            </span>
            <span
              className="block text-amber-50 mt-2"
              style={{
                textShadow:
                  "0px 2px 10px rgba(45, 35, 30, 0.42), 0px 1px 2px rgba(45, 35, 30, 0.3)",
              }}
            >
              สนุกกว่าที่คิด
            </span>
          </h1>

          <div className="relative my-6 flex items-center justify-center select-none">
            <svg
              className="w-full h-3 text-[#2D231E]/20"
              fill="none"
              viewBox="0 0 400 12"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 6 Q 25 1, 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6 T 350 6 T 400 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            <div className="absolute bg-[#FAF6F0] border-2 border-[#2D231E] rounded-lg p-1 px-1.5 rotate-12 shadow-[2px_2px_0px_#2D231E]">
              <Star className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
            </div>
          </div>

          <p
            className="relative max-w-[620px] text-[13px] sm:text-xl font-black leading-relaxed text-white mb-2"
            style={{
              textShadow:
                "0px 2px 12px rgba(45, 35, 30, 0.5), 0px 1px 3px rgba(45, 35, 30, 0.3)",
            }}
          >
            Personal Growth OS ที่พาคุณสำรวจตัวเอง
            <br />
            สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิม
          </p>

          <div className="relative mt-8 flex flex-nowrap w-full gap-1.5 [@media(min-width:375px)]:gap-2 [@media(min-width:430px)]:gap-3 pb-1 select-none">
            {[
              {
                icon: (
                  <BrainCircuit className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />
                ),
                label: "PERSONALIZED",
                bgClass: "bg-[#EDE9FE]",
                textClass: "text-[#5B21B6]",
                borderClass: "border-[#2D231E]",
                rotate: "-rotate-1",
              },
              {
                icon: (
                  <Zap className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />
                ),
                label: "ACTIONABLE",
                bgClass: "bg-[#FEF3C7]",
                textClass: "text-[#B45309]",
                borderClass: "border-[#2D231E]",
                rotate: "rotate-2",
              },
              {
                icon: (
                  <Flame className="w-3 h-3 [@media(min-width:375px)]:w-3.5 [@media(min-width:375px)]:h-3.5 [@media(min-width:430px)]:w-4 [@media(min-width:430px)]:h-4" />
                ),
                label: "XP & LEVEL",
                bgClass: "bg-[#DBEAFE]",
                textClass: "text-[#1E40AF]",
                borderClass: "border-[#2D231E]",
                rotate: "-rotate-2",
              },
            ].map((badge) => (
              <motion.div
                key={badge.label}
                whileHover={{
                  scale: 1.06,
                  rotate: parseFloat(badge.rotate) > 0 ? 0 : 2,
                  y: -2,
                }}
                whileTap={{ scale: 0.96, rotate: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
                className={`inline-flex items-center gap-1 [@media(min-width:375px)]:gap-1.5 [@media(min-width:430px)]:gap-2 px-2 py-1.5 [@media(min-width:375px)]:px-2.5 [@media(min-width:375px)]:py-2 [@media(min-width:430px)]:px-4 [@media(min-width:430px)]:py-2.5 rounded-2xl border-2 ${badge.borderClass} ${badge.bgClass} ${badge.textClass} ${badge.rotate} font-black text-[8.5px] [@media(min-width:375px)]:text-[9.5px] [@media(min-width:430px)]:text-[10px] md:text-[11px] tracking-tighter [@media(min-width:375px)]:tracking-tight [@media(min-width:430px)]:tracking-wide shadow-[2.5px_2.5px_0px_#2D231E] [@media(min-width:375px)]:shadow-[3px_3px_0px_#2D231E] [@media(min-width:430px)]:shadow-[4px_4px_0px_#2D231E] cursor-default whitespace-nowrap`}
              >
                <span className="shrink-0">{badge.icon}</span>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
