"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Target, Zap, BookOpen, Gift, MessageSquare, Ghost, Clock, Moon, PenLine } from "lucide-react";

interface StoryBridgeBannerProps {
  lastWheel?: any;
  lastDisc?: any;
  lastMoney?: any;
  lastQuote?: any;
  lastLibrarySoul?: any;
  claimedReadArticlesCount?: number;
  secondBrainNotesCount?: number;
  hasRedeemedReward?: boolean;
  hasChattedWithFuii?: boolean;
  lastGhostResult?: any;
  hasCompletedFocusRoom?: boolean;
  hasCompletedMemento?: boolean;
  completedQuestsCount?: number;
  hasCompletedPhase1Quests?: boolean;
  isPhase3Completed?: boolean;
}

export default function StoryBridgeBanner({
  lastWheel,
  lastDisc,
  lastMoney,
  lastQuote,
  lastLibrarySoul,
  claimedReadArticlesCount = 0,
  secondBrainNotesCount = 0,
  hasRedeemedReward = false,
  hasChattedWithFuii = false,
  lastGhostResult,
  hasCompletedFocusRoom = false,
  hasCompletedMemento = false,
  completedQuestsCount = 0,
  hasCompletedPhase1Quests = false,
  isPhase3Completed = false,
}: StoryBridgeBannerProps) {
  const currentStep = useMemo(() => {
    // Phase 1: ค้นหาตัวตน
    if (!lastWheel) {
      return {
        phase: "Phase 1: ค้นหาตัวตน",
        tagStyle: "bg-amber-100 text-amber-800 border-amber-300/80",
        story: "ก้าวแรกของการสร้างระบบชีวิต เริ่มต้นจากการสแกนความจริงทั้ง 8 ด้าน",
        cta: "สแกน Wheel of Life",
        path: "/tools/wheel-of-life",
        icon: Target,
        iconBg: "bg-amber-100 text-amber-700 border-amber-200",
        buttonGradient: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20 text-white",
      };
    }

    const hasDoneQuests = hasCompletedPhase1Quests || completedQuestsCount >= 2;
    if (!hasDoneQuests) {
      return {
        phase: "Phase 1: ค้นหาตัวตน",
        tagStyle: "bg-violet-100 text-violet-800 border-violet-300/80",
        story: "การเปลี่ยนแปลงที่ยั่งยืน เริ่มต้นจาก Small Win สั้นๆ ที่ทำเสร็จได้ในทุกวัน",
        cta: "ทำ Daily Quests",
        path: "/dashboard?tab=quests",
        icon: Zap,
        iconBg: "bg-violet-100 text-violet-700 border-violet-200",
        buttonGradient: "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/20 text-white",
      };
    }

    if (!lastDisc) {
      return {
        phase: "Phase 1: ค้นหาตัวตน",
        tagStyle: "bg-blue-100 text-blue-800 border-blue-300/80",
        story: "เมื่อเห็นภาพรวมชีวิตแล้ว... มาค้นหาสไตล์การสื่อสารและพลังงานร่วมกับคนอื่น",
        cta: "ค้นหาตัวตน DISC",
        path: "/tools/disc",
        icon: Compass,
        iconBg: "bg-blue-100 text-blue-700 border-blue-200",
        buttonGradient: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 text-white",
      };
    }

    if (!lastMoney) {
      return {
        phase: "Phase 1: ค้นหาตัวตน",
        tagStyle: "bg-amber-100 text-amber-800 border-amber-300/80",
        story: "รู้สไตล์ตัวเองแล้ว... อีกหนึ่งตัวตนที่สำคัญคือ 'นิสัยทางการเงิน' คุณเป็น Avatar แบบไหน?",
        cta: "ถอดรหัส Money Avatar",
        path: "/tools/money-avatar",
        icon: Sparkles,
        iconBg: "bg-amber-100 text-amber-700 border-amber-200",
        buttonGradient: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20 text-slate-950 font-black",
      };
    }

    if (!lastQuote) {
      return {
        phase: "Phase 1: ค้นหาตัวตน",
        tagStyle: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300/80",
        story: "เข้าใจทั้งคนและเงินแล้ว... มาสำรวจความรู้สึกข้างในวันนี้ แล้วตกผลึกเป็นคำคมประจำใจ",
        cta: "สร้างคำคม คมสัดสัด",
        path: "/tools/khomsatsat",
        icon: Moon,
        iconBg: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
        buttonGradient: "from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 shadow-fuchsia-500/20 text-white",
      };
    }

    // Phase 2: สุขระหว่างทาง
    if (!lastLibrarySoul) {
      return {
        phase: "Phase 2: สุขระหว่างทาง",
        tagStyle: "bg-emerald-100 text-emerald-800 border-emerald-300/80",
        story: "คุณค้นหาตัวตนครบแล้ว! ก้าวสู่ Phase 2 ค้นหาสไตล์การดูดซับความรู้เฉพาะตัว",
        cta: "ค้นหา Library of Souls",
        path: "/tools/library-of-souls",
        icon: BookOpen,
        iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        buttonGradient: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 text-white",
      };
    }

    if (claimedReadArticlesCount < 2 || secondBrainNotesCount < 1) {
      return {
        phase: "Phase 2: สุขระหว่างทาง",
        tagStyle: "bg-amber-100 text-amber-800 border-amber-300/80",
        story: "รู้สไตล์การอ่านแล้ว... ลองอ่านบทความในคลังสมองและจดบันทึกความคิดลง Second Brain",
        cta: "เข้าสู่ คลังสมอง",
        path: "/library",
        icon: BookOpen,
        iconBg: "bg-amber-100 text-amber-700 border-amber-200",
        buttonGradient: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20 text-slate-950 font-black",
      };
    }

    if (!hasRedeemedReward) {
      return {
        phase: "Phase 2: สุขระหว่างทาง",
        tagStyle: "bg-pink-100 text-pink-800 border-pink-300/80",
        story: "สะสมปัญญามาแล้ว... แวะ Happiness Shop นำ XP ไปแลกของรางวัลเติมใจระหว่างทาง",
        cta: "ไปที่ Happiness Shop",
        path: "/shop",
        icon: Gift,
        iconBg: "bg-pink-100 text-pink-700 border-pink-200",
        buttonGradient: "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/20 text-white",
      };
    }

    if (!hasChattedWithFuii) {
      return {
        phase: "Phase 2: สุขระหว่างทาง",
        tagStyle: "bg-violet-100 text-violet-800 border-violet-300/80",
        story: "เติมพลังใจเรียบร้อย... ได้เวลามาคุยกับพี่ฟุ้ย เพื่อนำทุกเรื่องราวมาสังเคราะห์และรับคำแนะนำ",
        cta: "คุยกับพี่ฟุ้ย",
        path: "/tools/soul-guide",
        icon: MessageSquare,
        iconBg: "bg-violet-100 text-violet-700 border-violet-200",
        buttonGradient: "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/20 text-white",
      };
    }

    // Phase 3: ระลึกความตาย
    if (!lastGhostResult) {
      return {
        phase: "Phase 3: ระลึกความตาย",
        tagStyle: "bg-rose-100 text-rose-800 border-rose-300/80",
        story: "สร้างความสุขและปัญญาแล้ว... ก้าวสู่บททดสอบสำคัญ เผชิญหน้ากับความกลัวลึกๆ ในตัวคุณ",
        cta: "เผชิญหน้า Ghost in You",
        path: "/tools/ghost-in-you",
        icon: Ghost,
        iconBg: "bg-rose-100 text-rose-700 border-rose-200",
        buttonGradient: "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20 text-white",
      };
    }

    if (!hasCompletedFocusRoom) {
      return {
        phase: "Phase 3: ระลึกความตาย",
        tagStyle: "bg-sky-100 text-sky-800 border-sky-300/80",
        story: "เมื่อรู้ทันความกลัวแล้ว... เข้าสู่ Focus Room เพื่อตัดเสียงรบกวนและฝึกสมาธิแบบ Deep Work",
        cta: "เข้าสู่ Focus Room",
        path: "/tools/focus-room",
        icon: Clock,
        iconBg: "bg-sky-100 text-sky-700 border-sky-200",
        buttonGradient: "from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/20 text-white",
      };
    }

    if (!hasCompletedMemento && !isPhase3Completed) {
      return {
        phase: "Phase 3: ระลึกความตาย",
        tagStyle: "bg-amber-100 text-amber-900 border-amber-300/80",
        story: "จิตใจนิ่งและมีสมาธิแล้ว... สู่จุดหมายปลายทาง ทบทวนคุณค่าของเวลาชีวิตที่เหลืออยู่",
        cta: "ทบทวน Memento Mori",
        path: "/dashboard?memento=1",
        icon: Compass,
        iconBg: "bg-amber-100 text-amber-800 border-amber-200",
        buttonGradient: "from-amber-600 to-[#8B5A2B] hover:from-amber-700 hover:to-[#704823] shadow-amber-600/20 text-white",
      };
    }

    return {
      phase: "สู่ชีวิตจริง (Real Life)",
      tagStyle: "bg-emerald-100 text-emerald-800 border-emerald-300/80",
      story: "คุณผ่านการฝึกฝนครบทั้ง 3 Phase แล้ว — นำบทเรียนและตัวตนที่เติบโตนี้ ออกไปใช้ชีวิตจริงได้เลยครับ",
      cta: "เริ่มใช้งาน Daily Mastery",
      path: "/dashboard",
      icon: Sparkles,
      iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      buttonGradient: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 text-white",
    };
  }, [
    lastWheel,
    lastDisc,
    lastMoney,
    lastQuote,
    lastLibrarySoul,
    claimedReadArticlesCount,
    secondBrainNotesCount,
    hasRedeemedReward,
    hasChattedWithFuii,
    lastGhostResult,
    hasCompletedFocusRoom,
    hasCompletedMemento,
    completedQuestsCount,
    hasCompletedPhase1Quests,
    isPhase3Completed,
  ]);

  const IconComponent = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-6"
    >
      {/* 📜 Warm Journal Paper Card with Clean Minimal Paper Aesthetic */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[#E8DEC8] bg-[#FFFDF9] p-4 sm:p-5 text-slate-800 shadow-[0_10px_28px_rgba(215,195,165,0.22)]">
        
        {/* Subtle Decorative Paper Corner Crease / Tape Effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F4ECE1]/80 to-transparent pointer-events-none rounded-tr-[2rem]" />
        
        {/* Top Notebook Line Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          {/* Left Column: Icon + Phase Tag + Story Text */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${currentStep.iconBg}`}>
              <IconComponent size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border shadow-2xs ${currentStep.tagStyle}`}>
                  {currentStep.phase}
                </span>
                <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                  <PenLine size={11} className="text-slate-600" />
                  บันทึกก้าวต่อไป
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-700 font-bold leading-relaxed tracking-tight">
                "{currentStep.story}"
              </p>
            </div>
          </div>

          {/* Right Column: Clean Action Button */}
          <div className="flex items-center shrink-0 self-end sm:self-center">
            <Link
              href={currentStep.path}
              className={`inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r ${currentStep.buttonGradient} font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap`}
            >
              <span>{currentStep.cta}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
