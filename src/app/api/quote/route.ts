// app/api/quote/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          // ปรับ System ให้เป็นที่ปรึกษาที่ฉลาดและอบอุ่น ตามสไตล์ที่คุณฟุ้ยต้องการ
          { role: "system", content: "คุณคือที่ปรึกษาและ Life Coach ที่เชี่ยวชาญการวิเคราะห์ศักยภาพมนุษย์ พูดจาเป็นกันเอง อบอุ่น และให้คำแนะนำที่นำไปใช้ได้จริง" },
          { role: "user", content: prompt }
        ],
        stream: false,
        temperature: 0.4, // ลดลงนิดหน่อยเพื่อให้แผน 7 วันมีความสมเหตุสมผล ไม่เพ้อฝันเกินไป
        max_tokens: 1500  // 🔥 เพิ่มเป็น 1500 เพื่อให้ครอบคลุมเนื้อหาทั้งหมด ไม่โดนตัดจบ
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const generatedQuote = data.choices[0].message.content.trim();

    return NextResponse.json({ quote: generatedQuote });

  } catch (error: any) {
    console.error("DeepSeek Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}