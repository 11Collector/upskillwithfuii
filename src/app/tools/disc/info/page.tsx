import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Users, Sparkles, ArrowRight, Zap, HelpCircle, ChevronDown } from "lucide-react";

// 💡 1. Metadata เจาะกลุ่มคนค้นหา DISC ภาษาไทย และคนทำงาน (SEO)
export const metadata: Metadata = {
  title: "แบบทดสอบ DISC: คุณเป็นคนแบบไหนในออฟฟิศ? | Upskill Everyday",
  description: "ทำแบบทดสอบบุคลิกภาพ DISC ภาษาไทย ฟรี 100%! ค้นหาตัวตน 4 สไตล์ (D กระทิง, I อินทรี, S หนู, C หมี) ผ่านสถานการณ์ทำงานจริง 15 ข้อ พร้อมแนวทางสื่อสารและพัฒนาตัวเองด้วย AI",
  keywords: [
    "DISC",
    "แบบทดสอบ DISC",
    "DISC คืออะไร",
    "แบบประเมิน DISC",
    "DISC ภาษาไทย",
    "DISC 4 แบบ",
    "สัตว์ 4 ทิศ",
    "บุคลิกภาพคนทำงาน",
    "แบบทดสอบบุคลิกภาพ",
    "upskill",
  ],
};

