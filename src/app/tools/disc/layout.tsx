import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DISC Assessment | รู้จักสไตล์การทำงานของคุณ",
  description: "ทดสอบบุคลิกภาพแบบ DISC ค้นพบว่าคุณเป็น D, I, S หรือ C และเข้าใจวิธีทำงาน สื่อสาร และเติบโตในแบบของตัวเอง",
  keywords: ["DISC", "บุคลิกภาพ", "ประเมินตัวเอง", "สไตล์การทำงาน", "self-awareness", "upskill"],
  openGraph: {
    title: "DISC Assessment | รู้จักสไตล์การทำงานของคุณ",
    description: "ทดสอบบุคลิกภาพแบบ DISC ค้นพบว่าคุณเป็นแบบไหน และเข้าใจตัวเองลึกขึ้นในไม่กี่นาที",
    url: "https://www.upskilleveryday.com/tools/disc",
    siteName: "Upskill Everyday",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "DISC Assessment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DISC Assessment | รู้จักสไตล์การทำงานของคุณ",
    description: "ทดสอบบุคลิกภาพแบบ DISC ค้นพบว่าคุณเป็นแบบไหน",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://www.upskilleveryday.com/tools/disc",
  },
};

export default function DiscLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
