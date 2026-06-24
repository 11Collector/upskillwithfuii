"use client";

import { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Sparkles, Trophy, X, Camera, Moon, Laptop, Ticket, Key, LayoutGrid, PiggyBank, BookOpen, SlidersHorizontal, Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// 🎨 1. Categories & Themes Definition
const rewardCategories = [
  {
    key: "joy",
    label: "Joy",
    labelTh: "ความสุขเล็ก ๆ",
    description: "รางวัลที่เติม dopamine เบา ๆ ทำให้การพัฒนาตัวเองสนุกขึ้น",
    color: "yellow",
    icon: "sparkles"
  },
  {
    key: "rest",
    label: "Rest",
    labelTh: "พักและชาร์จพลัง",
    description: "รางวัลที่ช่วยให้พักแบบไม่รู้สึกผิด ลด burnout และฟื้นพลังใจ",
    color: "blue",
    icon: "moon"
  },
  {
    key: "growth",
    label: "Growth",
    labelTh: "อัปสกิลและเติบโต",
    description: "รางวัลที่ลงทุนกับความรู้ ทักษะ mindset และการพัฒนาตัวเอง",
    color: "green",
    icon: "book"
  },
  {
    key: "environment",
    label: "Environment",
    labelTh: "อัปเกรดสภาพแวดล้อม",
    description: "รางวัลที่ทำให้พื้นที่ทำงาน การเรียน และ routine ดีขึ้น",
    color: "purple",
    icon: "desk"
  },
  {
    key: "experience",
    label: "Experience",
    labelTh: "ประสบการณ์ใหม่",
    description: "รางวัลที่พาตัวเองออกจาก routine เดิม ๆ เติมแรงบันดาลใจและความทรงจำ",
    color: "orange",
    icon: "ticket"
  },
  {
    key: "freedom",
    label: "Freedom",
    labelTh: "อิสรภาพและชีวิตที่เลือกเอง",
    description: "รางวัลปลายทางที่เกี่ยวกับเวลา อิสรภาพ การเงิน และชีวิตเวอร์ชันใหม่",
    color: "gold",
    icon: "portal"
  }
];

const CATEGORY_THEMES: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; hoverBorderColor: string }> = {
  "ทั้งหมด": {
    icon: <LayoutGrid size={18} />,
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    hoverBorderColor: "hover:border-slate-300"
  },
  "joy": {
    icon: <Sparkles size={20} />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200/60",
    hoverBorderColor: "hover:border-amber-300/60"
  },
  "rest": {
    icon: <Moon size={20} />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200/60",
    hoverBorderColor: "hover:border-blue-300/60"
  },
  "growth": {
    icon: <BookOpen size={20} />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200/60",
    hoverBorderColor: "hover:border-emerald-300/60"
  },
  "environment": {
    icon: <Laptop size={20} />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200/60",
    hoverBorderColor: "hover:border-purple-300/60"
  },
  "experience": {
    icon: <Ticket size={20} />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200/60",
    hoverBorderColor: "hover:border-orange-300/60"
  },
  "freedom": {
    icon: <Key size={20} />,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200/60",
    hoverBorderColor: "hover:border-rose-300/60"
  }
};

