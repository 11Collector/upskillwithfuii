import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wheel of Life | เช็คสมดุลชีวิตใน 8 ด้าน",
  description: "ประเมินสมดุลชีวิตของคุณใน 8 มิติ ตั้งแต่สุขภาพ ความสัมพันธ์ การเงิน ไปจนถึงการพัฒนาตัวเอง ใช้เวลาแค่ 5 นาที",
  keywords: ["wheel of life", "สมดุลชีวิต", "ประเมินตัวเอง", "พัฒนาตัวเอง", "upskill"],
  openGraph: {
    title: "Wheel of Life | เช็คสมดุลชีวิตใน 8 ด้าน",
    description: "ประเมินสมดุลชีวิตของคุณใน 8 มิติ ใช้เวลาแค่ 5 นาที รู้เลยว่าชีวิตไปต่อทิศไหน",
    url: "https://www.upskilleveryday.com/tools/wheel-of-life",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Wheel of Life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wheel of Life | เช็คสมดุลชีวิตใน 8 ด้าน",
    description: "ประเมินสมดุลชีวิตของคุณใน 8 มิติ ใช้เวลาแค่ 5 นาที",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/wheel-of-life",
  },
};

export default function WheelOfLifeLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Wheel of Life Assessment | เครื่องมือเช็คสมดุลชีวิต 8 ด้าน",
    "url": "https://www.upskilleveryday.com/tools/wheel-of-life",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 support",
    "description": "ประเมินสมดุลชีวิตของคุณใน 8 มิติ ตั้งแต่สุขภาพ ความสัมพันธ์ การเงิน ไปจนถึงการพัฒนาตัวเอง พร้อมคำแนะนำด้วย AI"
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
