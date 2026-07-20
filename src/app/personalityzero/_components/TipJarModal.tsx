"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Heart, Sparkles, Server } from "lucide-react";
import Image from "next/image";

interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipJarModal = ({ isOpen, onClose }: TipJarModalProps) => {
  const promptPayQrUrl = process.env.NEXT_PUBLIC_PROMPTPAY_QR_URL || "/promptpay-qr.png";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100010] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-sm w-full bg-white border-2 border-neutral-900 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden text-center text-neutral-900 select-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer z-10"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3 text-red-600 shadow-inner">
            <Coffee size={28} />
          </div>

          <h3 className="text-xl font-black text-neutral-950 tracking-tight mb-1">
            เลี้ยงกาแฟคนทำ ☕
          </h3>
          <p className="text-xs text-neutral-600 font-medium mb-4 leading-relaxed">
            เลี้ยงกาแฟคนทำ 1 แก้ว หรือช่วยจ่ายค่าเซิร์ฟ Vercel ไม่ให้โดนตัดไฟ จะเป็นพระคุณอย่างยิ่งครับ! 🙏
          </p>

          {/* PromptPay QR Section */}
          <div className="bg-neutral-50 p-4 rounded-3xl inline-block shadow-sm border border-neutral-200 mb-4 relative group">
            <div className="w-44 h-44 relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <Image
                src={promptPayQrUrl}
                alt="PromptPay QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-[10px] font-black text-neutral-600 mt-2 tracking-wider uppercase">
              PromptPay / พร้อมเพย์
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-red-600 font-bold bg-red-50 border border-red-200 py-2.5 px-4 rounded-2xl">
            <Server size={14} className="animate-pulse text-red-600" />
            <span>ทุกบาทส่งตรงถึงค่าเซิร์ฟเวอร์แบบไร้สาระ!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-full bg-neutral-950 hover:bg-black font-bold text-xs text-white transition-colors cursor-pointer"
          >
            ปิดหน้าต่างนี้
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
