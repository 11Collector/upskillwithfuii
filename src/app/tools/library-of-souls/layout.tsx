import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library of Souls | ค้นหาหนังสือที่ใช่สำหรับตัวคุณ",
  description: "ทดสอบบุคลิกภาพการเรียนรู้ของคุณ แล้วรับคำแนะนำหนังสือที่เหมาะกับแนวคิดและเป้าหมายของคุณโดยเฉพาะ",
  keywords: ["library of souls", "หนังสือ", "สรุปหนังสือ", "การเรียนรู้", "พัฒนาตัวเอง", "upskill"],
  openGraph: {
    title: "Library of Souls | ค้นหาหนังสือที่ใช่สำหรับตัวคุณ",
    description: "ค้นพบหนังสือที่เหมาะกับตัวคุณจริงๆ ผ่านการประเมิน Library of Souls",
    url: "https://www.upskilleveryday.com/tools/library-of-souls",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Library of Souls" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Library of Souls | ค้นหาหนังสือที่ใช่สำหรับตัวคุณ",
    description: "ค้นพบหนังสือที่เหมาะกับตัวคุณจริงๆ ผ่านการประเมิน Library of Souls",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/library-of-souls",
  },
};

export default function LibraryOfSoulsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Library of Souls | เครื่องมือค้นหาหนังสือพัฒนาตัวเองที่ใช่สำหรับคุณ",
    "url": "https://www.upskilleveryday.com/tools/library-of-souls",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 support",
    "description": "ทดสอบประเภทการอ่านและตัวตนในแบบ Library of Souls เพื่อค้นหาหนังสือที่ตรงกับไลฟ์สไตล์และทิศทางการพัฒนาตัวเองของคุณ"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
