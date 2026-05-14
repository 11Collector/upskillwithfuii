"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { BookOpen, Clock, ArrowRight, BookMarked, Target, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

// 💡 Data บทความพร้อม Summary
const mockArticles = [
  {
    id: 1,
    slug: "naval-almanack-summary",
    title: "สรุปแก่นคิด The Almanack of Naval Ravikant: สร้างความมั่งคั่งแบบไม่ต้องพึ่งโชค",
    excerpt: "ถอดรหัสวิธีคิดของ Naval Ravikant ว่าด้วยการสร้างฐานะและความสุขที่ยั่งยืนผ่าน Leverage และ Specific Knowledge...",
    summary: "ความมั่งคั่งที่ยั่งยืนเกิดจากการใช้ Leverage (คานผ่อนแรง) ในรูปแบบของ Code หรือ Media ที่ทำงานแทนเราได้ในขณะที่เราหลับ",
    category: "หนังสือ",
    readTime: "3 นาที",
    icon: <BookOpen size={20} />,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    date: "27 มี.ค. 2026"
  },
  {
    id: 2,
    slug: "let-them-theory",
    title: "Let Them Theory: ทฤษฎี 'ปล่อยเขา' เพื่อความสงบในใจ",
    excerpt: "การอนุญาตให้คนอื่นเป็นในสิ่งที่เขาเป็น โดยที่เราไม่ต้องเข้าไปแบกความคาดหวังหรือพยายามควบคุม คือกุญแจสำคัญของความสุข",
    summary: "ความสงบในใจเกิดขึ้นเมื่อเราหยุดพยายามควบคุมคนอื่น และอนุญาตให้เขาเป็นในสิ่งที่เขาเป็น (Let Them) เพื่อรักษาพลังงานมาโฟกัสตัวเอง",
    category: "พัฒนาตัวเอง",
    readTime: "3 นาที",
    icon: <BookMarked size={20} />,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    date: "28 มี.ค. 2026"
  },
  {
    id: 3,
    slug: "10-years-experience",
    title: "คุณทำงานมา 10 ปี หรือแค่มีประสบการณ์ 1 ปีที่ทำซ้ำมา 9 รอบ",
    excerpt: "เรามักภูมิใจกับคำว่า 'ประสบการณ์' แต่ในโลกยุค 2026 ที่เทคโนโลยีไปไว คำถามคือ ความเก๋าของเรายังมีมูลค่าเท่าเดิมไหม?",
    summary: "ประสบการณ์ที่มีค่าไม่ใช่จำนวนปีที่ทำมา แต่คือความสามารถในการ Unlearn ของเก่า และ Relearn ของใหม่ให้ทันโลกปัจจุบัน",
    category: "พัฒนาตัวเอง",
    readTime: "4 นาที",
    icon: <Target size={20} />, 
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    date: "31 มี.ค. 2026"
  },
  {
    id: 4,
    slug: "life-design-vs-career",
    title: "เลิกถามว่าทำงานอะไรดี แล้วเริ่มถามว่า 'อยากมีชีวิตแบบไหน?'",
    excerpt: "ความสำเร็จในการเรียน การงาน และชีวิต คือคนละเรื่องกัน... ทำไมการออกแบบชีวิตถึงสำคัญกว่าการเลือกอาชีพ?",
    summary: "ความสำเร็จในอาชีพการงานเป็นเพียงส่วนหนึ่งของชีวิต การออกแบบไลฟ์สไตล์ที่คุณต้องการก่อน จะช่วยให้คุณเลือกงานที่ตอบโจทย์ความสุขได้จริง",
    category: "พัฒนาตัวเอง",
    readTime: "4 นาที",
    icon: <Sparkles size={20} />, 
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    date: "31 มี.ค. 2026"
  }
];

const categories = ["ทั้งหมด", "หนังสือ", "พัฒนาตัวเอง", "การเงิน & ลงทุน", "Business"];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function PremiumLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const filteredArticles = activeCategory === "ทั้งหมด" 
    ? mockArticles 
    : mockArticles.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-50 p-6 md:p-10 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- Header --- */}
        <header className="mb-16 text-center md:text-left pt-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black mb-8 border border-amber-500/20 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Crown size={16} />
            <span>Exclusive Upskill Library</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            คลังสมอง <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600">อัพสกิล</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 text-lg max-w-2xl font-light">
             สรุปหนังสือและบทความดีๆที่คัดมาแล้วเพื่อคุณโดยเฉพาะ
          </motion.p>
        </header>

        {/* --- Categories --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3 mb-14 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat 
                    ? "bg-amber-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)]" 
                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* --- Grid Area --- */}
        <motion.div key={activeCategory} initial="hidden" animate="show" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((article) => (
            <motion.div key={article.id} variants={cardVariants} className="h-full">
              <Link href={`/library/${article.slug}`} className="group block h-full">
                <div className="h-full bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 flex flex-col transition-all duration-500 hover:bg-white/10 hover:border-amber-500/30 relative overflow-hidden">
                  
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black">
                    <Sparkles size={12} />
                    +5 XP
                  </div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`p-4 rounded-2xl ${article.color} border group-hover:scale-110 transition-transform`}>
                      {article.icon}
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.2em] mb-4 block">
                      {article.category} • {article.readTime}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-amber-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-[1.8] mb-10 font-light flex-1">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10 relative z-10">
                    <span className="text-xs text-slate-500">{article.date}</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:gap-3 transition-all">
                      อ่านฉบับเต็ม <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Footer (ส่วนที่หายไป) --- */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center py-12 border-t border-white/10"
        >
           <p className="text-slate-500 text-sm font-medium mb-8 flex items-center justify-center gap-2">
             <Sparkles size={16} className="text-amber-500/50" />
             LEARN UNLEARN RELEARN กับคลังสมองอัพสกิลสำหรับคุณ
             <Sparkles size={16} className="text-amber-500/50" />
           </p>
           <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-10 py-4 rounded-full font-black hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95">
              กลับสู่หน้า Dashboard ของฉัน 🚀
           </Link>
        </motion.footer>

      </div>
    </div>
  );
}