import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingUp, ShieldAlert, Sparkles, ArrowRight, BookOpen } from "lucide-react";

// 💡 1. Metadata เจาะกลุ่มคนลงทุน/บริหารเงิน
export const metadata: Metadata = {
  title: "9 ทรงการเงิน Money Avatar: คุณคือใครในโลกการเงิน? | Upskill Everyday",
  description: "ค้นหา 'ทรง' การเงินของคุณผ่าน 9 Money Avatar! ประเมินความเสี่ยงและระเบียบวินัย เพื่อค้นหาจุดแข็ง จุดอ่อน และหลุมพรางทางการเงินที่ฉุดรั้งความมั่งคั่งของคุณ เริ่มทำแบบทดสอบเลย",
};

export default function MoneyAvatarInfoPage() {
 
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
      
      {/* --- Navbar (แบบย่อ) --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* --- Main Content (บทความ SEO เจาะกลุ่มการเงิน) --- */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Hero Section (H1) */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] mb-6 rotate-3">
            <Wallet size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
            Money Avatar <br/>
            <span className="text-amber-700">ถอดรหัสสไตล์การเงินของคุณ</span>
          </h1>
          <p className="text-lg text-stone-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            หาเงินได้เยอะ แต่ทำไมไม่มีเงินเก็บ? ชอบลงทุนแต่ทำไมถึงติดดอยซ้ำซาก? <br className="hidden md:block"/>
            ใช้เวลาเพียง 3 นาที ค้นหา &quot;ตัวตนทางการเงิน&quot; ของคุณ เพื่ออุดรอยรั่วและสร้างแผนมั่งคั่งที่เข้ากับนิสัยคุณที่สุด
          </p>
          
          {/* 💡 CTA หลัก ดึงคนเข้าแอป */}
          <Link href="/tools/money-avatar">
            <button className="bg-gradient-to-r from-stone-900 to-stone-800 text-amber-400 px-8 py-4 rounded-full font-black text-lg hover:from-black hover:to-stone-900 shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto border border-stone-700">
              <Sparkles size={20} /> เริ่มค้นหาตัวตนการเงิน ฟรี
            </button>
          </Link>
          <p className="text-stone-400 text-[12px] mt-3 font-medium">
            เพื่อเก็บข้อมูล แนะนำให้ Login ผ่าน Gmail ที่หน้าแรกก่อน
          </p>
        </header>

        {/* Content Section 1 */}
        <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 mb-8">
          <h2 className="text-2xl font-black text-stone-800 mb-4 border-l-4 border-amber-500 pl-4">Money Avatar คืออะไร?</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            <strong>Money Avatar</strong> คือเครื่องมือวิเคราะห์จิตวิทยาการเงิน ที่ประเมินจาก 2 แกนหลัก คือ <strong>&quot;ระดับความเสี่ยงที่รับได้ (Risk)&quot;</strong> และ <strong>&quot;ระเบียบวินัยในการใช้เงิน (Discipline)&quot;</strong> เพราะวิธีการสร้างความมั่งคั่งของแต่ละคนไม่เหมือนกัน สูตรสำเร็จของคนอื่น อาจกลายเป็นหายนะของคุณ หากมันไม่ตรงกับจริตและสไตล์ของคุณเอง
          </p>

          <h3 className="text-xl font-bold text-stone-800 mt-8 mb-4">9 ทรงการเงิน คุณเป็นแบบไหนในตารางนี้?</h3>
       {/* 💡 เปลี่ยนเป็น grid-cols-3 ทั้งหมด และลด gap เหลือ 1.5 ในมือถือ */}
<div className="grid grid-cols-3 md:grid-cols-3 gap-1.5 sm:gap-3 mt-4">
  {[
    { name: "กาวสุดกราฟ", desc: "เสี่ยงสุด ใช้ฟีลลิ่งล้วน" },
    { name: "ล่าเทรนด์(ดอย)", desc: "ชอบตามกระแสหลัก" },
    { name: "เซียนระบบ", desc: "เสี่ยงสูงแต่มีแผนเป๊ะ" },
    { name: "ตัวตึงสายเปย์", desc: "หาเก่ง ใช้เก่ง" },
    { name: "มนุษย์สมดุล", desc: "ทางสายกลาง" },
    { name: "นักปั้นพอร์ต", desc: "ค่อยๆ โตอย่างมั่นคง" },
    { name: "ผู้ประสบภัย", desc: "เสี่ยงต่ำแต่ไร้ระบบ" },
    { name: "สายเซฟโซน", desc: "เน้นชัวร์ไว้ก่อน" },
    { name: "พิทักษ์เงินต้น", desc: "ความเสี่ยงต้องเป็นศูนย์" }
  ].map((item, index) => (
    <div 
      key={index} 
      // 💡 ลด p-2 ในมือถือเพื่อให้มีที่ว่างตรงกลาง และใช้ min-h เพื่อให้กล่องสูงเท่ากัน
      className="flex flex-col p-2 sm:p-4 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100 group hover:border-amber-200 hover:bg-amber-50/30 transition-colors text-center justify-center min-h-[70px] sm:min-h-[100px]"
    >
      {/* 💡 ชื่อ Avatar: ใช้ text-[10px] ในมือถือ และเบรกคำด้วย leading-tight */}
      <span className="text-stone-800 text-[10px] sm:text-[15px] font-black mb-0.5 sm:mb-1 leading-tight">
        {item.name}
      </span>
      {/* 💡 คำอธิบาย: ใช้ text-[8px] เล็กจิ๋วแต่ยังพออ่านออก เพื่อไม่ให้ล้นกล่อง */}
      <span className="text-stone-500 text-[8px] sm:text-[11px] leading-tight font-medium">
        {item.desc}
      </span>
    </div>
  ))}
</div>
        </article>

        {/* Content Section 2 (Selling Points) */}
        <article className="bg-stone-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 text-amber-400">สิ่งที่คุณจะได้รับจากแบบประเมินนี้</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><ShieldAlert className="text-red-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">วิเคราะห์หลุมพราง (Kryptonite)</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">ค้นหา &quot;จุดอ่อน&quot; ที่ทำให้คุณเสียเงินโดยไม่จำเป็น หรือพลาดโอกาสทำกำไร เพื่อตั้งรับได้อย่างถูกจุด</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><TrendingUp className="text-emerald-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">คำแนะนำ Asset ที่เหมาะสม</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">ได้รับคำแนะนำเบื้องต้นเกี่ยวกับประเภทสินทรัพย์ (Asset Allocation) ที่เข้ากับระดับความเสี่ยงของคุณ</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><BookOpen className="text-sky-400" size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg mb-1">คลังศัพท์การเงิน (Jargon Dictionary)</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">เรียนรู้ศัพท์การลงทุนระหว่างตอบคำถาม เช่น DCA, Compound Effect, Asset Allocation แบบเข้าใจง่ายสุดๆ</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* ของตกแต่ง Background */}
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Wallet size={200} />
          </div>
        </article>

        {/* Bottom CTA */}
        <div className="text-center pb-10 mt-12">
          <h2 className="text-xl font-bold text-stone-800 mb-6">อย่าปล่อยให้ความไม่รู้ ทำลายเงินในกระเป๋า</h2>
          <Link href="/tools/money-avatar">
            <button className="bg-stone-900 text-amber-400 px-10 py-4 rounded-full font-black hover:bg-black hover:shadow-amber-500/20 transition-all hover:-translate-y-1 shadow-lg flex items-center gap-2 mx-auto border border-stone-700">
              ทำแบบประเมินสไตล์การเงิน
              <ArrowRight size={20} className="ml-1" />
            </button>
          </Link>
          <p className="text-stone-400 text-sm mt-4">การใช้เงินมีความเสี่ยง จงมีความรู้ก่อนใช้เงิน</p>
          
          <Link href="/" className="inline-block mt-8 text-stone-400 hover:text-stone-600 font-bold text-sm transition-colors underline underline-offset-4">
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </main>
    </div>
  );
}