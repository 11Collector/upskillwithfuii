import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PieChart, CheckCircle2, BrainCircuit, LineChart, Sparkles, ArrowRight } from "lucide-react";

// 💡 Metadata สำหรับ SEO
export const metadata: Metadata = {
  title: "แบบประเมินสมดุลชีวิต 8 ด้าน (Wheel of Life) ออนไลน์ ฟรี | Upskill Everyday",
  description: "เช็กสมดุลชีวิตด้วยเครื่องมือ Wheel of Life วิเคราะห์จุดอ่อน-จุดแข็ง พร้อมรับ AI Roadmap วางแผนพัฒนาตนเอง 7 วัน เพื่อเป็นคุณในเวอร์ชันที่ดีกว่าเดิม",
};

export default function WheelOfLifeInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* --- Navbar (แบบย่อ) --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-red-800 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Hero Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] mb-6 rotate-3">
            <PieChart size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            วงล้อชีวิต (Wheel of Life) <br/>
            <span className="text-red-800">เช็กสมดุลชีวิต 8 ด้าน</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            ทำงานหนักจนลืมดูแลสุขภาพ? กังวลเรื่องเงินจนความสัมพันธ์พัง? <br className="hidden md:block"/>
            ใช้เวลาเพียง 2 นาที ประเมินชีวิตของคุณผ่านกราฟใยแมงมุม เพื่อค้นหาว่าจุดไหนที่คุณควร &quot;โฟกัส&quot; ในปีนี้
          </p>
          
          <Link href="/tools/wheel-of-life">
            <button className="bg-red-800 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-red-700 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto">
              <Sparkles size={20} /> เริ่มทำแบบประเมินฟรี
            </button>
          </Link>
        </header>

        {/* Content Section 1: หัวข้ออัปเดตตามรูปหน้าจอของคุณ */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-red-600 pl-4">Wheel of Life คืออะไร?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            <strong>Wheel of Life (วงล้อชีวิต)</strong> คือเครื่องมือที่จะช่วยให้คุณมองเห็นภาพรวมของชีวิตได้อย่างชัดเจนที่สุด ช่วยสะท้อนว่าปัจจุบันคุณให้น้ำหนักกับเรื่องไหน และหลงลืมเรื่องอะไรไปหรือเปล่า เพื่อให้คุณวางแผนปรับปรุงชีวิตให้ &quot;กลม&quot; และหมุนไปข้างหน้าได้อย่างราบรื่น
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">ชีวิต 8 ด้านที่คุณต้องประเมิน ได้แก่:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              "สุขภาพ (Health)",
              "การเงิน (Finance)",
              "การงานหรือธุรกิจ (Career & Business)",
              "ครอบครัว (Family)",
              "ความสัมพันธ์เพื่อนฝูง (Social)",
              "พัฒนาตนเอง (Self-Development)",
              "พัฒนาจิตใจ (Spiritual)",
              "ช่วยเหลือสังคม (Contribution)"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-colors">
                <CheckCircle2 size={20} className="text-red-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-[15px] font-bold">{item}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Content Section 2 */}
        <article className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 text-amber-400">ทำไมต้องประเมินที่ Upskill Everyday?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><LineChart className="text-blue-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Visualized Dashboard</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">เห็นภาพรวมชีวิตผ่านกราฟ Radar Chart ที่เข้าใจง่าย พร้อมระบบบันทึกประวัติเพื่อดูความก้าวหน้า</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><BrainCircuit className="text-emerald-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI Personalized Roadmap</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">วิเคราะห์ผลคะแนนของคุณและแนะนำแนวทางพัฒนาตัวเอง 7 วัน สำหรับด้านที่ควรปรับปรุงมากที่สุด</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <PieChart size={200} />
          </div>
        </article>

        {/* Bottom CTA */}
        <div className="text-center pb-10 mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-6">พร้อมจะสร้างสมดุลให้ชีวิตหรือยัง?</h2>
          <Link href="/tools/wheel-of-life">
            <button className="bg-red-800 text-white px-10 py-4 rounded-full font-black hover:bg-red-700 transition-transform hover:-translate-y-1 shadow-lg flex items-center gap-2 mx-auto">
              เริ่มทำแบบประเมินเดี๋ยวนี้
              <ArrowRight size={20} className="ml-1" />
            </button>
          </Link>
          <p className="text-slate-400 text-sm mt-4">ใช้เวลาเพียง 2 นาที • ฟรีไม่มีค่าใช้จ่าย</p>
          
          <Link href="/" className="inline-block mt-8 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors underline underline-offset-4">
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </main>
    </div>
  );
}