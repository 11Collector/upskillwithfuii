"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight, ArrowRight, BookMarked } from "lucide-react";
import Link from "next/link";

// 💡 ข้อมูลบทความ (แบบเขียนเนื้อหาเองทั้งหมด)
const mockArticles = [
  {
    id: 1,
    slug: "naval-almanack-summary",
    title: "สรุปแก่นคิด The Almanack of Naval Ravikant: สร้างความมั่งคั่งแบบไม่ต้องพึ่งโชค",
    excerpt: "ถอดรหัสวิธีคิดของ Naval Ravikant ว่าด้วยการสร้างฐานะและความสุขที่ยั่งยืนผ่าน Leverage และ Specific Knowledge...",
    category: "หนังสือ",
    readTime: "5 นาที",
    icon: <BookOpen size={20} />,
    color: "bg-blue-50 text-blue-700 border-blue-100",
    date: "27 มี.ค. 2026"
  },
  {
    id: 2,
    slug: "let-them-theory",
    title: "Let Them Theory: ทฤษฎี 'ปล่อยเขา' เพื่อความสงบในใจ",
    excerpt: "การอนุญาตให้คนอื่นเป็นในสิ่งที่เขาเป็น โดยที่เราไม่ต้องเข้าไปแบกความคาดหวังหรือพยายามควบคุม คือกุญแจสำคัญของความสุข",
    category: "พัฒนาตัวเอง",
    readTime: "3 นาที",
    icon: <BookMarked size={20} />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    date: "20 มี.ค. 2026"
  }
];

const categories = ["ทั้งหมด", "หนังสือ", "พัฒนาตัวเอง", "การเงิน & ลงทุน", "Business"];

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const filteredArticles = activeCategory === "ทั้งหมด" 
    ? mockArticles 
    : mockArticles.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-800 rounded-full text-[10px] font-black mb-6 border border-red-100 uppercase tracking-widest">
            <BookOpen size={14} />
            <span>Premium Library</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            อ่านเพื่อ <br className="md:hidden" />
            <span className="text-red-800">อัพเกรดชีวิต</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed font-medium">
            รวบรวมสรุปหนังสือ และแนวคิดธุรกิจที่คัดมาแล้วว่า <br className="hidden md:block" />
            จะช่วยให้คุณเก่งขึ้นในทุกๆ วัน
          </p>
        </header>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-slate-900 text-white shadow-xl translate-y-[-2px]" 
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((article) => (
            <Link href={`/library/${article.slug}`} key={article.id} className="group block h-full">
              <motion.div 
                whileHover={{ y: -10 }} 
                className="h-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col transition-all hover:shadow-2xl hover:border-red-100 relative overflow-hidden"
              >
                {/* Decoration Circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-red-50 transition-colors duration-500" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-4 rounded-2xl ${article.color} shadow-sm border group-hover:scale-110 transition-transform duration-500`}>
                    {article.icon}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Clock size={12} />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
                    {article.category}
                  </span>

                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 leading-snug group-hover:text-red-800 transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-[1.8] mb-10 flex-1 font-medium">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50 relative z-10">
                  <span className="text-xs text-slate-400 font-bold">{article.date}</span>
                  <div className="flex items-center gap-2 text-sm font-black text-red-800 group-hover:gap-3 transition-all">
                    อ่านบทความฉบับเต็ม <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center py-12 border-t border-slate-100">
           <p className="text-slate-400 text-sm font-bold mb-6">เนื้อหาถูกใจคุณไหม? บันทึกไว้อ่านต่อใน Dashboard นะ</p>
           <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-black hover:bg-red-800 transition-all shadow-lg active:scale-95">
              ไปที่หน้า Dashboard ของฉัน 🚀
           </Link>
        </footer>
      </div>
    </div>
  );
}