const shopItems = [
  // 🟢 Tier 1: Daily Reward
  { id: 1, title: "กาแฟคราฟต์พิเศษ", desc: "เติมพลังความสดชื่นยามเช้า ช่วยให้มีสมาธิทำงานได้มีประสิทธิภาพมากขึ้น", price: 20, tier: "daily", category: "joy" },
  { id: 2, title: "เค้ก / เบเกอรี่แสนอร่อย", desc: "รางวัลชิ้นเล็ก ๆ ระหว่างวันเพื่อกระตุ้นสารโดปามีนและความสุขในการเรียนรู้", price: 25, tier: "daily", category: "joy" },
  { id: 3, title: "มื้อพิเศษตามใจปาก", desc: "ชาร์จพลังกายหลังลุยงานหนัก คลายความเครียดด้วยอาหารมื้อโปรด", price: 30, tier: "daily", category: "joy" },
  { id: 4, title: "ตั๋ววันขี้เกียจ 1 วัน", desc: "พักผ่อนแบบไร้ความรู้สึกผิด ป้องกันภาวะหมดไฟและฟื้นฟูพลังสมอง", price: 30, tier: "daily", category: "rest", minLevel: 3 },
  { id: 5, title: "สมาชิก AI Tools รายเดือน", desc: "ลงทุนกับเครื่องมือช่วยทุ่นแรง เพิ่ม Productivity และขีดความสามารถการทำงาน", price: 30, tier: "daily", category: "growth", minLevel: 4 },
  { id: 6, title: "สมุดบันทึกและปากกาคู่ใจ", desc: "เขียนเรียบเรียงความคิด ทบทวนเป้าหมายชีวิตและตกผลึกการเรียนรู้ประจำวัน", price: 35, tier: "daily", category: "growth" },
  { id: 7, title: "สติกเกอร์สร้างแรงบันดาลใจ", desc: "เตือนสติความตั้งใจด้วยข้อความเชิงบวกบนโต๊ะทำงานหรือของใช้ส่วนตัว", price: 35, tier: "daily", category: "joy" },
  { id: 8, title: "เมล็ดกาแฟคัดเกรดพิเศษ", desc: "สร้างสุนทรียภาพยามเช้าด้วยการดริปกาแฟ ฝึกสมาธิและความประณีต", price: 35, tier: "daily", category: "joy" },
  { id: 9, title: "แก้วน้ำเก็บความเย็น", desc: "ดูแลสุขภาพร่างกายให้ไฮเดรตตลอดการทำงาน สะดวกและเป็นมิตรกับสิ่งแวดล้อม", price: 40, tier: "daily", category: "environment" },
  { id: 10, title: "เซตวิตามินบำรุงร่างกาย", desc: "ดูแลสุขภาพและสารอาหารที่จำเป็น ช่วยบำรุงประสาทและการทำงานของสมอง", price: 40, tier: "daily", category: "rest" },

  // 🟡 Tier 2: Weekend Reward
  { id: 11, title: "ชุดนอนผ้าเกรดพรีเมียม", desc: "ยกระดับคุณภาพการนอนหลับลึก เพื่อเช้าวันใหม่ที่สดใสและตื่นตัวเต็มที่", price: 50, tier: "weekend", category: "rest", minLevel: 6 },
  { id: 12, title: "มื้อปิ้งย่าง / ชาบูชุดใหญ่", desc: "สังสรรค์และกระชับความสัมพันธ์กับเพื่อนหรือครอบครัวในวันหยุด", price: 50, tier: "weekend", category: "joy", minLevel: 5 },
  { id: 13, title: "บอร์ดเกมพกพา / การ์ดเกม", desc: "คลายเครียด ฝึกสมอง และสร้างเสียงหัวเราะร่วมกับคนรอบข้างในปาร์ตี้", price: 50, tier: "weekend", category: "joy" },
  { id: 14, title: "ตั๋ว Digital Detox 1 วัน", desc: "ตัดขาดจากหน้าจอและโลกออนไลน์ชั่วคราว เพื่อฟื้นฟูสมาธิและความเงียบสงบในใจ", price: 55, tier: "weekend", category: "rest", minLevel: 7 },
  { id: 15, title: "หนังสือพัฒนาตนเองเล่มใหม่", desc: "เปิดมุมมองใหม่ อัพเดต Mindset และเติมองค์ความรู้สำหรับพัฒนาชีวิตด้านต่าง ๆ", price: 55, tier: "weekend", category: "growth" },
  { id: 16, title: "ตั๋วชมภาพยนตร์พรีเมียม", desc: "เสพสื่อศิลปะและความบันเทิงเต็มรูปแบบ เพื่อหลบหนีความวุ่นวายชั่วคราว", price: 60, tier: "weekend", category: "experience" },
  { id: 17, title: "คอร์สอัพสกิลออนไลน์ระยะสั้น", desc: "เรียนรู้ทักษะใหม่ที่ใช้งานได้จริง เพิ่มความก้าวหน้าในสายอาชีพและการทำงาน", price: 70, tier: "weekend", category: "growth", minLevel: 8 },
  { id: 18, title: "หมอนหนุนเพื่อสุขภาพ", desc: "แก้ปัญหาออฟฟิศซินโดรมและการปวดเมื่อยเวลานอน เพื่อสุขภาพกายที่ดีขึ้น", price: 70, tier: "weekend", category: "rest" },
  { id: 19, title: "บอร์ดเกมวางแผนกลยุทธ์", desc: "ฝึกการคิดวิเคราะห์ แก้ไขปัญหาเฉพาะหน้า และวางหมากกลยุทธ์อย่างสนุกสนาน", price: 75, tier: "weekend", category: "growth" },
  { id: 20, title: "หนังสือการ์ตูนยกเซ็ต", desc: "ผ่อนคลายจิตใจ เติมเต็มจินตนาการ และความสุขจากเรื่องราววัยเด็ก", price: 80, tier: "weekend", category: "joy" },

  // 🟠 Tier 3: Mid Reward
  { id: 21, title: "ชุดอุปกรณ์ดริปกาแฟ", desc: "สร้างมุมโปรดส่วนตัว ฝึกฝนทักษะการชง และมีความสุขกับกลิ่นหอมในบ้าน", price: 90, tier: "mid", category: "environment" },
  { id: 22, title: "สมาชิกคอร์สเรียน VIP", desc: "เปิดโอกาสให้เข้าถึงความรู้อย่างไม่จำกัด ปราศจากโฆษณาคั่นเพื่อสมาธิที่ดีเยี่ยม", price: 90, tier: "mid", category: "growth" },
  { id: 23, title: "แพ็กเกจนวดสปาบำบัด", desc: "ผ่อนคลายกล้ามเนื้อที่อ่อนล้าสะสมจากการทำงานหนัก ปรับสมดุลกายและจิตใจ", price: 100, tier: "mid", category: "rest" },
  { id: 24, title: "กล่องสุ่มโมเดลสุดฮิต", desc: "เติมเต็มความสุขทางสายตา แต่งแต้มโต๊ะทำงานให้น่ามองและเพลิดเพลิน", price: 120, tier: "mid", category: "joy" },
  { id: 25, title: "แผ่นเกมคอนโซลแผ่นใหม่", desc: "ให้รางวัลตัวเองด้วยการดื่มด่ำกับเกมโปรด ฝึกทักษะการตัดสินใจและจินตนาการ", price: 120, tier: "mid", category: "joy" },
  { id: 26, title: "หูฟังตัดเสียงรบกวนไร้สาย", desc: "ตัดเสียงรบกวนเพื่อเข้าสู่สภาวะ Deep Work และทำงานได้อย่างมีสมาธิสูงสุด", price: 130, tier: "mid", category: "environment", minLevel: 12 },
  { id: 27, title: "คอร์สเรียนเร่งรัด Bootcamp", desc: "ติวเข้มทักษะสำคัญเชิงลึกกับผู้เชี่ยวชาญ เพื่อยกระดับโปรไฟล์สายอาชีพของคุณ", price: 140, tier: "mid", category: "growth" },
  { id: 28, title: "มื้อค่ำบุฟเฟต์โรงแรมหรู", desc: "สัมผัสประสบการณ์ดินเนอร์ชั้นเลิศ เติมเต็มความสุขด้านประสาทสัมผัสและบริการ", price: 150, tier: "mid", category: "experience" },
  { id: 29, title: "ผลิตภัณฑ์บำรุงผิวหรือน้ำหอม", desc: "ดูแลภาพลักษณ์ภายนอก สร้างเสน่ห์ความมั่นใจ และความน่าเชื่อถือในสังคม", price: 150, tier: "mid", category: "rest" },
  { id: 30, title: "ชุดทำงาน Smart Casual", desc: "ปรับบุคลิกภาพให้ดูดี พร้อมรับโอกาสใหม่ๆ ในที่ทำงานหรือวันนำเสนองานสำคัญ", price: 180, tier: "mid", category: "environment" },

  // 🔴 Tier 4: Epic Reward
  { id: 31, title: "โมเดลสะสม Limited Edition", desc: "ของสะสมที่มีเรื่องราวเฉพาะตัว ช่วยสร้างความภูมิใจและแรงผลักดันเชิงบวก", price: 200, tier: "epic", category: "joy" },
  { id: 32, title: "เครื่องประดับทองคำ / อัญมณี", desc: "สะสมสินทรัพย์มีค่าที่แสดงถึงความมั่นคง และให้รางวัลชีวิตชิ้นสำคัญ", price: 200, tier: "epic", category: "freedom" },
  { id: 33, title: "รองเท้า Sneakers คู่โปรด", desc: "ทะนุถนอมสุขภาพเท้าเพื่อการก้าวเดินในทุก ๆ วัน พร้อมดีไซน์ที่มั่นใจ", price: 250, tier: "epic", category: "environment" },
  { id: 34, title: "ตั๋วคอนเสิร์ต / มิวสิคเฟสติวัล", desc: "ร่วมสัมผัสบรรยากาศดนตรีสดและผู้คน ปลดปล่อยพลังงานและความทรงจำสุดพิเศษ", price: 250, tier: "epic", category: "experience", minLevel: 18 },
  { id: 35, title: "คีย์บอร์ดกลไก Custom", desc: "ปรับแต่งสัมผัสการพิมพ์และความสวยงามตามต้องการ ช่วยให้การเขียนงานเป็นเรื่องสนุก", price: 300, tier: "epic", category: "environment", minLevel: 10 },
  { id: 36, title: "ทริปพักผ่อน 2 วัน 1 คืน", desc: "พาตัวเองออกจากสิ่งแวดล้อมเดิม ๆ ไปผ่อนคลายสมองท่ามกลางวิวธรรมชาติแสนสงบ", price: 350, tier: "epic", category: "experience" },
  { id: 37, title: "เก้าอี้เพื่อสุขภาพ Ergonomic", desc: "ลงทุนกับสุขภาพหลังในระยะยาว ลดความเมื่อยล้าสะสมจากการนั่งทำงานหลายชั่วโมง", price: 400, tier: "epic", category: "environment", minLevel: 15 },
  { id: 38, title: "ตั๋วเที่ยวต่างประเทศโซนใกล้", desc: "เปิดโลกทัศน์เรียนรู้วัฒนธรรมใหม่ สะสมประสบการณ์การผจญภัยและเติบโตภายนอก", price: 500, tier: "epic", category: "experience" },
  { id: 39, title: "ตั๋วเครื่องบิน Business Class", desc: "สัมผัสความสะดวกสบายระดับพรีเมียม เพื่อเดินทางไกลโดยไม่เพลียล้าสะสม", price: 600, tier: "epic", category: "experience" },
  { id: 40, title: "เครื่องชงกาแฟเอสเพรสโซสตูดิโอ", desc: "ยกระดับบาร์กาแฟที่บ้าน ให้คุณควบคุมรสชาติที่โปรดปรานได้ทุกแก้วด้วยตัวเอง", price: 750, tier: "epic", category: "environment" },

  // 🟣 Tier 5: Legendary Reward
  { id: 41, title: "พอร์ตสินทรัพย์การเงินแรก", desc: "เริ่มสะสมความมั่งคั่งอย่างเป็นรูปธรรม สร้างความอุ่นใจและปูพื้นฐานสู่อิสรภาพการเงิน", price: 900, tier: "legendary", category: "freedom" },
  { id: 42, title: "ปรับปรุงห้องทำงาน / ห้องสมุด", desc: "จัดสภาพแวดล้อมภายในบ้านให้เอื้อต่อการเรียนรู้ ทำงานสร้างสรรค์ และมีสมาธิ", price: 1200, tier: "legendary", category: "environment" },
  { id: 43, title: "คอมพิวเตอร์เวิร์กสเตชันสูง", desc: "เพิ่มความเร็วในการประมวลผลงาน ออกแบบ หรือตัดต่อคอนเทนต์แบบมืออาชีพ", price: 1300, tier: "legendary", category: "environment" },
  { id: 44, title: "รีทรีตพักใจเป้าหมายชีวิต", desc: "ใช้เวลาอยู่กับตัวเองอย่างจริงจัง เพื่อทบทวนเป้าหมาย วางแผนอนาคต และตั้งหลักชีวิตใหม่", price: 1400, tier: "legendary", category: "rest", minLevel: 25 },
  { id: 45, title: "โค้ชชิ่งปลดล็อกเป้าหมาย 1:1", desc: "รับคำแนะนำตรงจุดจากผู้เชี่ยวชาญ เพื่อเร่งการเติบโตและผ่านอุปสรรคสำคัญในชีวิต", price: 1500, tier: "legendary", category: "growth", minLevel: 20 },
  { id: 46, title: "ทริป Workation ต่างประเทศ", desc: "สัมผัสบรรยากาศทำงานสไตล์ดิจิทัลเร่ร่อน เพื่อค้นพบแรงบันดาลใจและความคิดริเริ่มสร้างสรรค์", price: 1600, tier: "legendary", category: "experience", minLevel: 22 },
  { id: 47, title: "เซตกล้องและอุปกรณ์สร้างสรรค์", desc: "เริ่มผลิตผลงานและสร้างแบรนด์ส่วนตัวบนออนไลน์อย่างมืออาชีพด้วยอุปกรณ์ครบชุด", price: 1700, tier: "legendary", category: "environment" },
  { id: 48, title: "แพ็กเกจตรวจสุขภาพ VIP", desc: "ตรวจเช็กสุขภาพร่างกายอย่างเจาะลึกล่วงหน้า เพื่อการป้องกันและมีอายุที่ยืนยาวแข็งแรง", price: 1800, tier: "legendary", category: "rest" },
  { id: 49, title: "กองทุนเวลาอิสระ 1 เดือน", desc: "ให้โอกาสตัวเองได้หยุดพักและทดลองทำโปรเจกต์ในฝันอย่างเต็มที่โดยไร้กังวลเรื่องการเงิน", price: 1900, tier: "legendary", category: "freedom", minLevel: 28 },
  { id: 50, title: "ตั๋วอัปเกรดชีวิตครั้งใหญ่", desc: "ตัดสินใจลงทุนในสินทรัพย์ที่เปลี่ยนทิศทางชีวิตได้จริง ไม่ว่าจะเป็นด้านปัญญาหรือเวลาเสรี", price: 2000, tier: "legendary", category: "freedom", minLevel: 30 }
];

