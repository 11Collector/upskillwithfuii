import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "@/app/globals.css";
import Link from "next/link";
import { Home, PieChart, Users, Wallet, Quote, BookOpen } from "lucide-react";
import PWALogic from "./components/PWALogic";
import BottomNavigation from "./components/ClientBottomNavigation";
import Header from "./components/Header";
import ClientMainWrapper from "./components/ClientMainWrapper";
import CookieConsent from "./components/CookieConsent";
import { Suspense } from "react";
import { PreloadAssets } from "./components/PreloadAssets";

import FloatingFAB from "./components/FloatingFAB";

// ตั้งค่าฟอนต์ Kanit
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    apple: '/logoapp.png',
  },
  title: { default: "Upskill Everyday | อัพสกิลกับฟุ้ย - พัฒนาตัวเองและทักษะชีวิตทุกวัน", template: "%s | Upskill Everyday" },
  description: "การพัฒนาตัวเองสนุกกว่าที่คิด - Personal Growth OS ที่พาคุณสำรวจตัวเอง สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิม",
  keywords: ["upskill", "อัพสกิล", "พัฒนาตัวเอง", "upskill ตัวเอง", "upskilleveryday", "wheel of life ภาษาไทย", "แบบทดสอบ DISC", "money avatar", "สรุปหนังสือพัฒนาตัวเอง", "AI mentor พัฒนาตัวเอง", "reskill"],
  metadataBase: new URL("https://www.upskilleveryday.com"),
  openGraph: {
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

import { AssessmentProvider } from "@/context/AssessmentContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Upskill Everyday",
    "alternateName": ["อัพสกิลกับฟุ้ย", "Upskill with Fuii"],
    "url": "https://www.upskilleveryday.com",
    "description": "การพัฒนาตัวเองสนุกกว่าที่คิด - Personal Growth OS ที่พาคุณสำรวจตัวเอง สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิม",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.upskilleveryday.com/library?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="th">
      <body className={`${kanit.className} bg-slate-50 text-slate-800 antialiased overflow-x-hidden`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <PWALogic />
        <PreloadAssets />

        <Header />

        <AssessmentProvider>
          <ClientMainWrapper>
            <Suspense>
              {children}
            </Suspense>
          </ClientMainWrapper>

          <Suspense fallback={<div className="h-[5.5rem]" />}>
            <BottomNavigation />
          </Suspense>
        </AssessmentProvider>

        <Suspense fallback={null}>
          <FloatingFAB />
        </Suspense>

        <CookieConsent />
      </body>
    </html>
  );
}