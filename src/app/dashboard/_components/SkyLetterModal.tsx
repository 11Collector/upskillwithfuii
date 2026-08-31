"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Sparkles, X, ArrowRight, Compass } from "lucide-react";

interface SkyLetter {
  phase: string;
  story: string;
  toolLabel: string;
  targetPath: string;
  buttonClass?: string;
}

interface SkyLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: SkyLetter | null;
}

export function SkyLetterModal({ isOpen, onClose, letter }: SkyLetterModalProps) {
  if (!letter) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Letter Card (Celestial Envelope unfolded) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-sky-400/30 bg-gradient-to-b from-[#0c1a30] via-[#091322] to-[#060c16] p-6 sm:p-7 text-white shadow-[0_25px_70px_rgba(14,165,233,0.25)]"
          >
            {/* Ambient Celestial Glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:bg-white/20 hover:text-white active:scale-95"
            >
              <X size={16} />
            </button>

            {/* Header / Envelope Icon */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-indigo-500/20 shadow-inner">
                <Mail size={26} className="text-sky-300" />
                <Sparkles size={14} className="absolute -top-1.5 -right-1.5 text-amber-300 animate-pulse" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-200">
                <Compass size={11} className="text-sky-300" />
                {letter.phase}
              </span>

              <h3 className="mt-2 text-xl font-black text-white">
                จดหมายจากท้องฟ้า
              </h3>
            </div>

            {/* Letter Paper Content */}
            <div className="relative my-5 rounded-2xl border border-sky-300/20 bg-white/[0.04] p-4.5 sm:p-5 shadow-inner backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-sky-300/90">
                <span>ข้อความถึงคุณ:</span>
              </div>

              <p className="text-[13.5px] sm:text-sm font-bold leading-relaxed text-sky-50 italic">
                "{letter.story}"
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href={letter.targetPath}
                onClick={onClose}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${letter.buttonClass || "from-sky-500 to-blue-600"} py-3.5 px-5 font-black text-sm text-white shadow-lg transition-all hover:brightness-110 active:scale-95`}
              >
                <span>เดินทางสู่ {letter.toolLabel}</span>
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs font-bold text-slate-400 transition-colors hover:text-slate-200"
              >
                เก็บจดหมายไว้ก่อน
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
