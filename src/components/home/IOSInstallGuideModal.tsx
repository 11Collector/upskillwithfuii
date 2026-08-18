"use client";

import { motion } from "framer-motion";
import { Download, X } from "lucide-react";

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IOSInstallGuideModal({ isOpen, onClose }: IOSInstallGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pb-24 sm:pb-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[360px] bg-[#0A0B10]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-left flex flex-col text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-400/20">
              <Download size={14} />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">ติดตั้งแอป iOS</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[12px] text-slate-300 font-bold mb-4 leading-relaxed">
          สำหรับ iPhone และ iPad น้าสามารถติดตั้งแอปได้ง่ายๆ ตามขั้นตอนดังนี้ครับ:
        </p>

        <div className="space-y-3.5 text-[11px] font-bold text-slate-200">
          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-850 text-[10px] font-black text-slate-300">
              1
            </span>
            <div>
              กดปุ่ม <span className="text-red-400 font-black">แชร์ (Share)</span> ที่แถบด้านล่างของบราวเซอร์ Safari
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                ลักษณะเป็นรูปกล่องสี่เหลี่ยมมีลูกศรชี้ขึ้น [↑]
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-850 text-[10px] font-black text-slate-300">
              2
            </span>
            <div>
              เลื่อนลงมาด้านล่างแล้วเลือก{" "}
              <span className="text-red-400 font-black">"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</span>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                ลักษณะเป็นรูปเครื่องหมายบวก [+] ในกรอบสี่เหลี่ยม
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-850 text-[10px] font-black text-slate-300">
              3
            </span>
            <div>
              กดปุ่ม <span className="text-red-400 font-black">"เพิ่ม" (Add)</span> ที่มุมขวาบนของหน้าจอ
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                แอปจะปรากฏเป็นไอคอนบนหน้าจอโฮมพร้อมใช้งานทันทีครับ 📱✨
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 py-3 w-full text-center bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-white/5"
        >
          เข้าใจแล้ว 👌
        </button>
      </motion.div>
    </div>
  );
}
