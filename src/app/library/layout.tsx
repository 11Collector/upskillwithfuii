import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คลังสมองอัพสกิล | สรุปหนังสือและบทความพัฒนาตัวเอง",
  description: "รวมสรุปหนังสือและบทความเด็ดๆ ด้านพัฒนาตัวเอง การเงิน และ Mindset คัดมาเพื่อคุณโดยเฉพาะ อ่านง่าย นำไปใช้ได้จริง",
  keywords: ["พัฒนาตัวเอง", "สรุปหนังสือ", "mindset", "การเงิน", "upskill", "อัพสกิล"],
  openGraph: {
    title: "คลังสมองอัพสกิล | สรุปหนังสือและบทความพัฒนาตัวเอง",
    description: "รวมสรุปหนังสือและบทความเด็ดๆ ด้านพัฒนาตัวเอง การเงิน และ Mindset คัดมาเพื่อคุณโดยเฉพาะ",
    url: "https://www.upskilleveryday.com/library",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-library.png", width: 1200, height: 630, alt: "คลังสมองอัพสกิล" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "คลังสมองอัพสกิล | สรุปหนังสือและบทความพัฒนาตัวเอง",
    description: "รวมสรุปหนังสือและบทความเด็ดๆ ด้านพัฒนาตัวเอง การเงิน และ Mindset",
    images: ["/og-library.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/library",
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
