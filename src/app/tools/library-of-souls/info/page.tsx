"use client";

import React, { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { results as resultsData } from "@/data/librarySoulsResults";
import { toPng } from "html-to-image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

// Correcting the import path for icons
import {
  ArrowLeft as ArrowLeftIcon,
  BookOpen as BookOpenIcon,
  Sparkles as SparklesIcon,
  ArrowRight as ArrowRightIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Heart as HeartIcon,
  Search as SearchIcon,
  MessageSquare as MessageSquareIcon,
  Users as UsersIcon,
  RefreshCw as RefreshCwIcon,
  Share2 as Share2Icon,
  Camera as CameraIcon,
  Loader2 as Loader2Icon
} from "lucide-react";

function ResultView({ resultType }: { resultType: string }) {
  const data = resultsData[resultType];
  const printRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSaveImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#F8FAFC",
      });
      const link = document.createElement("a");
      link.download = `Library-of-Souls-${resultType}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Save Image Error:", err);
      alert("ไม่สามารถเซฟภาพได้ในขณะนี้ กรุณาลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!data) return (
    <div className="text-center py-20">
      <p className="text-slate-500">ไม่พบข้อมูลจิตวิญญาณรูปแบบนี้</p>
      <Link href="/tools/library-of-souls/info" className="text-emerald-600 font-bold mt-4 inline-block">กลับหน้าหลัก</Link>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Printable Wrapper - Matches width for all sections */}
      <div ref={printRef} className="space-y-12 bg-slate-50 p-2 md:p-6 rounded-[3.5rem]">

        {/* 1. Result Hero Card */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-emerald-100 relative overflow-hidden">
          {/* Subtle Decorative Logo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-10">
            <BookOpenIcon size={60} className="text-emerald-600" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                <BookOpenIcon size={24} />
              </div>
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.4em] mt-1">
                LIBRARY OF SOULS
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
              {data.title}
            </h1>

            {/* Enlarged Book Image */}
            <div className="w-56 h-72 md:w-64 md:h-80 mb-10 transition-transform duration-500 hover:scale-105">
              <img src={data.bookImage} alt={data.title} className="w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(16,185,129,0.35)]" />
            </div>

            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl mb-10 italic">
              "{data.description}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <BrainIcon size={18} /> Deep Insight
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{data.insight}</p>
              </div>
              <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <ZapIcon size={18} /> Blind Spot
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{data.weakness}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Upskill Path Card - Width matched via container */}
        <section className="bg-emerald-900 text-white p-8 md:p-12 rounded-[3rem] shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <SparklesIcon size={20} />
              </div>
              <h2 className="text-2xl font-black">เส้นทางอัพสกิลของคุณ</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-emerald-400 font-black text-xl mb-2">{data.upskillTitle}</h3>
                <p className="text-emerald-100/70 text-base leading-relaxed">
                  {data.upskillDetail}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <BookOpenIcon size={200} />
          </div>
        </section>

      </div>

      {/* Actions (Outside Printable Area) */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-12 px-2 md:px-6">
        <Link href="/tools/library-of-souls" className="flex-1">
          <button className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95">
            <RefreshCwIcon size={18} /> ประเมินใหม่อีกครั้ง
          </button>
        </Link>
        <button
          onClick={handleSaveImage}
          disabled={isCapturing}
          className="flex-1 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
          {isCapturing ? <Loader2Icon size={18} className="animate-spin" /> : <CameraIcon size={18} />}
          {isCapturing ? "กำลังสร้างภาพ..." : "เซฟภาพสรุปผล"}
        </button>
      </div>

      <div className="text-center pb-10">
        <Link href={user ? "/dashboard" : "/"} className="text-slate-400 hover:text-emerald-600 font-bold text-sm transition-colors underline underline-offset-8 decoration-slate-200">
          {user ? "กลับสู่หน้าหลัก Dashboard" : "กลับสู่หน้าหลัก"}
        </Link>
      </div>
    </div>
  );
}

function InfoContent() {
  const results = [
    { type: 'INTJ', title: 'นักอ่านวางแผนครองโลก', bookImage: '/books/INTJ.png', desc: 'ทุกหน้าคือกลยุทธ์ เน้นการเชื่อมโยงข้อมูลเพื่อเป้าหมายระยะยาว' },
    { type: 'INTP', title: 'นักอ่านขุดโพรงกระต่าย', bookImage: '/books/INTP.png', desc: 'สงสัยทุกทฤษฎี ชอบถอดรหัสความรู้ที่ซับซ้อนและลึกซึ้ง' },
    { type: 'ENTJ', title: 'นักอ่านสาย ROI', bookImage: '/books/ENTJ.png', desc: 'เน้นความคุ้มค่า ทุกความรู้ต้องเปลี่ยนเป็นผลลัพธ์ที่จับต้องได้' },
    { type: 'ENTP', title: 'นักอ่านสายจับผิด', bookImage: '/books/ENTP.png', desc: 'ท้าทายตรรกะในหนังสือ ชอบหาไอเดียใหม่ๆ จากการโต้แย้ง' },
    { type: 'INFJ', title: 'นักอ่านสแกนวิญญาณ', bookImage: '/books/INFJ.png', desc: 'มองหาความหมายที่ซ่อนอยู่หลังบรรทัด อ่านเพื่อเข้าใจมนุษย์' },
    { type: 'INFP', title: 'นักอ่านสายดิ่ง/สายฝัน', bookImage: '/books/INFP.png', desc: 'ดื่มด่ำกับอารมณ์และอุดมการณ์ สร้างโลกใบใหม่ในจินตนาการ' },
    { type: 'ENFJ', title: 'นักอ่านสายส่งต่อ', bookImage: '/books/ENFJ.png', desc: 'อ่านเพื่อสร้างแรงบันดาลใจและส่งต่อความรู้ที่มีค่าสู่ผู้คน' },
    { type: 'ENFP', title: 'นักอ่านสายช้อป', bookImage: '/books/ENFP.png', desc: 'ชอบไอเดียที่ Spark Joy ซื้อเก่งและพร้อมเริ่มการผจญภัยใหม่ๆ' },
    { type: 'ISTJ', title: 'นักอ่านสายคู่มือ', bookImage: '/books/ISTJ.png', desc: 'เน้นความถูกต้องและเป็นลำดับขั้นตอน เชื่อถือในข้อเท็จจริง' },
    { type: 'ISFJ', title: 'นักอ่านสาย Cozy', bookImage: '/books/ISFJ.png', desc: 'ชอบหนังสือที่โอบกอดความรู้สึก รักษาความละเมียดละไมในการอ่าน' },
    { type: 'ESTJ', title: 'นักอ่านสาย Effective', bookImage: '/books/ESTJ.png', desc: 'เน้นคู่มือที่สร้างวินัยและการจัดการชีวิตให้เป็นระเบียบที่สุด' },
    { type: 'ESFJ', title: 'นักอ่านสาย Community', bookImage: '/books/ESFJ.png', desc: 'อ่านเพื่อเข้าใจสังคมและคุยกับคนอื่นได้ทุกเรื่องอย่างลื่นไหล' },
    { type: 'ISTP', title: 'นักอ่านสาย How-to-Fix', bookImage: '/books/ISTP.png', desc: 'เน้นเทคนิคที่ลงมือทำได้จริง แกะรื้อและซ่อมแซมระบบต่างๆ' },
    { type: 'ISFP', title: 'นักอ่านสายสุนทรีย์', bookImage: '/books/ISFP.png', desc: 'เน้นความสวยงามของภาษาและภาพประกอบ หนังสือคือศิลปะ' },
    { type: 'ESTP', title: 'นักอ่านสายทางลัด', bookImage: '/books/ESTP.png', desc: 'ขอสรุปเน้นๆ เอาไปปิดดีลได้ไว เน้นโอกาสและการลงมือทำ' },
    { type: 'ESFP', title: 'นักอ่านสาย Pop-Culture', bookImage: '/books/ESFP.png', desc: 'ชอบเรื่องราวที่ทันกระแส สนุกสนาน และสร้างพลังบวกให้คนรอบข้าง' },
  ];

  return (
    <>
      {/* Hero Section */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] mb-6 rotate-3 border border-emerald-100 shadow-sm">
          <BookOpenIcon size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          Library of Souls <br />
          <span className="text-emerald-600 text-3xl md:text-4xl">สไตล์การอ่านที่บอกความเป็นคุณ</span>
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          เพราะ "หนังสือ" ที่เราเลือกอ่าน ไม่ได้ให้แค่ความรู้ แต่ยังบอกเล่าตัวตนที่ซ่อนอยู่ภายใน... <br className="hidden md:block" />
          ค้นหา 16 Personalities ผ่านมุมมองของบรรณารักษ์แห่งจิตวิญญาณ
        </p>

        <p className="text-slate-400 text-[10px] mb-4 font-black uppercase tracking-[0.3em] text-center w-full opacity-60">
          ใช้เวลาประมาณ 2-3 นาที
        </p>
        <Link href="/tools/library-of-souls">
          <button className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-700 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto">
            <SparklesIcon size={20} /> เริ่มค้นหา Reading Soul
          </button>
        </Link>
        <p className="text-slate-400 text-[12px] mt-4 font-medium uppercase tracking-widest text-center w-full">
          เพื่อเก็บข้อมูล แนะนำให้ Login ผ่าน Gmail ที่หน้าแรกก่อน
        </p>
      </header>

      {/* Personality Grid */}
      <article className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
        <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-emerald-500 pl-4">The 16 Reading Souls</h2>
        <p className="text-slate-600 leading-relaxed mb-8 font-medium">
          ทุกสไตล์การอ่านมีความหมาย ค้นพบความแตกต่างของทั้ง 16 รูปแบบที่สะท้อนผ่านหน้ากระดาษ
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {results.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-200 group text-center flex flex-col items-center"
            >
              <div className="w-12 h-14 mb-3 transition-transform duration-500 group-hover:scale-110">
                <img src={item.bookImage} alt={item.title} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <p className="font-black text-emerald-800 text-[11px] mb-0.5 leading-tight">
                {item.title}
              </p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2">
                {item.type}
              </p>
            </div>
          ))}
        </div>
      </article>

      {/* Why this tool? */}
      <article className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 md:text-center leading-tight">
          ทำไม <span className="text-emerald-600">"นักพัฒนาตัวเอง"</span> ต้องเข้าใจเรื่องนี้?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-white shadow-sm border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5 font-black group-hover:scale-110 transition-transform">1</div>
            <h3 className="font-bold text-slate-800 text-base mb-2">เลือกสิ่งที่ "ใช่" ไวขึ้น</h3>
            <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">ไม่ต้องเสียเวลากับหนังสือที่ไม่คลิก เมื่อรู้สไตล์การรับข้อมูล คุณจะเลือก Content ที่ Spark Joy ได้ทันที</p>
          </div>

          <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-white shadow-sm border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5 font-black group-hover:scale-110 transition-transform">2</div>
            <h3 className="font-bold text-slate-800 text-base mb-2">อุดช่องโหว่การเรียนรู้</h3>
            <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">เข้าใจจุดบอด (Blind Spot) ของตัวเองในการอ่าน และรู้วิธีปรับจูนเพื่อรับข้อมูลให้มีประสิทธิภาพสูงสุด</p>
          </div>

          <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-white shadow-sm border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5 font-black group-hover:scale-110 transition-transform">3</div>
            <h3 className="font-bold text-slate-800 text-base mb-2">Growth Path เฉพาะตัว</h3>
            <p className="text-[12px] md:text-sm text-slate-500 leading-relaxed">รับคำแนะนำแบบ Tailor-made เพื่อพัฒนาทักษะตามสไตล์ Reading Soul ของคุณเอง</p>
          </div>

        </div>
      </article>

      {/* Unique Value Section */}
      <article className="bg-emerald-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-6 text-emerald-400">อัพสกิลการอ่านที่นี่ดีกว่ายังไง?</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><SearchIcon className="text-emerald-400" size={24} /></div>
              <div>
                <h3 className="font-bold text-lg mb-1">Soul Analysis</h3>
                <p className="text-emerald-100/60 text-sm leading-relaxed">วิเคราะห์ตัวตนผ่าน 4 มิติหลัก (Energy, Information, Decision, Lifestyle) อย่างละเอียด</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-2xl h-fit shrink-0"><ZapIcon className="text-amber-400" size={24} /></div>
              <div>
                <h3 className="font-bold text-lg mb-1">Personalized Upskill</h3>
                <p className="text-emerald-100/60 text-sm leading-relaxed">ไม่ได้บอกแค่ว่าเป็นใคร แต่บอกด้วยว่าคุณควร "ทำอะไรต่อ" เพื่อขยับเลเวลของตัวเอง</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <BookOpenIcon size={200} />
        </div>
      </article>

      {/* Bottom CTA */}
      <div className="text-center pb-10 mt-16">
        <Link href="/tools/library-of-souls">
          <button className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black text-[17px] hover:bg-emerald-700 transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto border border-emerald-500">
            เริ่มค้นหาจิตวิญญาณนักอ่านของคุณ
            <ArrowRightIcon size={22} />
          </button>
        </Link>

        {/* Quote Section */}
        <p className="text-slate-400 text-[13px] mt-8 font-medium italic">
          "เพราะหนังสือที่คุณเลือกอ่าน คือหน้าต่างที่สะท้อนความเป็นคุณได้ชัดเจนที่สุด"
        </p>
      </div>
    </>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const resultType = searchParams.get("result");

  return (
    <main className="max-w-3xl mx-auto px-4 mt-8">
      {resultType ? <ResultView resultType={resultType} /> : <InfoContent />}
    </main>
  );
}
export default function LibraryOfSoulsInfoPage() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* --- Navbar --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors font-bold text-sm">
            <ArrowLeftIcon size={18} /> กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading...</div>}>
        <PageContent />
      </Suspense>
    </div>
  );
}
