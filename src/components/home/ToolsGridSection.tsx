"use client";

import Link from "next/link";
import {
  PieChart,
  Users,
  Wallet,
  BookOpen,
  Quote,
  MessageSquareMore,
  ChevronRight,
  Flame,
  BrainCircuit,
  Sparkles,
  Zap,
} from "lucide-react";

interface ToolsGridSectionProps {
  t: {
    tools: {
      wheel: { name: string; desc: string; gimmick: string };
      disc: { name: string; desc: string; gimmick: string };
      money: { name: string; desc: string; gimmick: string };
      quotes: { name: string; desc: string; gimmick: string };
    };
  };
}

export default function ToolsGridSection({ t }: ToolsGridSectionProps) {
  const tools = [
    {
      id: "wheel",
      name: t.tools.wheel.name,
      desc: t.tools.wheel.desc,
      icon: <PieChart size={28} className="text-red-600" />,
      path: "/tools/wheel-of-life",
      color: "bg-red-50 border-red-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm group-hover:bg-red-100 group-hover:text-red-900 transition-colors duration-300">
          <Flame size={12} className="text-red-500 group-hover:text-red-900 transition-colors animate-pulse" />
          <span>{t.tools.wheel.gimmick}</span>
        </div>
      ),
    },
    {
      id: "disc",
      name: t.tools.disc.name,
      desc: t.tools.disc.desc,
      icon: <Users size={28} className="text-blue-600" />,
      path: "/tools/disc",
      color: "bg-blue-50 border-blue-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors duration-300">
          <Users size={12} className="text-blue-500 group-hover:text-blue-900 transition-colors" />
          <span>{t.tools.disc.gimmick}</span>
        </div>
      ),
    },
    {
      id: "money",
      name: t.tools.money.name,
      desc: t.tools.money.desc,
      icon: <Wallet size={28} className="text-amber-600" />,
      path: "/tools/money-avatar",
      color: "bg-amber-50 border-amber-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 shadow-sm group-hover:bg-amber-100 group-hover:text-amber-950 transition-colors duration-300">
          <BrainCircuit size={12} className="text-amber-500 group-hover:text-amber-950 transition-colors" />
          <span>{t.tools.money.gimmick}</span>
        </div>
      ),
    },
    {
      id: "library-souls",
      name: "Library Of Souls",
      desc: "สไตล์การอ่านสะท้อนตัวตน 16 รูปแบบ",
      icon: <BookOpen size={24} className="text-emerald-600" />,
      path: "/tools/library-of-souls",
      color: "bg-emerald-50/50 border-emerald-100",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors duration-300">
          <BookOpen size={12} className="text-emerald-500" />
          <span>ค้นหา Reading Soul</span>
        </div>
      ),
    },
    {
      id: "quotes",
      name: t.tools.quotes.name,
      desc: t.tools.quotes.desc,
      icon: <Quote size={28} className="text-purple-600" />,
      path: "/tools/khomsatsat",
      color: "bg-purple-50 border-purple-200",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-600 rounded-full text-[10px] font-black tracking-widest border border-purple-100 shadow-sm group-hover:bg-purple-100 group-hover:text-purple-900 transition-colors duration-300">
          <Sparkles size={12} className="text-purple-500 group-hover:text-purple-900 transition-colors" />
          <span>{t.tools.quotes.gimmick}</span>
        </div>
      ),
    },
    {
      id: "ai-mentor",
      name: "คุยกับพี่ฟุ้ย",
      desc: "ที่ปรึกษาพัฒนาตัวเองส่วนตัวระดับโปร",
      icon: <MessageSquareMore size={28} className="text-slate-600" />,
      path: "/tools/soul-guide",
      color: "bg-slate-100 border-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
      gimmickUI: (
        <div className="tool-gimmick mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-200 text-slate-700 rounded-full text-[10px] font-black tracking-widest border border-slate-300 shadow-sm group-hover:from-slate-300 group-hover:to-zinc-200 group-hover:text-slate-900 transition-all duration-300">
          <Zap size={12} className="text-slate-500 group-hover:text-slate-900 transition-colors animate-pulse" />
          <span>PRO MENTORSHIP</span>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto mb-12 w-[calc(100%-2rem)] max-w-6xl rounded-[2.5rem] border border-slate-100/80 bg-white/70 px-4 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:w-[calc(100%-4rem)] md:px-7 md:py-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            Growth OS Apps
          </span>
          <h2 className="mt-1 text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            เครื่องมือเฉพาะสำหรับคุณ
          </h2>
        </div>
        <p className="max-w-md text-sm font-bold leading-relaxed text-slate-500 md:text-right">
          เลือกเครื่องมือที่อยากใช้ เพื่ออัพสกิลของคุณ
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {tools.map((tool, index) => (
          <Link key={tool.id} href={`${tool.path}/info`} className="block h-full group">
            <div className="relative flex h-full min-h-[210px] cursor-pointer flex-col overflow-hidden rounded-[1.65rem] border border-white bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] sm:min-h-[230px] sm:rounded-[2rem] sm:p-6 [&_.tool-gimmick]:mt-2 [&_.tool-gimmick]:max-w-full [&_.tool-gimmick]:px-2 [&_.tool-gimmick]:py-1 [&_.tool-gimmick]:text-[8px] [&_.tool-gimmick_span]:whitespace-nowrap sm:[&_.tool-gimmick]:mt-3 sm:[&_.tool-gimmick]:px-3 sm:[&_.tool-gimmick]:py-1.5 sm:[&_.tool-gimmick]:text-[10px]">
              <div
                className={`absolute inset-0 opacity-70 ${
                  index % 6 === 0
                    ? "bg-gradient-to-br from-red-50 via-white to-rose-50"
                    : index % 6 === 1
                    ? "bg-gradient-to-br from-blue-50 via-white to-sky-50"
                    : index % 6 === 2
                    ? "bg-gradient-to-br from-amber-50 via-white to-orange-50"
                    : index % 6 === 3
                    ? "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
                    : index % 6 === 4
                    ? "bg-gradient-to-br from-purple-50 via-white to-fuchsia-50"
                    : "bg-gradient-to-br from-slate-100 via-white to-sky-50"
                }`}
              />

              <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
                <div
                  className={`rounded-[1.1rem] border p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] ${tool.color} transition-all duration-300 group-hover:rotate-6 group-hover:scale-105 sm:rounded-[1.35rem] sm:p-4 [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7`}
                >
                  {tool.icon}
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-300 shadow-sm transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white sm:h-11 sm:w-11">
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform duration-300 sm:h-5 sm:w-5"
                  />
                </div>
              </div>

              <div className="relative z-10 mt-auto pt-6 sm:pt-8">
                <h3 className="text-[16px] font-black leading-tight text-slate-950 transition-colors group-hover:text-slate-800 sm:text-xl">
                  {tool.name}
                </h3>
                <p className="mt-2 min-h-[44px] text-[11px] font-bold leading-relaxed text-slate-500 sm:min-h-[48px] sm:text-sm">
                  {tool.desc}
                </p>
                <div className="mt-3 min-h-[28px] overflow-hidden sm:mt-5 sm:min-h-[36px]">
                  <div className="inline-flex max-w-full">{tool.gimmickUI}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
