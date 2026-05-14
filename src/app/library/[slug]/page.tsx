"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Share2, Calendar, Clock, ArrowLeft, BookOpen, User, BookMarked } from "lucide-react";
import Link from "next/link";

// 💡 ข้อมูลบทความ (เขียนเนื้อหาลงใน content ได้เลย)
const mockArticles = [
  {
    slug: "naval-almanack-summary",
    title: "สรุปแก่นคิด The Almanack of Naval Ravikant: สร้างความมั่งคั่งแบบไม่ต้องพึ่งโชค",
    content: `การสร้างความมั่งคั่งไม่ได้หมายถึงการทำงานหนักเพียงอย่างเดียว แต่คือการเข้าใจเรื่อง "Leverage" (คานผ่อนแรง) 

โดย Naval แบ่ง Leverage ออกเป็น 3 ประเภทหลัก:
1. แรงงาน (Labor): จ้างคนอื่นทำงาน (ขยายยากที่สุด)
2. เงินทุน (Capital): ใช้เงินทำงาน (ต้องมีเงินก่อน)
3. ผลิตภัณฑ์ที่ต้นทุนการผลิตซ้ำเป็นศูนย์ (Code & Media): เช่น การเขียนโปรแกรม, การอัดคลิป TikTok หรือการเขียนบทความ (ขยายง่ายที่สุดและแนะนำสำหรับยุคนี้)

หัวใจสำคัญคือการหา "Specific Knowledge" หรือทักษะเฉพาะตัวที่โลกต้องการ แต่ไม่ได้สอนในโรงเรียน...`,
    category: "หนังสือ",
    readTime: "5 นาที",
    date: "27 มี.ค. 2026",
    color: "bg-blue-50 text-blue-700 border-blue-100"
  },
  {
    slug: "let-them-theory",
    title: "Let Them Theory: ทฤษฎี 'ปล่อยเขา' เพื่อความสงบในใจ",
    content: `ทฤษฎี Let Them คือการอนุญาตให้คนอื่นเป็นในสิ่งที่เขาเป็น โดยที่เราไม่ต้องเข้าไปแบกความคาดหวังหรือพยายามควบคุม

เมื่อเราปล่อยให้คนอื่น:
- เข้าใจเราผิด... ก็ปล่อยเขา (Let them)
- ทำตัวไม่น่ารัก... ก็ปล่อยเขา (Let them)
- ไม่เลือกเรา... ก็ปล่อยเขา (Let them)

หน้าที่เราไม่ใช่การไปแก้ความคิดใคร แต่คือการรักษา 'ความสงบในใจ' ของเราเอง เมื่อเราลดการควบคุม เราจะเหลือพลังงานมาโฟกัสที่การพัฒนาตัวเองมากขึ้นครับ`,
    category: "พัฒนาตัวเอง",
    readTime: "3 นาที",
    date: "20 มี.ค. 2026",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100"
  }
];

export default function ArticleDetail() {
  const { slug } = useParams();
  const router = useRouter();

  const article = mockArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <h2 className="text-2xl font-black text-slate-800 mb-4">ไม่พบเนื้อหานี้ในคลังสมอง 😅</h2>
        <Link href="/library" className="flex items-center gap-2 text-red-800 font-bold hover:underline">
          <ArrowLeft size={18} /> กลับไปหน้าคลังหนังสือ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      {/* 🧭 Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-50 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
          >
            <ChevronLeft size={20} /> ย้อนกลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-50 text-red-800 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-widest">
             Upskill with Fuii
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="mb-12">
          <div className="inline-block mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${article.color}`}>
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm font-semibold border-y border-slate-50 py-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-300" /> <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-300" /> <span>อ่าน {article.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-300" /> <span>โดย Fuii</span>
            </div>
          </div>
        </header>

        {/* ✍️ Content Area */}
        <section className="min-h-[300px]">
          <article className="prose prose-slate max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-[2] text-lg font-medium selection:bg-red-100">
              {article.content}
            </div>
          </article>
        </section>

        {/* 🚀 Footer CTA */}
        <footer className="mt-24 p-8 md:p-12 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-black mb-4 text-white">ชอบเนื้อหาสรุปแบบนี้ไหม?</h2>
            <p className="text-slate-400 mb-8 text-sm md:text-base">
              บันทึกบทความนี้เข้า Dashboard ส่วนตัวของคุณ <br />
              เพื่อสะสมแต้มความรู้และปลดล็อกเนื้อหาพิเศษอื่นๆ
            </p>
            <Link href="/dashboard">
              <button className="bg-red-800 hover:bg-red-700 text-white px-10 py-4 rounded-full font-black shadow-xl transition-all active:scale-95 flex items-center gap-2 mx-auto">
                ไปที่ Dashboard ของฉัน 🚀
              </button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
            <BookMarked size={150} />
          </div>
        </footer>
      </main>
    </div>
  );
}