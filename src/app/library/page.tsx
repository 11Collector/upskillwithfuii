"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Clock, ArrowRight, BookMarked, Target, 
  Crown, Sparkles, LayoutGrid, Wallet, Briefcase, ChevronRight 
} from "lucide-react";
import Link from "next/link";

// ✅ 1. นำเข้าข้อมูลจากไฟล์ที่เราแยกไว้ (ลบของเก่าที่ประกาศในไฟล์นี้ออกด้วยนะครับ)
import { mockArticles } from "@/constants/article";

// 🎨 2. Map สำหรับคุม Theme (แนะนำให้แยกไฟล์นี้ไว้ที่ @/constants/themes.ts ถ้าต้องใช้ในหน้า Detail ด้วย)
const CATEGORY_THEMES: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  "หนังสือ": { 
    icon: <BookOpen size={20} />, 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10", 
    borderColor: "border-emerald-500/20" 
  },
  "พัฒนาตัวเอง": { 
    icon: <Sparkles size={20} />, 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/10", 
    borderColor: "border-amber-500/20" 
  },
  "การเงิน & ลงทุน": { 
    icon: <Wallet size={20} />, 
    color: "text-rose-400", 
    bgColor: "bg-rose-500/10", 
    borderColor: "border-rose-500/20" 
  },
  "ธุรกิจ": { 
    icon: <Briefcase size={20} />, 
    color: "text-indigo-400", 
    bgColor: "bg-indigo-500/10", 
    borderColor: "border-indigo-500/20" 
  },
  "ทั้งหมด": { 
    icon: <LayoutGrid size={18} />, 
    color: "text-slate-400", 
    bgColor: "bg-white/5", 
    borderColor: "border-white/10" 
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } } // เร่งความเร็วการโชว์การ์ดนิดนึง
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function PremiumLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const filteredArticles = activeCategory === "ทั้งหมด" 
    ? mockArticles 
    : mockArticles.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-50 p-6 md:p-10 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- Header --- */}
        <header className="mb-16 pt-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black mb-6 border border-amber-500/20 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Crown size={14} /> <span>Exclusive Upskill Library</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            คลังสมอง <span className="text-amber-500">อัพสกิล</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">สรุปหนังสือและบทความพรีเมียมคัดมาเพื่อคุณโดยเฉพาะ</p>
        </header>

        {/* --- Categories --- */}
        <div className="flex flex-wrap gap-3 mb-14 overflow-x-auto pb-4 no-scrollbar">
          {Object.keys(CATEGORY_THEMES).map((cat) => (
            <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                    activeCategory === cat 
                    ? "bg-amber-500 text-black border-amber-400 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] scale-105" 
                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
            >
              <span className={activeCategory === cat ? "text-black" : "text-slate-500"}>
                {CATEGORY_THEMES[cat].icon}
              </span>
              {cat}
            </button>
          ))}
        </div>

        {/* --- Grid Area --- */}
        <motion.div 
            key={activeCategory} 
            initial="hidden" 
            animate="show" 
            variants={containerVariants} 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article) => {
              const theme = CATEGORY_THEMES[article.category] || CATEGORY_THEMES["ทั้งหมด"];
              return (
                <motion.div 
                    key={article.id} 
                    variants={cardVariants} 
                    layout 
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="h-full"
                >
                  <Link href={`/library/${article.slug}`} className="group block h-full">
                    <div className="h-full bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex flex-col transition-all duration-500 hover:border-amber-500/30 hover:bg-[#151515] relative overflow-hidden">
                      
                      {/* XP Badge */}
                      <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase shadow-sm">
                        <Sparkles size={10} className="fill-emerald-400" /> +5 XP
                      </div>

                      {/* Icon Section */}
                      <div className="mb-8 relative">
                         <div className={`w-14 h-14 rounded-2xl ${theme.bgColor} ${theme.borderColor} border flex items-center justify-center ${theme.color} group-hover:scale-110 transition-transform duration-500`}>
                            {theme.icon}
                         </div>
                      </div>
                      
                      <div className="flex-1">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ${theme.color}`}>
                          {article.category} • {article.readTime}
                        </span>
                        <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{article.date}</span>
                        <div className="flex items-center gap-2 text-xs font-black text-amber-500 group-hover:gap-3 transition-all uppercase tracking-tighter">
                          Read Insight <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* --- Footer --- */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-24 text-center py-12 border-t border-white/5">
           <Link href="/dashboard" className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-amber-400 hover:scale-105 shadow-xl uppercase tracking-widest">
              <LayoutGrid size={18} /> กลับสู่ DASHBOARD
           </Link>
        </motion.footer>

      </div>
    </div>
  );
}