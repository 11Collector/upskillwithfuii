"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, ChevronRight, Star, Award } from "lucide-react";

export type ProPlan = "monthly" | "yearly" | "founding_monthly" | "founding_yearly" | "lifetime";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingPlan: ProPlan;
  setBillingPlan: (plan: ProPlan) => void;
  onUpgrade: (plan?: ProPlan) => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  billingPlan,
  setBillingPlan,
  onUpgrade,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pb-24 sm:pb-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
                className={`rounded-2xl border p-3 text-left transition-all duration-300 ${
                  billingPlan === plan.id
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

          <div className="bg-slate-800/40 rounded-2xl p-4 mb-6 border border-white/5 text-left">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">สิทธิพิเศษที่คุณจะได้รับ</p>
            <ul className="text-[11px] font-bold text-slate-300 space-y-1.5">
              {billingPlan === "monthly" && (
                <>
                  <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-400 shrink-0" /> ปลดล็อกระบบและเควสต์ทั้งหมด</li>
                  <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-400 shrink-0" /> เข้า Focus Room Lounge ห้องโฟกัสรวมสำหรับ PRO</li>
                </>
              )}
              {billingPlan === "yearly" && (
                <>
                  <li className="flex gap-2"><ShieldCheck size={15} className="text-emerald-300 shrink-0" /> ปลดล็อกระบบและเควสต์ทั้งหมด</li>
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
            onClick={() => onUpgrade()}
            className="w-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_18px_40px_-18px_rgba(245,158,11,0.9)] active:scale-95 flex items-center justify-center gap-2 group"
          >
            สนับสนุนและไปต่อ
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
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
  );
}
