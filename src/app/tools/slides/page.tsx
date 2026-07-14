"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Download, 
  Upload, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  CornerDownRight,
  Eye,
  FileText,
  Printer
} from "lucide-react";

// --- Types ---
type SlideLayout = "title" | "bullets" | "takeaway" | "split" | "code";

interface Slide {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  bullets?: string[];
  leftColumn?: string;
  rightColumn?: string;
  codeBlock?: string;
  takeawayText?: string;
  authorBadge?: string;
  notes?: string;
}

type SlideTheme = "brand-cream" | "brand-maroon" | "brand-white" | "dark-space";

// --- Constants / Presets ---
const THEMES: Record<SlideTheme, {
  name: string;
  bodyClass: string;
  cardClass: string;
  textTitle: string;
  textSubtitle: string;
  textNormal: string;
  bulletAccent: string;
  badgeClass: string;
}> = {
  "brand-cream": {
    name: "Upskill Cream (ครีม & เลือดหมู)",
    bodyClass: "bg-[#FDF2F2] text-[#2D0A0A]",
    cardClass: "bg-white border border-[#E5C0C0] shadow-xl shadow-[#800000]/5",
    textTitle: "text-[#800000] font-black",
    textSubtitle: "text-[#5F0000]/80 font-bold",
    textNormal: "text-[#2D0A0A]",
    bulletAccent: "text-[#800000]",
    badgeClass: "bg-[#800000]/10 text-[#800000] border border-[#800000]/20"
  },
  "brand-maroon": {
    name: "Obsidian Maroon (เลือดหมูเข้ม - มืด)",
    bodyClass: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3A0000] via-[#1A0000] to-[#0A0000] text-slate-100",
    cardClass: "bg-[#0A0000]/40 border border-[#800000]/30 backdrop-blur-md",
    textTitle: "bg-gradient-to-r from-red-100 via-rose-200 to-amber-100 bg-clip-text text-transparent font-black",
    textSubtitle: "text-rose-200/60",
    textNormal: "text-[#FDF2F2]/90",
    bulletAccent: "text-red-400",
    badgeClass: "bg-[#800000]/30 text-rose-200 border border-[#800000]/50"
  },
  "brand-white": {
    name: "Upskill White (ขาวคลีน & เลือดหมู)",
    bodyClass: "bg-white text-[#2D0A0A]",
    cardClass: "bg-stone-50 border border-stone-200 shadow-md shadow-stone-100/50",
    textTitle: "text-[#800000] font-black",
    textSubtitle: "text-slate-500 font-bold",
    textNormal: "text-slate-700",
    bulletAccent: "text-[#800000]",
    badgeClass: "bg-stone-100 text-slate-700 border border-stone-200"
  },
  "dark-space": {
    name: "Deep Space (Violet & Slate)",
    bodyClass: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 text-slate-100",
    cardClass: "bg-slate-950/40 border border-slate-800/80 backdrop-blur-md",
    textTitle: "bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent font-black",
    textSubtitle: "text-slate-400",
    textNormal: "text-slate-300",
    bulletAccent: "text-violet-400",
    badgeClass: "bg-violet-500/10 text-violet-300 border border-violet-500/20"
  }
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "1",
    layout: "title",
    title: "3 เทคนิคคุยกับ AI ให้ได้งานแบบมือโปร",
    subtitle: "เคล็ดลับการออกแบบ Prompt สำหรับการพัฒนาตัวเองและการงาน",
    authorBadge: "Upskill Everyday · @fuii",
    notes: "แนะนำหัวข้อในสัปดาห์นี้และเปิดตัวเนื้อหาก่อนเข้าบทเรียน"
  },
  {
    id: "2",
    layout: "bullets",
    title: "1. เข้าใจบทบาท (Roleplay)",
    subtitle: "สมมติให้ AI เป็นผู้เชี่ยวชาญเฉพาะทางก่อนเริ่มถามเสมอ",
    bullets: [
      "กำหนดตำแหน่งหรืออาชีพให้ AI เช่น 'จงเป็นบก. ผู้ตรวจเนื้อหาหนังสือ'",
      "บอกพฤติกรรมหรือโทนเสียงที่ต้องการ เช่น 'ตอบแบบกระชับ ตรงประเด็น'",
      "การมอบบทบาทช่วยกรองข้อมูลที่ AI ใช้ตอบให้แคบและแม่นยำขึ้นอย่างมาก"
    ],
    notes: "ยกตัวอย่างข้อแตกต่างระหว่างถามปกติกับการสมมติบทบาท"
  },
  {
    id: "3",
    layout: "bullets",
    title: "2. ให้บริบทที่ชัดเจน (Context)",
    subtitle: "คุณภาพคำตอบจะเท่ากับคุณภาพข้อมูลที่คุณป้อนเข้าไป",
    bullets: [
      "ส่งเป้าหมายสุดท้ายที่คุณอยากได้ เช่น 'เพื่อนำไปทำสไลด์นำเสนอยาว 5 นาที'",
      "ระบุกลุ่มเป้าหมายผู้รับสาร เช่น 'สำหรับเด็กจบใหม่ที่ยังไม่เคยทำงาน'",
      "กำหนดขอบเขตหรือสิ่งที่ไม่ต้องการให้ตอบ"
    ],
    notes: "เน้นย้ำเรื่อง 'Context is King' ว่าเป็นจุดตัดของงานทั่วไปกับงานระดับมืออาชีพ"
  },
  {
    id: "4",
    layout: "bullets",
    title: "3. ส่งตัวอย่างแนวงาน (Few-shot)",
    subtitle: "ตัวอย่างชิ้นงานจริงมีค่ามากกว่าการเขียนคำอธิบายยาวๆ หลายหน้า",
    bullets: [
      "ส่งตัวอย่าง Prompt ที่เคยได้ผลดี หรือตัวอย่างฟอร์แมตคำตอบที่ต้องการ",
      "การให้ตัวอย่าง 1-2 ข้อ ช่วยคุมทิศทางการเขียนของ AI ได้ถึง 90%",
      "ช่วยลดเวลาการแก้ไขฟอร์แมตผลลัพธ์ภายหลัง"
    ],
    notes: "โชว์ตัวอย่างโครงสร้างคำสั่งสั้นๆ ในหน้าจอประกอบพรีเซนต์"
  },
  {
    id: "5",
    layout: "takeaway",
    title: "บทสรุปสัปดาห์นี้",
    takeawayText: "“AI ไม่ได้มีความคิดสร้างสรรค์น้อยลง แต่คุณภาพของอินพุต (Prompt) ต่างหาก ที่เป็นตัวตัดสินคุณภาพของผลลัพธ์สุดท้าย”",
    authorBadge: "Upskill Everyday",
    notes: "สรุปปิดท้าย พ่นข้อคิดเด็ดๆ ให้ผู้ชมจดจำแบรนด์"
  }
];

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [activeTheme, setActiveTheme] = useState<SlideTheme>("brand-cream");
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [copyOutlineSuccess, setCopyOutlineSuccess] = useState(false);
  
  const generateOutlineText = () => {
    return slides.map((s, idx) => {
      let text = `# ${idx + 1}. ${s.title}\n`;
      if (s.subtitle) text += `Subtitle: ${s.subtitle}\n`;
      if (s.bullets && s.bullets.length > 0) {
        text += s.bullets.map(b => `- ${b}`).join("\n") + "\n";
      }
      if (s.takeawayText) text += `Quote: "${s.takeawayText}"\n`;
      if (s.leftColumn || s.rightColumn) {
        text += `[คอลัมน์ซ้าย]\n${s.leftColumn || ""}\n\n[คอลัมน์ขวา]\n${s.rightColumn || ""}\n`;
      }
      if (s.codeBlock) text += `Code:\n${s.codeBlock}\n`;
      if (s.authorBadge) text += `Presenter: ${s.authorBadge}\n`;
      return text;
    }).join("\n---\n\n");
  };

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(generateOutlineText());
    setCopyOutlineSuccess(true);
    setTimeout(() => setCopyOutlineSuccess(false), 2000);
  };
  
  // Slide list states
  const [selectedSlideId, setSelectedSlideId] = useState<string>("1");
  const currentEditSlide = slides.find(s => s.id === selectedSlideId) || slides[0] || null;

  // Refs for Presentation fullscreen container
  const presentationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with LocalStorage
  useEffect(() => {
    const savedSlides = localStorage.getItem("weekly_slides");
    if (savedSlides) {
      try {
        const parsed = JSON.parse(savedSlides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
          setSelectedSlideId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load slides from cache", e);
      }
    }
    const savedTheme = localStorage.getItem("weekly_slides_theme");
    if (savedTheme && Object.keys(THEMES).includes(savedTheme)) {
      setActiveTheme(savedTheme as SlideTheme);
    }
  }, []);

  const saveSlidesToCache = (newSlides: Slide[]) => {
    localStorage.setItem("weekly_slides", JSON.stringify(newSlides));
  };

  const handleUpdateSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    saveSlidesToCache(newSlides);
  };

  // Keyboard navigation inside Present Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentMode) return;
      
      if (e.key === "ArrowRight" || e.key === "Space" || e.key === "Enter") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        setIsPresentMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentMode, currentSlideIdx, slides]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Slide navigation
  const nextSlide = () => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  // Slide management handlers
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      layout: "bullets",
      title: "หัวข้อสไลด์ใหม่",
      subtitle: "รายละเอียดคำอธิบายสั้นๆ",
      bullets: ["จุดสำคัญข้อแรก", "จุดสำคัญข้อที่สอง"],
      notes: "บันทึกเตรียมพูดของคุณที่นี่..."
    };
    const updated = [...slides, newSlide];
    handleUpdateSlides(updated);
    setSelectedSlideId(newSlide.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return;
    const remaining = slides.filter(s => s.id !== id);
    handleUpdateSlides(remaining);
    
    if (selectedSlideId === id) {
      setSelectedSlideId(remaining[0].id);
    }
  };

  const handleUpdateSlideField = (id: string, field: keyof Slide, value: any) => {
    const updated = slides.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    handleUpdateSlides(updated);
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === slides.length - 1) return;

    const newIndex = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...slides];
    const temp = updated[idx];
    updated[idx] = updated[newIndex];
    updated[newIndex] = temp;

    handleUpdateSlides(updated);
  };

  const handleResetToDefault = () => {
    if (confirm("ต้องการรีเซ็ตสไลด์ทั้งหมดกลับเป็นเทมเพลตเริ่มต้นใช่หรือไม่?")) {
      handleUpdateSlides(DEFAULT_SLIDES);
      setSelectedSlideId(DEFAULT_SLIDES[0].id);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!presentationRef.current) return;
    if (!document.fullscreenElement) {
      presentationRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen mode:", err.message);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Export slides as JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(slides, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `slide_deck_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import slides from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          handleUpdateSlides(parsed);
          setSelectedSlideId(parsed[0].id);
          alert("นำเข้าสไลด์เรียบร้อยแล้ว!");
        } else {
          alert("รูปแบบไฟล์ไม่ถูกต้อง");
        }
      } catch (err) {
        alert("ไม่สามารถอ่านไฟล์ JSON นี้ได้");
      }
    };
    reader.readAsText(file);
  };

  const currentTheme = THEMES[activeTheme];

  // Render slides dynamically inside viewport
  const renderSlideContent = (slide: Slide, isEditPreview: boolean = false) => {
    const textTitleSize = isEditPreview ? "text-xl font-black mb-1" : "text-5xl md:text-6xl font-black mb-4 tracking-tight leading-tight";
    const textSubtitleSize = isEditPreview ? "text-xs font-medium mb-3 opacity-80" : "text-xl md:text-2xl font-medium mb-8 leading-relaxed";
    const normalTextSize = isEditPreview ? "text-[10px] leading-relaxed" : "text-lg md:text-xl leading-loose font-medium";

    switch (slide.layout) {
      case "title":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto px-4">
            {slide.authorBadge && (
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6 ${currentTheme.badgeClass}`}>
                {slide.authorBadge}
              </span>
            )}
            <h1 className={`${textTitleSize} ${currentTheme.textTitle}`}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className={`${textSubtitleSize} ${currentTheme.textSubtitle}`}>
                {slide.subtitle}
              </p>
            )}
            <div className="w-16 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full mt-4" />
          </div>
        );

      case "bullets":
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-6 text-left">
            <h2 className={`${textTitleSize} ${currentTheme.textTitle}`}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className={`${textSubtitleSize} ${currentTheme.textSubtitle} border-l-4 border-violet-500 pl-4 py-1`}>
                {slide.subtitle}
              </p>
            )}
            <ul className="space-y-4 md:space-y-6 mt-2">
              {slide.bullets?.map((bullet, i) => (
                <li key={i} className={`flex items-start gap-4 ${normalTextSize} ${currentTheme.textNormal}`}>
                  <span className={`font-black text-2xl select-none flex-shrink-0 ${currentTheme.bulletAccent}`}>
                    {i + 1}.
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "takeaway":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-6">
            <h2 className={`${isEditPreview ? "text-sm" : "text-lg"} font-bold tracking-widest uppercase opacity-60 mb-8`}>
              {slide.title || "Key Takeaway"}
            </h2>
            <div className={`p-8 md:p-12 rounded-3xl relative ${currentTheme.cardClass}`}>
              <span className="absolute -top-6 left-6 text-7xl font-serif text-violet-500/40 select-none">“</span>
              <p className={`${isEditPreview ? "text-sm leading-relaxed" : "text-2xl md:text-3xl font-extrabold leading-loose text-slate-100"} italic`}>
                {slide.takeawayText || "เพิ่มใจความสำคัญตรงนี้..."}
              </p>
              <span className="absolute -bottom-12 right-6 text-7xl font-serif text-violet-500/40 select-none">”</span>
            </div>
            {slide.authorBadge && (
              <span className={`mt-10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentTheme.badgeClass}`}>
                {slide.authorBadge}
              </span>
            )}
          </div>
        );

      case "split":
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-6 text-left">
            <h2 className={`${textTitleSize} ${currentTheme.textTitle} mb-6`}>
              {slide.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-2">
              <div className={`p-6 md:p-8 rounded-2xl ${currentTheme.cardClass}`}>
                <h3 className="text-xl font-extrabold text-violet-400 mb-4 flex items-center gap-2">
                  <CornerDownRight size={18} /> ซีกซ้าย
                </h3>
                <p className={`${normalTextSize} ${currentTheme.textNormal} leading-relaxed whitespace-pre-wrap`}>
                  {slide.leftColumn || "ข้อมูลคอลัมน์ซ้าย..."}
                </p>
              </div>
              <div className={`p-6 md:p-8 rounded-2xl ${currentTheme.cardClass}`}>
                <h3 className="text-xl font-extrabold text-teal-400 mb-4 flex items-center gap-2">
                  <CornerDownRight size={18} /> ซีกขวา
                </h3>
                <p className={`${normalTextSize} ${currentTheme.textNormal} leading-relaxed whitespace-pre-wrap`}>
                  {slide.rightColumn || "ข้อมูลคอลัมน์ขวา..."}
                </p>
              </div>
            </div>
          </div>
        );

      case "code":
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-6 text-left">
            <h2 className={`${textTitleSize} ${currentTheme.textTitle} mb-4`}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className={`${textSubtitleSize} ${currentTheme.textSubtitle} mb-6`}>
                {slide.subtitle}
              </p>
            )}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs md:text-sm text-emerald-400/90 shadow-inner overflow-x-auto relative">
              <div className="absolute top-3 right-4 text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">
                Source Code / Prompt
              </div>
              <pre className="leading-loose whitespace-pre-wrap">
                {slide.codeBlock || "// เขียนโค้ดหรือข้อความ Prompt ตรงนี้..."}
              </pre>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* 1. Header Bar */}
      <header className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between z-35">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              Weekly Slide Presenter <span className="bg-violet-500/10 text-violet-400 text-[9px] px-2 py-0.5 rounded-full font-black border border-violet-500/20">Beta</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              เทมเพลตสไลด์พรีเซนต์ระดับพรีเมียม สำหรับทำคลิป YouTube หรือสอนออนไลน์
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders size={12} /> ธีม:
            </span>
            <select
              value={activeTheme}
              onChange={(e) => {
                const theme = e.target.value as SlideTheme;
                setActiveTheme(theme);
                localStorage.setItem("weekly_slides_theme", theme);
              }}
              className="bg-transparent text-xs font-black text-slate-200 focus:outline-none cursor-pointer"
            >
              {Object.entries(THEMES).map(([key, t]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export buttons */}
          <button 
            onClick={() => setShowOutlineModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all text-slate-300"
            title="คัดลอกโครงร่างข้อความไปวางใน Canva Docs เพื่อแปลงเป็นสไลด์ได้โดยตรง"
          >
            <FileText size={14} className="text-violet-400" />
            <span>คัดลอก Outline ไป Canva</span>
          </button>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all text-slate-300"
            title="สั่งพิมพ์เป็นไฟล์ PDF แล้วนำไปลากวางใน Canva เพื่อแก้ไขดีไซน์ต่อได้เลย"
          >
            <Printer size={14} className="text-emerald-400" />
            <span>พิมพ์ PDF (เข้า Canva)</span>
          </button>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all text-slate-300"
            title="ดาวน์โหลดไฟล์สไลด์เก็บไว้"
          >
            <Download size={14} />
            <span>ส่งออก (.json)</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all text-slate-300"
            title="อัปโหลดไฟล์สไลด์ที่เคยเซฟไว้กลับเข้ามา"
          >
            <Upload size={14} />
            <span>นำเข้า</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleResetToDefault}
            className="p-2 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all"
            title="รีเซ็ตสไลด์ทั้งหมดกลับเป็นค่าเริ่มต้น"
          >
            <RefreshCw size={14} />
          </button>

          {/* Present trigger */}
          <button
            onClick={() => {
              setCurrentSlideIdx(slides.findIndex(s => s.id === selectedSlideId) || 0);
              setIsPresentMode(true);
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-black text-white rounded-xl shadow-lg shadow-violet-600/25 active:scale-95 transition-all cursor-pointer border border-violet-500/20"
          >
            <Play size={14} className="fill-white" />
            <span>เริ่มพรีเซนต์ (F5 / Space)</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workstation Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* A. Left Sidebar: Slide Thumbnails */}
        <aside className="w-85 bg-slate-955 border-r border-slate-850 flex flex-col justify-between z-20">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                <Sliders size={12} /> โครงสร้างสไลด์ ({slides.length})
              </span>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-[10px] font-black text-white rounded-lg cursor-pointer transition-colors"
              >
                <Plus size={10} /> เพิ่มสไลด์
              </button>
            </div>

            <div className="space-y-2">
              {slides.map((s, idx) => {
                const isSelected = selectedSlideId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSlideId(s.id)}
                    className={`group relative p-3 rounded-2xl flex flex-col gap-2 cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-slate-900 border-violet-500/50 shadow-md shadow-violet-500/5"
                        : "bg-slate-950 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-800 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-850 text-slate-400 border border-slate-800">
                          {s.layout}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide(idx, "up");
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <MoveUp size={10} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide(idx, "down");
                          }}
                          disabled={idx === slides.length - 1}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <MoveDown size={10} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(s.id);
                          }}
                          disabled={slides.length <= 1}
                          className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400 disabled:opacity-30"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {s.title || "(ไม่มีหัวข้อ)"}
                    </h4>

                    {/* Small layout preview indicator */}
                    <div className="h-10 w-full rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center overflow-hidden scale-95 origin-left">
                      <div className="scale-[0.2] w-[400px] h-[225px] flex-shrink-0 text-center flex items-center justify-center text-slate-100">
                        {renderSlideContent(s, true)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-850 bg-slate-950/90 text-[10px] text-slate-400 flex flex-col gap-2 font-medium">
            <p className="flex items-center gap-1 text-slate-300 font-bold uppercase text-[9px] tracking-wider mb-1">
              <Eye size={12} /> วิธีใช้ขณะนำเสนอ:
            </p>
            <p className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">Right / Space</kbd> ถัดไป</p>
            <p className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">Left</kbd> ย้อนกลับ</p>
            <p className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">Esc</kbd> ออกจากโหมดพรีเซนต์</p>
          </div>
        </aside>

        {/* B. Center & Right: Current Slide Editor Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-900/50 p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Column B1: Live Preview (16:9 box) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
              <Eye size={14} /> พรีวิวสไลด์ปัจจุบัน (อัตราส่วน 16:9)
            </h3>
            
            {currentEditSlide && (
              <div className="w-full aspect-video rounded-3xl shadow-xl border border-slate-850 overflow-hidden relative flex flex-col justify-center items-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950">
                {/* Simulated theme canvas overlay */}
                <div className={`absolute inset-0 flex flex-col justify-center p-12 ${currentTheme.bodyClass}`}>
                  {renderSlideContent(currentEditSlide)}
                </div>
              </div>
            )}

            {/* Speaking Notes field */}
            {currentEditSlide && (
              <div className="bg-slate-955/40 border border-slate-850 rounded-2xl p-4 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b border-slate-850 pb-2">
                  <FileText size={12} /> บันทึกเตรียมพูด (สำหรับคนพรีเซนต์)
                </h4>
                <textarea
                  value={currentEditSlide.notes || ""}
                  onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "notes", e.target.value)}
                  placeholder="เขียนบทพูดสคริปต์ความรู้ หรือสิ่งที่อยากเน้นในหน้านี้เอาไว้เตือนตัวเองขณะพูด..."
                  rows={4}
                  className="w-full bg-transparent border-0 resize-none text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-0 leading-relaxed font-medium"
                />
              </div>
            )}
          </div>

          {/* Column B2: Slide Layout & Fields Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
              <Sliders size={14} /> แก้ไขข้อมูลเนื้อหา
            </h3>

            {currentEditSlide ? (
              <div className="bg-slate-955 border border-slate-850 rounded-3xl p-6 space-y-6">
                {/* Layout Switcher */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    เลือกรูปแบบเลย์เอาต์ (Layout Style)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["title", "bullets", "takeaway", "split", "code"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => handleUpdateSlideField(currentEditSlide.id, "layout", l)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase border transition-all text-center ${
                          currentEditSlide.layout === l
                            ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/10"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common fields: Title & Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      หัวข้อหลัก (Title)
                    </label>
                    <input
                      type="text"
                      value={currentEditSlide.title || ""}
                      onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "title", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="เขียนหัวข้อหลัก..."
                    />
                  </div>

                  {currentEditSlide.layout !== "takeaway" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        หัวข้อย่อย (Subtitle / Headline)
                      </label>
                      <input
                        type="text"
                        value={currentEditSlide.subtitle || ""}
                        onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "subtitle", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="เขียนหัวข้อย่อย..."
                      />
                    </div>
                  )}
                </div>

                {/* Layout specific fields */}
                {currentEditSlide.layout === "title" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      ผู้เขียน / แบรนด์ (Author Badge)
                    </label>
                    <input
                      type="text"
                      value={currentEditSlide.authorBadge || ""}
                      onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "authorBadge", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                      placeholder="เช่น Upskill Everyday · @fuii"
                    />
                  </div>
                )}

                {currentEditSlide.layout === "bullets" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      รายการหัวข้อประเด็น (Bullet Points)
                    </label>
                    
                    {currentEditSlide.bullets?.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-black text-slate-500 w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...(currentEditSlide.bullets || [])];
                            newBullets[idx] = e.target.value;
                            handleUpdateSlideField(currentEditSlide.id, "bullets", newBullets);
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                          placeholder="รายละเอียดของข้อดี..."
                        />
                        <button
                          onClick={() => {
                            const newBullets = currentEditSlide.bullets?.filter((_, i) => i !== idx);
                            handleUpdateSlideField(currentEditSlide.id, "bullets", newBullets);
                          }}
                          disabled={(currentEditSlide.bullets?.length || 0) <= 1}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newBullets = [...(currentEditSlide.bullets || []), ""];
                        handleUpdateSlideField(currentEditSlide.id, "bullets", newBullets);
                      }}
                      className="flex items-center gap-1 text-[10px] font-black text-violet-400 hover:text-violet-300 transition-colors pl-4 mt-1"
                    >
                      <Plus size={12} /> เพิ่มรายการบูลเล็ต
                    </button>
                  </div>
                )}

                {currentEditSlide.layout === "takeaway" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        ข้อความเน้นย้ำสัจธรรม / Quote (Takeaway Text)
                      </label>
                      <textarea
                        value={currentEditSlide.takeawayText || ""}
                        onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "takeawayText", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-loose"
                        placeholder="เขียนคำพูดกระตุ้นความคิดเด่นๆ ตรงนี้..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        ผู้เขียน / แหล่งที่มา (Author Badge)
                      </label>
                      <input
                        type="text"
                        value={currentEditSlide.authorBadge || ""}
                        onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "authorBadge", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="เช่น สรุปหนังสือ หรือชื่อแบรนด์"
                      />
                    </div>
                  </div>
                )}

                {currentEditSlide.layout === "split" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">
                        เนื้อหาซีกซ้าย
                      </label>
                      <textarea
                        value={currentEditSlide.leftColumn || ""}
                        onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "leftColumn", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors leading-relaxed"
                        placeholder="ข้อมูลเปรียบเทียบซีกซ้าย..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-wider block">
                        เนื้อหาซีกขวา
                      </label>
                      <textarea
                        value={currentEditSlide.rightColumn || ""}
                        onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "rightColumn", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors leading-relaxed"
                        placeholder="ข้อมูลเปรียบเทียบซีกขวา..."
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {currentEditSlide.layout === "code" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      ข้อมูลโค้ดหรือชุดคำสั่ง (Code Snippet / Prompt Text)
                    </label>
                    <textarea
                      value={currentEditSlide.codeBlock || ""}
                      onChange={(e) => handleUpdateSlideField(currentEditSlide.id, "codeBlock", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-violet-500 transition-colors leading-loose"
                      placeholder="// เขียนโค้ดหรือสูตร Prompt ใส่ในบล็อกสีดำที่นี่..."
                      rows={8}
                    />
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-950/30 border border-slate-850 rounded-3xl p-12 text-center text-slate-400 font-medium">
                ไม่มีข้อมูลสไลด์ขณะนี้ กรุณากดปุ่มเพิ่มสไลด์ด้านข้าง
              </div>
            )}
          </div>

        </main>
      </div>

      {/* 3. Fullscreen Present Mode Overlay */}
      <AnimatePresence>
        {isPresentMode && (
          <motion.div
            ref={presentationRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-8 overflow-hidden select-none ${currentTheme.bodyClass}`}
          >
            {/* Minimal Present Control Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs opacity-0 hover:opacity-100 transition-opacity duration-300 z-55 bg-slate-950/70 border border-slate-800 rounded-2xl px-6 py-3 backdrop-blur-md max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-200">
                  Slide {currentSlideIdx + 1} จาก {slides.length}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 font-bold">
                  หัวข้อ: {slides[currentSlideIdx]?.title}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                  title="เต็มหน้าจอ"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                
                <button
                  onClick={() => setIsPresentMode(false)}
                  className="px-4 py-1 bg-red-600 hover:bg-red-500 text-[10px] font-black text-white rounded-lg cursor-pointer transition-colors"
                >
                  ออกจากการนำเสนอ (ESC)
                </button>
              </div>
            </div>

            {/* Left/Right click triggers (invisible side areas for mouse clicks) */}
            <div 
              onClick={prevSlide}
              className="absolute left-0 top-0 bottom-0 w-24 cursor-w-resize flex items-center justify-start pl-6 opacity-0 hover:opacity-10 transition-opacity z-40"
            >
              <div className="w-12 h-12 bg-slate-900/60 border border-slate-800 text-white rounded-full flex items-center justify-center">
                <ChevronLeft size={24} />
              </div>
            </div>

            <div 
              onClick={nextSlide}
              className="absolute right-0 top-0 bottom-0 w-24 cursor-e-resize flex items-center justify-end pr-6 opacity-0 hover:opacity-10 transition-opacity z-40"
            >
              <div className="w-12 h-12 bg-slate-900/60 border border-slate-800 text-white rounded-full flex items-center justify-center">
                <ChevronRight size={24} />
              </div>
            </div>

            {/* Presentation Viewport (Locked 16:9 container, scaling to fit the window) */}
            <div className="w-full max-w-6xl aspect-video relative flex flex-col justify-center items-center p-8 md:p-16 select-text">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full h-full flex flex-col justify-center"
                >
                  {slides[currentSlideIdx] && renderSlideContent(slides[currentSlideIdx])}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom floating helper indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] opacity-10 hover:opacity-80 transition-opacity duration-300 font-bold uppercase tracking-wider z-50 text-slate-500">
              <span>กด <kbd className="bg-slate-850 px-1.5 py-0.5 rounded">Space</kbd> / <kbd className="bg-slate-850 px-1.5 py-0.5 rounded">→</kbd> เพื่อเล่นแผ่นถัดไป</span>
              <span>Upskill Everyday Slide Presentation Layer</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. Print-only Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: ${activeTheme === "brand-cream" ? "#FDF2F2" : activeTheme === "brand-white" || activeTheme === "light-snow" ? "#fff" : "#0A0000"} !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, aside, main, .no-print, div[style*="z-50"] {
            display: none !important;
          }
          .print-slides-container {
            display: block !important;
          }
          .print-slide-page {
            width: 297mm;
            height: 167mm;
            page-break-after: always;
            break-after: page;
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
            padding: 2.5cm;
            position: relative;
            overflow: hidden;
            background-color: ${activeTheme === "brand-cream" ? "#FDF2F2" : activeTheme === "brand-white" || activeTheme === "light-snow" ? "#fff" : "#0A0000"} !important;
            color: ${activeTheme === "brand-cream" || activeTheme === "brand-white" || activeTheme === "light-snow" ? "#2D0A0A" : "#f8fafc"} !important;
          }
        }
        .print-slides-container {
          display: none;
        }
      ` }} />

      {/* Outline Copy Modal */}
      <AnimatePresence>
        {showOutlineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative"
            >
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <FileText className="text-violet-400" size={20} />
                คัดลอกโครงร่างสไลด์ (สำหรับไปกดแปลงใน Canva)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                คุณสามารถนำโครงร่างข้อความนี้ไปวางในเครื่องมือ **Canva Docs** แล้วกดปุ่ม **Convert to Presentation** เพื่อสร้างเป็นสไลด์สวยงามใน Canva ได้ทันทีครับ
              </p>

              <textarea
                readOnly
                value={generateOutlineText()}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowOutlineModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-black text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={handleCopyOutline}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-black text-white rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copyOutlineSuccess ? "คัดลอกสำเร็จแล้ว!" : "คัดลอกข้อความ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Print-only slides list */}
      <div className="print-slides-container">
        {slides.map((s) => (
          <div key={s.id} className="print-slide-page">
            <div className="w-full h-full flex flex-col justify-center">
              {renderSlideContent(s)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