const discFaqs = [
  {
    question: "คนเราสามารถมีบุคลิกภาพ DISC มากกว่าหนึ่งแบบในคนเดียวได้ไหม?",
    schemaAnswer: "มีได้แน่นอน! ทุกคนมีสัดส่วนของทั้ง 4 สี (D, I, S, C) อยู่ในตัวเอง โดยจะมี 1-2 สีเด่นที่เป็นธรรมชาติหลัก และสามารถปรับเปลี่ยนการแสดงออกตามบทบาทหน้าที่และสถานการณ์ได้",
    content: (
      <div className="space-y-2.5 text-sm sm:text-base leading-relaxed">
        <p>
          <strong>มีได้แน่นอน 100% ครับ!</strong> ในความเป็นจริง ไม่มีใครเป็นสีใดสีหนึ่งแบบ 100% มนุษย์ทุกคนมีส่วนผสมของทั้ง 4 สีอยู่ในตัวเอง โดยมักจะมี <strong>1–2 สีเด่น</strong> ที่เป็นธรรมชาติหลักในการตัดสินใจ
        </p>
        <div className="bg-white/80 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm space-y-1.5">
          <p className="text-slate-700">
            • <strong>Primary Style:</strong> สีเด่นหลัก เช่น เป็นคนลุยเป้าหมาย (D) หรือมนุษยสัมพันธ์ดี (I)
          </p>
          <p className="text-slate-700">
            • <strong>Adaptive Style:</strong> สีย่อยที่สามารถดึงออกมาใช้ตามบทบาทหน้าที่ ความกดดัน หรือประสบการณ์ที่เติบโตขึ้น
          </p>
        </div>
      </div>
    ),
  },
  {
    question: "ไม่ได้ทำงานออฟฟิศ (ฟรีแลนซ์ / เจ้าของธุรกิจ / นักศึกษา) ทำแบบทดสอบนี้ได้ไหม?",
    schemaAnswer: "ทำได้ 100%! เพราะสถานการณ์ในแบบทดสอบจำลองวิธีคิด การแก้ปัญหา และการสื่อสารกับคนในสถานการณ์ต่างๆ ซึ่งสะท้อนบุคลิกภาพจริงในชีวิตประจำวันและงานทุกรูปแบบ",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed">
          <strong>ทำได้ 100% และแม่นยำเช่นเดียวกันครับ!</strong> แม้บริบทคำถามจะจำลองสถานการณ์การทำงาน แต่แก่นแท้คือการวัด <strong>&quot;สัญชาตญาณการตัดสินใจและการสื่อสารกับผู้คน&quot;</strong>
        </p>
        <div className="space-y-2 bg-white/80 p-3.5 rounded-xl border border-slate-100 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <p>
              <strong>ฟรีแลนซ์ / ธุรกิจส่วนตัว:</strong> ให้มองว่า <em>&quot;บอส&quot;</em> คือลูกค้าหรือผู้ว่าจ้าง และ <em>&quot;เพื่อนร่วมทีม&quot;</em> คือพาร์ตเนอร์หรือฟรีแลนซ์ที่ทำงานร่วมกัน
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
            <p>
              <strong>นักศึกษา / บุคคลทั่วไป:</strong> สะท้อนวิธีที่คุณทำงานกลุ่ม ดีลกับอาจารย์ หรือรับมือกับความกดดันในชีวิตประจำวัน
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: "ทำไมแบบทดสอบ DISC ที่นี่ถึงเป็นแนวสถานการณ์แชต (Scenario-based)?",
    schemaAnswer: "เพราะการเลือกตอบในสถานการณ์จำลอง 15 ข้อสั้นๆ ช่วยสะท้อนพฤติกรรมจริงตามสัญชาตญาณได้ตรงกว่าการตอบคำถามทฤษฎี 1-5 และใช้เวลาเพียง 2-3 นาที",
    content: (
      <div className="space-y-2 text-sm sm:text-base leading-relaxed">
        <p>
          แบบทดสอบ DISC ทั่วไปมักเป็นข้อความทฤษฎียาวๆ ที่ชวนให้เราเลือกคำตอบที่ &quot;ดูดี&quot; แต่ที่ <strong>Upskill Everyday</strong> เราจำลองเป็น <strong>15 สถานการณ์แชตสุดเรียล</strong> ที่พบเจอได้บ่อย เพื่อให้คุณตอบสนองตาม <strong>สัญชาตญาณจริง</strong> ได้ผลลัพธ์ที่ตรงจุดและสนุก ไม่น่าเบื่อ
        </p>
      </div>
    ),
  },
  {
    question: "รู้ผล DISC แล้วนำไปปรับใช้ในการทำงานและการสื่อสารอย่างไรต่อ?",
    schemaAnswer: "นำไปปรับสไตล์การสื่อสารให้ตรงกับคนแต่ละสี (Adaptive Communication), รู้จุดแข็งและข้อควรระวังของตัวเอง, และใช้วิเคราะห์ความเข้ากันได้กับเพื่อนร่วมทีม",
    content: (
      <div className="space-y-2.5 text-sm sm:text-base">
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-xs shrink-0 mt-0.5">Step 1</span>
          <p className="leading-relaxed"><strong>เข้าใจจุดแข็งและจุดบอด:</strong> รู้ว่าตัวเองมีธรรมชาติการทำงานแบบไหน อะไรทำให้หมดพลัง</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 mt-0.5">Step 2</span>
          <p className="leading-relaxed"><strong>ปรับสไตล์การคุยงาน:</strong> รู้ทันทีว่าคุยกับคนสีแดงต้องสรุปสั้น, คนสีเหลืองต้องเปิดด้วยบรรยากาศ, คนสีเขียวต้องให้เวลา, คนสีน้ำเงินต้องมีข้อมูล</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs shrink-0 mt-0.5">Step 3</span>
          <p className="leading-relaxed"><strong>ใช้ AI วิเคราะห์คู่หู-คู่ปรับ:</strong> ระบบจะบอกทันทีว่าคุณทำงานเข้าขากับใครที่สุด พร้อมคำแนะนำจาก AI Mentor</p>
        </div>
      </div>
    ),
  },
  {
    question: "ทำแบบทดสอบ DISC ที่นี่มีค่าใช้จ่ายไหม?",
    schemaAnswer: "ฟรี 100% ไม่มีค่าใช้จ่าย ใช้เวลาเพียง 2-3 นาที รู้ผลคะแนนสัดส่วน DISC ทันที พร้อมรับการ์ดสรุปผลและสะสม 50 XP",
    content: (
      <div className="space-y-2 text-sm sm:text-base leading-relaxed">
        <p>
          <strong>ฟรี 100% ไม่มีค่าใช้จ่ายแอบแฝง</strong> ใช้เวลาเพียง 2–3 นาที รู้ผลสัดส่วน DISC ทันที พร้อมดาวน์โหลดการ์ดสรุปผลบุคลิกภาพ และรับ <strong>+50 XP</strong> เพื่อนำไปใช้กับระบบพัฒนาตัวเองในเว็บได้เลยครับ
        </p>
      </div>
    ),
  },
];

