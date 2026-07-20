"use client";

import React, { forwardRef } from "react";
import { PersonaResult } from "@/data/personalityZeroData";
import { Sparkles, Flame, Shield, Compass, Brain, Zap } from "lucide-react";

interface PersonalityZeroShareCardProps {
  persona: PersonaResult;
  percentage?: number;
}

export const PersonalityZeroShareCard = forwardRef<
  HTMLDivElement,
  PersonalityZeroShareCardProps
>(({ persona, percentage = 14.2 }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
      className="relative flex flex-col justify-between p-5 sm:p-6 bg-white text-neutral-900 rounded-[2.2rem] sm:rounded-[2.5rem] border-2 border-neutral-900 overflow-hidden shadow-2xl w-full max-w-[340px] sm:max-w-[360px] min-h-[580px] sm:min-h-[640px] select-none"
    >
      {/* Subtle Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between border-b border-neutral-200 pb-3.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">
              PersonalityZero
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-600 border border-red-200">
              ความแม่นยำ 0%
            </span>
          </div>
          <h4 className="text-xs font-bold text-neutral-600">แบบประเมิน "ทำไปทำไม?" 🤪</h4>
        </div>
        <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center p-1 shadow-inner overflow-hidden">
          <img
            src="/assets/personalityzero/zero.png"
            alt="PersonalityZero"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Center Persona Card Body */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Persona Code (Giant 4-letter title) */}
        <h2 className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-wider uppercase mb-1">
          {persona.code}
        </h2>

        {/* Persona Title Badge (Small English badge) */}
        <div className="px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-red-50 text-red-600 border border-red-200 uppercase mb-2 shadow-sm">
          {persona.title}
        </div>

        {/* Avatar Image Display */}
        <div className="relative w-28 h-28 my-2 rounded-2xl overflow-hidden border-2 border-neutral-900 shadow-xl bg-neutral-100 flex items-center justify-center">
          <img
            src={persona.image}
            alt={persona.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Persona Subtitle */}
        <p className="text-xs sm:text-sm font-extrabold text-neutral-700 mb-2">
          {persona.subtitle}
        </p>

        {/* Population Stats Pill (Right under avatar image & subtitle) */}
        <div className="mb-3 px-3.5 py-1 rounded-xl bg-red-50 border border-red-200 text-[11px] font-bold text-red-600 flex items-center gap-1.5 shadow-sm">
          <Flame size={13} className="text-red-600 animate-pulse shrink-0" />
          <span>คุณคือ <strong className="text-neutral-950 font-black">{percentage}%</strong> ของประชากรที่ได้สายนี้</span>
        </div>

        {/* Bullet Traits List */}
        <div className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 space-y-2 text-left shadow-inner">
          {persona.traits.map((trait, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-red-600 font-bold text-xs shrink-0 mt-0.5">✦</span>
              <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                {trait}
              </p>
            </div>
          ))}
        </div>

        {/* Reality Check Quote Banner (Formatted into 3 clean lines) */}
        <div className="w-full mt-3 p-3 rounded-2xl bg-neutral-950 text-white border border-red-600 text-center space-y-1 shadow-md">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 text-[9px] font-black tracking-wider uppercase">
            <Flame size={10} /> REALITY CHECK
          </div>
          <p className="text-[10px] font-bold text-neutral-200 leading-snug">
            "แบบประเมินนี้บอกตัวตนคุณได้แค่อย่างมากก็ <span className="text-red-500 font-black">1%</span> <br />
            ส่วนอีก <span className="text-white underline decoration-red-600 font-black">99%</span> ที่เหลือ ขึ้นอยู่กับการกระทำจริงของคุณ <br />
            <span className="text-red-400 font-black">อย่าปล่อยให้แบบประเมินไหน มากำหนดว่าคุณเป็นคนยังไง!</span>"
          </p>
        </div>
      </div>

      {/* Footer Branding Watermark */}
      <div className="relative z-10 pt-3 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="text-neutral-400">by</span>
          <span className="font-black text-neutral-950">อัพสกิลกับฟุ้ย</span>
        </div>
        <span className="text-red-600 font-black tracking-wide text-[11px]">Personality Zero</span>
      </div>
    </div>
  );
});

PersonalityZeroShareCard.displayName = "PersonalityZeroShareCard";
