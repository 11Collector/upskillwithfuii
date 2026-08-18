"use client";

import { motion } from "framer-motion";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryModal({ isOpen, onClose }: StoryModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pb-28 sm:pb-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative max-w-md w-full max-h-[82vh] flex flex-col bg-slate-900/95 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-red-700/10 blur-[40px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-red-800/10 blur-[40px] rounded-full pointer-events-none" />

        {/* Scrollable body content area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-3 text-center scrollbar-thin">
          <div className="flex justify-center pt-2">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[2.2rem] overflow-hidden border-2 border-red-500/30 p-1 bg-slate-950/50 shadow-lg shadow-red-500/20 flex items-center justify-center">
              <img
                src="/fuii-profile.webp"
                alt="Fuii"
                className="w-full h-full object-cover rounded-[1.8rem]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLDivElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-3xl" style={{ display: "none" }}>
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
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 text-white font-black rounded-2xl shadow-xl hover:from-red-600 hover:to-red-800 transition-all active:scale-95 text-sm uppercase tracking-wider shrink-0 mt-2"
        >
          เติบโตไปด้วยกัน 🌱
        </button>
      </motion.div>
    </motion.div>
  );
}
