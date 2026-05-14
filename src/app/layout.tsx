import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "@/app/globals.css";
import Link from "next/link";
import { Home, PieChart, Users, Wallet, Quote, BookOpen } from "lucide-react";
import PWALogic from "./components/PWALogic";
import BottomNavigation from "./components/BottomNavigation";
import { Suspense } from "react";

// ตั้งค่าฟอนต์ Kanit
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: "อัพสกิลทุกวัน | เป็นคุณในเวอร์ชันที่ดีกว่าเดิม",
  description: "รวมเครื่องมือวิเคราะห์การทำงาน การเงิน และสมดุลชีวิต เพื่อสร้าง Mindset ของคนที่ประสบความสำเร็จ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${kanit.className} bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] text-slate-800 antialiased`}>
        <PWALogic />

        {/* === แถบ Navbar ด้านบน === */}
        {/* 💡 2. ใช้ fixed top-0 แปะติดขอบบนสุดเสมอ และตั้ง z-[100] ไม่ให้ใครทับ */}
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 z-[100] h-16">
          <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between gap-8">
            <Link href="/" className="font-black text-red-800 text-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-12 md:h-16 object-contain" />
            </Link>

            {/* เมนู Desktop */}
            <div className="hidden md:flex gap-8">
              <Link href="/tools/wheel-of-life" className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                <PieChart size={18} /> สมดุลชีวิต
              </Link>
              <Link href="/tools/disc" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                <Users size={18} /> DISC
              </Link>
              <Link href="/tools/money-avatar" className="text-sm font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors">
                <Wallet size={18} /> สไตล์การเงิน
              </Link>
              <Link href="/tools/library-of-souls" className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors">
                <BookOpen size={18} /> ตัวตน
              </Link>
              <Link href="/tools/khomsatsat" className="text-sm font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors">
                <Quote size={18} /> คมสัดสัด
              </Link>
            </div>
          </div>
        </nav>


        <main id="main-scroll-container" className="w-full relative min-h-screen flex flex-col pt-16 pb-[4.5rem] md:pb-0">
          <Suspense>
            {children}
          </Suspense>
        </main>

        <Suspense fallback={<div className="h-[5.5rem]" />}>
          <BottomNavigation />
        </Suspense>

      </body>
    </html>
  );
}