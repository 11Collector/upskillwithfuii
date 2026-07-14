"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { initAnalyticsAfterConsent } from "@/lib/firebase";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1200); // Slight delay for smoother feel after page loads
      return () => clearTimeout(timer);
    }
  }, []);

  if (pathname === "/privacy") {
    return null;
  }

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    initAnalyticsAfterConsent();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed left-4 right-4 md:left-auto md:right-6 bottom-24 md:bottom-6 md:max-w-md w-[calc(100%-2rem)] md:w-full z-[10050] pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 text-slate-200 rounded-[2rem] shadow-2xl p-5 md:p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="bg-red-950/40 p-2.5 rounded-2xl border border-red-500/20 text-red-400 shrink-0">
                <ShieldCheck size={20} className="animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-white text-sm md:text-base leading-tight">
                  ความเป็นส่วนตัวของคุณ
                </h3>
                <p className="text-xs md:text-[13px] text-slate-400 leading-relaxed">
                  เราใช้คุกกี้ที่จำเป็นเพื่อให้เว็บไซต์ทำงานได้ และคุกกี้วิเคราะห์เพื่อเพิ่มประสิทธิภาพและประสบการณ์การใช้งานที่ดีของคุณ สามารถดูรายละเอียดเพิ่มเติมที่{" "}
                  <Link
                    href="/privacy"
                    className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors font-medium"
                  >
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-1 border-t border-slate-800/60 pt-3">
              <button
                onClick={handleAcceptEssential}
                className="text-slate-400 hover:text-white text-xs md:text-sm font-semibold py-2 px-4 rounded-full transition-colors active:scale-95 duration-200 touch-manipulation min-h-[44px]"
              >
                เฉพาะที่จำเป็น
              </button>
              <button
                onClick={handleAcceptAll}
                className="bg-gradient-to-r from-red-800 via-red-700 to-rose-700 hover:opacity-95 text-white text-xs md:text-sm font-bold py-2.5 px-5 rounded-full shadow-lg shadow-red-900/20 transition-all active:scale-95 duration-200 touch-manipulation min-h-[44px] flex items-center justify-center"
              >
                ยอมรับทั้งหมด
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