const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99];
    const noteDelay = 0.05;

    arpeggio.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * noteDelay);
      const subOsc = ctx.createOscillator();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(freq / 2, now + index * noteDelay);
      const noteStart = now + index * noteDelay;
      const decayDuration = 0.35;
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.08, noteStart + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + decayDuration);

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + decayDuration + 0.05);
      subOsc.start(noteStart);
      subOsc.stop(noteStart + decayDuration + 0.05);
    });
  } catch (e) {
    console.error("Audio Context Error: ", e);
  }
};

// 🎇 Confetti Component
const ConfettiPiece = ({ color, delay }: { color: string; delay: number }) => {
  const randomX = Math.random() * 200 - 100;
  const randomY = Math.random() * -150 - 150;
  const randomRotate = Math.random() * 360;
  const targetX = randomX + (Math.random() * 100 - 50);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 1, 0.5, 0],
        x: [0, randomX, targetX],
        y: [0, randomY, typeof window !== 'undefined' ? window.innerHeight + 100 : 1000],
        rotate: [0, randomRotate, randomRotate * 2],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        ease: "easeOut",
        delay: delay,
      }}
      className="absolute w-2 h-4 rounded-sm"
      style={{
        backgroundColor: color,
        left: "50%",
        top: "50%",
      }}
    />
  );
};

