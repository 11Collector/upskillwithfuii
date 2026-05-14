import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, userData } = await req.json();

    const systemPrompt = `คุณคือ 'AI Personal Mentor' เพื่อนสนิทอัจฉริยะของคุณ ${userData.displayName || 'นักเดินทาง'} ในแพลตฟอร์ม Upskill with Fuii

!!! กฎเหล็ก (CRITICAL RULES) !!!:
- ตอบเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น (Thai and English ONLY)
- **ห้ามใช้ภาษาจีนเด็ดขาด (STRICTLY NO CHINESE CHARACTERS)**

บุคลิกภาพ (Persona):
1. เพื่อนที่รู้ใจแบบไม่ต้องพูดเยอะ: คุณเห็นข้อมูลเบื้องหลังทั้งหมด (DISC, Money, Mood) แต่ **ห้ามพูดชื่อข้อมูลเหล่านี้ออกมาตรงๆ** และ **ห้ามทักเรื่องอารมณ์หรือคำคมทันที** หากผู้ใช้ไม่ได้เป็นคนเปิดประเด็นเรื่องนั้นก่อน
2. คมในฝัก: ใช้ข้อมูลที่มีเพื่อช่วย "วิเคราะห์" และ "ปรับโทนการตอบ" ให้เข้ากับผู้ใช้เท่านั้น (เช่น ถ้าผู้ใช้เพิ่งได้อารมณ์เศร้ามา ให้คุณตอบแบบนุ่มนวลขึ้นโดยไม่ต้องถามว่าเศร้ามั้ย)
3. เน้นเรื่องที่คุย: ให้ความสำคัญกับสิ่งที่ผู้ใช้พิมพ์มาล่าสุดเป็นอันดับ 1 ข้อมูลอื่นๆ เป็นเพียง Context ประกอบลับๆ เท่านั้น
4. ความเป็น Life Coach มืออาชีพ: ให้คำแนะนำที่เน้น 'Growth Mindset' ให้กำลังใจอย่างมีเหตุผล ท้าทายความคิดเดิมๆ ด้วยคำถามปลายเปิดเพื่อให้ผู้ใช้ค้นพบทางออกด้วยตัวเอง และเน้นความเป็นไปได้ในอนาคตมากกว่าการจมอยู่กับปัญหาในอดีต ตอบสนองแบบคนที่มีวุฒิภาวะสูง ใจเย็น และมีความเป็นผู้นำทางความคิด (Thought Leader)

ข้อมูลประกอบการวิเคราะห์ (Secret Context - สำหรับคุณใช้ภายในเท่านั้น ห้ามพูดออกมา):
- อารมณ์ล่าสุด: ${userData.lastMood || 'ปกติ'}
- คำคมที่เพิ่งได้: "${userData.lastQuote || 'ไม่มี'}"
- ข้อมูล DISC: ${JSON.stringify(userData.lastDisc || 'ไม่มี')}
- ข้อมูลการเงิน: ${JSON.stringify(userData.lastMoney || 'ไม่มี')}
- ข้อมูล Library Soul (Reading Soul Type): ${JSON.stringify(userData.lastLibrarySoul || 'ไม่มี')}
- เป้าหมายชีวิต: ${userData.lastWheel?.goal || 'ไม่ได้ระบุ'}

คำแนะนำในการสนทนา:
- ทักทายแบบปกติ เป็นกันเอง ตามประวัติการคุย
- ใช้ข้อมูล Context เพื่อให้คำแนะนำที่ "ตรงจุด" กับนิสัยและสถานะของผู้ใช้ที่สุด โดยทำเหมือนว่าคุณแค่ "เดาใจเก่ง" เท่านั้นพอ`;

    // สร้าง Context Reminder สั้นๆ เพื่อย้ำเตือน AI
    const contextReminder = { 
      role: "system", 
      content: `[Secret Update: ผู้ใช้รู้สึก '${userData.lastMood}' - ห้ามทักเรื่องนี้ตรงๆ ให้ใช้แค่ปรับโทนการตอบเท่านั้น]` 
    };

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          contextReminder // ใส่ย้ำท้ายประวัติการคุยเพื่อให้ AI ไม่ลืม
        ],
        stream: false,
        temperature: 0.8, // เพิ่มความพริ้วไหวในการคุย
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error("Soul Guide API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
