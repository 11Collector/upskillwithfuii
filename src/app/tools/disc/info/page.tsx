import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mic, MessageSquare, Users, Sparkles, ArrowRight, Zap } from "lucide-react";

// 💡 1. Metadata เจาะกลุ่มคนทำงาน ทีมเวิร์ก และปรับให้เข้ากับแบรนดิ้ง (SEO)
export const metadata: Metadata = {
  title: "แบบทดสอบ DISC คนทำงาน: คุณเป็นคนแบบไหนในออฟฟิศ? | Upskill with Fuii",
  description: "ทำแบบทดสอบบุคลิกภาพ DISC ค้นหาว่าคุณเป็นคนแบบไหนในที่ทำงาน เพื่อเข้าใจจุดแข็ง อัพสกิลการสื่อสาร และทำงานร่วมกับทีมได้อย่างโปรเฟสชันนัล",
};

export default function DiscInfoPage() {

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">

      {/* --- Navbar (แบบย่อ) --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-800 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-3xl mx-auto px-4 mt-8">

        {/* Hero Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] mb-6 rotate-3">
            <Mic size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Who Are You ? <br />
            <span className="text-blue-800 text-3xl md:text-4xl">คุณเป็นคนแบบไหนในออฟฟิศ</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            เคยสงสัยไหมว่าทำไมคุยกับเพื่อนร่วมงานบางคนแล้วเหนื่อย? <br className="hidden md:block" />
            ใช้เวลา 1-2 นาที ค้นหา &quot;สี&quot; ของคุณ ผ่านหลักการ DISC เพื่อรู้วิธีสื่อสารให้ได้ใจคนทุกสไตล์
          </p>

          <Link href="/tools/disc">
            <button className="bg-blue-800 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-blue-700 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto">
              <Sparkles size={20} /> เริ่มทำแบบทดสอบฟรี
            </button>
          </Link>
          <p className="text-slate-400 text-[12px] mt-3 font-medium">
            เพื่อเก็บข้อมูล แนะนำให้ Login ผ่าน Gmail ที่หน้าแรกก่อน
          </p>
        </header>

        {/* Content Section 1 */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-blue-600 pl-4">ทำไมต้องรู้ DISC ?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            <strong>DISC</strong> คือทฤษฎีบุคลิกภาพที่แบ่งคนออกเป็น 4 สไตล์หลัก การเข้าใจ DISC จะช่วยให้คุณสามารถปรับจูนการสื่อสาร (Adaptive Communication) ให้เข้ากับคนแต่ละประเภทได้ ซึ่งเป็นทักษะสำคัญของผู้นำและคนที่ประสบความสำเร็จ
          </p>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 mt-8">
            {[
              {
                id: "D",
                title: "Dominance (สีแดง)",
                desc: "เน้นผลลัพธ์ ตรงไปตรงมา ชอบความท้าทาย",
                color: "bg-red-50 border-red-100 text-red-800 hover:border-red-300"
              },
              {
                id: "I",
                title: "Influence (สีเหลือง)",
                desc: "เน้นการเข้าสังคม สนุกสนาน มีพลังงานสูง",
                color: "bg-amber-50 border-amber-100 text-amber-800 hover:border-amber-300"
              },
              {
                id: "S",
                title: "Steadiness (สีเขียว)",
                desc: "เน้นทีมเวิร์ก ใจเย็น พร้อมช่วยเหลือผู้อื่น",
                color: "bg-emerald-50 border-emerald-100 text-emerald-800 hover:border-emerald-300"
              },
              {
                id: "C",
                title: "Conscientiousness (สีน้ำเงิน)",
                desc: "เน้นข้อมูล ความแม่นยำ และความถูกต้อง",
                color: "bg-blue-50 border-blue-100 text-blue-800 hover:border-blue-300"
              }
            ].map((item) => (
              <div
                key={item.id}
                className={`p-2.5 sm:p-5 rounded-2xl border ${item.color} transition-all duration-300 shadow-sm hover:shadow-md flex flex-col`}
              >
                <p className="font-black text-[11px] sm:text-[16px] mb-1 sm:mb-1.5 leading-tight break-words">
                  {item.title}
                </p>
                <p className="text-slate-600 text-[10px] sm:text-[14px] leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* --- Content Section 3 (SEO - DISC สำหรับคนทำงาน) --- */}
        <article className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 md:text-center leading-tight">
            ทำไม <span className="text-blue-600">"คนทำงาน"</span> ยุคนี้ต้องเข้าใจ DISC ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">

            {/* ข้อ 1 */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex md:block items-start gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white shadow-sm border border-slate-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center md:mb-5 font-black text-lg md:text-xl group-hover:scale-110 transition-transform">1</div>
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] md:text-base mb-1 md:mb-2">ลดความขัดแย้งในทีม</h3>
                <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">เข้าใจเหตุผลเบื้องหลังการทำงานของเพื่อนร่วมงาน ช่วยลดแรงปะทะและคุยงานกันได้ลื่นไหลขึ้น</p>
              </div>
            </div>

            {/* ข้อ 2 */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex md:block items-start gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white shadow-sm border border-slate-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center md:mb-5 font-black text-lg md:text-xl group-hover:scale-110 transition-transform">2</div>
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] md:text-base mb-1 md:mb-2">อัปเกรดทักษะผู้นำ</h3>
                <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">เลือกวิธีมอบหมายงานและกระตุ้นลูกน้องให้ตรงกับสไตล์ของแต่ละคน เพื่อดึงศักยภาพสูงสุดออกมา</p>
              </div>
            </div>

            {/* ข้อ 3 */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group flex md:block items-start gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white shadow-sm border border-slate-100 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center md:mb-5 font-black text-lg md:text-xl group-hover:scale-110 transition-transform">3</div>
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] md:text-base mb-1 md:mb-2">เพิ่มประสิทธิภาพ</h3>
                <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">จัดวางคนให้ถูกกับงาน (Right man on the right job) ตามจุดแข็งและธรรมชาติของแต่ละสี</p>
              </div>
            </div>

          </div>
        </article>

        {/* Content Section 2 (Social Proof/Value) */}
        <article className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 text-amber-400">อัพสกิลการสื่อสารที่นี่ดีกว่ายังไง?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><MessageSquare className="text-blue-400" size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Communication Guide</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">เราสรุปวิธีดีลกับคนแต่ละสไตล์ให้คุณทันทีหลังจบแบบทดสอบ</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><Zap className="text-emerald-400" size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI Team Analysis</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">วิเคราะห์จุดแข็งและจุดที่ต้องระวังในการทำงานร่วมกับผู้อื่นแบบรายบุคคล</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Users size={200} />
          </div>
        </article>

        {/* --- Bottom CTA --- */}
        <div className="text-center pb-10 mt-16">
          <Link href="/tools/disc">
            <button className="bg-stone-900 text-white px-10 py-4 rounded-full font-black text-[17px] hover:bg-black transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto border border-stone-800">
              เริ่มวิเคราะห์บุคลิกภาพ DISC
              <ArrowRight size={22} className="text-white" />
            </button>
          </Link>

          {/* คำเตือนสไตล์คนทำธุรกิจ */}
          <p className="text-slate-400 text-[13px] mt-6 font-medium">
            เพราะการสื่อสารคือทักษะ ยิ่งเข้าใจคนยิ่งคุยสนุก
          </p>

          <Link href="/" className="inline-block mt-10 text-slate-500 hover:text-slate-800 font-bold text-base transition-colors underline underline-offset-8 decoration-slate-300">
            กลับสู่หน้าหลัก
          </Link>

          <div className="mt-12 text-center text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold">
            Created by อัพสกิลกับฟุ้ย
          </div>
        </div>

      </main>
    </div>
  );
}