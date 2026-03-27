import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body; 

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ลืมใส่ GEMINI_API_KEY ในไฟล์ .env.local" }, { status: 500 });
    }

    // 💡 เปลี่ยนชื่อโมเดลกลับเป็น gemini-flash-latest ที่เคยทำงานได้เป๊ะๆ
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      // ดึงข้อความ error จาก Google ออกมาตรงๆ
      throw new Error(data.error.message);
    }

    // ส่งคำตอบโครงสร้างดิบๆ กลับไปให้หน้าบ้าน
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("🚨 AI Route Error:", error);
    return NextResponse.json({ error: error?.message || "Unknown Error" }, { status: 500 });
  }
}