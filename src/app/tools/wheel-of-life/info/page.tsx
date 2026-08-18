import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PieChart, CheckCircle2, BrainCircuit, LineChart, Sparkles, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";

// 💡 Metadata สำหรับ SEO
export const metadata: Metadata = {
  title: "Wheel of Life: แบบประเมินวงล้อชีวิต 8 ด้าน และ AI Roadmap | Upskill Everyday",
  description: "เช็กสมดุลชีวิตด้วยเครื่องมือ Wheel of Life (วงล้อชีวิต 8 ด้าน) วิเคราะห์จุดอ่อน-จุดแข็ง พร้อมรับ AI Roadmap วางแผนพัฒนาตนเอง 7 วัน เพื่อสร้างสมดุลชีวิตที่แท้จริง ฟรี!",
  keywords: ["wheel of life", "วงล้อชีวิต", "วงล้อชีวิต 8 ด้าน", "วงล้อชีวิต 10 ด้าน", "วงล้อสมดุลชีวิต", "สมดุลชีวิต", "ประเมินตัวเอง", "upskill"],
};

const faqs = [
  {
    question: "Wheel of Life (วงล้อชีวิต) คืออะไร และสำคัญอย่างไร?",
    schemaAnswer: "Wheel of Life (วงล้อสมดุลชีวิต) คือเครื่องมือประเมินภาพรวมชีวิต 8 มิติ ช่วยลดจุดบอด (Blind Spots) เช่น การโหมงานหนักจนลืมสุขภาพหรือความสัมพันธ์ เพื่อป้องกันภาวะหมดไฟ (Burnout) และช่วยวางแผนปรับสมดุลชีวิตให้ราบรื่น",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed">
          <strong>Wheel of Life (วงล้อสมดุลชีวิต)</strong> คือเครื่องมือช่วยสะท้อนภาพรวมชีวิตของคุณในทุกมิติพร้อมกัน เพื่อเช็กว่าปัจจุบันคุณให้น้ำหนักกับเรื่องไหน และกำลังหลงลืมเรื่องอะไรไปหรือเปล่า
        </p>
        <div className="space-y-2 bg-white/80 p-3.5 rounded-xl border border-slate-100 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
            <p>
              <strong className="text-red-700">ลด &quot;จุดบอด&quot; (Blind Spots):</strong> เตือนสติก่อนที่ด้านใดด้านหนึ่ง เช่น <em>สุขภาพ</em> หรือ <em>ความสัมพันธ์</em> จะพังลงโดยไม่รู้ตัว
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
            <p>
              <strong className="text-amber-800">ป้องกันภาวะหมดไฟ (Burnout):</strong> ช่วยให้รู้ว่าควรเติมพลังหรือลดภาระในมิติไหนก่อนที่จะสายเกินไป
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: "วงล้อชีวิตมีกี่ด้าน? (8 ด้าน vs 10 ด้าน ต่างกันอย่างไร?)",
    schemaAnswer: "มาตรฐานสากลที่นิยมที่สุดคือ วงล้อชีวิต 8 ด้าน ซึ่งครอบคลุมชีวิตครบถ้วน ส่วนแบบ 10 ด้านเป็นการแตกย่อยรายละเอียดเพิ่มเติม การประเมิน 8 ด้านของ Upskill Everyday ออกแบบมาให้กระชับและเห็นภาพชัดเจนที่สุด",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed">
          ในทางสากล แบบจำลองมาตรฐานที่นิยมที่สุดคือ <strong>&quot;วงล้อชีวิต 8 ด้าน&quot;</strong> เพราะครอบคลุมทุกมิติชีวิตหลักอย่างสมดุล ไม่ซับซ้อนเกินไป
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="p-3 bg-white/80 rounded-xl border border-slate-100">
            <strong className="text-slate-900 block mb-1">🎯 แบบ 8 ด้าน (มาตรฐาน)</strong>
            <p className="text-xs text-slate-500 leading-normal">สุขภาพ, การเงิน, การงาน, ครอบครัว, สังคม, พัฒนาตนเอง, จิตใจ, การแบ่งปัน (ชัดเจนและทำตามง่ายที่สุด)</p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-slate-100">
            <strong className="text-slate-900 block mb-1">🔍 แบบ 10 ด้าน</strong>
            <p className="text-xs text-slate-500 leading-normal">เป็นการแตกย่อยเพิ่ม เช่น แยกความรักออกจากครอบครัว หรือแยกเวลาพักผ่อนออกจากสุขภาพ</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: "ควรทำแบบประเมิน Wheel of Life บ่อยแค่ไหน?",
    schemaAnswer: "แนะนำให้ทำแบบประเมินทุกๆ 1-3 เดือน (Quarterly Review) หรือช่วงที่รู้สึกว่าชีวิตเริ่มตึงเครียด เพื่อติดตามความก้าวหน้าและปรับทิศทางชีวิตให้ตรงเป้าหมาย",
    content: (
      <div className="space-y-2 text-sm sm:text-base leading-relaxed">
        <p>
          แนะนำให้ทำทุกๆ <strong>1–3 เดือน (Quarterly Review)</strong> หรือทุกครั้งที่รู้สึกว่าชีวิตเริ่มเสียสมดุล เพื่อติดตามความเปลี่ยนแปลง และตั้งเป้าหมายชีวิตในไตรมาสถัดไปได้อย่างตรงจุด
        </p>
      </div>
    ),
  },
  {
    question: "หลังจากทำแบบประเมินเสร็จแล้ว ควรนำผลลัพธ์ไปใช้อย่างไรต่อ?",
    schemaAnswer: "เลือก 1-3 ด้านที่ได้คะแนนน้อยที่สุดหรือต้องการโฟกัส จากนั้นกำหนดเป้าหมายเล็กๆ (Micro-Action) ที่ทำได้ทันที พร้อมใช้คู่กับ AI Roadmap 7 วัน และ AI Mentor ในระบบ",
    content: (
      <div className="space-y-2.5 text-sm sm:text-base">
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-xs shrink-0 mt-0.5">Step 1</span>
          <p className="leading-relaxed"><strong>เลือก 1–3 ด้าน</strong> ที่ได้คะแนนน้อยที่สุดหรือต้องการโฟกัสเป็นพิเศษ</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs shrink-0 mt-0.5">Step 2</span>
          <p className="leading-relaxed"><strong>ตั้งเป้าหมายเล็กๆ (Micro-Action)</strong> เช่น เดิน 15 นาที หรือนอนก่อนเที่ยงคืน</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 mt-0.5">Step 3</span>
          <p className="leading-relaxed"><strong>ใช้ AI Roadmap & AI Mentor</strong> บนเว็บเพื่อช่วยวางแผน 7 วันแบบเฉพาะบุคคล</p>
        </div>
      </div>
    ),
  },
];

