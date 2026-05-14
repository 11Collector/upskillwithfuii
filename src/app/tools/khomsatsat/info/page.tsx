import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Quote, Heart, Sparkles, Feather, Download, ArrowRight } from "lucide-react";

// 💡 1. Metadata ดัก Keyword สายฮีลใจ / แคปชั่น / คำคม
export const metadata: Metadata = {
  title: "คมสัดสัด: สร้างคำคมฮีลใจจากความรู้สึกของคุณ | Upskill Everyday",
  description: "แอปสร้างคำคมและแคปชั่นสุดล้ำ แค่เลือกอารมณ์และปัดเลือกคำศัพท์ที่ทัชใจ AI จะร้อยเรียงเป็นบทกวีหรือข้อคิดดีๆ เพื่อฮีลใจและแชร์ลงโซเชียลได้ทันที",
};

export default function KhomsatsatInfoPage() {
  return (
    <div className="min-h-screen bg-fuchsia-50/50 text-slate-800 font-sans pb-20">
      
      {/* --- Navbar (แบบย่อ) --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-fuchsia-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-fuchsia-700 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* --- Main Content (บทความ SEO เจาะกลุ่ม Gen Z & ฮีลใจ) --- */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Hero Section (H1) */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-fuchsia-100 text-fuchsia-600 rounded-[2rem] mb-6 rotate-3 shadow-inner">
            <Quote size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            คมสัดสัด <br/>
            <span className="text-fuchsia-700 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-500">
              ให้ AI ช่วยเขียนคำคมแทนใจคุณ
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            หมดแพสชัน? อกหัก? หรือกำลังอินเลิฟ? <br className="hidden md:block"/>
            ไม่ต้องคิดแคปชั่นเองให้ปวดหัว แค่ปัดเลือกคำที่ &quot;ทัชใจ&quot; แล้วปล่อยให้ AI ร้อยเรียงความรู้สึกของคุณออกมาเป็นงานอาร์ต
          </p>
          
          <Link href="/tools/khomsatsat">
            <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-fuchsia-400 px-8 py-4 rounded-full font-black text-lg hover:from-black hover:to-slate-900 shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto border border-slate-700">
              <Sparkles size={20} /> เริ่มสร้างคำคมของคุณ
            </button>
          </Link>
        </header>

        {/* Content Section 1 */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-fuchsia-100 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-fuchsia-500 pl-4">แอปนี้ทำงานยังไง?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            <strong>คมสัดสัด</strong> ผสมผสานหลักจิตวิทยาการสำรวจอารมณ์ (Mood Tracking) เข้ากับ AI Generative แบบล้ำๆ โดยให้คุณเริ่มต้นจากการเลือก <strong>1 ใน 10 อารมณ์พื้นฐาน</strong> จากนั้นระบบจะสุ่มคำศัพท์นามธรรมมาให้คุณ <strong>&quot;ปัดซ้าย-ปัดขวา&quot;</strong> เพื่อเลือกคำที่ตรงกับใจคุณที่สุดในเวลานั้น
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">ตัวอย่างอารมณ์ที่คุณสามารถเลือกได้</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { emoji: "🫠", title: "เหนื่อยล้า", color: "bg-orange-50 text-orange-700 border-orange-100" },
              { emoji: "❤️", title: "คลั่งรัก", color: "bg-pink-50 text-pink-700 border-pink-100" },
              { emoji: "🍂", title: "โดดเดี่ยว", color: "bg-stone-50 text-stone-700 border-stone-200" },
              { emoji: "✨", title: "เปี่ยมหวัง", color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ].map((item, index) => (
              <div key={index} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-105 shadow-sm ${item.color}`}>
                <span className="text-3xl mb-2 drop-shadow-sm">{item.emoji}</span>
                <span className="text-[13px] font-bold">{item.title}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Content Section 2 (Selling Points) */}
        <article className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 text-fuchsia-400">ทำไมแอปนี้ถึงดีต่อใจ?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><Feather className="text-pink-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Poetic AI Engine</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">เบื้องหลังคือ AI ที่ถูกเทรนมาให้เขียนภาษาแบบกวี ไม่ใช่หุ่นยนต์ เพื่อให้ได้ข้อคิดที่ลึกซึ้ง กระแทกใจแบบสุดๆ</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><Download className="text-cyan-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Ready for Social</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">ผลลัพธ์มาในรูปแบบ Typography Art สวยงามสไตล์มินิมอล พร้อมปุ่มให้คุณกดเซฟรูปไปลง IG Story ได้ทันที</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><Heart className="text-fuchsia-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Journaling Effect</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">การได้สะท้อนความรู้สึกตัวเองผ่านการเลือกคำศัพท์ ถือเป็นการระบายความเครียดและฮีลใจ (Therapy) ชั้นดี</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* ของตกแต่ง Background */}
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Quote size={200} />
          </div>
        </article>

        {/* --- Bottom CTA (สไตล์ปุ่มดำ + ลิงก์กลับหน้าหลัก) --- */}
        <div className="text-center pb-10 mt-16">
          <Link href="/tools/khomsatsat">
            <button className="bg-slate-900 text-fuchsia-400 px-10 py-4 rounded-full font-black text-[17px] hover:bg-black transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto border border-slate-800">
              สร้างคำคมฮีลใจเดี๋ยวนี้
              <ArrowRight size={22} className="text-fuchsia-400" />
            </button>
          </Link>
          
          {/* คำเตือนสไตล์ฮีลใจ */}
          <p className="text-slate-400 text-[13px] mt-6 font-medium">
            อนุญาตให้ตัวเองรู้สึกอย่างที่รู้สึก เพราะทุกอารมณ์ล้วนมีความหมาย
          </p>
          
          <Link href="/" className="inline-block mt-10 text-slate-500 hover:text-slate-800 font-bold text-base transition-colors underline underline-offset-8 decoration-slate-300">
            กลับสู่หน้าหลัก
          </Link>

          <div className="mt-12 text-center text-slate-400/80 text-[10px] uppercase tracking-[0.2em] font-bold">
            Created by อัพสกิลกับฟุ้ย
          </div>
        </div>

      </main>
    </div>
  );
}