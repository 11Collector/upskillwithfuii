"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Edit3,
  Download,
  ChevronRight,
  ChevronLeft,
  Layers,
  ListTodo,
  Smartphone,
  Maximize2,
  BookOpen,
  HelpCircle,
  Share2,
  Trophy,
  Flame,
  Check,
  RotateCcw,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  MandalaData,
  EMPTY_MANDALA,
  MANDALA_TEMPLATES,
  PILLAR_COLORS,
} from "@/data/mandalaTemplates";
import html2canvas from "html2canvas";

export default function MandalaChartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<MandalaData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("upskill_mandala_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // Default load Shohei Ohtani for rich prototype preview
    return MANDALA_TEMPLATES[0].data;
  });

  // Views:
  // "focus": Wizard Focus Mode (Step-by-step 3x3 writing/editing)
  // "canvas": Full 9x9 Master Grid (Desktop zoomable, mobile pannable)
  // "checklist": Mobile-First Clean Accordion Checklist for quick daily check-ins
  const [activeTab, setActiveTab] = useState<"focus" | "canvas" | "checklist">("focus");
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0); // 0..7 for 8 pillars, -1 for Core Goal
  const [canvasMode, setCanvasMode] = useState<"edit" | "tracker">("tracker");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Auth & Cloud Sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, "users", u.uid, "assessments", "mandala_chart");
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const cloudData = snap.data() as MandalaData;
            setData(cloudData);
          }
        } catch (e) {
          console.error("Failed to load cloud mandala:", e);
        }
      }
    });
    return () => unsub();
  }, []);

  // Save to LocalStorage & Cloud
  const saveData = (newData: MandalaData) => {
    setData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("upskill_mandala_data", JSON.stringify(newData));
    }
    if (user) {
      const docRef = doc(db, "users", user.uid, "assessments", "mandala_chart");
      setDoc(docRef, { ...newData, lastUpdated: Date.now() }, { merge: true }).catch((e) =>
        console.error("Save cloud error:", e)
      );
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculate Completion Stats
  const stats = React.useMemo(() => {
    let filledCells = 0;
    let completedActionsCount = 0;
    let totalActions = 64;

    if (data.coreGoal.trim()) filledCells += 1;

    data.pillars.forEach((p) => {
      if (p.title.trim()) filledCells += 1;
      p.actions.forEach((a, i) => {
        if (a.trim()) filledCells += 1;
        if (p.completedActions && p.completedActions[i]) {
          completedActionsCount += 1;
        }
      });
    });

    const totalCells = 81;
    const fillPercent = Math.round((filledCells / totalCells) * 100);
    const actionPercent = Math.round((completedActionsCount / totalActions) * 100);

    return { filledCells, totalCells, fillPercent, completedActionsCount, totalActions, actionPercent };
  }, [data]);

  // Helper updates
  const handleUpdateCoreGoal = (val: string) => {
    saveData({ ...data, coreGoal: val });
  };

  const handleUpdatePillarTitle = (pillarIdx: number, val: string) => {
    const updated = [...data.pillars];
    updated[pillarIdx] = { ...updated[pillarIdx], title: val };
    saveData({ ...data, pillars: updated });
  };

  const handleUpdateAction = (pillarIdx: number, actionIdx: number, val: string) => {
    const updated = [...data.pillars];
    const actions = [...updated[pillarIdx].actions];
    actions[actionIdx] = val;
    updated[pillarIdx] = { ...updated[pillarIdx], actions };
    saveData({ ...data, pillars: updated });
  };

  const handleToggleActionComplete = (pillarIdx: number, actionIdx: number) => {
    const updated = [...data.pillars];
    const completed = [...(updated[pillarIdx].completedActions || Array(8).fill(false))];
    completed[actionIdx] = !completed[actionIdx];
    updated[pillarIdx] = { ...updated[pillarIdx], completedActions: completed };
    saveData({ ...data, pillars: updated });

    if (!completed[actionIdx]) {
      // Unchecked
    } else {
      showToast(`🎉 พิชิต Action สำเร็จ! (+10 XP)`);
    }
  };

  const loadTemplate = (templateData: MandalaData) => {
    saveData(templateData);
    setShowTemplateModal(false);
    showToast("✨ โหลดแม่แบบสำเร็จ!");
  };

  const exportCanvasImage = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: "#030712",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `mandala-chart-${data.coreGoal.slice(0, 15) || "my-goals"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("📸 บันทึกรูปภาพเรียบร้อยแล้ว!");
    } catch (e) {
      console.error("Export error:", e);
      showToast("เกิดข้อผิดพลาดในการบันทึกภาพ");
    } finally {
      setIsExporting(false);
    }
  };

  const currentPillarColor =
    activePillarIdx >= 0 ? PILLAR_COLORS[activePillarIdx % PILLAR_COLORS.length] : PILLAR_COLORS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans selection:bg-violet-500 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-2xl border border-violet-400/40 flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Back & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                  9x9
                </span>
                <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
                  Mandala Chart
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                แตก 1 เป้าหมายใหญ่ สู่ 8 เสาหลัก และ 64 แผนปฏิบัติการ
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ตัวอย่างชาร์ต</span>
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex-shrink-0"
              title="วิธีใช้งาน"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Mode Selector (Segmented Control) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-1">
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80 shadow-lg">
          <button
            onClick={() => setActiveTab("focus")}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              activeTab === "focus"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>โฟกัสเขียน (3x3)</span>
          </button>

          <button
            onClick={() => setActiveTab("canvas")}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              activeTab === "canvas"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>ผังใหญ่ (9x9)</span>
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              activeTab === "checklist"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>เช็คลิสต์งาน ({stats.completedActionsCount}/64)</span>
          </button>
        </div>
      </div>

      {/* Progress & Stat Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 truncate">ความสมบูรณ์ 81 ช่อง</div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>{stats.filledCells}/81 ช่อง</span>
                <span className="text-[10px] sm:text-xs text-violet-400 font-semibold">({stats.fillPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${stats.fillPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-slate-400">Action พิชิตแล้ว</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stats.completedActionsCount}/64</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        {/* ==================================================================== */}
        {/* VIEW 1: FOCUS / MOBILE-FIRST SINGLE PILLAR CARD MODE (3x3)           */}
        {/* ==================================================================== */}
        {activeTab === "focus" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* 3x3 Mini-Map Compass Selector (Mobile & Desktop) */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>เลือกเสาหลักเพื่อเขียน (Mini-Map):</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {activePillarIdx === -1
                    ? "🎯 กำลังเขียนเป้าหมายหลัก"
                    : `เสาที่ ${activePillarIdx + 1}: ${data.pillars[activePillarIdx]?.title || "ยังไม่ได้ตั้งชื่อ"}`}
                </span>
              </div>

              {/* 3x3 Radar Grid for Selecting Pillars */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[280px] sm:max-w-[320px] mx-auto aspect-square p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                {/* 0: Top-Left */}
                <MiniMapPillarBtn
                  idx={0}
                  pillar={data.pillars[0]}
                  isActive={activePillarIdx === 0}
                  colorConfig={PILLAR_COLORS[0]}
                  onClick={() => setActivePillarIdx(0)}
                />
                {/* 1: Top */}
                <MiniMapPillarBtn
                  idx={1}
                  pillar={data.pillars[1]}
                  isActive={activePillarIdx === 1}
                  colorConfig={PILLAR_COLORS[1]}
                  onClick={() => setActivePillarIdx(1)}
                />
                {/* 2: Top-Right */}
                <MiniMapPillarBtn
                  idx={2}
                  pillar={data.pillars[2]}
                  isActive={activePillarIdx === 2}
                  colorConfig={PILLAR_COLORS[2]}
                  onClick={() => setActivePillarIdx(2)}
                />

                {/* 3: Left */}
                <MiniMapPillarBtn
                  idx={3}
                  pillar={data.pillars[3]}
                  isActive={activePillarIdx === 3}
                  colorConfig={PILLAR_COLORS[3]}
                  onClick={() => setActivePillarIdx(3)}
                />
                {/* CENTER: CORE GOAL */}
                <button
                  onClick={() => setActivePillarIdx(-1)}
                  className={`rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all border ${
                    activePillarIdx === -1
                      ? "bg-gradient-to-br from-violet-600 to-indigo-600 border-amber-300 text-white shadow-lg ring-2 ring-violet-400/50"
                      : "bg-slate-900 border-violet-500/40 text-violet-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-[8px] font-black uppercase text-amber-300">🎯 แกนกลาง</span>
                  <span className="text-[9px] font-bold line-clamp-1">เป้าหมายหลัก</span>
                </button>
                {/* 4: Right */}
                <MiniMapPillarBtn
                  idx={4}
                  pillar={data.pillars[4]}
                  isActive={activePillarIdx === 4}
                  colorConfig={PILLAR_COLORS[4]}
                  onClick={() => setActivePillarIdx(4)}
                />

                {/* 5: Bottom-Left */}
                <MiniMapPillarBtn
                  idx={5}
                  pillar={data.pillars[5]}
                  isActive={activePillarIdx === 5}
                  colorConfig={PILLAR_COLORS[5]}
                  onClick={() => setActivePillarIdx(5)}
                />
                {/* 6: Bottom */}
                <MiniMapPillarBtn
                  idx={6}
                  pillar={data.pillars[6]}
                  isActive={activePillarIdx === 6}
                  colorConfig={PILLAR_COLORS[6]}
                  onClick={() => setActivePillarIdx(6)}
                />
                {/* 7: Bottom-Right */}
                <MiniMapPillarBtn
                  idx={7}
                  pillar={data.pillars[7]}
                  isActive={activePillarIdx === 7}
                  colorConfig={PILLAR_COLORS[7]}
                  onClick={() => setActivePillarIdx(7)}
                />
              </div>
            </div>

            {/* Active Card Body */}
            <AnimatePresence mode="wait">
              {activePillarIdx === -1 ? (
                /* EDITING CORE GOAL (CENTER) */
                <motion.div
                  key="core-goal-edit"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-4 text-center"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                    🎯 เป้าหมายแกนกลาง (Core Goal)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    เป้าหมายใหญ่ที่สุดที่คุณต้องการพิชิตคืออะไร?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                    เปรียบเสมือนหัวใจของ Mandala Chart ที่จะถูกแตกออกเป็น 8 เสาหลัก และ 64 การกระทำย่อย
                  </p>

                  <textarea
                    rows={3}
                    value={data.coreGoal}
                    onChange={(e) => handleUpdateCoreGoal(e.target.value)}
                    placeholder="พิมพ์เป้าหมายหลัก เช่น สร้างธุรกิจดิจิทัล 7 หลัก, สอบติดอันดับ 1, แข็งแรงและวิ่งมาราธอนจบ..."
                    className="w-full text-center text-base sm:text-lg font-bold p-4 rounded-2xl bg-slate-950 border-2 border-violet-500/50 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 text-white placeholder:text-slate-600 outline-none transition-all resize-none shadow-inner"
                  />

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setActivePillarIdx(0)}
                      className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-violet-900/40"
                    >
                      <span>ไปเขียนเสาหลักที่ 1</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* EDITING SPECIFIC PILLAR 3x3 (MICRO GRID) */
                <motion.div
                  key={`pillar-edit-${activePillarIdx}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4"
                >
                  {/* Pillar Title Editor Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${currentPillarColor.badge}`}
                        >
                          เสาหลักที่ {activePillarIdx + 1} / 8
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (กรอกแล้ว{" "}
                          {data.pillars[activePillarIdx]?.actions.filter((a) => a.trim()).length}/8 ข้อ)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">ชื่อเสาหลัก:</span>
                        <input
                          type="text"
                          value={data.pillars[activePillarIdx]?.title}
                          onChange={(e) => handleUpdatePillarTitle(activePillarIdx, e.target.value)}
                          placeholder={`พิมพ์ชื่อเสาที่ ${activePillarIdx + 1}`}
                          className="flex-1 bg-transparent border-b border-slate-700 hover:border-slate-500 focus:border-violet-500 px-1 py-0.5 text-sm sm:text-base font-bold text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Prev / Next Pillar Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => setActivePillarIdx((prev) => (prev > 0 ? prev - 1 : 7))}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1"
                        title="เสาก่อนหน้า"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">ก่อนหน้า</span>
                      </button>
                      <button
                        onClick={() => setActivePillarIdx((prev) => (prev < 7 ? prev + 1 : 0))}
                        className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-violet-900/30"
                        title="เสาถัดไป"
                      >
                        <span>เสาถัดไป</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3x3 Micro Action Grid (Mobile Optimized) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3.5 max-w-xl mx-auto aspect-square">
                    {/* 0 */}
                    <ResponsiveActionBox
                      actionIdx={0}
                      value={data.pillars[activePillarIdx]?.actions[0]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[0]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 0, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 0)}
                      colorConfig={currentPillarColor}
                    />
                    {/* 1 */}
                    <ResponsiveActionBox
                      actionIdx={1}
                      value={data.pillars[activePillarIdx]?.actions[1]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[1]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 1, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 1)}
                      colorConfig={currentPillarColor}
                    />
                    {/* 2 */}
                    <ResponsiveActionBox
                      actionIdx={2}
                      value={data.pillars[activePillarIdx]?.actions[2]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[2]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 2, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 2)}
                      colorConfig={currentPillarColor}
                    />

                    {/* 3 */}
                    <ResponsiveActionBox
                      actionIdx={3}
                      value={data.pillars[activePillarIdx]?.actions[3]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[3]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 3, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 3)}
                      colorConfig={currentPillarColor}
                    />
                    {/* CENTER OF THIS 3x3: PILLAR TITLE */}
                    <div
                      className={`${currentPillarColor.bg} border-2 ${currentPillarColor.border} rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-lg relative`}
                    >
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        เสาหลักที่ {activePillarIdx + 1}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-black ${currentPillarColor.text} line-clamp-2 mt-0.5`}
                      >
                        {data.pillars[activePillarIdx]?.title || `เสาที่ ${activePillarIdx + 1}`}
                      </span>
                    </div>
                    {/* 4 */}
                    <ResponsiveActionBox
                      actionIdx={4}
                      value={data.pillars[activePillarIdx]?.actions[4]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[4]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 4, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 4)}
                      colorConfig={currentPillarColor}
                    />

                    {/* 5 */}
                    <ResponsiveActionBox
                      actionIdx={5}
                      value={data.pillars[activePillarIdx]?.actions[5]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[5]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 5, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 5)}
                      colorConfig={currentPillarColor}
                    />
                    {/* 6 */}
                    <ResponsiveActionBox
                      actionIdx={6}
                      value={data.pillars[activePillarIdx]?.actions[6]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[6]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 6, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 6)}
                      colorConfig={currentPillarColor}
                    />
                    {/* 7 */}
                    <ResponsiveActionBox
                      actionIdx={7}
                      value={data.pillars[activePillarIdx]?.actions[7]}
                      isDone={data.pillars[activePillarIdx]?.completedActions?.[7]}
                      onChange={(v) => handleUpdateAction(activePillarIdx, 7, v)}
                      onToggle={() => handleToggleActionComplete(activePillarIdx, 7)}
                      colorConfig={currentPillarColor}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: MASTER 9x9 CANVAS VIEW (PANNABLE & ZOOMABLE)                */}
        {/* ==================================================================== */}
        {activeTab === "canvas" && (
          <div className="space-y-3">
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCanvasMode("tracker")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    canvasMode === "tracker"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>โหมดติ๊กความคืบหน้า</span>
                </button>
                <button
                  onClick={() => setCanvasMode("edit")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    canvasMode === "edit"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>โหมดพิมพ์แก้ไข</span>
                </button>
              </div>

              <button
                onClick={exportCanvasImage}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? "กำลังเซฟ..." : "Export ภาพ"}</span>
              </button>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="sm:hidden text-center text-[11px] text-slate-400 py-0.5">
              👉 เลื่อนซ้าย-ขวาเพื่อดูชาร์ต 9x9 ให้ครบทุกมุม
            </div>

            {/* 9x9 Canvas with smooth horizontal scroll on mobile */}
            <div className="overflow-x-auto pb-6 pt-1">
              <div
                ref={canvasRef}
                className="min-w-[840px] max-w-[1000px] mx-auto bg-slate-950 border-2 border-slate-800 p-3 sm:p-5 rounded-3xl shadow-2xl relative"
              >
                {/* 3x3 Clusters of 3x3 grids */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                  {/* Top-Left Cluster: Pillar 0 */}
                  <Cluster3x3
                    pillarIdx={0}
                    pillar={data.pillars[0]}
                    colorConfig={PILLAR_COLORS[0]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(0, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(0, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(0, aIdx)}
                  />

                  {/* Top-Center Cluster: Pillar 1 */}
                  <Cluster3x3
                    pillarIdx={1}
                    pillar={data.pillars[1]}
                    colorConfig={PILLAR_COLORS[1]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(1, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(1, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(1, aIdx)}
                  />

                  {/* Top-Right Cluster: Pillar 2 */}
                  <Cluster3x3
                    pillarIdx={2}
                    pillar={data.pillars[2]}
                    colorConfig={PILLAR_COLORS[2]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(2, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(2, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(2, aIdx)}
                  />

                  {/* Middle-Left Cluster: Pillar 3 */}
                  <Cluster3x3
                    pillarIdx={3}
                    pillar={data.pillars[3]}
                    colorConfig={PILLAR_COLORS[3]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(3, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(3, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(3, aIdx)}
                  />

                  {/* CENTER CLUSTER: THE MASTER 8 PILLARS + 1 CORE GOAL */}
                  <div className="grid grid-cols-3 gap-1 p-1.5 rounded-2xl bg-slate-900 border-2 border-violet-500/60 shadow-xl shadow-violet-950/40 relative">
                    <CenterClusterPillarCell
                      pillarIdx={0}
                      title={data.pillars[0]?.title}
                      colorConfig={PILLAR_COLORS[0]}
                      onUpdate={(v) => handleUpdatePillarTitle(0, v)}
                      mode={canvasMode}
                    />
                    <CenterClusterPillarCell
                      pillarIdx={1}
                      title={data.pillars[1]?.title}
                      colorConfig={PILLAR_COLORS[1]}
                      onUpdate={(v) => handleUpdatePillarTitle(1, v)}
                      mode={canvasMode}
                    />
                    <CenterClusterPillarCell
                      pillarIdx={2}
                      title={data.pillars[2]?.title}
                      colorConfig={PILLAR_COLORS[2]}
                      onUpdate={(v) => handleUpdatePillarTitle(2, v)}
                      mode={canvasMode}
                    />

                    <CenterClusterPillarCell
                      pillarIdx={3}
                      title={data.pillars[3]?.title}
                      colorConfig={PILLAR_COLORS[3]}
                      onUpdate={(v) => handleUpdatePillarTitle(3, v)}
                      mode={canvasMode}
                    />
                    {/* ABSOLUTE CENTER: THE CORE GOAL */}
                    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-lg border border-violet-300/40">
                      <span className="text-[8px] font-black text-amber-300 uppercase tracking-widest mb-0.5">
                        ⭐ เป้าหมายหลัก
                      </span>
                      <textarea
                        rows={2}
                        value={data.coreGoal}
                        onChange={(e) => handleUpdateCoreGoal(e.target.value)}
                        placeholder="เป้าหมายหลัก"
                        className="w-full bg-transparent text-center text-[10px] sm:text-xs font-bold text-white placeholder:text-violet-200/50 outline-none resize-none leading-tight"
                      />
                    </div>
                    <CenterClusterPillarCell
                      pillarIdx={4}
                      title={data.pillars[4]?.title}
                      colorConfig={PILLAR_COLORS[4]}
                      onUpdate={(v) => handleUpdatePillarTitle(4, v)}
                      mode={canvasMode}
                    />

                    <CenterClusterPillarCell
                      pillarIdx={5}
                      title={data.pillars[5]?.title}
                      colorConfig={PILLAR_COLORS[5]}
                      onUpdate={(v) => handleUpdatePillarTitle(5, v)}
                      mode={canvasMode}
                    />
                    <CenterClusterPillarCell
                      pillarIdx={6}
                      title={data.pillars[6]?.title}
                      colorConfig={PILLAR_COLORS[6]}
                      onUpdate={(v) => handleUpdatePillarTitle(6, v)}
                      mode={canvasMode}
                    />
                    <CenterClusterPillarCell
                      pillarIdx={7}
                      title={data.pillars[7]?.title}
                      colorConfig={PILLAR_COLORS[7]}
                      onUpdate={(v) => handleUpdatePillarTitle(7, v)}
                      mode={canvasMode}
                    />
                  </div>

                  {/* Middle-Right Cluster: Pillar 4 */}
                  <Cluster3x3
                    pillarIdx={4}
                    pillar={data.pillars[4]}
                    colorConfig={PILLAR_COLORS[4]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(4, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(4, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(4, aIdx)}
                  />

                  {/* Bottom-Left Cluster: Pillar 5 */}
                  <Cluster3x3
                    pillarIdx={5}
                    pillar={data.pillars[5]}
                    colorConfig={PILLAR_COLORS[5]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(5, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(5, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(5, aIdx)}
                  />

                  {/* Bottom-Center Cluster: Pillar 6 */}
                  <Cluster3x3
                    pillarIdx={6}
                    pillar={data.pillars[6]}
                    colorConfig={PILLAR_COLORS[6]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(6, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(6, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(6, aIdx)}
                  />

                  {/* Bottom-Right Cluster: Pillar 7 */}
                  <Cluster3x3
                    pillarIdx={7}
                    pillar={data.pillars[7]}
                    colorConfig={PILLAR_COLORS[7]}
                    mode={canvasMode}
                    onUpdateAction={(aIdx, val) => handleUpdateAction(7, aIdx, val)}
                    onUpdateTitle={(val) => handleUpdatePillarTitle(7, val)}
                    onToggleComplete={(aIdx) => handleToggleActionComplete(7, aIdx)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 3: MOBILE-FIRST QUICK CHECKLIST MODE (ACCORDION LIST)           */}
        {/* ==================================================================== */}
        {activeTab === "checklist" && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                เป้าหมายแกนกลาง
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {data.coreGoal || "ยังไม่ได้ตั้งเป้าหมายหลัก"}
              </h2>
            </div>

            {/* List of 8 Pillars with Action Checkboxes */}
            <div className="space-y-3">
              {data.pillars.map((pillar, pIdx) => {
                const colorConfig = PILLAR_COLORS[pIdx % PILLAR_COLORS.length];
                const completedInThisPillar =
                  pillar.completedActions?.filter(Boolean).length || 0;

                return (
                  <div
                    key={pIdx}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorConfig.badge}`}
                        >
                          เสาที่ {pIdx + 1}
                        </span>
                        <h3 className={`text-sm font-bold ${colorConfig.text}`}>
                          {pillar.title || `เสาที่ ${pIdx + 1}`}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {completedInThisPillar}/8 ข้อ
                      </span>
                    </div>

                    {/* 8 Action Checklist Items */}
                    <div className="space-y-1.5">
                      {pillar.actions.map((action, aIdx) => {
                        const isDone = pillar.completedActions?.[aIdx];
                        return (
                          <div
                            key={aIdx}
                            onClick={() => handleToggleActionComplete(pIdx, aIdx)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer select-none transition-all ${
                              isDone
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                : action.trim()
                                ? "bg-slate-950/80 border-slate-800/80 text-slate-200 hover:border-slate-600"
                                : "bg-slate-950/30 border-slate-900 text-slate-600"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">
                                #{aIdx + 1}
                              </span>
                              <span
                                className={`text-xs sm:text-sm ${
                                  isDone ? "line-through opacity-80" : "font-medium"
                                } truncate`}
                              >
                                {action.trim() || "(ยังไม่ได้กรอกข้อความ)"}
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>เลือกแม่แบบ Mandala Chart</span>
                </h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                {MANDALA_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => loadTemplate(tmpl.data)}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-violet-500/60 cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                      {tmpl.name}
                    </div>
                    <div className="text-xs text-slate-400">{tmpl.description}</div>
                  </div>
                ))}

                <div
                  onClick={() => loadTemplate(EMPTY_MANDALA)}
                  className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-center cursor-pointer transition-all"
                >
                  <span className="text-xs text-slate-400 hover:text-slate-200">
                    🔄 ล้างข้อมูลทั้งหมด เริ่มต้นจากกระดานเปล่า
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  <span>Mandala Chart คืออะไร?</span>
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                <p>
                  <strong>Mandala Chart (Harada Method)</strong> คือเครื่องมือระดับโลกจากญี่ปุ่น
                  ที่โด่งดังจากการที่ <strong>โชเฮ โอทานิ (Shohei Ohtani)</strong> ใช้ตั้งเป้าหมายจนประสบความสำเร็จ
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="font-semibold text-amber-300">โครงสร้าง 81 ช่อง (9x9):</div>
                  <div>• <strong>1 เป้าหมายใหญ่:</strong> หัวใจหลักของชีวิต</div>
                  <div>• <strong>8 เสาหลัก:</strong> องค์ประกอบสำคัญ 8 ด้าน</div>
                  <div>• <strong>64 แผนปฏิบัติการ:</strong> สิ่งที่ลงมือทำได้จริงทุกวัน</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------------
// RESPONSIVE SUB-COMPONENTS
// ----------------------------------------------------------------------------

function MiniMapPillarBtn({
  idx,
  pillar,
  isActive,
  colorConfig,
  onClick,
}: {
  idx: number;
  pillar: any;
  isActive: boolean;
  colorConfig: any;
  onClick: () => void;
}) {
  const filledCount = pillar?.actions.filter((a: string) => a.trim()).length || 0;

  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all border ${
        isActive
          ? `${colorConfig.bg} border-2 ${colorConfig.border} ring-2 ring-violet-500/50 shadow-md`
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300"
      }`}
    >
      <span className="text-[8px] font-bold text-slate-400">เสาที่ {idx + 1}</span>
      <span className={`text-[9px] font-bold truncate max-w-full px-0.5 ${isActive ? colorConfig.text : "text-slate-200"}`}>
        {pillar?.title || `เสา ${idx + 1}`}
      </span>
      <span className="text-[7px] text-slate-500">{filledCount}/8</span>
    </button>
  );
}

function ResponsiveActionBox({
  actionIdx,
  value,
  isDone,
  onChange,
  onToggle,
  colorConfig,
}: {
  actionIdx: number;
  value: string;
  isDone?: boolean;
  onChange: (v: string) => void;
  onToggle: () => void;
  colorConfig: any;
}) {
  return (
    <div
      className={`bg-slate-950 border rounded-2xl p-2 sm:p-3 flex flex-col justify-between transition-all ${
        isDone
          ? "border-emerald-500/50 bg-emerald-950/20"
          : "border-slate-800 hover:border-slate-700 focus-within:border-violet-500"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500">#{actionIdx + 1}</span>
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
            isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-900"
          }`}
          title="ติ๊กเครื่องหมายถูกเมื่อทำสำเร็จ"
        >
          {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>
      </div>

      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="พิมพ์ Action ย่อย..."
        className={`w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-700 outline-none resize-none font-medium leading-snug ${
          isDone ? "line-through opacity-70 text-emerald-300" : ""
        }`}
      />
    </div>
  );
}

function Cluster3x3({
  pillarIdx,
  pillar,
  colorConfig,
  mode,
  onUpdateAction,
  onUpdateTitle,
  onToggleComplete,
}: {
  pillarIdx: number;
  pillar: any;
  colorConfig: any;
  mode: "edit" | "tracker";
  onUpdateAction: (aIdx: number, val: string) => void;
  onUpdateTitle: (val: string) => void;
  onToggleComplete: (aIdx: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
      {/* 0 */}
      <ClusterActionCell
        actionIdx={0}
        text={pillar?.actions[0]}
        isDone={pillar?.completedActions?.[0]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(0, v)}
        onToggle={() => onToggleComplete(0)}
      />
      {/* 1 */}
      <ClusterActionCell
        actionIdx={1}
        text={pillar?.actions[1]}
        isDone={pillar?.completedActions?.[1]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(1, v)}
        onToggle={() => onToggleComplete(1)}
      />
      {/* 2 */}
      <ClusterActionCell
        actionIdx={2}
        text={pillar?.actions[2]}
        isDone={pillar?.completedActions?.[2]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(2, v)}
        onToggle={() => onToggleComplete(2)}
      />

      {/* 3 */}
      <ClusterActionCell
        actionIdx={3}
        text={pillar?.actions[3]}
        isDone={pillar?.completedActions?.[3]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(3, v)}
        onToggle={() => onToggleComplete(3)}
      />
      {/* CENTER OF THIS CLUSTER: PILLAR TITLE */}
      <div
        className={`${colorConfig.bg} border ${colorConfig.border} rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-inner`}
      >
        <span className="text-[7px] font-bold text-slate-400 uppercase">เสาที่ {pillarIdx + 1}</span>
        <textarea
          rows={2}
          value={pillar?.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder={`เสาที่ ${pillarIdx + 1}`}
          className={`w-full bg-transparent text-center text-[10px] font-bold ${colorConfig.text} placeholder:text-slate-600 outline-none resize-none leading-tight`}
        />
      </div>
      {/* 4 */}
      <ClusterActionCell
        actionIdx={4}
        text={pillar?.actions[4]}
        isDone={pillar?.completedActions?.[4]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(4, v)}
        onToggle={() => onToggleComplete(4)}
      />

      {/* 5 */}
      <ClusterActionCell
        actionIdx={5}
        text={pillar?.actions[5]}
        isDone={pillar?.completedActions?.[5]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(5, v)}
        onToggle={() => onToggleComplete(5)}
      />
      {/* 6 */}
      <ClusterActionCell
        actionIdx={6}
        text={pillar?.actions[6]}
        isDone={pillar?.completedActions?.[6]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(6, v)}
        onToggle={() => onToggleComplete(6)}
      />
      {/* 7 */}
      <ClusterActionCell
        actionIdx={7}
        text={pillar?.actions[7]}
        isDone={pillar?.completedActions?.[7]}
        mode={mode}
        colorConfig={colorConfig}
        onUpdate={(v) => onUpdateAction(7, v)}
        onToggle={() => onToggleComplete(7)}
      />
    </div>
  );
}

function ClusterActionCell({
  actionIdx,
  text,
  isDone,
  mode,
  colorConfig,
  onUpdate,
  onToggle,
}: {
  actionIdx: number;
  text: string;
  isDone?: boolean;
  mode: "edit" | "tracker";
  colorConfig: any;
  onUpdate: (v: string) => void;
  onToggle: () => void;
}) {
  if (mode === "tracker") {
    return (
      <div
        onClick={onToggle}
        className={`rounded-xl p-1.5 min-h-[50px] flex flex-col justify-between transition-all cursor-pointer select-none relative group ${
          isDone
            ? "bg-emerald-950/60 border border-emerald-500/50"
            : text?.trim()
            ? "bg-slate-950/70 border border-slate-800/80 hover:border-slate-600"
            : "bg-slate-950/30 border border-slate-900"
        }`}
      >
        <p
          className={`text-[9px] leading-tight line-clamp-3 ${
            isDone ? "text-emerald-300 line-through opacity-80" : "text-slate-300"
          }`}
        >
          {text || "—"}
        </p>

        <div className="flex items-center justify-end mt-0.5">
          {isDone ? (
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <div className="w-2 h-2 rounded-full border border-slate-700 group-hover:border-slate-500" />
          )}
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="rounded-xl p-1 min-h-[50px] bg-slate-950 border border-slate-800 hover:border-violet-500/60 focus-within:border-violet-500 transition-all flex flex-col justify-between">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={`Action #${actionIdx + 1}`}
        className="w-full bg-transparent text-[9px] text-slate-200 placeholder:text-slate-700 outline-none resize-none leading-tight"
      />
    </div>
  );
}

function CenterClusterPillarCell({
  pillarIdx,
  title,
  colorConfig,
  onUpdate,
  mode,
}: {
  pillarIdx: number;
  title: string;
  colorConfig: any;
  onUpdate: (v: string) => void;
  mode: "edit" | "tracker";
}) {
  return (
    <div
      className={`${colorConfig.bg} border ${colorConfig.border} rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm`}
    >
      <span className="text-[7px] font-bold text-slate-400">เสาที่ {pillarIdx + 1}</span>
      <textarea
        rows={2}
        value={title}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={`เสาที่ ${pillarIdx + 1}`}
        className={`w-full bg-transparent text-center text-[9px] font-bold ${colorConfig.text} placeholder:text-slate-600 outline-none resize-none leading-tight`}
      />
    </div>
  );
}
