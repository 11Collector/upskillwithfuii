"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, increment, writeBatch, updateDoc, arrayUnion, serverTimestamp, addDoc, deleteDoc, deleteField } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Quote, Users, Wallet, ChevronRight, Sparkles, BookOpen, RefreshCw, LogOut, BrainCircuit, Target, AlertCircle, CheckCircle2, ShieldCheck, Circle, Trophy, Award, Flame, Info, Lock, Unlock, X, Zap, Star, Camera, Download, Ticket, RotateCcw, Shuffle, LayoutDashboard, MessageSquare, HelpCircle, ArrowRight, Bookmark, Ghost, PiggyBank, ShoppingBag, Vault, IdCard, Mail, Crown, Pencil, Battery } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import React from 'react'
import { results as LIBRARY_SOULS_RESULTS } from "@/data/librarySoulsResults";
import { ghostResults } from "@/data/ghostResults";
import { mockArticles } from "@/constants/article";

import { MONEY_DATA, DISC_DATA, QUEST_POOL, categoryNames } from "@/data/quests";
import { INSPIRATIONAL_MESSAGES, COMPLIMENTARY_MESSAGES, avatarImages, PET_DATA, SHOP_ITEMS } from "@/data/constants";

import { formatAnalysisText, AvatarDisplay, calculateRelativeWeek } from "@/utils/dashboardHelpers";
import { FloatingPremiumXP, QuestItem } from "./_components/DashboardUI";
import { fetchDashboardData } from "@/services/dashboardService";
import { MementoMoriBento } from "./_components/MementoMoriBento";
import { MementoMoriModal } from "./_components/MementoMoriModal";
import { WeeklySummaryModal } from "./_components/WeeklySummaryModal";
// AI Quest marker constants or unused legacy variables cleaned up

type ProPlan = "monthly" | "yearly" | "founding_monthly" | "founding_yearly" | "lifetime";

const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Exciting rising arpeggio: C5 (523.25) -> E5 (659.25) -> G5 (783.99)
    const arpeggio = [523.25, 659.25, 783.99];
    const noteDelay = 0.05; // 50ms between notes

    // Play the arpeggio
    arpeggio.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * noteDelay);

      // Add a warm sub-octave
      const subOsc = ctx.createOscillator();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(freq / 2, now + index * noteDelay);

      const noteStart = now + index * noteDelay;
      const decayDuration = 0.35;

      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.08, noteStart + 0.01); // quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + decayDuration); // decay

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + decayDuration + 0.05);
      subOsc.start(noteStart);
      subOsc.stop(noteStart + decayDuration + 0.05);
    });

    // Play a triumphant major chord at the end (C6, E6, G6, C7)
    const chordFreqs = [1046.50, 1318.51, 1567.98, 2093.00];
    const chordStart = now + arpeggio.length * noteDelay;
    const chordDecay = 0.8;

    chordFreqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Detuned chorus effect for a richer, shimmering sound
      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, chordStart);
      
      // Pitch slide on start for magic dust/sparkle effect
      osc.frequency.exponentialRampToValueAtTime(freq + 12, chordStart + 0.06);
      osc.frequency.linearRampToValueAtTime(freq, chordStart + 0.15);

      gainNode.gain.setValueAtTime(0, chordStart);
      gainNode.gain.linearRampToValueAtTime(0.06, chordStart + 0.02); // quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, chordStart + chordDecay); // long ring decay

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(chordStart);
      osc.stop(chordStart + chordDecay + 0.05);
    });
  } catch (e) {
    console.error("Audio Context Error: ", e);
  }
};

const playLevelUpChime = () => {
  playSuccessChime();
};

const playProUpgradeSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // A magical, sparkling ascending arpeggio with high-pitched bells
    // C5 (523.25) -> E5 (659.25) -> G5 (783.99) -> C6 (1046.5) -> E6 (1318.5) -> G6 (1567.98)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const noteDelay = 0.08; // 80ms delay

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * noteDelay);

      // Add a sparkling square/triangle wave at low volume for a retro synth bell feel
      const sparkleOsc = ctx.createOscillator();
      sparkleOsc.type = "triangle";
      sparkleOsc.frequency.setValueAtTime(freq * 2, now + index * noteDelay);

      const noteStart = now + index * noteDelay;
      const decayDuration = 0.5;

      gainNode.gain.setValueAtTime(0.0, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + decayDuration);

      osc.connect(gainNode);
      sparkleOsc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(noteStart);
      sparkleOsc.start(noteStart);

      osc.stop(noteStart + decayDuration);
      sparkleOsc.stop(noteStart + decayDuration);
    });

    // Also play a warm bass chord in the background
    const chord = [261.63, 329.63, 392.00, 523.25]; // C major chord
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  } catch (e) {
    console.error("Failed to play PRO upgrade sound:", e);
  }
};

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

export default function DashboardPage() {

  const [weeklyData, setWeeklyData] = useState({ wheel: 0, disc: 0, money: 0, library: 0, wildcard: 0, challenge: 0, momentum_count: 0 });
  const [activeTab, setActiveTab] = useState<"home" | "overview" | "quests" | "identity" | "resources">("home");
  const [improvement, setImprovement] = useState(0);
  const [isFirstWeek, setIsFirstWeek] = useState(true); // เพิ่มตัวนี้ (Default เป็น true ไว้ก่อน)
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [completedToastText, setCompletedToastText] = useState<string | null>(null);
  const [completedToastType, setCompletedToastType] = useState<string | null>(null);
  const [showProSuccessModal, setShowProSuccessModal] = useState(false);
  // 🌟 เพิ่ม State เก็บข้อมูล Week ปัจจุบันของผู้ใช้
  const [relativeWeekInfo, setRelativeWeekInfo] = useState({ id: "week-1", label: "สัปดาห์ที่ 1", range: "กำลังโหลด..." });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [viewMode, setViewMode] = useState<"cert" | "letter">("cert");
  const [billingPlan, setBillingPlan] = useState<ProPlan>("monthly");
  const confirmedCheckoutRef = useRef(false);
  const searchParams = useSearchParams();

  const getFormattedEndDate = () => {
    if (!userData?.currentPeriodEnd) return "";
    let date: Date;
    if (userData.currentPeriodEnd instanceof Date) {
      date = userData.currentPeriodEnd;
    } else if (userData.currentPeriodEnd.toDate) {
      date = userData.currentPeriodEnd.toDate();
    } else if (userData.currentPeriodEnd.seconds) {
      date = new Date(userData.currentPeriodEnd.seconds * 1000);
    } else {
      date = new Date(userData.currentPeriodEnd);
    }
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ["home", "overview", "quests", "identity", "resources"].includes(tab)) {
      setActiveTab(tab as any);
    } else if (!tab) {
      setActiveTab("home");
    }

    if (searchParams.get("membership") === "1") {
      setShowMembershipModal(true);
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("membership");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch {}
    }

    const completed = searchParams.get("completed");
    if (completed) {
      setCompletedToastType(completed);
      if (completed === "wheel") {
        setCompletedToastText("บันทึกในตัวตนแล้ว");
      } else if (completed === "library") {
        setCompletedToastText("ไปดูหนังสือแนะนำได้ที่ตัวตน");
      } else if (completed === "disc") {
        setCompletedToastText("บันทึกสไตล์การสื่อสาร DISC ในตัวตนแล้ว");
      } else if (completed === "money") {
        setCompletedToastText("บันทึกนิสัยการเงินในตัวตนแล้ว");
      }
      setTimeout(() => {
        setCompletedToastText(null);
        setCompletedToastType(null);
      }, 3000);
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("completed");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch {}
    }

    // 🚀 Scroll to top when tab changes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [searchParams]);

  useEffect(() => {
    if (!showMembershipModal) {
      setShowLetter(false);
    }
  }, [showMembershipModal]);


  useEffect(() => {
    window.scrollTo(0, 0);
    const pendingLevel = sessionStorage.getItem('pendingLevelUp');
    if (pendingLevel) {
      sessionStorage.removeItem('pendingLevelUp');
      const newLevel = parseInt(pendingLevel);
      setTimeout(() => {
        playLevelUpChime();
        setShowLevelUp({ isOpen: true, newLevel });
        setTimeout(() => setShowLevelUp(null), 4000);
      }, 1000);
    }
  }, []);

  // 1. ฟังก์ชันสำหรับอัปเดตวันของแผน (ใช้ตอน "ใช้แผนเดิมต่อ")
  const handleUpdatePlanDay = async (newDay: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      // อัปเดตใน Database
      await updateDoc(userRef, {
        wheelPlanDay: newDay,
        wheelPlanSkips: 0,
        lastSkipDate: "",
        completedQuestIds: [] // 🧹 ล้างเควสที่เคยทำแล้วออกเพื่อให้เริ่มวันใหม่ได้
      });

      // อัปเดตใน State ทันทีเพื่อให้ UI เปลี่ยน
      setWheelPlanDay(newDay);
      setWheelPlanSkips(0);
      setLastSkipDate("");
      setCompletedQuests([]);

      alert("เริ่มต้นเส้นทางเดิม วันที่ 1 อีกครั้ง ลุยเลยครับ!");
    } catch (error) {
      console.error("Update Plan Day Error:", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตวัน");
    }
  };

  // 1. ฟังก์ชันสุ่มใหม่ (Reroll)
  const handleShuffleQuests = async () => {
    if (!user || !QUEST_POOL?.WHEEL) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const allWheelTasks = Object.values(QUEST_POOL.WHEEL).flat();
      const randomTask = allWheelTasks[Math.floor(Math.random() * allWheelTasks.length)] as string;
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

      await updateDoc(userRef, {
        wheelPlanDay: 1, // เริ่มที่ Day 1 ทันที
        isRandomMode: true,
        randomWheelQuestTitle: randomTask,
        wheelCompletions: 0, // 🧹 รีเซ็ตตัวนับความสำเร็จใหม่
        lastActiveDate: todayStr, // 🌟 ป้องกันไม่ให้โดนบวกวันเพิ่มในวันเดียวกัน
        weeklySavings: 0, // 🐷 รีเซ็ตเงินออมสะสมรายสัปดาห์
      });

      setWheelPlanDay(1);
      setIsRandomMode(true);
      setRandomWheelQuestTitle(randomTask);
      setWheelCompletions(0);
      setUserData((prev: any) => prev ? { ...prev, weeklySavings: 0 } : null);

      alert("✨ สุ่มภารกิจใหม่จากหมวด Wheel และเริ่ม Day 1 ให้คุณแล้ว!");
    } catch (e) {
      console.error("Shuffle Error:", e);
    }
  };

  // 2. ฟังก์ชันใช้แผนเดิม
  const handleRestartCycle = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

      await updateDoc(userRef, {
        wheelPlanDay: 1, // เริ่มที่ Day 1 ทันที
        wheelPlanTarget: 7, // รีเซ็ตเป้าหมายกลับเป็น 7 วันเสมอ
        isRandomMode: false,
        completedQuestIds: [],
        wheelCompletions: 0, // 🧹 รีเซ็ตตัวนับความสำเร็จใหม่ 
        lastActiveDate: todayStr, // 🌟 ป้องกันไม่ให้โดนบวกวันเพิ่มในวันเดียวกัน
        lastActiveAt: serverTimestamp(),
        weeklySavings: 0, // 🐷 รีเซ็ตเงินออมสะสมรายสัปดาห์
      });

      setWheelPlanDay(1);
      setWheelPlanTarget(7);
      setCompletedQuests([]);
      setWheelCompletions(0);
      setUserData((prev: any) => prev ? { ...prev, weeklySavings: 0, wheelPlanTarget: 7 } : null);
      alert("เริ่มรอบใหม่ (Day 1) ให้คุณแล้ว! ลุยกันต่อเลยครับ");
    } catch (e) { console.error(e); }
  };
 
  // 3. ฟังก์ชันขยายแผนปฏิบัติการเป็น 21 วัน
  const handleExtendPlanTo21 = async () => {
    if (!user || !lastWheel) return;
    if (!isProMember) {
      alert("✨ ฟีเจอร์ขยายแผน 21 วัน (สร้างนิสัย) ด้วย AI เป็นสิทธิ์เฉพาะสมาชิก PRO\n\nระบบกำลังเปิดหน้าอัปเดตสมาชิกให้ท่านครับ");
      setShowMembershipModal(true);
      return;
    }
    setIsExtending(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const assessmentId = lastWheel.id;

      // เช็กก่อนว่ามีข้อมูล Day 8-21 ในตัวเดิมอยู่แล้วหรือไม่
      const alreadyExtended = lastWheel.analysis && lastWheel.analysis.match(/\bDay\s?21\b/i);

      if (alreadyExtended) {
        // ดึงของเดิมรันต่อได้เลย ไม่ต้องเรียก AI
        await updateDoc(userRef, {
          wheelPlanTarget: 21,
          wheelPlanDay: 8,
          completedQuestIds: [],
        });

        setWheelPlanTarget(21);
        setWheelPlanDay(8);
        setCompletedQuests([]);
        setUserData((prev: any) => prev ? { ...prev, wheelPlanTarget: 21, wheelPlanDay: 8 } : null);
        alert("ขยายแผนต่อเนื่องเป็น 21 วันแล้ว! (ใช้แผนเดิมที่วิเคราะห์ไว้ก่อนหน้า) ลุยกันต่อเลยครับ");
      } else {
        // เจน AI เพิ่มเติม
        const currentScores = lastWheel.currentScores || [];
        const targetScores = lastWheel.targetScores || [];
        const currentText = currentScores.map((score: number, i: number) => `${categoryNames[i]}: ${score}/10`).join(", ");
        const targetText = targetScores.map((score: number, i: number) => `${categoryNames[i]}: ${score}/10`).join(", ");
        const focusAreas = lastWheel.focusAreas || [];
        const focusText = focusAreas.length > 0 ? focusAreas.map((idx: number) => categoryNames[idx]).join(", ") : "ไม่ได้ระบุเป็นพิเศษ";
        const futureGoal = lastWheel.goal || "ไม่ได้ระบุ";
        const originalPlanText = lastWheel.analysis || "";

        const promptText = `คุณคือเพื่อนสนิทผู้ชาย ที่ฉลาดและมีความรู้เชิงลึกทั้ง 8 ด้านเป็นสไตล์ที่ปรึกษาอารมณ์และนักพัฒนาตัวเอง สไตล์การพูดคือเป็นกันเอง อบอุ่น จริงใจ ให้กำลังใจ 
(กฎข้อห้ามสำคัญ: ห้ามมีคำลงท้ายหางเสียง เช่น จ๊ะ, จ้ะ, คะ, ค่ะ, ครับ เด็ดขาด และให้เรียกแทนอีกฝ่ายว่า "คุณ" เสมอ)

ผู้ใช้ได้ผ่านการประเมินวงล้อชีวิต (Wheel of Life) และทำแผนปฏิบัติการ 7 วันแรกสำเร็จเรียบร้อยแล้ว!
ข้อมูลแบบประเมินและเป้าหมายเดิมของเขา:
- คะแนนปัจจุบัน: ${currentText}
- เป้าหมาย 1 ปี: ${targetText}
- สิ่งที่เลือกโฟกัสเป็นพิเศษ: [${focusText}]
- เป้าหมายที่อยากทำสำเร็จ: ${futureGoal}

แผนปฏิบัติการ 7 วันแรกที่เขาทำสำเร็จไปแล้วคือ:
${originalPlanText}

โปรดช่วยวิเคราะห์ต่อยอดเพื่อสร้างแผนปฏิบัติการต่อเนื่องสำหรับ Day 8 ถึง Day 21 (อีก 14 วันที่เหลือ) เพื่อพัฒนาพฤติกรรมนี้ให้กลายเป็นนิสัยที่แท้จริงตามหลักจิตวิทยา 21 วัน
แผนต่อเนื่องนี้ต้องสร้างกิจกรรมใหม่ๆ หรือกิจกรรมที่เพิ่มระดับความเข้มข้นขึ้น โดยอ้างอิงจากแผนสัปดาห์แรก 

กฎการตอบ (ต้องทำตามอย่างเคร่งครัด):
1. ภาษาที่ใช้: ต้องเป็นภาษาไทย 100% เท่านั้น ห้ามสร้างข้อความที่มีตัวอักษรภาษาจีน (Chinese characters) ปะปนมาแม้แต่ตัวเดียวเด็ดขาด
2. ให้ตอบเฉพาะหัวข้อแผนปฏิบัติการรายวันสำหรับ Day 8 ถึง Day 21 เท่านั้น โดยใช้รูปแบบ:
📅 แผนปฏิบัติการต่อเนื่อง (Day 8-21):
Day 8: [กิจกรรมสั้นๆ ที่ทำได้จริงใน 5 นาที]
Day 9: [กิจกรรม]
...
Day 21: [กิจกรรม]
3. Format: ห้ามใช้ Markdown แบบอื่นๆ เช่น Heading หรือ Italic`;

        const idToken = await user.getIdToken();
        const response = await fetch('/api/quote', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({ prompt: promptText, type: "wheel" })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const generatedAnalysis = data.quote || "";
        if (!generatedAnalysis) throw new Error("ไม่สามารถสร้างแผนต่อเนื่องได้");

        const extendedAnalysis = `${originalPlanText}\n\n${generatedAnalysis}`;

        // อัปเดต Assessments Collection
        if (assessmentId) {
          const assessmentRef = doc(db, "users", user.uid, "assessments", assessmentId);
          await updateDoc(assessmentRef, { analysis: extendedAnalysis });
        }

        // อัปเดต User Profile
        await updateDoc(userRef, {
          wheelPlanTarget: 21,
          wheelPlanDay: 8,
          completedQuestIds: [],
        });

        setWheelPlanTarget(21);
        setWheelPlanDay(8);
        setCompletedQuests([]);
        setLastWheel((prev: any) => prev ? { ...prev, analysis: extendedAnalysis } : null);
        setUserData((prev: any) => prev ? { ...prev, wheelPlanTarget: 21, wheelPlanDay: 8 } : null);
        alert("✨ AI ได้วิเคราะห์และสร้างแผนสร้างนิสัยต่อเนื่อง (Day 8-21) ให้คุณเรียบร้อยแล้ว ลุยกันต่อเลยครับ!");
      }
    } catch (e: any) {
      console.error(e);
      alert(`ไม่สามารถขยายแผนได้: ${e.message || e}`);
    } finally {
      setIsExtending(false);
    }
  };

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(""); // 👈 ประกาศเป็นค่าว่างไว้ก่อน
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isSelectingEnergy, setIsSelectingEnergy] = useState(false);

  useEffect(() => {
    (window as any).testResetFounder = async () => {
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), { 
            isFoundingMember: false,
            isLifetimeMember: false,
            subscriptionPlan: null,
            subscriptionStatus: null
          }, { merge: true });
          setUserData((prev: any) => ({ 
            ...prev, 
            isFoundingMember: false, 
            isLifetimeMember: false,
            subscriptionPlan: null,
            subscriptionStatus: null
          }));
          console.log("✅ Reset Founding Member to false successfully!");
        } catch (err) {
          console.error(err);
        }
      }
    };
  }, [user]);

  const [lastWheel, setLastWheel] = useState<any>(null);
  const [lastQuote, setLastQuote] = useState<any>(null);
  const [lastDisc, setLastDisc] = useState<any>(null);
  const [lastMoney, setLastMoney] = useState<any>(null);
  const [lastLibrarySoul, setLastLibrarySoul] = useState<any>(null);
  const [showBookCollection, setShowBookCollection] = useState(false);
  const [playlistBooks, setPlaylistBooks] = useState<{ title: string; author: string; category: string; status?: 'interested' | 'completed'; savedAt?: string }[]>([]);
  const [activeBookTab, setActiveBookTab] = useState<"interested" | "completed">("interested");
  const [manualBookTitle, setManualBookTitle] = useState("");
  const [manualBookAuthor, setManualBookAuthor] = useState("");
  const [lastGhostResult, setLastGhostResult] = useState<any>(null);
  const [hasSoulGuide, setHasSoulGuide] = useState(false);
  const [chatQuota, setChatQuota] = useState({ used: 0, total: 0 });

  const [completedQuests, setCompletedQuests] = useState<(number | string)[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  const [potXP, setPotXP] = useState<number>(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<any>(null);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");
  const [activePotTab, setActivePotTab] = useState<"deposit" | "withdraw">("deposit");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");

  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, content: string | React.ReactNode } | null>(null);
  const [bookMatchModal, setBookMatchModal] = useState(false);
  const [bookMatchBooks, setBookMatchBooks] = useState<{ title: string; author: string; reason: string; category: string }[]>([]);
  const [bookMatchLoading, setBookMatchLoading] = useState(false);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionQuests, setCollectionQuests] = useState<{ title: string; type: string; completedAt: string }[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);

  useEffect(() => {
    if (showCollectionModal) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [showCollectionModal]);
  const [collectionSelectedDate, setCollectionSelectedDate] = useState("");
  const [showLevelUp, setShowLevelUp] = useState<{ isOpen: boolean, newLevel: number } | null>(null);
  const showLevelUpModal = useCallback((newLevel: number) => {
    playLevelUpChime();
    setShowLevelUp({ isOpen: true, newLevel });
    setTimeout(() => setShowLevelUp(null), 4000);
  }, []);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showDailySuccess, setShowDailySuccess] = useState(false);
  const [currentSuccessQuote, setCurrentSuccessQuote] = useState("");
  const [showStreakSavedToast, setShowStreakSavedToast] = useState(false);
  const hasShownStreakSavedToastRef = useRef(false);

  // 🏆 สุ่มคำคมใหม่ทุกครั้งที่เปิด Modal
  useEffect(() => {
    if (showDailySuccess) {
      const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length);
      setCurrentSuccessQuote(INSPIRATIONAL_MESSAGES[randomIndex]);
    }
  }, [showDailySuccess]);

  const [hasClaimedQuoteToday, setHasClaimedQuoteToday] = useState(false);
  const [showWelcomeQuotePopup, setShowWelcomeQuotePopup] = useState(false);
  const [showQuestEnergyPopup, setShowQuestEnergyPopup] = useState(false);
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // 🕒 1. State สำหรับเช็กวันที่ปัจจุบัน (เพื่ออัพเดตรายวันและตอนเที่ยงคืน)
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [showSpecialQuestModal, setShowSpecialQuestModal] = useState(false);
  const [customQuestTitle, setCustomQuestTitle] = useState(""); // สำหรับ Personalized Mission (ID: special-01)
  const [randomWheelQuestTitle, setRandomWheelQuestTitle] = useState(""); // สำหรับ Randomized Wheel Quest (ID: 1)
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showCustomInputModal, setShowCustomInputModal] = useState(false); // เปิด/ปิด Modal
  const [pendingDailySuccess, setPendingDailySuccess] = useState(false); // 👈 คิวรอโชว์ Daily Success
  const [pendingStreakSavedToast, setPendingStreakSavedToast] = useState(false); // 👈 คิวรอโชว์ Streak Toast
  const [rerollCount, setRerollCount] = useState(0); // 👈 สถานะการสุ่มเควสใหม่
  const [lastRerollDate, setLastRerollDate] = useState(""); // 👈 วันที่สุ่มล่าสุด
  const [wheelCompletions, setWheelCompletions] = useState(0); // 👈 นับจำนวนวันที่ทำสำเร็จจริง
  const [slotSeeds, setSlotSeeds] = useState<number[]>([0, 0, 0, 0, 0, 0]); // 👈 Seeds รายข้อ
  const [showRerollConfirm, setShowRerollConfirm] = useState(false); // 👈 เพิ่มสถานะ Modal ยืนยันสุ่มเควส
  const [showPerfectWeekModal, setShowPerfectWeekModal] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [rewardModalData, setRewardModalData] = useState({
    title: "PERFECT WEEK!",
    bonusXP: 100,
    message: "ยินดีด้วย! คุณทำแผนครบ 7 วันต่อเนื่องได้อย่างยอดเยี่ยม",
    type: "PERFECT" as "PERFECT" | "GREAT" | "GOOD",
    weeklySavings: 0
  });
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false);
  const [prevWeekInfoState, setPrevWeekInfoState] = useState<any>(null);
  const [prevWeekDataState, setPrevWeekDataState] = useState<any>(null);

  const [userData, setUserData] = useState<any>(null);
  const [secondBrainNotesCount, setSecondBrainNotesCount] = useState(0);
  const [showMementoModal, setShowMementoModal] = useState(false);
  const [pendingJourneyCompletionAfterMementoClose, setPendingJourneyCompletionAfterMementoClose] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [simulatePhase3Done, setSimulatePhase3Done] = useState(false);
  const [simulateEnteredRealLife, setSimulateEnteredRealLife] = useState(false);
  const phaseCardsScrollRef = useRef<HTMLDivElement | null>(null);

  const hasSavedToday = useMemo(() => {
    if (!userData?.savingsLog) return false;
    const todayStr = new Date().toDateString();
    return userData.savingsLog.some((log: any) => new Date(log.date).toDateString() === todayStr);
  }, [userData?.savingsLog]);

  const [gender, setGender] = useState<"male" | "female">("male");
  const [streakCount, setStreakCount] = useState<number>(0);
  const [wheelPlanDay, setWheelPlanDay] = useState<number>(0);
  const [wheelPlanTarget, setWheelPlanTarget] = useState<number>(7);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [wheelPlanSkips, setWheelPlanSkips] = useState<number>(0);
  const [perfectWeeks, setPerfectWeeks] = useState<number>(0);
  const [lastSkipDate, setLastSkipDate] = useState<string>("");

  const hasRedeemedReward = useMemo(() => {
    return !!(userData?.redeemedHistory && userData.redeemedHistory.length > 0);
  }, [userData?.redeemedHistory]);

  const hasChattedWithFuii = useMemo(() => {
    return !!userData?.hasChattedWithFuii || chatQuota.used > 0 || !!userData?.lastChatTime || !!userData?.lastChatDate;
  }, [userData?.hasChattedWithFuii, userData?.lastChatTime, userData?.lastChatDate, chatQuota.used]);

  const isPhase1Completed = useMemo(() => {
    const hasCoreAssessments = !!lastWheel && !!lastDisc && !!lastMoney && !!lastLibrarySoul;
    return hasCoreAssessments && (!!userData?.hasCompletedPhase1Quests || completedQuests.length >= 2);
  }, [lastWheel, lastDisc, lastMoney, lastLibrarySoul, userData?.hasCompletedPhase1Quests, completedQuests.length]);

  const isKhomsatsatUnlocked = isPhase1Completed;
  const isGhostUnlocked = isKhomsatsatUnlocked && !!lastQuote;
  const isShopUnlocked = isGhostUnlocked && !!lastGhostResult;
  const isSoulGuideUnlocked = isShopUnlocked && hasRedeemedReward;
  const isPhase2Completed = isSoulGuideUnlocked && hasChattedWithFuii;

  const claimedReadArticlesCount = userData?.readArticles?.length || 0;
  const hasCompletedFocusRoom = !!userData?.hasCompletedFocusRoom || (userData?.focusReflections?.length || 0) > 0;
  const isFocusRoomUnlocked = isPhase2Completed && claimedReadArticlesCount >= 2 && secondBrainNotesCount >= 1;
  const isMementoUnlocked = isFocusRoomUnlocked && hasCompletedFocusRoom;
  const hasCompletedMemento = !!userData?.hasCheckedMemento || !!userData?.birthdate || (userData?.mementoReflections?.length || 0) > 0;
  const isPhase3Completed = simulatePhase3Done || (isPhase2Completed && claimedReadArticlesCount >= 2 && secondBrainNotesCount >= 1 && hasCompletedFocusRoom && hasCompletedMemento);
  const isRealLifeEntered = simulateEnteredRealLife || !!userData?.enteredRealLife;
  const shouldShowPhaseJourney = activeTab === "home" && !isRealLifeEntered;
  const shouldShowHomeBento = activeTab !== "home" || isRealLifeEntered;
  const subscriptionStatus = userData?.subscriptionStatus || userData?.subscription_status || "";
  const subscriptionTier = userData?.subscription_tier || userData?.subscriptionTier || "";
  const isProMember =
    userData?.role === "premium" ||
    subscriptionTier === "pro" ||
    ["active", "trialing"].includes(subscriptionStatus) ||
    !!userData?.isLifetimeMember;
  const hasHabitMasterTools = currentLevel >= 10;
  const shouldShowMembershipStatus = activeTab === "home" && (isPhase3Completed || isRealLifeEntered);
  const shouldShowHomeHeader = activeTab === "home" && !(isPhase3Completed && !isRealLifeEntered);
  const shouldShowHomeLevelStrip = activeTab === "home" && !isPhase3Completed && !isRealLifeEntered;
  const promptPayQrUrl = process.env.NEXT_PUBLIC_PROMPTPAY_QR_URL || "/promptpay-qr.png";
  const activePhaseIndex = useMemo(() => {
    if (!isPhase1Completed) return 0;
    if (!isPhase2Completed) return 1;
    return 2;
  }, [isPhase1Completed, isPhase2Completed]);

  useEffect(() => {
    if (!shouldShowPhaseJourney || activeTab !== "home" || isRealLifeEntered) return;
    const container = phaseCardsScrollRef.current;
    if (!container || window.innerWidth >= 768) return;

    const timer = window.setTimeout(() => {
      const target = container.children[activePhaseIndex] as HTMLElement | undefined;
      target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activePhaseIndex, activeTab, isRealLifeEntered, shouldShowPhaseJourney]);

  useEffect(() => {
    if (hasHabitMasterTools) return;
    setShowMoneyVault(false);
    setShowBookCollection(false);
  }, [hasHabitMasterTools]);

  useEffect(() => {
    if (activeTab === "quests" && !isPhase1Completed) {
      const hasSeen = localStorage.getItem("hasSeenQuestEnergyPopup");
      if (!hasSeen) {
        setShowQuestEnergyPopup(true);
      }
    }
  }, [activeTab, isPhase1Completed]);

  const loadDashboardData = useCallback(async (currentUser: User) => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const data = await fetchDashboardData(currentUser.uid, currentUser.email, currentUser.displayName);

        // Fetch User's second_brain count (limit to 1 to check if there is at least one note)
        try {
          const notesRef = collection(db, "users", currentUser.uid, "second_brain");
          const notesSnap = await getDocs(query(notesRef, limit(1)));
          setSecondBrainNotesCount(notesSnap.size);
        } catch (err) {
          console.error("Error fetching second_brain notes count:", err);
          setSecondBrainNotesCount(0);
        }

      setChatQuota(data.chatQuota);
      setRelativeWeekInfo(data.currentWeekInfo);

      if (data.wheelData) setLastWheel(data.wheelData);
      if (data.discData) setLastDisc(data.discData);
      if (data.moneyData) setLastMoney(data.moneyData);
      if (data.librarySoulData) setLastLibrarySoul(data.librarySoulData);
      if (data.quoteData) setLastQuote(data.quoteData);
      if ((data as any).ghostResultData) setLastGhostResult((data as any).ghostResultData);
      setHasSoulGuide(data.hasSoulGuide);

      let thisWeekTotal = 0;
      let prevWeekTotal = 0;

      if (data.thisWeekData) {
        setWeeklyData({
          wheel: Math.min(7, data.thisWeekData.wheel || 0),
          disc: Math.min(7, data.thisWeekData.disc || 0),
          money: Math.min(7, data.thisWeekData.money || 0),
          library: Math.min(7, data.thisWeekData.library || 0),
          wildcard: Math.min(7, data.thisWeekData.wildcard || 0),
          challenge: Math.min(7, data.thisWeekData.challenge || 0),
          momentum_count: data.thisWeekData.momentum_count || 0
        });
        thisWeekTotal = Math.min(42, (data.thisWeekData.wheel || 0) + (data.thisWeekData.disc || 0) + (data.thisWeekData.money || 0) + (data.thisWeekData.library || 0) + (data.thisWeekData.wildcard || 0) + (data.thisWeekData.challenge || 0));
      } else {
        setWeeklyData({ wheel: 0, disc: 0, money: 0, library: 0, wildcard: 0, challenge: 0, momentum_count: 0 });
      }

      if (data.prevWeekData) {
        prevWeekTotal = (data.prevWeekData.wheel || 0) + (data.prevWeekData.disc || 0) + (data.prevWeekData.money || 0) + (data.prevWeekData.library || 0) + (data.prevWeekData.wildcard || 0) + (data.prevWeekData.challenge || 0);
      }

      const currentWeekInfo = data.currentWeekInfo;
      const userData = data.userData;
      setUserData(userData);

      // Check for weekly wrap-up transition
      const currentWeekId = currentWeekInfo?.id || "week-1";
      const lastSeenWeekId = userData?.lastSeenWeekId || "";
      const prevWeekId = data.prevWeekInfo?.id || "";

      if (currentWeekId !== "week-1" && lastSeenWeekId !== prevWeekId) {
        setPrevWeekInfoState(data.prevWeekInfo);
        setPrevWeekDataState(data.prevWeekData || { wheel: 0, disc: 0, money: 0, challenge: 0, focusMinutes: 0 });
        setShowWeeklySummaryModal(true);
      }

      if (currentWeekInfo.id === "week-1") {
        setIsFirstWeek(true);
        setImprovement(0);
      } else {
        setIsFirstWeek(false);
        if (prevWeekTotal > 0) {
          const diff = ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
          setImprovement(Math.round(diff));
        } else {
          setImprovement(thisWeekTotal > 0 ? 100 : 0);
        }
      }
      if (!userData) {
        // Firestore returned no user doc yet — keep XP at 0, done loading
        setTotalXP(0);
        setPotXP(0);
      } else {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

        setGender(userData.gender || "male");

        let currentStreak = userData.streakCount || 0;

        if (userData.lastQuestDate) {
          const lastDate = new Date(userData.lastQuestDate);
          const todayDate = new Date(todayStr);
          const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays > 1 && currentStreak > 0) {
            currentStreak = 0;
            setDoc(doc(db, "users", currentUser.uid), { streakCount: 0 }, { merge: true });
          }
        }

        setStreakCount(currentStreak);
        setWheelPlanDay(userData.wheelPlanDay || 0);
        setWheelPlanTarget(userData.wheelPlanTarget || 7);
        setWheelPlanSkips(userData.wheelPlanSkips || 0);
        setLastSkipDate(userData.lastSkipDate || "");
        setLastChatDate(userData.lastChatDate || "");
        setAiGeneratedQuestTitle(userData.aiGeneratedQuestTitle || "");
        setAiGeneratedDiscTitle(userData.aiGeneratedDiscTitle || "");
        setAiGeneratedMoneyTitle(userData.aiGeneratedMoneyTitle || "");
        setPerfectWeeks(userData.perfectWeeks || 0);
        setIsRandomMode(userData.isRandomMode || false);
        setSlotSeeds(userData.slotSeeds || [0, 0, 0, 0, 0, 0]);
        setLastRerollDate(userData.lastRerollDate || "");
        setWheelCompletions(userData.wheelCompletions || 0);

        let xpToClaim = 0;
        let xpUpdates: any = {};

        if (data.wheelData && !userData.hasWheelXP) {
          xpToClaim += 50;
          xpUpdates.hasWheelXP = true;
        }
        if (data.discData && !userData.hasDiscXP) {
          xpToClaim += 50;
          xpUpdates.hasDiscXP = true;
        }
        if (data.moneyData && !userData.hasMoneyXP) {
          xpToClaim += 50;
          xpUpdates.hasMoneyXP = true;
        }
        if (data.librarySoulData && !userData.hasLibrarySoulXP) {
          xpToClaim += 50;
          xpUpdates.hasLibrarySoulXP = true;
        }
        if ((data as any).ghostResultData && !userData.hasGhostXP) {
          xpToClaim += 50;
          xpUpdates.hasGhostXP = true;
        }

        if (xpToClaim > 0) {
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(userDocRef, {
            ...xpUpdates,
            totalXP: increment(xpToClaim)
          }, { merge: true });

          const oldXP = userData.totalXP || 0;
          const newXP = oldXP + xpToClaim;
          setTotalXP(newXP);
          const oldLevel = Math.floor(oldXP / 100) + 1;
          const newLevel = Math.floor(newXP / 100) + 1;
          if (newLevel > oldLevel) {
            showLevelUpModal(newLevel);
          }
          console.log(`🎉 ระบบตามเก็บ XP ให้คุณแล้ว: +${xpToClaim} XP`);
        } else {
          setTotalXP(userData.totalXP || 0);
        }
        setPotXP(userData.potXP || 0);

        const activeDateToCheck = userData.lastActiveDate || userData.lastQuestDate;

        if (activeDateToCheck === todayStr) {
          setCompletedQuests(userData.completedQuestIds || []);
          setCustomQuestTitle(userData.customQuestTitle || "");
        } else {
          setCompletedQuests([]);
          setCustomQuestTitle("");
          setAiGeneratedQuestTitle("");
          setAiGeneratedDiscTitle("");
          setAiGeneratedMoneyTitle("");

          const userRef = doc(db, "users", currentUser.uid);
          const updates: any = {
            customQuestTitle: "",
            aiGeneratedQuestTitle: "",
            aiGeneratedDiscTitle: "",
            aiGeneratedMoneyTitle: "",
            questPreferences: null
          };

          let currentPlanDay = userData.wheelPlanDay || 0;
          let wheelPlanTarget = userData.wheelPlanTarget || 7;
          let nextPlanDay = currentPlanDay;

          if (currentPlanDay > wheelPlanTarget) {
            // ค้างไว้ที่วันเดิมเพื่อรอให้ผู้ใช้เลือกเส้นทางใน Dashboard
            nextPlanDay = currentPlanDay;
            updates.wheelPlanDay = nextPlanDay;
            updates.lastActiveDate = todayStr;
            updates.completedQuestIds = [];
          } else if (currentPlanDay === wheelPlanTarget) {
            // จบแผนปัจจุบัน (7 วัน หรือ 21 วัน)
            nextPlanDay = currentPlanDay + 1; // ไปที่ 8 หรือ 22

            const completions = userData.wheelCompletions || 0;
            let bonusXP = 0;
            let milestoneName = "";
            let modalType: "PERFECT" | "GREAT" | "GOOD" = "GOOD";

            if (wheelPlanTarget === 7) {
              if (completions >= 7) {
                bonusXP = 100;
                milestoneName = "PERFECT RUN!";
                modalType = "PERFECT";
              } else if (completions >= 5) {
                bonusXP = 50;
                milestoneName = "GREAT RUN!";
                modalType = "GREAT";
              } else if (completions >= 1) {
                bonusXP = 20;
                milestoneName = "GOOD RUN!";
                modalType = "GOOD";
              }
            } else if (wheelPlanTarget === 21) {
              // ช่วงขยายแผน Day 8-21 (รวม 14 วัน)
              if (completions >= 12) {
                bonusXP = 250;
                milestoneName = "EXTRAORDINARY RUN!";
                modalType = "PERFECT";
              } else if (completions >= 8) {
                bonusXP = 100;
                milestoneName = "GREAT RUN (21 DAYS)!";
                modalType = "GREAT";
              } else if (completions >= 1) {
                bonusXP = 50;
                milestoneName = "GOOD RUN (21 DAYS)!";
                modalType = "GOOD";
              }
            }

            const xpToAdd = bonusXP;
            const perfectWeekInc = (wheelPlanTarget === 7 && modalType === 'PERFECT') ? 1 : 0;

            // 📊 Archive current week's weeklySavings to weekly_stats doc
            try {
              const weeklyRef = doc(db, "users", currentUser.uid, "weekly_stats", data.currentWeekInfo.id);
              await setDoc(weeklyRef, {
                weeklySavings: userData.weeklySavings || 0,
                updatedAt: new Date()
              }, { merge: true });
            } catch (e) {
              console.error("Failed to archive weeklySavings to weekly_stats:", e);
            }

            updates.wheelPlanDay = nextPlanDay;
            updates.lastActiveDate = todayStr;
            updates.completedQuestIds = [];
            updates.wheelCompletions = 0;
            updates.weeklySavings = 0; // 🐷 รีเซ็ตเงินออมสะสมรายสัปดาห์

            if (xpToAdd > 0) {
              setRewardModalData({
                title: milestoneName,
                bonusXP: xpToAdd,
                message: wheelPlanTarget === 7
                  ? `สรุปผลแผน 7 วัน! คุณทำสำเร็จทั้งหมด ${completions} วันครับ รับโบนัสความพยายามไปเลย!\n\n💡 แนะนำ: ลองขยายแผนเป็น 21 วันเพื่อสร้างนิสัยจริงต่อเนื่อง หรือเลือกประเมินใหม่เพื่อรับแผนใหม่กันครับ!`
                  : `คุณรักษาวินัยต่อเนื่องจนครบ 21 วันสำเร็จ! (สำเร็จ ${completions} วันในรอบหลัง) เก่งสุดยอดระดับ Extraordinary เลยครับ!\n\n💡 แนะนำ: ได้เวลาประเมินวงล้อชีวิตอีกครั้งเพื่ออัปเดตสมดุลชีวิตและรับเป้าหมายชุดใหม่กันแล้ว!`,
                type: modalType,
                weeklySavings: userData?.weeklySavings || 0
              });
              updates.totalXP = increment(xpToAdd);
              if (perfectWeekInc > 0) {
                updates.perfectWeeks = increment(perfectWeekInc);
              }
            }

            if (xpToAdd > 0) {
              const currentXP = (userData.totalXP || 0) + xpToClaim;
              const newXP = currentXP + xpToAdd;
              const oldLevel = Math.floor(currentXP / 100) + 1;
              const newLevel = Math.floor(newXP / 100) + 1;
              if (newLevel > oldLevel) {
                showLevelUpModal(newLevel);
              }
              setTotalXP(newXP);
              if (perfectWeekInc > 0) {
                setPerfectWeeks((userData.perfectWeeks || 0) + perfectWeekInc);
              }
              setShowPerfectWeekModal(true);
            }

            setWheelCompletions(0);

          } else {
            nextPlanDay = currentPlanDay + 1;
            updates.wheelPlanDay = nextPlanDay;
            updates.lastActiveDate = todayStr;
            updates.completedQuestIds = [];
          }

          try {
            await updateDoc(userRef, updates);
            setUserData((prev: any) => prev ? { ...prev, ...updates } : null);
          } catch (e) {
            console.error("Failed to update user dashboard data for new day:", e);
          }

          setWheelPlanDay(nextPlanDay);
        }

        if (userData.lastQuoteDate === todayStr) {
          setHasClaimedQuoteToday(true);
        } else {
          setHasClaimedQuoteToday(false);
        }
      }

        break; // Success! Break out of retry loop.
      } catch (error) {
        attempts++;
        console.error(`Error fetching Dashboard data (attempt ${attempts}/${maxAttempts}):`, error);
        if (attempts >= maxAttempts) {
          break; // Max attempts reached, exit loop
        }
        // Wait 800ms before retrying to allow auth state to propagate to Firestore client
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    if (!user || checkout !== "success" || !sessionId || confirmedCheckoutRef.current) return;

    confirmedCheckoutRef.current = true;
    const confirmCheckout = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Confirm checkout failed");
        }

        const plan = data.plan || searchParams.get("plan") || "monthly";
        await loadDashboardData(user);
        setUserData((prev: any) => ({
          ...(prev || {}),
          role: "premium",
          subscription_tier: "pro",
          subscriptionTier: "pro",
          subscriptionStatus: "active",
          subscriptionPlan: plan,
          isFoundingMember: String(plan).startsWith("founding") || plan === "yearly" || plan === "lifetime",
          isLifetimeMember: plan === "lifetime",
        }));
        setIsCelebrating(true);
        playProUpgradeSound();
        setShowMembershipModal(false);
        setShowProSuccessModal(true);
        window.history.replaceState(null, "", "/dashboard");
        setTimeout(() => setIsCelebrating(false), 8000);
      } catch (error) {
        console.error("Checkout confirm failed:", error);
        setShowSuccessToast("ชำระเงินสำเร็จแล้ว กำลังรอ Stripe ยืนยันสถานะ PRO");
      }
    };

    confirmCheckout();
  }, [loadDashboardData, searchParams, user]);

  const [lastChatDate, setLastChatDate] = useState("");
  const [aiGeneratedQuestTitle, setAiGeneratedQuestTitle] = useState("");
  const [aiGeneratedDiscTitle, setAiGeneratedDiscTitle] = useState("");
  const [aiGeneratedMoneyTitle, setAiGeneratedMoneyTitle] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWheelRulesModal, setShowWheelRulesModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);

  useEffect(() => {
    if (!loading && user) {
      const hasSeen = localStorage.getItem('hasSeenDashboardTutorial');
      if (!hasSeen && totalXP === 0) {
        setShowTutorial(true);
      }
    }
  }, [loading, user, totalXP]);

  const finishTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenDashboardTutorial', 'true');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoneyVault, setShowMoneyVault] = useState(false);
  const [vaultItem, setVaultItem] = useState("");
  const [vaultPrice, setVaultPrice] = useState("");
  const [showLineModal, setShowLineModal] = useState(false);

  const handleGenderChange = async (newGender: "male" | "female") => {
    if (!user) return;
    setGender(newGender);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { gender: newGender }, { merge: true });
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };

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
      alert("เกิดข้อผิดพลาดในการหยอดกระปุก");
    }
  };

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
        showLevelUpModal(newLevel);
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

  const handleRedeemItem = async (item: any) => {
    if (!user) return;
    if (potXP < item.price) {
      alert("แต้มในกระปุกไม่เพียงพอ");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        potXP: increment(-item.price)
      });

      setPotXP((prev) => prev - item.price);
      setRedeemedItem(item);
      setShowConfetti(true);
      setShowTicketModal(true);

      playSuccessChime();
      
      setTimeout(() => setShowConfetti(false), 4500);
    } catch (error) {
      console.error("Error redeeming item:", error);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล");
    }
  };

  useEffect(() => {
    setTodayDateStr(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }));

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      setTodayDateStr((prev) => {
        if (prev && prev !== nowStr) {
          setCompletedQuests([]);
          setHasClaimedQuoteToday(false);
          setCustomQuestTitle("");
          setAiGeneratedQuestTitle("");
          setAiGeneratedDiscTitle("");
          setAiGeneratedMoneyTitle("");
          
          if (user) {
            loadDashboardData(user);
          }
          return nowStr;
        }
        return prev || nowStr;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (!showLevelUp && pendingDailySuccess) {
      const timer = setTimeout(() => {
        setShowDailySuccess(true);
        setPendingDailySuccess(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp, pendingDailySuccess]);

  useEffect(() => {
    if (!showLevelUp && !showDailySuccess && !pendingDailySuccess && pendingStreakSavedToast) {
      const timer = setTimeout(() => {
        setShowStreakSavedToast(true);
        setPendingStreakSavedToast(false);
        setTimeout(() => setShowStreakSavedToast(false), 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp, showDailySuccess, pendingDailySuccess, pendingStreakSavedToast]);

  useEffect(() => {
    if (showPerfectWeekModal) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [showPerfectWeekModal]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setNewName(currentUser.displayName || "");
        
        await loadDashboardData(currentUser);
        await loadPlaylistBooks(currentUser.uid);

        // Update lastLoginAt once per session in the background after data loads
        try {
          const hasUpdatedLogin = sessionStorage.getItem("hasUpdatedLogin");
          if (!hasUpdatedLogin) {
            await updateDoc(doc(db, "users", currentUser.uid), {
              lastLoginAt: serverTimestamp()
            });
            sessionStorage.setItem("hasUpdatedLogin", "true");
          }
        } catch (e) {
          console.error("Failed to update lastLoginAt:", e);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, loadDashboardData]);

  // 🛡️ [UI Control]: ซ่อน Header และ Bottom Navigation และ Lock Scroll เมื่อมี Modal สำคัญเด้งขึ้นมา
  useEffect(() => {
    const shouldHide = showRerollConfirm || showLevelUp || showDailySuccess || showShareModal || showLevelInfo || showLineModal || showSuccessToast;
    const nav = document.querySelector('nav');

    if (shouldHide) {
      document.body.classList.add('hide-bottom-nav');
      document.body.style.overflow = 'hidden'; // 🔒 Lock Body Scroll
      if (nav) nav.style.display = 'none';
    } else {
      document.body.classList.remove('hide-bottom-nav');
      document.body.style.overflow = ''; // 🔓 Unlock Body Scroll
      if (nav) nav.style.display = 'flex';
    }

    return () => {
      document.body.classList.remove('hide-bottom-nav');
      document.body.style.overflow = '';
      if (nav) nav.style.display = 'flex';
    };
  }, [showRerollConfirm, showLevelUp, showDailySuccess, showShareModal, showLevelInfo, showLineModal, showSuccessToast]);

  // --- ⏳ Memento Mori / Life Countdown Handlers ---
  const handleSaveMementoMoriData = async (birthdate: string, expectedAge: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const isFirstSetup = !userData?.birthdate;
      const shouldCompletePhase3 = isFirstSetup && isPhase2Completed;
      const updates: any = { birthdate, expectedAge, hasCheckedMemento: true };
      
      if (isFirstSetup) {
        updates.totalXP = increment(15);
        playSuccessChime();
        const oldLevel = Math.floor((userData?.totalXP || 0) / 100) + 1;
        const newLevel = Math.floor(((userData?.totalXP || 0) + 15) / 100) + 1;
        if (newLevel > oldLevel) {
          showLevelUpModal(newLevel);
        }
        setTotalXP((prev) => prev + 15);
      }
      
      await updateDoc(userRef, updates);
      setUserData((prev: any) => ({
        ...prev,
        birthdate,
        expectedAge,
        hasCheckedMemento: true,
        totalXP: (prev?.totalXP || 0) + (isFirstSetup ? 15 : 0)
      }));
      if (shouldCompletePhase3) {
        setPendingJourneyCompletionAfterMementoClose(true);
      }
    } catch (e) {
      console.error("Error saving Memento Mori setup:", e);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลตั้งค่า");
    }
  };

  const revealJourneyCompletionCard = useCallback(() => {
    setPendingJourneyCompletionAfterMementoClose(false);
    setSimulatePhase3Done(true);
    setSimulateEnteredRealLife(false);
    setUserData((prev: any) => prev ? { ...prev, enteredRealLife: false } : null);
    setActiveTab("home");
    setIsCelebrating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsCelebrating(false), 4200);
  }, []);

  const handleCloseMementoModal = useCallback(() => {
    const shouldRevealJourneyCard = pendingJourneyCompletionAfterMementoClose;
    setShowMementoModal(false);
    if (shouldRevealJourneyCard) {
      setTimeout(revealJourneyCompletionCard, 320);
    }
  }, [pendingJourneyCompletionAfterMementoClose, revealJourneyCompletionCard]);

  const handleAddMementoReflection = async (question: string, answer: string, xpReward: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const newReflection = {
        id: "ref-" + Date.now(),
        question,
        answer,
        answeredAt: new Date().toISOString()
      };
      
      const updatedReflections = [...(userData?.mementoReflections || []), newReflection];
      const updates: any = { mementoReflections: updatedReflections };
      
      if (xpReward > 0) {
        updates.totalXP = increment(xpReward);
        playSuccessChime();
        const oldLevel = Math.floor((userData?.totalXP || 0) / 100) + 1;
        const checkNewLevel = Math.floor(((userData?.totalXP || 0) + xpReward) / 100) + 1;
        if (checkNewLevel > oldLevel) {
          showLevelUpModal(checkNewLevel);
        }
        setTotalXP((prev) => prev + xpReward);
      }
      
      await updateDoc(userRef, updates);
      setUserData((prev: any) => ({
        ...prev,
        mementoReflections: updatedReflections,
        totalXP: (prev?.totalXP || 0) + xpReward
      }));
    } catch (e) {
      console.error("Error saving reflection:", e);
      alert("เกิดข้อผิดพลาดในการบันทึกการทบทวน");
    }
  };

  const handleResistTemptation = async () => {
    if (!user) return;
    if (!vaultItem.trim()) {
      alert("กรุณาระบุสิ่งที่ยั้งใจไม่ซื้อ");
      return;
    }
    const priceNum = parseFloat(vaultPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("กรุณาระบุราคาที่ถูกต้อง");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const newLog = {
        id: "tempt-" + Date.now(),
        item: vaultItem.trim(),
        price: priceNum,
        date: new Date().toISOString()
      };

      const todayDate = new Date().toDateString();
      const todaySaves = (userData?.savingsLog || []).filter((log: any) => new Date(log.date).toDateString() === todayDate);
      const earnedXP = todaySaves.length === 0 ? 5 : 0;

      const updates: any = {
        savingsLog: arrayUnion(newLog),
        weeklySavings: increment(priceNum)
      };

      if (earnedXP > 0) {
        updates.totalXP = increment(earnedXP);
        playSuccessChime();
        const oldLevel = Math.floor((userData?.totalXP || 0) / 100) + 1;
        const checkNewLevel = Math.floor(((userData?.totalXP || 0) + earnedXP) / 100) + 1;
        if (checkNewLevel > oldLevel) {
          showLevelUpModal(checkNewLevel);
        }
        setTotalXP((prev) => prev + earnedXP);
      } else {
        playSuccessChime();
      }

      // Sync weeklySavings to weekly_stats doc
      try {
        const weeklyRef = doc(db, "users", user.uid, "weekly_stats", relativeWeekInfo.id);
        await setDoc(weeklyRef, {
          weeklySavings: increment(priceNum),
          updatedAt: new Date()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to sync weeklySavings to weekly_stats:", e);
      }

      await updateDoc(userRef, updates);
      setUserData((prev: any) => ({
        ...prev,
        savingsLog: [...(prev?.savingsLog || []), newLog],
        weeklySavings: (prev?.weeklySavings || 0) + priceNum,
        totalXP: (prev?.totalXP || 0) + earnedXP
      }));

      // Show success toast with feedback
      if (earnedXP > 0) {
        setShowSuccessToast(`สะกดกิเลสสำเร็จ! คุณประหยัดเงินได้ ฿${priceNum.toLocaleString()} เข้าคลังออมมีสติ และได้รับ +5 XP ประจำวันแล้ว 🌟`);
      } else {
        setShowSuccessToast(`สะกดกิเลสสำเร็จ! ออมเงิน ฿${priceNum.toLocaleString()} เข้าคลังออมมีสติ (วันนี้ได้รับโบนัส XP ประจำวันไปแล้ว)`);
      }
      setTimeout(() => setShowSuccessToast(null), 2500);

      // Clear input fields
      setVaultItem("");
      setVaultPrice("");
    } catch (e) {
      console.error("Error saving temptation log:", e);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); router.push("/"); } catch (error) { console.error(error); }
  };

  const handleCloseWeeklySummary = async () => {
    setShowWeeklySummaryModal(false);
    if (user && prevWeekInfoState) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { lastSeenWeekId: prevWeekInfoState.id }, { merge: true });
        setUserData((prev: any) => prev ? { ...prev, lastSeenWeekId: prevWeekInfoState.id } : null);
      } catch (e) {
        console.error("Failed to update lastSeenWeekId:", e);
      }
    }
  };

  const handleResetAllData = async () => {
    if (!user) return;
    const confirmReset = window.confirm("⚠️ ยืนยันการล้างข้อมูลทั้งหมด? จะไม่สามารถกู้คืนได้นะ");
    if (!confirmReset) return;

    try {
      setLoading(true);
      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      const resetDate = new Date();

      // 🏎️ 1. จัดกลุ่มรายการ Collection พร้อมแนบชื่อเพื่อใช้เช็ก Log
      const collectionsToClear = [
        { name: "assessments", query: collection(db, "users", user.uid, "assessments") },
        { name: "readArticles", query: collection(db, "users", user.uid, "readArticles") },
        { name: "focusReflections", query: collection(db, "users", user.uid, "focusReflections") },
        { name: "library_souls", query: collection(db, "users", user.uid, "library_souls") },
        { name: "weekly_stats", query: collection(db, "users", user.uid, "weekly_stats") },
        { name: "discResults", query: query(collection(db, "discResults"), where("userId", "==", user.uid)) },
        { name: "quiz_results", query: query(collection(db, "quiz_results"), where("userId", "==", user.uid)) },
        { name: "quotes", query: query(collection(db, "quotes"), where("userId", "==", user.uid)) },
        { name: "chat_history", query: collection(db, "users", user.uid, "chat_history") },
        { name: "quest_log", query: collection(db, "users", user.uid, "quest_log") },
        { name: "book_playlist", query: collection(db, "users", user.uid, "book_playlist") },
      ];

      // ดึงเอกสารทั้งหมดจากทุกที่ที่ระบุไว้
      const snapshots = await Promise.all(collectionsToClear.map(item => getDocs(item.query)));

      // 🧹 2. วนลูปนับจำนวนและสั่งลบ
      let totalDeleted = 0;
      snapshots.forEach((snap, index) => {
        const colName = collectionsToClear[index].name;
        console.log(`📂 กำลังตรวจสอบ [${colName}]: พบ ${snap.size} รายการ`); // 💡 ทริควิศวกร: ดูว่าหาโฟลเดอร์เจอไหม

        snap.forEach(doc => {
          batch.delete(doc.ref);
          totalDeleted++;
        });
      });

      console.log(`🔥 เตรียมลบเอกสารทั้งหมด: ${totalDeleted} รายการ`);

      // 📝 3. อัปเดต User Profile กลับเป็นค่าเริ่มต้น (ใช้ set + merge ปลอดภัยกว่า update)
      batch.set(userRef, {
        totalXP: 0,
        potXP: 0,
        streakCount: 0,
        wheelPlanDay: 0,
        wheelPlanSkips: 0,
        completedQuestIds: [],
        totalFocusMinutes: 0,     // 🆕 ล้างนาทีสะสม Focus Room
        focusReflections: [],
        readArticles: [],
        lastLibrarySoul: null,
        librarySoulResult: deleteField(),
        customQuestTitle: "",
        lastQuestDate: null,
        lastActiveDate: null,
        lastQuoteDate: null,
        hasWheelXP: false,
        hasDiscXP: false,
        hasMoneyXP: false,
        hasLibrarySoulXP: false,
        lastGhostResult: null,      // 👻 ล้างผล Ghost in You (เก็บเป็น field บน user doc)
        lastGhostResultFull: null,
        hasGhostXP: false,
        hasSoulGuide: false,
        hasCompletedPhase1Quests: false,
        enteredRealLife: false,
        hasCheckedMemento: false,
        birthdate: deleteField(),
        expectedAge: deleteField(),
        mementoReflections: [],
        redeemedHistory: [],
        hasClaimedFocusXP: false,
        hasClaimedMementoXP: false,
        hasMementoXP: false,
        hasCompletedFocusRoom: false,
        lastFocusCompletedAt: null,
        hasReadXP: false,  // 🌟 ปลดล็อกรีเซ็ต XP การอ่าน
        hasFocusXP: false, // 🌟 ปลดล็อกรีเซ็ต XP สมาธิ
        dailyChatCount: 0,  // 🤖 รีเซ็ตพลังงาน AI Mentor
        chatUsageDate: null,
        hasChattedWithFuii: false,
        lastChatTime: deleteField(),
        perfectWeeks: 0,    // 🏆 ล้างจำนวนสัปดาห์ที่สมบูรณ์
        wheelCompletions: 0, // 🎡 ล้างตัวนับความสำเร็จรายวัน
        createdAt: resetDate, // รีเซ็ตเพื่อให้ Weekly Stats กลับไปนับ Week 1 ใหม่
        aiGeneratedQuestTitle: "",
        aiGeneratedDiscTitle: "",
        aiGeneratedMoneyTitle: "",
        lastQuestAnalysisDate: "",
        questPrefsBlockDate: "",
        questPreferences: null,
        bookMatchCache: null,
        lastChatDate: null,
        role: deleteField(),
        subscription_tier: deleteField(),
        subscriptionTier: deleteField(),
        subscriptionStatus: deleteField(),
        subscription_status: deleteField(),
        subscriptionPlan: deleteField(),
        isFoundingMember: deleteField(),
        isLifetimeMember: deleteField(),
      }, { merge: true });

      // 🚀 4. Execute Batch รวดเดียวจบ
      await batch.commit();

      // 🌈 5. เคลียร์ State ในหน้าจอ UI ทันที
      setTotalXP(0);
      setPotXP(0);
      setStreakCount(0);
      setWheelPlanDay(0);
      setWheelPlanSkips(0);
      setWheelCompletions(0); // 🎡 ล้างตัวนับความสำเร็จ
      setPerfectWeeks(0);    // 🏆 ล้าง Badge สะสม
      setCompletedQuests([]);
      setLastWheel(null);
      setLastDisc(null);
      setLastMoney(null);
      setLastLibrarySoul(null);
      setLastQuote(null);
      setLastGhostResult(null);
      setWeeklyData({ wheel: 0, disc: 0, money: 0, library: 0, wildcard: 0, challenge: 0, momentum_count: 0 });
      setIsFirstWeek(true);
      setRelativeWeekInfo(calculateRelativeWeek(resetDate));
      setChatQuota({ used: 0, total: 1 }); // 🤖 รีเซ็ตโควตา AI Mentor ทันที
      setHasSoulGuide(false);
      setAiGeneratedQuestTitle("");
      setAiGeneratedDiscTitle("");
      setAiGeneratedMoneyTitle("");
      setCustomQuestTitle("");
      setCollectionQuests([]);
      setSavedBooks(new Set());
      setShowMementoModal(false);
      setPendingJourneyCompletionAfterMementoClose(false);
      setShowStreakSavedToast(false);
      hasShownStreakSavedToastRef.current = false;
      setSimulatePhase3Done(false);
      setSimulateEnteredRealLife(false);
      setUserData((prev: any) => ({
        ...(prev || {}),
        totalXP: 0,
        potXP: 0,
        streakCount: 0,
        completedQuestIds: [],
        totalFocusMinutes: 0,
        readArticles: [],
        lastLibrarySoul: null,
        lastGhostResult: null,
        lastGhostResultFull: null,
        hasCompletedPhase1Quests: false,
        enteredRealLife: false,
        hasCheckedMemento: false,
        birthdate: null,
        expectedAge: null,
        mementoReflections: [],
        redeemedHistory: [],
        hasCompletedFocusRoom: false,
        hasWheelXP: false,
        hasDiscXP: false,
        hasMoneyXP: false,
        hasLibrarySoulXP: false,
        hasGhostXP: false,
        hasSoulGuide: false,
        hasChattedWithFuii: false,
        lastChatDate: null,
        lastChatTime: null,
        role: null,
        subscription_tier: null,
        subscriptionTier: null,
        subscriptionStatus: null,
        subscription_status: null,
        subscriptionPlan: null,
        isFoundingMember: false,
        isLifetimeMember: false,
      }));
      localStorage.removeItem('hasSeenDashboardTutorial');
      setShowTutorial(true);
      setTutorialStep(1);

      // 🚀 6. เลื่อนขึ้นไปด้านบนสุดเพื่อให้เห็นการเปลี่ยนแปลง
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 🧹 5. เคลียร์ Cache ของ Focus Room (สำคัญมาก)
      localStorage.removeItem("lastFocusDate_cache");
      localStorage.removeItem("deepWork_endTime");
      localStorage.removeItem("deepWork_selectedTime");

      handleTabChange('home');
      alert(`♻️ ล้างประวัติและเริ่มนับหนึ่งใหม่เรียบร้อยครับ!`);

    } catch (error) {
      console.error("Reset Error:", error);
      alert("ไม่สามารถรีเซ็ตข้อมูลได้ ลองเช็ก Console ดู Error Log นะครับ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (providedName?: string) => {
    const finalName = providedName ?? newName;
    // 1. ดึง currentUser ตัวจริงจาก Firebase SDK
    const currentUser = auth.currentUser;

    if (!currentUser || !finalName.trim()) return;

    try {
      const { updateProfile } = await import("firebase/auth");

      // 2. อัปเดตใน Firebase Auth (ใช้ currentUser แทน user จาก state)
      await updateProfile(currentUser, { displayName: finalName.trim() });

      // 3. อัปเดตใน Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { displayName: finalName.trim() });

      // 4. ✅ วิธีอัปเดต UI ที่ถูกต้อง: 
      // สั่ง reload ข้อมูล user จาก server เพื่อให้ state ของ Firebase อัปเดต
      await currentUser.reload();

      // เซ็ต state ใหม่ด้วย object ที่มาจาก Firebase โดยตรง (ห้ามก๊อปปี้เองด้วย {...})
      setUser(auth.currentUser);

      setIsEditingName(false);
      alert("เปลี่ยนชื่อเรียบร้อยครับ!");
    } catch (error) {
      console.error("Update Name Error:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตชื่อ");
    }
  };
  const openInfo = (e: React.MouseEvent, title: string, content: string | React.ReactNode) => {
    e.preventDefault();
    e.stopPropagation();
    setInfoModal({ isOpen: true, title, content });
  };

  // 💡 Popup สำหรับ Money Avatar (เวอร์ชันสวยขึ้น)
  const openMoneyInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastMoney) return;

    const main = MONEY_DATA[lastMoney.resultKey];
    const sec = lastMoney.secondaryKey ? MONEY_DATA[lastMoney.secondaryKey] : null;

    const content = (
      <div className="space-y-6 text-left -mt-2">
        {/* การ์ดตัวตนหลัก */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 overflow-hidden shadow-sm">
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{main.emoji}</div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md shadow-sm mb-3 inline-block">ตัวตนหลัก</span>
            <h4 className="font-black text-2xl text-slate-800 mb-1">{main.title}</h4>
            <p className="text-sm font-bold text-amber-600 mb-3">"{main.motto}"</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{main.desc}</p>

            <div className="space-y-2.5">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-green-100 shadow-sm flex gap-3 items-start">
                <div className="p-1.5 bg-green-100 rounded-lg text-green-600 shrink-0"><CheckCircle2 size={16} /></div>
                <div>
                  <span className="font-black text-green-700 text-xs block mb-0.5">คู่หูการลงทุน</span>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{main.bestPartner.name} - {main.bestPartner.desc}</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-red-100 shadow-sm flex gap-3 items-start">
                <div className="p-1.5 bg-red-100 rounded-lg text-red-500 shrink-0"><AlertCircle size={16} /></div>
                <div>
                  <span className="font-black text-red-700 text-xs block mb-0.5">จุดอ่อน</span>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{main.kryptonite.name} - {main.kryptonite.desc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* การ์ดตัวตนรอง (ถ้ามี) */}
        {sec && (
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-[0.03] pointer-events-none">{sec.emoji}</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-slate-100 mb-3 inline-block">ตัวตนรอง (ซ่อนอยู่)</span>
            <h4 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-2"><span className="text-xl">{sec.emoji}</span> {sec.title}</h4>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">{sec.desc}</p>
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex gap-2">
              <span className="text-amber-500"><Sparkles size={14} /></span>
              <span className="text-slate-500 font-medium leading-relaxed"><span className="font-bold text-slate-700">ทริคเสริมพลัง:</span> {sec.bestPartner.desc}</span>
            </div>
          </div>
        )}
      </div>
    );
    setInfoModal({ isOpen: true, title: "ถอดรหัสสไตล์การเงิน", content });
  };
  const openQuoteInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastQuote) return;

    const mood = lastQuote.mood || "ไม่ระบุ";
    const wordsList = lastQuote.words || [];

    const content = (
      <div className="space-y-5 text-left -mt-2">
        {/* ✨ ความรู้สึกขณะนั้น */}
        <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden shadow-sm">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block mb-1">
              อารมณ์ / ความรู้สึกในตอนนั้น
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-black shadow-[0_4px_10px_rgba(99,102,241,0.2)]">
                {mood}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-3 leading-relaxed">
              นี่คือความรู้สึกที่คุณเลือกไว้ก่อนที่ AI จะประมวลผลกลั่นกรองออกมาเป็นคำคมฮีลใจเฉพาะตัวคุณ
            </p>
          </div>
        </div>

        {/* 💡 3 คำทัชใจ */}
        <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 overflow-hidden shadow-sm">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 block mb-1">
              3 คำศัพท์ที่ทัชใจคุณ
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              {wordsList.length > 0 ? (
                wordsList.map((word: string, i: number) => (
                  <span key={i} className="px-3.5 py-1.5 bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-extrabold shadow-sm">
                    ✨ {word}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs italic">ไม่มีข้อมูลคำศัพท์สะสม</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-bold mt-4 leading-relaxed">
              ชุดคำศัพท์เชิงนามธรรมที่คุณได้ทำการเลือกไว้ ซึ่งถูกนำมาร้อยเรียงเข้ากับเนื้อหาคำคมวันนี้
            </p>
          </div>
        </div>
      </div>
    );

    setInfoModal({ isOpen: true, title: "ถอดรหัสความรู้สึกคำคม", content });
  };
  const openDiscInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastDisc) return;

    const typeKey = (lastDisc.finalResult || lastDisc.result || "C").charAt(0) as 'D' | 'I' | 'S' | 'C';
    const data = DISC_DATA[typeKey];
    if (!data) return;

    // 🏷️ Mapping ชื่อเต็มของ DISC
    const fullNames = {
      D: "Dominance",
      I: "Influence",
      S: "Steadiness",
      C: "Conscientiousness"
    };

    // 🎨 Theme สีเดิมที่จี๊ดจ๊าดตามสไตล์
    const theme = {
      D: { bg: "from-red-50 to-orange-50", border: "border-red-100", text: "text-red-600", badge: "bg-red-100 text-red-700" },
      I: { bg: "from-amber-50 to-yellow-50", border: "border-amber-100", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
      S: { bg: "from-green-50 to-emerald-50", border: "border-green-100", text: "text-green-600", badge: "bg-green-100 text-green-700" },
      C: { bg: "from-sky-50 to-blue-50", border: "border-sky-100", text: "text-blue-600", badge: "bg-sky-100 text-blue-700" }
    }[typeKey];

    const content = (
      <div className="space-y-5 text-left -mt-2">
        <div className={`relative p-6 rounded-[2.5rem] bg-gradient-to-br ${theme.bg} border ${theme.border} overflow-hidden shadow-sm`}>
          {/* Background Decor */}
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{data.emoji}</div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              {/* 🏷️ Badge แบบใหม่: โชว์ชื่อเต็ม Dominance, Influence, etc. */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full shadow-sm border border-white/50 ${theme.badge}`}>
                <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[10px] shadow-sm">
                  {typeKey}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {fullNames[typeKey]} Style
                </span>
              </div>

              {/* ตัวอักษรตัวใหญ่แบบโปร่งแสงนิดๆ */}
              <div className={`hidden sm:flex w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm items-center justify-center font-black text-xl border ${theme.border} ${theme.text}`}>
                {typeKey}
              </div>
            </div>

            <h4 className="font-black text-2xl text-slate-800 mb-2 flex items-center gap-2">
              {data.rpgTitle}
            </h4>
            <p className="text-[14px] text-slate-600 leading-relaxed font-medium mb-6">
              {data.desc}
            </p>

            <div className="space-y-4">
              {/* Box: ข้อควรระวัง */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm flex gap-3 items-start">
                <div className="text-amber-500 shrink-0 mt-0.5"><AlertCircle size={20} /></div>
                <div>
                  <span className="font-black text-amber-700 text-[11px] uppercase tracking-wider block mb-0.5">ข้อควรระวัง (Warning)</span>
                  <span className="text-xs text-slate-600 font-bold leading-relaxed">{data.warning}</span>
                </div>
              </div>

              {/* Grid: คู่หู & คู่ปรับ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="font-black text-blue-600 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} /> คู่หูส่งเสริมกัน
                  </span>
                  <span className="text-[13px] text-slate-800 font-black block mb-1">{data.bestPartner.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug">{data.bestPartner.desc}</span>
                </div>

                <div className="bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="font-black text-red-500 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Target size={14} /> คู่ปรับที่ต้องระวัง
                  </span>
                  <span className="text-[13px] text-slate-800 font-black block mb-1">{data.kryptonite.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug">{data.kryptonite.desc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    setInfoModal({ isOpen: true, title: "DISC STYLE", content });
  };

  const loadPlaylistBooks = async (uid: string) => {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'book_playlist'));
      const books = snap.docs.map(d => {
        const data = d.data();
        return {
          title: data.title || "",
          author: data.author || "",
          category: data.category || "General",
          status: data.status || 'interested',
          savedAt: data.savedAt || ""
        };
      }) as { title: string; author: string; category: string; status?: 'interested' | 'completed'; savedAt?: string }[];
      setPlaylistBooks(books);
      setSavedBooks(new Set(books.filter(b => (b.status || 'interested') === 'interested').map(b => b.title)));
    } catch (err) {
      console.error("Error loading playlist books:", err);
    }
  };

  const getArticleSlug = (bookTitle: string) => {
    const match = mockArticles.find(a => 
      a.title.toLowerCase().includes(bookTitle.toLowerCase()) || 
      bookTitle.toLowerCase().includes(a.title.toLowerCase())
    );
    return match ? match.slug : null;
  };

  const handleSaveBook = async (book: { title: string; author: string; reason?: string; category: string }) => {
    if (!user) return;
    const key = book.title;
    const isSaved = savedBooks.has(key);
    // Optimistic updates
    setSavedBooks(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(key) : next.add(key);
      return next;
    });
    setPlaylistBooks(prev => {
      if (isSaved) {
        return prev.filter(b => b.title !== book.title);
      } else {
        return [...prev, { title: book.title, author: book.author, category: book.category, status: 'interested' }];
      }
    });
    const playlistRef = collection(db, 'users', user.uid, 'book_playlist');
    if (isSaved) {
      const { getDocs, query, where, deleteDoc } = await import('firebase/firestore');
      const q = query(playlistRef, where('title', '==', book.title));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
    } else {
      const { addDoc } = await import('firebase/firestore');
      await addDoc(playlistRef, { 
        title: book.title, 
        author: book.author, 
        category: book.category,
        reason: book.reason || "", 
        status: 'interested',
        savedAt: new Date().toISOString() 
      });
    }
  };

  const handleMarkAsCompleted = async (book: { title: string; author: string; category: string }) => {
    if (!user) return;
    const key = book.title;

    // Optimistic state updates
    setSavedBooks(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setPlaylistBooks(prev =>
      prev.map(b => b.title === key ? { ...b, status: 'completed' } : b)
    );

    try {
      const playlistRef = collection(db, 'users', user.uid, 'book_playlist');
      const { getDocs, query, where, updateDoc } = await import('firebase/firestore');
      const q = query(playlistRef, where('title', '==', key));
      const snap = await getDocs(q);
      snap.forEach(d => updateDoc(d.ref, { status: 'completed' }));
    } catch (err) {
      console.error("Error marking book as completed:", err);
    }
  };

  const handleAddBookManually = async (status: 'interested' | 'completed') => {
    if (!user || !manualBookTitle.trim()) return;
    const title = manualBookTitle.trim();
    const author = manualBookAuthor.trim() || "ไม่ระบุผู้แต่ง";
    const category = "General";

    const newBook = {
      title,
      author,
      category,
      status,
      savedAt: new Date().toISOString()
    };

    // Optimistic update
    setPlaylistBooks(prev => [...prev, newBook]);
    if (status === 'interested') {
      setSavedBooks(prev => {
        const next = new Set(prev);
        next.add(title);
        return next;
      });
    }
    setManualBookTitle("");
    setManualBookAuthor("");

    try {
      const playlistRef = collection(db, 'users', user.uid, 'book_playlist');
      const { addDoc } = await import('firebase/firestore');
      await addDoc(playlistRef, newBook);
    } catch (err) {
      console.error(`Error adding manual book (${status}):`, err);
    }
  };

  // โหลดข้อมูลกล่องสะสมเมื่อ modal เปิด
  const openCollectionModal = async () => {
    if (!user) return;
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    setShowCollectionModal(true);
    setCollectionSelectedDate(todayStr);
    setCollectionLoading(true);
    try {
      const questsSnap = await getDocs(query(
        collection(db, 'users', user.uid, 'quest_log'),
        orderBy('completedAt', 'desc'),
        limit(30)
      ));
      setCollectionQuests(questsSnap.docs.map(d => d.data() as { title: string; type: string; completedAt: string }));
    } catch {
      // fail silently
    } finally {
      setCollectionLoading(false);
    }
  };

  const loadSavedBooks = async () => {
    if (!user) return;
    await loadPlaylistBooks(user.uid);
  };

  const fetchBooks = async () => {
    if (!user || !lastLibrarySoul) return;
    setBookMatchLoading(true);
    setBookMatchBooks([]);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/book-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({
          soulType: lastLibrarySoul.type,
          soulTitle: LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.title || null,
          soulDescription: LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.description || null,
          soulVibe: LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.vibe || null,
          discType: lastDisc?.finalResult?.charAt(0) || lastDisc?.result?.charAt(0) || null,
          moneyType: lastMoney?.resultKey || null,
          wheelGoal: (lastWheel as any)?.goal || null,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.books?.length) {
        setBookMatchBooks(data.books);
        // บันทึกลง Firestore พร้อม soul type — invalidate อัตโนมัติถ้า type เปลี่ยน
        updateDoc(doc(db, 'users', user.uid), {
          bookMatchCache: { books: data.books, soulType: lastLibrarySoul.type },
        }).catch(() => {});
      }
    } catch {
      // fail silently
    } finally {
      setBookMatchLoading(false);
    }
  };

  const handleBookMatch = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user || !lastLibrarySoul) return;
    setBookMatchModal(true);
    loadSavedBooks();
    if (bookMatchBooks.length > 0) return; // session cache

    // โหลด Firestore cache ก่อน — ถ้า soul type ตรงกัน ใช้เลยไม่ fetch ใหม่
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const cache = snap.data()?.bookMatchCache;
      if (cache?.soulType === lastLibrarySoul.type && cache?.books?.length) {
        setBookMatchBooks(cache.books);
        return;
      }
    } catch {}

    fetchBooks();
  };

  const openLibrarySoulInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastLibrarySoul) return;

    const data = LIBRARY_SOULS_RESULTS[lastLibrarySoul.type];
    if (!data) return;

    const content = (
      <div className="space-y-5 text-left -mt-2">
        <div className="relative p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 overflow-hidden shadow-sm">
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{data.emoji}</div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full shadow-sm border border-white/50 bg-emerald-100 text-emerald-700">
                <BookOpen size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{lastLibrarySoul.type} Soul</span>
              </div>
              <div className="hidden sm:flex w-20 h-24">
                <img src={data.bookImage} alt={data.title} className="w-full h-full object-contain drop-shadow-md" />
              </div>
            </div>

            <h4 className="font-black text-2xl text-slate-800 mb-2">{data.title}</h4>
            <p className="text-[14px] text-slate-600 leading-relaxed font-medium mb-6">{data.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm">
                <div className="text-emerald-600 font-black text-xs mb-1 flex items-center gap-2">
                  <BrainCircuit size={14} /> DEEP INSIGHT
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{data.insight}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm">
                <div className="text-amber-600 font-black text-xs mb-1 flex items-center gap-2">
                  <AlertCircle size={14} /> BLIND SPOT
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{data.weakness}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs mb-3 uppercase tracking-widest">
              <Sparkles size={14} /> UPSKILL PATH
            </div>
            <h5 className="font-black text-lg mb-2">{data.upskillTitle}</h5>
            <p className="text-xs text-emerald-100/70 leading-relaxed">{data.upskillDetail}</p>
          </div>
        </div>
      </div>
    );
    setInfoModal({ isOpen: true, title: "วิเคราะห์จิตวิญญาณนักอ่าน", content });
  };

  const openGhostInfo = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!lastGhostResult) return;
    const ghost = ghostResults[lastGhostResult.primary as keyof typeof ghostResults];
    if (!ghost) return;

    const content = (
      <div className="space-y-5 text-left -mt-2">
        <div className="relative p-6 rounded-[2.5rem] bg-[#FAF5F2] border border-[#E6D9C5] overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">{ghost.emoji}</div>
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />

          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-red-200 bg-red-50 text-red-600">
                <Ghost size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">{ghost.fearLabel}</span>
              </div>
              <div className="w-16 h-16 shrink-0">
                <img src={`/ghosts/${ghost.id}.png`} alt={ghost.name} className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]" />
              </div>
            </div>

            <h4 className="font-black text-2xl text-[#3E2723] mb-1">{ghost.name}</h4>
            <p className="text-[11px] text-red-600 font-black uppercase tracking-widest mb-4">"{ghost.tagline}"</p>
            <p className="text-[13px] text-[#5C4033] leading-relaxed mb-5">{ghost.story}</p>

            <div className="flex flex-wrap gap-2">
              {/* ค่า value ต่ำคือจุดที่ขาด ไม่ใช่พฤติกรรมเด่น จึงไม่แสดง */}
              {ghost.stats.filter((s) => s.value >= 50).map((s) => (
                <span key={s.label} className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {lastGhostResult.secondary && ghostResults[lastGhostResult.secondary as keyof typeof ghostResults] && (() => {
          const sec = ghostResults[lastGhostResult.secondary as keyof typeof ghostResults];
          return (
            <div className="flex items-center gap-4 px-5 py-4 rounded-[2rem] bg-white border border-[#E6D9C5] shadow-sm">
              <img src={`/ghosts/${sec.id}.png`} alt={sec.name} className="w-12 h-12 object-contain opacity-80 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-red-600/70 uppercase tracking-widest">ตัวตนรอง</span>
                <span className="text-[15px] font-black text-[#3E2723]">{sec.name}</span>
                <span className="text-[10px] font-bold text-red-600/80 uppercase tracking-wide">{sec.fearLabel}</span>
              </div>
            </div>
          );
        })()}

        <div className="bg-red-50/50 border border-red-200 text-[#3E2723] p-6 rounded-[2rem] relative overflow-hidden">
          <div className="flex items-center gap-2 text-red-600 font-black text-xs mb-3 uppercase tracking-widest">
            <Sparkles size={14} /> วิธีฮีลตัวเอง
          </div>
          <h5 className="font-black text-base text-[#3E2723] mb-3">{ghost.heal.title}</h5>
          <ul className="space-y-2">
            {ghost.heal.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#5C4033] leading-relaxed">
                <span className="text-red-600 font-black shrink-0">{i + 1}.</span> {step}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-red-200/60 text-[11px] text-red-600/80 italic">"{ghost.affirmation}"</div>
        </div>
      </div>
    );
    setInfoModal({ isOpen: true, title: `วิเคราะห์ผี: ${ghost.name}`, content });
  };

  const aiWheelSummary = lastWheel?.analysis || "ระบบกำลังประมวลผลข้อมูล... กรุณาประเมินใหม่อีกครั้งเพื่อรับคำแนะนำจาก AI";

  const totalWeeklyScore = useMemo(() => {
    return (weeklyData.wheel || 0) + (weeklyData.disc || 0) + (weeklyData.money || 0) + (weeklyData.library || 0) + (weeklyData.wildcard || 0) + (weeklyData.challenge || 0);
  }, [weeklyData]);

  const rankInfo = useMemo(() => {
    if (totalWeeklyScore <= 7) return { name: "Survivor", emoji: "🛡️", color: "text-slate-400", bg: "bg-slate-400/20", border: "border-slate-400/30" };
    if (totalWeeklyScore <= 14) return { name: "Warrior", emoji: "⚔️", color: "text-orange-400", bg: "bg-orange-400/20", border: "border-orange-400/30" };
    if (totalWeeklyScore <= 22) return { name: "Elite", emoji: "💎", color: "text-blue-400", bg: "bg-blue-400/20", border: "border-blue-400/30" };
    return { name: "Legend", emoji: "👑", color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400/30" };
  }, [totalWeeklyScore]);

  const weeklyStats = useMemo(() => [
    { label: "Wheel", count: weeklyData.wheel || 0, max: 7, color: "bg-red-500", icon: <PieChart size={14} /> },
    { label: "HABIT", count: weeklyData.disc || 0, max: 7, color: "bg-blue-500", icon: <Users size={14} /> },
    { label: "Money", count: weeklyData.money || 0, max: 7, color: "bg-amber-500", icon: <Wallet size={14} /> },
    { label: "Library", count: weeklyData.library || 0, max: 7, color: "bg-teal-500", icon: <BookOpen size={14} /> },
    { label: "Wild", count: weeklyData.wildcard || 0, max: 7, color: "bg-emerald-500", icon: <Zap size={14} /> },
    { label: "Challenge", count: weeklyData.challenge || 0, max: 7, color: "bg-purple-500", icon: <Target size={14} /> },
    {
      label: "Focus",
      count: Math.floor((weeklyData as any).focusMinutes / 60) || 0,
      max: 10,
      suffix: "h",
      color: "bg-zinc-800",
      icon: <BrainCircuit size={14} />
    },
  ], [weeklyData]);

  const focusAreas = useMemo(() => {
    const areas = [];
    if (lastWheel?.currentScores) {
      const scoresWithLabels = lastWheel.currentScores.map((score: number, i: number) => ({ score, label: categoryNames[i] }));
      const lowestThree = scoresWithLabels.sort((a: any, b: any) => a.score - b.score).slice(0, 3);
      const labelsWithScores = lowestThree.map((item: any) => `${item.label} (${item.score}/10)`).join(", ");
      areas.push({ type: 'wheel', title: 'Wheel of Life', desc: `ช่วงนี้ลองจัดเวลาโฟกัสและดูแลด้าน ${labelsWithScores} เพิ่มขึ้นอีกนิดนะครับ`, color: 'bg-red-500', textColor: 'text-red-400' });
    }

    if (lastDisc) {
      const typeKey = (lastDisc.finalResult || lastDisc.result || "C").charAt(0);
      let discWarning = DISC_DATA[typeKey]?.warning || lastDisc?.resultData?.warning || lastDisc?.warning || "ระวังการมองข้ามรายละเอียดเล็กๆ น้อยๆ";
      areas.push({ type: 'disc', title: 'จุดระวัง (DISC)', desc: discWarning, color: 'bg-blue-500', textColor: 'text-blue-400' });
    }

    if (lastMoney) {
      const risk = lastMoney.resultKey;
      let moneyKryptonite = lastMoney?.resultData?.kryptonite?.desc || lastMoney?.kryptonite || MONEY_DATA[risk]?.kryptonite.desc || "ระวังการใช้จ่ายตามอารมณ์ ควรจัดสรรเงินสำรองฉุกเฉินให้เพียงพอเสมอ";
      areas.push({ type: 'money', title: 'หลุมพรางการเงิน', desc: moneyKryptonite, color: 'bg-amber-500', textColor: 'text-amber-400' });
    }
    return areas;
  }, [lastWheel, lastDisc, lastMoney]);

  // 1. แยกหาวัดด้านที่ต้องการโฟกัส (Target Gap) ออกมาเป็น Hook เดี่ยวๆ
  const wheelArea = useMemo(() => {
    if (lastWheel?.currentScores && lastWheel?.targetScores) {
      const gaps = lastWheel.currentScores.map((current: number, i: number) => ({
        index: i,
        gap: (lastWheel.targetScores[i] || 0) - current,
        label: categoryNames[i]
      }));

      // 1. หา Top 3 ด้านที่ Gap เยอะที่สุด
      const top3Gaps = [...gaps]
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3);

      // 2. ใช้ Seed ของวัน (todayDateStr) มาช่วยสุ่มเลือก 1 ใน 3 นี้
      // วิธีนี้จะทำให้ Category เปลี่ยนไปตามวัน แต่ยังอยู่ในกลุ่มที่เรา Focus
      if (todayDateStr && top3Gaps.length > 0) {
        const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
        const randomIndex = seed % top3Gaps.length;
        return top3Gaps[randomIndex].label;
      }

      return top3Gaps[0]?.label || "การงาน";
    }

    return "การงาน";
  }, [lastWheel, todayDateStr]);

  // 💡 ชุดคำถามนำทางสำหรับออกแบบภารกิจเอง (Guided Prompts)
  const guidedPrompts = useMemo(() => [
    "งานอะไรที่ถ้าทำเสร็จวันนี้ แล้วคุณจะภูมิใจที่สุด? 🏆",
    "นิสัยเล็กๆ อะไรที่คุณอยากเอาชนะให้ได้ในวันนี้? 🔥",
    "วันนี้จะทำอะไร 1 อย่าง ให้เข้าใกล้เป้าหมาย 1 ปีมากขึ้น? 🎯",
    "ทักษะไหนที่คุณอยากฝึกฝนให้คมขึ้นในวันนี้? 🧠",
    "อะไรคือ 1 อย่างที่ถ้าทำแล้ว จะทำให้เรื่องอื่นๆ ง่ายขึ้น? ✨",
    "วันนี้คุณอยากจะช่วยเหลือหรือส่งต่อพลังงานดีๆ ให้ใคร? 🤝",
    "มีโปรเจกต์ไหนที่ค้างคา และคุณจะจัดการให้คืบหน้าในวันนี้? 🚀"
  ], []);

  // 🕒 สุ่มคำถามรายวันโดยอิงจากวันที่ (Seeded Random)
  const dailyGuidedPrompt = useMemo(() => {
    if (!todayDateStr) return guidedPrompts[0];
    const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
    return guidedPrompts[seed % guidedPrompts.length];
  }, [todayDateStr, guidedPrompts]);

  // 🤖 AI Quest Analysis — รันเมื่อขึ้นวันใหม่ หรือมีแชทใหม่/ความต้องการใหม่
  useEffect(() => {
    if (!user || !todayDateStr || loading) return;

    const runAnalysis = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      
      // ข้ามถ้าวันนี้ทำเควส Challenge (ID 4) สำเร็จไปแล้ว เพื่อไม่ให้เควสโดนเปลี่ยนทับกลางคัน
      const completedIds: (string | number)[] = data?.completedQuestIds || [];
      const isChallengeDoneToday = completedIds.some(id => String(id) === '4');
      if (isChallengeDoneToday) return;

      const lastAnalysisDate = data?.lastQuestAnalysisDate || '';
      const lastChat = data?.lastChatDate || '';
      const currentLevel = Math.floor((data?.totalXP || 0) / 100) + 1;
      const questPrefsBlockDate = data?.questPrefsBlockDate || '';

      const hasNoAiTitlesInDB = data?.aiGeneratedDiscTitle === undefined || data?.aiGeneratedMoneyTitle === undefined;
      const isNewDay = lastAnalysisDate !== todayDateStr || hasNoAiTitlesInDB;
      const hasFreshPrefs = questPrefsBlockDate && questPrefsBlockDate !== todayDateStr && questPrefsBlockDate > lastAnalysisDate;
      const hasFreshChat = lastChat > lastAnalysisDate;

      const shouldRunAI = hasFreshPrefs || hasFreshChat;

      // ในวันใหม่ทั่วไปที่ไม่มีการแชทหรือปรับแต่งเควสใหม่ → ให้ล้างเควส AI เพื่อกลับไปใช้ Static Pool
      if (isNewDay && !shouldRunAI) {
        try {
          const updates: Record<string, string> = {
            lastQuestAnalysisDate: todayDateStr,
            aiGeneratedQuestTitle: "",
            aiGeneratedDiscTitle: "",
            aiGeneratedMoneyTitle: ""
          };
          await updateDoc(userRef, updates);
          setAiGeneratedQuestTitle("");
          setAiGeneratedDiscTitle("");
          setAiGeneratedMoneyTitle("");
        } catch {
          // fail silently
        }
        return;
      }

      if (!isNewDay && !shouldRunAI) return;
      if (questPrefsBlockDate === todayDateStr && !hasFreshChat && !isNewDay) return;

      // Compute wheelQuestTitle
      let computedWheelTitle = '';
      const lastWheel = data?.lastWheel || null;
      let computedWheelArea = "การงาน";
      if (lastWheel?.currentScores && lastWheel?.targetScores) {
        const gaps = lastWheel.currentScores.map((current: number, i: number) => ({
          index: i,
          gap: (lastWheel.targetScores[i] || 0) - current,
          label: categoryNames[i]
        }));
        const top3Gaps = [...gaps]
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);
        if (todayDateStr && top3Gaps.length > 0) {
          const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
          const randomIndex = seed % top3Gaps.length;
          computedWheelArea = top3Gaps[randomIndex].label;
        }
      }

      let wheelQuestSet = false;
      const isRandomMode = data?.isRandomMode || false;
      const randomWheelQuestTitle = data?.randomWheelQuestTitle || '';
      const wheelPlanDay = data?.wheelPlanDay || 1;

      if (!wheelQuestSet && isRandomMode && randomWheelQuestTitle) {
        computedWheelTitle = randomWheelQuestTitle;
        wheelQuestSet = true;
      }
      if (!wheelQuestSet && lastWheel?.analysis) {
        const planSection = lastWheel.analysis.split('📅')[1];
        if (planSection) {
          const planItems = planSection.split('\n')
            .filter((l: string) => l.match(/^[1-7]\.|^-|\bDay\s?[1-7]\b/i))
            .map((l: string) => l.replace(/^[1-7]\.\s*|^-\s*|\*\*/g, '').trim());

          if (planItems.length > 0) {
            const isWheelDoneToday = completedIds.includes(1);
            const displayDay = (isWheelDoneToday && wheelPlanDay === 8) ? 7 : wheelPlanDay;

            if (displayDay > 0 && displayDay <= 7) {
              const dayIdx = Math.min(6, displayDay - 1);
              let currentDayPlan = planItems[dayIdx] || planItems[0];
              computedWheelTitle = `DAY ${displayDay}/7 | ${currentDayPlan.replace(/^(Day\s*\d+\s*[:\-]\s*|\d+\.\s*)/i, '').trim()}`;
              wheelQuestSet = true;
            } else {
              computedWheelTitle = `🏆 จบแผน 7 วันแล้ว! พักผ่อนให้เต็มที่ พรุ่งนี้ค่อยมาเริ่มประเมินใหม่นะ`;
              wheelQuestSet = true;
            }
          }
        }
      }

      if (!wheelQuestSet) {
        const dateSeed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
        const userSeed = user.uid.split('').slice(-5).reduce((acc, accChar) => acc + accChar.charCodeAt(0), 0);
        const wheelSeed = dateSeed + userSeed;
        const wheelPool = QUEST_POOL.WHEEL[computedWheelArea as keyof typeof QUEST_POOL.WHEEL] || QUEST_POOL.WHEEL["การงาน"];
        const x = Math.sin(wheelSeed * 1.5 * 12.9898 + 1.5 * 78.233) * 43758.5453123;
        const wheelIdx = Math.floor((x - Math.floor(x)) * wheelPool.length);
        computedWheelTitle = wheelPool[wheelIdx];
      }

      try {
        const idToken = await user.getIdToken();
        console.log("🤖 [AI Quest Analysis] Triggering API call. Payload:", { level: currentLevel, wheelQuestTitle: computedWheelTitle });
        const res = await fetch('/api/quest-analysis', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: currentLevel, wheelQuestTitle: computedWheelTitle }),
        });
        if (!res.ok) {
          console.log("❌ [AI Quest Analysis] API call failed with status:", res.status);
          return;
        }
        const { questTitle, discTitle, moneyTitle } = await res.json();
        console.log("✨ [AI Quest Analysis] API response parsed:", { questTitle, discTitle, moneyTitle });
        if (!questTitle && !discTitle && !moneyTitle) {
          console.log("⚠️ [AI Quest Analysis] AI returned empty titles (falling back to static pool).");
          return;
        }

        const updates: Record<string, string> = {};
        updates.lastQuestAnalysisDate = todayDateStr;
        updates.aiGeneratedQuestTitle = questTitle || "";
        updates.aiGeneratedDiscTitle = discTitle || "";
        updates.aiGeneratedMoneyTitle = moneyTitle || "";

        await updateDoc(userRef, updates);
        setAiGeneratedQuestTitle(questTitle || "");
        setAiGeneratedDiscTitle(discTitle || "");
        setAiGeneratedMoneyTitle(moneyTitle || "");
      } catch (err) {
        console.error("❌ [AI Quest Analysis] Client error in runAnalysis:", err);
      }
    };

    runAnalysis();
  }, [user, todayDateStr, loading]);

  const dailyQuests = useMemo(() => {
    if (!todayDateStr || !user?.uid) return [];
    const dateSeed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
    const userSeed = user.uid.split('').slice(-5).reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // 🎡 Seed สำหรับ Wheel (คงที่ตามวัน)
    const wheelSeed = dateSeed + userSeed;

    // 🎲 ฟังก์ชันสุ่มตาม Seed รายข้อ
    const getSeedForSlot = (slotIdx: number) => {
      const base = dateSeed + userSeed;
      const extra = (slotSeeds[slotIdx] || 0) * 137;
      return base + extra;
    };

    const pseudoRandomSlot = (max: number, salt: number, slotIdx: number) => {
      const s = getSeedForSlot(slotIdx);
      const x = Math.sin(s * salt * 12.9898 + salt * 78.233) * 43758.5453123;
      return Math.floor((x - Math.floor(x)) * max);
    };


    const energyLevel = (userData?.lastQuestEnergyDate === todayDateStr) ? userData?.questEnergyLevel : null;
    let wheelXp = 25;
    let otherXp = 20;
    if (energyLevel === "low") {
      wheelXp = 25;
      otherXp = 10;
    } else if (energyLevel === "high") {
      wheelXp = 25;
      otherXp = 25;
    }

    const qList = [
      { id: 1, type: "WHEEL", title: "", xp: wheelXp },
      { id: 2, type: "DISC", title: "", xp: otherXp },
      { id: 3, type: "MONEY", title: "", xp: otherXp },
      { id: 4, type: "CHALLENGE", title: "", xp: otherXp },
    ];

    // 🎯 [NEW LOGIC] จัดการแผน AI: ให้เวลา 1 วันสำหรับ Audit
    let wheelQuestSet = false;

    if (!wheelQuestSet && isRandomMode && randomWheelQuestTitle) {
      qList[0].title = randomWheelQuestTitle;
      wheelQuestSet = true;
    }
    if (!wheelQuestSet && lastWheel?.analysis) {
      const isWheelDoneToday = completedQuests.includes(1);
      const maxTarget = wheelPlanTarget || 7;

      // ถ้าวันนี้ทำไปแล้ว แสดงว่า wheelPlanDay เพิ่งถูกเลื่อนขึ้นไปเป็นตัวถัดไป ให้ถอยกลับมาแสดงของอันเดิมก่อน
      const displayDay = (isWheelDoneToday && wheelPlanDay === (maxTarget + 1)) ? maxTarget : wheelPlanDay;

      if (displayDay > 0 && displayDay <= maxTarget) {
        const lines = lastWheel.analysis.split('\n');
        const dayLine = lines.find((l: string) => {
          const cleanLine = l.replace(/^[\s\-\*•\d\.\(\)]+/, '').trim();
          return cleanLine.toLowerCase().startsWith(`day ${displayDay}`);
        });

        if (dayLine) {
          const cleanText = dayLine
            .replace(/^[\s\-\*•\d\.\(\)]+/, '') // ลบสัญลักษณ์นำหน้ารายการ
            .replace(/^day\s*\d+\s*[:\-|\s]*/i, '') // ลบคำว่า Day X: หรือ Day X -
            .replace(/\*\*/g, '') // ลบตัวหนา Markdown
            .trim();

          qList[0].title = `DAY ${displayDay}/${maxTarget} | ${cleanText}`;
          wheelQuestSet = true;
        } else {
          // Fallback เผื่อหาบรรทัดตรงๆ ไม่เจอ ให้กรองหัวข้อรายการทั้งหมดแล้วจิ้มตาม index
          const planItems = lastWheel.analysis.split('\n')
            .filter((l: string) => l.match(/^\d+\.|^-|\bDay\s?\d+\b/i))
            .map((l: string) => l.replace(/^\d+\.\s*|^-\s*|\*\*/g, '').trim());

          if (planItems.length > 0) {
            const dayIdx = Math.min(planItems.length - 1, displayDay - 1);
            let currentDayPlan = planItems[dayIdx] || planItems[0];
            qList[0].title = `DAY ${displayDay}/${maxTarget} | ${currentDayPlan.replace(/^(Day\s*\d+\s*[:\-]\s*|\d+\.\s*)/i, '').trim()}`;
            wheelQuestSet = true;
          }
        }
      } else {
        // จบแผนแล้ว (Day 8+ หรือ Day 22+)
        qList[0].title = `🏆 จบแผน ${maxTarget} วันแล้ว! พักผ่อนให้เต็มที่ พรุ่งนี้ค่อยมาเริ่มประเมินใหม่นะ`;
        qList[0].xp = 0;
        wheelQuestSet = true;
      }
    }

    // ลำดับ 3: ถ้าไม่มีอะไรเลย สุ่มจาก Pool ตามด้านที่ Gap เยอะ (Logic เดิม)
    if (!wheelQuestSet) {
      const wheelPool = QUEST_POOL.WHEEL[wheelArea as keyof typeof QUEST_POOL.WHEEL] || QUEST_POOL.WHEEL["การงาน"];
      const x = Math.sin(wheelSeed * 1.5 * 12.9898 + 1.5 * 78.233) * 43758.5453123;
      const wheelIdx = Math.floor((x - Math.floor(x)) * wheelPool.length);
      qList[0].title = wheelPool[wheelIdx];
    }

    // Function to check if two quest titles are too similar or overlapping
    const isSimilar = (q1: string, q2: string): boolean => {
      if (!q1 || !q2) return false;

      const clean = (str: string) => {
        return str
          .replace(/[\p{Emoji}\u200d\uFE0F]/gu, '') // remove all emojis
          .trim()
          .replace(/\s+/g, '') // remove all spaces
          .toLowerCase();
      };

      const c1 = clean(q1);
      const c2 = clean(q2);

      if (!c1 || !c2) return false;
      if (c1 === c2) return true;

      // Check if one contains the other and is at least 5 characters long
      if (c1.length >= 5 && c2.includes(c1)) return true;
      if (c2.length >= 5 && c1.includes(c2)) return true;

      // Sliding window search for overlap of length >= 6
      const minLen = 6;
      if (c1.length >= minLen && c2.length >= minLen) {
        for (let i = 0; i <= c1.length - minLen; i++) {
          const sub = c1.substring(i, i + minLen);
          if (c2.includes(sub)) {
            return true;
          }
        }
      }

      return false;
    };

    const getUniqueQuestSlot = (pool: string[], existingTitles: string[], salt: number, slotIdx: number) => {
      let index = pseudoRandomSlot(pool.length, salt, slotIdx);
      let selectedQuest = pool[index];
      let attempts = 0;
      const activeExisting = existingTitles.filter(Boolean);

      while (activeExisting.some(title => isSimilar(title, selectedQuest)) && attempts < 15) {
        index = (index + 1) % pool.length;
        selectedQuest = pool[index];
        attempts++;
      }
      return selectedQuest;
    };

    // ✅ 2. ดึงจาก DISC + LIBRARY (ใช้ AI เจนถ้ามี หรือดึงจาก Pool เป็น fallback)
    const discMainChar = lastDisc ? (lastDisc.finalResult || lastDisc.result || "C").charAt(0) : "C";
    const discPool = QUEST_POOL.DISC[discMainChar as keyof typeof QUEST_POOL.DISC] || QUEST_POOL.DISC["C"];

    // ดึงโปรไฟล์ Library (MBTI)
    const getMbtiQuadrant = (type: string): "NT" | "NF" | "SJ" | "SP" | null => {
      if (!type) return null;
      const t = type.toUpperCase();
      if (t.includes("N") && t.includes("T")) return "NT";
      if (t.includes("N") && t.includes("F")) return "NF";
      if (t.includes("S") && t.includes("J")) return "SJ";
      if (t.includes("S") && t.includes("P")) return "SP";
      return null;
    };
    const mbtiType = lastLibrarySoul?.type || "";
    const mbtiQuadrant = getMbtiQuadrant(mbtiType);
    const libraryPool = mbtiQuadrant ? (QUEST_POOL.LIBRARY[mbtiQuadrant] || []) : [];

    // ยุบรวมคลัง (Merge pools: DISC + LIBRARY)
    const combinedHabitPool = [...discPool, ...libraryPool];
    qList[1].title = aiGeneratedDiscTitle || getUniqueQuestSlot(combinedHabitPool, [qList[0].title], 2.7, 1);

    // ✅ 3. ดึงจาก MONEY (ใช้ AI เจนถ้ามี หรือดึงจาก Pool เป็น fallback)
    const moneyKey = (lastMoney?.resultKey || "MID_RISK_MID_DISC") as keyof typeof QUEST_POOL.MONEY;
    const moneyPool = QUEST_POOL.MONEY[moneyKey] || QUEST_POOL.MONEY["MID_RISK_MID_DISC"];
    qList[2].title = aiGeneratedMoneyTitle || getUniqueQuestSlot(moneyPool, [qList[0].title, qList[1].title], 3.9, 2);

    // ✅ 4. ดึงจาก CHALLENGE (ใช้ AI เจนถ้ามี หรือดึงจาก Pool เป็น fallback)
    qList[3].title = aiGeneratedQuestTitle || getUniqueQuestSlot(QUEST_POOL.CHALLENGE, [qList[0].title, qList[1].title, qList[2].title], 6.8, 3);

    return qList;
  }, [todayDateStr, user?.uid, wheelArea, lastWheel, lastDisc, lastMoney, lastLibrarySoul, isRandomMode, customQuestTitle, randomWheelQuestTitle, wheelPlanDay, completedQuests, rerollCount, slotSeeds, aiGeneratedQuestTitle, aiGeneratedDiscTitle, aiGeneratedMoneyTitle, totalXP, userData?.questEnergyLevel, userData?.lastQuestEnergyDate]);

  // Sync computed dailyQuests to Firestore for other systems (like AI Mentor chat) to access
  useEffect(() => {
    if (!user?.uid || !todayDateStr || !userData || dailyQuests.length === 0) return;

    const storedQuests = userData.currentDailyQuests || [];
    const storedDate = userData.lastQuestDate || "";

    const needsUpdate = storedDate !== todayDateStr || 
      storedQuests.length !== dailyQuests.length ||
      dailyQuests.some((q, idx) => q.title !== storedQuests[idx]?.title);

    if (needsUpdate) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        currentDailyQuests: dailyQuests,
        lastQuestDate: todayDateStr
      }).catch((e) => console.error("Error syncing daily quests:", e));
    }
  }, [user?.uid, todayDateStr, userData, dailyQuests]);

  const dailyXPGained = useMemo(() => {
    return completedQuests.reduce((sum: number, id) => {
      // 1. เควสพิเศษได้ 20 เสมอ
      if (id === 'special-01') return sum + 20;

      if (id === 1 && lastSkipDate === todayDateStr) return sum + 0;

      // 2. เควสปกติหาจาก dailyQuests
      const quest = dailyQuests.find(q => q.id === id);

      // 3. บวกคะแนนเต็ม (quest.xp) ไม่ต้องเช็กลำดับข้อแล้ว
      return sum + (quest?.xp || 0);
    }, 0);
  }, [completedQuests, dailyQuests]);

  const canReroll = useMemo(() => {
    if (!dailyQuests || dailyQuests.length === 0) return false;
    // เควสที่สุ่มใหม่ได้คือ ID 2, 3, 4 (ไม่รวม 1 คือ Wheel)
    // ใช้ String() เพื่อดักทั้งกรณีที่เป็น Number และ String ใน Firebase
    const completedSet = new Set(completedQuests.map(id => String(id)));
    return [2, 3, 4].some(id => !completedSet.has(String(id)));
  }, [dailyQuests, completedQuests]);

  const getLevelTitle = (level: number) => {
    if (level < 10) return "Rookie Upskiller (ผู้เริ่มต้น)";
    if (level < 20) return "Habit Master (เซียนระบบสร้างนิสัย)";
    if (level < 30) return "Life Architect (สถาปนิกออกแบบชีวิต)";
    return "Legacy Shaper (ผู้จารึกตำนานชีวิต)";
  };

  const handleRerollQuests = async () => {
    if (!user || isToggling) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

    if (lastRerollDate === today) {
      alert("วันนี้คุณใช้สิทธิ์สุ่มใหม่ไปแล้วครับ (จำกัด 1 ครั้ง/วัน)");
      return;
    }
    if (totalXP < 5) {
      alert("แต้ม XP ไม่เพียงพอครับ (ต้องใช้ 5 XP)");
      return;
    }

    // 🎯 หาเควสที่ "ยังไม่เสร็จ" และ "ไม่ใช่ Wheel"
    const incompleteNonWheelIndices = [1, 2, 3].filter(idx =>
      !completedQuests.includes(dailyQuests[idx]?.id)
    );

    if (incompleteNonWheelIndices.length === 0) {
      alert("คุณทำเควสที่สุ่มใหม่ได้ครบหมดแล้วครับ!");
      setShowRerollConfirm(false);
      return;
    }

    setShowRerollConfirm(false);
    setIsToggling(true);

    // 🎲 สุ่มเลือกมา 1 ช่อง จากช่องที่ยังไม่เสร็จ
    const targetIdx = incompleteNonWheelIndices[Math.floor(Math.random() * incompleteNonWheelIndices.length)];
    const newSlotSeeds = [...slotSeeds];
    newSlotSeeds[targetIdx] = (newSlotSeeds[targetIdx] || 0) + 1;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        slotSeeds: newSlotSeeds,
        lastRerollDate: today,
        totalXP: increment(-5)
      }, { merge: true });

      setSlotSeeds(newSlotSeeds);
      setLastRerollDate(today);
      setTotalXP(prev => prev - 5);
    } catch (e) {
      console.error("Reroll error:", e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleOpenRerollConfirm = () => {
    setShowRerollConfirm(true);
  };

  // 🏆 ฟังก์ชันคำนวณและแจกรางวัลจบแผน
  const triggerPlanSummary = async (completions: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    let bonusXP = 0;
    let milestoneName = "";
    let modalType: "PERFECT" | "GREAT" | "GOOD" = "GOOD";

    if (completions >= 7) {
      bonusXP = 100;
      milestoneName = "PERFECT RUN!";
      modalType = "PERFECT";
    } else if (completions >= 5) {
      bonusXP = 50;
      milestoneName = "GREAT RUN!";
      modalType = "GREAT";
    } else if (completions >= 1) {
      bonusXP = 20;
      milestoneName = "GOOD RUN!";
      modalType = "GOOD";
    }

    setRewardModalData({
      title: milestoneName,
      bonusXP: bonusXP,
      message: `จบแผน 7 วันแล้ว! คุณทำสำเร็จทั้งหมด ${completions} วันครับ รับโบนัสความพยายามไปเลย!`,
      type: modalType,
      weeklySavings: userData?.weeklySavings || 0
    });

    const finalUpdates: any = {
      totalXP: increment(bonusXP),
      wheelPlanDay: 8, // เข้าสู่สถานะรอประเมินใหม่
    };

    // 🏆 ถ้าเป็น Perfect Run ให้บวก Badge Perfect Week สะสมด้วย
    if (modalType === 'PERFECT') {
      finalUpdates.perfectWeeks = increment(1);
    }

    await updateDoc(userRef, finalUpdates);
    setWheelPlanDay(8);

    const oldLevel = Math.floor(totalXP / 100) + 1;
    const newLevel = Math.floor((totalXP + bonusXP) / 100) + 1;

    if (newLevel > oldLevel) {
      showLevelUpModal(newLevel);
    }

    setTotalXP(prev => prev + bonusXP);
    setShowPerfectWeekModal(true);
  };

  const handleSelectEnergy = async (energy: "low" | "medium" | "high") => {
    if (!user || isSelectingEnergy) return;
    if (userData?.lastQuestEnergyDate === todayDateStr && userData?.questEnergyLevel) {
      return;
    }
    setIsSelectingEnergy(true);
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Update energy selection in Firestore immediately
      await updateDoc(userRef, {
        questEnergyLevel: energy,
        lastQuestEnergyDate: todayDateStr
      });

      // Update local state immediately to lock buttons and show active badge
      setUserData((prev: any) => prev ? {
        ...prev,
        questEnergyLevel: energy,
        lastQuestEnergyDate: todayDateStr
      } : null);

      // Compute wheelQuestTitle (same logic as in updateDailyQuestsIfNeeded)
      let computedWheelTitle = '';
      const lastWheel = userData?.lastWheel || null;
      let computedWheelArea = "การงาน";
      if (lastWheel?.currentScores && lastWheel?.targetScores) {
        const gaps = lastWheel.currentScores.map((current: number, i: number) => ({
          index: i,
          gap: (lastWheel.targetScores[i] || 0) - current,
          label: categoryNames[i]
        }));
        const top3Gaps = [...gaps]
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);
        if (todayDateStr && top3Gaps.length > 0) {
          const seed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
          const randomIndex = seed % top3Gaps.length;
          computedWheelArea = top3Gaps[randomIndex].label;
        }
      }

      let wheelQuestSet = false;
      const isRandomMode = userData?.isRandomMode || false;
      const randomWheelQuestTitle = userData?.randomWheelQuestTitle || '';
      const wheelPlanDay = userData?.wheelPlanDay || 1;

      if (!wheelQuestSet && isRandomMode && randomWheelQuestTitle) {
        computedWheelTitle = randomWheelQuestTitle;
        wheelQuestSet = true;
      }
      if (!wheelQuestSet && lastWheel?.analysis) {
        const planSection = lastWheel.analysis.split('📅')[1];
        if (planSection) {
          const planItems = planSection.split('\n')
            .filter((l: string) => l.match(/^[1-7]\.|^-|\bDay\s?[1-7]\b/i))
            .map((l: string) => l.replace(/^[1-7]\.\s*|^-\s*|\*\*/g, '').trim());

          if (planItems.length > 0) {
            const isWheelDoneToday = completedQuests.includes(1);
            const displayDay = (isWheelDoneToday && wheelPlanDay === 8) ? 7 : wheelPlanDay;

            if (displayDay > 0 && displayDay <= 7) {
              const dayIdx = Math.min(6, displayDay - 1);
              let currentDayPlan = planItems[dayIdx] || planItems[0];
              computedWheelTitle = `DAY ${displayDay}/7 | ${currentDayPlan.replace(/^(Day\s*\d+\s*[:\-]\s*|\d+\.\s*)/i, '').trim()}`;
              wheelQuestSet = true;
            } else {
              computedWheelTitle = `🏆 จบแผน 7 วันแล้ว! พักผ่อนให้เต็มที่ พรุ่งนี้ค่อยมาเริ่มประเมินใหม่นะ`;
              wheelQuestSet = true;
            }
          }
        }
      }

      if (!wheelQuestSet) {
        const dateSeed = parseInt(todayDateStr.replace(/-/g, '')) || 1;
        const userSeed = user.uid.split('').slice(-5).reduce((acc, accChar) => acc + accChar.charCodeAt(0), 0);
        const wheelSeed = dateSeed + userSeed;
        const wheelPool = QUEST_POOL.WHEEL[computedWheelArea as keyof typeof QUEST_POOL.WHEEL] || QUEST_POOL.WHEEL["การงาน"];
        const x = Math.sin(wheelSeed * 1.5 * 12.9898 + 1.5 * 78.233) * 43758.5453123;
        const wheelIdx = Math.floor((x - Math.floor(x)) * wheelPool.length);
        computedWheelTitle = wheelPool[wheelIdx];
      }

      // Check if user has enough history / assessments to call AI quest analysis
      const messagesSnap = await getDocs(
        query(collection(db, "users", user.uid, "chat_history"), orderBy("createdAt", "desc"), limit(30))
      );
      const messages = messagesSnap.docs
        .map(d => d.data())
        .filter(d => d.role === "user" && d.content?.trim())
        .map(d => d.content as string);

      const hasPrefs = userData?.questPreferences && userData?.questPreferences.savedAt === todayDateStr;
      const hasEnoughData = hasPrefs || messages.length >= 5 || userData?.lastDisc || userData?.lastWheel || userData?.lastLibrarySoul || userData?.lastGhostResult || userData?.lastMoney;

      if (hasEnoughData) {
        const idToken = await user.getIdToken();
        const currentLevel = Math.floor((userData?.totalXP || 0) / 100) + 1;

        // Resolve reference pools from quests.ts
        const discMainChar = lastDisc ? (lastDisc.finalResult || lastDisc.result || "C").charAt(0) : "C";
        const discPool = QUEST_POOL.DISC[discMainChar as keyof typeof QUEST_POOL.DISC] || QUEST_POOL.DISC["C"];
        
        const getMbtiQuadrant = (type: string): "NT" | "NF" | "SJ" | "SP" | null => {
          if (!type) return null;
          const t = type.toUpperCase();
          if (t.includes("N") && t.includes("T")) return "NT";
          if (t.includes("N") && t.includes("F")) return "NF";
          if (t.includes("S") && t.includes("J")) return "SJ";
          if (t.includes("S") && t.includes("P")) return "SP";
          return null;
        };
        const mbtiType = lastLibrarySoul?.type || "";
        const mbtiQuadrant = getMbtiQuadrant(mbtiType);
        const libraryPool = mbtiQuadrant ? (QUEST_POOL.LIBRARY[mbtiQuadrant] || []) : [];
        const combinedHabitPool = [...discPool, ...libraryPool];

        const moneyKey = (lastMoney?.resultKey || "MID_RISK_MID_DISC") as keyof typeof QUEST_POOL.MONEY;
        const moneyPool = QUEST_POOL.MONEY[moneyKey] || QUEST_POOL.MONEY["MID_RISK_MID_DISC"];

        const challengePool = QUEST_POOL.CHALLENGE || [];

        const res = await fetch('/api/quest-analysis', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            level: currentLevel, 
            wheelQuestTitle: computedWheelTitle,
            energyLevel: energy,
            habitPool: combinedHabitPool,
            moneyPool: moneyPool,
            challengePool: challengePool
          }),
        });
        
        if (res.ok) {
          const { questTitle, discTitle, moneyTitle } = await res.json();
          if (questTitle || discTitle || moneyTitle) {
            const updates: Record<string, string> = {
              lastQuestAnalysisDate: todayDateStr,
              aiGeneratedQuestTitle: questTitle || "",
              aiGeneratedDiscTitle: discTitle || "",
              aiGeneratedMoneyTitle: moneyTitle || ""
            };
            await updateDoc(userRef, updates);
            setAiGeneratedQuestTitle(questTitle || "");
            setAiGeneratedDiscTitle(discTitle || "");
            setAiGeneratedMoneyTitle(moneyTitle || "");
            setUserData((prev: any) => prev ? {
              ...prev,
              ...updates
            } : null);
          }
        }
      }
    } catch (e) {
      console.error("Error setting energy level:", e);
    } finally {
      setIsSelectingEnergy(false);
    }
  };

  const toggleQuest = async (id: number | string, xp: number) => {
    // 🌟 บล็อกไม่ให้กดซ้ำถ้าระบบกำลังเซฟอยู่
    if (!user || isToggling) return;
    setIsToggling(true);

    const isDone = completedQuests.includes(id);

    if (!isDone) {
      playSuccessChime();
    }

    // 🌟 [COMPLIMENT]: โชว์คำชมเฉพาะเมื่อไม่ใช่ข้อที่ 3 (เพราะข้อ 3 จะโชว์หน้าฉลองใหญ่) 
    // และจะไม่โชว์ถ้ากำลังจะมี Modal ใหญ่เด้งขึ้นมา (Level Up)
    if (!isDone && (completedQuests.length + 1) !== 3 && !showLevelUp) {
      const randomIndex = Math.floor(Math.random() * COMPLIMENTARY_MESSAGES.length);
      setShowSuccessToast(COMPLIMENTARY_MESSAGES[randomIndex]);

      // ตั้งเวลาปิด (2.5 วินาทีพอกำลังสวย ไม่นานเกินไป)
      setTimeout(() => setShowSuccessToast(null), 2500);
    }


    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const userRef = doc(db, "users", user.uid);

    // 1. หาข้อมูลเควส
    const quest = typeof id === 'number' ? dailyQuests.find(q => q.id === id) : null;
    const questType = quest?.type || (id === 'special-01' ? "SPECIAL" : "OTHER");

    let xpChange = isDone ? -xp : xp;

    // 🌟 [NEW LOGIC] จัดการ Wheel Plan Day แยกต่างหาก
    let newWheelDay = wheelPlanDay;

    if (id === 1) { // ข้อ Wheel เสมอ
      // 🎡 [NEW LOGIC] ไม่บวกวันเพิ่มในวันเดียวกัน แต่ให้นับความสำเร็จ (Completions)
      if (!isDone) {
        const newCompletions = wheelCompletions + 1;
        setWheelCompletions(newCompletions);
        updateDoc(userRef, { wheelCompletions: newCompletions });
      } else {
        // กรณี "กดยกเลิก" (Uncheck)
        const newCompletions = Math.max(0, wheelCompletions - 1);
        setWheelCompletions(newCompletions);
        updateDoc(userRef, { wheelCompletions: newCompletions });
      }
    }

    // 2. คำนวณค่าต่างๆ ล่วงหน้า
    let actualXP = xp;

    // 3. เตรียมข้อมูล Array ใหม่
    let newCompleted = isDone
      ? completedQuests.filter(qId => qId !== id)
      : [...completedQuests, id];

    // ⚡ [OPTIMISTIC UPDATE]: อัปเดต State ให้หน้าจอ UI เปลี่ยนทันที ไม่ต้องรอโหลด!
    const rollbackCompleted = [...completedQuests];
    const rollbackXP = totalXP;

    setCompletedQuests(newCompleted);
    setTotalXP(prev => prev + xpChange);

    // 🏆 [NEW] Trigger: ฉลองความสำเร็จเมื่อครบ 3 เควส (ใช้ระบบ Queue เพื่อไม่ให้ทับกับ Level Up)
    if (!isDone && newCompleted.length === 3) {
      setPendingDailySuccess(true);
    }

    // 🛡️ ใส่ try ครอบเนื้อหาที่เป็นการดึง/เซฟข้อมูล Firebase
    try {
      let newStreak = streakCount;
      let newLastQuestDate = todayStr;

      // นับจำนวนเควสที่ทำเสร็จในเซ็ตใหม่ (รวมเควสปกติ + พิเศษ)
      const newCount = newCompleted.length;
      const oldCount = completedQuests.length;

      // 🔥 [Logic Streak ใหม่: ต้องครบ 3 ถึงนับเป็น 1 วัน] 🔥
      if (!isDone && oldCount < 3 && newCount >= 3) {
        const userSnap = await getDoc(userRef);
        const lastDate = userSnap.data()?.lastQuestDate;

        if (lastDate) {
          const last = new Date(lastDate);
          const today = new Date(todayStr);
          const diffTime = today.getTime() - last.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1; // ต่อเนื่องจากเมื่อวาน
          } else if (diffDays > 1) {
            newStreak = 1; // ขาดช่วง (เมื่อวานทำไม่ครบ 3) เริ่มนับ 1 ใหม่
          }
        } else {
          newStreak = 1; // ครั้งแรกสุดในระบบที่ทำครบ 3
        }

        if (streakCount === 0 && newStreak === 1 && !hasShownStreakSavedToastRef.current) {
          hasShownStreakSavedToastRef.current = true;
          setPendingStreakSavedToast(true);
        }

        // โบนัสวินัย 7 วัน (เฉพาะตอนที่ Streak เพิ่งเพิ่ม)
        if (newStreak > streakCount && newStreak % 7 === 0) {
          xpChange += 100;
          // อัปเดตคะแนนโบนัสเข้า UI ตามไปทันที
          setTotalXP(prev => prev + 100);
          // 🛠️ แก้ข้อความใน alert ให้ตรงกับคะแนนจริง
          setTimeout(() => alert(`🎊 สุดยอดวินัย! ครบ ${newStreak} วัน (3 เควส/วัน) รับโบนัสพิเศษ +100 XP`), 800);
        }
        newLastQuestDate = todayStr; // บันทึกว่า "วันนี้ทำเป้าหมายสำเร็จแล้ว"
      }
      // กรณีที่ 2: "กดยกเลิก" จาก 3 เหลือ 2 (ยกเลิกสถานะบรรลุเป้าหมาย)
      else if (isDone && oldCount === 3 && newCount === 2) {
        if (newStreak % 7 === 0 && newStreak !== 0) {
          xpChange -= 100;
          setTotalXP(prev => prev - 100); // ดึง XP โบนัสคืนบนหน้าจอด้วย
        }

        newStreak = Math.max(0, newStreak - 1);

        if (newStreak > 0) {
          const [year, month, day] = todayStr.split('-').map(Number);
          const yesterdayDate = new Date(year, month - 1, day - 1);
          newLastQuestDate = [
            yesterdayDate.getFullYear(),
            String(yesterdayDate.getMonth() + 1).padStart(2, '0'),
            String(yesterdayDate.getDate()).padStart(2, '0')
          ].join('-');
        } else {
          newLastQuestDate = "";
        }
      }
      else {
        // กรณีทำข้อที่ 1, 2, 4, 5 หรือกดยกเลิกข้อที่ 4, 5 ให้รักษาค่าเดิม
        newStreak = streakCount;
        const userSnap = await getDoc(userRef);
        newLastQuestDate = userSnap.data()?.lastQuestDate || "";
      }

      // อัปเดตหลอดไฟสตรีคหน้าจอ
      setStreakCount(newStreak);

      // 🌟 [RELATIVE WEEK LOGIC]
      const weekId = relativeWeekInfo.id;
      const weeklyRef = doc(db, "users", user.uid, "weekly_stats", weekId);
      const incValue = isDone ? -1 : 1;

      if (quest) {
        const statKeys: Record<string, string> = {
          WHEEL: "wheel", DISC: "disc", MONEY: "money", LIBRARY: "library", WILDCARD: "wildcard", CHALLENGE: "challenge"
        };
        const statKey = statKeys[quest.type];

        if (statKey) {
          try {
            const currentVal = (weeklyData[statKey as keyof typeof weeklyData] as number) || 0;
            const newVal = Math.min(7, Math.max(0, currentVal + incValue));

            setWeeklyData((prev: any) => ({ ...prev, [statKey]: newVal }));

            await setDoc(weeklyRef, {
              [statKey]: newVal,
              updatedAt: new Date()
            }, { merge: true });
          } catch (err) {
            console.error("Weekly stats error:", err);
          }
        }
      }

      // 3. คำนวณ Level และเช็ก Level Up เด้ง Popup
      const finalNewXP = rollbackXP + xpChange;
      const newLevel = Math.floor(finalNewXP / 100) + 1;
      const oldLevel = Math.floor(rollbackXP / 100) + 1;

      if (newLevel > oldLevel && xpChange > 0) {
        showLevelUpModal(newLevel);
      }

      // บันทึกลง Firebase (User Profile หลัก)
      const finalUpdates: any = {
        totalXP: finalNewXP,
        completedQuestIds: newCompleted,
        lastQuestDate: newLastQuestDate,
        lastActiveDate: todayStr,
        lastActiveAt: serverTimestamp(),
        streakCount: newStreak,
        wheelPlanDay: newWheelDay
      };

      if (!userData?.hasCompletedPhase1Quests && newCompleted.length >= 2) {
        finalUpdates.hasCompletedPhase1Quests = true;
        setUserData((prev: any) => prev ? { ...prev, hasCompletedPhase1Quests: true } : null);
      }

      await setDoc(userRef, finalUpdates, { merge: true });

      // 📓 Quest log — บันทึกเมื่อ complete เท่านั้น (ไม่บันทึกตอน uncheck)
      if (!isDone) {
        const logRef = collection(db, 'users', user.uid, 'quest_log');
        const logTitle = quest?.title || (id === 'special-01' ? customQuestTitle : '');
        const logType = questType;
        if (logTitle) {
          addDoc(logRef, {
            title: logTitle,
            type: logType,
            xp: xp,
            completedAt: todayStr,
          }).catch(() => {});
        }
      }

    } catch (error) {
      console.error("Error toggling quest:", error);
      setCompletedQuests(rollbackCompleted);
      setTotalXP(rollbackXP);
    } finally {
      setIsToggling(false);
    }
  };

  const renderRadarChart = (scores: number[], targetScores?: number[]) => {
    const size = 280;
    const center = size / 2;
    const radius = size / 2 - 40;

    const getCoordinates = (val: number, index: number) => {
      const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
      const r = radius * (val / 10);
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    // คำนวณจุดของคะแนนปัจจุบัน
    const currentPoints = scores.map((s, i) => `${getCoordinates(s, i).x},${getCoordinates(s, i).y}`).join(" ");

    // คำนวณจุดของเป้าหมายปีหน้า (ถ้ามี)
    const targetPoints = targetScores
      ? targetScores.map((s, i) => `${getCoordinates(s, i).x},${getCoordinates(s, i).y}`).join(" ")
      : null;

    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative w-full max-w-[340px] aspect-square mx-auto flex items-center justify-center pt-4 md:pt-0">
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* 🕸️ Background Grid (วงกลมและเส้นใยแมงมุม) */}
            {[2, 4, 6, 8, 10].map(l => (
              <circle key={l} cx={center} cy={center} r={radius * (l / 10)} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {scores.map((_, i) => (
              <line key={i} x1={center} y1={center} x2={getCoordinates(10, i).x} y2={getCoordinates(10, i).y} stroke="#f1f5f9" strokeWidth="1" />
            ))}

            {/* 🏷️ Labels */}
            {scores.map((_, i) => {
              const { x, y } = getCoordinates(13.5, i);
              return <text key={`label-${i}`} x={x} y={y} fontSize="11" fill="#94a3b8" textAnchor="middle" dominantBaseline="middle" className="font-bold">{categoryNames[i]}</text>
            })}

            {/* 🎯 Target Polygon (เส้นประแสดงเป้าหมายปีหน้า) */}
            {targetPoints && (
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                points={targetPoints}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="transition-all duration-700"
              />
            )}

            {/* 🔴 Current Polygon (พื้นที่ปัจจุบัน) */}
            <motion.polygon
              points={currentPoints}
              fill="rgba(239, 68, 68, 0.15)"
              stroke="#ef4444"
              strokeWidth="2"
              className="transition-all duration-500"
            />

            {/* 📍 Current Score Points (จุดสีแดงและตัวเลข) */}
            {scores.map((s, i) => {
              const pos = getCoordinates(s, i);
              const labelPos = getCoordinates(s + 2.5, i);
              return (
                <g key={`point-${i}`}>
                  <circle cx={pos.x} cy={pos.y} r="4" fill="#ef4444" className="drop-shadow-sm" />
                  <text x={labelPos.x} y={labelPos.y} fontSize="11" fill="#dc2626" textAnchor="middle" dominantBaseline="middle" className="font-black drop-shadow-sm">{s}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* 🧭 Legend Section - วางไว้ใต้กราฟ */}
        <div className="flex justify-center items-center gap-6 mt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ปัจจุบัน</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-0.5 bg-slate-300 rounded-full" />
              <div className="w-1.5 h-0.5 bg-slate-300 rounded-full" />
              <div className="w-1.5 h-0.5 bg-slate-300 rounded-full" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เป้าหมาย 1 ปี</span>
          </div>
        </div>
      </div>
    );
  };


  // ✅ แก้เป็นแบบนี้
  const currentDiscType = lastDisc?.finalResult || lastDisc?.result || null;
  // ✅ แก้บรรทัด 1768 เป็นแบบนี้
  const discMainChar = currentDiscType?.charAt(0) || "";

  // สีพื้นฐานของกรอบ DISC
  const getDiscColors = (type: string | null = "C") => {
    // 🛡️ Guard Clause: ถ้า type เป็น null หรือไม่มีค่า ให้คืนค่าสีดำพรีเมี่ยม
    if (!type || typeof type !== 'string') {
      return {
        main: "bg-zinc-900",
        light: "bg-zinc-950",
        border: "border-white/10",
        text: "text-zinc-400",
        accent: "text-white/20",
        hexBg: "#080808", // พื้นหลังดำพรีเมี่ยม
        hexGlow: "rgba(255,255,255,0.05)"
      };
    }
    if (type.includes("D")) return { main: "bg-red-600", light: "bg-red-50", border: "border-red-100", text: "text-red-700", hover: "group-hover:border-red-300" };
    if (type.includes("I")) return { main: "bg-amber-500", light: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", hover: "group-hover:border-amber-300" };
    if (type.includes("S")) return { main: "bg-green-500", light: "bg-green-50", border: "border-green-100", text: "text-green-700", hover: "group-hover:border-green-300" };
    return { main: "bg-blue-600", light: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", hover: "group-hover:border-blue-300" };
  };
  const discColors = getDiscColors(currentDiscType);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-sm">กำลังโหลด Dashboard ของคุณ...</p>
      </div>
    );
  }

  // 💡 เช็กว่ายังขาดแบบประเมินอันไหนบ้าง
  const missingAssessments = [];
  if (!lastWheel) missingAssessments.push("Wheel of Life");
  if (!lastDisc) missingAssessments.push("DISC");
  if (!lastMoney) missingAssessments.push("Money Avatar");
  if (!lastLibrarySoul) missingAssessments.push("Library of Souls");
  if (!lastGhostResult) missingAssessments.push("Ghost in You");

  const quoteText = lastQuote?.quote || "วันนี้รู้สึกยังไงบ้าง? ลองมาตกผลึกอารมณ์ของคุณเป็นคำคม 1 ประโยคกัน ✨";

  const getQuoteFontSize = (text: string) => {
    if (text.length > 200) return "text-[14px] leading-tight";      // ยาวมาก (บีบฟอนต์ + ชิดบรรทัด)
    if (text.length > 120) return "text-base md:text-lg leading-snug"; // ค่อนข้างยาว
    if (text.length > 60) return "text-lg md:text-[19px] leading-relaxed"; // ความยาวปกติ (เดิม)
    return "text-xl md:text-2xl leading-relaxed"; // สั้นๆ (เน้นให้ใหญ่กระแทกตา)
  };

  const handleDownloadCard = async () => {
    const { domToPng } = await import("modern-screenshot");
    const element = document.getElementById("player-card");

    if (!element) return;

    try {
      setIsCapturing(true);
      // รอให้ State อัปเดตและ Font โหลดเสร็จ
      await new Promise(r => setTimeout(r, 150));
      await document.fonts.ready;

      const currentBgColor = theme?.hexBg || '#0F172A';

      const dataUrl = await domToPng(element, {
        quality: 1,
        scale: 3,
        backgroundColor: currentBgColor,
        style: {
          borderRadius: '2.5rem',
        },
        features: { removeControlCharacter: true },
        filter: (node) => {
          if (node instanceof HTMLElement && node.tagName === 'BUTTON' && node.innerText?.includes('Save')) return false;
          return true;
        }
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `upskill-card-${user?.displayName?.split(' ')[0] || 'member'}.png`;
      link.click();
    } catch (error) {
      console.error("Download Card Error:", error);
      alert("ขออภัย! ไม่สามารถสร้างรูปภาพได้ในขณะนี้");
    } finally {
      setIsCapturing(false);
    }
  };

  const hasDoneWheelToday = completedQuests.includes(1);

  // 1. ดึงตัวอักษรตัวแรก (D, I, S, หรือ C) แบบปลอดภัย
  const discTypeRaw = lastDisc?.finalResult || lastDisc?.result || null;
  const discType = discTypeRaw ? discTypeRaw.charAt(0).toUpperCase() : null;

  // 2. นิยาม Themes (ย้ายมาไว้ข้างบนก่อนเรียกใช้)
  const discThemes = {
    D: {
      baseBg: "bg-rose-950",
      hexBg: "#4c0519",
      glow: "from-rose-500/20",
      hexGlow: "rgba(244, 63, 94, 0.2)",
      border: "border-rose-500/30",
      accent: "text-rose-400"
    },
    I: {
      baseBg: "bg-amber-900",
      hexBg: "#78350f",
      glow: "from-amber-500/20",
      hexGlow: "rgba(245, 158, 11, 0.2)",
      border: "border-amber-500/30",
      accent: "text-amber-400"
    },
    S: {
      baseBg: "bg-emerald-950",
      hexBg: "#064e3b",
      glow: "from-emerald-500/20",
      hexGlow: "rgba(16, 185, 129, 0.2)",
      border: "border-emerald-500/30",
      accent: "text-emerald-400"
    },
    C: {
      baseBg: "bg-blue-950",
      hexBg: "#172554",
      glow: "from-blue-500/20",
      hexGlow: "rgba(59, 130, 246, 0.2)",
      border: "border-blue-500/30",
      accent: "text-blue-400"
    }
  };

  // 3. เลือก Theme (ถ้าไม่มี discType ให้ใช้ Theme ดำพรีเมี่ยมสำหรับ Polkadot)
  const theme = discType && discThemes[discType as keyof typeof discThemes]
    ? discThemes[discType as keyof typeof discThemes]
    : {
      baseBg: "bg-neutral-950",
      hexBg: "#090909",
      glow: "from-white/5",
      hexGlow: "rgba(255,255,255,0.05)",
      border: "border-white/10",
      accent: "text-white/20"
    };

  const memberLabel = isProMember ? "PRO MEMBER" : "STARTER MEMBER";

  const renderPlayerCardCanvas = (id?: string, isCompact?: boolean) => (
    <div
      id={id}
      className={`relative rounded-[3rem] overflow-hidden border-[1px] ${theme.border} shadow-[0_40px_100px_rgba(0,0,0,0.8)] aspect-[3/4.5] flex flex-col items-center ${isCompact ? "pt-8 pb-5 px-6" : "p-8"} transition-all duration-700`}
      style={{
        backgroundColor: theme.hexBg,
        backgroundImage: discType ? `linear-gradient(to bottom, ${theme.hexGlow}, transparent)` : 'none'
      }}
    >
      {discType ? (
        <>
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-[0.015]">
            <div className="flex flex-col gap-4 rotate-[-15deg] scale-125 transform">
              {[...Array(20)].map((_, rowIndex) => (
                <div key={rowIndex} className={`flex gap-10 text-3xl font-black text-white italic ${rowIndex % 2 === 0 ? 'ml-[-30px]' : 'ml-[30px]'}`}>
                  {[...Array(12)].map((_, colIndex) => (
                    <span key={colIndex}>{discType}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span
              className={`text-[46rem] font-black ${theme.accent} leading-none transform italic rotate-[-12deg] -translate-y-8`}
              style={{
                WebkitTextStroke: `14px ${theme.hexGlow}`,
                color: 'transparent',
                opacity: 0.55,
                filter: `drop-shadow(0 0 40px ${theme.hexGlow}99)`,
                lineHeight: 1,
                display: 'inline-block'
              }}
            >
              {discType}
            </span>
          </div>
        </>
      ) : (
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
      )}

      <div
        className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${theme.glow} to-transparent`}
        style={{ pointerEvents: 'none' }}
      />
      <div className={`absolute -bottom-20 -left-20 w-64 h-64 ${theme.glow.replace('from-', 'bg-')} blur-[80px] rounded-full`} />



      <div className="relative z-10 w-full flex justify-between items-start mb-0">
        <div className="flex flex-col pt-1">
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">{memberLabel}</span>
          <h4 className="text-xs font-black text-white/90 tracking-widest">UPSKILL EVERYDAY</h4>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-16 h-16 bg-white/10 rounded-[1.5rem] border border-white/20 flex items-center justify-center ${isCapturing ? '' : 'backdrop-blur-xl'} overflow-hidden p-2.5 ${isCapturing ? '' : 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]'}`}>
            <img
              src={lastLibrarySoul?.type ? `/books/${lastLibrarySoul.type}.png` : "/logo-invert.png"}
              alt="Soul Type"
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo-invert.png"; }}
            />
          </div>
          {lastLibrarySoul?.type && (
            <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] drop-shadow-md">{lastLibrarySoul.type}</span>
          )}
        </div>
      </div>

      <div className={`relative z-0 mb-2 ${isCompact ? "mt-2 sm:mt-4 h-33 sm:h-48" : "mt-4 h-48"} flex justify-center items-end`}>
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-100" />
        <div className={`relative z-10 translate-y-[4px] max-w-[500px] ${isCompact ? "scale-[0.68] sm:scale-[0.85]" : "scale-[0.85]"} origin-bottom`}>
          <AvatarDisplay currentLevel={currentLevel} gender={gender} streak={streakCount} isCompact={isCompact} />
        </div>

        {lastMoney?.resultKey && (
          <div className={`absolute bottom-0 left-1/2 translate-x-[-25%] ${isCompact ? "translate-y-[10px] w-32 h-32" : "translate-y-[14px] w-40 h-40"} z-20`}>
            <img
              src={PET_DATA[lastMoney.resultKey]?.img || PET_DATA.DEFAULT.img}
              alt="Pet"
              crossOrigin="anonymous"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
            />
          </div>
        )}
      </div>

      <div className={`relative z-10 text-center w-full ${isCompact ? "mb-3 mt-0" : "mb-8 -mt-6"}`}>
        <h2 className={`font-black text-white tracking-tight mb-1 sm:mb-2 drop-shadow-lg ${isCompact ? "text-[1.75rem]" : "text-4xl"}`}>
          {user?.displayName?.split(' ')[0]}
        </h2>
        <div className={`inline-flex items-center gap-2 ${isCompact ? "px-4 py-1.5 text-[10px]" : "px-5 py-2 text-[12px]"} bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-2xl font-black uppercase tracking-wider shadow-[0_10px_20px_rgba(245,158,11,0.3)]`}>
          <Trophy size={14} className="fill-current" /> LV.{currentLevel} {getLevelTitle(currentLevel).split(' (')[0]}
        </div>
      </div>



      <div className={`relative z-10 w-full grid grid-cols-2 ${isCompact ? "gap-2 px-1 sm:px-4" : "gap-3 px-2 sm:px-4"} ${isCompact ? "mb-0" : "mb-4"}`}>
        <div className={`bg-white/[0.05] ${isCapturing ? '' : 'backdrop-blur-xl'} ${isCompact ? "p-1.5 min-h-[66px]" : "p-3.5 min-h-[85px]"} rounded-[1.5rem] border ${theme.border} flex flex-col items-center justify-center ${isCapturing ? '' : 'shadow-xl'}`}>
          <span className={`text-[8px] font-black ${theme.accent} uppercase tracking-[0.2em] ${isCompact ? "mb-1 sm:mb-1.5" : "mb-1.5"}`}>DISC STYLE</span>
          <Zap size={14} className={`${theme.accent} ${isCompact ? "mb-1 sm:mb-1.5" : "mb-1.5"}`} />
          <p className="text-[10px] font-bold text-white text-center leading-tight uppercase">
            {lastDisc ? DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle : "Life Explorer"}
          </p>
        </div>

        <div className={`bg-white/[0.05] ${isCapturing ? '' : 'backdrop-blur-xl'} ${isCompact ? "p-2 sm:p-3 min-h-[70px] sm:min-h-[85px]" : "p-3 min-h-[85px]"} rounded-[1.5rem] border border-amber-500/20 flex flex-col items-center justify-center ${isCapturing ? '' : 'shadow-xl'}`}>
          <span className={`text-[8px] font-black text-amber-400 uppercase tracking-[0.2em] ${isCompact ? "mb-1 sm:mb-1.5" : "mb-1.5"}`}>MONEY AVATAR</span>
          <Star size={14} className={`text-amber-400 fill-current ${isCompact ? "mb-1 sm:mb-1.5" : "mb-1.5"}`} />
          <p className="text-[10px] font-bold text-white text-center leading-tight uppercase">
            {lastMoney ? MONEY_DATA[lastMoney.resultKey]?.title : "Asset Builder"}
          </p>
        </div>
      </div>
    </div>
  );
  // เอาไปวางไว้ก่อน return ใน DashboardPage
  const formatInspirationalText = (text: string) => {
    if (!text) return null;

    // แยกส่วนคำคมกับชื่อผู้แต่ง (ถ้ามี)
    const parts = text.split(' - ');
    const quote = parts[0];
    const author = parts[1];

    if (author) {
      return (
        <>
          <span className="block font-black text-slate-800 text-xl md:text-2xl leading-tight mb-3">
            "{quote}"
          </span>
          <span className="block font-bold text-orange-500 text-[10px] md:text-xs tracking-[0.2em] uppercase">
            — {author}
          </span>
        </>
      );
    }

    // ลองแยกด้วยเครื่องหมายวรรคตอนแบบเดิม (เผื่อเป็นข้อความสั้นๆ)
    const match = text.match(/([^!?.]+)([!?.]+)(.*)/);

    if (match) {
      return (
        <>
          <span className="block font-black text-slate-800 text-xl md:text-2xl leading-tight mb-3">
            {match[1]}{match[2]}
          </span>
          <span className="block font-medium text-slate-400 text-sm md:text-base tracking-wide">
            {match[3].trim()}
          </span>
        </>
      );
    }

    // ถ้าไม่มีเครื่องหมายตัด ให้โชว์แบบปกติแต่เน้นหนา
    return <span className="font-black text-slate-800 text-xl md:text-2xl block leading-tight">"{text}"</span>;
  };

  const handleCheckout = async () => {
    if (isRedirecting) return;

    try {
      setIsRedirecting(true);

      // ยิงไปที่ API Route ที่เราทำไว้
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,       // ID จาก Firebase Auth
          email: user?.email,   // Email จาก Firebase Auth
          isSubscription: false // ขาย Report ใช้โหมด Payment ครั้งเดียวจบ
        }),
      });

      const data = await response.json();

      if (data.url) {
        // ส่งไปหน้า Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถติดต่อ Stripe ได้"));
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
      setIsRedirecting(false);
    }
  };

  const handleMembershipCheckout = async (plan: ProPlan = billingPlan) => {
    if (isRedirecting) return;
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนครับ");
      return;
    }

    try {
      setIsRedirecting(true);
      const idToken = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถติดต่อ Stripe ได้"));
      setIsRedirecting(false);
    } catch (error) {
      console.error("Membership checkout error:", error);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
      setIsRedirecting(false);
    }
  };

  const handleMembershipPortal = async () => {
    if (isRedirecting) return;
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนครับ");
      return;
    }

    try {
      setIsRedirecting(true);
      const idToken = await user.getIdToken();
      const response = await fetch("/api/checkout/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.error || "ยังไม่สามารถเปิดหน้าจัดการสมาชิกได้ครับ");
      setIsRedirecting(false);
    } catch (error) {
      console.error("Membership portal error:", error);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
      setIsRedirecting(false);
    }
  };

  const handleTabChange = (tabId: "home" | "overview" | "quests" | "identity" | "resources") => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDevReset = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wheelPlanDay: 1,
        wheelPlanSkips: 0,
        lastSkipDate: "",
        completedQuestIds: [],
        lastQuestAnalysisDate: "",
        aiGeneratedQuestTitle: "",
        aiGeneratedDiscTitle: "",
        aiGeneratedMoneyTitle: ""
      });
      setWheelPlanDay(1);
      setWheelPlanSkips(0);
      setLastSkipDate("");
      setCompletedQuests([]);
      setAiGeneratedQuestTitle("");
      setAiGeneratedDiscTitle("");
      setAiGeneratedMoneyTitle("");
      handleTabChange('home');
      alert("DEV: รีเซ็ตข้อมูลและเตรียมสุ่ม Daily AI Quests ใหม่เรียบร้อยแล้ว!");
    } catch (e) { console.error(e); }
  };

  const renderLockedBentoOverlay = (title: string, detail: string) => (
    <div className="absolute inset-0 z-[90] flex items-center justify-center rounded-[2.5rem] border border-white/50 bg-white/62 p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-[32px]">
      <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.78),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(248,250,252,0.78))]" />
      <div className="relative z-10 flex max-w-[320px] flex-col items-center rounded-[2rem] border border-white/65 bg-white/58 px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
          <Lock size={28} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">Locked</p>
        <h3 className="mt-2 text-[18px] font-black leading-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-[13px] font-bold leading-relaxed text-slate-600">{detail}</p>
      </div>
    </div>
  );

  const renderPlayerCardBack = (sizeClasses = "w-full h-full aspect-[3/4.5]") => {
    return (
      <div 
        className={`relative rounded-[3rem] overflow-hidden border-[1px] ${theme.border} shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-8 transition-all duration-700 cursor-pointer group/back ${sizeClasses}`}
        style={{
          backgroundColor: "#0F172A",
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px"
        }}
        onClick={() => setShowShareModal(true)}
      >
        {/* ✨ Premium Lighting Effects */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Subtle Decorative Borders inside */}
        <div className="absolute inset-4 rounded-[2.2rem] border border-white/5 pointer-events-none" />
        <div className="absolute inset-6 rounded-[2rem] border border-dashed border-white/5 pointer-events-none" />

        {/* Center: Branded Glass Box with Holographic Logo (NO Camera Badge) */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl p-[1px] bg-gradient-to-tr from-pink-500 via-purple-500 via-sky-400 via-emerald-400 to-amber-400 shadow-[0_0_25px_rgba(236,72,153,0.3)] group-hover/back:scale-110 group-hover/back:shadow-[0_0_35px_rgba(56,189,248,0.5)] transition-all duration-500 relative overflow-hidden">
            {/* Shimmer line inside border overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover/back:animate-[pulse_2s_infinite] pointer-events-none" />
            
            <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center p-2.5 relative overflow-hidden">
              {/* Subtle Holo backdrop overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 via-sky-400/10 to-transparent opacity-60 pointer-events-none" />
              
              <img 
                src="/logo-invert.png" 
                alt="Upskill Logo" 
                className="w-full h-full object-contain opacity-95 group-hover/back:opacity-100 transition-opacity z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.25em] drop-shadow-md block group-hover/back:text-amber-400 transition-colors">
              แตะเพื่อดูการ์ด
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
              Tap to Reveal Card
            </span>
          </div>
        </div>

        {/* Branding text at the bottom */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <h4 className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase">UPSKILL EVERYDAY</h4>
        </div>
      </div>
    );
  };

  const renderJourneyPSACard = () => (
    <button
      type="button"
      onClick={() => setShowShareModal(true)}
      className="group relative mx-auto mt-2 block w-full max-w-[310px] text-left"
      title="เปิด Player Card"
    >
      <div className="absolute -inset-3 rounded-[3.2rem] bg-gradient-to-br from-amber-200/70 via-orange-100/80 to-white/80 blur-xl transition-all duration-700 group-hover:blur-2xl" />
      <div className="relative overflow-hidden rounded-[3rem] border border-amber-200/90 bg-gradient-to-br from-white/92 via-orange-50/78 to-amber-50/72 p-3 shadow-[0_36px_100px_rgba(120,53,15,0.22)] backdrop-blur-2xl transition-all duration-500 flex flex-col items-center">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.9),transparent_36%,rgba(255,255,255,0.32)_56%,transparent_74%)] opacity-90" />
        <div className="relative mb-3 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/88 px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(245,158,11,0.10)] w-full">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(251,191,36,0.18),rgba(255,255,255,0.72),rgba(125,211,252,0.18),rgba(244,114,182,0.16))]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
          <p className="relative inline-flex items-center justify-center rounded-full border border-amber-200/70 bg-white/60 px-4 py-1.5 text-center text-[9px] font-black uppercase tracking-[0.32em] text-orange-500 shadow-[0_10px_24px_rgba(245,158,11,0.10)] backdrop-blur-xl">
            Upskill Everyday Certified
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[2.65rem] border border-white/85 bg-white/35 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_52px_rgba(120,53,15,0.14)] backdrop-blur-xl w-full flex justify-center">
          {renderPlayerCardBack("w-full aspect-[3/4.5]")}
        </div>
      </div>
    </button>
  );

  const getCompletedToastStyles = () => {
    switch (completedToastType) {
      case 'wheel':
        return {
          border: 'border-rose-500/30',
          shadow: 'shadow-[0_15px_40px_rgba(244,63,94,0.18)]',
          emoji: '🧬',
          bgEmoji: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        };
      case 'library':
        return {
          border: 'border-emerald-500/30',
          shadow: 'shadow-[0_15px_40px_rgba(16,185,129,0.18)]',
          emoji: '🧬',
          bgEmoji: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        };
      case 'disc':
        return {
          border: 'border-blue-500/30',
          shadow: 'shadow-[0_15px_40px_rgba(59,130,246,0.18)]',
          emoji: '🧬',
          bgEmoji: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        };
      case 'money':
        return {
          border: 'border-amber-500/30',
          shadow: 'shadow-[0_15px_40px_rgba(245,158,11,0.18)]',
          emoji: '🧬',
          bgEmoji: 'bg-amber-500/15 border-amber-500/30 text-amber-500',
        };
      default:
        return {
          border: 'border-white/10',
          shadow: 'shadow-[0_15px_40px_rgba(0,0,0,0.25)]',
          emoji: '🧬',
          bgEmoji: 'bg-slate-800/20 border-slate-700/35 text-slate-400',
        };
    }
  };

  const toastStyle = getCompletedToastStyles();

  return (
    <div className="min-h-screen bg-transparent px-6 md:px-8 py-4 pb-28 md:pb-4">
      {/* 🚀 Floating Premium Circular XP */}
      <FloatingPremiumXP
        isScrolled={isScrolled}
        showFloatingXP={showFloatingXP}
        setShowFloatingXP={setShowFloatingXP}
        currentLevel={currentLevel}
        currentLevelXP={currentLevelXP}
      />


      <div className="max-w-6xl mx-auto">

        {/* --- 🧭 Tabs Navigation — ซ่อนทุก size เพราะ Header (desktop) และ BottomNav (mobile) รับหน้าที่แทนแล้ว --- */}
        <div className="hidden items-center justify-center gap-2 mb-8 w-full">
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-slate-200 flex gap-1 items-center">
            <button onClick={() => handleTabChange('home')} className={`px-5 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 ${activeTab === 'home' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>หน้าหลัก</button>
            <button onClick={() => handleTabChange('overview')} className={`px-5 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>ตัวละครของคุณ</button>
            <button onClick={() => handleTabChange('quests')} className={`px-5 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 ${activeTab === 'quests' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>ภารกิจประจำวัน</button>
            <button onClick={() => handleTabChange('identity')} className={`px-5 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 ${activeTab === 'identity' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>สำรวจตัวตน</button>
            <button onClick={() => handleTabChange('resources')} className={`px-5 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 ${activeTab === 'resources' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>คลังเพิ่มเติม</button>
          </div>
        </div>



        {/* --- 🏠 Home Tab Header --- */}
        {shouldShowHomeHeader && (
          <div className="mt-2 mb-5">
            <div className="relative flex items-center justify-center w-full">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <h2 className="flex items-center gap-3 rounded-full border border-slate-100 bg-white px-6 py-2 text-xl font-black text-slate-800 shadow-sm mx-auto sm:mx-0 shrink-0">
                  <LayoutDashboard size={20} className="text-slate-600" />
                  สรุปภาพรวม
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
              {shouldShowMembershipStatus && (
                <button
                  type="button"
                  onClick={() => setShowMembershipModal(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border border-slate-100 bg-white p-0.5 px-2 sm:px-3 sm:py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all hover:-translate-y-[52%] hover:shadow-[0_16px_38px_rgba(0,0,0,0.06)] active:scale-95 cursor-pointer z-30"
                  title={isProMember ? "สมาชิก PRO" : "ดูแผนสมาชิก"}
                >
                  <span className={`flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full ${
                    userData?.isFoundingMember
                      ? "bg-slate-950 text-amber-400 shadow-inner"
                      : isProMember
                      ? "bg-slate-950 text-violet-400 shadow-inner"
                      : "bg-slate-100 text-slate-400"
                  } shadow-sm`}>
                    {userData?.isFoundingMember ? <Crown size={9} className="sm:w-3 sm:h-3 fill-amber-400/20 text-amber-400" /> : isProMember ? <Sparkles size={9} className="sm:w-3 sm:h-3" /> : <Lock size={9} className="sm:w-3 sm:h-3" />}
                  </span>
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.24em] pl-0.5 ${
                    userData?.isFoundingMember
                      ? "text-amber-500"
                      : isProMember
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}>
                    {userData?.isFoundingMember ? "PRO" : isProMember ? "PRO" : "FREE"}
                  </span>
                </button>
              )}
            </div>

            {shouldShowHomeLevelStrip && (
              <div className="mx-auto mt-4 max-w-3xl rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/90 bg-white/75 p-1 sm:p-2 shadow-[0_24px_80px_rgba(79,70,229,0.14),0_12px_34px_rgba(34,211,238,0.12)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.1rem] sm:rounded-[1.35rem] border border-white/80 bg-gradient-to-r from-violet-50/95 via-white to-cyan-50/95 px-3 py-2 sm:px-4 sm:py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_rgba(15,23,42,0.04)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.24),transparent_27%),linear-gradient(120deg,transparent,rgba(255,255,255,0.78),transparent)]" />
                  <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-rose-500 text-sm sm:text-xl font-black text-white shadow-[0_8px_18px_rgba(236,72,153,0.3),0_0_0_4px_rgba(255,255,255,0.3)]">
                      {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="rounded-full bg-slate-950 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-black text-white shadow-sm">
                          LV.{currentLevel}
                        </span>
                        <span className="max-w-full truncate rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] text-slate-500">
                          {getLevelTitle(currentLevel).split(" (")[0]}
                        </span>
                        <span className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-black text-violet-600">
                          {totalXP} XP
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 sm:gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-slate-200 bg-white/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all duration-700"
                            style={{ width: `${currentLevelXP}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] sm:text-xs font-black text-slate-500">{currentLevelXP}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="ml-0.5 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/75 text-slate-400 shadow-sm transition-all hover:text-red-400 active:scale-95"
                      title="ออกจากระบบ"
                    >
                      <LogOut size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 🌱 3 Phase Journey Cards --- */}
        {shouldShowPhaseJourney && (() => {
          const phase1Steps = [
            { done: !!lastWheel, label: "Wheel of Life", shortDesc: "เช็กสมดุลชีวิต 8 ด้าน", path: "/tools/wheel-of-life", buttonClass: "from-red-500 to-orange-500" },
            { done: !!lastDisc, label: "DISC", shortDesc: "เข้าใจสไตล์การสื่อสารของคุณ", path: "/tools/disc", buttonClass: "from-blue-500 to-indigo-500" },
            { done: !!lastMoney, label: "Money Avatar", shortDesc: "ถอดรหัสนิสัยการเงิน", path: "/tools/money-avatar", buttonClass: "from-amber-400 to-orange-500" },
            { done: !!userData?.hasCompletedPhase1Quests || completedQuests.length >= 2, label: `Daily Quests (${Math.min(completedQuests.length, 2)}/2)`, shortDesc: "ทำภารกิจสั้นๆ เพื่อจบ Phase 1", path: "/dashboard?tab=quests", buttonClass: "from-violet-500 to-cyan-400" },
            { done: !!lastLibrarySoul, label: "Library of Souls", shortDesc: "ค้นหาสไตล์การอ่านของคุณ", path: "/tools/library-of-souls", buttonClass: "from-emerald-400 to-teal-500" },
          ];
          const phase2Steps = [
            { done: !!lastQuote, label: "คมสัดสัด", shortDesc: "สร้างคำคมจากความรู้สึกวันนี้", path: "/tools/khomsatsat", buttonClass: "from-fuchsia-500 to-violet-500" },
            { done: !!lastGhostResult, label: "Ghost in You", shortDesc: "เผชิญหน้าความกลัวลึกๆ", path: "/tools/ghost-in-you", buttonClass: "from-rose-500 to-red-600" },
            { done: hasRedeemedReward, label: "Happiness Shop", shortDesc: "แลก XP เป็นรางวัลเติมใจ", path: "/shop", buttonClass: "from-pink-500 to-orange-400" },
            { done: hasChattedWithFuii, label: "คุยกับพี่ฟุ้ย", shortDesc: "คุยกับ AI Mentor ส่วนตัว", path: "/tools/soul-guide", buttonClass: "from-violet-500 to-indigo-500" },
          ];
          const phase3Steps = [
            { done: claimedReadArticlesCount >= 2 && secondBrainNotesCount >= 1, label: `คลังสมอง: อ่าน ${Math.min(claimedReadArticlesCount, 2)}/2 · จด ${Math.min(secondBrainNotesCount, 1)}/1`, shortDesc: "อ่านบทความและจดบันทึก", path: "/library", buttonClass: "from-yellow-400 to-amber-500" },
            { done: hasCompletedFocusRoom, label: "Focus Room", shortDesc: "ฝึกสมาธิและบันทึก reflection", path: "/tools/focus-room", buttonClass: "from-sky-500 to-blue-600" },
            { done: hasCompletedMemento, label: "Memento Mori", shortDesc: "ทบทวนเวลาชีวิตอย่างมีสติ", path: "/dashboard?memento=1", buttonClass: "from-amber-600 to-[#8B5A2B]" },
          ];

          const phaseCards = [
            {
              num: 1,
              title: "ค้นหาตัวตน",
              desc: "ประเมินสมดุลชีวิต การสื่อสาร\nเข้าใจความรู้ทางการเงิน เลือกหนังสือที่เหมาะกับคุณ",
              image: "/Phase1.png",
              unlocked: true,
              completed: isPhase1Completed,
              steps: phase1Steps,
              unlockText: "",
              buttonClass: "from-orange-500 to-violet-500",
            },
            {
              num: 2,
              title: "สุขระหว่างทาง",
              desc: "เข้าใจความรู้สึกของตัวเอง เผชิญหน้ากับความกลัว\nความสุข และเติบโตไปกับพี่ฟุ้ย",
              image: "/Phase2.png",
              unlocked: isPhase1Completed,
              completed: isPhase2Completed,
              steps: phase2Steps,
              unlockText: "ปลดล็อกหลังจบ Phase 1",
              buttonClass: "from-pink-500 to-violet-500",
            },
            {
              num: 3,
              title: "ระลึกความตาย",
              desc: "ปลดล็อกสรุปบทความดีๆ ฝึกสมาธิและจิตใจ\nเพื่อระลึกถึงคุณค่าของชีวิต",
              image: "/Phase3.png",
              unlocked: isPhase2Completed,
              completed: isPhase3Completed,
              steps: phase3Steps,
              unlockText: "ปลดล็อกหลังจบ Phase 2",
              buttonClass: "from-amber-500 to-[#8B5A2B]",
            },
          ];

          const getNextStep = (steps: typeof phase1Steps) => steps.find((step) => !step.done) || steps[steps.length - 1];

          return (
            <div className="relative mb-10">
              {!isPhase3Completed && (
              <div ref={phaseCardsScrollRef} className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto px-3 pt-3 pb-7 -mx-3 md:mx-0 md:px-0 md:pt-0 md:pb-0 snap-x snap-mandatory scrollbar-none md:overflow-visible">
                {phaseCards.map((phase) => {
                  const doneCount = phase.steps.filter((step) => step.done).length;
                  const nextStep = getNextStep(phase.steps);
                  const currentButtonClass = phase.completed ? "from-emerald-500 to-teal-400" : nextStep.buttonClass || phase.buttonClass;
                  const isActive = phase.unlocked && !phase.completed;

                  return (
                    <motion.div
                      key={phase.num}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative flex min-w-[82vw] snap-center flex-col overflow-hidden rounded-[2.25rem] border shadow-[0_18px_46px_rgba(15,23,42,0.08)] md:min-w-0 ${phase.unlocked ? "border-violet-300/70 bg-slate-950 text-white" : "border-slate-300/70 bg-slate-100 text-slate-500 grayscale"}`}
                    >
                      <div className="relative aspect-[4/3.2] md:aspect-[4/3] overflow-hidden">
                        <img
                          src={phase.image}
                          alt={phase.title}
                          className={`h-full w-full object-cover scale-[1.08] origin-bottom ${phase.unlocked ? "" : "opacity-45 blur-[1px]"}`}
                        />
                        <div className={`absolute inset-0 ${phase.unlocked
                          ? "bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent"
                          : "bg-white/55"
                        }`} />
                        <div className="absolute left-5 top-5 rounded-full border border-white/45 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-md">
                          Phase {phase.num}
                        </div>
                        <div className={`absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black shadow-sm backdrop-blur-md ${phase.completed ? "bg-emerald-500 text-white" : isActive ? "bg-violet-500 text-white" : "bg-slate-500/75 text-white"}`}>
                          {phase.completed ? "ครบแล้ว" : isActive ? "กำลังทำ" : "ล็อกอยู่"}
                          {!phase.unlocked && <Lock size={10} />}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col space-y-4 p-5">
                        <div>
                          <h3 className={`text-2xl font-black ${phase.unlocked ? "text-white" : "text-slate-600"}`}>{phase.title}</h3>
                          <p className={`mt-2 min-h-[3rem] whitespace-pre-line text-sm font-bold leading-relaxed ${phase.unlocked ? "text-slate-300" : "text-slate-400"}`}>{phase.desc}</p>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-black">
                            <span className={phase.unlocked ? "text-slate-400" : "text-slate-500"}>ความคืบหน้า</span>
                            <span>{doneCount}/{phase.steps.length} ขั้นตอน</span>
                          </div>
                          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${phase.steps.length}, minmax(0, 1fr))` }}>
                            {phase.steps.map((step) => (
                              <div key={step.label} className={`h-1.5 rounded-full ${step.done ? `bg-gradient-to-r ${step.buttonClass}` : phase.unlocked ? "bg-slate-700" : "bg-slate-300"}`} />
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-4 pb-1">
                        {phase.completed ? (
                          <div className="flex min-h-[4.25rem] items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08] px-4 py-3 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(16,185,129,0.06)]">
                            <span>
                              <span className="block text-[10px] uppercase tracking-widest text-emerald-300/80">สำเร็จแล้ว</span>
                              Phase Complete
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-2 text-xs text-white shadow-[0_10px_24px_rgba(16,185,129,0.24)]">
                              เรียบร้อย <CheckCircle2 size={13} />
                            </span>
                          </div>
                        ) : phase.unlocked ? (
                          <Link
                            href={nextStep.path}
                            onClick={(e) => {
                              if (nextStep.path.includes("memento")) {
                                e.preventDefault();
                                setShowMementoModal(true);
                              }
                              if (nextStep.path === "/tools/soul-guide" && user && !hasSoulGuide) {
                                setHasSoulGuide(true);
                                setDoc(doc(db, "users", user.uid), { hasSoulGuide: true }, { merge: true });
                              }
                            }}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-black text-white transition-all hover:bg-white/[0.1]"
                          >
                            <span>
                              <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400">ถัดไป</span>
                              <span className="block mt-0.5 text-xs sm:text-sm">{nextStep.label}</span>
                              <span className="mt-1 block text-[10px] sm:text-[11px] font-bold leading-snug text-slate-400">{nextStep.shortDesc}</span>
                            </span>
                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r ${currentButtonClass} px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white shadow-sm`}>
                              {doneCount === 0 || nextStep === phase.steps[0] ? "เริ่มเลย" : "ไปต่อ"} <ArrowRight size={12} />
                            </span>
                          </Link>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="flex min-h-[4.25rem] w-full items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white/58 px-4 py-4 text-xs font-black text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                              <Lock size={13} />
                              {phase.unlockText}
                            </div>
                          </div>
                        )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              )}
              {isPhase3Completed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mt-2 overflow-hidden rounded-[2.5rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 text-center shadow-[0_24px_70px_rgba(245,158,11,0.16)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.25),transparent_34%),radial-gradient(circle_at_85%_30%,rgba(125,211,252,0.20),transparent_24%)]" />
                  <div className="relative z-10">
                  <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                    <Sparkles size={14} />
                    Upskill Everyday Certified
                  </div>
                  <h3 className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 bg-clip-text text-2xl font-black text-transparent">
                    ยินดีด้วย! คุณผ่าน 3 Phase แล้ว
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-[11.5px] sm:text-sm font-bold leading-relaxed text-slate-500 whitespace-nowrap">
                    กดเข้าสู่ชีวิตจริง และเริ่มใช้ระบบพัฒนาตัวเองของคุณกัน
                  </p>
                  {renderJourneyPSACard()}
                  <button
                    type="button"
                    onClick={async () => {
                      setIsCelebrating(true);
                      playSuccessChime();
                      setSimulateEnteredRealLife(true);
                      setUserData((prev: any) => ({ ...prev, enteredRealLife: true }));
                      if (user) {
                        try {
                          await setDoc(doc(db, "users", user.uid), { enteredRealLife: true }, { merge: true });
                        } catch (error) {
                          console.error("Error entering real life:", error);
                        }
                      }
                      window.setTimeout(() => setShowMembershipModal(true), 450);
                      setTimeout(() => setIsCelebrating(false), 850);
                    }}
                    className="mt-5 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-8 py-4 text-sm font-black text-slate-950 shadow-[0_18px_38px_rgba(245,158,11,0.28)] transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    เข้าสู่ชีวิตจริง
                    <ArrowRight size={17} />
                  </button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })()}

        {/* --- 👤 Overview Tab Header --- */}
        {activeTab === "overview" && (
          <div className="mt-2 mb-4 relative flex items-center justify-center">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                <span>👤</span>
                ตัวละครของคุณ
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Gender Switch Toggle */}
            <div className="absolute right-0 flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-sm text-[10px] sm:text-xs font-semibold select-none z-30">
              <button
                onClick={() => handleGenderChange("male")}
                className={`px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold"
                }`}
              >
                <span className="hidden sm:inline">ชาย</span>
                <span className="sm:hidden text-[9px] font-black leading-none">ช</span>
              </button>
              <button
                onClick={() => handleGenderChange("female")}
                className={`px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-pink-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold"
                }`}
              >
                <span className="hidden sm:inline">หญิง</span>
                <span className="sm:hidden text-[9px] font-black leading-none">ญ</span>
              </button>
            </div>
          </div>
        )}

        {/* --- 🧭 1. Top Section --- */}
        {((activeTab === "home" && isRealLifeEntered) || activeTab === "overview") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            <header className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex flex-col group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] border border-slate-800 hover:border-slate-700 overflow-hidden">

              {/* 💡 ฉากหลังและเอฟเฟกต์แสง */}
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 group-hover:h-3 transition-all duration-300" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 blur-[80px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-10 -right-20 opacity-10 rotate-12 hidden md:block transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110">
                  <BrainCircuit size={300} strokeWidth={1} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col flex-1 w-full">

                {/* 📊 1. Top Navbar (🌟 แสดงบน Desktop เท่านั้น - hidden lg:flex) */}
                <div className="hidden lg:flex relative z-[999] flex-row flex-nowrap items-center justify-between gap-4 w-full mb-8">

                  {/* Left: Combined Profile & Level Card */}
                  <div className="flex items-center gap-3 bg-slate-800/80 p-2 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-auto min-w-[280px] xl:min-w-[340px] hover:border-yellow-500/30 transition-colors">
                    {/* Left: Avatar with floating Trophy icon */}
                    <div className="relative shrink-0">
                      <img
                        src={user?.photoURL || "/default-avatar.png"}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className={`w-10 h-10 rounded-full shadow-md shrink-0 transition-all duration-300 ${
                          userData?.isFoundingMember 
                            ? "border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]" 
                            : isProMember
                            ? "border-2 border-violet-400"
                            : "border-2 border-slate-200"
                        }`}
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shadow-md scale-90">
                        {userData?.isFoundingMember ? (
                          <Crown size={10} className="fill-current" />
                        ) : (
                          <Trophy size={10} className="fill-current" />
                        )}
                      </div>
                    </div>

                    {/* Middle: User details and Level progress */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                        {isEditingName ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input
                              id="desktopNameInput"
                              autoFocus
                              defaultValue={newName}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateName((e.target as HTMLInputElement).value);
                                if (e.key === 'Escape') setIsEditingName(false);
                              }}
                              className="bg-slate-900 border border-blue-500/50 rounded-md px-1.5 py-0.5 text-[10px] text-white outline-none w-full shadow-inner focus:border-blue-500 transition-all"
                            />
                            <button
                              onClick={() => {
                                const val = (document.getElementById('desktopNameInput') as HTMLInputElement)?.value;
                                handleUpdateName(val);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 p-0.5"
                            >
                              <CheckCircle2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="truncate cursor-pointer group/name flex-1 min-w-0"
                            onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}
                            title="คลิกเพื่อเปลี่ยนชื่อ"
                          >
                            <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                              {user?.displayName}
                              {userData?.isFoundingMember && (
                                <span className="shrink-0 px-1 py-[1px] rounded-full text-[7px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]" title="PRO Member (Gold)">
                                  PRO
                                </span>
                              )}
                              <Sparkles size={8} className="text-slate-500 group-hover/name:text-yellow-400 transition-colors" />
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full border border-yellow-400/20">
                            LV.{currentLevel}
                          </span>
                          <button onClick={() => setShowLevelInfo(!showLevelInfo)} className="text-slate-400 hover:text-yellow-400 transition-colors shrink-0">
                            <Info size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Level title and email line */}
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest leading-none truncate">
                          {getLevelTitle(currentLevel)}
                        </p>
                        <span className="text-[8px] text-slate-500 truncate max-w-[100px] leading-none">
                          {user?.email}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 relative" style={{ width: `${currentLevelXP}%` }} />
                      </div>
                    </div>

                    {/* Right: Logout Button */}
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={handleLogout}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all group/btn shrink-0"
                      >
                        <LogOut size={12} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Right side: Widgets & Actions */}
                  <div className="flex items-center gap-3">
                    {/* 🐷 Saving Pot Widget (Desktop) */}
                    <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-auto min-w-[180px] hover:border-violet-500/50 transition-colors">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
                        <PiggyBank size={14} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Saving Pot</span>
                        <p className="text-xs font-black text-white mt-0.5 truncate">
                          {potXP} <span className="text-[10px] font-bold text-slate-400">XP</span>
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
                        className="px-2.5 py-1 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95 cursor-pointer"
                      >
                        ออม/ถอน XP
                      </button>
                    </div>

                    {/* 🛍️ Shop Shortcut (Rainbow theme) */}
                    {isShopUnlocked && (
                      <Link href="/shop" className="shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center w-10 h-10 rounded-full p-[1px] cursor-pointer shadow-md bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600"
                          title="Happiness Shop"
                        >
                          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                            <ShoppingBag size={16} />
                          </div>
                        </motion.div>
                      </Link>
                    )}

                    {/* 📷 Player Card Button */}
                    {isPhase3Completed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full p-[1.5px] cursor-pointer shadow-[0_8px_16px_-6px_rgba(56,189,248,0.5)] active:scale-95 shrink-0"
                        style={{ background: "linear-gradient(135deg, #38bdf8, #c084fc, #f472b6, #fb7185, #38bdf8)" }}
                        title="Player Card"
                      >
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-sky-200 hover:text-white transition-colors">
                          <IdCard size={16} />
                        </div>
                      </motion.button>
                    )}
                  </div>


                </div>

                {/* 🎯 2. Hero Section (จัดข้อความซ้าย อวตาร+Badge ขวา) */}
                <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-6 my-auto py-4 relative z-30">

                  {/* ⬅️ ฝั่งซ้าย: ข้อความและปุ่มจัดการ */}
                  <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-1.5 mt-4 sm:mt-0">
                      ยินดีต้อนรับ <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-extrabold">{user?.displayName?.split(' ')[0]} 🚀</span>
                    </h1>
                    <p className="text-slate-300 text-sm xl:text-base font-medium max-w-md mx-auto lg:mx-0 mb-3">
                      เช็กภาพรวมและอัพเดตเป้าหมายชีวิตของคุณ <br /> เพื่อการเติบโตในทุกๆ วัน
                    </p>

                    {/* 📱 Mobile Only: Level & Logout Row (🌟 แสดงเฉพาะบนมือถือ) */}
                    <div className="flex sm:hidden items-center justify-center w-full mt-2 relative z-[999] gap-3">
                      {/* 🎯 Mobile: Combined Profile, Level Progress & Saving Pot Minimal Card */}
                      <div className="flex flex-col gap-4 bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md relative w-full max-w-[280px] hover:border-yellow-500/20 transition-all">
                        
                        {/* Upper Section: Profile & Level Info */}
                        <div className="flex items-center gap-3">
                          {userData?.isFoundingMember ? (
                            <Crown size={16} className="text-yellow-400 shrink-0" />
                          ) : (
                            <Trophy size={16} className="text-yellow-400 shrink-0" />
                          )}
                          
                          <div className="flex-1 min-w-0 text-left">
                            {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                            {isEditingName ? (
                              <div className="flex items-center gap-1">
                                <input
                                  autoFocus
                                  defaultValue={newName}
                                  onBlur={(e) => {
                                    setIsEditingName(false);
                                  }}
                                  className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-full"
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                                />
                              </div>
                            ) : (
                              <div className="cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-black text-white truncate flex items-center gap-1.5">
                                    {user?.displayName}
                                    {userData?.isFoundingMember && (
                                      <span className="shrink-0 px-1 py-[1px] rounded-full text-[7px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]" title="PRO Member (Gold)">
                                        PRO
                                      </span>
                                    )}
                                    <Sparkles size={10} className="text-yellow-400" />
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); setShowLevelInfo(true); }} className="text-slate-400 p-1 hover:text-white transition-colors">
                                      <Info size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="text-slate-400 p-1 hover:text-red-400 transition-colors" title="ออกจากระบบ">
                                      <LogOut size={14} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-0.5">
                                  LV.{currentLevel} {getLevelTitle(currentLevel).split(' (')[0]}
                                </p>
                              </div>
                            )}

                            <div className="w-full h-1 bg-slate-950 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${currentLevelXP}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Lower Section: Saving Pot */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2 min-w-0">
                            <PiggyBank size={16} className="text-violet-400 shrink-0" />
                            <div className="text-left min-w-0">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">Saving Pot</span>
                              <p className="text-xs font-black text-white mt-0.5 truncate">
                                {potXP} <span className="text-[8px] font-bold text-slate-400">XP</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setDepositError("");
                                setWithdrawError("");
                                setDepositAmount("");
                                setWithdrawAmount("");
                                setActivePotTab("deposit");
                                setShowDepositModal(true);
                              }}
                              className="px-3.5 py-1.5 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_8px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95 cursor-pointer"
                            >
                              ออม/ถอน XP
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* 📱 Mobile Only: Action Buttons next to the card */}
                      <div className="flex flex-col gap-2.5">
                        {/* Premium Shop Shortcut (Rainbow theme) */}
                        {isShopUnlocked && (
                          <Link href="/shop">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center w-11 h-11 rounded-2xl p-[1px] cursor-pointer shadow-md"
                              style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #10b981)" }}
                              title="Happiness Shop"
                            >
                              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                                <ShoppingBag size={18} />
                              </div>
                            </motion.div>
                          </Link>
                        )}

                        {isPhase3Completed && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center w-11 h-11 rounded-2xl p-[1.5px] cursor-pointer shadow-[0_8px_20px_-6px_rgba(56,189,248,0.5)] active:scale-95 shrink-0"
                            style={{ background: "linear-gradient(135deg, #38bdf8, #c084fc, #f472b6, #fb7185, #38bdf8)" }}
                            title="Player Card"
                          >
                            <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center text-sky-200 hover:text-white transition-colors">
                              <IdCard size={18} />
                            </div>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* 📟 iPad / Tablet Only: Image 2 Layout */}
                    <div className="hidden sm:flex lg:hidden items-center justify-center gap-4 w-full max-w-[500px] mt-6 relative z-[999]">
                      
                      {/* Main Combined Card */}
                      <div className="flex-1 flex flex-col bg-slate-800/80 p-5 rounded-[2rem] border border-slate-600 backdrop-blur-sm relative hover:border-yellow-500/30 transition-all text-left shadow-xl">
                        
                        {/* Upper Section: Profile & Level */}
                        <div className="flex items-center gap-4">
                          {/* Trophy Icon */}
                          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl text-slate-900 shadow-md shrink-0">
                            {userData?.isFoundingMember ? (
                              <Crown size={20} className="fill-current text-slate-900" />
                            ) : (
                              <Trophy size={20} className="fill-current" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                              {isEditingName ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <input
                                    id="ipadNameInput"
                                    autoFocus
                                    defaultValue={newName}
                                    onBlur={() => setIsEditingName(false)}
                                    className="bg-slate-900 border border-blue-500/50 rounded-md px-1.5 py-0.5 text-[10px] text-white outline-none w-full shadow-inner focus:border-blue-500 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="truncate cursor-pointer group/name flex-1 min-w-0"
                                  onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}
                                  title="คลิกเพื่อเปลี่ยนชื่อ"
                                >
                                  <span className="text-sm font-black text-white truncate flex items-center gap-1.5">
                                    {user?.displayName}
                                    {userData?.isFoundingMember && (
                                      <span className="shrink-0 px-1 py-[1px] rounded-full text-[7px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]" title="PRO Member (Gold)">
                                        PRO
                                      </span>
                                    )}
                                    <Sparkles size={10} className="text-yellow-400" />
                                  </span>
                                </div>
                              )}

                              {/* Info & Logout buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setShowLevelInfo(true)}
                                  className="text-slate-400 p-1 hover:text-white transition-colors"
                                >
                                  <Info size={14} />
                                </button>
                                <button
                                  onClick={handleLogout}
                                  className="text-slate-400 p-1 hover:text-red-400 transition-colors"
                                  title="ออกจากระบบ"
                                >
                                  <LogOut size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Level Title */}
                            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest leading-none mt-1">
                              LV.{currentLevel} {getLevelTitle(currentLevel).split(' (')[0]}
                            </p>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden relative">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${currentLevelXP}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Divider Line */}
                        <div className="w-full h-px bg-white/10 my-4" />

                        {/* Lower Section: Saving Pot */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20 shrink-0">
                              <PiggyBank size={16} />
                            </div>
                            <div className="text-left min-w-0">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">Saving Pot</span>
                              <p className="text-xs font-black text-white mt-0.5 truncate">
                                {potXP} <span className="text-[8px] font-bold text-slate-400">XP</span>
                              </p>
                            </div>
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
                            className="px-3.5 py-1.5 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_8px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95 cursor-pointer"
                          >
                            ออม/ถอน XP
                          </button>
                        </div>
                      </div>

                      {/* Stacked Action Buttons */}
                      <div className="flex flex-col gap-2.5 shrink-0">
                        {/* Premium Shop Shortcut (Rainbow theme) */}
                        {isShopUnlocked && (
                          <Link href="/shop">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center w-11 h-11 rounded-2xl p-[1px] cursor-pointer shadow-md"
                              style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #10b981)" }}
                              title="Happiness Shop"
                            >
                              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                                <ShoppingBag size={18} />
                              </div>
                            </motion.div>
                          </Link>
                        )}

                        {isPhase3Completed && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center w-11 h-11 rounded-2xl p-[1.5px] cursor-pointer shadow-[0_8px_20px_-6px_rgba(56,189,248,0.5)] active:scale-95 shrink-0"
                            style={{ background: "linear-gradient(135deg, #38bdf8, #c084fc, #f472b6, #fb7185, #38bdf8)" }}
                            title="Player Card"
                          >
                            <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center text-sky-200 hover:text-white transition-colors">
                              <IdCard size={18} />
                            </div>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ➡️ ฝั่งขวา: Avatar + Pet + Badge (รวมร่างกันสมบูรณ์!) */}
                  <div className="flex-shrink-0 relative w-full lg:w-auto flex flex-col items-center mt-4 lg:mt-0 lg:ml-8">
                    {/* 🏗️ Container หลัก: เพิ่ม -translate-x-8 (หรือตามใจชอบ) เพื่อดึงทั้งกลุ่มไปทางซ้าย */}
                    <div className="relative -mb-5 flex justify-center items-end scale-110 sm:scale-[1.15] origin-bottom -translate-x-2 sm:-translate-x-10 translate-y-1">

                      {/* 1. รูป Avatar หลัก */}
                      <div className="relative z-10 translate-y-[2px]">
                        <AvatarDisplay currentLevel={currentLevel} gender={gender} streak={streakCount} />
                      </div>

                      {/* 🐾 สัตว์เลี้ยง (หน้า Dashboard) - โชว์ทันที ไม่มี Fade-in */}
                      {lastMoney?.resultKey && (
                        <div className="absolute bottom-0 left-1/2 translate-x-[-15px] sm:translate-x-[-25px] z-20 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none">
                          <img
                            src={PET_DATA[lastMoney.resultKey]?.img || PET_DATA.DEFAULT.img}
                            alt={PET_DATA[lastMoney.resultKey]?.name}
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-contain object-bottom animate-bounce-slow drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                      )}


                    </div>

                    {/* 📚 หนังสือ (Library of Souls) - ถูกนำออกไปแสดงใน Player Card แทน */}

                    {/* ✨ แถบ Badge (พอดี 1 บรรทัดบนมือถือและสมดุล) */}
                    <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 w-full flex-wrap px-2">
                      {/* Perfect Week Badge */}
                      {perfectWeeks > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-amber-400/20">
                          <Trophy size={12} className="text-amber-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wide whitespace-nowrap">
                            Perfect
                          </span>
                        </div>
                      )}

                      {/* DISC Badge */}
                      {lastDisc && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                          <Zap size={12} className="text-blue-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-blue-300 tracking-wide whitespace-nowrap">
                            {DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle}
                          </span>
                        </div>
                      )}

                      {/* Money Badge */}
                      {lastMoney && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                          <Star size={12} className="text-amber-400 fill-current shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wide whitespace-nowrap">
                            {MONEY_DATA[lastMoney.resultKey]?.title}
                          </span>
                        </div>
                      )}

                      {/* Library of Souls Badge */}
                      {lastLibrarySoul && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-emerald-500/20">
                          <BookOpen size={12} className="text-emerald-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-wide whitespace-nowrap">
                            {lastLibrarySoul.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🌟 3. Bottom Bar (เหลือแค่เส้น Progress Track เดี่ยวๆ แล้ว) */}
                <div className="w-full mt-auto pt-4 border-t border-white/5 flex flex-col items-center relative z-20">

                  {/* 🔥 Streak Count Label - ย้ายมาอยู่เหนือเส้นแทร็กเพื่อให้เข้าใจง่ายและสัมพันธ์กับจุดความคืบหน้า */}
                  <div className="flex items-center gap-1 mb-2 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-md shadow-sm transition-all hover:bg-white/10">
                    <Flame size={12} className={`fill-current shrink-0 ${streakCount === 0 ? 'text-white/30' : 'text-orange-500 animate-pulse'}`} />
                    <span className="text-[9px] sm:text-[10px] font-black text-orange-400 uppercase tracking-wide whitespace-nowrap">
                      {streakCount === 0 ? 'เริ่ม Streak วันนี้' : `${streakCount} Days Streak`}
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between w-full max-w-[380px] mb-4 h-8 px-2">
                    {/* 1. เส้นพื้นหลัง (เทาอ่อน) */}
                    <div className="absolute left-2 right-2 h-[1px] bg-white/10 top-1/2 -translate-y-1/2" />

                    {/* 🌟 2. [FIX] กล่องใสรองรับเส้นส้ม (บังคับให้เส้นสุดที่จุดพอดีเป๊ะ ไม่ล้น) */}
                    <div className="absolute left-2 right-2 h-[1px] top-1/2 -translate-y-1/2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${streakCount === 0 ? 0 : ((streakCount % 7 === 0 && streakCount > 0 ? 7 : streakCount % 7) - 1) / 6 * 100}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 origin-left shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                      />
                    </div>

                    {/* 3. จุดวงกลมทั้ง 7 วัน */}
                    {[1, 2, 3, 4, 5, 6, 7].map((dot) => {
                      const currentProgress = streakCount % 7 === 0 && streakCount > 0 ? 7 : streakCount % 7;
                      const isFilled = dot <= currentProgress;
                      const isLastDot = dot === 7;
                      return (
                        <div key={dot} className="relative z-10">
                          <div className={`w-2 h-2 rounded-full transition-all duration-1000 border ${isFilled ? 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)] scale-125' : 'bg-slate-900 border-white/20'}`} />
                          {isLastDot && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center group/reward">
                              <span className={`text-[8px] font-black tracking-tighter transition-colors ${isFilled ? 'text-yellow-400' : 'text-slate-500 hover:text-orange-400'}`}>{isFilled ? 'DONE' : '+100XP'}</span>
                              <div className={`w-[1px] h-2 ${isFilled ? 'bg-yellow-400' : 'bg-slate-800'}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 opacity-60">Complete Daily Quest 7 days for +100 XP Bonus</p>


                </div>

              </div>
            </header>
            <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden group transition-all duration-500 hover:border-slate-700">
              {/* ✨ แสงฟุ้งพื้นหลัง (Premium Glow) */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 blur-[80px] rounded-full pointer-events-none z-0" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-[60px] rounded-full pointer-events-none z-0" />

              {/* เส้นขอบสีด้านบน */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 opacity-80" />

              {/* 🏆 Absolute Badges (Top Right) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex flex-col items-end gap-1.5"
              >
                <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center gap-2 ${rankInfo.bg} ${rankInfo.border} ${rankInfo.color} border-white/10`}>
                  <span className="text-white/40 font-bold tracking-tight">TOTAL</span>
                  <span className="text-white">{totalWeeklyScore} / 28</span>
                </div>
                <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 ${rankInfo.bg} ${rankInfo.border} ${rankInfo.color} border-white/10 whitespace-nowrap`}>
                  <span className="shrink-0">{rankInfo.emoji}</span>
                  <span className="text-white shrink-0">{rankInfo.name}</span>
                </div>
              </motion.div>

              <div className="relative z-10 flex flex-col h-full">
                {/* ค้นหาบรรทัดที่มี Badge improvement (ประมาณบรรทัด 1100+) แล้วแก้เป็นชุดนี้ครับ */}

                <div className="mb-8 pr-28 sm:pr-0">
                  <div className="w-full sm:w-auto">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                      <Zap className="text-yellow-400 fill-current" size={18} />
                      {relativeWeekInfo.label}
                    </h2>
                    <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-[0.1em] mt-1">
                      ช่วงวันที่ {relativeWeekInfo.range}
                    </p>
                  </div>
                </div>

                {/* 2. Core Identity (4 วงกลมหลัก - สื่อถึงความสมดุล) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                  {[
                    { label: "Wheel", val: weeklyData.wheel, color: "text-red-500", icon: <PieChart size={14} /> },
                    { label: "HABIT", val: weeklyData.disc, color: "text-blue-400", icon: <Users size={14} /> },
                    { label: "Money", val: weeklyData.money, color: "text-amber-400", icon: <Wallet size={14} /> },
                    { label: "Challenge", val: weeklyData.challenge, color: "text-purple-400", icon: <Target size={14} /> }
                  ].map((item, i) => {
                    const radius = 20;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (circumference * Math.min(item.val, 7)) / 7;

                    return (
                      <div key={i} className="bg-white/5 rounded-[2rem] p-3 border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
                            <motion.circle
                              cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: offset }}
                              className={item.color}
                              transition={{ duration: 1.5, delay: i * 0.2 }}
                            />
                          </svg>
                          <div className="absolute opacity-40">{item.icon}</div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{item.label}</span>
                        <span className="text-xs font-bold text-slate-200">{item.val}/7</span>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Combined Momentum Section (หลอดพลังงานรวม Weekly Momentum) */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group/momentum">
                    {/* Background Sparkle Effect */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/momentum:opacity-20 transition-opacity">
                      <Flame size={40} className="text-orange-400" />
                    </div>

                    <div className="flex justify-between items-end mb-3 relative z-10">
                      <div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] block mb-1">Weekly Momentum</span>
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400" />
                          พลังขับเคลื่อนชีวิตรวม
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">
                          {totalWeeklyScore}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">/ 28</span>
                      </div>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/50 shadow-inner relative z-10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(totalWeeklyScore / 28) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.8, type: "spring" }}
                        className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] relative"
                      >
                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-white/20 w-full h-[40%] top-0" />
                      </motion.div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium mt-3 leading-relaxed">
                      สะสมความสำเร็จจากการพิชิตภารกิจประจำสัปดาห์ในทุกด้านเพื่อสร้าง Momentum
                    </p>
                  </div>
                </div>

                {/* 4. Motivational Footer (เวอร์ชันรองรับ First Week) */}
                <div className="mt-8 pt-6 border-t border-slate-800/80">
                  <div className="space-y-2">
                    {/* Table Header (Grid 3 Columns) */}
                    <div className="grid grid-cols-[4rem_1fr_2fr] gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-800/50 px-1">
                      <span>คะแนน</span>
                      <span className="text-center sm:text-left">Rank Name</span>
                      <span className="text-right sm:text-left">คำอธิบาย</span>
                    </div>

                    {[
                      { score: "0 - 7", emoji: "🛡️", name: "Survivor", desc: "เน้นประคองตัวให้รอดสัปดาห์นี้" },
                      { score: "8 - 14", emoji: "⚔️", name: "Warrior", desc: "เริ่มบุกและจัดการชีวิตได้ดีขึ้น" },
                      { score: "15 - 22", emoji: "💎", name: "Elite", desc: "ชีวิตสมดุลและมีวินัยสูงมาก" },
                      { score: "23 - 28", emoji: "👑", name: "Legend", desc: "ผู้จารึกตำนานวินัยที่แท้จริง" },
                    ].map((rank, idx) => {
                      const isActive = totalWeeklyScore >= parseInt(rank.score.split(' - ')[0]) && totalWeeklyScore <= parseInt(rank.score.split(' - ')[1]);

                      return (
                        <div
                          key={idx}
                          className={`grid grid-cols-[4rem_1fr_2fr] gap-2 items-center py-1.5 px-1 transition-opacity duration-300 ${isActive ? 'text-white opacity-100' : 'text-slate-500 opacity-40'}`}
                        >
                          <span className="text-[11px] font-black tracking-tight">{rank.score}</span>
                          <span className="text-[11px] font-bold truncate pr-1 text-center sm:text-left">{rank.emoji} {rank.name}</span>
                          <span className="text-[10px] font-medium italic text-right sm:text-left leading-tight break-words">{rank.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- 🎯 Quests Tab Header --- */}
        {activeTab === "quests" && (
          <div className="mt-2 mb-4 relative flex items-center justify-center">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                <span>🎯</span>
                ภารกิจประจำวัน
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* กล่องสะสม */}
            <button
              onClick={openCollectionModal}
              className="absolute right-0 flex items-center justify-center p-1 sm:px-3 sm:py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-all active:scale-95 cursor-pointer z-30 shrink-0"
              title="ประวัติการทำภารกิจที่ผ่านมา"
            >
              <span className="text-xs sm:text-sm leading-none">🗂️</span>
              <span className="hidden sm:inline ml-1.5 text-xs font-semibold">กล่องสะสม</span>
            </button>
          </div>
        )}



        {/* --- 🎮 2. Daily Quests Section --- */}
        {((activeTab === "home" && isRealLifeEntered) || activeTab === "quests") && (
          <div className="mb-8 bg-white border border-slate-100 hover:border-orange-100 rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.08)] relative overflow-hidden group transition-all duration-500">

            {/* ✨ แสงฟุ้งตกแต่งพื้นหลัง */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-orange-400/5 to-yellow-400/5 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tl from-red-400/5 to-orange-400/5 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />

            {/* เส้นขอบสีด้านบน */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500 opacity-90 group-hover:h-3 transition-all duration-300" />

            <div className="flex items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 sm:p-3.5 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <Flame size={26} strokeWidth={2.5} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Daily Quests
                    {userData?.lastQuestEnergyDate === todayDateStr && userData?.questEnergyLevel && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border flex items-center gap-1.5 leading-none ${
                        userData.questEnergyLevel === 'low' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : userData.questEnergyLevel === 'high' 
                            ? 'bg-rose-50 text-rose-600 border-rose-200' 
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}>
                        {userData.questEnergyLevel === 'low' && <Battery size={11} className="stroke-[2.5]" />}
                        {userData.questEnergyLevel === 'medium' && <Zap size={11} className="fill-current stroke-[2.5]" />}
                        {userData.questEnergyLevel === 'high' && <Flame size={11} className="fill-current stroke-[2.5]" />}
                        <span>
                          {userData.questEnergyLevel === 'low' ? 'Low' : userData.questEnergyLevel === 'high' ? 'High' : 'Medium'}
                        </span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <Sparkles size={12} className="text-orange-400" /> ทำเพื่ออัพสกิลสัปดาห์นี้ของคุณ
                  </p>
                </div>
              </div>

              {/* ✨ ปรับ Quest วันนี้ */}
              <div className="flex items-center gap-2 shrink-0">
                {!isProMember ? (
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed select-none opacity-60"
                    title="ฟีเจอร์ปรับแต่ง Quest วันนี้จะปลดล็อกสำหรับสมาชิก Pro"
                  >
                    <Lock size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-tight">ปรับ Quest (PRO)</span>
                  </div>
                ) : (
                  <Link
                    href="/tools/soul-guide?quest=1"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-400 border-slate-100 hover:text-violet-500 hover:border-violet-200 hover:shadow-[0_8px_20px_-5px_rgba(139,92,246,0.15)] hover:scale-105 active:scale-95"
                    title="คุยกับพี่ฟุ้ยเพื่อปรับ quest วันนี้"
                  >
                    <Sparkles size={13} />
                    <span className="text-[10px] font-black uppercase tracking-tight">ปรับ Quest</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 px-4 sm:px-5 py-2 sm:py-3 rounded-[1.5rem] border border-slate-100 shadow-inner group/reward transition-all hover:bg-white hover:border-yellow-200 hover:shadow-md mb-6">
              <div className="p-2 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white rounded-full shadow-sm group-hover/reward:rotate-12 group-hover/reward:scale-110 transition-all duration-300">
                <Trophy size={18} className="sm:w-5 sm:h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Reward Today</span>
                <span className="text-base sm:text-xl font-black text-slate-800">+{dailyXPGained} <span className="text-xs font-bold text-slate-400">XP</span></span>
              </div>
            </div>

            {/* --- 🔋 Inline Energy Level Selector --- */}
            <div className="mb-6 bg-slate-50/70 backdrop-blur-sm p-4 sm:p-5 rounded-[1.8rem] border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-450 flex items-center gap-1.5">
                  <Zap size={11} className="fill-orange-400 stroke-orange-450" />
                  พลังงานของคุณวันนี้
                  {completedQuests.length > 0 && <Lock size={10} className="text-slate-400" />}
                </span>
                <span className="text-xs font-bold text-slate-600 mt-0.5">
                  {completedQuests.length > 0 
                    ? "ล็อกระดับเป้าหมายแล้วสำหรับวันนี้" 
                    : "เลือกสไตล์ภารกิจที่เข้ากับสภาพร่างกายวันนี้"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto sm:items-center">
                {(["low", "medium", "high"] as const).map((level) => {
                  const hasChosenToday = userData?.lastQuestEnergyDate === todayDateStr && userData?.questEnergyLevel;
                  const isActive = (userData?.lastQuestEnergyDate === todayDateStr && userData?.questEnergyLevel === level) || (!userData?.questEnergyLevel && level === "medium");
                  const isLocked = completedQuests.length > 0 || hasChosenToday;
                  
                  const getButtonStyles = () => {
                    if (isActive) {
                      switch (level) {
                        case "low": return "bg-emerald-500/10 text-emerald-600 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                        case "high": return "bg-rose-500/10 text-rose-600 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
                        default: return "bg-orange-500/10 text-orange-600 border-orange-350 shadow-[0_0_15px_rgba(249,115,22,0.2)]";
                      }
                    }
                    return "bg-white/80 text-slate-400 border-slate-200/60 hover:bg-white hover:text-slate-600 hover:border-slate-300 shadow-sm";
                  };

                  const getLabel = () => {
                    switch (level) {
                      case "low": return "Low";
                      case "high": return "High";
                      default: return "Medium";
                    }
                  };

                  return (
                    <button
                      key={level}
                      disabled={isLocked || isSelectingEnergy}
                      onClick={() => handleSelectEnergy(level)}
                      className={`px-3 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-2xl border transition-all duration-300 flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer active:scale-95 w-full sm:w-auto ${getButtonStyles()} ${
                        isLocked ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      title={level === "low" ? "ก้าวเล็กๆ 2 นาที เจาะจงพฤติกรรมบำบัด" : level === "high" ? "เควสท้าทายลึกซึ้ง 15-30 นาที" : "เควสสมดุลปกติ 5-10 นาที"}
                    >
                      {level === "low" && <Battery size={13} className="stroke-[2.5]" />}
                      {level === "medium" && <Zap size={13} className="fill-current stroke-[2.5]" />}
                      {level === "high" && <Flame size={13} className="fill-current stroke-[2.5]" />}
                      <span>{getLabel()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar แบบ Super State (Full at 3, Bonus after) */}
            <div className="mb-10 bg-slate-50/80 backdrop-blur-sm p-5 rounded-3xl border border-slate-100 shadow-inner relative z-10">
              <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${completedQuests.length >= 4 ? 'bg-yellow-400 animate-ping' : completedQuests.length === 3 ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${completedQuests.length >= 4 ? 'text-[#bf953f]' : completedQuests.length === 3 ? 'text-green-600' : 'text-slate-500'}`}>
                    {completedQuests.length >= 4 ? '👑 Legend Upskill State!' : completedQuests.length === 3 ? '🎯 Daily Goal Reached!' : 'Mission Progress'}
                  </span>
                </div>
                {/* --- ส่วนแสดงสถานะเป้าหมาย --- */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full transition-all duration-500 shadow-sm ${completedQuests.length >= 4
                    ? 'bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-white' // Legend Gold
                    : completedQuests.length === 3
                      ? 'bg-green-500 text-white animate-pulse' // Goal Green
                      : 'bg-orange-100 text-orange-600'
                    }`}>
                    {completedQuests.length >= 4 ? 'LEGEND' : completedQuests.length === 3 ? 'GOAL' : `${completedQuests.length} / 3`}
                  </span>
                </div>
              </div>

              <div className="w-full h-5 bg-slate-100/80 rounded-full overflow-hidden p-1 border border-white shadow-inner relative">
                {/* Background Progress Bar (The track) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(Math.min(completedQuests.length, 3) / 3) * 100}%`,
                  }}
                  className={`h-full rounded-full transition-all duration-700 relative shadow-md ${completedQuests.length >= 4
                    ? 'bg-gradient-to-r from-[#8a6d3b] via-[#fcf6ba] to-[#8a6d3b]' // 4: Deep Luxury Gold
                    : completedQuests.length === 3
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' // 3: Goal Reached
                      : 'bg-gradient-to-r from-orange-400 to-red-500' // 0-2: Progressing
                    }`}
                >
                  {/* ✨ Super State Effects (No Sparkles, Just Premium Glow) */}
                  {completedQuests.length >= 4 && (
                    <>
                      <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 mix-blend-overlay bg-yellow-100"
                      />
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-40"
                      />
                    </>
                  )}

                  {/* Luxury Glow for Level 4 */}
                  {completedQuests.length >= 4 && (
                    <div className="absolute inset-0 shadow-[0_0_20px_rgba(191,149,63,0.3)] rounded-full" />
                  )}

                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-white/5 w-full h-[40%] top-0" />
                </motion.div>
              </div>

              <p className="text-[10px] font-bold mt-3 text-center uppercase tracking-widest transition-all duration-500">
                {completedQuests.length < 3 ? (
                  <span className="text-slate-400">ทำอีก <span className="text-orange-500">{3 - completedQuests.length}</span> ข้อเพื่อบรรลุเป้าหมาย</span>
                ) : completedQuests.length >= 4 ? (
                  <span className="text-[#bf953f] font-black tracking-[0.2em] drop-shadow-sm">🏆 The Legendary Upskiller 🏆</span>
                ) : (
                  <span className="text-emerald-500">เป้าหมายสำเร็จ! <span className="text-slate-400">ทำเพิ่มอีกข้อเพื่อเข้าสู่โหมด <span className="text-amber-500">LEGEND</span> 🔥</span></span>
                )}
              </p>
            </div>

            {/* 3. รายการ Quests (ปลดล็อกสีเทาออกแล้ว) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {isSelectingEnergy && (
                <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md rounded-[2.2rem] flex flex-col items-center justify-center gap-4 z-40 transition-all duration-300 border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.25)]">
                  {/* Glowing Sci-Fi Double Ring Spinner */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-orange-500/20 border-b-transparent border-l-transparent animate-spin [animation-duration:1s]" />
                    <div className="absolute w-8 h-8 rounded-full border-2 border-b-yellow-400 border-l-yellow-400/20 border-t-transparent border-r-transparent animate-spin [animation-duration:0.7s] [animation-direction:reverse]" />
                    <Sparkles size={12} className="text-orange-400 animate-pulse" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 text-center px-4">
                    <span className="text-[9px] font-mono font-black text-orange-400 tracking-[0.25em] uppercase animate-pulse">
                      Generating Quests //
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      กำลังวิเคราะห์เป้าหมายและปรับแต่งระดับพลังงาน...
                    </span>
                  </div>
                </div>
              )}


              {dailyQuests.map((quest) => {
                const isDone = completedQuests.includes(quest.id);
                const isNotice = quest.xp === 0; // 🚩 เช็กว่าเป็นประกาศแจ้งเตือนหรือไม่

                const getTypeStyles = (type: string) => {
                  switch (type) {
                    case 'WHEEL': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: <PieChart size={18} /> };
                    case 'DISC': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Users size={18} /> };
                    case 'MONEY': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Wallet size={18} /> };
                    case 'LIBRARY': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <BookOpen size={18} /> };
                    case 'CHALLENGE': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: <Target size={18} /> };
                    default: return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <Sparkles size={18} /> };
                  }
                };
                const styles = getTypeStyles(quest.type);

                const hasDoneWheelToday = completedQuests.includes(1);


                return (
                  <motion.div
                    key={quest.id}
                    // 🚩 ถ้าเป็น Notice ไม่ต้องมี Hover Effect ของเควสปกติ
                    whileHover={(!isDone && !isNotice) ? { y: -3, scale: 1.01 } : {}}
                    className={`group/card relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-[1.8rem] border-2 transition-all duration-300 
        ${isDone ? 'bg-green-50 border-green-200 shadow-sm' :
                        isNotice
                          ? 'bg-amber-50/40 border-amber-100 cursor-default opacity-95' // 🚩 สไตล์สำหรับประกาศ
                          : 'bg-white border-slate-50 hover:border-orange-200 cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:shadow-lg'}
      `}
                    // 🚩 ถ้าเป็น Notice ห้ามรันฟังก์ชัน toggleQuest
                    onClick={() => {
                      if (isNotice) return;
                      toggleQuest(quest.id, quest.xp);
                    }}
                  >
                    <div className="shrink-0 relative">
                      {isDone ? (
                        <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg shadow-green-200">
                          <CheckCircle2 size={24} strokeWidth={3} />
                        </div>
                      ) : isNotice ? (
                        // 🚩 ถ้าเป็นประกาศ โชว์ไอคอนแจ้งเตือนแทนวงกลมติ๊กถูก
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                          <Sparkles size={20} className="fill-current animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white group-hover/card:border-orange-400 transition-colors">
                          <Circle size={18} className="text-slate-100 group-hover/card:text-orange-100" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider 
            ${isDone ? 'bg-green-100 text-green-600' : isNotice ? 'bg-amber-500 text-white shadow-sm' : `${styles.bg} ${styles.text}`}`}>
                          {isNotice ? 'Action Required' : (quest.type === 'DISC' ? 'HABIT' : quest.type)}
                        </span>

                        {quest.title.includes('|') && !isNotice && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-slate-300' : 'text-slate-400'}`}>
                            {quest.title.split('|')[0].trim()}
                          </span>
                        )}

                        {((quest.id === 2 && aiGeneratedDiscTitle && quest.title === aiGeneratedDiscTitle) ||
                          (quest.id === 3 && aiGeneratedMoneyTitle && quest.title === aiGeneratedMoneyTitle) ||
                          (quest.id === 4 && aiGeneratedQuestTitle && quest.title === aiGeneratedQuestTitle)) && (
                          <span className="text-[9px] font-bold text-violet-400">✨ เฉพาะคุณ</span>
                        )}
                      </div>

                      <p className={`text-[13px] sm:text-[15px] font-bold leading-snug
          ${isDone ? 'line-through text-slate-400' : isNotice || quest.title.includes('สรุปผล') ? 'text-amber-900' : 'text-slate-700'}`}>
                        {quest.title.includes('|') ? quest.title.split('|')[1].trim() : quest.title}
                      </p>
                      {quest.id === 1 && lastWheel && !quest.title.includes('สรุปผล') && (
                        <div
                          className="flex items-center gap-1.5 mt-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity w-fit bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50"
                          onClick={(e) => { e.stopPropagation(); setShowWheelRulesModal(true); }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold text-[9px]">i</div>
                          <span className="text-[10px] text-amber-800 font-bold underline decoration-amber-300 decoration-dashed underline-offset-2">กติกาแผน {wheelPlanTarget} วัน & โบนัส XP</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                      {isNotice || quest.title.includes('สรุปผล') ? (
                        <span className="text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 uppercase tracking-widest cursor-pointer">
                          {quest.title.includes('สรุปผล') ? 'Claim Bonus' : (quest.title.includes('พักกายพักใจ') || quest.title.includes('พักผ่อน')) ? 'พักผ่อน 💤' : 'INFO'}
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm transition-all ${isDone ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-orange-100 text-orange-500 group-hover/card:bg-gradient-to-r group-hover/card:from-orange-400 group-hover/card:to-red-500 group-hover/card:text-white group-hover/card:border-transparent group-hover/card:shadow-[0_5px_15px_rgba(249,115,22,0.3)]'}`}>
                            +{quest.xp} XP
                          </span>


                        </div>
                      )}
                    </div>

                  </motion.div>

                );
              })}

              {/* ✨ Special Quest Section (Personalized Mission) */}
              {(
                currentLevel < 5 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group/locked p-4 sm:p-5 rounded-[1.8rem] border-2 border-dashed border-slate-300 bg-slate-50 flex items-center gap-3 sm:gap-5 overflow-hidden grayscale-[20%] opacity-80"
                  >
                    <div className="shrink-0 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-400">
                        <Zap size={20} className="fill-slate-100" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow-sm">
                        <Lock size={10} strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-500 shadow-inner">Personalized</span>
                      </div>
                      <p className="text-[13px] sm:text-[15px] font-bold leading-tight text-slate-400 italic">ภารกิจพิเศษเฉพาะคุณ...</p>
                    </div>
                    <div className="shrink-0 text-right relative z-10">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Required</span>
                        <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-slate-200 text-slate-500 border border-slate-300 shadow-inner">LEVEL 5</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ⚡ ร่างที่ 2: เลเวล 10+ (ปลดล็อกอิสระ) */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!completedQuests.includes('special-01') ? { y: -3, scale: 1.01 } : {}}
                    onClick={() => {
                      if (!customQuestTitle && !completedQuests.includes('special-01')) {
                        setShowCustomInputModal(true);
                      } else {
                        toggleQuest('special-01', 20);
                      }
                    }}
                    className={`group/card relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-[1.8rem] border-2 transition-all duration-300 overflow-hidden
            ${completedQuests.includes('special-01')
                        ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                        : 'bg-white border-amber-100/60 hover:border-amber-400 cursor-pointer shadow-[0_5px_15px_rgba(251,191,36,0.05)] hover:shadow-[0_10px_30px_rgba(251,191,36,0.15)]'}
          `}
                  >
                    <div className="shrink-0 relative z-10">
                      {completedQuests.includes('special-01') ? (
                        <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-200">
                          <CheckCircle2 size={24} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors 
                ${customQuestTitle ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-stone-200 bg-white group-hover/card:border-amber-400'}`}>
                          {customQuestTitle ? <Flame size={18} className="fill-current animate-pulse" /> : <Circle size={18} />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${completedQuests.includes('special-01') ? 'bg-emerald-100 text-emerald-700' : 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border border-amber-200/50'}`}>{customQuestTitle ? 'My Quest' : '✏️ สร้าง Quest เอง'}</span>
                      </div>
                      <p className={`text-[13px] sm:text-[15px] font-bold leading-snug ${completedQuests.includes('special-01') ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {customQuestTitle || "+ กดเพื่อเพิ่ม Quest ของวันนี้"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right relative z-10">
                      <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border shadow-sm transition-all ${completedQuests.includes('special-01') ? 'bg-stone-100 border-stone-200 text-stone-400' : 'bg-white border-amber-200 text-amber-700 group-hover/card:bg-gradient-to-r group-hover/card:from-amber-400 group-hover/card:to-yellow-600 group-hover/card:text-white group-hover/card:border-transparent'}`}>+20 XP</span>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* ✨ กล่องข้อความเตือนทำแบบประเมิน ✨ */}
            {missingAssessments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start sm:items-center gap-3 shadow-sm relative z-10">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5 sm:mt-0"><Sparkles size={16} /></div>
                <p className="text-xs font-medium text-blue-800 leading-relaxed">
                  <span className="font-bold">💡 ทริคอัพสกิล:</span> ภารกิจวันนี้ยังเป็นแบบสุ่มพื้นฐานอยู่ อย่าลืมไปทำแบบประเมิน <span className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-2">({missingAssessments.join(", ")})</span> ด้านล่างให้ครบ เพื่อรับภารกิจที่ตรงกับตัวคุณที่สุดนะครับ!
                </p>
              </motion.div>
            )}
          </div>
        )}



        {/* --- 📦 3. Bento Grid --- */}

        {/* 🎯 Section Header: เครื่องมือเฉพาะสำหรับคุณ */}
        {(activeTab === "identity" || activeTab === "resources") && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 mb-4">
            <div className="relative flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                <span>{activeTab === 'resources' ? '🧠' : '🧬'}</span>
                {activeTab === 'resources' ? 'เครื่องมืออัพสกิล' : 'ตัวตนของคุณ'}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>
          </div>
        )}

        {((activeTab === "home" && shouldShowHomeBento) || activeTab === "identity" || activeTab === "resources") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {(activeTab === "home" || activeTab === "identity") && (
              <>
                {/* 🌟 1. Wheel of Life */}
                <Link href="/tools/wheel-of-life" className="md:col-span-2 group flex flex-col h-full relative">

                  {/* ปุ่ม Info ด้านขวาบน */}
                  {lastWheel && (
                    <button
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const rawText = lastWheel.analysis || "ยังไม่มีข้อมูลประมวลผล";
                        let beforePlan = rawText;
                        let actionPlan = "";
                        let afterPlan = "";

                        const planIndex = rawText.indexOf('📅');
                        const fireIndex = rawText.indexOf('🔥', planIndex);

                        if (planIndex !== -1) {
                          beforePlan = rawText.substring(0, planIndex);
                          actionPlan = fireIndex !== -1 ? rawText.substring(planIndex, fireIndex) : rawText.substring(planIndex);
                          afterPlan = fireIndex !== -1 ? rawText.substring(fireIndex) : "";
                        }

                        const formattedContent = (
                          <div className="w-full">
                            {formatAnalysisText(beforePlan)}
                            {actionPlan && (
                              <div className="relative bg-white p-4 md:p-6 my-5 rounded-2xl border-2 border-dashed border-red-200">
                                {formatAnalysisText(actionPlan)}
                              </div>
                            )}
                            {formatAnalysisText(afterPlan)}
                          </div>
                        );
                        openInfo(e, "ผลวิเคราะห์ด้วย AI 🤖", formattedContent);
                      }}
                      className="absolute top-6 right-6 z-20 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all bg-white shadow-sm border border-slate-100"
                    >
                      <Info size={20} />
                    </button>
                  )}

                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="flex-1 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-red-50 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-red-200 flex flex-col justify-center group"
                  >
                    {!lastWheel && (
                      <motion.div
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: -5 }}
                        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
                      >
                        <Zap size={10} className="fill-white" />
                        +50 XP
                      </motion.div>
                    )}

                    {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/5 to-orange-400/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/5 to-rose-400/5 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-90 group-hover:h-3 transition-all duration-300" />

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10 pt-2 h-full">
                      <div className="flex-1 w-full flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-red-50 text-red-600 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors border border-red-100 shadow-sm group-hover:scale-110 duration-300">
                              <PieChart size={28} className="fill-current/20" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Wheel of Life</h2>
                          </div>
                        </div>

                        {lastWheel ? (
                          <div className="mb-4">
                            {/* 🎯 ส่วนที่ 1: เป้าหมาย 1 ปี (โชว์ตลอดเวลา) */}
                            <p className="text-sm font-medium text-slate-500 mb-2">เป้าหมาย 1 ปีของคุณ</p>
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsGoalExpanded(!isGoalExpanded);
                              }}
                              className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 rounded-xl border border-red-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 mb-4"
                            >
                              <p className={`text-[15px] font-bold text-red-900 leading-normal break-words relative z-10 transition-all duration-300 ${isGoalExpanded ? "" : "line-clamp-2"}`}>
                                🎯 {lastWheel?.goal || "ยังไม่ได้ตั้งเป้าหมาย ไปตั้งเป้าหมายแรกกันเถอะ!"}
                              </p>
                              {lastWheel?.goal?.length > 70 && (
                                <div className="mt-2 text-right">
                                  <span className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                                    {isGoalExpanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม..."}
                                  </span>
                                </div>
                              )}
                            </div>

                             {/* ⚡ ส่วนที่ 2: สถานะรายสัปดาห์ (เปลี่ยนตามสถานะ 7 วัน) */}
                             {wheelPlanDay > wheelPlanTarget ? (
                               !hasDoneWheelToday ? (
                                 wheelPlanTarget === 7 ? (
                                   /* 🎯 CASE 1: ครบ 7 วัน -> โชว์ ปุ่มขยาย 21 วัน + ปุ่ม Audit + ปุ่มลุยแผนเดิม */
                                   <div
                                     className="bg-amber-50/70 border-2 border-amber-200 p-4 rounded-2xl relative overflow-hidden z-20 cursor-default"
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                   >
                                     <p className="text-[13px] font-black text-amber-700 flex items-center gap-2 mb-1.5 relative z-10">
                                       <Trophy size={16} className="text-amber-500" /> สิ้นสุดแผน 7 วัน! 🏆
                                     </p>
                                     <p className="text-[11px] text-amber-700/80 font-bold relative z-10 leading-relaxed mb-4">
                                       คุณรักษาวินัยได้ยอดเยี่ยม! เลือกก้าวต่อไปกันครับ
                                     </p>
 
                                     <button
                                       onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExtendPlanTo21(); }}
                                       className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 mb-2 relative z-20"
                                       disabled={isExtending}
                                     >
                                       {isExtending ? (
                                         <>
                                           <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                           กำลังวิเคราะห์แผนต่อเนื่อง...
                                         </>
                                       ) : (
                                         <>
                                           <Sparkles size={14} className="animate-pulse" />
                                           ขยายเป้าหมายเป็น 21 วัน
                                         </>
                                       )}
                                     </button>
 
                                     <div className="grid grid-cols-2 gap-2 relative z-20">
                                       <button
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/tools/wheel-of-life"); }}
                                         className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-amber-200 hover:border-red-400 hover:bg-red-50/50 transition-all group/audit active:scale-95 shadow-sm"
                                       >
                                         <PieChart size={16} className="text-red-500 mb-0.5 group-hover/audit:scale-110" />
                                         <span className="text-[9px] font-black uppercase text-slate-700">เริ่ม Audit</span>
                                       </button>
 
                                       <button
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestartCycle(); }}
                                         className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-amber-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group/loop active:scale-95 shadow-sm"
                                       >
                                         <RotateCcw size={16} className="text-blue-500 mb-0.5 group-hover/loop:-rotate-45" />
                                         <span className="text-[9px] font-black uppercase text-slate-700">ลุยแผนเดิม</span>
                                       </button>
                                     </div>
                                   </div>
                                 ) : (
                                   /* 🎯 CASE 2: ครบ 21 วัน -> โชว์ ปุ่ม Audit + ลุยต่อรอบเดิม */
                                   <div
                                     className="bg-amber-50/70 border-2 border-amber-200 p-4 rounded-2xl relative overflow-hidden z-20 cursor-default"
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                   >
                                     <p className="text-[13px] font-black text-amber-700 flex items-center gap-2 mb-1.5 relative z-10">
                                       <Trophy size={16} className="text-amber-500" /> สำเร็จเป้าหมาย 21 วัน! 🏆
                                     </p>
                                     <p className="text-[11px] text-amber-700/80 font-bold relative z-10 leading-relaxed mb-4">
                                       สุดยอดผู้ชนะระดับ Extraordinary! แนะนำให้เริ่ม Audit เพื่อสแกนคะแนนชีวิตและรับเป้าหมายรอบใหม่กันครับ
                                     </p>
 
                                     <div className="grid grid-cols-2 gap-2 relative z-20">
                                       <button
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/tools/wheel-of-life"); }}
                                         className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl active:scale-95 hover:shadow-md transition-all font-black text-[9px] shadow-sm border border-transparent"
                                       >
                                         <PieChart size={18} className="mb-1" />
                                         เริ่ม AUDIT ใหม่
                                       </button>
 
                                       <button
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestartCycle(); }}
                                         className="flex flex-col items-center justify-center p-3 bg-white text-slate-700 rounded-xl border border-slate-200 hover:border-slate-300 active:scale-95 transition-all font-black text-[9px] shadow-sm"
                                       >
                                         <RotateCcw size={18} className="text-slate-500 mb-1" />
                                         ลุยต่อรอบเดิม
                                       </button>
                                     </div>
                                   </div>
                                 )
                               ) : (
                                 /* 🎯 CASE 3: ครบตามเป้าหมาย และวันนี้ทำเสร็จแล้ว -> ป้ายพักผ่อน */
                                 <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl relative overflow-hidden">
                                   <p className="text-[13px] font-black text-slate-700 flex items-center gap-2 mb-1 relative z-10">
                                     <CheckCircle2 size={16} className="text-green-500" /> สำเร็จเป้าหมายรอบนี้!
                                   </p>
                                   <p className="text-[11px] text-slate-500 font-bold relative z-10">
                                     พักผ่อนให้เต็มที่ พรุ่งนี้ค่อยมาเลือกเส้นทางใหม่กันนะ
                                   </p>
                                 </div>
                               )
                             ) : (
                               /* 🎯 CASE 4: ยังไม่ครบเป้าหมาย -> (โชว์เคล็ดลับหรือแถบความคืบหน้า) */
                               <div className="px-1">
                                 <p className="text-[11px] text-slate-400 font-bold italic">
                                   💡 เคล็ดลับ: ทำภารกิจรายวันให้ครบเพื่อสะสมรางวัลระดับ {wheelPlanTarget === 7 ? "PERFECT" : "EXTRAORDINARY"} ครับ
                                 </p>
                               </div>
                             )}
                          </div>
                        ) : (
                          <div className="mb-6">
                            <p className="text-slate-500 font-medium">ตั้งเป้าหมายและเช็กสมดุลชีวิตของคุณใน 8 ด้าน</p>
                          </div>
                        )}

                        {/* 🔘 ปุ่ม Action หลัก (จะซ่อนตัวอัตโนมัติถ้ามีแผง 3 ปุ่มโชว์อยู่) */}
                        {!(lastWheel && wheelPlanDay > wheelPlanTarget && !hasDoneWheelToday) && (
                          <div className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-full border text-[13px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm w-fit 
                      ${!lastWheel
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 border-transparent text-white shadow-[0_8px_20px_-5px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.03]'
                              : wheelPlanDay > wheelPlanTarget
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-transparent text-white shadow-[0_8px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(16,185,129,0.5)] hover:scale-[1.03]'
                                : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200'
                            }`}>

                            {!lastWheel ? (
                              <Sparkles size={14} />
                            ) : wheelPlanDay > wheelPlanTarget ? (
                              <CheckCircle2 size={14} className="fill-white" />
                            ) : (
                              <RefreshCw size={14} />
                            )}

                            <span>
                              {!lastWheel
                                ? "เริ่มประเมินครั้งแรก (+50 XP)"
                                : wheelPlanDay > wheelPlanTarget
                                  ? "พรุ่งนี้มาลุยต่อกัน"
                                  : "ประเมินใหม่"
                              }
                            </span>
                          </div>
                        )}

                      </div>

                      <div className="w-full md:w-1/2 flex justify-center items-center rounded-[3rem] p-2 aspect-square md:aspect-auto">
                        {lastWheel?.currentScores ? renderRadarChart(lastWheel.currentScores, lastWheel.targetScores) : (
                          <div className="text-center p-8"><PieChart size={48} className="mx-auto text-slate-200 mb-3" /><p className="text-sm font-bold text-slate-400">ยังไม่มีข้อมูลกราฟ</p></div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                </Link>


                {/* 🌟 2. คมสัดสัด */}


                <Link
                  href="/tools/khomsatsat"
                  onClick={(e) => {
                    if (!isKhomsatsatUnlocked) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="group flex flex-col h-full relative"
                >
                  {/* ปุ่ม Info */}
                  {lastQuote && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuoteInfo(e); }}
                      className="absolute top-8 right-8 z-20 p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100">
                      <Info size={18} />
                    </button>
                  )}

                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    className={`flex-1 rounded-[2.5rem] shadow-sm relative overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-xl hover:border-indigo-200
                      ${!hasClaimedQuoteToday && isKhomsatsatUnlocked
                        ? 'border-2 border-indigo-400 bg-gradient-to-b from-white to-indigo-50/20 shadow-[0_8px_30px_rgba(99,102,241,0.08)] animate-[pulse_4s_infinite]'
                        : 'bg-white border border-indigo-50'
                      }`}
                  >
                    {/* ✨ แสงฟุ้ง (Glowing Blobs) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />

                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-90 group-hover:h-3 transition-all duration-300" />

                    <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            <Quote size={24} className="fill-current/20" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-0.5">Khomsatsat</span>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-black text-slate-800 leading-none">คมสัดสัด</h2>
                              {!hasClaimedQuoteToday && isKhomsatsatUnlocked && (
                                <span className="flex h-2.5 w-2.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center relative my-6">
                        <Quote className="absolute -top-4 -left-2 text-indigo-100/50 rotate-180 transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2" size={60} />
                        <Quote className="absolute -bottom-6 -right-2 text-purple-100/50 transition-transform group-hover:translate-y-2 group-hover:translate-x-2" size={60} />
                        <p className={`${getQuoteFontSize(quoteText)} font-black italic relative z-10 text-center px-4 transition-all duration-300 break-words`}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-700 to-purple-700 drop-shadow-sm px-2 py-1 leading-normal inline-block">
                            "{quoteText}"
                          </span>
                        </p>
                      </div>

                      <div className="mt-auto flex justify-center">
                        <div className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm w-full
                    ${hasClaimedQuoteToday
                            ? 'bg-slate-50 text-slate-500 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-[0_8px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(79,70,229,0.5)] hover:scale-[1.03]'
                          }`}>
                          <Sparkles size={16} className={hasClaimedQuoteToday ? "" : "animate-pulse"} />
                          <span>{hasClaimedQuoteToday ? "สุ่มคำคมใหม่" : "สุ่มคำคมวันนี้ (+10 XP วันละครั้ง)"}</span>
                        </div>
                      </div>
                    </div>
                    {!isKhomsatsatUnlocked && renderLockedBentoOverlay("คมสัดสัด Locked", "ทำ Phase 1 ให้ครบก่อน เพื่อเริ่มสร้างคำคมจากความรู้สึกของคุณ")}
                  </motion.div>
                </Link>

                {/* 🌟 3. DISC - ปรับโครงสร้างให้เท่ากับ Money Avatar */}
                <Link href="/tools/disc" className="group flex flex-col h-full relative">
                  {/* ปุ่ม Info */}
                  {lastDisc && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDiscInfo(e); }}
                      className="absolute top-8 right-8 z-20 p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100">
                      <Info size={18} />
                    </button>
                  )}

                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-blue-200 relative overflow-hidden group"
                  >
                    {/* XP Badge */}
                    {!lastDisc && (
                      <motion.div
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: -5 }}
                        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
                      >
                        <Zap size={10} className="fill-white" /> +50 XP
                      </motion.div>
                    )}

                    {/* Ambient Glow */}
                    <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none opacity-10 transition-colors duration-700 z-0 ${discMainChar === 'D' ? 'bg-red-400' :
                      discMainChar === 'I' ? 'bg-orange-400' :
                        discMainChar === 'S' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-300 via-blue-600 to-blue-300 opacity-80 z-0" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">
                      {lastDisc ? (
                        <>
                          {/* ห่อเนื้อหาด้านบน */}
                          <div className="flex flex-col items-center mb-8">
                            {/* 🛡️ Logo Container (ย้ายขึ้นมาเหมือน Money) */}
                            <div className="relative mb-6 mt-2">
                              <div className={`absolute inset-0 blur-3xl opacity-30 ${discColors.light}`} />
                              <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                                {DISC_DATA[discMainChar]?.emoji || "🎭"}
                              </div>
                            </div>

                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> DISC STYLE </h3>

                            <h2 className={`text-3xl font-black mb-3 leading-tight tracking-tight ${DISC_DATA[discMainChar]?.titleColor || 'text-slate-900'} group-hover:text-blue-600 transition-colors`}>
                              {DISC_DATA[discMainChar]?.rpgTitle || "จอมวางแผน"}
                            </h2>

                            {/* Badge ชื่อเต็ม (ปรับสไตล์ให้เหมือน Match % ของ Money) */}
                            <div className={`inline-flex items-center text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border shadow-sm ${discColors.light} ${discColors.text} ${discColors.border}/50`}>
                              {discMainChar === 'D' ? 'Dominance' :
                                discMainChar === 'I' ? 'Influence' :
                                  discMainChar === 'S' ? 'Steadiness' : 'Conscientiousness'}
                            </div>

                            {/* Description (สไตล์เดียวกับ Motto ของ Money) */}
                            <p className="text-[14px] font-medium text-slate-600 mb-8 px-2 leading-loose opacity-100 w-full italic">
                              {DISC_DATA[discMainChar]?.desc || "คุณคือส่วนผสมที่ลงตัวของการทำงานและการสื่อสาร"}
                            </p>

                            {/* 📊 Progress Bar (ย้ายมาไว้ข้างล่างคำอธิบาย) */}
                            <div className="w-full max-w-[240px] space-y-3 mb-8">
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-50">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.D || 0}%` }} className="h-full bg-red-500" />
                                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.I || 0}%` }} className="h-full bg-orange-500" />
                                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.S || 0}%` }} className="h-full bg-emerald-500" />
                                <motion.div initial={{ width: 0 }} animate={{ width: `${lastDisc.percentages?.C || 0}%` }} className="h-full bg-blue-500" />
                              </div>
                              <div className="flex justify-between items-center px-1 text-[10px] font-black text-slate-400">
                                <span>D {lastDisc.percentages?.D || 0}%</span>
                                <span>I {lastDisc.percentages?.I || 0}%</span>
                                <span>S {lastDisc.percentages?.S || 0}%</span>
                                <span>C {lastDisc.percentages?.C || 0}%</span>
                              </div>
                            </div>
                          </div>

                          {/* 🔘 ปุ่มประเมินใหม่ (ใช้ mt-auto เพื่อให้ระนาบตรงกับ Money) */}
                          <div className="w-full px-4 mt-auto">
                            <div className="group/btn-start relative">
                              <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(56,189,248,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-blue-300 active:scale-95">
                                <RefreshCw size={16} className="text-white/80" />
                                <span>ประเมินใหม่</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* 🎁 Empty State (ปรับโครงสร้าง justify-between ให้เหมือน Money) */
                        <div className="flex flex-col items-center justify-between h-full w-full py-2">
                          <div className="flex flex-col items-center justify-center pt-8 mb-8">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-20" />
                              <div className="relative w-24 h-24 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Users size={36} />
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">วัดความตึง DISC</h3>
                            <p className="text-slate-400 text-sm font-medium">ค้นหาตัวตนและการสื่อสาร</p>
                          </div>

                          <div className="w-full px-4 mt-auto">
                            <div className="group/btn-start relative">
                              <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(56,189,248,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-blue-300 active:scale-95">
                                <Sparkles size={16} className="text-white/80" />
                                <span>เริ่มประเมินครั้งแรก <span className="opacity-90">(+50 XP)</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>

                <div className="group flex flex-col h-full relative">
                  {lastMoney && (
                    <div className="absolute top-8 right-8 z-20 flex items-center bg-white/90 backdrop-blur-md border border-slate-100 rounded-full p-1 shadow-sm">
                      {hasHabitMasterTools && (
                        <>
                          {/* ปุ่มสลับโหมด: คลังออมมีสติ vs โปรไฟล์ */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMoneyVault(!showMoneyVault); }}
                            className={`p-2 rounded-full transition-all ${showMoneyVault ? 'text-amber-500 bg-amber-50 shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title={showMoneyVault ? "ดูตัวตนการเงิน" : "เปิดคลังออมมีสติ"}
                          >
                            {showMoneyVault ? <Users size={16} /> : <Wallet size={16} />}
                          </button>
                          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                        </>
                      )}
                      {/* ปุ่ม Info */}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openMoneyInfo(e); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                        title="ดูคำอธิบาย"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  )}
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-amber-100 relative overflow-hidden"
                  >
                    {/* 🏷️ Floating XP Badge (ตำแหน่ง Top 8 Right 8 เท่ากันเป๊ะ) */}
                    {!lastMoney && (
                      <motion.div
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: -5 }}
                        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
                      >
                        <Zap size={10} className="fill-white" /> +50 XP
                      </motion.div>
                    )}

                    {/* ✨ Ambient Light & Gold Top Bar */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-400/5 to-orange-400/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-amber-400/10 transition-colors duration-700 z-0" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 opacity-80 z-0" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">
                      {lastMoney ? (
                        <>
                          {showMoneyVault ? (
                            /* 🔮 คลังออมมีสติ (ดีไซน์ระดับเดียวกันกับโปรไฟล์หลัก) */
                            <div className="flex flex-col items-center w-full h-full">
                              <div className="flex flex-col items-center mb-8 w-full">
                                {/* 🛡️ ตู้นิรภัยสะกดกิเลส ดีไซน์วงกลมไซส์เดียวกับด้านหน้าเป๊ะ (พื้นขาว + กระเป๋าตังค์) */}
                                <div className="relative mb-6 mt-2">
                                  <div className="absolute inset-0 bg-amber-100 blur-3xl opacity-20" />
                                  <div className="relative w-24 h-24 rounded-full bg-white border border-slate-50 flex items-center justify-center shadow-[0_12px_40px_rgb(0,0,0,0.06)] overflow-hidden transition-transform duration-500 hover:scale-105">
                                    {/* Glass reflection beam */}
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                                    {/* Wallet Icon */}
                                    <Wallet size={38} className="text-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]" />
                                  </div>
                                </div>

                                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> MINDFUL SAVINGS </h3>

                                {/* ชื่อหลักขนาดเดียวกับโปรไฟล์ */}
                                <h2 className="text-3xl font-black mb-2.5 leading-tight tracking-tight text-amber-500">
                                  คลังออมมีสติ
                                </h2>

                                {/* 💳 แท็บแสดงยอดออมสะสมแบบกระจก (Glass Balance Card) */}
                                <div className="w-full max-w-[260px] bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100/60 p-3 mb-5 shadow-sm flex items-center justify-between px-5 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-300/10 to-orange-300/10 blur-xl pointer-events-none" />
                                  <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">ยอดออมสัปดาห์นี้</span>
                                    <span className="text-xl font-black text-slate-900 tracking-tight">
                                      ฿{(userData?.weeklySavings || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                                      ออมปังมาก
                                    </span>
                                  </div>
                                </div>

                                {/* ✍️ ส่วนกรอกข้อมูลดีไซน์พรีเมียม (Side-by-side) */}
                                <div className="w-full px-2 mb-4">
                                  <div className="flex gap-2">
                                    {/* สิ่งที่ยั้งใจ */}
                                    <div className="flex-1 relative">
                                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                                        <ShoppingBag size={14} className="opacity-60" />
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="ยั้งใจไม่ซื้อ..."
                                        value={vaultItem}
                                        onChange={(e) => setVaultItem(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200/85 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white transition-all font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder:text-slate-400 placeholder:font-medium"
                                      />
                                    </div>

                                    {/* ราคา */}
                                    <div className="w-[110px] relative">
                                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500 font-black text-xs">
                                        ฿
                                      </div>
                                      <input
                                        type="number"
                                        placeholder="ราคา..."
                                        value={vaultPrice}
                                        onChange={(e) => setVaultPrice(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200/85 rounded-2xl pl-8 pr-4 py-3 text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white transition-all font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder:text-slate-400 placeholder:font-medium"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* 🏆 ประวัติชัยชนะล่าสุด */}
                                <div className="w-full px-2 mb-2">
                                  <div className="py-3 px-4 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-between text-[11px] min-h-[46px] shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                        <Sparkles size={10} className="fill-amber-500/20" />
                                      </div>
                                      <span className="text-slate-400 font-bold">ชัยชนะล่าสุด:</span>
                                    </div>
                                    
                                    {userData?.savingsLog && userData.savingsLog.length > 0 ? (
                                      <div className="flex items-center gap-2 max-w-[260px]">
                                        <span className="text-slate-700 font-black truncate max-w-[140px]" title={userData.savingsLog[userData.savingsLog.length - 1].item}>
                                          {userData.savingsLog[userData.savingsLog.length - 1].item}
                                        </span>
                                        <span className="text-amber-600 font-black bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-full text-[10px] shrink-0">
                                          ฿{userData.savingsLog[userData.savingsLog.length - 1].price.toLocaleString()}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic font-medium">เริ่มต้นออมมีสติวันนี้!</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 🔘 ปุ่มล่างสุดขนาดเดียวกับประเมินใหม่ ทำหน้าที่เป็นปุ่มสยบกิเลสหลัก */}
                              <div className="w-full px-4 mt-auto">
                                <button
                                  onClick={handleResistTemptation}
                                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] hover:scale-[1.02] hover:shadow-amber-300 active:scale-95 cursor-pointer"
                                >
                                  <Zap size={16} className="text-white/80 shrink-0" />
                                  <span>{hasSavedToday ? "บันทึกออมมีสติ" : "บันทึกออมมีสติ (+5 XP)"}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 👤 โปรไฟล์แสดงตนปกติ */
                            <div className="flex flex-col items-center w-full h-full">
                              <div className="flex flex-col items-center mb-8">
                                <div className="relative mb-6 mt-2">
                                  <div className="absolute inset-0 bg-amber-100 blur-3xl opacity-20" />
                                  <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                                    {avatarImages[lastMoney.resultKey] ? (
                                      <img
                                        src={avatarImages[lastMoney.resultKey]}
                                        alt="Avatar"
                                        className="w-[85%] h-[85%] object-contain"
                                      />
                                    ) : (
                                      <span className="text-5xl">
                                        {MONEY_DATA[lastMoney.resultKey]?.emoji || "💰"}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> MONEY AVATAR </h3>

                                {/* ชื่อหลัก */}
                                <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                                  {MONEY_DATA[lastMoney.resultKey]?.title || "นักวางแผน"}
                                </h2>

                                {/* ✨ เพิ่ม Subtitle (Codename) ตรงนี้ครับ */}
                                <p className="text-[11px] font-black text-amber-500/80 uppercase tracking-[0.2em] mb-4">
                                  {MONEY_DATA[lastMoney.resultKey]?.subtitle || "The Explorer"}
                                </p>

                                <div className="inline-flex items-center bg-amber-50 text-amber-700 text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border border-amber-100/50 shadow-sm">
                                  Match {lastMoney.primaryMatch || 100}%
                                </div>

                                <p className="text-[14px] font-medium text-slate-600 mb-8 px-2 leading-loose opacity-100 w-full italic">
                                  "{MONEY_DATA[lastMoney.resultKey]?.motto}"
                                </p>

                                {/* 🎭 Secondary Persona */}
                                {lastMoney.secondaryKey && MONEY_DATA[lastMoney.secondaryKey] && (
                                  <div className="mb-6 py-2.5 px-5 rounded-2xl bg-slate-50/50 border border-slate-100/80 flex items-center gap-3 relative group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                                    <span className="text-xl shrink-0">{MONEY_DATA[lastMoney.secondaryKey].emoji}</span>
                                    <div className="flex flex-col items-start leading-none gap-1">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ตัวตนรอง</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-bold text-slate-700">
                                          {MONEY_DATA[lastMoney.secondaryKey].title}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 italic">
                                          {lastMoney.secondaryMatch}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 🔘 ปุ่มประเมินใหม่ */}
                              <div className="w-full px-4 mt-auto">
                                <Link href="/tools/money-avatar" className="w-full block">
                                  <div className="group/btn-start relative">
                                    <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-amber-300 active:scale-95">
                                      <RefreshCw size={16} className="text-white/80" />
                                      <span>ประเมินใหม่</span>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* 🎨 Empty State */
                        <div className="flex flex-col items-center justify-between h-full w-full py-2">
                          <div className="flex flex-col items-center justify-center pt-8 mb-8">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-20" />
                              <div className="relative w-24 h-24 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Wallet size={36} />
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Money Avatar</h3>
                            <p className="text-slate-400 text-sm font-medium">ถอดรหัสสไตล์การเงินของคุณ</p>
                          </div>

                          <div className="w-full px-4 mt-auto">
                            <Link href="/tools/money-avatar" className="w-full block">
                              <div className="group/btn-start relative">
                                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-amber-300 active:scale-95">
                                  <Sparkles size={16} className="text-white/80" />
                                  <span>
                                    เริ่มประเมินครั้งแรก <span className="opacity-90">(+50 XP)</span>
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* 🌟 4. Library of Souls - Personality Assessment */}
                <div className="group flex flex-col h-full relative">
                  {lastLibrarySoul && (
                    <div className="absolute top-8 right-8 z-20 flex items-center bg-white/90 backdrop-blur-md border border-slate-100 rounded-full p-1 shadow-sm">
                      {hasHabitMasterTools && (
                        <>
                          {/* ปุ่มสลับโหมด: คลังหนังสือ vs โปรไฟล์ */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBookCollection(!showBookCollection); }}
                            className={`p-2 rounded-full transition-all ${showBookCollection ? 'text-emerald-600 bg-emerald-50 shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title={showBookCollection ? "ดูตัวตนคนอ่าน" : "เปิดคลังหนังสือสะสม"}
                          >
                            {showBookCollection ? <Users size={16} /> : <Bookmark size={16} />}
                          </button>
                          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                        </>
                      )}
                      {/* ปุ่ม Info */}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLibrarySoulInfo(e); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                        title="ดูคำอธิบาย"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  )}
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-emerald-200 relative overflow-hidden group"
                  >
                    {!lastLibrarySoul && (
                      <motion.div
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: -5 }}
                        className="absolute top-8 right-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-100 flex items-center gap-1 z-30"
                      >
                        <Zap size={10} className="fill-white" /> +50 XP
                      </motion.div>
                    )}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-emerald-400/10 transition-colors duration-700 z-0" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-300 via-teal-500 to-emerald-300 opacity-80 transition-all duration-500 group-hover:h-2 z-0" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">
                      {lastLibrarySoul ? (
                        <>
                           {showBookCollection ? (
                            /* 📚 คลังหนังสือสะสม (ดีไซน์ระดับเกรดเดียวกับหมวดอื่นๆ) */
                            <div className="flex flex-col items-center w-full h-full">
                              <div className="flex flex-col items-center mb-4 w-full">
                                {/* 1. รูปหัวใจหรือชั้นหนังสือกลมพรีเมียม (พื้นขาว + Bookmark) */}
                                <div className="relative mb-4 mt-2">
                                  <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-20" />
                                  <div className="relative w-24 h-24 rounded-full bg-white border border-slate-50 flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-transform duration-500 hover:scale-105">
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                                    <Bookmark size={38} className="text-emerald-500 drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)]" />
                                  </div>
                                </div>

                                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2"> BOOK SHELF </h3>

                                <h2 className="text-3xl font-black mb-1.5 leading-tight tracking-tight text-emerald-600">
                                  คลังหนังสือสะสม
                                </h2>

                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
                                  สะสมทั้งหมด: {playlistBooks.length} เล่ม
                                </p>

                                {/* 📑 Tabs: เล่มที่สนใจ vs อ่านจบแล้ว */}
                                <div className="flex bg-slate-100 p-0.5 rounded-xl w-[90%] text-[10px] font-black uppercase tracking-wider">
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveBookTab("interested"); }}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                                      activeBookTab === "interested"
                                        ? "bg-white text-emerald-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`}
                                  >
                                    เล่มที่สนใจ ({playlistBooks.filter(b => (b.status || "interested") === "interested").length})
                                  </button>
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveBookTab("completed"); }}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                                      activeBookTab === "completed"
                                        ? "bg-white text-emerald-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`}
                                  >
                                    อ่านจบแล้ว ({playlistBooks.filter(b => b.status === "completed").length})
                                  </button>
                                </div>
                              </div>

                              {/* 📝 ฟอร์มกรอกหนังสือเพิ่มเอง (ใช้ร่วมกันทั้ง 2 แท็บ) */}
                              <div className="w-full px-2 mb-3.5">
                                <form 
                                  onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleAddBookManually(activeBookTab); }}
                                  className="flex gap-1.5 items-center bg-slate-50 border border-slate-200/60 p-1.5 rounded-2xl w-full"
                                >
                                  <input
                                    type="text"
                                    placeholder={activeBookTab === "interested" ? "ชื่อหนังสือที่สนใจ..." : "ชื่อหนังสืออ่านจบ..."}
                                    value={manualBookTitle}
                                    onChange={(e) => setManualBookTitle(e.target.value)}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    className="flex-1 bg-transparent px-2.5 py-1 text-[11px] font-bold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal min-w-0"
                                  />
                                  <input
                                    type="text"
                                    placeholder="ผู้แต่ง..."
                                    value={manualBookAuthor}
                                    onChange={(e) => setManualBookAuthor(e.target.value)}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    className="w-16 bg-transparent border-l border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal shrink-0"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
                                  >
                                    {activeBookTab === "interested" ? "+ สนใจ" : "+ อ่านจบ"}
                                  </button>
                                </form>
                              </div>

                              {/* 📖 รายการหนังสือแยกตามแท็บ */}
                              <div className="w-full px-2 flex-1 overflow-y-auto max-h-[175px] space-y-2 mb-6 scrollbar-thin">
                                {activeBookTab === "interested" ? (
                                  playlistBooks.filter(b => (b.status || "interested") === "interested").length > 0 ? (
                                    playlistBooks.filter(b => (b.status || "interested") === "interested").map((book, idx) => {
                                      const slug = getArticleSlug(book.title);
                                      return (
                                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-between gap-3 shadow-sm hover:bg-slate-100/40 transition-colors">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-100/30 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs">
                                              {idx + 1}
                                            </div>
                                            <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
                                              <span className="text-[12px] font-black text-slate-700 line-clamp-2 text-left pr-1" title={book.title}>
                                                {book.title}
                                              </span>
                                              <span className="text-[9px] font-bold text-slate-400 truncate text-left w-full mt-0.5" title={book.author}>
                                                {book.author}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            {slug && (
                                              <Link href={`/library/${slug}`} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors text-[10px] font-black uppercase tracking-wider shrink-0">
                                                อ่านสรุป
                                              </Link>
                                            )}
                                            <button
                                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsCompleted(book); }}
                                              className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shrink-0"
                                              title="ทำเครื่องหมายว่าอ่านจบแล้ว"
                                            >
                                              <CheckCircle2 size={14} className="text-emerald-500" />
                                            </button>
                                            <button
                                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveBook(book as any); }}
                                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                              title="ลบออกจากคลัง"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="py-8 flex flex-col items-center justify-center text-center">
                                      <BookOpen size={24} className="text-slate-300 mb-2" />
                                      <span className="text-[11px] text-slate-400 font-bold">ยังไม่มีหนังสือที่สนใจ</span>
                                      <span className="text-[9px] text-slate-400/70 font-medium mt-0.5">กดบันทึกที่หัวใจของหนังสือแนะนำเพื่อบันทึก</span>
                                    </div>
                                  )
                                ) : (
                                  playlistBooks.filter(b => b.status === "completed").length > 0 ? (
                                    playlistBooks.filter(b => b.status === "completed").map((book, idx) => {
                                      return (
                                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-between gap-3 shadow-sm hover:bg-slate-100/40 transition-colors">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-100/30 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs">
                                              {idx + 1}
                                            </div>
                                            <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
                                              <span className="text-[12px] font-black text-slate-700 line-clamp-2 text-left pr-1" title={book.title}>
                                                {book.title}
                                              </span>
                                              <span className="text-[9px] font-bold text-slate-400 truncate text-left w-full mt-0.5" title={book.author}>
                                                {book.author}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black border border-emerald-100/20 whitespace-nowrap shrink-0">
                                              อ่านจบแล้ว
                                            </span>
                                            <button
                                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveBook(book as any); }}
                                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                              title="ลบออกจากคลัง"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="py-8 flex flex-col items-center justify-center text-center">
                                      <CheckCircle2 size={24} className="text-slate-300 mb-2" />
                                      <span className="text-[11px] text-slate-400 font-bold">ยังไม่มีหนังสือที่อ่านจบ</span>
                                      <span className="text-[9px] text-slate-400/70 font-medium mt-0.5">กดปุ่มอ่านจบในแท็บเล่มที่สนใจ หรือกรอกเพิ่มด้านบน</span>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* 🔘 ปุ่มล่างสุดขนาดเดียวกับประเมินใหม่ ทำหน้าที่ปิดหรือกลับหน้าแรก */}
                              <div className="w-full px-4 mt-auto">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBookCollection(false); }}
                                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-600 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-emerald-200"
                                >
                                  <span>กลับไปหน้าตัวตน</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 👤 โปรไฟล์จิตวิญญาณคนอ่านปกติ */
                            <div className="flex flex-col items-center w-full h-full">
                              <div className="flex flex-col items-center mb-8">
                                <div className="relative mb-6 mt-2">
                                  <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-20" />
                                  <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-50 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 overflow-hidden">
                                    <img
                                      src={`/books/${lastLibrarySoul.type}.png`}
                                      alt={lastLibrarySoul.type}
                                      className="w-[80%] h-[80%] object-contain drop-shadow-md"
                                    />
                                  </div>
                                </div>

                                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> LIBRARY OF SOULS </h3>

                                <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  {LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.title || lastLibrarySoul.type}
                                </h2>

                                <p className="text-[11px] font-black text-emerald-500/80 uppercase tracking-[0.2em] mb-4">
                                  {LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.vibe || "The Reader"}
                                </p>

                                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border border-emerald-100/50 shadow-sm">
                                  SOUL TYPE :  {lastLibrarySoul.type}
                                </div>

                                <p className="text-[14px] font-medium text-slate-600 mb-8 px-2 leading-loose opacity-100 w-full italic">
                                  "{LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.description}"
                                </p>
                              </div>

                              <div className="w-full px-4 mt-auto flex flex-col gap-2">
                                <button
                                  onClick={handleBookMatch}
                                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95"
                                >
                                  <BookOpen size={16} className="text-white/80" />
                                  <span>หนังสือแนะนำ</span>
                                </button>
                                <Link href="/tools/library-of-souls" className="w-full block">
                                  <div className="group/btn-start relative">
                                    <div className="flex items-center justify-center gap-3 px-8 py-3 rounded-full border border-slate-200 text-slate-400 text-[12px] font-black uppercase tracking-widest transition-all duration-300 hover:border-slate-300 hover:text-slate-600 active:scale-95">
                                      <RefreshCw size={14} />
                                      <span>ประเมินใหม่</span>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-between h-full w-full py-2">
                          <div className="flex flex-col items-center justify-center pt-8 mb-8">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-20" />
                              <div className="relative w-24 h-24 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <BookOpen size={36} />
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Library Of Souls</h3>
                            <p className="text-slate-400 text-sm font-medium">ค้นหาจิตวิญญาณนักอ่านในตัวคุณ</p>
                          </div>
                          <div className="w-full px-4 mt-auto">
                            <Link href="/tools/library-of-souls" className="w-full block">
                              <div className="group/btn-start relative">
                                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] group-hover/btn-start:scale-[1.02] group-hover/btn-start:shadow-emerald-300 active:scale-95">
                                  <Sparkles size={16} className="text-white/80" />
                                  <span>เริ่มประเมินครั้งแรก <span className="opacity-90">(+50 XP)</span></span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* 👻 5. Ghost in You */}
                <Link
                  href="/tools/ghost-in-you"
                  onClick={(e) => {
                    if (!isGhostUnlocked) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="group flex flex-col h-full relative"
                >
                  {lastGhostResult && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openGhostInfo(e); }}
                      className="absolute top-8 right-8 z-20 p-2.5 text-[#8C7A6B] hover:text-red-600 hover:bg-red-50 rounded-full transition-all bg-white border border-[#E6D9C5] shadow-sm">
                      <Info size={18} />
                    </button>
                  )}
                  {isGhostUnlocked && !lastGhostResult && (
                    <motion.div
                      initial={{ scale: 0, rotate: 10 }}
                      animate={{ scale: 1, rotate: -5 }}
                      className="absolute top-8 right-8 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-30"
                    >
                      <Zap size={10} className="fill-white" /> +50 XP
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 bg-[#FAF5F2] p-8 rounded-[3rem] border border-[#E6D9C5] flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-red-900/30 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 opacity-90 transition-all duration-500 group-hover:h-2 z-0" />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-red-500/5 to-red-900/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-red-500/10 transition-colors duration-700 z-0" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">
                      {lastGhostResult ? (() => {
                        const ghost = ghostResults[lastGhostResult.primary as keyof typeof ghostResults];
                        if (!ghost) return null;
                        return (
                          <>
                            <div className="flex flex-col items-center mb-8">
                              <div className="relative mb-6 mt-2">
                                <div className="absolute inset-0 bg-red-600/10 blur-3xl" />
                                <div className="relative w-24 h-24 rounded-full bg-white border border-[#E6D9C5] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 overflow-hidden shadow-sm">
                                  <img
                                    src={`/ghosts/${ghost.id}.png`}
                                    alt={ghost.name}
                                    className="w-[135%] h-[135%] object-contain drop-shadow-[0_0_16px_rgba(220,38,38,0.4)]"
                                  />
                                </div>
                              </div>

                              <h3 className="font-bold text-red-600/80 text-[10px] uppercase tracking-[0.3em] mb-2.5">GHOST IN YOU</h3>

                              <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight text-[#3E2723] group-hover:text-red-600 transition-colors">
                                {ghost.name}
                              </h2>

                              <p className="text-[10px] font-black text-red-600/80 uppercase tracking-wide mb-4 truncate w-full px-2">
                                {ghost.fearLabel}
                              </p>

                              <div className="inline-flex items-center bg-red-50 text-red-600 text-[11px] font-black px-4 py-1.5 rounded-full mb-5 border border-red-200">
                                {ghost.nameEn}
                              </div>

                              <p className="text-[14px] font-medium text-[#5C4033] mb-5 px-2 leading-loose italic w-full">
                                "{ghost.tagline}"
                              </p>

                              {/* ตัวตนรอง */}
                              {lastGhostResult.secondary && ghostResults[lastGhostResult.secondary as keyof typeof ghostResults] && (() => {
                                const secGhost = ghostResults[lastGhostResult.secondary as keyof typeof ghostResults];
                                return (
                                  <div className="mb-6 py-2.5 px-5 rounded-2xl bg-red-50/30 border border-red-100/80 flex items-center gap-3 relative group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                                    <img src={`/ghosts/${secGhost.id}.png`} alt={secGhost.name} className="w-8 h-8 object-contain opacity-70 shrink-0" />
                                    <div className="flex flex-col items-start leading-none gap-1">
                                      <span className="text-[8px] font-black text-red-600/70 uppercase tracking-widest">ตัวตนรอง</span>
                                      <span className="text-[12px] font-bold text-[#3E2723]">{secGhost.name}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="w-full px-4 mt-auto">
                              <div className="flex items-center justify-center gap-3 px-8 py-3 rounded-full border border-[#E6D9C5] text-[#8C7A6B] text-[12px] font-black uppercase tracking-widest transition-all hover:border-red-600/40 hover:text-red-600 active:scale-95 bg-white">
                                <RefreshCw size={14} />
                                <span>ประเมินใหม่</span>
                              </div>
                            </div>
                          </>
                        );
                      })() : (
                        <div className="flex flex-col items-center justify-between h-full w-full py-2">
                          <div className="flex flex-col items-center justify-center pt-8 mb-8">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-red-600/10 blur-3xl" />
                              <div className="relative w-24 h-24 rounded-full bg-white text-red-600/80 flex items-center justify-center border border-[#E6D9C5] group-hover:border-red-600 group-hover:text-red-600 transition-all shadow-sm">
                                <Ghost size={36} />
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-[#3E2723] mb-2">Ghost in You</h3>
                            <p className="text-[#6F5B4E] text-sm font-medium">ผีอะไรสิงคุณอยู่?</p>
                          </div>
                          <div className="w-full px-4 mt-auto">
                            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-red-700 to-red-600 text-white text-[13px] font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(220,38,38,0.25)] group-hover:scale-[1.02] transition-all active:scale-95">
                              <Sparkles size={16} className="text-white/80" />
                              <span>สำรวจความกลัวลึกๆ (+50 XP)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {!isGhostUnlocked && renderLockedBentoOverlay("Ghost In You Locked", "สุ่มคำคมจากคมสัดสัดอย่างน้อย 1 ครั้งก่อน เพื่อเปิด Phase 2 ต่อ")}
                  </motion.div>
                </Link>

              </>
            )}

            {/* ⏳ Memento Mori / Life Countdown Bento */}
            {(activeTab === "home" || activeTab === "identity") && (
              <div className="relative">
                <MementoMoriBento
                  userData={userData}
                  onOpenModal={() => {
                    if (isMementoUnlocked) setShowMementoModal(true);
                  }}
                />
                {!isMementoUnlocked && renderLockedBentoOverlay("Memento Mori Locked", "บันทึก Reflection Journal จาก Focus Room อย่างน้อย 1 ครั้งก่อน เพื่อปลดล็อก")}
              </div>
            )}

            {(activeTab === "home" || activeTab === "resources") && (
              <>
                {/* 🌟 Focus Room - Premium Monochrome Style */}
                <Link
                  href="/tools/focus-room"
                  onClick={(e) => {
                    if (!isFocusRoomUnlocked) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className={`group flex flex-col h-full relative cursor-pointer ${activeTab === "resources" ? "order-4" : ""}`}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-zinc-200 relative overflow-hidden"
                  >

                    {/* 🏷️ Status Badge (ตำแหน่งเดียวกับ Library) */}
                    <div className="absolute top-8 right-8 z-30">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-zinc-200 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <Zap size={10} className="fill-white" /> Ready
                      </motion.div>
                    </div>

                    {/* ✨ Ambient Light & Black Top Bar (โครงสร้างเดียวกับ Library) */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-zinc-400/5 to-zinc-900/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-zinc-400/10 transition-colors duration-700" />

                    {/* Top Bar ปรับให้หนาขึ้นเมื่อ Hover เหมือน Library */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900 opacity-80 transition-all duration-500 group-hover:h-2" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">

                      {/* 🧠 Logo Container (w-24 h-24 เท่ากับ Library เป๊ะ) */}
                      <div className="relative mb-6 mt-2">
                        <div className="absolute inset-0 blur-3xl opacity-20 bg-zinc-200" />
                        <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-50 flex items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110">
                          🧘‍♂️
                        </div>
                      </div>

                      <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> Focus Room </h3>
                      <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight text-slate-900 group-hover:text-black transition-colors">
                        ห้องสมาธิอัพสกิล
                      </h2>

                      {/* Description & XP Badge (จัดวางให้สมดุลกับ Library) */}
                      <div className="flex flex-col items-center mb-8 px-6 max-w-[280px]">
                        <p className="text-[14px] font-medium text-slate-500 leading-relaxed opacity-80 mb-3">
                          จดจ่อกับสิ่งที่ทำ <br /> และพัฒนาสมองให้เฉียบคม
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200/50 text-[10px] font-black uppercase tracking-wider">
                          <Zap size={11} className="fill-yellow-400 text-yellow-400" />
                          รับ XP ตามโหมดที่โฟกัส
                        </span>
                      </div>

                      {/* Button (สัดส่วนและ Padding เท่ากับ Library) */}
                      <div className="w-full px-4 mt-auto">
                        <div className="group/btn-deep relative">
                          <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-black text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] group-hover/btn-deep:scale-[1.02] group-hover/btn-deep:bg-zinc-800 active:scale-95">
                            <BrainCircuit size={16} className="text-white/80" />
                            <span>เริ่มโหมดโฟกัส</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isFocusRoomUnlocked && renderLockedBentoOverlay("Focus Room Locked", "เคลม XP คลังสมอง 2 บทความ + จดบันทึก 1 เรื่องก่อน เพื่อปลดล็อก Focus Room")}
                  </motion.div>
                </Link>

                {/* 🌟 AI Personal Mentor - Silver Premium Style */}
                {(activeTab === "home" || activeTab === "resources" || activeTab === "identity") && (
                  <Link
                    href="/tools/soul-guide"
                    onClick={(e) => {
                      if (!isSoulGuideUnlocked) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    className={`group flex flex-col h-full relative ${activeTab === "resources" ? "order-3" : ""}`}
                  >
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="flex-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:border-slate-300 relative overflow-hidden group"
                    >


                      {/* 🏷️ AI Active Status Badge */}
                      <div className="absolute top-8 right-8 z-30">
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-slate-200 flex items-center gap-1.5 uppercase tracking-wider border border-slate-700"
                        >
                          <Zap size={10} className="fill-blue-400 text-blue-400" /> AI Active
                        </motion.div>
                      </div>

                      {/* ✨ Silver Ambient Light & Top Bar */}
                      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-slate-200/40 to-slate-400/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:from-slate-300/30 transition-colors duration-700" />
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-300 via-slate-500 to-slate-300 opacity-80 transition-all duration-500 group-hover:h-2" />

                      <div className="relative z-10 flex flex-col items-center h-full w-full">
                        {/* 🤖 Logo Container */}
                        <div className="relative mb-6 mt-2">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                            <img src="/fuii-avatar.png" alt="พี่ฟุ้ย" className="w-full h-full object-cover" />
                          </div>
                        </div>


                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2.5"> คุยกับพี่ฟุ้ย </h3>
                        <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                          คุยกับพี่ฟุ้ย
                        </h2>

                        <p className="text-[14px] font-medium text-slate-500 mb-8 px-6 leading-relaxed opacity-80 max-w-[280px]">
                          คุยได้ทุกเรื่อง ตั้งแต่เป้าหมาย <br /> จนถึงปัญหาที่ค้างคาใจ
                        </p>

                        <div className="w-full px-4 mt-auto">
                          <div className="group/btn-mentor relative">
                            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] group-hover/btn-mentor:scale-[1.02] active:scale-95">
                              <MessageSquare size={16} className="text-white/80" />
                              <span>คุยกับพี่ฟุ้ย</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isSoulGuideUnlocked && renderLockedBentoOverlay("คุยกับพี่ฟุ้ย Locked", "แลกของใน Happiness Shop อย่างน้อย 1 ครั้งก่อน เพื่อปลดล็อกพี่ฟุ้ยใน Phase 2")}
                    </motion.div>
                  </Link>
                )}

                {/* 🌟 6. BRAIN (Upskill Library) - Premium Gold & Black Style */}
                <Link
                  href="/library"
                  className={`group flex flex-col h-full relative cursor-pointer ${activeTab === "resources" ? "order-1" : ""}`}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="flex-1 p-8 rounded-[3rem] shadow-sm border transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center bg-slate-950 border-slate-800 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] hover:border-amber-500/50"
                  >

                    {/* 🏷️ Status Badge */}
                    <div className="absolute top-8 right-8 z-30">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-amber-900/20 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <Unlock size={10} className="fill-current" /> OPEN
                      </motion.div>
                    </div>

                    {/* ✨ Ambient Light & Top Bar */}
                    <div className="absolute top-0 right-0 w-72 h-72 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-colors duration-700 bg-amber-500/10 group-hover:bg-amber-500/20" />
                    <div className="absolute top-0 left-0 w-full h-1.5 opacity-80 transition-all duration-500 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">

                      {/* 🧠 Logo Container */}
                      <div className="relative mb-6 mt-2">
                        <div className="absolute inset-0 blur-3xl opacity-20 bg-amber-400/30" />
                        <div className="relative w-24 h-24 rounded-full border flex items-center justify-center text-6xl transition-transform duration-500 shadow-2xl bg-slate-900 border-amber-500/30 group-hover:scale-110 group-hover:border-amber-400 group-hover:shadow-amber-500/20">
                          🧠
                        </div>
                      </div>

                      <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-2.5 text-amber-500/60">
                        UPSKILL BRAIN
                      </h3>
                      <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight transition-colors text-white group-hover:text-amber-400">
                        คลังสมองอัพสกิล
                      </h2>

                      <p className="text-[14px] font-medium mb-8 px-6 leading-relaxed max-w-[280px] transition-colors text-slate-400">
                        สรุปบทความพัฒนาตัวเอง <br /> และสมองที่สองสำหรับจดบันทึกด้วย AI
                      </p>

                      <div className="w-full px-4 mt-auto">
                        <div className="group/btn-library relative">
                          <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-library:scale-[1.02] group-hover/btn-library:shadow-amber-500/50 active:scale-95">
                            <Sparkles size={16} className="text-slate-950/80" />
                            <span>เปิดคลังสมอง</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* 🛍️ 7. Happiness Shop - Premium Rainbow Theme Bento Card */}
                {(activeTab === "home" || activeTab === "resources") && (
                  <Link
                    href="/shop"
                    onClick={(e) => {
                      if (!isShopUnlocked) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    className={`group flex flex-col h-full relative cursor-pointer ${activeTab === "resources" ? "order-2" : ""}`}
                  >
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="flex-1 p-8 rounded-[3rem] shadow-sm border transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center bg-slate-950 border-slate-800 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] hover:border-pink-500/50"
                    >
                      {/* 🏷️ Status Badge */}
                      <div className="absolute top-8 right-8 z-30">
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-pink-900/20 flex items-center gap-1.5 uppercase tracking-wider"
                        >
                          <ShoppingBag size={10} /> SHOP
                        </motion.div>
                      </div>

                      {/* ✨ Ambient Light & Top Bar */}
                      <div className="absolute top-0 right-0 w-72 h-72 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-colors duration-700 bg-pink-500/10 group-hover:bg-pink-500/20" />
                      <div className="absolute top-0 left-0 w-full h-1.5 opacity-80 transition-all duration-500 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500" />

                      <div className="relative z-10 flex flex-col items-center h-full w-full">
                        {/* 🧠 Logo Container */}
                        <div className="relative mb-6 mt-2">
                          <div className="absolute inset-0 blur-3xl opacity-20 bg-pink-400/30" />
                          <div className="relative w-24 h-24 rounded-full border flex items-center justify-center text-6xl transition-transform duration-500 shadow-2xl bg-slate-900 border-pink-500/30 group-hover:scale-110 group-hover:border-pink-400 group-hover:shadow-pink-500/20">
                            🛍️
                          </div>
                        </div>

                        <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-2.5 text-pink-500/60">
                          HAPPINESS SHOP
                        </h3>
                        <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight transition-colors text-white group-hover:text-pink-400">
                          ความสุขระหว่างทาง
                        </h2>

                        <p className="text-[14px] font-medium mb-8 px-6 leading-relaxed max-w-[280px] transition-colors text-slate-400">
                          ใช้แต้ม XP ในกระปุกออมของคุณ <br /> แลกรับของรางวัลจริงเพื่อเติมพลังใจ
                        </p>

                        <div className="w-full px-4 mt-auto">
                          <div className="group/btn-shop relative">
                            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(236,72,153,0.4)] group-hover/btn-shop:scale-[1.02] group-hover/btn-shop:shadow-pink-500/50 active:scale-95">
                              <ShoppingBag size={16} className="text-white/80" />
                              <span>เข้าสู่ร้านค้า</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isShopUnlocked && renderLockedBentoOverlay("Happiness Shop Locked", "ทำ Ghost In You ให้เสร็จก่อน เพื่อปลดล็อกความสุขระหว่างทาง")}
                    </motion.div>
                  </Link>
                )}

              </>
            )}

          </div>
        )}



        <div className="mt-8 border-t border-slate-100 py-4 text-center sm:mt-12 sm:py-5 md:mt-16 md:py-6 flex flex-col items-center">
          <p className="text-[10px] text-slate-400 font-bold mb-5 tracking-wide">© 2026 อัพสกิลกับฟุ้ย</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-6">
            {/* ปุ่ม Logout เดิม */}
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-white text-slate-500 font-black text-sm py-3 px-6 rounded-full shadow-sm hover:text-slate-800 hover:bg-slate-50 transition-colors border border-slate-100 active:scale-95 w-full sm:w-auto">
              <LogOut size={16} /> ออกจากระบบ
            </button>

            {/* 🚨 ปุ่มรีเซ็ตข้อมูล (ซ่อนตัวเนียนๆ เป็นสีแดงอ่อน - แสดงเฉพาะ Dev หรือ Admin) */}
            {(process.env.NODE_ENV === 'development' || (user?.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").toLowerCase().split(",").filter(Boolean).includes(user.email.toLowerCase()))) && (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">

                <button onClick={handleResetAllData} className="flex items-center justify-center gap-2 bg-transparent text-red-300 font-bold text-xs py-3 px-4 rounded-full hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 w-full sm:w-auto">
                  <RefreshCw size={14} /> เริ่มต้นใหม่ (Reset)
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- 💡 Modals & Popups --- */}
      <AnimatePresence>

        {/* Info Popup (ใช้ร่วมกันหมด) */}
        {/* Info Popup (ฉบับแก้กรอบเป๊ะ ไม่เลยบนล่าง) */}
        {infoModal?.isOpen && (
          <motion.div
            key="info-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setInfoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              // 💡 ปรับตรงนี้: เปลี่ยน max-h เป็น 80vh และเพิ่ม flex flex-col
              className="bg-white rounded-[2.5rem] shadow-2xl relative max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* 💡 ส่วนหัว: ให้ปุ่ม X อยู่กับที่เสมอ */}
              <div className="p-6 pb-2 flex justify-between items-start sticky top-0 bg-white z-20">
                <h3 className="text-xl font-black text-slate-800 pr-8 leading-tight">{infoModal.title}</h3>
                <button
                  onClick={() => setInfoModal(null)}
                  className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2.5 rounded-full transition-all shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 💡 ส่วนเนื้อหา: เลื่อน Scroll ได้แค่ตรงนี้ */}
              <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1 text-slate-600 font-medium leading-relaxed">
                {infoModal.content}
              </div>

              {/* 💡 ส่วนท้าย: ปุ่มกดอยู่กับที่ด้านล่าง */}
              <div className="p-6 pt-4 bg-white border-t border-slate-50">
                <button
                  onClick={() => setInfoModal(null)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 📚 Book Match Modal */}
        {bookMatchModal && (
          <motion.div
            key="book-match-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setBookMatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="relative w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-[2.5rem]"
              onClick={e => e.stopPropagation()}
            >
              {/* Holo border glow */}
              <div className="absolute inset-0 rounded-[2.5rem] p-[1.5px] z-0"
                style={{ background: "linear-gradient(135deg, #a78bfa, #67e8f9, #34d399, #fbbf24, #f472b6, #a78bfa)" }}>
                <div className="w-full h-full rounded-[2.4rem] bg-white" />
              </div>

              {/* Holo shimmer overlay */}
              <div className="absolute inset-0 rounded-[2.5rem] z-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ x: ["−100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-y-0 w-1/3 opacity-10"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)", transform: "skewX(-20deg)" }}
                />
              </div>

              {/* Modal content */}
              <div className="relative z-10 flex flex-col max-h-[85vh] overflow-hidden rounded-[2.5rem] bg-white/95 backdrop-blur-sm">

                {/* Header — holo gradient */}
                <div className="relative rounded-t-[2.5rem] px-6 pt-5 pb-7"
                  style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5, #f5f3ff)" }}>
                  <div className="absolute inset-0 opacity-30"
                    style={{ background: "linear-gradient(135deg, #a7f3d0, #c4b5fd, #67e8f9, #a7f3d0)", backgroundSize: "200% 200%", animation: "gradientShift 6s ease infinite" }} />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={16} className="text-emerald-600" />
                        <h3 className="text-lg font-black text-slate-800">หนังสือแนะนำ</h3>
                      </div>
                      {lastLibrarySoul && (
                        <p className="text-[11px] font-black uppercase tracking-widest pb-1 leading-normal"
                          style={{ background: "linear-gradient(90deg, #059669, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
                          {LIBRARY_SOULS_RESULTS[lastLibrarySoul.type]?.title || lastLibrarySoul.type} · {lastLibrarySoul.type}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setBookMatchModal(false)}
                      className="text-slate-400 hover:text-red-500 bg-white/70 hover:bg-red-50 p-2.5 rounded-full transition-all shadow-sm border border-white/50">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-5 space-y-3">
                  {bookMatchLoading ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-4">
                      <div className="relative w-12 h-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                          className="w-12 h-12 rounded-full border-2 border-t-transparent"
                          style={{ borderColor: "transparent", borderTopColor: "transparent", background: "conic-gradient(from 0deg, #a78bfa, #34d399, #67e8f9, #fbbf24, #f472b6, #a78bfa)", borderRadius: "9999px", padding: "2px" }}
                        />
                        <div className="absolute inset-[2px] bg-white rounded-full" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">กำลังเลือกหนังสือที่เหมาะกับคุณ</p>
                    </div>
                  ) : bookMatchBooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <BookOpen size={40} className="text-slate-200" />
                      <p className="text-slate-400 text-sm">โหลดไม่ได้ ลองอีกครั้งนะ</p>
                      <button onClick={fetchBooks} className="text-emerald-600 text-sm font-black hover:underline">
                        ลองใหม่
                      </button>
                    </div>
                  ) : (
                    bookMatchBooks.map((book, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="p-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
                            style={{ background: ["linear-gradient(135deg,#a78bfa,#7c3aed)", "linear-gradient(135deg,#34d399,#059669)", "linear-gradient(135deg,#67e8f9,#0284c7)", "linear-gradient(135deg,#fbbf24,#d97706)"][i % 4] }}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-black text-slate-800 text-[14px] leading-tight flex-1">{book.title}</p>
                              <button
                                onClick={() => handleSaveBook(book)}
                                className={`shrink-0 p-1.5 rounded-full transition-all active:scale-90 ${savedBooks.has(book.title) ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-50'}`}
                              >
                                <Bookmark size={15} className={savedBooks.has(book.title) ? 'fill-emerald-500' : ''} />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{book.author}</p>
                            <span className="inline-block mt-1.5 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                              style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", color: "#059669", border: "1px solid #d1fae5" }}>
                              {book.category}
                            </span>
                            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">{book.reason}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {!bookMatchLoading && (
                  <div className="p-4 border-t border-slate-100">
                    <button
                      onClick={fetchBooks}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-500 text-[12px] font-black hover:border-violet-300 hover:text-violet-600 transition-all active:scale-95"
                    >
                      <RefreshCw size={13} /> สุ่มใหม่
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🗂️ กล่องสะสม Modal */}
        {showCollectionModal && (() => {
          const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
          const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
          const MONTHS = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
          const formatDateLabel = (d: string) => {
            if (d === today) return 'วันนี้';
            if (d === yesterday) return 'เมื่อวาน';
            const [y, m, day] = d.split('-');
            return `${parseInt(day)} ${MONTHS[parseInt(m)]} ${parseInt(y) + 543}`;
          };
          const grouped = collectionQuests.reduce((acc, q) => {
            (acc[q.completedAt] = acc[q.completedAt] || []).push(q);
            return acc;
          }, {} as Record<string, typeof collectionQuests>);
          // รวม today เข้าไปใน dates เสมอ (สำหรับ MY QUEST)
          const allDates = Array.from(new Set([today, ...Object.keys(grouped)])).sort((a, b) => b.localeCompare(a));
          const selDate = collectionSelectedDate || today;
          const selIndex = allDates.indexOf(selDate);
          const canPrev = selIndex < allDates.length - 1;
          const canNext = selIndex > 0;
          const questsForDay = (grouped[selDate] || []).filter((q, i, arr) => arr.findIndex(x => x.title === q.title) === i);
          const typeColor = (t: string) =>
            t === 'WHEEL'     ? 'bg-red-100 text-red-700' :
            t === 'DISC'      ? 'bg-blue-100 text-blue-700' :
            t === 'MONEY'     ? 'bg-amber-100 text-amber-700' :
            t === 'LIBRARY'   ? 'bg-emerald-100 text-emerald-700' :
            t === 'CHALLENGE' ? 'bg-indigo-100 text-indigo-700' :
            t === 'WILDCARD'  ? 'bg-purple-100 text-purple-700' :
            'bg-slate-100 text-slate-600';

          return (
            <motion.div
              key="collection-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              onClick={() => setShowCollectionModal(false)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800">ประวัติเควสของคุณ</h2>
                    <button
                      onClick={async () => {
                        if (!user || !window.confirm('ล้างประวัติ Quest ทั้งหมด?')) return;
                        const snap = await getDocs(collection(db, 'users', user.uid, 'quest_log'));
                        await Promise.all([
                          ...snap.docs.map(d => deleteDoc(d.ref)),
                          updateDoc(doc(db, 'users', user.uid), { customQuestTitle: '' }),
                        ]);
                        setCollectionQuests([]);
                        setCustomQuestTitle('');
                      }}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-full hover:bg-red-50"
                    >ล้าง</button>
                    <button onClick={() => setShowCollectionModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">✕</button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                  {collectionLoading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400 text-sm">กำลังโหลด...</div>
                  ) : (
                    <>
                      {/* ✅ Quest รายวัน */}
                      <div>
                        {/* Day navigation */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                            ✅ Quest ที่เคยทำ
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">{Object.values(grouped).reduce((sum, qs) => sum + new Set(qs.map(q => q.title)).size, 0) + (customQuestTitle && completedQuests.includes('special-01') ? 1 : 0)}</span>
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => canPrev && setCollectionSelectedDate(allDates[selIndex + 1])}
                              disabled={!canPrev}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${canPrev ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'text-slate-300 cursor-default'}`}
                            >‹</button>
                            <span className="text-xs font-bold text-slate-600 min-w-[56px] text-center">{formatDateLabel(selDate)}</span>
                            <button
                              onClick={() => canNext && setCollectionSelectedDate(allDates[selIndex - 1])}
                              disabled={!canNext}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${canNext ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'text-slate-300 cursor-default'}`}
                            >›</button>
                          </div>
                        </div>

                        {/* Quests for selected day */}
                        {questsForDay.length === 0 && !(selDate === today && customQuestTitle) ? (
                          <p className="text-xs text-slate-400 py-2">ไม่มี Quest วันนี้ — เริ่มทำเลย!</p>
                        ) : (
                          <div className="space-y-2">
                            {selDate === today && customQuestTitle && completedQuests.includes('special-01') && (
                              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 shrink-0 mt-0.5">MY QUEST</span>
                                <p className="text-sm text-slate-700 leading-snug">{customQuestTitle}</p>
                              </div>
                            )}
                             {questsForDay.map((q, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 mt-0.5 ${typeColor(q.type)}`}>{q.type === 'DISC' ? 'HABIT' : q.type}</span>
                                <p className="text-sm text-slate-700 leading-snug">{q.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* Level Up Popup */}
        {showLevelUp?.isOpen && (
          <motion.div
            key="level-up-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 🔥 แก้ 1: เปลี่ยนเป็น pointer-events-auto และเพิ่ม z-index ให้สูงขึ้น
            // 🔥 แก้ 2: ใส่ onClick เพื่อให้กดที่ว่างๆ แล้วปิดได้
            className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowLevelUp(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0, transition: { type: "spring", bounce: 0.6 } }}
              exit={{ scale: 0.8, opacity: 0 }}
              // 🔥 แก้ 3: ใส่ stopPropagation เพื่อไม่ให้คลิกโดนตัวการ์ดแล้วมันปิด
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[2.5rem] p-1 shadow-[0_0_50px_rgba(250,204,21,0.5)] max-w-sm w-full text-center"
            >
              <div className="bg-white rounded-[2.4rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 text-yellow-100 opacity-50">
                  <Sparkles size={150} />
                </motion.div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-white">
                    <Trophy size={40} className="fill-current" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-1">ยินดีด้วย!</h2>
                  <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">คุณอัพเลเวลแล้ว</p>

                  <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl border-4 border-slate-800 shadow-xl mb-6">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">LV. {showLevelUp.newLevel}</span>
                  </div>

                  <p className="text-slate-600 font-medium text-sm mb-8">
                    สุดยอดเลยครับ! คุณคือ <span className="font-bold text-orange-500">{getLevelTitle(showLevelUp.newLevel)}</span> ตัวจริง ก้าวต่อไปนะครับ 🚀
                  </p>

                  {/* 🔥 เพิ่มปุ่มปิดให้ชัดเจน เผื่อ User หาที่กดไม่เจอ */}
                  <button
                    onClick={() => setShowLevelUp(null)}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg"
                  >
                    ลุยต่อเลย!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ✍️ Modal: กำหนดเควสเอง (Level 10+) - Guided Version */}
        {showCustomInputModal && (
          <motion.div
            key="custom-input-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowCustomInputModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full border-4 border-indigo-50 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Decor */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50 pointer-events-none" />

              <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                  <BrainCircuit size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-2">วันนี้อยากทำอะไร?</h3>

                {/* ✨ ส่วนของ Guided Prompt ที่เปลี่ยนทุกวัน */}
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-4">
                  <p className="text-[13px] font-bold text-indigo-700 leading-relaxed italic">
                    "{dailyGuidedPrompt}"
                  </p>
                </div>
              </div>

              <div className="relative mb-6">
                <input
                  autoFocus
                  type="text"
                  placeholder="พิมพ์เป้าหมายของคุณที่นี่..."
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner"
                  id="customQuestInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        setCustomQuestTitle(val.trim());
                        setShowCustomInputModal(false);
                      }
                    }
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Target size={20} />
                </div>
              </div>

              <button
                onClick={async () => {
                  const input = document.getElementById('customQuestInput') as HTMLInputElement;
                  const val = input?.value.trim();
                  if (val && user) {
                    setCustomQuestTitle(val);
                    setShowCustomInputModal(false);

                    // ✅ บันทึกชื่อเควสลง Firestore ทันที
                    const userRef = doc(db, "users", user.uid);
                    await setDoc(userRef, {
                      customQuestTitle: val,
                      // 🌟 เปลี่ยนคำว่า lastQuestDate เป็น lastActiveDate ตรงนี้ครับ
                      lastActiveDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
                    }, { merge: true });
                  }
                }}
                // ... className เดิม

                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-600 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> ยืนยันและเริ่มทำทันที
              </button>

              <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
                ⚠️ เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* 🎖️ Modal: Upskill Player Card */}
        {showShareModal && (
          <motion.div
            key="share-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, rotateY: 20 }}
              animate={{ scale: 1, y: 0, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative max-w-[360px] w-full transform-gpu will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 💳 ตัวการ์ด (The Card Canvas) */}
              {/* 💳 ตัวการ์ด (The Card Canvas) */}
              {renderPlayerCardCanvas("player-card", false)}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-4 bg-white/5 text-white/60 font-black rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all text-xs tracking-widest"
                >
                  CLOSE
                </button>
                <button
                  onClick={handleDownloadCard}
                  className="flex-[2] py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black rounded-[1.5rem] shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs tracking-widest"
                >
                  <Download size={18} /> SAVE CARD
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💳 Modal: Free vs Pro Membership */}
      <AnimatePresence>
        {showMembershipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl"
            onClick={() => setShowMembershipModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="relative max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-[2.5rem] border border-white/10 bg-slate-950 p-1 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.28),transparent_34%),radial-gradient(circle_at_95%_20%,rgba(168,85,247,0.20),transparent_30%)]" />
              <div className="relative rounded-[2.25rem] border border-white/10 bg-slate-950/82 p-6 text-center backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => setShowMembershipModal(false)}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-white"
                  aria-label="Close membership modal"
                >
                  <X size={16} />
                </button>

                <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                  <Sparkles size={14} />
                  Membership
                </div>

                {showLetter ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-left pt-2"
                  >
                    {userData?.isFoundingMember ? (
                      /* --- Luxury Mini Certificate inside Modal --- */
                      <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-[#fbfbfb] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center flex flex-col items-center justify-center min-h-[300px] select-none">
                        {/* Background premium glows */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/20 blur-[60px] rounded-full pointer-events-none" />
                        
                        {/* Left Chevron Wing */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none overflow-hidden select-none">
                          <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 rotate-[35deg] origin-top-left shadow-sm" />
                          <div className="absolute bottom-[-10%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 -rotate-[35deg] origin-bottom-left shadow-sm" />
                          <div className="absolute top-0 left-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                          <div className="absolute bottom-0 left-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }} />
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-amber-300 to-yellow-500 rotate-45 border-2 border-slate-900 shadow-sm" />
                        </div>

                        {/* Right Chevron Wing */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none overflow-hidden select-none">
                          <div className="absolute top-[-10%] right-[-20%] w-[140%] h-[60%] bg-gradient-to-bl from-amber-300 via-amber-400 to-yellow-500 -rotate-[35deg] origin-top-right shadow-sm" />
                          <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[60%] bg-gradient-to-tl from-amber-300 via-amber-400 to-yellow-500 rotate-[35deg] origin-bottom-right shadow-sm" />
                          <div className="absolute top-0 right-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
                          <div className="absolute bottom-0 right-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-amber-300 to-yellow-500 rotate-45 border-2 border-slate-900 shadow-sm" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 w-full px-5 flex flex-col items-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-300/40 bg-amber-500/5 text-[7.5px] font-black uppercase tracking-[0.15em] text-amber-700">
                            👑 GOLD PRO SUPPORTER
                          </div>
                          
                          <h2 className="text-[11px] font-black text-slate-800 tracking-[0.12em] uppercase mt-2.5">
                            Certificate of Appreciation
                          </h2>
                          
                          <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                            PROUDLY PRESENTED TO
                          </p>
                          
                          <h3 className="text-sm font-serif text-slate-900 font-extrabold italic mt-1 border-b border-amber-500/20 pb-0.5 px-3 leading-none w-full max-w-[200px] truncate select-all">
                            {user?.displayName || "Pro Member"}
                          </h3>
                          
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-3 leading-relaxed max-w-[240px] italic">
                            “ขอบคุณที่เชื่อมั่นและร่วมสนับสนุนระบบช่วยออกแบบชีวิตนี้ให้มีตัวตนขึ้นมาได้จริง คุณคือหนึ่งในรากฐานที่สำคัญที่สุดของแอปนี้ครับ” — พี่ฟุ้ย
                          </p>

                          {/* Bottom Certificate Grid */}
                          <div className="flex items-end justify-between w-full mt-4 pt-3 border-t border-slate-100/80 gap-2">
                            {/* Member ID */}
                            <div className="text-left flex-1 min-w-0">
                              <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">MEMBER ID</span>
                              <span className="text-[13px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 bg-clip-text text-transparent mt-1 block tabular-nums leading-none">
                                PRO #{userData?.memberNumber ? String(userData.memberNumber).padStart(3, '0') : String(Math.abs(userData?.createdAt?.seconds % 1000 || 42)).padStart(3, '0')}
                              </span>
                            </div>

                            {/* Gold Seal */}
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mx-1 -translate-y-0.5 select-none">
                              {/* Ribbon Tails */}
                              <div className="absolute bottom-[-4px] left-[15%] w-1.5 h-3 bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 rotate-[15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
                              <div className="absolute bottom-[-4px] right-[15%] w-1.5 h-3 bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 -rotate-[15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
                              
                              {/* Main Seal Body */}
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 rounded-full shadow-[0_2px_6px_rgba(245,158,11,0.2)] flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-amber-300 border border-amber-400/30">
                                  <Crown size={8} className="fill-current text-amber-400" />
                                </div>
                              </div>
                            </div>

                            {/* Verification */}
                            <div className="text-right flex-1 min-w-0">
                              <span className="text-[6.5px] font-bold text-emerald-600 uppercase tracking-widest block leading-none">VERIFIED BY</span>
                              <span className="text-[7.5px] font-black text-slate-800 mt-1 block uppercase tracking-wide leading-none truncate">
                                UPSKILL EVERYDAY
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Toggle header inside modal for regular PRO */}
                        {isProMember && (
                          <div className="flex justify-center gap-1.5 mb-5 bg-white/[0.04] p-1 border border-white/5 rounded-2xl max-w-[320px] mx-auto">
                            <button
                              type="button"
                              onClick={() => setViewMode("cert")}
                              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                viewMode === "cert"
                                  ? "bg-violet-600 text-white shadow-lg"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              ใบรับรอง
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewMode("letter")}
                              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                viewMode === "letter"
                                  ? "bg-violet-600 text-white shadow-lg"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              จดหมาย
                            </button>
                          </div>
                        )}

                        {isProMember && viewMode === "cert" ? (
                          /* --- Luxury Mini Certificate inside Modal (PRO MEMBER) --- */
                          <div className="relative overflow-hidden rounded-3xl border border-violet-200/50 bg-slate-950 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center flex flex-col items-center justify-center min-h-[300px] select-none">
                            {/* Background premium glows */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />
                            
                            {/* Left Chevron Wing */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none overflow-hidden select-none">
                              <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 rotate-[35deg] origin-top-left shadow-sm" />
                              <div className="absolute bottom-[-10%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-tr from-violet-400 via-purple-500 to-indigo-600 -rotate-[35deg] origin-bottom-left shadow-sm" />
                              <div className="absolute top-0 left-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                              <div className="absolute bottom-0 left-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }} />
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-violet-300 to-indigo-500 rotate-45 border-2 border-slate-900 shadow-sm" />
                            </div>

                            {/* Right Chevron Wing */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none overflow-hidden select-none">
                              <div className="absolute top-[-10%] right-[-20%] w-[140%] h-[60%] bg-gradient-to-bl from-violet-400 via-purple-500 to-indigo-600 -rotate-[35deg] origin-top-right shadow-sm" />
                              <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[60%] bg-gradient-to-tl from-violet-400 via-purple-500 to-indigo-600 rotate-[35deg] origin-bottom-right shadow-sm" />
                              <div className="absolute top-0 right-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
                              <div className="absolute bottom-0 right-0 w-[82%] h-[48%] bg-slate-900" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-violet-300 to-indigo-500 rotate-45 border-2 border-slate-900 shadow-sm" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 w-full px-5 flex flex-col items-center">
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-violet-400/40 bg-violet-500/5 text-[7.5px] font-black uppercase tracking-[0.15em] text-violet-400">
                                ⚡ PRO SUPPORTER
                              </div>
                              
                              <h2 className="text-[11px] font-black text-white tracking-[0.12em] uppercase mt-2.5">
                                Certificate of Appreciation
                              </h2>
                              
                              <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                                PROUDLY PRESENTED TO
                              </p>
                              
                              <h3 className="text-sm font-serif text-white font-extrabold italic mt-1 border-b border-violet-500/20 pb-0.5 px-3 leading-none w-full max-w-[200px] truncate select-all">
                                {user?.displayName || "Pro Member"}
                              </h3>
                              
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-3 leading-relaxed max-w-[240px] italic">
                                “ขอบคุณที่สนับสนุนและร่วมเดินทางไปกับระบบช่วยออกแบบชีวิตนี้ คุณคือส่วนสำคัญในการพัฒนาแอปนี้ให้เติบโตครับ” — พี่ฟุ้ย
                              </p>

                              {/* Bottom Certificate Grid */}
                              <div className="flex items-end justify-between w-full mt-4 pt-3 border-t border-slate-800 gap-2">
                                {/* Member ID */}
                                <div className="text-left flex-1 min-w-0">
                                  <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest block leading-none">MEMBER ID</span>
                                  <span className="text-[13px] font-black bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent mt-1 block tabular-nums leading-none">
                                    PRO #{userData?.memberNumber ? String(userData.memberNumber).padStart(3, '0') : String(Math.abs(userData?.createdAt?.seconds % 1000 || 42)).padStart(3, '0')}
                                  </span>
                                </div>

                                {/* Seal */}
                                <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mx-1 -translate-y-0.5 select-none">
                                  {/* Ribbon Tails */}
                                  <div className="absolute bottom-[-4px] left-[15%] w-1.5 h-3 bg-gradient-to-b from-violet-400 to-indigo-500 rotate-[15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
                                  <div className="absolute bottom-[-4px] right-[15%] w-1.5 h-3 bg-gradient-to-b from-violet-400 to-indigo-500 -rotate-[15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }} />
                                  
                                  {/* Main Seal Body */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full shadow-lg flex items-center justify-center p-[1px]">
                                    <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-violet-400 border border-violet-400/30">
                                      <Sparkles size={8} className="fill-current text-violet-400" />
                                    </div>
                                  </div>
                                </div>

                                {/* Verification */}
                                <div className="text-right flex-1 min-w-0">
                                  <span className="text-[6.5px] font-bold text-emerald-400 uppercase tracking-widest block leading-none">VERIFIED BY</span>
                                  <span className="text-[7.5px] font-black text-slate-300 mt-1 block uppercase tracking-wide leading-none truncate">
                                    UPSKILL EVERYDAY
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* --- Developer's Letter --- */
                          <>
                            <div className="flex items-center justify-between gap-3 mb-5">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white shadow-sm">
                                  <img src="/fuii-avatar.png" alt="พี่ฟุ้ย" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-white leading-tight">
                                    สวัสดีครับ ผมฟุ้ย 👨🏻‍💻
                                  </h3>
                                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 mt-0.5">Creator of Upskill Everyday</p>
                                </div>
                              </div>
                              {isProMember && (
                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 uppercase tracking-widest">
                                  ขอบคุณที่สนับสนุน ❤️
                                </span>
                              )}
                            </div>

                            <div className="space-y-4 text-[13px] font-bold leading-relaxed text-slate-300 bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-md">
                              {isProMember ? (
                                <>
                                  <p>
                                    ขอบคุณมากๆ ครับที่สนับสนุน Upskill Everyday! ❤️
                                  </p>
                                  <p>
                                    การสนับสนุนของคุณช่วยแบ่งเบาค่าเซิร์ฟเวอร์ ค่า API และเป็นแรงขับเคลื่อนที่ช่วยให้ผม (ฟุ้ย) ได้พัฒนาฟีเจอร์ใหม่ๆ ในทุกๆ วันครับ
                                  </p>
                                  <p>
                                    หากมีข้อแนะนำหรือฟีดแบ็กตรงไหน บอกผมได้เสมอเลยนะครับ ขอให้สนุกกับการพัฒนาตัวเองทุกวันครับ!
                                  </p>
                                  <p className="font-black text-white pt-1">
                                    รักและขอบคุณจากใจจริงครับ 🙏
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p>
                                    แอปนี้เป็นโปรเจกต์ที่ผมตั้งใจสร้างและโค้ดมันขึ้นมาด้วยตัวคนเดียว 100% เพราะผมเชื่อว่าทุกคนควรมีระบบช่วยออกแบบชีวิตที่ดี โดยไม่ต้องจ่ายค่าโค้ชราคาแพง
                                  </p>
                                  <p>
                                    เงิน <span className="text-amber-300 font-black">149 บาท/เดือน</span> หรือ <span className="text-amber-300 font-black">990 บาท/ปี</span> ของคุณ ไม่ได้เป็นแค่ค่าฟีเจอร์โปร แต่มันคือ <span className="text-emerald-300 font-black">&apos;แรงใจและความเชื่อที่มีตัวตน&apos;</span> ที่ช่วยสนับสนุนให้นักพัฒนาตัวเล็ก ๆ คนนี้ ได้มีทุนพัฒนาฟีเจอร์ใหม่ ๆ และพัฒนาให้แอปนี้ดีขึ้นเพื่อคุณต่อไปครับ
                                  </p>
                                  <p className="font-black text-white pt-1">
                                    ขอบคุณจากใจจริงครับ 🙏
                                  </p>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowLetter(false)}
                      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 ${
                        userData?.isFoundingMember
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] text-slate-950 font-black"
                          : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] text-white"
                      }`}
                    >
                      {!isProMember 
                        ? "ขอบคุณครับ" 
                        : (viewMode === "letter" ? "ยินดีที่ได้รู้จักนะครับ :)" : "ปิดใบรับรอง")}
                    </button>
                  </motion.div>
                ) : isProMember ? (
                  <>
                    <h3 className="text-3xl font-black leading-tight text-white">
                      คุณเป็น PRO แล้ว
                      <span className="block bg-gradient-to-r from-amber-300 via-orange-400 to-pink-300 bg-clip-text text-transparent">
                        ขอบคุณที่สนับสนุนครับ
                      </span>
                    </h3>
                    <p className="mx-auto mt-3 max-w-[320px] text-[12px] font-bold leading-relaxed text-slate-400">
                      ใช้งาน AI Mentor, ปรับ Quest และ Focus Room Lounge ได้เต็มตามสิทธิ์ PRO แล้วครับ
                    </p>

                    {userData?.isFoundingMember ? (
                      <button
                        type="button"
                        onClick={() => { setViewMode("cert"); setShowLetter(true); }}
                        className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all border-amber-400/30 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10"
                      >
                        <Crown size={12} className="text-amber-400" />
                        ใบรับรอง PRO
                      </button>
                    ) : (
                      <div className="flex justify-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => { setViewMode("cert"); setShowLetter(true); }}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all border-violet-400/20 bg-violet-400/5 text-violet-300 hover:bg-violet-400/10"
                        >
                          <Sparkles size={12} className="text-violet-400" />
                          ใบรับรองสมาชิก PRO
                        </button>
                        <button
                          type="button"
                          onClick={() => { setViewMode("letter"); setShowLetter(true); }}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all border-slate-700 bg-white/5 text-slate-300 hover:bg-white/10"
                        >
                          <Mail size={12} className="text-slate-400" />
                          จดหมายจากผู้พัฒนา
                        </button>
                      </div>
                    )}

                    <div className="mt-6 rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-br from-amber-300/14 via-white/[0.04] to-orange-500/10 p-5 text-left shadow-[0_24px_70px_rgba(245,158,11,0.10)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Current Plan</p>
                          <p className="mt-1 text-2xl font-black text-white">
                            {userData?.subscriptionPlan === "lifetime" ? "Lifetime" : "Pro Member"}
                          </p>
                          {userData?.cancelAtPeriodEnd && userData?.currentPeriodEnd && (
                            <p className="text-[10px] font-bold text-rose-300 mt-1.5 leading-relaxed">
                              จะสิ้นสุดการใช้งานวันที่ {getFormattedEndDate()}
                            </p>
                          )}
                        </div>
                        {userData?.cancelAtPeriodEnd ? (
                          <span className="rounded-full border border-rose-300/30 bg-rose-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-rose-200">
                            Canceled
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-4 space-y-2 text-[11px] font-bold leading-relaxed text-slate-300">
                        <div className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-300" /> คุยกับพี่ฟุ้ย แบบ Pro Fair Use</div>
                        <div className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-300" /> ปรับ Quest วันนี้กับพี่ฟุ้ย</div>
                        <div className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-300" /> Focus Room Lounge ห้องโฟกัสรวม</div>
                        <div className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-300" /> บทความพิเศษจากพี่ฟุ้ย</div>
                        {(userData?.subscriptionPlan === "yearly" ||
                          userData?.subscriptionPlan === "founding_yearly" ||
                          userData?.subscriptionPlan === "lifetime" ||
                          userData?.isLifetimeMember) && (
                          <div className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-300" /> ฟรี E-Book สร้างก่อนพร้อม</div>
                        )}
                      </div>
                    </div>

                    {userData?.subscriptionPlan !== "lifetime" && (
                      <button
                        type="button"
                        onClick={handleMembershipPortal}
                        disabled={isRedirecting}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/[0.1] active:scale-95 disabled:opacity-60"
                      >
                        {isRedirecting ? "กำลังเปิดหน้าจัดการ..." : "จัดการ / ยกเลิกสมาชิก"}
                        <ChevronRight size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowMembershipModal(false)}
                      className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
                    >
                      กลับไปใช้งาน
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-black leading-tight text-white">
                      โตต่อแบบ Pro
                      <span className="block bg-gradient-to-r from-amber-300 via-orange-400 to-pink-300 bg-clip-text text-transparent">
                        แต่ยังใช้ Free ต่อได้
                      </span>
                    </h3>
                    <p className="mx-auto mt-3 max-w-[320px] text-[12px] font-bold leading-relaxed text-slate-400">
                      ค่าสมาชิกช่วยจ่ายต้นทุน AI และเซิร์ฟเวอร์จริง เพื่อให้ฟุ้ยพัฒนา Upskill Everyday ต่อได้ทุกเดือนครับ
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowLetter(true)}
                      className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all ${
                        userData?.isFoundingMember
                          ? "border-amber-400/30 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10"
                          : "border-violet-400/20 bg-violet-400/5 text-violet-300 hover:bg-violet-400/10"
                      }`}
                    >
                      {userData?.isFoundingMember ? (
                        <>
                          <Crown size={12} className="text-amber-400" />
                          ใบรับรอง PRO
                        </>
                      ) : (
                        <>
                          <Mail size={12} className="animate-pulse" />
                          อ่านจดหมายจากผู้พัฒนา
                        </>
                      )}
                    </button>

                <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Free</p>
                    <p className="mt-1 text-2xl font-black text-white">฿0</p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-slate-400">เก่งขึ้นได้ทุกวัน ไม่มีค่าใช้จ่าย</p>
                    <ul className="mt-3 space-y-2 text-[11px] font-bold leading-relaxed text-slate-300">
                      <li>Dashboard และ Bento Grid หลัก</li>
                      <li>Daily Quest และสะสม XP</li>
                      <li>อ่าน Library ทั่วไป</li>
                      <li>คุยกับพี่ฟุ้ย 3 ข้อความ/วัน</li>
                      <li>สร้างคำคมสัดสัด 1 คำคม/วัน</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.5rem] border border-amber-300/40 bg-gradient-to-br from-amber-300/16 to-orange-500/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">Pro</p>
                    <p className="mt-1 text-2xl font-black text-white">เริ่ม ฿149</p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-amber-100/80">ปลดล็อกพลังเต็มรูปแบบ</p>
                    <ul className="mt-3 space-y-2 text-[11px] font-bold leading-relaxed text-white">
                      <li>คุยกับพี่ฟุ้ย แบบ Pro Fair Use</li>
                      <li>ปรับ Quest วันนี้กับพี่ฟุ้ย</li>
                      <li>Focus Room Lounge ห้องโฟกัสรวม</li>
                      <li>บทความพิเศษจากพี่ฟุ้ย</li>
                      <li>ฟรี E-Book สร้างก่อนพร้อม (เฉพาะรายปี & Lifetime)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    { id: "monthly" as ProPlan, label: "PRO รายเดือน", price: "฿149", period: "/ เดือน", sub: "บัตรเครดิต/เดบิต · ยกเลิกได้ทุกเมื่อ" },
                    { id: "yearly" as ProPlan, label: "PRO รายปี", price: "฿990", period: "/ ปี", sub: "🔥 ประหยัด 50% · PromptPay" },
                    { id: "lifetime" as ProPlan, label: "LIFETIME", price: "฿2,490", period: "จ่ายครั้งเดียวจบ", sub: "👑 คุ้มที่สุดตลอดชีพ · PromptPay" },
                  ].map((plan) => {
                    const isSelected = billingPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setBillingPlan(plan.id)}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-amber-300 bg-gradient-to-br from-amber-300 via-orange-400 to-orange-500 text-slate-950 shadow-[0_15px_30px_-15px_rgba(245,158,11,0.8)]"
                            : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                        } ${plan.id === "lifetime" ? "col-span-2" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`block text-[9px] font-black uppercase tracking-[0.2em] ${isSelected ? "text-slate-900" : "text-slate-400"}`}>{plan.label}</span>
                          {plan.id === "yearly" && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${isSelected ? "bg-slate-950 text-amber-300" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>SAVE 50%</span>
                          )}
                          {plan.id === "lifetime" && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${isSelected ? "bg-slate-950 text-emerald-300" : "bg-emerald-500/20 text-emerald-300 border border-emerald-300/30"}`}>คุ้มที่สุด</span>
                          )}
                        </div>
                        <span className="mt-1.5 block text-2xl font-black leading-none">
                          {plan.price}
                          <span className={`text-[10px] font-bold ml-1 ${isSelected ? "text-slate-900" : "text-slate-500"}`}>{plan.period}</span>
                        </span>
                        <span className={`block text-[9px] font-black mt-1 ${isSelected ? "text-slate-950/80" : "text-slate-550"}`}>{plan.sub}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-center text-[9px] font-bold text-slate-500">
                  * ชำระเงินผ่านระบบ Stripe ปลอดภัยมาตรฐานสากล (รองรับ PromptPay ในแผนรายปี & Lifetime)
                </p>

                <button
                  type="button"
                  onClick={() => handleMembershipCheckout()}
                  disabled={isRedirecting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 py-4 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_18px_40px_-18px_rgba(245,158,11,0.9)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                >
                  {isRedirecting ? "กำลังพาไป Stripe..." : "สนับสนุนและไปต่อ"}
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMembershipModal(false)}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
                >
                  ใช้ Free ต่อ
                </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎫 Modal: Line OA Instruction */}
      <AnimatePresence>
        {showLineModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowLineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 shadow-2xl max-w-sm w-full border-[6px] border-indigo-50 relative overflow-hidden text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🎉 Decor */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3">
                <Ticket size={40} className="-rotate-12" />
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-2">ปลดล็อกสิทธิ์สำเร็จ! 🔥</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                ก้าวสุดท้ายเพื่อรับส่วนลด Exclusive <br />
                ให้คุณกดปุ่มด้านล่างเพื่อไปที่ Line OA <br />
                แล้วพิมพ์คำว่า...
              </p>

              {/* 📋 โค้ดลับ */}
              <div className="bg-slate-900 rounded-2xl p-6 mb-8 relative group">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2">Message Code</span>
                <span className="text-4xl font-black text-white tracking-widest group-hover:scale-110 transition-transform block">
                  LVL5
                </span>
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-1 rounded-lg">
                  COPY CODE
                </div>
              </div>

              <Link
                href="https://lin.ee/rQawKUM"
                target="_blank"
                onClick={() => setShowLineModal(false)}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                ไปที่ Line OA เพื่อรับสิทธิ์
                <ChevronRight size={18} />
              </Link>

              <button
                onClick={() => setShowLineModal(false)}
                className="mt-4 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                ไว้กดทีหลัง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ✨ Center Screen Inspirational Popup (Premium Version) */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowSuccessToast(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, rotate: -2 }}
              animate={{
                scale: 1, y: 0, rotate: 0,
                transition: { type: "spring", bounce: 0.5, duration: 0.6 }
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-sm w-full bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🌈 แสงฟุ้งจางๆ (Soft Glow) ด้านหลัง */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-rose-400/20 via-orange-400/20 to-amber-400/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-blue-400/10 via-emerald-400/10 to-teal-400/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Icon ที่มีเงาสะท้อนสวยๆ */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] rotate-3">
                  <Sparkles size={32} className="text-white fill-current animate-pulse" />
                </div>

                <div className="space-y-2">
                  {formatInspirationalText(showSuccessToast)}
                </div>

                {/* แถบสีรุ้งจางๆ ปิดท้าย (Progress Indicator หลอกๆ) */}
                <div className="mt-10 flex justify-center gap-1 opacity-30">
                  <div className="h-1 w-12 bg-rose-400 rounded-full" />
                  <div className="h-1 w-1 bg-orange-400 rounded-full" />
                  <div className="h-1 w-1 bg-amber-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 👑 PRO Upgrade Success Welcome Modal */}
      <AnimatePresence>
        {showProSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl"
            onClick={() => setShowProSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{
                scale: 1, y: 0,
                transition: { type: "spring", bounce: 0.35, duration: 0.7 }
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-white/90 border border-amber-200/50 p-8 rounded-[3rem] text-center overflow-hidden shadow-[0_40px_80px_rgba(245,158,11,0.15)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative premium glows */}
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-amber-200/20 via-orange-300/10 to-pink-300/15 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tr from-violet-200/10 via-indigo-200/15 to-cyan-200/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Crown / Sparkle badge */}
                <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-pink-500 p-[1.5px] shadow-[0_15px_35px_rgba(245,158,11,0.2)] animate-pulse">
                  <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                    <Crown size={38} className="text-amber-500 fill-amber-500/10" />
                  </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Upgrade Successful</p>
                <h3 className="mt-2 text-3xl font-black text-slate-900 leading-tight">
                  ยินดีต้อนรับสู่
                  <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    PRO MEMBER
                  </span>
                </h3>

                <p className="mt-4 text-[12px] font-bold text-slate-500 max-w-[300px] mx-auto leading-relaxed">
                  ขอบคุณมากๆ ครับที่สนับสนุนการเดินทางของแอปนี้ คุณได้ปลดล็อกขุมพลังการเติบโตอย่างไร้ขีดจำกัดแล้ว!
                </p>

                {/* Features list */}
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-left space-y-3 shadow-inner">
                  <div className="flex gap-3 text-xs font-bold text-slate-700">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>คุยกับพี่ฟุ้ยยาวต่อเนื่อง ไร้ข้อจำกัด</span>
                  </div>
                  <div className="flex gap-3 text-xs font-bold text-slate-700">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>สิทธิ์ปรับแต่ง Quest ออกแบบชีวิตกับพี่ฟุ้ย</span>
                  </div>
                  <div className="flex gap-3 text-xs font-bold text-slate-700">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>เข้า Focus Room Lounge ร่วมโฟกัสกับคอมมูนิตี้</span>
                  </div>
                  <div className="flex gap-3 text-xs font-bold text-slate-700">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>คลังบทความสรุปและบทเรียนชีวิตพรีเมียม</span>
                  </div>
                  {/* Show ebook perk conditionally if they got Yearly/Lifetime */}
                  {(userData?.subscriptionPlan === "yearly" ||
                    userData?.subscriptionPlan === "founding_yearly" ||
                    userData?.subscriptionPlan === "lifetime" ||
                    userData?.isLifetimeMember) && (
                    <div className="flex gap-3 text-xs font-bold text-slate-700">
                      <span className="text-emerald-500 font-extrabold">✓</span>
                      <span>ฟรี E-Book “สร้างก่อนพร้อม” ดาวน์โหลดได้ทันที</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowProSuccessModal(false)}
                  className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_15px_30px_-5px_rgba(245,158,11,0.3)] transition-all hover:brightness-105 active:scale-95 hover:-translate-y-0.5"
                >
                  เริ่มยกระดับชีวิตวันนี้เลย ⚡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLevelInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 1. ลดความแรงของ blur หรือเอาออกบน mobile (ใช้แค่ bg-slate-950/90)
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-sm sm:backdrop-blur-xl"
            onClick={() => setShowLevelInfo(false)}
          >
            <motion.div
              // 2. ใช้ transform-gpu และลดความซับซ้อนของการเคลื่อนไหว
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }} // ใช้ easeOut จะรู้สึกลื่นกว่าบนมือถือ

              // 3. ใส่ transform-gpu เพื่อใช้ GPU ช่วยเรนเดอร์
              className="relative w-full max-w-[350px] md:max-w-md bg-[#0f172a] border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl text-left overflow-hidden max-h-[90vh] flex flex-col transform-gpu"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 4. ปิด Glow Effect บนมือถือถ้ายังกระตุกอยู่ หรือทำให้จางลง */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h4 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400 fill-current" />
                    Level System
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Level การอัพสกิลของคุณ</p>
                </div>
                <button
                  onClick={() => setShowLevelInfo(false)}
                  className="p-2.5 bg-white/5 active:scale-90 text-slate-400 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content - เพิ่ม -webkit-overflow-scrolling เพื่อความลื่นในการไถมือถือ */}
              <div className="overflow-y-auto custom-scrollbar pr-1 flex-1 [WebkitOverflowScrolling:touch]">
                <p className="text-[14px] text-slate-400 mb-6 leading-relaxed">
                  สะสมทุกๆ <span className="text-yellow-400 font-black">100 XP</span> เพื่ออัพ Level และปลดล็อก Feature ใหม่ๆ
                </p>

                <div className="grid grid-cols-1 gap-3 mb-8">
                  {[
                    { lv: "1-9", title: "Rookie Upskiller", color: "bg-cyan-500", glowColor: "bg-cyan-400", desc: "ผู้เริ่มต้น", textTheme: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
                    { lv: "10-19", title: "Habit Master", color: "bg-yellow-500", glowColor: "bg-yellow-400", desc: "เซียนระบบสร้างนิสัย", textTheme: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
                    { lv: "20-29", title: "Life Architect", color: "bg-purple-500", glowColor: "bg-purple-400", desc: "สถาปนิกออกแบบชีวิต", textTheme: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
                    { lv: "30+", title: "Legacy Shaper", color: "bg-rose-500", glowColor: "bg-rose-400", desc: "ผู้จารึกตำนาน", textTheme: "text-rose-400 border-rose-500/20 bg-rose-500/5" }
                  ].map((item, i) => {
                    const isHabitMaster = item.title === "Habit Master";
                    return (
                      <div key={i} className="flex flex-col bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.15)] relative overflow-hidden">
                        <div className="flex items-center justify-between w-full relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.glowColor}`} />
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${item.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[13px] font-black text-white block leading-none">{item.title}</span>
                                {isHabitMaster && (
                                  <button
                                    onClick={() => setShowTeaser(!showTeaser)}
                                    className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-black rounded-full hover:bg-yellow-500/30 transition-all cursor-pointer select-none border border-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.1)] active:scale-95"
                                  >
                                    {showTeaser ? "ปิด ✕" : "ดูฟีเจอร์ปลดล็อก"}
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1.5">{item.desc}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black border px-2.5 py-1 rounded-xl shrink-0 ${item.textTheme}`}>LV {item.lv}</span>
                        </div>

                        {isHabitMaster && showTeaser && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: -2 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 font-mono text-[10px] text-yellow-400 bg-gradient-to-r from-yellow-500/[0.03] to-amber-500/[0.07] border border-dashed border-yellow-500/30 p-3.5 rounded-xl leading-relaxed shadow-[0_0_15px_rgba(234,179,8,0.05)] relative overflow-hidden z-10"
                          >
                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500/10 text-yellow-400/70 text-[7px] font-black rounded-bl border-l border-b border-yellow-500/20 uppercase tracking-widest">
                              LV.10 UNLOCK
                            </div>
                            
                            <div className="text-yellow-450 font-black tracking-wider uppercase mb-2 flex items-center gap-1">
                              <span>⚡</span>
                              <span>สิ่งที่ได้รับใน Tab ตัวตน //</span>
                            </div>
                            
                            <div className="space-y-1.5 font-sans font-medium text-slate-350">
                              <p className="flex items-start gap-1">
                                <span className="text-yellow-400 font-bold shrink-0">▸</span>
                                <span><strong className="text-white font-bold">คลังออมมีสติ:</strong> ในการบันทึกรายจ่าย</span>
                              </p>
                              <p className="flex items-start gap-1">
                                <span className="text-yellow-400 font-bold shrink-0">▸</span>
                                <span><strong className="text-white font-bold">Book Shelf:</strong> ในการบันทึกหนังสือที่อ่านจบแล้วหรือสนใจ</span>
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 🔥 Streak Reward Section */}
                <div className="mb-4">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Streak Reward (ออร่าแห่งวินัย)</h5>
                  <div className="space-y-2">
                    {[
                      { day: "7 Days", title: "ออร่าประกายวินัย (Blue)", color: "text-blue-400", desc: "ปลดล็อกออร่าสีฟ้าแห่งการเริ่มต้น" },
                      { day: "14 Days", title: "รัศมีจอมทัพวินัยเหล็ก (Purple)", color: "text-purple-400", desc: "ปลดล็อกออร่าสีม่วงแห่งความแกร่ง" },
                      { day: "30 Days", title: "มหาเพลิงสุริยะตำนาน (Fire)", color: "text-orange-400", desc: "ปลดล็อกออร่าไฟ + ละอองแสงระดับเทพ" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] ${item.color} border border-white/10`}>
                          {item.day.split(' ')[0]}D
                        </div>
                        <div>
                          <span className={`text-[12px] font-black ${item.color} block leading-none mb-1 uppercase tracking-wide`}>{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-800/50 p-5 rounded-3xl border border-white/10 flex justify-between items-center shrink-0 mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total Progress</span>
                  <span className="text-xs font-bold text-white">แต้มสะสมทั้งหมด</span>
                </div>
                <div className="bg-yellow-400 text-slate-950 px-4 py-2 rounded-xl font-black text-lg">
                  {totalXP} <span className="text-xs opacity-70">XP</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 Mobile Bottom Navigation was removed to use the global BottomNavigation component */}

      <AnimatePresence>
        {showStreakSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed left-0 right-0 top-6 z-[100001] mx-auto w-fit max-w-[calc(100%-2rem)]"
          >
            <div className="flex items-center gap-3 rounded-full border border-amber-500/30 bg-slate-950/95 px-5 py-3 text-white shadow-[0_15px_40px_rgba(245,158,11,0.2)] backdrop-blur-xl">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-xs">
                👤
              </div>
              <p className="text-xs font-black tracking-wide">บันทึก Streak ไว้ในแท็บ Avatar แล้ว</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completedToastText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed left-0 right-0 top-6 z-[100001] mx-auto w-fit max-w-[calc(100%-2rem)]"
          >
            <div className={`flex items-center gap-3 rounded-full border bg-slate-950/95 px-5 py-3 text-white backdrop-blur-xl ${toastStyle.border} ${toastStyle.shadow}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs border ${toastStyle.bgEmoji}`}>
                {toastStyle.emoji}
              </div>
              <p className="text-xs font-black tracking-wide">{completedToastText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 Modal: ฉลองความสำเร็จรายวัน (Daily Success Celebration) */}
      <AnimatePresence>
        {showDailySuccess && !showLevelUp && !showPerfectWeekModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto"
          >
            {/* ✨ Celebration Background Sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{
                    y: [0, 800],
                    opacity: [0, 1, 0],
                    x: Math.random() * 1000 - 500
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm flex flex-col items-center"
            >
              {/* 🎫 The Shareable Card */}
              <div
                id="daily-success-card"
                className={`w-full aspect-[4/5] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 rounded-[3rem] border-2 border-white/20 overflow-hidden relative flex flex-col items-center p-8 shadow-2xl ${isCapturing ? '' : 'shadow-slate-500/20'}`}
              >
                {/* 🥈 Metallic Shimmer Overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
                  />
                  {/* Glossy top-left highlight */}
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center h-full">
                  <div className="mt-2 mb-4 text-center relative z-10">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] mb-1 block">Daily Goal Achieved</span>
                    <h3 className="text-xl font-black text-white tracking-tight">ยินดีด้วย ! คุณทำสำเร็จแล้ว</h3>
                  </div>

                  {/* 🏆 Rank & Streak Section (New Layout) */}
                  <div className="flex flex-col items-center gap-2 mb-4 relative z-10">
                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black flex items-center gap-2 ${rankInfo.bg} ${rankInfo.border} ${rankInfo.color} shadow-lg shadow-black/20 whitespace-nowrap`}>
                      <span className="shrink-0">{rankInfo.emoji}</span>
                      <span className="uppercase tracking-widest shrink-0">{rankInfo.name} RANK</span>
                    </div>
                    <div className="bg-orange-500 text-white px-6 py-1.5 rounded-xl font-black text-[10px] shadow-lg border border-orange-400 whitespace-nowrap">
                      🔥 {streakCount} DAYS STREAK!
                    </div>

                    {/* 💬 Inspirational Quote */}
                    <div className="mt-1 px-6 text-center w-full min-h-[44px] flex flex-col items-center justify-center">
                      <p className="text-[11px] font-bold text-slate-300 italic leading-snug">
                        "{currentSuccessQuote.split(' - ')[0]}"
                      </p>
                      {currentSuccessQuote.includes(' - ') && (
                        <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] mt-1 opacity-80">
                          — {currentSuccessQuote.split(' - ')[1]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 👤 Large Avatar - ปรับสเกลให้ยืดหยุ่นตามหน้าจอ */}
                  <div className="relative mb-0 flex flex-col items-center flex-1 justify-start pt-0">
                    <div className="relative z-0 scale-[1.0] sm:scale-[1.15] origin-bottom -translate-y-5">
                      <AvatarDisplay currentLevel={currentLevel} gender={gender} streak={streakCount} isCompact={true} />
                    </div>
                  </div>

                  {/* 🧬 Identity Row (Level + Personality) */}
                  <div className="mb-4 flex flex-wrap justify-center gap-2 px-6 relative z-10">
                    {/* 🥇 Solid Level Badge */}
                    <div className="px-4 py-2 bg-yellow-400 border border-yellow-500 rounded-2xl flex items-center gap-2 shadow-lg shadow-yellow-500/20">
                      <Trophy size={12} className="text-slate-900 fill-current" />
                      <span className="text-[11px] font-black text-slate-950 uppercase">LEVEL {currentLevel}</span>
                    </div>

                    {lastDisc && (
                      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                        <Zap size={10} className="text-blue-400" />
                        <span className="text-[9px] font-black text-blue-300 uppercase">{DISC_DATA[(lastDisc.finalResult || lastDisc.result || "C").charAt(0)]?.rpgTitle}</span>
                      </div>
                    )}

                    {lastMoney && (
                      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                        <Star size={10} className="text-amber-400 fill-current" />
                        <span className="text-[9px] font-black text-amber-300 uppercase">{MONEY_DATA[lastMoney.resultKey]?.title}</span>
                      </div>
                    )}
                  </div>
                  {/* 🎯 Next Milestone Indicator */}
                  <div className="mb-6 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {streakCount < 7 ? `${7 - streakCount} DAYS TO BLUE AURA` :
                        streakCount < 14 ? `${14 - streakCount} DAYS TO PURPLE AURA` :
                          streakCount < 30 ? `${30 - streakCount} DAYS TO FIRE AURA` :
                            'LEGENDARY AURA UNLOCKED!'}
                    </span>
                  </div>


                  <div className="flex items-center gap-3 opacity-20">
                    <div className="h-px w-6 bg-white" />
                    <span className="text-[7px] font-black text-white uppercase tracking-[0.3em]">Upskill Everyday</span>
                    <div className="h-px w-6 bg-white" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 w-full flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const { domToPng } = await import("modern-screenshot");
                    const cardElement = document.getElementById("daily-success-card");
                    if (!cardElement) return;
                    try {
                      setIsCapturing(true);
                      await new Promise(r => setTimeout(r, 150));
                      await document.fonts.ready;
                      const dataUrl = await domToPng(cardElement, {
                        quality: 1,
                        scale: 3,
                        backgroundColor: '#0f172a',
                        style: { borderRadius: '3rem' },
                        features: { removeControlCharacter: true }
                      });
                      const link = document.createElement("a");
                      link.href = dataUrl;
                      link.download = `daily-success-${streakCount}days.png`;
                      link.click();
                    } catch (err) { console.error(err); }
                    finally { setIsCapturing(false); }
                  }}
                  className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-orange-400 transition-all active:scale-95 text-xs tracking-widest uppercase"
                >
                  <Download size={18} /> Download Success Card
                </button>
                <button
                  onClick={() => setShowDailySuccess(false)}
                  className="w-full py-4 bg-white/5 text-white/50 font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-[10px] tracking-widest uppercase"
                >
                  Continue Journey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 Modal: Welcome Quote Invitation (Premium Purple Redesign) */}
      <AnimatePresence>
        {showWelcomeQuotePopup && !showLevelUp && !showPerfectWeekModal && !showDailySuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100001] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => setShowWelcomeQuotePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{
                scale: 1, y: 0, opacity: 1,
                transition: { type: "spring", damping: 20, stiffness: 200 }
              }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative max-w-sm w-full bg-slate-900 rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/10 text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✨ Premium Purple Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/30 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* 🎨 Icon Section (Floating Purple Glass) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/20 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Quote size={52} className="text-indigo-600 fill-indigo-500/10 -rotate-6" />

                  {/* Floating +10 XP Badge (Purple) */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg border-2 border-white rotate-12">
                    +10 XP
                  </div>
                </motion.div>

                <h3 className="text-[28px] font-black text-white mb-4 leading-[1.2] tracking-tight">
                  เริ่มวันดีๆ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-rose-400">
                    ด้วยคำคมกันเถอะ
                  </span> ✨
                </h3>

                <p className="text-slate-400 text-[14px] font-medium mb-10 leading-relaxed px-4 opacity-80">
                  สุ่มคำคมที่ทัชใจวันนี้ <br />
                  เพื่อปลดล็อกพลังงานบวกของคุณ
                </p>

                <div className="space-y-4">
                  <Link
                    href="/tools/khomsatsat"
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 group text-sm tracking-widest uppercase"
                  >
                    ไปที่แอปคมสัดสัด
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={() => setShowWelcomeQuotePopup(false)}
                    className="w-full py-4 text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors"
                  >
                    ไว้ก่อนนะ
                  </button>
                </div>

                {/* ✨ Bottom Decor */}
                <div className="mt-10 flex justify-center gap-1.5">
                  <div className="h-1 w-8 bg-indigo-500/30 rounded-full" />
                  <div className="h-1 w-1 bg-indigo-500/30 rounded-full" />
                  <div className="h-1 w-1 bg-indigo-500/30 rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡️ Modal: Daily Quest Energy Level Selector Explanation */}
      <AnimatePresence>
        {showQuestEnergyPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100001] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => {
              localStorage.setItem("hasSeenQuestEnergyPopup", "true");
              setShowQuestEnergyPopup(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{
                scale: 1, y: 0, opacity: 1,
                transition: { type: "spring", damping: 20, stiffness: 200 }
              }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative max-w-sm w-full bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/10 text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Border Line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-orange-500 to-rose-500" />
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-650/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-650/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Icon Section (Floating Battery/Zap/Flame mix) */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-slate-800 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10 relative group"
                >
                  <Zap size={44} className="text-orange-400 fill-orange-400/20 -rotate-12 animate-pulse" />
                </motion.div>

                <h3 className="text-2xl font-black text-white mb-3 leading-[1.2] tracking-tight">
                  เลือกภารกิจตาม <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-orange-400 to-rose-400">
                    ระดับพลังงานของคุณ
                  </span> ⚡️
                </h3>

                <p className="text-slate-400 text-xs md:text-sm font-medium mb-8 leading-relaxed px-2 opacity-95">
                  เหนื่อยล้าหรือพลังงานล้นวันนี้? <br />
                  สามารถปรับแต่งภารกิจประจำวันให้เหมาะกับสภาพร่างกายของคุณได้แล้วนะ!
                </p>

                {/* Energy Options Mock Display inside Popup */}
                <div className="space-y-2.5 mb-8 text-left bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Battery size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-200">พลังงานต่ำ (Low)</h4>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-md">10 XP</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">ก้าวเล็กๆ 2 นาที ทำได้ง่ายทันที</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shrink-0">
                      <Zap size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-200">พลังงานปกติ (Medium)</h4>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded-md">20 XP</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">ภารกิจสมดุล 5-10 นาที กำลังดี</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shrink-0">
                      <Flame size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-200">พลังงานสูง (High)</h4>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded-md">25 XP</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">เควสท้าทายลึกซึ้ง 15-30 นาที ได้รับแต้มสูงสุด</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Pro membership tip */}
                <p className="text-[10px] text-slate-400 font-medium mb-5 opacity-90 px-1">
                  {isProMember ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300 font-semibold">
                      ✨ สิทธิ์ PRO: ปรับแต่งเนื้อหาเควสผ่านการแชทกับพี่ฟุ้ย AI ได้ตลอดเวลา!
                    </span>
                  ) : (
                    <span>
                      💡 <strong className="text-slate-300">สมาชิก PRO</strong> จะปลดล็อกปุ่ม <strong>"ปรับ Quest"</strong> เพื่อคุยกับพี่ฟุ้ย AI ในการคัสตอมเนื้อหาเควสเองได้ด้วยนะ!
                    </span>
                  )}
                </p>

                <button
                  onClick={() => {
                    localStorage.setItem("hasSeenQuestEnergyPopup", "true");
                    setShowQuestEnergyPopup(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 text-xs tracking-widest uppercase"
                >
                  รับทราบ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay to close open Speed Dial FAB */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-transparent" 
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* 💬 Floating Speed Dial FAB (Chat / Note Selector) */}
      {isSoulGuideUnlocked ? (
        <div className="fixed bottom-[7.5rem] md:bottom-12 right-6 z-[150] flex flex-col items-end gap-3">
          <AnimatePresence>
            {isFabOpen && (
              <>
                {/* 1. ปุ่มจดโน้ตด่วน (บนสุด) */}
                <Link href="/second-brain?newNote=true" onClick={() => setIsFabOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="bg-white text-slate-800 text-[11px] font-black tracking-wider px-4 py-2 rounded-2xl border border-slate-200 shadow-md">
                      จดบันทึก 🧠
                    </span>
                    <div className="w-12 h-12 bg-white border border-slate-300 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <Pencil size={20} className="text-indigo-600" />
                    </div>
                  </motion.div>
                </Link>

                {/* 2. ปุ่มคุยกับพี่ฟุ้ย (ตรงกลาง) */}
                <Link href="/tools/soul-guide" onClick={() => setIsFabOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="bg-white text-slate-800 text-[11px] font-black tracking-wider px-4 py-2 rounded-2xl border border-slate-200 shadow-md">
                      คุยกับพี่ฟุ้ย 💬
                    </span>
                    <div className="w-12 h-12 bg-white border border-slate-300 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <MessageSquare size={20} className="text-indigo-600" />
                    </div>
                  </motion.div>
                </Link>
              </>
            )}
          </AnimatePresence>

          {/* ปุ่มหลัก (ล่างสุด) */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300 focus:outline-none transition-all duration-300 hover:border-indigo-500 hover:scale-105 active:scale-95 relative group"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full" />
            
            <AnimatePresence mode="wait">
              {isFabOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={26} className="text-slate-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex items-center justify-center"
                >
                  <MessageSquare size={26} className="text-indigo-600" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm">
                    <Zap size={10} className="text-indigo-500 fill-indigo-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      ) : (
        /* ปุ่มจดโน้ตอย่างเดียว กรณีที่ยังไม่ปลดล็อกแชทพี่ฟุ้ย */
        <div className="fixed bottom-[7.5rem] md:bottom-12 right-6 z-[150]">
          <Link href="/second-brain?newNote=true">
            <motion.div
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full" />
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300 overflow-hidden hover:border-indigo-500 transition-all duration-500">
                <Pencil size={26} className="text-indigo-600" />
              </div>
              <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <div className="bg-white/95 backdrop-blur-xl text-slate-900 text-[11px] font-bold tracking-wider px-5 py-3 rounded-[1.8rem] border-2 border-slate-100 shadow-2xl whitespace-nowrap">
                  จดบันทึก 🧠
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* 🎲 Modal: ยืนยันการสุ่มเควสใหม่ (Luxury Spring Style) */}
      <AnimatePresence>
        {showRerollConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: { type: "spring", damping: 20, stiffness: 300 }
              }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.2)] text-center overflow-hidden"
            >
              {/* ✨ แสงฟุ้งพื้นหลัง */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-end mb-2 -mt-4 -mr-4">
                  <button
                    onClick={() => setShowRerollConfirm(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                  <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full animate-pulse" />
                  <RotateCcw className="text-orange-500 relative z-10" size={32} />
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">สุ่มเควสใหม่? 🎲</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                  ใช้ <span className="text-orange-600 font-black">5 XP</span> เพื่อเปลี่ยนเควส (ยกเว้น Wheel)<br />คุณสุ่มใหม่ได้อีกเพียง <span className="text-slate-800 font-black">1 ครั้ง</span> ในวันนี้ครับ
                </p>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
                    const hasRerolled = lastRerollDate === today;
                    const hasNotEnoughXP = totalXP < 5;
                    const noQuestsLeft = !canReroll;

                    if (hasRerolled) {
                      return (
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-500 text-xs font-bold leading-relaxed border border-slate-100">
                          วันนี้คุณใช้สิทธิ์สุ่มใหม่ไปแล้วครับ <br />(จำกัด 1 ครั้ง/วัน)
                        </div>
                      );
                    }

                    if (noQuestsLeft) {
                      return (
                        <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 text-xs font-bold leading-relaxed border border-amber-100">
                          ไม่เหลือเควสที่สามารถสุ่มใหม่ได้แล้วครับ <br />(ยกเว้น Wheel)
                        </div>
                      );
                    }

                    return (
                      <>
                        <button
                          onClick={handleRerollQuests}
                          disabled={hasNotEnoughXP}
                          className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${hasNotEnoughXP
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'
                            }`}
                        >
                          {hasNotEnoughXP ? "XP ไม่เพียงพอ (ใช้ 5 XP)" : "ยืนยัน (จ่าย 5 XP)"}
                        </button>
                      </>
                    );
                  })()}
                  <button
                    onClick={() => setShowRerollConfirm(false)}
                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎓 Premium Onboarding Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden z-10 flex flex-col items-center text-center"
            >
              {/* Premium Background Orbs */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Skip Button */}
              <button
                onClick={finishTutorial}
                className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur border border-slate-100 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-all z-20"
              >
                ข้ามการแนะนำ
              </button>

              {tutorialStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-[2rem] flex items-center justify-center shadow-inner mb-6 relative">
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-red-200/50" />
                    <img loading="lazy" decoding="async" src="/logo-invert.png" alt="Upskill Lightbulb" className="w-16 h-16 object-contain drop-shadow-md" />
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ยินดีต้อนรับสู่<br /><span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Upskill Everyday</span></h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2 font-medium">
                    พื้นที่ส่วนตัวสำหรับพัฒนาตัวเอง<br />ให้เก่งขึ้นและเป็นเวอร์ชันที่ดีกว่าในทุกๆ วัน
                  </p>
                </motion.div>
              )}

              {tutorialStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="grid w-full grid-cols-3 gap-2 mb-5">
                    {[
                      { src: "/Phase1.png", label: "Phase 1", title: "ค้นหาตัวตน" },
                      { src: "/Phase2.png", label: "Phase 2", title: "สุขระหว่างทาง" },
                      { src: "/Phase3.png", label: "Phase 3", title: "ระลึกความตาย" },
                    ].map((phase) => (
                      <div key={phase.label} className="relative h-24 overflow-hidden rounded-2xl border border-white/80 bg-slate-100 shadow-sm">
                        <img
                          src={phase.src}
                          alt={phase.label}
                          className="h-full w-full object-cover object-center scale-[1.3] -translate-y-1 transition-all duration-300 hover:scale-[1.4] hover:-translate-y-1.5"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-white/10" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-[7px] font-black uppercase tracking-[0.16em] text-white/75 drop-shadow">{phase.label}</p>
                          <p className="text-[9px] font-black leading-tight text-white drop-shadow">{phase.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">เดินทางผ่าน <span className="text-orange-500">3 Phase</span></h3>
                  <div className="bg-orange-50/80 border border-orange-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      เส้นทางสั้นๆ ที่จะพาคุณสำรวจตัวเอง ออกไปใช้ชีวิต และกลับมาจัดใจให้ชัดขึ้น<br />
                      <span className="text-[11px] text-orange-800 mt-2 block font-bold bg-orange-100/60 p-2 rounded-lg">
                        ทำทีละ Phase แล้วระบบจะค่อยๆ ปลดล็อกพื้นที่ใหม่ให้เอง
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {tutorialStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-orange-500/30 mb-6">
                    🎯
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ทำภารกิจ <span className="text-orange-500">& อัปเลเวล</span></h3>
                  <div className="bg-orange-50/80 border border-orange-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      เข้ามาเช็กอินที่แท็บ <span className="font-bold text-orange-600">"ภารกิจ"</span> ทุกวัน<br />
                      เพื่อสะสม XP อัปเลเวล ปลดล็อกความสำเร็จ<br />
                      <span className="text-[11px] text-slate-500 mt-1 block">และรักษาสถิติต่อเนื่อง (Streak) ของคุณ!</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {tutorialStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center mt-4 z-10 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30 mb-6 relative">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                    🧠
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 mb-3 leading-tight">ศูนย์รวม <span className="text-purple-600">"อัพสกิล"</span></h3>
                  <div className="bg-purple-50/80 border border-purple-100 p-4 rounded-2xl w-full">
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      แวะไปที่แท็บ <span className="font-bold text-purple-700">"อัพสกิล"</span><br />
                      เพื่ออ่านคลังสมอง ใช้ Focus Room และเติม <strong>ความสุขระหว่างทาง</strong><br />
                      <span className="text-[11px] text-slate-500 mt-1 block">พร้อมคุยกับ <strong>พี่ฟุ้ย</strong> ที่เข้าใจคุณที่สุด!</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Premium Progress Dots */}
              <div className="flex gap-2 my-6 z-10">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === tutorialStep ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500 shadow-sm' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>

              {/* Premium Action Button */}
              <button
                onClick={() => {
                  if (tutorialStep < 4) setTutorialStep(prev => prev + 1);
                  else finishTutorial();
                }}
                className={`w-full py-4 rounded-2xl font-black text-[15px] transition-all duration-300 z-10 shadow-[0_8px_20px_rgba(0,0,0,0.1)] active:scale-95 ${tutorialStep === 4
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
              >
                {tutorialStep < 4 ? 'ถัดไป' : 'เข้าใจแล้ว ลุยเลย! 🚀'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 🎯 Modal กติกา Wheel Plan */}
      <AnimatePresence>
        {showWheelRulesModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowWheelRulesModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-tr-full -z-10" />

              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
                <PieChart size={24} />
              </div>

              {wheelPlanTarget === 7 ? (
                <>
                  <h3 className="text-xl font-black text-slate-800 mb-2">กติกาแผน 7 วัน <br /><span className="text-orange-500">Wheel of Life</span></h3>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    ทำภารกิจรายวันที่ AI วิเคราะห์ให้ต่อเนื่อง 7 วัน เพื่อรับโบนัสสุดคุ้มตอนจบแผน!
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="text-2xl drop-shadow-sm">🏆</div>
                      <div>
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Perfect Run (7/7 วัน)</div>
                        <div className="text-sm font-black text-amber-600">รับ 100 XP</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-2xl drop-shadow-sm">🌟</div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Great Run (5-6 วัน)</div>
                        <div className="text-sm font-black text-slate-700">รับโบนัส 50 XP</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-2xl drop-shadow-sm">👍</div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Good Run (1-4 วัน)</div>
                        <div className="text-sm font-black text-slate-700">รับโบนัส 20 XP</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 mb-6">
                    <p className="text-xs text-orange-800 font-medium leading-relaxed text-center">
                      <span className="font-bold">💡 รู้หรือไม่?</span> ความสม่ำเสมอคือหัวใจสำคัญ! พยายามทำภารกิจให้ครบทุกวันเพื่อรับโบนัส XP ก้อนใหญ่ และสะสมรางวัลระดับ <span className="font-black">PERFECT</span> เมื่อจบแผน 7 วันนะครับ
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black text-slate-800 mb-2">กติกาแผน 21 วัน <br /><span className="text-orange-500">ช่วงขยาย (วันที่ 8-21)</span></h3>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    ทำภารกิจช่วงขยายแผน (วันที่ 8-21 รวม 14 วัน) สะสมจำนวนวันสำเร็จเพื่อรับโบนัสก้อนโตขึ้น!
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="text-2xl drop-shadow-sm">🏆</div>
                      <div>
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Extraordinary Run (สำเร็จ 12-14 วัน)</div>
                        <div className="text-sm font-black text-amber-600">รับโบนัส 250 XP</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-2xl drop-shadow-sm">🌟</div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Great Run (สำเร็จ 8-11 วัน)</div>
                        <div className="text-sm font-black text-slate-700">รับโบนัส 100 XP</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-2xl drop-shadow-sm">👍</div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Good Run (สำเร็จ 1-7 วัน)</div>
                        <div className="text-sm font-black text-slate-700">รับโบนัส 50 XP</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 mb-6">
                    <p className="text-xs text-orange-800 font-medium leading-relaxed text-center">
                      <span className="font-bold">💡 รู้หรือไม่?</span> ในเฟสขยายแผนนี้ (วันที่ 8-21) จะนับวันสำเร็จแยกอีก 14 วันครับ! พยายามทำต่อเนื่องเพื่อรับรางวัลระดับ <span className="font-black">EXTRAORDINARY</span> นะครับ
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowWheelRulesModal(false)}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                เข้าใจแล้ว ลุยเลย!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🎖️ Modal: Plan Rewards Celebration (Dynamic) --- */}
      <AnimatePresence>
        {showPerfectWeekModal && !showLevelUp && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPerfectWeekModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] p-1 shadow-[0_0_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${rewardModalData.type === 'PERFECT' ? 'amber-400' : rewardModalData.type === 'GREAT' ? 'blue-400' : 'emerald-400'} to-transparent`} />
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${rewardModalData.type === 'PERFECT' ? 'bg-amber-500/10' : rewardModalData.type === 'GREAT' ? 'bg-blue-500/10' : 'bg-emerald-500/10'} blur-[60px] rounded-full`} />

              <div className="relative p-10 text-center flex flex-col items-center">
                <div className="relative w-24 h-24 mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={`absolute inset-0 ${rewardModalData.type === 'PERFECT' ? 'bg-amber-500/20' : rewardModalData.type === 'GREAT' ? 'bg-blue-500/20' : 'bg-emerald-500/20'} blur-2xl rounded-full`}
                  />
                  <div className={`relative w-full h-full bg-gradient-to-br ${rewardModalData.type === 'PERFECT' ? 'from-amber-400 to-yellow-600' :
                    rewardModalData.type === 'GREAT' ? 'from-blue-400 to-indigo-600' :
                      'from-emerald-400 to-teal-600'
                    } rounded-3xl flex items-center justify-center shadow-2xl border border-white/20`}>
                    {rewardModalData.type === 'PERFECT' ? <Trophy size={48} className="text-white drop-shadow-lg" /> :
                      rewardModalData.type === 'GREAT' ? <Star size={48} className="text-white drop-shadow-lg" /> :
                        <CheckCircle2 size={48} className="text-white drop-shadow-lg" />}
                  </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-3 tracking-tight italic">{rewardModalData.title}</h2>

                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  {rewardModalData.message}
                  <br />
                  รับโบนัส <span className={`${rewardModalData.type === 'PERFECT' ? 'text-amber-400' :
                    rewardModalData.type === 'GREAT' ? 'text-blue-400' :
                      'text-emerald-400'
                    } font-bold`}>+{rewardModalData.bonusXP} XP</span> เรียบร้อยครับ!
                </p>
                <button
                  onClick={() => setShowPerfectWeekModal(false)}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-xl"
                >
                  รับรางวัลและปิด 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 📊 Modal: Weekly Wrap-up Summary (Relative Week Transition) --- */}
      <WeeklySummaryModal
        isOpen={showWeeklySummaryModal && !showPerfectWeekModal && !showLevelUp}
        onClose={handleCloseWeeklySummary}
        prevWeekInfo={prevWeekInfoState}
        prevWeekData={prevWeekDataState}
      />

      {/* --- ⏳ Modal: Memento Mori / Life Countdown --- */}
      <AnimatePresence>
        {showMementoModal && (
          <MementoMoriModal
            isOpen={showMementoModal}
            onClose={handleCloseMementoModal}
            userData={userData}
            onSaveSetup={handleSaveMementoMoriData}
            onAddReflection={handleAddMementoReflection}
          />
        )}
      </AnimatePresence>

      {/* --- Framer Motion Confetti Overlay --- */}
      {showConfetti && <FramerMotionConfetti />}

      {/* --- 🐷 Modal: หยอดกระปุกออม XP --- */}
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-left overflow-hidden z-10"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <PiggyBank size={18} className="text-violet-400" />
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
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tab Header (Dark Theme) */}
                <div className="flex border-b border-slate-800 mb-6 -mx-8 px-8">
                  <button
                    onClick={() => {
                      setActivePotTab("deposit");
                      setDepositError("");
                      setWithdrawError("");
                    }}
                    className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 outline-none cursor-pointer ${
                      activePotTab === "deposit"
                        ? "border-violet-500 text-violet-400"
                        : "border-transparent text-slate-500 hover:text-slate-400"
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
                        ? "border-violet-500 text-violet-400"
                        : "border-transparent text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    ทุบกระปุก (ถอน XP)
                  </button>
                </div>

                {activePotTab === "deposit" ? (
                  <>
                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                      โอนเศษ XP สะสมไปไว้ที่ Saving Pot เพื่อสะสมไว้แลกของรางวัลใน Shop โดย <span className="text-violet-400 font-bold">เลเวลปัจจุบันของคุณจะไม่ลดลง</span>
                    </p>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-3xl mb-6 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">โอนได้สูงสุด</span>
                        <span className="text-xs font-bold text-white">เพื่อรักษาเลเวลเดิม</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-violet-400">{totalXP % 100}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">จำนวนที่ต้องการหยอด</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDepositAmount(val);
                            const num = parseInt(val);
                            const maxTransfer = totalXP % 100;
                            if (isNaN(num) || num <= 0) {
                              setDepositError("กรุณากรอกจำนวนที่ถูกต้อง");
                            } else if (num > maxTransfer) {
                              setDepositError(`หยอดได้สูงสุด ${maxTransfer} XP เท่านั้นเพื่อไม่ให้เลเวลลด`);
                            } else {
                              setDepositError("");
                            }
                          }}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 px-4 pr-16 text-white font-bold outline-none focus:border-violet-500 transition-all text-sm"
                        />
                        <button
                          onClick={() => {
                            const maxTransfer = totalXP % 100;
                            setDepositAmount(maxTransfer.toString());
                            setDepositError("");
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl transition-all"
                        >
                          MAX
                        </button>
                      </div>
                      {depositError && (
                        <p className="text-[11px] font-bold text-red-400 mt-2 flex items-center gap-1">
                          <span>⚠️</span> {depositError}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!!depositError || !depositAmount || parseInt(depositAmount) <= 0}
                      onClick={() => {
                        const amt = parseInt(depositAmount);
                        if (!isNaN(amt)) {
                          handleDepositXP(amt);
                          setDepositAmount("");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      ยืนยันหยอดกระปุก 🚀
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                      โอน XP กลับไปเติมเลเวลความคืบหน้า โดยจะโดนหักค่าธรรมเนียม <span className="text-violet-400 font-bold">5%</span> (เศษปัดลง)
                    </p>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-3xl mb-6 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase">XP ในกระปุก</span>
                        <span className="text-xs font-bold text-white">ถอนไปเติมที่เลเวล</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-violet-400">{potXP}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">จำนวนที่ต้องการถอน</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWithdrawAmount(val);
                            const num = parseInt(val);
                            if (isNaN(num) || num <= 0) {
                              setWithdrawError("กรุณากรอกจำนวนที่ถูกต้อง");
                            } else if (num > potXP) {
                              setWithdrawError(`ในกระปุกมีเพียง ${potXP} XP`);
                            } else {
                              setWithdrawError("");
                            }
                          }}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 px-4 pr-16 text-white font-bold outline-none focus:border-violet-500 transition-all text-sm"
                        />
                        <button
                          onClick={() => {
                            setWithdrawAmount(potXP.toString());
                            setWithdrawError("");
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl transition-all"
                        >
                          MAX
                        </button>
                      </div>
                      {withdrawError && (
                        <p className="text-[11px] font-bold text-red-400 mt-2 flex items-center gap-1">
                          <span>⚠️</span> {withdrawError}
                        </p>
                      )}
                    </div>

                    {withdrawAmount && !withdrawError && parseInt(withdrawAmount) > 0 && (
                      <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl space-y-2 mb-6 text-xs font-bold text-slate-300">
                        <div className="flex justify-between"><span>ถอนออก:</span><span className="text-white">{parseInt(withdrawAmount)} XP</span></div>
                        <div className="flex justify-between"><span>ค่าธรรมเนียม 5%:</span><span className="text-red-400">-{Math.floor(parseInt(withdrawAmount) * 0.05)} XP</span></div>
                        <div className="w-full h-px bg-slate-700/50 my-1" />
                        <div className="flex justify-between text-sm"><span>ได้รับสุทธิ:</span><span className="text-violet-400">{parseInt(withdrawAmount) - Math.floor(parseInt(withdrawAmount) * 0.05)} XP</span></div>
                      </div>
                    )}

                    <button
                      disabled={!!withdrawError || !withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > potXP}
                      onClick={() => {
                        const amt = parseInt(withdrawAmount);
                        if (!isNaN(amt)) {
                          handleWithdrawXP(amt);
                          setWithdrawAmount("");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      ยืนยันการถอน 🔨
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🎫 Modal: Happiness Ticket Modal (ตั๋วความสุข) --- */}
      <AnimatePresence>
        {showTicketModal && redeemedItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-center overflow-hidden z-10 flex flex-col items-center"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUCCESSFULLY REDEEMED</span>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 🎟️ Ticket Container to Export */}
                <div
                  id="happiness-ticket"
                  className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner"
                  style={{ fontFamily: 'monospace' }}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-20 -left-20 w-36 h-36 bg-violet-600/15 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-indigo-600/15 blur-[50px] rounded-full pointer-events-none" />

                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-l border-slate-800" />

                  {/* Top header */}
                  <div className="flex flex-col items-center w-full border-b border-dashed border-slate-800 pb-4 mb-4">
                    <span className="text-[14px] font-black text-violet-400 tracking-wider">HAPPINESS TICKET</span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-[0.2em]">upskilleveryday.com</span>
                  </div>

                  {/* Emoji & Main Content */}
                  <div className="text-4xl mb-3 animate-bounce">{redeemedItem.emoji}</div>
                  <h3 className="text-base font-black text-white px-2 mb-2 tracking-tight line-clamp-2">
                    {redeemedItem.title}
                  </h3>

                  {/* Price tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black mb-4">
                    <Trophy size={12} className="fill-current" /> {redeemedItem.price} XP REDEEMED
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
                      <span className="text-white block">{new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
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

                  {/* Stamp/Seal Badge style watermark */}
                  <div className="absolute right-4 top-4 w-12 h-12 border-2 border-indigo-500/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                    <span className="text-[6px] text-indigo-500/30 font-black uppercase text-center tracking-tighter">APPROVED<br />FUII MENTOR</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={async () => {
                      const { domToPng } = await import("modern-screenshot");
                      const element = document.getElementById("happiness-ticket");
                      if (!element) return;
                      try {
                        const dataUrl = await domToPng(element, {
                          quality: 1,
                          scale: 3,
                          backgroundColor: '#090D16', // Sleek dark ticket background
                          style: {
                            borderRadius: '1.5rem',
                          },
                          features: { removeControlCharacter: true }
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
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95"
                  >
                    <Camera size={14} />
                    Save Ticket Image 📸
                  </button>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 py-3 rounded-2xl font-bold text-xs transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
