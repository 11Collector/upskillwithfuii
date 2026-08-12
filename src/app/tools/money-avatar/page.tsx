import type { Metadata } from "next";
import MoneyAvatarClient from "./MoneyAvatarClient";

export const metadata: Metadata = {
  title: "แบบประเมิน Money Avatar ฟรี | วิเคราะห์บุคลิกภาพทางการเงิน 9 แบบ รู้ผลทันที",
  description: "แบบทดสอบ Money Avatar ภาษาไทย ฟรี! ค้นหาบุคลิกภาพและความเสี่ยงทางการเงิน 9 สไตล์ รู้ผลทันที 10 ข้อสั้นๆ พร้อมแนวทางจัดพอร์ตและการออมเงิน",
  keywords: [
    "money avatar",
    "แบบประเมินการเงิน",
    "วิเคราะห์พฤติกรรมการเงิน",
    "บุคลิกภาพทางการเงิน",
    "แบบทดสอบการเงิน ฟรี",
    "จัดพอร์ตลงทุน",
    "พัฒนาตัวเอง"
  ],
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/money-avatar",
  },
  openGraph: {
    title: "แบบประเมิน Money Avatar ฟรี | ค้นหาทรงทางการเงิน 9 แบบของคุณ",
    description: "สแกนบุคลิกภาพการเงิน 9 แบบ ค้นพบจุดแข็งและหลุมพรางทางการเงินของคุณ พร้อมคลังคำศัพท์การเงินฟรี!",
    url: "https://www.upskilleveryday.com/tools/money-avatar",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Money Avatar ภาษาไทย" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "แบบประเมิน Money Avatar ฟรี | ค้นหาทรงทางการเงิน 9 แบบของคุณ",
    description: "ค้นหา Money DNA และสไตล์การลงทุนของคุณกับ Money Avatar รู้ผลทันที!",
  },
};

export default function MoneyAvatarPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Money Avatar คืออะไร?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Money Avatar คือแบบประเมินบุคลิกภาพทางการเงินที่วิเคราะห์จากระดับความเสี่ยงที่ยอมรับได้ (Risk) และวินัยการบริหารเงิน (Systematic vs Feeling) เพื่อแบ่งคนออกเป็น 9 ทรงการเงินที่สะท้อนจุดแข็งและหลุมพรางจริง"
        }
      },
      {
        "@type": "Question",
        "name": "ทำแบบประเมิน Money Avatar มีค่าใช้จ่ายไหม?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ทำแบบประเมินได้ฟรี 100% ตอบคำถามสถานการณ์จำลอง 10 ข้อ รู้ผลลัพธ์พร้อมรับภาพการ์ด Money DNA และคำศัพท์การเงินน่ารู้ฟรี"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MoneyAvatarClient />
    </>
  );
}