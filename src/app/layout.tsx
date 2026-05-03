import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "@/app/globals.css";
import Link from "next/link";
import { Home, PieChart, Users, Wallet, Quote, BookOpen } from "lucide-react";
import PWALogic from "./components/PWALogic";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
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
      <body className={`${kanit.className} bg-slate-50 text-slate-800 antialiased overflow-x-hidden`}>
        <PWALogic />

        <Header />


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