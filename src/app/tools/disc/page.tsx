import type { Metadata } from "next";
import DiscClient from "./DiscClient";

export const metadata: Metadata = {
  title: "แบบทดสอบ DISC บุคลิกภาพ ฟรี | รู้ผล 4 นิสัยการทำงาน ทันที พร้อม AI Mentor",
  description: "แบบทดสอบ DISC ภาษาไทย ฟรี 100%! เช็กบุคลิกภาพและการทำงาน 4 แบบ (Dominance, Influence, Steadiness, Compliance) รู้ผลทันที 15 ข้อสั้นๆ พร้อมแนวทางพัฒนาตัวเอง",
  keywords: [
    "แบบทดสอบ disc",
    "disc personality ภาษาไทย",
    "วิเคราะห์บุคลิกภาพ disc",
    "แบบทดสอบ disc ฟรี",
    "ลักษณะบุคคล 4 แบบ disc",
    "upskill บุคลิกภาพ",
    "พัฒนาตัวเอง"
  ],
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/disc",
  },
  openGraph: {
    title: "แบบทดสอบ DISC บุคลิกภาพ ฟรี | เช็ก 4 ธาตุแท้การทำงาน รู้ผลทันที",
    description: "ค้นหาบุคลิกภาพการทำงานแบบ DISC (D, I, S, C) ผ่าน 15 สถานการณ์ออฟฟิศสุดฮิต รู้ผลและดาวน์โหลดการ์ดสรุปฟรี!",
    url: "https://www.upskilleveryday.com/tools/disc",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "แบบทดสอบ DISC ภาษาไทย" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "แบบทดสอบ DISC บุคลิกภาพ ฟรี | รู้ผล 4 นิสัยการทำงาน ทันที",
    description: "เช็กธาตุแท้ในออฟฟิศของคุณด้วยแบบทดสอบ DISC 15 ข้อ รู้ผลทันที พร้อมคู่หูและคู่ปรับการทำงาน",
  },
};

export default function DiscPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "แบบทดสอบ DISC (Personality Assessment) คืออะไร?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "แบบทดสอบ DISC คือทฤษฎีวิเคราะห์บุคลิกภาพและพฤติกรรมการทำงานที่ได้รับการยอมรับระดับสากล แบ่งสไตล์มนุษย์ออกเป็น 4 กลุ่มหลัก: D (Dominance - เด็ดขาดสู้เป้าหมาย), I (Influence - นักสร้างบรรยากาศ), S (Steadiness - กาวใจประนีประนอม), และ C (Compliance - ละเอียดรอบคอบเป๊ะ)"
        }
      },
      {
        "@type": "Question",
        "name": "ทำแบบทดสอบ DISC ภาษาไทย มีค่าใช้จ่ายไหม?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ทำแบบทดสอบได้ฟรี 100% ใช้เวลาเพียง 3 นาที (15 ข้อสั้นๆ) รู้ผลสัดส่วน DISC ทันที พร้อมเซฟการ์ดรูปภาพสรุปผลลัพธ์ได้ฟรี"
        }
      },
      {
        "@type": "Question",
        "name": "ผลลัพธ์ DISC ช่วยอัพสกิลการทำงานได้อย่างไร?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ช่วยให้คุณรู้เท่าทันจุดแข็งและข้อควรระวังของตนเอง รู้ว่าควรจับคู่ทำงานกับคนสไตล์ไหน และช่วยปรับสไตล์การสื่อสารให้การทำงานร่วมกับผู้อื่นราบรื่นยิ่งขึ้น"
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
      <DiscClient />
    </>
  );
}