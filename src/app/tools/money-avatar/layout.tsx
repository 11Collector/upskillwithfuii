import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money Avatar | รู้จักความสัมพันธ์ของคุณกับเงิน",
  description: "ค้นพบ Money Avatar ของตัวเอง เข้าใจทัศนคติและพฤติกรรมทางการเงินที่ฝังอยู่ในตัวคุณ แล้วเริ่มต้นจัดการเงินอย่างถูกทาง",
  keywords: ["money avatar", "การเงิน", "ทัศนคติทางการเงิน", "money mindset", "พัฒนาตัวเอง", "upskill"],
  openGraph: {
    title: "Money Avatar | รู้จักความสัมพันธ์ของคุณกับเงิน",
    description: "เข้าใจทัศนคติทางการเงินของตัวเองด้วย Money Avatar ใช้เวลาแค่ 5 นาที",
    url: "https://www.upskilleveryday.com/tools/money-avatar",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Money Avatar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Avatar | รู้จักความสัมพันธ์ของคุณกับเงิน",
    description: "เข้าใจทัศนคติทางการเงินของตัวเองด้วย Money Avatar",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/money-avatar",
  },
};

export default function MoneyAvatarLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Money Avatar | เครื่องมือประเมินทัศนคติและพฤติกรรมทางการเงิน",
    "url": "https://www.upskilleveryday.com/tools/money-avatar",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 support",
    "description": "ถอดรหัสความสัมพันธ์ของคุณกับเงิน ค้นพบสไตล์ทางการเงิน (Money Avatar) และแนวทางการจัดการเงินของตัวคุณ"
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
