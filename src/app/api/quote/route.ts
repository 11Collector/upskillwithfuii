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
        model: "deepseek-chat", // ใช้ V3 ซึ่งเร็วและประหยัด
        messages: [
          { role: "system", content: "คุณคือนักเขียนคำคมมือฉมัง สไตล์ปรัชญาชีวิต" },
          { role: "user", content: prompt }
        ],
        stream: false,
        temperature: 0.7, // เพิ่มความสร้างสรรค์ให้คำคม
        max_tokens: 200
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