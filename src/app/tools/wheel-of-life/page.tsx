import type { Metadata } from "next";
import WheelOfLifeClient from "./WheelOfLifeClient";

export const metadata: Metadata = {
  title: "แบบประเมิน Wheel of Life ฟรี 2026 | วัดระดับชีวิต 8 ด้าน รู้ผลทันที พร้อม AI วางแผน",
  description: "แบบประเมินวงล้อชีวิต Wheel of Life ภาษาไทย ฟรี! ประเมินความสมดุลของชีวิต 8 ด้าน (สุขภาพ การเงิน การงาน ครอบครัว จิตใจ) รู้ผลทันที พร้อม AI ช่วยออกแบบแผนพัฒนาตัวเอง 7 วัน",
  keywords: [
    "wheel of life ภาษาไทย",
    "แบบประเมิน wheel of life",
    "วงล้อชีวิต 8 ด้าน",
    "แบบทดสอบ wheel of life",
    "ประเมินสมดุลชีวิต",
    "upskill ตัวเอง",
    "พัฒนาตัวเอง"
  ],
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/wheel-of-life",
  },
  openGraph: {
    title: "แบบประเมิน Wheel of Life ฟรี | วัดระดับชีวิต 8 ด้าน รู้ผลทันที พร้อม AI วางแผน",
    description: "ประเมินความสมดุลของชีวิต 8 ด้านกับ Wheel of Life ภาษาไทย รู้ผลกราฟเรดาร์ทันที พร้อมระบบ AI วิเคราะห์และแจกแผน 7 วันฟรี!",
    url: "https://www.upskilleveryday.com/tools/wheel-of-life",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Wheel of Life ภาษาไทย" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "แบบประเมิน Wheel of Life ฟรี 2026 | วัดระดับชีวิต 8 ด้าน รู้ผลทันที",
    description: "ประเมินความสมดุลชีวิต 8 ด้านฟรี พร้อม AI ช่วยวางแผน 7 วันเพื่อชีวิตที่สมดุลและเติบโต",
  },
};

export default function WheelOfLifePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wheel of Life (วงล้อชีวิต) คืออะไร?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wheel of Life คือเครื่องมือวิเคราะห์และประเมินความสมดุลของชีวิตใน 8 ด้านสำคัญ ได้แก่ สุขภาพ การเงิน การงาน ครอบครัว เพื่อนฝูง การพัฒนาตนเอง จิตใจ และการช่วยเหลือสังคม ช่วยให้คุณเห็นภาพรวมชีวิตปัจจุบันและตั้งเป้าหมายอัพสกิลได้อย่างตรงจุด"
        }
      },
      {
        "@type": "Question",
        "name": "ทำแบบประเมิน Wheel of Life ภาษาไทย มีค่าใช้จ่ายไหม?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ทำแบบประเมินได้ฟรี 100% รู้ผลกราฟวงล้อชีวิตทันที พร้อมรับบทวิเคราะห์และแผนปฏิบัติการพัฒนาตัวเอง 7 วันจาก AI Mentor"
        }
      },
      {
        "@type": "Question",
        "name": "แบบประเมิน Wheel of Life ช่วยอะไรบ้าง?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ช่วยสะท้อนจุดแข็งและจุดที่ต้องปรับปรุงในชีวิต ช่วยป้องกันภาวะหมดไฟ (Burnout) จากการทุ่มเทบางด้านมากเกินไป และช่วยสร้างแผนการดำเนินชีวิตใน 1 ปีข้างหน้าให้เติบโตอย่างสมดุล"
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
      <WheelOfLifeClient />
    </>
  );
}