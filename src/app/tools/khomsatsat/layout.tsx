import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คมสัดๆ | คำคมที่ตรงใจคุณในวันนี้",
  description: "รับคำคมและแนวคิดที่คัดมาเพื่อกระตุ้นความคิด เริ่มต้นวันด้วยประโยคที่มีพลัง พัฒนาตัวเองทีละขั้น",
  keywords: ["คำคม", "คมสัดๆ", "แรงบันดาลใจ", "mindset", "พัฒนาตัวเอง", "upskill"],
  openGraph: {
    title: "คมสัดๆ | คำคมที่ตรงใจคุณในวันนี้",
    description: "รับคำคมและแนวคิดที่คัดมาเพื่อกระตุ้นความคิด เริ่มต้นวันด้วยประโยคที่มีพลัง",
    url: "https://www.upskilleveryday.com/tools/khomsatsat",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "คมสัดๆ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "คมสัดๆ | คำคมที่ตรงใจคุณในวันนี้",
    description: "รับคำคมและแนวคิดที่คัดมาเพื่อกระตุ้นความคิด",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/khomsatsat",
  },
};

export default function KhomsatsatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
