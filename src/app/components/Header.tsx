'use client';

import Link from "next/link";
import { PieChart, Users, Wallet, Quote, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  // ใช้ระยะห่างที่เท่ากันทุกหน้าตามความต้องการล่าสุด (ชิดกันมากขึ้น)
  const gapClass = "gap-8 md:gap-12 lg:gap-16";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 z-[100] h-16">
      <div className={`max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-center md:justify-start ${gapClass}`}>
        <Link href="/" className="font-black text-red-800 text-lg flex items-center gap-2 hover:scale-105 transition-transform shrink-0">
          <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-12 md:h-16 object-contain" fetchPriority="high" decoding="async" />
        </Link>

        {/* เมนู Desktop */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link href="/tools/wheel-of-life" className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors whitespace-nowrap">
            <PieChart size={18} /> สมดุลชีวิต
          </Link>
          <Link href="/tools/disc" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors whitespace-nowrap">
            <Users size={18} /> DISC
          </Link>
          <Link href="/tools/money-avatar" className="text-sm font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors whitespace-nowrap">
            <Wallet size={18} /> สไตล์การเงิน
          </Link>
          <Link href="/tools/library-of-souls" className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors whitespace-nowrap">
            <BookOpen size={18} /> ตัวตน
          </Link>
          <Link href="/tools/khomsatsat" className="text-sm font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors whitespace-nowrap">
            <Quote size={18} /> คมสัดสัด
          </Link>
        </div>
      </div>
    </nav>
  );
}