export default function DiscInfoPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": discFaqs.map((faq) => ({
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
            <Users size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            แบบทดสอบ DISC <br />
            <span className="text-blue-800 text-2xl md:text-4xl">คุณเป็นคนแบบไหนในออฟฟิศ?</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            เคยสงสัยไหมว่าทำไมคุยกับเพื่อนร่วมงานบางคนแล้วเหนื่อย? <br className="hidden md:block" />
            ใช้เวลาเพียง 2–3 นาที ค้นหา &quot;สี&quot; ของคุณ ผ่านหลักการ DISC เพื่อรู้วิธีสื่อสารให้ได้ใจคนทุกสไตล์
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

        {/* Content Section 1: ทำไมต้องรู้ DISC */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-blue-600 pl-4">DISC คืออะไร?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            <strong>DISC</strong> คือทฤษฎีบุคลิกภาพที่แบ่งคนออกเป็น 4 สไตล์หลัก การเข้าใจ DISC จะช่วยให้คุณสามารถปรับจูนการสื่อสาร (Adaptive Communication) ให้เข้ากับคนแต่ละประเภทได้ ซึ่งเป็นทักษะสำคัญของผู้นำและคนที่ประสบความสำเร็จ
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-8">
            {[
              {
                id: "D",
                letter: "D",
                animal: "กระทิง",
                name: "Dominance",
                colorName: "สีแดง",
                desc: "เน้นผลลัพธ์ ตรงไปตรงมา กล้าตัดสินใจ ชอบความท้าทาย",
                bg: "bg-red-50/50 hover:bg-red-50/90",
                border: "border-red-100/80 hover:border-red-300",
                badgeBg: "bg-red-500 text-white",
                textColor: "text-red-950",
              },
              {
                id: "I",
                letter: "I",
                animal: "อินทรี",
                name: "Influence",
                colorName: "สีเหลือง",
                desc: "เน้นการเข้าสังคม สนุกสนาน มีพลังงานสูง สร้างแรงบันดาลใจ",
                bg: "bg-amber-50/50 hover:bg-amber-50/90",
                border: "border-amber-100/80 hover:border-amber-300",
                badgeBg: "bg-amber-500 text-white",
                textColor: "text-amber-950",
              },
              {
                id: "S",
                letter: "S",
                animal: "หนู",
                name: "Steadiness",
                colorName: "สีเขียว",
                desc: "เน้นทีมเวิร์ก ใจเย็น รับฟังเก่ง พร้อมช่วยเหลือและซัพพอร์ต",
                bg: "bg-emerald-50/50 hover:bg-emerald-50/90",
                border: "border-emerald-100/80 hover:border-emerald-300",
                badgeBg: "bg-emerald-600 text-white",
                textColor: "text-emerald-950",
              },
              {
                id: "C",
                letter: "C",
                animal: "หมี",
                name: "Conscientiousness",
                colorName: "สีน้ำเงิน",
                desc: "เน้นข้อมูล ความแม่นยำ มีระเบียบรอบคอบ และถูกต้องตามแบบแผน",
                bg: "bg-blue-50/50 hover:bg-blue-50/90",
                border: "border-blue-100/80 hover:border-blue-300",
                badgeBg: "bg-blue-600 text-white",
                textColor: "text-blue-950",
              },
            ].map((item) => (
              <div
                key={item.id}
                className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border ${item.border} ${item.bg} transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                    <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl ${item.badgeBg} font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs shrink-0`}>
                      {item.letter}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-white/90 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-slate-100/80 shadow-xs truncate">
                      {item.colorName} • {item.animal}
                    </span>
                  </div>

                  <h3 className={`font-black text-[13px] sm:text-lg ${item.textColor} tracking-tight leading-tight mt-1 sm:mt-1.5 break-words`}>
                    {item.name}
                  </h3>
                </div>

                <p className="text-slate-600 text-[11px] sm:text-[13px] leading-tight sm:leading-relaxed font-medium mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-black/5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Content Section 2: ประโยชน์ของ DISC สำหรับคนทำงาน */}
        <article className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 md:text-center leading-tight">
            ทำไม <span className="text-blue-600">&quot;คนทำงาน&quot;</span> ยุคนี้ต้องเข้าใจ DISC ?
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

        {/* Content Section 3: จุดเด่นของเว็บเรา */}
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

        {/* Content Section 4: FAQ คำถามที่พบบ่อย (SEO Target) */}
        <section className="bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
          <div className="flex items-start sm:items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0 mt-0.5 sm:mt-0">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                คำถามที่พบบ่อย <br className="sm:hidden" />
                <span className="text-slate-800">เกี่ยวกับแบบทดสอบ DISC</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">รวมข้อสงสัยและแนวทางการนำ DISC ไปปรับใช้จริง</p>
            </div>
          </div>

          <div className="space-y-4">
            {discFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden open:bg-slate-50 open:shadow-sm open:border-slate-200"
                {...(idx === 0 ? { open: true } : {})}
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none font-bold text-slate-900 text-sm sm:text-base md:text-lg gap-3">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="text-blue-600 font-black shrink-0">Q{idx + 1}:</span>
                    <span className="leading-snug">{faq.question}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-open:text-blue-600 shadow-sm shrink-0 transition-transform duration-200 group-open:rotate-180">
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

        {/* --- Bottom CTA --- */}
        <div className="text-center pb-10 mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">พร้อมค้นหาตัวตนของคุณหรือยัง?</h2>
          <Link href="/tools/disc">
            <button className="bg-blue-800 text-white px-10 py-4 rounded-full font-black text-[17px] hover:bg-blue-700 transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto border border-blue-900">
              เริ่มทำแบบทดสอบ DISC
              <ArrowRight size={22} className="text-white" />
            </button>
          </Link>

          <p className="text-slate-400 text-[13px] mt-4 font-medium">
            เพราะการสื่อสารคือทักษะ ยิ่งเข้าใจคน ยิ่งทำงานสนุก
          </p>

          <Link href="/" className="inline-block mt-8 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors underline underline-offset-4">
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </main>
    </div>
  );
}