const FramerMotionConfetti = () => {
  const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100002] overflow-hidden">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} color={p.color} delay={p.delay} />
      ))}
    </div>
  );
};

// Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function PremiumShopPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [tierFilter, setTierFilter] = useState("ทั้งหมด");
  const [user, setUser] = useState<User | null>(null);
  const [potXP, setPotXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  // Deposit/Redeem states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");
  const [activePotTab, setActivePotTab] = useState<"deposit" | "withdraw">("deposit");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<any>(null);
  const [redeemedHistory, setRedeemedHistory] = useState<any[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  const router = useRouter();

  const isAdmin = !!(user?.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").filter(Boolean).includes(user.email));

  // Fetch User and potXP from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setPotXP(userData.potXP || 0);
            setTotalXP(userData.totalXP || 0);
            setRedeemedHistory(userData.redeemedHistory || []);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle XP Deposit
  const handleDepositXP = async (amount: number) => {
    if (!user) return;
    const maxTransfer = totalXP % 100;
    if (amount <= 0 || amount > maxTransfer) {
      alert(`จำนวน XP ไม่ถูกต้อง โอนได้สูงสุด ${maxTransfer} XP`);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        totalXP: increment(-amount),
        potXP: increment(amount)
      });

      setTotalXP((prev) => prev - amount);
      setPotXP((prev) => prev + amount);
      setShowDepositModal(false);
      setDepositAmount("");
      setWithdrawAmount("");
      setDepositError("");
      setWithdrawError("");
      setActivePotTab("deposit");
      
      playSuccessChime();
    } catch (error) {
      console.error("Error depositing XP:", error);
      alert("เกิดข้อผิดพลาดในการออม XP");
    }
  };

  // Handle XP Withdrawal (ทุบกระปุก)
  const handleWithdrawXP = async (amount: number) => {
    if (!user) return;
    if (amount <= 0 || amount > potXP) {
      alert("จำนวน XP ไม่ถูกต้อง");
      return;
    }

    try {
      const fee = Math.floor(amount * 0.05);
      const netAmount = amount - fee;

      const oldLevel = Math.floor(totalXP / 100) + 1;
      const newLevel = Math.floor((totalXP + netAmount) / 100) + 1;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        totalXP: increment(netAmount),
        potXP: increment(-amount)
      });

      setTotalXP((prev) => prev + netAmount);
      setPotXP((prev) => prev - amount);

      if (newLevel > oldLevel) {
        sessionStorage.setItem("pendingLevelUp", newLevel.toString());
      }

      setShowDepositModal(false);
      setDepositAmount("");
      setWithdrawAmount("");
      setDepositError("");
      setWithdrawError("");
      setActivePotTab("deposit");
      
      playSuccessChime();
    } catch (error) {
      console.error("Error withdrawing XP:", error);
      alert("เกิดข้อผิดพลาดในการถอน XP");
    }
  };

  // Handle Item Redemption
  const handleRedeemItem = async (item: any) => {
    if (!user) return;
    const currentLevel = Math.floor(totalXP / 100) + 1;
    const isLevelLocked = item.minLevel ? currentLevel < item.minLevel : false;
    if (isLevelLocked) {
      alert(`คุณต้องมีเลเวลอย่างน้อย Level ${item.minLevel} เพื่อแลกชิ้นนี้`);
      return;
    }
    if (potXP < item.price) {
      alert("แต้มในกระปุกไม่เพียงพอ");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const newRedeemedItem = {
        id: item.id,
        title: item.title,
        desc: item.desc || "",
        price: item.price,
        tier: item.tier,
        category: item.category,
        redeemedAt: new Date().toISOString()
      };
      const newHistory = [...redeemedHistory, newRedeemedItem];

      await updateDoc(userRef, {
        potXP: increment(-item.price),
        redeemedHistory: newHistory
      });

      setPotXP((prev) => prev - item.price);
      setRedeemedHistory(newHistory);
      setRedeemedItem(newRedeemedItem);
      setShowConfetti(true);
      setShowTicketModal(true);

      playSuccessChime();
      setTimeout(() => setShowConfetti(false), 4500);
    } catch (error) {
      console.error("Error redeeming item:", error);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล");
    }
  };

  // Filter Items
  const filteredItems = shopItems.filter((item) => {
    const matchesCategory = activeCategory === "ทั้งหมด" || item.category === activeCategory;
    const matchesTier = tierFilter === "ทั้งหมด" || item.tier === tierFilter;
    return matchesCategory && matchesTier;
  });

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "daily":
        return { label: "Daily", style: "border-slate-200/80 text-slate-500 bg-slate-100" };
      case "weekend":
        return { label: "Weekend", style: "border-zinc-200 text-zinc-650 bg-zinc-100/85" };
      case "mid":
        return { label: "Mid-Tier", style: "border-zinc-300 text-zinc-700 bg-zinc-200/60" };
      case "epic":
        return { label: "Epic", style: "border-slate-600 text-white bg-slate-600" };
      case "legendary":
        return { label: "Legendary", style: "border-slate-900 text-white bg-slate-900" };
      default:
        return { label: "General", style: "border-slate-200 text-slate-500 bg-slate-100" };
    }
  };

  const currentLevel = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  const maxTransfer = currentLevelXP;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-4 pb-32 px-4 md:p-10 font-sans selection:bg-purple-100/50 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[45%] h-[45%] bg-purple-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* --- Header --- */}
        <header className="mb-6 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          {/* 🌟 Top-Right Header Widgets (Level & Tickets) */}
          <div className="absolute top-0 right-0 z-40 flex items-center gap-2">
            {/* Tiny Level Circular Progress */}
            <div className="flex items-center gap-2 bg-white border border-slate-200/80 pl-2 pr-3 py-1 rounded-full shadow-sm shrink-0 h-9">
              <div className="relative w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-inner shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeDasharray="69.1"
                    initial={{ strokeDashoffset: 69.1 }}
                    animate={{ strokeDashoffset: 69.1 - (currentLevelXP / 100) * 69.1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="relative z-10 text-[10px] font-black text-orange-500 leading-none">
                  {currentLevel}
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-700 leading-none">LV {currentLevel}</span>
            </div>

            {/* 🎫 Floating Ticket Button */}
            <button
              onClick={() => setShowInventoryModal(true)}
              className="flex items-center justify-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-black text-xs active:scale-95 h-9 cursor-pointer"
            >
              <Ticket size={14} className="text-purple-600 animate-pulse" />
              <span>ตั๋วของฉัน ({redeemedHistory.length})</span>
            </button>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black mb-4 border border-purple-200/60 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(168,85,247,0.04)]">
              <Trophy size={14} /> <span>Exclusive Happiness Shop</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-3">
              ความสุข <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 via-purple-500 via-indigo-500 to-emerald-500">ระหว่างทาง</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium">แลกเปลี่ยนเศษเสี้ยวความสำเร็จ เพื่อให้การพัฒนาตัวเองสนุกในระยะยาว</p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-stretch gap-3 shrink-0">
            {/* 🐷 Saving Pot Card (Minimal Style) */}
            <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] shrink-0 min-w-[340px] flex-1 md:flex-none">
              <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/10 shrink-0">
                <PiggyBank size={24} />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">SAVING POT</span>
                <p className="text-xl font-black text-slate-800 mt-1.5 leading-none">
                  {potXP} <span className="text-xs font-bold text-slate-400 ml-0.5">XP</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setDepositError("");
                  setWithdrawError("");
                  setDepositAmount("");
                  setWithdrawAmount("");
                  setActivePotTab("deposit");
                  setShowDepositModal(true);
                }}
                className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:via-purple-500 hover:to-indigo-500 rounded-full transition-all shadow-[0_4px_15px_rgba(219,39,119,0.3)] active:scale-95 shrink-0 cursor-pointer"
              >
                ออม/ถอน XP
              </button>
            </div>
          </div>
        </header>

        {/* --- 🛠️ Categories Selector --- */}
        <div className="relative mb-4">
          <div className="flex gap-3 overflow-x-auto pt-4 pb-4 px-4 no-scrollbar -mx-4">
            <button
              onClick={() => setActiveCategory("ทั้งหมด")}
              className={`flex-none flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === "ทั้งหมด"
                  ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white border-transparent shadow-[0_8px_25px_-5px_rgba(168,85,247,0.3)] scale-105 z-20"
                  : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={activeCategory === "ทั้งหมด" ? "text-white" : "text-slate-400"}>
                <LayoutGrid size={18} />
              </span>
              ทั้งหมด
            </button>

            {rewardCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-none flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === cat.key
                    ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white border-transparent shadow-[0_8px_25px_-5px_rgba(168,85,247,0.3)] scale-105 z-20"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={activeCategory === cat.key ? "text-white" : "text-slate-400"}>
                  {CATEGORY_THEMES[cat.key]?.icon}
                </span>
                {cat.labelTh}
              </button>
            ))}
          </div>
        </div>

        {/* --- 🏷️ Tier Selector --- */}
        <div className="flex items-center mb-8 relative w-full overflow-hidden bg-white/50 backdrop-blur-md border border-slate-200/60 p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0 pl-2 select-none border-r border-slate-200/60 pr-3 mr-2">
            <SlidersHorizontal size={13} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">ระดับ</span>
          </div>
          <div className="flex gap-2 overflow-x-auto py-0.5 pr-2 no-scrollbar flex-1 items-center">
            {["ทั้งหมด", "daily", "weekend", "mid", "epic", "legendary"].map((tier) => {
              const isActive = tierFilter === tier;
              const label = tier === "ทั้งหมด" ? "ทั้งหมด" : getTierLabel(tier).label;
              return (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`flex-none px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all border cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white border-transparent shadow-sm scale-102"
                      : "bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Grid Area --- */}
        <motion.div
          key={`${activeCategory}-${tierFilter}`}
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const theme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES["ทั้งหมด"];
              const tierInfo = getTierLabel(item.tier);
              const currentLevel = Math.floor(totalXP / 100) + 1;
              const isLevelLocked = item.minLevel ? currentLevel < item.minLevel : false;
              const canRedeem = potXP >= item.price && !isLevelLocked;
              const deficit = item.price - potXP;

              return (
                <motion.div key={item.id} variants={cardVariants} layout className="h-full">
                  <div className="h-full bg-white p-5 rounded-[2.2rem] border border-slate-200/60 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-slate-350 transition-all duration-500 relative overflow-hidden group flex flex-col justify-between">
                    <div>
                      <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 mb-4 relative flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
                        {/* Dynamic Category/Theme Background Icon for Premium Fallback */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] text-slate-900 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                          {theme.icon}
                        </div>
                        <img 
                          src={`/item/${item.id}.png`} 
                          alt={item.title} 
                          className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-105" 
                          onError={(e) => { 
                            // Set to transparent spacer to reveal the beautiful gradient and background icon instead of a generic broken image
                            (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>";
                            (e.target as HTMLImageElement).parentElement?.classList.add("bg-gradient-to-tr", "from-" + (item.category === "freedom" ? "rose" : item.category === "joy" ? "amber" : item.category === "rest" ? "blue" : item.category === "growth" ? "emerald" : item.category === "environment" ? "purple" : "orange") + "-500/10", "to-purple-500/10");
                            // Set opacity of the fallback icon to be more visible when image fails
                            const iconEl = (e.target as HTMLImageElement).previousElementSibling;
                            if (iconEl) {
                              iconEl.classList.remove("opacity-[0.08]");
                              iconEl.classList.add("opacity-30", "text-" + (item.category === "freedom" ? "rose" : item.category === "joy" ? "amber" : item.category === "rest" ? "blue" : item.category === "growth" ? "emerald" : item.category === "environment" ? "purple" : "orange") + "-650");
                            }
                          }} 
                        />
                        {/* Level Lock Overlay */}
                        {isLevelLocked && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-white p-4">
                            <Lock className="text-yellow-400 mb-1.5 animate-bounce" size={24} />
                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900/90 px-2.5 py-1 rounded-full border border-white/10 shadow-lg text-yellow-400">
                              ต้องการ LV.{item.minLevel}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2.5 right-2.5 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-[10px] font-black text-purple-300 flex items-center gap-1 shadow-lg tracking-wider">
                          {item.price} XP
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${theme.color} ${theme.bgColor} ${theme.borderColor}`}>
                          {rewardCategories.find(c => c.key === item.category)?.labelTh || item.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${tierInfo.style}`}>
                          {tierInfo.label}
                        </span>
                        {item.minLevel && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${isLevelLocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                            {isLevelLocked ? <Lock size={10} /> : "✅"} LV.{item.minLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1 leading-snug line-clamp-1 overflow-hidden">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-3 overflow-hidden min-h-[3rem]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleRedeemItem(item)}
                      disabled={!canRedeem}
                      className={`w-full py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${
                        canRedeem ? "bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white shadow-lg active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isLevelLocked 
                        ? `🔒 ต้องการ Level ${item.minLevel}` 
                        : canRedeem 
                          ? "แลกรางวัล 🎁" 
                          : `ขาดอีก ${deficit} XP`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* --- Empty State --- */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200/60 rounded-[2.5rem] p-6 shadow-sm">
            <Ticket size={48} className="mx-auto text-slate-300 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">ไม่พบตั๋วความสุข</h3>
            <p className="text-slate-400 text-sm">ลองเปลี่ยนหมวดหมู่หรือระดับในการค้นหาดูนะ</p>
          </div>
        )}

        {/* --- Footer --- */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-24 text-center py-12 border-t border-slate-200">
          <Link href="/dashboard" className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-slate-800 shadow-xl uppercase tracking-widest">
            <LayoutGrid size={18} /> กลับสู่ DASHBOARD
          </Link>
        </motion.footer>

      </div>

      {/* --- Confetti --- */}
      {showConfetti && <FramerMotionConfetti />}

      {/* --- 🐷 Modal: Deposit/Withdraw XP --- */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDepositModal(false);
                setDepositAmount("");
                setDepositError("");
                setWithdrawAmount("");
                setWithdrawError("");
                setActivePotTab("deposit");
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl z-10 text-slate-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <PiggyBank className="text-purple-600" size={20} />
                  {activePotTab === "deposit" ? "ออม XP" : "ทุบกระปุกถอน XP"}
                </h4>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                    setDepositError("");
                    setWithdrawAmount("");
                    setWithdrawError("");
                    setActivePotTab("deposit");
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Header */}
              <div className="flex border-b border-slate-100 mb-6 -mx-6 px-6">
                <button
                  onClick={() => {
                    setActivePotTab("deposit");
                    setDepositError("");
                    setWithdrawError("");
                  }}
                  className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 outline-none cursor-pointer ${
                    activePotTab === "deposit"
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  หยอดกระปุก (ออม XP)
                </button>
                <button
                  onClick={() => {
                    setActivePotTab("withdraw");
                    setDepositError("");
                    setWithdrawError("");
                  }}
                  className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 outline-none cursor-pointer ${
                    activePotTab === "withdraw"
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  ทุบกระปุก (ถอน XP)
                </button>
              </div>

              {activePotTab === "deposit" ? (
                <>
                  <p className="text-xs text-slate-500 mb-6">โอน XP สะสมไว้แลกของรางวัล โดยที่เลเวลของคุณจะไม่ลดลง</p>
                  <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-6 border border-slate-100">
                    <div><span className="text-[9px] font-black text-slate-400 uppercase">XP ปัจจุบัน</span><p className="text-sm font-bold">{totalXP} XP</p></div>
                    <div><span className="text-[9px] font-black text-slate-400 uppercase">โอนได้สูงสุด</span><p className="text-sm font-bold text-purple-600">{maxTransfer} XP</p></div>
                  </div>
                  <div className="mb-6 relative">
                    <input
                      type="number"
                      placeholder="จำนวนที่ต้องการออม"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        const num = parseInt(e.target.value);
                        if (isNaN(num) || num <= 0) setDepositError("กรุณากรอกจำนวนที่ถูกต้อง");
                        else if (num > maxTransfer) setDepositError(`ออมได้สูงสุด ${maxTransfer} XP`);
                        else setDepositError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-16 text-sm font-bold outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => {
                        setDepositAmount(maxTransfer.toString());
                        setDepositError("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black text-purple-600 hover:text-purple-500 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  {depositError && <p className="text-red-500 text-[10px] font-bold mt-2 mb-4">{depositError}</p>}
                  <button
                    disabled={!!depositError || !depositAmount || parseInt(depositAmount) <= 0 || parseInt(depositAmount) > maxTransfer}
                    onClick={() => { const amt = parseInt(depositAmount); if (!isNaN(amt)) handleDepositXP(amt); }}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    ยืนยันการออม 🚀
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-6">โอน XP กลับไปเติมเลเวลความคืบหน้า โดยจะโดนหักค่าธรรมเนียม 5% (เศษปัดลง)</p>
                  <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-6 border border-slate-100">
                    <div><span className="text-[9px] font-black text-slate-400 uppercase">XP ในกระปุก</span><p className="text-sm font-bold">{potXP} XP</p></div>
                    <div><span className="text-[9px] font-black text-slate-400 uppercase">ค่าธรรมเนียม</span><p className="text-sm font-bold text-red-500">5%</p></div>
                  </div>
                  <div className="mb-6 relative">
                    <input
                      type="number"
                      placeholder="จำนวนที่ต้องการถอน"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        const num = parseInt(e.target.value);
                        if (isNaN(num) || num <= 0) setWithdrawError("กรุณากรอกจำนวนที่ถูกต้อง");
                        else if (num > potXP) setWithdrawError(`ในกระปุกมีเพียง ${potXP} XP`);
                        else setWithdrawError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-16 text-sm font-bold outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => {
                        setWithdrawAmount(potXP.toString());
                        setWithdrawError("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black text-purple-600 hover:text-purple-500 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  {withdrawError && <p className="text-red-500 text-[10px] font-bold mt-2 mb-4">{withdrawError}</p>}

                  {withdrawAmount && !withdrawError && parseInt(withdrawAmount) > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-6 border border-slate-100 text-xs font-bold text-slate-600">
                      <div className="flex justify-between"><span>ถอนออก:</span><span className="text-slate-800">{parseInt(withdrawAmount)} XP</span></div>
                      <div className="flex justify-between"><span>ค่าธรรมเนียม 5%:</span><span className="text-red-500">-{Math.floor(parseInt(withdrawAmount) * 0.05)} XP</span></div>
                      <div className="w-full h-px bg-slate-200 my-1" />
                      <div className="flex justify-between text-sm"><span>ได้รับสุทธิ:</span><span className="text-purple-600">{parseInt(withdrawAmount) - Math.floor(parseInt(withdrawAmount) * 0.05)} XP</span></div>
                    </div>
                  )}

                  <button
                    disabled={!!withdrawError || !withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > potXP}
                    onClick={() => { const amt = parseInt(withdrawAmount); if (!isNaN(amt)) handleWithdrawXP(amt); }}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    ยืนยันการถอน 🔨
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🎒 Modal: Inventory --- */}
      <AnimatePresence>
        {showInventoryModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInventoryModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl max-h-[80vh] flex flex-col z-10">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h4 className="text-lg font-black text-slate-900">คลังตั๋วความสุข</h4>
                <div className="flex items-center gap-2">
                  {redeemedHistory.length > 0 && isAdmin && (
                    <button
                      onClick={async () => {
                        if (!user) return;
                        if (!confirm("คุณต้องการล้างประวัติการแลกตั๋วทั้งหมดใช่หรือไม่?")) return;
                        try {
                          const userRef = doc(db, "users", user.uid);
                          await updateDoc(userRef, {
                            redeemedHistory: []
                          });
                          setRedeemedHistory([]);
                        } catch (error) {
                          console.error("Error clearing redeemed history:", error);
                          alert("เกิดข้อผิดพลาดในการล้างประวัติ");
                        }
                      }}
                      className="px-3 py-1.5 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black transition-all active:scale-95 border border-red-100 cursor-pointer"
                    >
                      ล้างประวัติ
                    </button>
                  )}
                  <button onClick={() => setShowInventoryModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {redeemedHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold">ยังไม่มีตั๋วความสุขสะสม</p>
                    <p className="text-xs text-slate-400 mt-1">สะสม XP แล้วเริ่มแลกรางวัลแรกกันเลย!</p>
                  </div>
                ) : (
                  [...redeemedHistory].reverse().map((hist, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0">
                          <img src={`/item/${hist.id}.png`} alt={hist.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{hist.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-purple-600">{hist.price} XP</span>
                            <span className="text-[8px] text-slate-400">
                              {hist.redeemedAt && new Date(hist.redeemedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRedeemedItem(hist);
                          setShowInventoryModal(false);
                          setShowTicketModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shrink-0"
                      >
                        ดูตั๋ว
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🎫 Modal: Ticket --- */}
      <AnimatePresence>
        {showTicketModal && redeemedItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl z-10 text-white flex flex-col items-center"
            >
              <div className="flex justify-between items-center w-full mb-6">
                <h4 className="text-lg font-black text-white">ตั๋วความสุขของคุณ</h4>
                <button onClick={() => setShowTicketModal(false)} className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {/* The Ticket Wrapper for Saving image */}
              <div 
                id="happiness-ticket-wrapper" 
                className="p-6 rounded-3xl w-full flex justify-center items-center"
                style={{
                  backgroundColor: "#ffffff",
                  backgroundImage: "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px"
                }}
              >
                <div 
                  id="happiness-ticket" 
                  className={`relative w-full max-w-[280px] p-5 rounded-2xl flex flex-col items-center overflow-hidden transition-all border ${
                    redeemedItem.minLevel 
                      ? "bg-gradient-to-b from-slate-950 via-amber-950/40 to-slate-950 border-amber-500/40 shadow-[0_4px_25px_rgba(245,158,11,0.25)]" 
                      : "bg-slate-950 border-slate-800/80"
                  }`}
                >
                  
                  {/* Left Notch */}
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r border-slate-800/80" />
                  {/* Right Notch */}
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-slate-800/80" />

                  {/* Stamp/Seal Badge style watermark */}
                  <div className={`absolute right-4 top-4 w-12 h-12 border-2 rounded-full flex items-center justify-center rotate-12 pointer-events-none ${
                    redeemedItem.minLevel 
                      ? "border-amber-500/35 text-amber-500/50" 
                      : "border-indigo-500/20 text-indigo-500/30"
                  }`}>
                    <span className="text-[6px] font-black uppercase text-center tracking-tighter leading-none">
                      {redeemedItem.minLevel ? "PREMIUM\nUNLOCK" : "APPROVED\nFUII MENTOR"}
                    </span>
                  </div>

                  <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border mb-3 flex items-center justify-center ${
                    redeemedItem.minLevel 
                      ? "border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                      : "border-white/10"
                  }`}>
                    <img src={`/item/${redeemedItem.id}.png`} alt={redeemedItem.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }} />
                  </div>
                  
                  {redeemedItem.minLevel && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-400/90 mb-1 animate-pulse">
                      ★ LV.{redeemedItem.minLevel} EXCLUSIVE ★
                    </span>
                  )}

                  <h3 className="text-base font-black text-white px-2 mb-1 tracking-tight text-center line-clamp-2">
                    {redeemedItem.title}
                  </h3>
                  
                  {redeemedItem.desc && (
                    <p className="text-[10px] text-slate-400 px-3 text-center mb-3 leading-relaxed">
                      {redeemedItem.desc}
                    </p>
                  )}

                  {/* Price tag */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-4 border ${
                    redeemedItem.minLevel 
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.15)]" 
                      : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  }`}>
                    <Trophy size={12} className={`fill-current ${redeemedItem.minLevel ? "text-amber-400" : "text-purple-400"}`} /> {redeemedItem.price} XP REDEEMED
                  </div>

                  {/* Dotted Divider for notches */}
                  <div className="w-full border-t border-dashed border-slate-800 my-2" />

                  {/* User metadata & Date */}
                  <div className="w-full grid grid-cols-2 gap-2 text-left text-[9px] font-bold text-slate-400 py-2">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">REDEEMER</span>
                      <span className="text-white truncate block">{user?.displayName?.split(' ')[0] || 'Upskiller'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">DATE</span>
                      <span className="text-white block">
                        {redeemedItem.redeemedAt 
                          ? new Date(redeemedItem.redeemedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
                          : new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
                        }
                      </span>
                    </div>
                  </div>

                  {/* Barcode representation */}
                  <div className="w-full flex flex-col items-center border-t border-dashed border-slate-800 pt-4 mt-2">
                    <div className="w-full h-8 flex justify-center items-stretch gap-[1.5px] opacity-70 mb-1">
                      {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1].map((width, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-sm"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[7px] text-slate-500 uppercase tracking-[0.3em]">#HPN-{redeemedItem.id}-{potXP + redeemedItem.price}</span>
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full mt-6 space-y-2">
                <button
                  onClick={async () => {
                    const { toPng } = await import("html-to-image");
                    const element = document.getElementById("happiness-ticket-wrapper");
                    if (!element) return;
                    try {
                      const dataUrl = await toPng(element, {
                        pixelRatio: 3,
                        backgroundColor: '#ffffff',
                        cacheBust: true,
                        style: {
                          borderRadius: '1.5rem',
                        }
                      });
                      const link = document.createElement("a");
                      link.href = dataUrl;
                      link.download = `happiness-ticket-${redeemedItem.title.replace(/\s+/g, '-').slice(0, 15)}.png`;
                      link.click();
                    } catch (err) {
                      console.error("Error generating ticket image:", err);
                      alert("ไม่สามารถเซฟรูปภาพได้ในขณะนี้");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95"
                >
                  <Camera size={14} />
                  Save Ticket Image 📸
                </button>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-colors"
                >
                  ปิด
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
