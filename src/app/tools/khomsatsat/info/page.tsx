import type { Metadata } from "next";
import KhomsatsatInfoClient from "./KhomsatsatInfoClient";

export const metadata: Metadata = {
  title: "คมสัดสัด: AI สร้างแคปชั่นและคำคมฮีลใจจากความรู้สึก | Upskill Everyday",
  description: "แอปสร้างแคปชั่นและคำคมสุดคมด้วย AI แค่เลือกอารมณ์ที่ใช่ ปัดคำที่ชอบ แล้วให้ AI ร้อยเรียงเป็นข้อคิดดีๆ พร้อมแชร์ลงโซเชียลได้ทันที ลองเลย!",
};

export default function KhomsatsatInfoPage() {
  return <KhomsatsatInfoClient />;
}