export default function WheelOfLifeInfoPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.schemaAnswer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* 💡 Structured Data สำหรับ Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
            วงล้อชีวิต (Wheel of Life) <br />
            <span className="text-red-800">เช็กสมดุลชีวิต 8 ด้าน</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            ทำงานหนักจนลืมดูแลสุขภาพ? กังวลเรื่องเงินจนความสัมพันธ์พัง? <br className="hidden md:block" />
            ใช้เวลาเพียง 5-10 นาที ประเมินชีวิตของคุณผ่านวงล้อชีวิต เพื่อค้นหาว่าจุดไหนที่คุณควร &quot;โฟกัส&quot; ในปีนี้
          </p>

          <Link href="/tools/wheel-of-life">
            <button className="bg-red-800 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-red-700 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto">
              <Sparkles size={20} /> เริ่มทำแบบประเมินฟรี
            </button>
          </Link>
          <p className="text-slate-400 text-[12px] mt-3 font-medium">
            เพื่อเก็บข้อมูล แนะนำให้ Login ผ่าน Gmail ที่หน้าแรกก่อน
          </p>
        </header>

        {/* Content Section 1: หัวข้ออัปเดตตามรูปหน้าจอของคุณ */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-red-600 pl-4">Wheel of Life คืออะไร?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            <strong>Wheel of Life (วงล้อชีวิต) </strong> คือเครื่องมือที่จะช่วยให้คุณมองเห็นภาพรวมของชีวิตได้อย่างชัดเจนที่สุด ช่วยสะท้อนว่าปัจจุบันคุณให้น้ำหนักกับเรื่องไหน และหลงลืมเรื่องอะไรไปหรือเปล่า เพื่อให้คุณวางแผนปรับปรุงล้อของชีวิตให้ &quot;กลม&quot; และหมุนไปข้างหน้าได้อย่างราบรื่น
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">ชีวิต 8 ด้านที่คุณต้องประเมิน ได้แก่</h3>
          {/* 💡 ปรับ grid สำหรับ mobile / desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 mt-4">
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
              <div
                key={index}
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-colors"
              >
                <CheckCircle2 className="text-red-600 shrink-0 mt-0.5 size-4 sm:size-5" />
                <span className="text-slate-700 text-[11px] sm:text-[15px] font-bold leading-tight break-words">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Content Section 2: ทำไมต้อง Upskill Everyday */}
        <article className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 text-amber-400">ทำไมต้องประเมินที่ Upskill Everyday?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><LineChart className="text-blue-400" size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Visualized Dashboard</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">เห็นภาพรวมชีวิตผ่านกราฟ Radar Chart ที่เข้าใจง่าย พร้อมระบบบันทึกประวัติเพื่อดูความก้าวหน้า</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><BrainCircuit className="text-emerald-400" size={24} /></div>
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

        {/* Content Section 3: FAQ คำถามที่พบบ่อย (SEO Target) */}
        <section className="bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
          <div className="flex items-start sm:items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl shrink-0 mt-0.5 sm:mt-0">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                คำถามที่พบบ่อย <br className="sm:hidden" />
                <span className="text-slate-800">เกี่ยวกับ Wheel of Life</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">รวมข้อสงสัยและแนวทางการนำวงล้อชีวิตไปปรับใช้จริง</p>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden open:bg-slate-50 open:shadow-sm open:border-slate-200"
                {...(idx === 0 ? { open: true } : {})}
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none font-bold text-slate-900 text-sm sm:text-base md:text-lg gap-3">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="text-red-600 font-black shrink-0">Q{idx + 1}:</span>
                    <span className="leading-snug">{faq.question}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-open:text-red-600 shadow-sm shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown size={18} />
                  </div>
                </summary>
                <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-600 text-sm md:text-base leading-relaxed pl-8 sm:pl-11 border-t border-slate-100/60 mt-1">
                  {faq.content}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center pb-10 mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">พร้อมจะสร้างสมดุลให้ชีวิตหรือยัง?</h2>
          <Link href="/tools/wheel-of-life">
            <button className="bg-red-800 text-white px-10 py-4 rounded-full font-black hover:bg-red-700 transition-transform hover:-translate-y-1 shadow-lg flex items-center gap-2 mx-auto">
              เริ่มทำแบบประเมินเดี๋ยวนี้
              <ArrowRight size={20} className="ml-1" />
            </button>
          </Link>
          <p className="text-slate-400 text-sm mt-4">เพราะความสำเร็จในชีวิต มันมีหลายมิติมากกว่าที่คิด</p>

          <Link href="/" className="inline-block mt-8 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors underline underline-offset-4">
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </main>
    </div>
  );
}