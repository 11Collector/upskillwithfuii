"use client";

import { motion } from "framer-motion";
import {
  Users,
  Flame,
  Brain,
  MessageSquareMore,
  ShieldCheck,
  Award,
  Star,
  Zap,
  Loader2,
  Copy,
} from "lucide-react";

interface PitchSectionProps {
  pitchBeta: string;
  pitchTitle1: string;
  pitchTitle2: string;
  pitchList: string[];
  loginGoogle: string;
  loginRemark: string;
  isInAppBrowser: boolean;
  isLoggingIn: boolean;
  handleLogin: () => void;
}

export default function PitchSection({
  pitchBeta,
  pitchTitle1,
  pitchTitle2,
  pitchList,
  loginGoogle,
  loginRemark,
  isInAppBrowser,
  isLoggingIn,
  handleLogin,
}: PitchSectionProps) {
  return (
    <section className="mx-auto mb-16 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 px-6 py-12 text-white shadow-2xl sm:w-[calc(100%-4rem)] sm:px-12 sm:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Pitch Text & CTA */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-amber-400 font-bold text-[10px] uppercase tracking-[0.3em]">
              {pitchBeta}
            </span>
          </div>
          <h2 className="text-[25px] sm:text-4xl md:text-5xl font-black mb-3 text-white leading-tight">
            {pitchTitle1} <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              {pitchTitle2}
            </span>
          </h2>
          <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm font-bold mb-7 leading-relaxed whitespace-nowrap">
            ครบทุกเครื่องมือค้นหาตัวตน และเติบโตในแบบของคุณ
          </p>

          <ul className="space-y-3.5 mb-10">
            {[
              { icon: <Users size={15} className="text-blue-400" />, text: pitchList[0] },
              { icon: <Flame size={15} className="text-orange-400" />, text: pitchList[1] },
              { icon: <Brain size={15} className="text-amber-400" />, text: pitchList[2] },
              { icon: <MessageSquareMore size={15} className="text-purple-400" />, text: pitchList[3] },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-200 text-xs md:text-sm font-bold">
                <div className="bg-slate-800 p-2 rounded-xl border border-white/10 shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-start gap-4 w-full">
            {isInAppBrowser ? (
              <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 flex flex-col gap-2.5">
                <p className="text-amber-400 text-sm font-black flex items-center gap-2">
                  <span>⚠️</span> เปิดใน Safari หรือ Chrome ก่อนนะครับ
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Google ไม่อนุญาตให้ Login ผ่าน In-App Browser (LINE, IG, Messenger ฯลฯ)
                  <br />
                  กรุณากดมุมขวาบน{" "}
                  <strong className="text-white">&quot;เปิดในเบราว์เซอร์&quot; (Safari / Chrome)</strong>{" "}
                  หรือกดคัดลอกลิงก์ด้านล่าง
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("คัดลอกลิงก์เรียบร้อย! กรุณานำไปวางและเปิดใน Safari หรือ Chrome ครับ");
                  }}
                  className="self-start mt-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>คัดลอกลิงก์</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-slate-900" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.486,35.33,44,30.075,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    {loginGoogle}
                  </>
                )}
              </button>
            )}

            <p className="text-[10px] text-slate-500 font-medium ml-2 mb-2">
              {loginRemark}
            </p>

            <div className="w-full max-w-sm pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Privacy & Security
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-bold tracking-tight">
                Personalized insights only. Industry-standard security.{" "}
                <br className="hidden sm:block" />
                <span className="text-slate-400">
                  Zero individual data sharing. Anonymous aggregate trends only.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Decorative Mockup with Effects */}
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
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray="263.9"
                      strokeDashoffset={263.9}
                      animate={{ strokeDashoffset: 66 }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="text-blue-500"
                      strokeLinecap="round"
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
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1, delay: 1.5 }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-2xl border border-white/5 p-4 space-y-2">
                  <div className="h-2 w-16 bg-white/10 rounded-full" />
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "40%" }}
                      transition={{ duration: 1, delay: 1.7 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 Level Up Badge */}
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
                  <span className="text-blue-100 font-bold text-[9px] uppercase tracking-widest leading-tight">
                    New Status
                  </span>
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
        </div>
      </div>
    </section>
  );
}
