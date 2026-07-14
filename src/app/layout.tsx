import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "@/app/globals.css";
import Link from "next/link";
import { Home, PieChart, Users, Wallet, Quote, BookOpen } from "lucide-react";
import PWALogic from "./components/PWALogic";
import BottomNavigation from "./components/ClientBottomNavigation";
import Header from "./components/Header";
import ClientMainWrapper from "./components/ClientMainWrapper";
import { Suspense } from "react";
import { PreloadAssets } from "./components/PreloadAssets";

// ตั้งค่าฟอนต์ Kanit
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    apple: '/logoapp-v2.png',
  },
  title: { default: "อัพสกิลกับฟุ้ย | พัฒนาตัวเองทุกวัน", template: "%s | Upskill Everyday" },
  description: "เครื่องมือประเมินตัวเอง สรุปหนังสือ และคุยกับพี่ฟุ้ย (AI Mentor ส่วนตัว) ช่วยให้คุณเข้าใจตัวเองและพัฒนาได้ตรงจุด",
  keywords: ["พัฒนาตัวเอง", "mindset", "upskill", "DISC", "wheel of life", "การเงิน", "สรุปหนังสือ", "AI mentor"],
  metadataBase: new URL("https://www.upskilleveryday.com"),
  openGraph: {
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
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
        <PreloadAssets />

        <Header />

        <ClientMainWrapper>
          <Suspense>
            {children}
          </Suspense>
        </ClientMainWrapper>

        <Suspense fallback={<div className="h-[5.5rem]" />}>
          <BottomNavigation />
        </Suspense>

      </body>
    </html>
  );
}