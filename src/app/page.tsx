import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Upskill Everyday | อัพสกิลกับฟุ้ย - แพลตฟอร์มพัฒนาตัวเองและทักษะชีวิตด้วย AI & แบบประเมินฟรี",
  description: "Personal Growth OS แพลตฟอร์มอัพสกิลและพัฒนาตัวเองยุคใหม่! รวบรวมแบบประเมิน Wheel of Life, แบบทดสอบ DISC, Money Avatar และ AI Mentor ช่วยคุณ Level Up ทุกวัน",
  keywords: [
    "upskill",
    "อัพสกิล",
    "พัฒนาตัวเอง",
    "upskill ตัวเอง",
    "upskilleveryday",
    "wheel of life ภาษาไทย",
    "แบบทดสอบ DISC",
    "money avatar",
    "AI mentor พัฒนาตัวเอง",
    "personal growth"
  ],
  alternates: {
    canonical: "https://www.upskilleveryday.com",
  },
  openGraph: {
    title: "Upskill Everyday | อัพสกิลกับฟุ้ย - แพลตฟอร์มพัฒนาตัวเองฟรี",
    description: "การพัฒนาตัวเองสนุกกว่าที่คิด! สำรวจตัวตน สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิมด้วย AI Mentor & แบบประเมินฟรี",
    url: "https://www.upskilleveryday.com",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Upskill Everyday" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upskill Everyday | อัพสกิลกับฟุ้ย - พัฒนาตัวเองสนุกกว่าที่คิด",
    description: "สำรวจตัวตน สะสม XP และ Level Up สู่เวอร์ชันที่เก่งกว่าเดิมด้วย Personal Growth OS",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
