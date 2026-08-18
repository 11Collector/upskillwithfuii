"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Map,
  PieChart,
  Users,
  Wallet,
  Quote,
  BookOpen,
  Brain,
  ShoppingBag,
  MessageSquareMore,
  Ghost,
  BrainCircuit,
  Hourglass,
} from "lucide-react";

export default function JourneySection() {
  return (
    <section className="mx-auto mb-12 w-[calc(100%-2rem)] max-w-6xl sm:w-[calc(100%-4rem)] px-4">
      <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8b1a0f] bg-[#FFF5F5] px-3.5 py-1.5 rounded-full border border-red-500/20 shadow-sm z-10 flex items-center gap-1.5">
          <Map size={12} className="stroke-[2.5] text-[#8b1a0f]" />
          THE JOURNEY
        </span>
        <h2 className="mt-3.5 text-2xl font-black leading-tight text-slate-900 md:text-4xl">
          เส้นทางพัฒนาตัวเอง 3 Phase
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500 max-w-2xl leading-relaxed">
          ที่ช่วยให้คุณค้นหาตัวเอง สร้างนิสัย และเติบโตทุกวัน
        </p>
      </div>

      <div className="flex flex-row md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-6 lg:gap-8 pt-4 -mt-4 pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Phase 1 Card */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative min-h-[500px] md:min-h-[540px] w-[85vw] max-w-[340px] md:max-w-none md:w-full shrink-0 snap-center border-2 border-[#2D231E] rounded-[2rem] shadow-[4px_4px_0px_#2D231E] overflow-hidden group flex flex-col justify-end select-none"
        >
          {/* Full Illustration Background */}
          <Image
            src="/Phase1.webp"
            alt="Phase 1"
            fill
            priority
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 z-0"
          />
          {/* Dark Overlay Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

          {/* Holographic Shine Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_10%,rgba(255,255,255,0.15)_25%,rgba(147,51,234,0.12)_40%,rgba(59,130,246,0.12)_55%,rgba(16,185,129,0.08)_70%,rgba(252,211,77,0.12)_85%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] bg-[position:100%_0] opacity-0 group-hover:opacity-100 group-hover:bg-[position:-100%_0] transition-all duration-1000 ease-out pointer-events-none mix-blend-overlay z-15" />

          {/* Overlaid Text & Icons */}
          <div className="relative z-20 p-6 mt-auto">
            <div className="pt-2">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider block mb-2.5 text-center">
                เครื่องมือในเฟสนี้
              </span>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {[
                  {
                    name: "วงล้อชีวิต (Wheel of Life)",
                    icon: <PieChart size={18} className="text-red-600" />,
                    color: "bg-red-50 border-red-200",
                  },
                  {
                    name: "ประเมินนิสัย (DISC)",
                    icon: <Users size={18} className="text-blue-600" />,
                    color: "bg-blue-50 border-blue-200",
                  },
                  {
                    name: "สไตล์การเงิน (Money Avatar)",
                    icon: <Wallet size={18} className="text-amber-600" />,
                    color: "bg-amber-50 border-amber-200",
                  },
                  {
                    name: "คมสัดสัด (Quotes)",
                    icon: <Quote size={18} className="text-purple-600" />,
                    color: "bg-purple-50 border-purple-200",
                  },
                ].map((app, idx, arr) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  const positionClass = isFirst
                    ? "left-0 -translate-x-0"
                    : isLast
                    ? "right-0 left-auto translate-x-0"
                    : "left-1/2 -translate-x-1/2";
                  return (
                    <div
                      key={app.name}
                      className="relative group/app hover:-translate-y-0.5 transition-all cursor-help"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border-2 border-[#2D231E] shadow-[1.5px_1.5px_0px_#2D231E] flex items-center justify-center shrink-0 ${app.color}`}
                      >
                        {app.icon}
                      </div>
                      <div
                        className={`absolute bottom-full ${positionClass} mb-2 bg-slate-950 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 pointer-events-none group-hover/app:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-30`}
                      >
                        {app.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phase 2 Card */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative min-h-[500px] md:min-h-[540px] w-[85vw] max-w-[340px] md:max-w-none md:w-full shrink-0 snap-center border-2 border-[#2D231E] rounded-[2rem] shadow-[4px_4px_0px_#2D231E] overflow-hidden group flex flex-col justify-end select-none"
        >
          {/* Full Illustration Background */}
          <Image
            src="/Phase2.webp"
            alt="Phase 2"
            fill
            priority
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 z-0"
          />
          {/* Dark Overlay Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

          {/* Holographic Shine Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_10%,rgba(255,255,255,0.15)_25%,rgba(147,51,234,0.12)_40%,rgba(59,130,246,0.12)_55%,rgba(16,185,129,0.08)_70%,rgba(252,211,77,0.12)_85%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] bg-[position:100%_0] opacity-0 group-hover:opacity-100 group-hover:bg-[position:-100%_0] transition-all duration-1000 ease-out pointer-events-none mix-blend-overlay z-15" />

          {/* Overlaid Text & Icons */}
          <div className="relative z-20 p-6 mt-auto">
            <div className="pt-2">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider block mb-2.5 text-center">
                เครื่องมือในเฟสนี้
              </span>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {[
                  {
                    name: "สไตล์การอ่าน (Library of Souls)",
                    icon: <BookOpen size={18} className="text-emerald-600" />,
                    color: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    name: "คลังสมอง (Upskill Brain)",
                    icon: <Brain size={18} className="text-amber-600" />,
                    color: "bg-amber-50 border-amber-200",
                  },
                  {
                    name: "ความสุขระหว่างทาง (Happiness Shop)",
                    icon: <ShoppingBag size={18} className="text-pink-600" />,
                    color: "bg-pink-50 border-pink-200",
                  },
                  {
                    name: "คุยกับพี่ฟุ้ย (AI Mentor)",
                    icon: <MessageSquareMore size={18} className="text-slate-600" />,
                    color: "bg-slate-100 border-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
                  },
                ].map((app, idx, arr) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  const positionClass = isFirst
                    ? "left-0 -translate-x-0"
                    : isLast
                    ? "right-0 left-auto translate-x-0"
                    : "left-1/2 -translate-x-1/2";
                  return (
                    <div
                      key={app.name}
                      className="relative group/app hover:-translate-y-0.5 transition-all cursor-help"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border-2 border-[#2D231E] shadow-[1.5px_1.5px_0px_#2D231E] flex items-center justify-center shrink-0 ${app.color}`}
                      >
                        {app.icon}
                      </div>
                      <div
                        className={`absolute bottom-full ${positionClass} mb-2 bg-slate-950 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 pointer-events-none group-hover/app:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-30`}
                      >
                        {app.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phase 3 Card */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative min-h-[500px] md:min-h-[540px] w-[85vw] max-w-[340px] md:max-w-none md:w-full shrink-0 snap-center border-2 border-[#2D231E] rounded-[2rem] shadow-[4px_4px_0px_#2D231E] overflow-hidden group flex flex-col justify-end select-none"
        >
          {/* Full Illustration Background */}
          <Image
            src="/Phase3.webp"
            alt="Phase 3"
            fill
            priority
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 z-0"
          />
          {/* Dark Overlay Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

          {/* Holographic Shine Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_10%,rgba(255,255,255,0.15)_25%,rgba(147,51,234,0.12)_40%,rgba(59,130,246,0.12)_55%,rgba(16,185,129,0.08)_70%,rgba(252,211,77,0.12)_85%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] bg-[position:100%_0] opacity-0 group-hover:opacity-100 group-hover:bg-[position:-100%_0] transition-all duration-1000 ease-out pointer-events-none mix-blend-overlay z-15" />

          {/* Overlaid Text & Icons */}
          <div className="relative z-20 p-6 mt-auto">
            <div className="pt-2">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider block mb-2.5 text-center">
                เครื่องมือในเฟสนี้
              </span>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {[
                  {
                    name: "ผีในตัวคุณ (Ghost In You)",
                    icon: <Ghost size={18} className="text-red-600" />,
                    color: "bg-red-50 border-red-200",
                  },
                  {
                    name: "ห้องสมาธิ (Focus Room)",
                    icon: <BrainCircuit size={18} className="text-zinc-700" />,
                    color: "bg-zinc-50 border-zinc-200",
                  },
                  {
                    name: "เวลาที่เหลือ (Memento Mori)",
                    icon: <Hourglass size={18} className="text-[#8B5A2B]" />,
                    color: "bg-[#F4ECE1] border-[#E6D9C5]",
                  },
                ].map((app, idx, arr) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  const positionClass = isFirst
                    ? "left-0 -translate-x-0"
                    : isLast
                    ? "right-0 left-auto translate-x-0"
                    : "left-1/2 -translate-x-1/2";
                  return (
                    <div
                      key={app.name}
                      className="relative group/app hover:-translate-y-0.5 transition-all cursor-help"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border-2 border-[#2D231E] shadow-[1.5px_1.5px_0px_#2D231E] flex items-center justify-center shrink-0 ${app.color}`}
                      >
                        {app.icon}
                      </div>
                      <div
                        className={`absolute bottom-full ${positionClass} mb-2 bg-slate-950 text-white text-[8px] font-black px-2.5 py-1 rounded opacity-0 pointer-events-none group-hover/app:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-30`}
                      >
                        {app.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
