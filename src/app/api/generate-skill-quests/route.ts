import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, isAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  trackId: z.string(),
  roundNumber: z.number().optional(),
  userGoal: z.string().optional(),
  disc: z.unknown().optional(),
  money: z.unknown().optional(),
  librarySoul: z.unknown().optional(),
  ghostResult: z.unknown().optional(),
  mementoReflections: z.unknown().optional(),
  birthdate: z.string().optional(),
  expectedAge: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuthToken(req);
    if (isAuthError(authResult)) {
      return authResult;
    }

    const { uid } = authResult;
    const rateCheck = checkRateLimit(uid, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "คำขอถี่เกินไป กรุณารอครู่นะครับ" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const { trackId, roundNumber, userGoal, disc, money, librarySoul, ghostResult, mementoReflections, birthdate, expectedAge } = parsed.data;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY Missing" }, { status: 500 });
    }

    const round = roundNumber || 1;
    const roundContext = round > 1
      ? `⭐ ผู้เรียนกำลังเรียนวิชานี้ซ้ำเป็นรอบที่ ${round} (Level Up Edition)! 
    - กรุณาเพิ่มระดับความท้าทาย ความลึกซึ้ง และการลงมือทำขั้นสูง (Advanced Challenge) สำหรับรอบที่ ${round} นี้
    - ห้ามซ้ำกับโจทย์พื้นฐานของรอบที่ 1 โดยเน้นการยกระดับผลลัพธ์และการท้าทายศักยภาพที่สูงขึ้นอย่างชัดเจน!`
      : `ผู้เรียนกำลังเรียนวิชานี้เป็นรอบแรก (Foundation Edition): เน้นการปูพื้นฐานและสร้างนิสัยประจำวัน`;

    const systemPrompt = `คุณคือ พี่ฟุ้ย AI Mentor โค้ชพัฒนาตัวเองชั้นนำ
ภารกิจของคุณคือการออกแบบ "แผนฝึกฝนวิชาชีวิต 7 วัน (7-Day Skill Sprint)" สำหรับวิชา: "${trackId}" 

🎯 ระดับการเรียนวิชาซ้ำ (Replay Round):
${roundContext}

ข้อมูลตัวตน 6 มิติของผู้เรียน (Ultimate Personal Blueprint):
- 🎯 เป้าหมายชีวิตหลัก (Wheel of Life): "${userGoal || 'ไม่ได้ระบุ'}"
- ⚡ สไตล์บุคลิกภาพ (DISC): ${JSON.stringify(disc || 'ไม่ได้ระบุ')}
- 💰 สไตล์การเงิน (Money Avatar): ${JSON.stringify(money || 'ไม่ได้ระบุ')}
- 🧠 จิตวิญญาณแห่งการเรียนรู้ (Library Soul): ${JSON.stringify(librarySoul || 'ไม่ได้ระบุ')}
- 👻 ความกลัวลึกๆ (Ghost in You): ${JSON.stringify(ghostResult || 'ไม่ได้ระบุ')}
- ⏳ เวลาชีวิตและทัศนคติ Memento Mori: วันเกิด ${birthdate || 'ไม่ได้ระบุ'}, อายุขัยคาดการณ์ ${expectedAge || 'ไม่ได้ระบุ'} ปี, บันทึกเวลาชีวิต ${JSON.stringify(mementoReflections || 'ไม่มี')}

คำแนะนำในการประมวลผล:
- นำความกลัวลึกๆ (Ghost in You) และสติจาก Memento Mori มาช่วยปรับทิศทางเควสต์เพื่อสลัดความลังเล ปลดล็อกขอบเขตชีวิต และสร้างกำลังใจ
- ดึงจุดแข็งและสไตล์การทำงานตาม DISC และ Money Avatar มาออกแบบเควสต์ให้สอดคล้องกับพฤติกรรมจริงของผู้เรียน

กฎการออกแบบภารกิจ 7 วัน (7 Days x 3 Quests):
1. แต่ละวันจะมี 3 เควสต์ย่อย (Quests 2, 3, 4) เพื่อหนุนเป้าหมายหลักใน Quest 1:
   - Quest 2 (นิสัยประจำวิชา): Micro-Habit 2-5 นาทีที่แก้จุดอ่อนและดึงจุดแข็งตามตัวตนของผู้เรียน
   - Quest 3 (ภารกิจท้าทาย): Action Challenge 10-15 นาทีที่ผลักดันเป้าหมายในชีวิตจริง
   - Quest 4 (ทบทวนปัญญา): Soul Reflection Prompt 5 นาทีให้ตกตะกอนจิตใจและคุณค่าชีวิต
2. 🚨 กฎเหล็กภาษาในชื่อเควสต์:
   - ห้ามใช้ Emoji ใดๆ ทั้งสิ้นในชื่อเควสต์!
   - ห้ามระบุชื่อเครื่องมือในแอปบังคับผู้เรียน (ห้ามเขียนว่า "เข้า Focus Room", "คุยกับ AI Mentor") ให้ใช้ภาษาการลงมือทำในชีวิตจริงเพียวๆ เท่านั้น!
   - เขียนเป็นภาษาไทย สั้น กระชับ มีพลัง เข้าใจง่าย จบได้ในวันนั้นแน่นอน!
3. คืนค่าเป็น JSON Array ความยาว 7 วัน รูปแบบดังนี้เท่านั้น (ไม่มีข้อความอื่นนอกเหนือจาก JSON):
[
  {
    "day": 1,
    "dayTitle": "Day 1: ...",
    "quests": [
      { "id": "q1", "title": "ข้อความเควสต์นิสัย 1...", "type": "PERSONALIZED_HABIT", "tag": "วิชานิสัย D1", "xp": 15 },
      { "id": "q2", "title": "ข้อความเควสต์ท้าทาย 2...", "type": "REFLECTION_CHALLENGE", "tag": "วิชาท้าทาย D1", "xp": 10 },
      { "id": "q3", "title": "ข้อความเควสต์ตกตะกอน 3...", "type": "REFLECTION_CHALLENGE", "tag": "วิชาทบทวน D1", "xp": 10 }
    ]
  },
  ... ครบ 7 วัน
]`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `ช่วยออกแบบแผน 7 วันสำหรับวิชา ${trackId} ให้ฉันหน่อย` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API Error:", response.status, errText);
      return NextResponse.json({ error: "ไม่สามารถสร้างเควสต์จาก AI ได้ในขณะนี้" }, { status: 502 });
    }

    const aiRes = await response.json();
    const contentText = aiRes.choices?.[0]?.message?.content || "";
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(contentText);
    } catch {
      const jsonMatch = contentText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      }
    }

    return NextResponse.json({
      success: true,
      trackId,
      days: parsedJson?.days || parsedJson || []
    });

  } catch (error) {
    console.error("Generate Skill Quests Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการประมวลผล" }, { status: 500 });
  }
}
