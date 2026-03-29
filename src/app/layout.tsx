import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "@/app/globals.css";
import Link from "next/link";
import { Home, PieChart, Users, Wallet, Quote } from "lucide-react";

// ตั้งค่าฟอนต์ Kanit เป็นหลักทั้งเว็บ
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ข้อมูล SEO เวลาคนแชร์ลิงก์เว็บ
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
      {/* 💡 1. แก้ไข body: ล็อกความสูงให้พอดีจอ (100dvh) และปิดการ Scroll ของหน้าจอหลัก */}
      <body className={`${kanit.className} bg-slate-50 h-[100dvh] flex flex-col text-slate-800 overflow-hidden`}>
        
        {/* === แถบ Navbar ด้านบน === */}
        {/* 💡 2. เอา sticky ออก แล้วใช้ shrink-0 เพื่อไม่ให้เมนูโดนบีบ */}
        <nav className="shrink-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* โลโก้แบรนด์ */}
            <Link href="/" className="font-black text-red-800 text-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <img src="/logo-upskill.png" alt="Upskill Everyday" className="h-12 md:h-16 object-contain" />
            </Link>

            {/* เมนูสำหรับหน้าจอคอมพิวเตอร์ (Desktop Menu) */}
            <div className="hidden md:flex gap-6">
              <Link href="/tools/wheel-of-life" className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                <PieChart size={18} /> สมดุลชีวิต
              </Link>
              <Link href="/tools/disc" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                <Users size={18} /> DISC
              </Link>
              <Link href="/tools/money-avatar" className="text-sm font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors">
                <Wallet size={18} /> สไตล์การเงิน
              </Link>
              <Link href="/tools/khomsatsat" className="text-sm font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors">
                <Quote size={18} /> คมสัดสัด
              </Link>
            </div>
          </div>
        </nav>

        {/* === พื้นที่แสดงผลแอปแต่ละตัว (Main Content) === */}
        {/* 💡 3. เปลี่ยนให้เฉพาะ main เท่านั้นที่ Scroll ได้ (overflow-y-auto) และลบ pb-20 ทิ้งไปเลย */}
        <main id="main-scroll-container" className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>

        {/* === แถบ Bottom Navigation ด้านล่าง === */}
        {/* 💡 4. เอา fixed ออก ใช้แค่ shrink-0 Flexbox จะดันมันไปอยู่ขอบล่างให้เองเป๊ะๆ */}
        <div className="shrink-0 md:hidden bg-white border-t border-slate-200 flex justify-around items-center h-[4.5rem] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-red-800 active:scale-95 transition-all">
            <Home size={22} />
            <span className="text-[10px] mt-1 font-bold">หน้าหลัก</span>
          </Link>
          <Link href="/tools/wheel-of-life" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-red-600 active:scale-95 transition-all">
            <PieChart size={22} />
            <span className="text-[10px] mt-1 font-bold">ชีวิต</span>
          </Link>
            <Link href="/tools/disc" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-600 active:scale-95 transition-all">
            <Users size={22} />
            <span className="text-[10px] mt-1 font-bold">ทำงาน</span>
          </Link>
          <Link href="/tools/money-avatar" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-amber-600 active:scale-95 transition-all">
            <Wallet size={22} />
            <span className="text-[10px] mt-1 font-bold">การเงิน</span>
          </Link>
          <Link href="/tools/khomsatsat" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-purple-600 active:scale-95 transition-all">
            <Quote size={22} />
            <span className="text-[10px] mt-1 font-bold">ฮีลใจ</span>
          </Link>
        </div>

      </body>
    </html>
  );
}